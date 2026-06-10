import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { requireAdmin } from '@/lib/admin-auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB — client compresses first, so this is a generous cap
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

const DATA_DIR =
  process.env.DATA_DIR ??
  (process.env.VERCEL ? '/tmp/flora-data' : path.join(process.cwd(), 'data'))

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth) return auth

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = EXT[file.type] ?? 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`

  if (process.env.VERCEL) {
    // Vercel serverless: save to /tmp and serve via /api/images/[filename].
    // Note: /tmp is per-instance and resets on cold starts — consistent with
    // the rest of this app's file-based data layer on Vercel.
    const imgDir = path.join(DATA_DIR, 'images')
    mkdirSync(imgDir, { recursive: true })
    writeFileSync(path.join(imgDir, filename), buffer)
    return NextResponse.json({ url: `/api/images/${filename}` })
  } else {
    // Local dev: write to public/images/products/ so Next.js serves it as a static file
    const dir = path.join(process.cwd(), 'public', 'images', 'products')
    mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, filename), buffer)
    return NextResponse.json({ url: `/images/products/${filename}` })
  }
}
