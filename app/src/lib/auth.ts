const SESSION_KEY = 'tbo_session'

export interface Session {
  email: string
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(email: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function checkPassword(input: string): boolean {
  const correct = import.meta.env.VITE_APP_PASSWORD as string
  return input === correct
}
