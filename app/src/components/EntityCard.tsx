import { useState } from 'react'
import type { Entity } from '../types'
import StatusBadge from './StatusBadge'

interface Props {
  entity: Entity
  onClick: () => void
}

function getDomain(url: string | null) {
  if (!url) return null
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

const LOGO_SERVICES = (domain: string) => [
  `https://logo.clearbit.com/${domain}`,
  `https://cdn.brandfetch.io/${domain}/w/400/h/400/logo`,
  `https://icons.duckduckgo.com/ip3/${domain}.ico`,
]

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const gradients = [
  'from-emerald-900 to-teal-800',
  'from-blue-900 to-indigo-800',
  'from-violet-900 to-purple-800',
  'from-rose-900 to-pink-800',
  'from-amber-900 to-orange-800',
  'from-cyan-900 to-sky-800',
]

function getGradient(name: string) {
  return gradients[name.charCodeAt(0) % gradients.length]
}

export default function EntityCard({ entity, onClick }: Props) {
  const [imgError, setImgError] = useState(false)
  const domain = getDomain(entity.website)
  const hasImage = entity.og_image && !imgError

  const logoSources: string[] = entity.logo_url
    ? [entity.logo_url]
    : domain ? LOGO_SERVICES(domain) : []
  const [logoIdx, setLogoIdx] = useState(0)
  const logoSrc = logoSources[logoIdx] ?? null

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/8 text-left transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1"
      style={{ height: '230px' }}
    >
      {/* Background */}
      {hasImage ? (
        <img
          src={entity.og_image!}
          alt={entity.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(entity.name)}`} />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25" />

      {/* Top row: logo left, status dot right */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
        <div className="h-6 max-w-[60px] flex items-center justify-start overflow-hidden flex-shrink-0">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt=""
              className="max-h-6 max-w-[60px] w-auto object-contain"
              onError={() => setLogoIdx((i) => i + 1)}
            />
          ) : (
            <span className="text-sm font-bold text-white">{getInitials(entity.name).slice(0, 1)}</span>
          )}
        </div>
        <StatusBadge status={entity.status} size="sm" />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <h3 className="font-semibold text-white text-base leading-tight truncate">{entity.name}</h3>
        {domain && entity.website && (
          <a
            href={entity.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-white/75 mt-0.5 hover:text-white hover:underline block truncate"
          >
            {domain}
          </a>
        )}
        {entity.description && (
          <p className="text-xs text-white/80 line-clamp-2 mt-1.5 leading-relaxed">
            {entity.description}
          </p>
        )}
      </div>
    </button>
  )
}
