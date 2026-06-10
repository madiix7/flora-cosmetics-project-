'use client'

import { createContext, useContext, useEffect, useReducer, useState, ReactNode } from 'react'
import type { CartItem, Product } from '@/types'
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '@/lib/utils'

type CartState = {
  items: CartItem[]
  isDrawerOpen: boolean
  isLoaded: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; size: string; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: string; size: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; size: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'LOAD_FROM_STORAGE'; items: CartItem[] }
  | { type: 'SET_LOADED' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_FROM_STORAGE':
      return { ...state, items: action.items, isLoaded: true }
    case 'SET_LOADED':
      return { ...state, isLoaded: true }
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
  isLoaded: boolean
  totalItems: number
  freeDeliveryThreshold: number
  deliveryFee: number
  addItem: (product: Product, size: string, quantity?: number) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

type CartProviderProps = {
  children: ReactNode
  initialFreeDeliveryThreshold?: number
  initialDeliveryFee?: number
}

type AnyObj = Record<string, unknown>

function isValidCartItems(data: unknown): data is CartItem[] {
  if (!Array.isArray(data)) return false
  return data.every((i) => {
    if (i === null || typeof i !== 'object') return false
    const item = i as AnyObj
    const product = item.product as AnyObj | null | undefined
    if (!product || typeof product !== 'object') return false
    return (
      typeof product.id === 'string' && product.id.length > 0 &&
      typeof product.name === 'string' &&
      typeof product.price === 'number' && product.price >= 0 && Number.isFinite(product.price) &&
      Array.isArray(product.images) &&
      typeof item.size === 'string' &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      (item.quantity as number) >= 1
    )
  })
}

export function CartProvider({
  children,
  initialFreeDeliveryThreshold = FREE_DELIVERY_THRESHOLD,
  initialDeliveryFee = DELIVERY_FEE,
}: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isDrawerOpen: false, isLoaded: false })
  // Delivery settings come from the server via props — no client fetch needed
  const [freeDeliveryThreshold] = useState(initialFreeDeliveryThreshold)
  const [deliveryFee] = useState(initialDeliveryFee)

  useEffect(() => {
    const stored = localStorage.getItem('flora_cart')
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored)
        if (isValidCartItems(parsed)) {
          dispatch({ type: 'LOAD_FROM_STORAGE', items: parsed })
        } else {
          localStorage.removeItem('flora_cart')
        }
      } catch {
        localStorage.removeItem('flora_cart')
      }
    }
    dispatch({ type: 'SET_LOADED' })
  }, [])

  useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem('flora_cart', JSON.stringify(state.items))
    }
  }, [state.items, state.isLoaded])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isDrawerOpen: state.isDrawerOpen,
        isLoaded: state.isLoaded,
        totalItems,
        freeDeliveryThreshold,
        deliveryFee,
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
