import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Category, Entity, EntityType, Status } from '../types'
import EntityCard from './EntityCard'
import FilterBar from './FilterBar'
import SidePanel from './SidePanel'
import AddModal from './AddModal'

type Filter = Status | 'all'

interface Props {
  entityType: EntityType
  category: Category | null
  title: string
  subtitle: string
}

export default function EntityGrid({ entityType, category, title, subtitle }: Props) {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Entity | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setEntities([])
    let q = supabase
      .from('entities')
      .select('*')
      .eq('type', entityType)
      .order('created_at', { ascending: false })

    if (category) q = q.contains('categories', [category])

    q.then(({ data }) => {
      setEntities((data as Entity[]) ?? [])
      setLoading(false)
    })
  }, [entityType, category])

  const counts: Record<Filter, number> = {
    all: entities.length,
    tracking: entities.filter((e) => e.status === 'tracking').length,
    active_conversation: entities.filter((e) => e.status === 'active_conversation').length,
    passed: entities.filter((e) => e.status === 'passed').length,
  }

  const visible = filter === 'all' ? entities : entities.filter((e) => e.status === filter)

  function handleStatusChange(id: string, status: Status) {
    setEntities((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev))
  }

  function handleDelete(id: string) {
    setEntities((prev) => prev.filter((e) => e.id !== id))
  }

  const addLabel = entityType === 'partner' ? 'Add Partner' : 'Add Company'

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
          <p className="text-stone-400 text-sm mt-1">{subtitle}</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          title={addLabel}
          className="w-9 h-9 rounded-full border border-white/20 hover:border-white/40 bg-white/8 hover:bg-white/12 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
      </div>

      <FilterBar active={filter} counts={counts} onChange={setFilter} />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/3 animate-pulse" style={{ height: 230, animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-stone-300 text-lg font-medium">Nothing here yet</p>
          <p className="text-stone-300 text-sm mt-1">
            {filter !== 'all' ? 'Try a different filter' : `Add your first entry to get started`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {visible.map((entity) => (
            <EntityCard key={entity.id} entity={entity} onClick={() => setSelected(entity)} />
          ))}
        </div>
      )}

      <SidePanel
        entity={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      <AddModal
        open={addOpen}
        entityType={entityType}
        category={category}
        onClose={() => setAddOpen(false)}
        onAdded={(e) => setEntities((prev) => [e, ...prev])}
      />
    </div>
  )
}
