import type { Status } from '../types'

type Filter = Status | 'all'

interface Props {
  active: Filter
  counts: Record<Filter, number>
  onChange: (f: Filter) => void
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tracking', label: 'Tracking' },
  { value: 'active_conversation', label: 'Active Conversation' },
  { value: 'passed', label: 'Passed' },
]

export default function FilterBar({ active, counts, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            active === value
              ? 'bg-white text-stone-900 border-stone-200 shadow-sm'
              : 'text-stone-400 border-transparent hover:text-stone-700 hover:bg-white/70'
          }`}
        >
          {label}
          <span
            className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${
              active === value ? 'bg-stone-100 text-stone-500' : 'bg-stone-200/60 text-stone-400'
            }`}
          >
            {counts[value]}
          </span>
        </button>
      ))}
    </div>
  )
}
