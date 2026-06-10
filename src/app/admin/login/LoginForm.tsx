'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setError((body as { error?: string }).error ?? 'Incorrect password')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-serif font-light text-3xl tracking-[0.2em] uppercase text-charcoal">Flora</p>
          <p className="text-[10px] tracking-widest uppercase text-stone mt-2">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoFocus
              className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none transition-colors"
            />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-ivory py-3 text-[10px] tracking-widest uppercase hover:bg-charcoal/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[10px] text-stone/50 mt-8 tracking-wider">
          ← <a href="/" className="hover:text-stone transition-colors">Back to store</a>
        </p>
      </div>
    </div>
  )
}
