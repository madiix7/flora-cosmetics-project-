'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'

type Tab = 'shipping' | 'integrations'

const TABS: { id: Tab; label: string }[] = [
  { id: 'shipping', label: 'Shipping & Delivery' },
  { id: 'integrations', label: 'Integrations' },
]

export default function SettingsPage() {
  const { form, loading, loadError, saving, saved, saveError, set, handleSave } = useSettings()
  const [tab, setTab] = useState<Tab>('shipping')

  const inputClass = 'w-full bg-white border border-parchment focus:border-charcoal rounded px-4 py-2.5 text-sm text-charcoal placeholder:text-stone/40 outline-none transition-colors'
  const labelClass = 'block text-[9px] tracking-widest uppercase text-stone mb-1.5'

  if (loading) return <div className="text-sm text-stone">Loading…</div>
  if (loadError) return <div className="text-sm text-red-500">Failed to load settings. Please refresh.</div>

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Configuration</p>
        <h1 className="font-serif font-light text-3xl text-charcoal">Settings</h1>
      </div>

      <div className="flex gap-1 mb-8 border-b border-parchment">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-[10px] tracking-widest uppercase transition-colors border-b-2 -mb-px ${
              tab === t.id ? 'border-charcoal text-charcoal' : 'border-transparent text-stone hover:text-charcoal'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">

        {tab === 'shipping' && (
          <div className="bg-ivory border border-parchment rounded-lg p-6 space-y-6">
            <div>
              <p className="text-sm font-medium text-charcoal mb-1">Delivery Rules</p>
              <p className="text-xs text-stone">These values apply to all orders placed on the store</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Free Delivery Threshold (DT)</label>
                <input
                  type="number"
                  min={0}
                  value={form.freeDeliveryThreshold ?? 200}
                  onChange={(e) => set('freeDeliveryThreshold', Number(e.target.value))}
                  className={inputClass}
                />
                <p className="text-[10px] text-stone/60 mt-1.5">Orders equal to or above this amount get free delivery</p>
              </div>
              <div>
                <label className={labelClass}>Delivery Fee (DT)</label>
                <input
                  type="number"
                  min={0}
                  value={form.deliveryFee ?? 8}
                  onChange={(e) => set('deliveryFee', Number(e.target.value))}
                  className={inputClass}
                />
                <p className="text-[10px] text-stone/60 mt-1.5">Charged when order is below the free delivery threshold</p>
              </div>
            </div>

            <div className="bg-parchment rounded p-4 text-xs text-stone leading-relaxed">
              <p className="font-medium text-charcoal mb-1">Preview</p>
              Orders under <strong>{(form.freeDeliveryThreshold ?? 200).toLocaleString('fr-TN')} DT</strong> →{' '}
              <strong>{(form.deliveryFee ?? 8).toLocaleString('fr-TN')} DT</strong> delivery fee
              <br />
              Orders {(form.freeDeliveryThreshold ?? 200).toLocaleString('fr-TN')} DT and above → <strong>Free delivery</strong>
            </div>
          </div>
        )}

        {tab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-ivory border border-parchment rounded-lg overflow-hidden">
              <div className="flex items-start gap-4 p-6 border-b border-parchment">
                <div className="w-10 h-10 rounded-lg bg-[#F9AB00]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#F9AB00] text-lg font-bold">G</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-charcoal">Google Analytics 4</p>
                    {form.googleAnalyticsId ? (
                      <span className="text-[9px] tracking-widest uppercase px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">Connected</span>
                    ) : (
                      <span className="text-[9px] tracking-widest uppercase px-2 py-1 bg-parchment text-stone rounded-full">Not configured</span>
                    )}
                  </div>
                  <p className="text-xs text-stone mt-1">Track store visitors, page views, and purchase events</p>
                </div>
              </div>
              <div className="p-6">
                <label className={labelClass}>Measurement ID</label>
                <input
                  value={form.googleAnalyticsId ?? ''}
                  onChange={(e) => set('googleAnalyticsId', e.target.value.trim())}
                  placeholder="G-XXXXXXXXXX"
                  className={`${inputClass} font-mono`}
                />
                <p className="text-[10px] text-stone/60 mt-2">Find this in GA4 → Admin → Data Streams → Measurement ID</p>
              </div>
            </div>

            <div className="bg-ivory border border-parchment rounded-lg overflow-hidden">
              <div className="flex items-start gap-4 p-6 border-b border-parchment">
                <div className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#1877F2] text-lg font-bold">f</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-charcoal">Meta Pixel</p>
                    {form.metaPixelId ? (
                      <span className="text-[9px] tracking-widest uppercase px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">Connected</span>
                    ) : (
                      <span className="text-[9px] tracking-widest uppercase px-2 py-1 bg-parchment text-stone rounded-full">Not configured</span>
                    )}
                  </div>
                  <p className="text-xs text-stone mt-1">Track Facebook/Instagram ad performance and retargeting</p>
                </div>
              </div>
              <div className="p-6">
                <label className={labelClass}>Pixel ID</label>
                <input
                  value={form.metaPixelId ?? ''}
                  onChange={(e) => set('metaPixelId', e.target.value.trim())}
                  placeholder="1234567890123456"
                  className={`${inputClass} font-mono`}
                />
                <p className="text-[10px] text-stone/60 mt-2">Find this in Meta Business Suite → Events Manager → Pixel ID</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-charcoal text-ivory px-8 py-3 text-[10px] tracking-widest uppercase hover:bg-charcoal/80 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && (
            <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded">
              Saved successfully.
            </span>
          )}
          {saveError && (
            <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded">
              Failed to save. Please try again.
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
