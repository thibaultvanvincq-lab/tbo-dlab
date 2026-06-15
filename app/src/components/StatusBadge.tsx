import type { Status } from '../types'

const config: Record<Status, { label: string; dot: string }> = {
  tracking:            { label: 'Tracking',            dot: 'bg-orange-400' },
  active_conversation: { label: 'Active Conversation', dot: 'bg-emerald-400' },
  passed:              { label: 'Passed',               dot: 'bg-red-400' },
}

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status }: Props) {
  const { label, dot } = config[status]
  return (
    <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <span className="text-white/90 text-xs font-medium leading-none">{label}</span>
    </span>
  )
}
