'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'

type Tab = 'announcement' | 'story' | 'store' | 'social' | 'categories'

const TABS: { id: Tab; label: string }[] = [
  { id: 'announcement', label: 'Announcement Bar' },
  { id: 'story', label: 'Brand Story' },
  { id: 'store', label: 'Store Info' },
  { id: 'social', label: 'Social Media' },
  { id: 'categories', label: 'Categories' },
]

export default function ContentPage() {
  const { form, loading, loadError, saving, saved, saveError, set, handleSave } = useSettings()
  const [activeTab, setActiveTab] = useState<Tab>('announcement')
  const [newAudienceTag, setNewAudienceTag] = useState('')
  const [newSeasonTag, setNewSeasonTag] = useState('')

  const inputClass = 'w-full bg-white border border-parchment focus:border-charcoal rounded px-4 py-2.5 text-sm text-charcoal placeholder:text-stone/40 outline-none transition-colors'
  const labelClass = 'block text-[9px] tracking-widest uppercase text-stone mb-1.5'

  function formatTag(tag: string) {
    return tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  function toSlug(raw: string) {
    return raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  const addAudienceTag = () => {
    const slug = toSlug(newAudienceTag)
    if (!slug) return
    const current = (form.audienceTags ?? []) as string[]
    if (!current.includes(slug)) set('audienceTags', [...current, slug])
    setNewAudienceTag('')
  }

  const removeAudienceTag = (tag: string) => {
    set('audienceTags', ((form.audienceTags ?? []) as string[]).filter((t) => t !== tag))
  }

  const addSeasonTag = () => {
    const slug = toSlug(newSeasonTag)
    if (!slug) return
    const current = (form.seasonTags ?? []) as string[]
    if (!current.includes(slug)) set('seasonTags', [...current, slug])
    setNewSeasonTag('')
  }

  const removeSeasonTag = (tag: string) => {
    set('seasonTags', ((form.seasonTags ?? []) as string[]).filter((t) => t !== tag))
  }

  if (loading) return <div className="text-sm text-stone">Loading…</div>
  if (loadError) return <div className="text-sm text-red-500">Failed to load settings. Please refresh.</div>

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Storefront</p>
        <h1 className="font-serif font-light text-3xl text-charcoal">Content</h1>
      </div>

      <div className="flex gap-1 mb-8 border-b border-parchment overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[10px] tracking-widest uppercase transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-charcoal text-charcoal'
                : 'border-transparent text-stone hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">

        {activeTab === 'announcement' && (
          <div className="bg-ivory border border-parchment rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">Announcement Bar</p>
                <p className="text-xs text-stone mt-0.5">Show a sitewide banner above the navigation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!form.announcementEnabled}
                  onChange={(e) => set('announcementEnabled', e.target.checked)}
                />
                <div className="w-10 h-5 bg-parchment rounded-full peer peer-checked:bg-charcoal transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            <div>
              <label className={labelClass}>Message *</label>
              <input
                value={form.announcementText ?? ''}
                onChange={(e) => set('announcementText', e.target.value)}
                placeholder="Free delivery on orders over 200 DT"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Link (optional)</label>
              <input
                value={form.announcementLink ?? ''}
                onChange={(e) => set('announcementLink', e.target.value)}
                placeholder="/shop"
                className={inputClass}
              />
              <p className="text-[10px] text-stone/60 mt-1.5">Leave empty for a non-clickable banner</p>
            </div>

            {form.announcementEnabled && form.announcementText && (
              <div className="bg-charcoal text-ivory text-center py-2 px-4 rounded text-[10px] tracking-widest uppercase">
                Preview: {form.announcementText}
              </div>
            )}
          </div>
        )}

        {activeTab === 'story' && (
          <div className="bg-ivory border border-parchment rounded-lg p-6 space-y-5">
            <p className="text-sm font-medium text-charcoal">Brand Story Section</p>
            <p className="text-xs text-stone">Appears on the homepage below featured products</p>
            <div>
              <label className={labelClass}>Section Title</label>
              <input
                value={form.brandStoryTitle ?? ''}
                onChange={(e) => set('brandStoryTitle', e.target.value)}
                placeholder="Born from a passion for authentic fragrance"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Body Text</label>
              <textarea
                value={form.brandStoryBody ?? ''}
                onChange={(e) => set('brandStoryBody', e.target.value)}
                rows={6}
                placeholder="Separate paragraphs with a blank line…"
                className="w-full bg-white border border-parchment focus:border-charcoal rounded px-4 py-3 text-sm text-charcoal placeholder:text-stone/40 outline-none resize-y transition-colors"
              />
              <p className="text-[10px] text-stone/60 mt-1.5">Separate paragraphs with a blank line</p>
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="bg-ivory border border-parchment rounded-lg p-6 space-y-5">
            <p className="text-sm font-medium text-charcoal">Store Information</p>
            <p className="text-xs text-stone">Appears in the footer and contact page</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Store Name</label>
                <input value={form.storeName ?? ''} onChange={(e) => set('storeName', e.target.value)} placeholder="Flora Cosmetics" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tagline</label>
                <input value={form.storeTagline ?? ''} onChange={(e) => set('storeTagline', e.target.value)} placeholder="Artisan Perfumerie" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Phone</label>
                <input value={form.storePhone ?? ''} onChange={(e) => set('storePhone', e.target.value)} placeholder="+216 XX XXX XXX" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={form.storeEmail ?? ''} onChange={(e) => set('storeEmail', e.target.value)} placeholder="hello@floracosmetics.tn" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Gouvernorat</label>
                <input value={form.storeWilaya ?? ''} onChange={(e) => set('storeWilaya', e.target.value)} placeholder="Tunis" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input value={form.storeAddress ?? ''} onChange={(e) => set('storeAddress', e.target.value)} placeholder="Street, city" className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="bg-ivory border border-parchment rounded-lg p-6 space-y-5">
            <p className="text-sm font-medium text-charcoal">Social Media Links</p>
            <p className="text-xs text-stone">These appear in the store footer. Leave empty to hide.</p>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input value={form.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/floracosmetics" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input value={form.facebook ?? ''} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/floracosmetics" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>TikTok URL</label>
              <input value={form.tiktok ?? ''} onChange={(e) => set('tiktok', e.target.value)} placeholder="https://tiktok.com/@floracosmetics" className={inputClass} />
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Audience */}
            <div className="bg-ivory border border-parchment rounded-lg p-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-charcoal">Audience</p>
                <p className="text-xs text-stone mt-0.5">
                  Shown as prominent tabs at the top of the shop — e.g. Women, Men, Unisex.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {((form.audienceTags ?? []) as string[]).length === 0 ? (
                  <p className="text-xs text-stone/60 italic">No audience tags yet.</p>
                ) : (
                  ((form.audienceTags ?? []) as string[]).map((tag) => (
                    <span key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-parchment rounded text-xs text-charcoal">
                      {formatTag(tag)}
                      <button type="button" onClick={() => removeAudienceTag(tag)}
                        className="text-stone/60 hover:text-red-500 transition-colors leading-none" aria-label={`Remove ${tag}`}>
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  value={newAudienceTag}
                  onChange={(e) => setNewAudienceTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAudienceTag() } }}
                  placeholder="e.g. women, men, unisex"
                  className={inputClass + ' flex-1'}
                />
                <button type="button" onClick={addAudienceTag}
                  className="px-5 py-2.5 bg-charcoal text-ivory text-[10px] tracking-widest uppercase hover:bg-charcoal/80 transition-colors rounded shrink-0">
                  Add
                </button>
              </div>
            </div>

            {/* Seasons */}
            <div className="bg-ivory border border-parchment rounded-lg p-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-charcoal">Seasons</p>
                <p className="text-xs text-stone mt-0.5">
                  Shown as a season filter in the shop sidebar — e.g. Summer, Winter, Spring.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {((form.seasonTags ?? []) as string[]).length === 0 ? (
                  <p className="text-xs text-stone/60 italic">No season tags yet.</p>
                ) : (
                  ((form.seasonTags ?? []) as string[]).map((tag) => (
                    <span key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-parchment rounded text-xs text-charcoal">
                      {formatTag(tag)}
                      <button type="button" onClick={() => removeSeasonTag(tag)}
                        className="text-stone/60 hover:text-red-500 transition-colors leading-none" aria-label={`Remove ${tag}`}>
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  value={newSeasonTag}
                  onChange={(e) => setNewSeasonTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSeasonTag() } }}
                  placeholder="e.g. summer, winter, spring, autumn"
                  className={inputClass + ' flex-1'}
                />
                <button type="button" onClick={addSeasonTag}
                  className="px-5 py-2.5 bg-charcoal text-ivory text-[10px] tracking-widest uppercase hover:bg-charcoal/80 transition-colors rounded shrink-0">
                  Add
                </button>
              </div>
              <p className="text-[10px] text-stone/60">Spaces become hyphens automatically.</p>
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
              Saved — changes are live on the store.
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
