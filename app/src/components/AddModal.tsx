import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Category, Entity, EntityType, Status } from '../types'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'functional_health', label: 'Functional Health' },
  { value: 'beauty',            label: 'Beauty' },
  { value: 'tea_coffee',        label: 'Tea & Coffee' },
]

interface Props {
  open: boolean
  entityType: EntityType
  category: Category | null
  onClose: () => void
  onAdded: (entity: Entity) => void
}

export default function AddModal({ open, entityType, category, onClose, onAdded }: Props) {
  const [form, setForm] = useState({ name: '', website: '', og_image: '', description: '', status: 'tracking' as Status })
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(category ? [category] : [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (entityType === 'company' && selectedCategories.length === 0) { setError('Select at least one category.'); return }
    setSaving(true)
    const { data, error: dbErr } = await supabase
      .from('entities')
      .insert({
        type: entityType,
        category: selectedCategories[0] ?? null,
        categories: selectedCategories,
        name: form.name.trim(),
        website: form.website.trim() || null,
        og_image: form.og_image.trim() || null,
        description: form.description.trim() || null,
        status: form.status,
      })
      .select()
      .single()

    if (dbErr) { setError(dbErr.message); setSaving(false); return }
    onAdded(data as Entity)
    setForm({ name: '', website: '', og_image: '', description: '', status: 'tracking' })
    setSelectedCategories(category ? [category] : [])
    setSaving(false)
    onClose()
  }

  if (!open) return null

  const title = entityType === 'partner' ? 'Add Partner' : 'Add Company'

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/15 border border-stone-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-sm text-stone-800">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3.5">
          <LightField label="Name *" value={form.name} onChange={(v) => update('name', v)} placeholder="e.g. Levels Health" />
          <LightField label="Website" value={form.website} onChange={(v) => update('website', v)} placeholder="https://…" />
          <LightField label="Cover image URL" value={form.og_image} onChange={(v) => update('og_image', v)} placeholder="https://…/og-image.png" />
          <LightField label="Description" value={form.description} onChange={(v) => update('description', v)} placeholder="What do they do?" textarea />

          {entityType === 'company' && (
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Categories</label>
              <div className="flex gap-2">
                {CATEGORIES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleCategory(value)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      selectedCategories.includes(value)
                        ? 'bg-stone-100 text-stone-800 border-stone-300'
                        : 'text-stone-400 border-stone-200 hover:border-stone-300 hover:text-stone-600 bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Status</label>
            <div className="flex gap-2">
              {(['tracking', 'active_conversation', 'passed'] as Status[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update('status', s)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                    form.status === s
                      ? 'bg-stone-100 text-stone-800 border-stone-300'
                      : 'text-stone-400 border-stone-200 hover:border-stone-300 hover:text-stone-600 bg-white'
                  }`}
                >
                  {s === 'active_conversation' ? 'Active' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors disabled:opacity-50 mt-0.5"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Adding…' : title}
          </button>
        </form>
      </div>
    </div>
  )
}

function LightField({ label, value, onChange, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean
}) {
  const cls = 'w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none'
  return (
    <div>
      <label className="block text-xs font-medium text-stone-400 mb-1.5">{label}</label>
      {textarea
        ? <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </div>
  )
}
