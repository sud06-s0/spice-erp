import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

async function request(path, { method = 'GET', body } = {}) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(json?.error || `Request failed with status ${res.status}`)
  }
  return json
}

// Use this for anything that goes through the Node API (multi-table writes,
// calculations, role-checked actions). Simple single-table reads/writes can
// keep calling `supabase` directly — see ARCHITECTURE.md, section 1.
export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
}