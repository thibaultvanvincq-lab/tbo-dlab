import { useEffect, useState } from 'react'
import { X, ExternalLink, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Category, Entity, Note, Status } from '../types'
import NoteList from './NoteList'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'functional_health', label: 'Functional Health' },
  { value: 'beauty',            label: 'Beauty' },
  { value: 'tea_coffee',        label: 'Tea & Coffee' },
]

interface Props {
  entity: Entity | null
  onClose: () => void
  onStatusChange: (id: string, status: Status) => void
  onDelete: (id: string) => void
}

const STATUS_OPTIONS: { value: Status; label: string; dot: string }[] = [
  { value: 'tracking',            label: 'Tracking',            dot: 'bg-orange-400' },
  { value: 'active_conversation', label: 'Active',              dot: 'bg-emerald-400' },
  { value: 'passed',              label: 'Passed',              dot: 'bg-red-400' },
]

const fieldCls = 'flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400'

function EditRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 items-center">{children}</div>
}

function ActionBtn({ onClick, children, variant = 'save' }: { onClick: () => void; children: React.ReactNode; variant?: 'save' | 'cancel' }) {
  return (
    <button onClick={onClick} className={`text-xs font-medium ${variant === 'save' ? 'text-emerald-600 hover:text-emerald-700' : 'text-stone-400 hover:text-stone-600'}`}>
      {children}
    </button>
  )
}

function UploadZone({ onFile, uploading, label }: { onFile: (f: File) => void; uploading: boolean; label: string }) {
  return (
    <label
      className={`flex items-center justify-center w-full py-2 rounded-lg border border-dashed border-stone-200 text-xs text-stone-400 cursor-pointer hover:border-stone-400 hover:text-stone-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      onPaste={(e) => { const f = e.clipboardData?.files?.[0]; if (f) onFile(f) }}
      tabIndex={0}
      onKeyDown={() => {}}
    >
      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      {uploading ? 'Uploading…' : label}
    </label>
  )
}

export default function SidePanel({ entity, onClose, onStatusChange, onDelete }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [entityCategories, setEntityCategories] = useState<Category[]>([])

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  const [editingLogo, setEditingLogo] = useState(false)
  const [logoInput, setLogoInput] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [editingCover, setEditingCover] = useState(false)
  const [coverInput, setCoverInput] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)

  useEffect(() => {
    if (!entity) return
    setNotes([])
    setEditingName(false)
    setEditingLogo(false)
    setEditingCover(false)
    setEntityCategories(entity.categories ?? (entity.category ? [entity.category] : []))
    supabase.from('notes').select('*').eq('entity_id', entity.id).order('created_at', { ascending: true })
      .then(({ data }) => setNotes((data as Note[]) ?? []))
  }, [entity?.id])

  async function saveName() {
    if (!entity || !nameInput.trim()) return
    await supabase.from('entities').update({ name: nameInput.trim() }).eq('id', entity.id)
    entity.name = nameInput.trim()
    setEditingName(false)
  }

  async function uploadLogo(file: File) {
    if (!entity) return
    setUploadingLogo(true)
    const ext = file.name.split('.').pop()
    const { error } = await supabase.storage.from('logos').upload(`${entity.id}.${ext}`, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(`${entity.id}.${ext}`)
      await supabase.from('entities').update({ logo_url: data.publicUrl }).eq('id', entity.id)
      entity.logo_url = data.publicUrl
    }
    setUploadingLogo(false)
    setEditingLogo(false)
  }

  async function saveLogo() {
    if (!entity) return
    await supabase.from('entities').update({ logo_url: logoInput.trim() || null }).eq('id', entity.id)
    entity.logo_url = logoInput.trim() || null
    setEditingLogo(false)
  }

  async function uploadCover(file: File) {
    if (!entity) return
    setUploadingCover(true)
    const ext = file.name.split('.').pop()
    const path = `cover-${entity.id}.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      await supabase.from('entities').update({ og_image: data.publicUrl }).eq('id', entity.id)
      entity.og_image = data.publicUrl
    }
    setUploadingCover(false)
    setEditingCover(false)
  }

  async function saveCover() {
    if (!entity) return
    await supabase.from('entities').update({ og_image: coverInput.trim() || null }).eq('id', entity.id)
    entity.og_image = coverInput.trim() || null
    setEditingCover(false)
  }

  async function toggleCategory(cat: Category) {
    if (!entity) return
    const next = entityCategories.includes(cat) ? entityCategories.filter((c) => c !== cat) : [...entityCategories, cat]
    if (next.length === 0) return
    await supabase.from('entities').update({ categories: next, category: next[0] }).eq('id', entity.id)
    setEntityCategories(next)
  }

  async function changeStatus(status: Status) {
    if (!entity || updatingStatus) return
    setUpdatingStatus(true)
    await supabase.from('entities').update({ status }).eq('id', entity.id)
    onStatusChange(entity.id, status)
    setUpdatingStatus(false)
  }

  async function handleDelete() {
    if (!entity) return
    await supabase.from('entities').delete().eq('id', entity.id)
    onDelete(entity.id)
    onClose()
  }

  const open = !!entity

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed right-0 top-0 bottom-0 z-50 w-[380px] bg-white border-l border-stone-200 flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {entity && (
          <>
            {/* Header image */}
            <div className="relative h-40 overflow-hidden flex-shrink-0 bg-stone-100">
              {entity.og_image ? (
                <img src={entity.og_image} alt={entity.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
              <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/80 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
              {!editingCover && (
                <button onClick={() => { setCoverInput(entity.og_image || ''); setEditingCover(true) }} className="absolute bottom-2 left-3 text-[10px] font-medium text-stone-500 bg-white/80 border border-stone-200 rounded-md px-1.5 py-0.5 hover:text-stone-800 transition-colors">
                  {entity.og_image ? 'Change photo' : '+ Add photo'}
                </button>
              )}
            </div>

            {/* Cover editor */}
            {editingCover && (
              <div className="flex-shrink-0 px-4 py-2.5 border-b border-stone-100 bg-stone-50 flex flex-col gap-1.5">
                <UploadZone onFile={uploadCover} uploading={uploadingCover} label="⬆ Upload or paste (Ctrl+V)" />
                <EditRow>
                  <input value={coverInput} onChange={(e) => setCoverInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveCover(); if (e.key === 'Escape') setEditingCover(false) }} placeholder="Or paste URL…" className={fieldCls} />
                  <ActionBtn onClick={saveCover}>Save</ActionBtn>
                  <ActionBtn onClick={() => setEditingCover(false)} variant="cancel">Cancel</ActionBtn>
                </EditRow>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

              {/* Name + website */}
              <div className="flex flex-col gap-0.5">
                {editingName ? (
                  <EditRow>
                    <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }} className={`${fieldCls} text-sm font-semibold`} />
                    <ActionBtn onClick={saveName}>Save</ActionBtn>
                    <ActionBtn onClick={() => setEditingName(false)} variant="cancel">Cancel</ActionBtn>
                  </EditRow>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-stone-900 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => { setNameInput(entity.name); setEditingName(true) }}>
                      {entity.name}
                    </h2>
                    {entity.website && (
                      <a href={entity.website} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-stone-300 hover:text-stone-600 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
                {entity.website && <p className="text-xs text-stone-400">{entity.website.replace(/^https?:\/\//, '')}</p>}
                {entity.description && <p className="text-xs text-stone-500 mt-1 leading-relaxed">{entity.description}</p>}
              </div>

              {/* Logo */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-300">Logo</p>
                {editingLogo ? (
                  <div className="flex flex-col gap-1.5">
                    <UploadZone onFile={uploadLogo} uploading={uploadingLogo} label="⬆ Upload or paste (Ctrl+V)" />
                    <EditRow>
                      <input value={logoInput} onChange={(e) => setLogoInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveLogo(); if (e.key === 'Escape') setEditingLogo(false) }} placeholder="Or paste URL…" className={fieldCls} />
                      <ActionBtn onClick={saveLogo}>Save</ActionBtn>
                      <ActionBtn onClick={() => setEditingLogo(false)} variant="cancel">Cancel</ActionBtn>
                    </EditRow>
                  </div>
                ) : (
                  <button onClick={() => { setLogoInput(entity.logo_url || ''); setEditingLogo(true) }} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium text-left transition-colors">
                    {entity.logo_url ? 'Change logo' : '+ Set logo'}
                  </button>
                )}
              </div>

              <div className="h-px bg-stone-100" />

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-300">Status</p>
                <div className="flex gap-1.5">
                  {STATUS_OPTIONS.map(({ value, label, dot }) => (
                    <button key={value} onClick={() => changeStatus(value)} disabled={updatingStatus}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${entity.status === value ? 'bg-stone-100 text-stone-800 border-stone-300' : 'text-stone-400 border-stone-200 hover:text-stone-700 hover:bg-stone-50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {entity.type === 'company' && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-300">Categories</p>
                  <div className="flex gap-1.5">
                    {CATEGORIES.map(({ value, label }) => (
                      <button key={value} onClick={() => toggleCategory(value)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${entityCategories.includes(value) ? 'bg-stone-100 text-stone-800 border-stone-300' : 'text-stone-400 border-stone-200 hover:text-stone-700 hover:bg-stone-50'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-stone-100" />

              {/* Notes */}
              <NoteList entityId={entity.id} notes={notes} onNotesChange={setNotes} />

              <div className="h-px bg-stone-100" />

              {/* Delete */}
              <div>
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove from dealflow
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-500">Are you sure?</span>
                    <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-400 font-medium">Yes, delete</button>
                    <button onClick={() => setConfirmDelete(false)} className="text-xs text-stone-400 hover:text-stone-600">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
