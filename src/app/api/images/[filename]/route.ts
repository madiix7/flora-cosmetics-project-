import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

// Only used on Vercel where uploaded images live in /tmp/flora-data/images/
const DATA_DIR =
  process.env.DATA_DIR ??
  (process.env.VERCEL ? '/tmp/flora-data' : path.join(process.cwd(), 'data'))

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // Allow only UUID-named image files — prevents path traversal and directory listing
  if (!/^[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    return new NextResponse(null, { status: 404 })
  }

  const ext = filename.split('.').pop()!.toLowerCase()
  const contentType = CONTENT_TYPES[ext]
  if (!contentType) return new NextResponse(null, { status: 404 })

  try {
    const buffer = readFileSync(path.join(DATA_DIR, 'images', filename))
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
