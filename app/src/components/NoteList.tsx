import { useState } from 'react'
import { Send, Trash2, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Note } from '../types'

interface Props {
  entityId: string
  notes: Note[]
  onNotesChange: (notes: Note[]) => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function NoteList({ entityId, notes, onNotesChange }: Props) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  async function addNote() {
    if (!text.trim()) return
    setSaving(true)
    setSaveError('')
    const { data, error } = await supabase
      .from('notes')
      .insert({ entity_id: entityId, content: text.trim() })
      .select()
      .single()
    if (error) setSaveError(error.message)
    else if (data) { onNotesChange([...notes, data as Note]); setText('') }
    setSaving(false)
  }

  async function deleteNote(id: string) {
    setDeletingId(id)
    await supabase.from('notes').delete().eq('id', id)
    onNotesChange(notes.filter((n) => n.id !== id))
    setDeletingId(null)
  }

  function startEdit(note: Note) {
    setEditingId(note.id)
    setEditText(note.content)
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return
    await supabase.from('notes').update({ content: editText.trim() }).eq('id', id)
    onNotesChange(notes.map((n) => n.id === id ? { ...n, content: editText.trim() } : n))
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Notes</h4>

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {notes.length === 0 && (
          <p className="text-sm text-stone-400 italic">No notes yet.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="group relative bg-stone-50 border border-stone-200 rounded-xl p-3.5">
            {editingId === note.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit(note.id) }}
                  rows={3}
                  autoFocus
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 resize-none focus:outline-none focus:border-stone-400"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="p-1 text-stone-400 hover:text-stone-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => saveEdit(note.id)} className="p-1 text-emerald-600 hover:text-emerald-700">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p
                  className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed cursor-text"
                  onClick={() => startEdit(note)}
                >
                  {note.content}
                </p>
                <p className="text-xs text-stone-400 mt-2">{formatDate(note.created_at)}</p>
                <button
                  onClick={() => deleteNote(note.id)}
                  disabled={deletingId === note.id}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-red-400 p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {saveError && <p className="text-xs text-red-500">{saveError}</p>}

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote() }}
          placeholder="Add a note… (⌘↵ to save)"
          rows={3}
          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 resize-none focus:outline-none focus:border-stone-400 pr-12"
        />
        <button
          onClick={addNote}
          disabled={saving || !text.trim()}
          className="absolute bottom-3 right-3 text-stone-300 hover:text-emerald-600 transition-colors disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
