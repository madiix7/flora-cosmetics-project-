import { appendFileSync, mkdirSync } from 'fs'
import path from 'path'

const LOG_PATH = path.join(process.cwd(), 'data', 'audit.log')

export function auditLog(action: string, detail: Record<string, unknown>): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), action, ...detail }) + '\n'
  try {
    mkdirSync(path.dirname(LOG_PATH), { recursive: true })
    appendFileSync(LOG_PATH, line, 'utf-8')
  } catch {
    // Non-fatal — audit failure must never break the request
  }
}
