import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import EntityGrid from './components/EntityGrid'
import LoginPage from './components/LoginPage'
import { getSession, clearSession } from './lib/auth'

const NAV = [
  { to: '/all',        label: 'All',                category: 'all'               as const },
  { to: '/',           label: 'Functional Health',  category: 'functional_health' as const },
  { to: '/beauty',     label: 'Beauty',             category: 'beauty'            as const },
  { to: '/tea-coffee', label: 'Tea & Coffee',       category: 'tea_coffee'        as const },
  { to: '/partners',   label: 'Partners',           category: null },
]

export default function App() {
  const [session, setSession] = useState(getSession)

  if (!session) {
    return <LoginPage onLogin={(email) => setSession({ email })} />
  }

  function logout() {
    clearSession()
    setSession(null)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
            {/* Brand */}
            <span className="font-semibold tracking-tight text-stone-900 flex-shrink-0">TBO x DLAB</span>

            {/* Nav */}
            <nav className="flex items-center gap-1 flex-1">
              {NAV.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-stone-100 text-stone-900'
                        : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* User + logout */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-stone-400 font-medium">{session.email}</span>
              <button
                onClick={logout}
                title="Sign out"
                className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-300 hover:text-stone-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/all" element={
              <EntityGrid entityType="company" category={null} title="All Companies" subtitle="Everything in your dealflow" />
            } />
            <Route path="/" element={
              <EntityGrid entityType="company" category="functional_health" title="Functional Health & Wellness" subtitle="Startups in your dealflow" />
            } />
            <Route path="/beauty" element={
              <EntityGrid entityType="company" category="beauty" title="Beauty" subtitle="Startups in your dealflow" />
            } />
            <Route path="/tea-coffee" element={
              <EntityGrid entityType="company" category="tea_coffee" title="Tea & Coffee" subtitle="Startups in your dealflow" />
            } />
            <Route path="/partners" element={
              <EntityGrid entityType="partner" category={null} title="Partners" subtitle="Co-investors and strategic partners" />
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
