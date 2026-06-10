'use client'

import { useRef, useState, useCallback } from 'react'

type Props = {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

// Compresses an image to max 1 200 × 1 200 px at 83 % JPEG quality using the Canvas API.
// Typical output: a 4 MB phone photo → ~200–350 KB, which is good for product display.
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX = 1200
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > MAX || h > MAX) {
        if (w >= h) { h = Math.round((h * MAX) / w); w = MAX }
        else { w = Math.round((w * MAX) / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        0.83
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read image'))
    }
    img.src = objectUrl
  })
}

export function ImageUploader({ images, onChange, maxImages = 10 }: Props) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
      if (!files.length) return

      const slots = maxImages - images.length
      if (slots <= 0) {
        setUploadError(`Maximum ${maxImages} images reached. Remove one to add more.`)
        return
      }

      const batch = files.slice(0, slots)
      setUploading(true)
      setUploadError('')

      try {
        const urls: string[] = []
        for (const file of batch) {
          const compressed = await compressImage(file)
          const formData = new FormData()
          formData.append('file', compressed, `photo.jpg`)

          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) {
            const json = await res.json().catch(() => ({}))
            throw new Error((json as { error?: string }).error ?? 'Upload failed')
          }

          const { url } = (await res.json()) as { url: string }
          urls.push(url)
        }
        onChange([...images, ...urls])
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [images, onChange, maxImages]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      processFiles(e.dataTransfer.files)
    },
    [processFiles]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files)
      e.target.value = '' // allow re-selecting the same file
    },
    [processFiles]
  )

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  const canAdd = images.length < maxImages

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
          className={[
            'relative border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer select-none transition-all duration-200',
            dragging
              ? 'border-charcoal bg-parchment scale-[1.01]'
              : 'border-sand hover:border-stone hover:bg-parchment/40',
            uploading ? 'pointer-events-none opacity-60' : '',
          ].join(' ')}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={handleFileInput}
          />

          {/* Upload icon */}
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-sand flex items-center justify-center">
            {uploading ? (
              <svg className="animate-spin text-stone" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg className="text-stone" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            )}
          </div>

          {uploading ? (
            <p className="text-base text-stone font-medium">Uploading, please wait…</p>
          ) : (
            <>
              <p className="text-base text-charcoal font-medium mb-1">
                Drop your photos here
              </p>
              <p className="text-sm text-stone mb-4">
                or <span className="underline underline-offset-2 cursor-pointer">click to choose files from your computer</span>
              </p>
              <div className="inline-flex flex-col items-center gap-1 text-[11px] text-stone/70 tracking-wide uppercase bg-sand/60 rounded-lg px-4 py-2">
                <span>JPEG · PNG · WebP &nbsp;·&nbsp; Max 5 MB per photo</span>
                <span>Best size: 800 × 800 px or larger &nbsp;·&nbsp; Up to {maxImages} photos</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{uploadError}</p>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <p className="text-[9px] tracking-widest uppercase text-stone mb-3">
            {images.length} {images.length === 1 ? 'photo' : 'photos'} — first one is the main display photo
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((url, idx) => (
              <div key={`${url}-${idx}`} className="group relative rounded-lg overflow-hidden bg-sand" style={{ aspectRatio: '1 / 1' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Product photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary badge */}
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] tracking-widest uppercase bg-black/55 text-white py-1">
                    Main photo
                  </span>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  aria-label={`Remove photo ${idx + 1}`}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-base leading-none hover:bg-red-600"
                >
                  ×
                </button>

                {/* Photo number */}
                <span className="absolute top-1.5 left-1.5 text-[9px] tracking-widest bg-black/40 text-white rounded px-1.5 py-0.5">
                  {idx + 1}
                </span>
              </div>
            ))}

            {/* Add more slot (when there's room) */}
            {canAdd && images.length > 0 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg border-2 border-dashed border-sand hover:border-stone transition-colors flex flex-col items-center justify-center gap-1 text-stone hover:text-charcoal"
                style={{ aspectRatio: '1 / 1' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span className="text-[9px] tracking-widest uppercase">Add</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!canAdd && (
        <p className="text-[11px] text-stone/60">
          Maximum {maxImages} photos reached. Hover a photo and click × to remove it.
        </p>
      )}
    </div>
  )
}
