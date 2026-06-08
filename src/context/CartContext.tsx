'use client'

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import type { CartItem, Product } from '@/types'

type CartState = {
  items: CartItem[]
  isDrawerOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; size: string; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: string; size: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; size: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'LOAD_FROM_STORAGE'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_FROM_STORAGE':
      return { ...state, items: action.items }
    case 'ADD_ITEM': {
      const qty = action.quantity ?? 1
      const existing = state.items.find(
        (i) => i.product.id === action.product.id && i.size === action.size
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id && i.size === action.size
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, size: action.size, quantity: qty }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.product.id === action.productId && i.size === action.size)
        ),
      }
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => !(i.product.id === action.productId && i.size === action.size)
          ),
        }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId && i.size === action.size
            ? { ...i, quantity: action.quantity }
            : i
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true }
    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false }
    default:
      return state
  }
}

type CartContextValue = {
  items: CartItem[]
  isDrawerOpen: boolean
  totalItems: number
  addItem: (product: Product, size: string, quantity?: number) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isDrawerOpen: false })

  useEffect(() => {
    const stored = localStorage.getItem('flora_cart')
    if (stored) {
      try {
        dispatch({ type: 'LOAD_FROM_STORAGE', items: JSON.parse(stored) })
      } catch {
        localStorage.removeItem('flora_cart')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('flora_cart', JSON.stringify(state.items))
  }, [state.items])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isDrawerOpen: state.isDrawerOpen,
        totalItems,
        addItem: (product, size, quantity = 1) => {
          dispatch({ type: 'ADD_ITEM', product, size, quantity })
          dispatch({ type: 'OPEN_DRAWER' })
        },
        removeItem: (productId, size) => dispatch({ type: 'REMOVE_ITEM', productId, size }),
        updateQuantity: (productId, size, quantity) =>
          dispatch({ type: 'UPDATE_QUANTITY', productId, size, quantity }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
        openDrawer: () => dispatch({ type: 'OPEN_DRAWER' }),
        closeDrawer: () => dispatch({ type: 'CLOSE_DRAWER' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
