import { useState } from 'react'
import { Leaf } from 'lucide-react'
import { checkPassword, saveSession } from '../lib/auth'

interface Props {
  onLogin: (email: string) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (!checkPassword(password)) {
      setError('Incorrect password.')
      return
    }

    setLoading(true)
    saveSession(email.trim().toLowerCase())
    onLogin(email.trim().toLowerCase())
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b18] px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">TBO x DLAB</h1>
            <p className="text-white/35 text-sm mt-0.5">Functional Health</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="px-6 pt-6 pb-1">
            <h2 className="text-sm font-semibold text-stone-800">Sign in</h2>
            <p className="text-xs text-stone-400 mt-0.5">Enter your email and the team password</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
