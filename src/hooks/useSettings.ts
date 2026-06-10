'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Settings } from '@/types'

type UseSettingsResult = {
  form: Partial<Settings>
  loading: boolean
  loadError: boolean
  saving: boolean
  saved: boolean
  saveError: boolean
  set: (key: keyof Settings, value: unknown) => void
  handleSave: (e: React.FormEvent) => Promise<void>
}

export function useSettings(): UseSettingsResult {
  const router = useRouter()
  const [form, setForm] = useState<Partial<Settings>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (savedTimer.current) clearTimeout(savedTimer.current) }
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json() as Promise<Settings>
      })
      .then((data) => { if (data) { setForm(data); setLoading(false) } })
      .catch(() => { setLoadError(true); setLoading(false) })
  }, [router])

  const set = (key: keyof Settings, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setSaveError(false)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null)
    setSaving(false)
    if (!res?.ok) { setSaveError(true); return }
    setSaved(true)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaved(false), 3000)
  }

  return { form, loading, loadError, saving, saved, saveError, set, handleSave }
}
