import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import type { Order, Product } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')

function readJSON<T>(filename: string): T {
  return JSON.parse(readFileSync(path.join(DATA_DIR, filename), 'utf-8')) as T
}

function writeJSON<T>(filename: string, data: T): void {
  writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8')
}

export function getOrders(): Order[] {
  try { return readJSON<Order[]>('orders.json') } catch { return [] }
}

export function saveOrders(orders: Order[]): void {
  writeJSON('orders.json', orders)
}

export function getProducts(): Product[] {
  try { return readJSON<Product[]>('products.json') } catch { return [] }
}

export function saveProducts(products: Product[]): void {
  writeJSON('products.json', products)
}
