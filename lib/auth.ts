import { fetchApi } from './api'

export interface User {
  id: string
  name: string
  email: string
  role: 'doctor' | 'patient' | 'admin'
  department?: string
  avatar?: string
}

// Map backend user schema to frontend generic User interface
const mapUser = (backendUser: any): User => {
  return {
    id: backendUser._id,
    name: `${backendUser.firstName} ${backendUser.lastName}`,
    email: backendUser.email,
    role: backendUser.role,
    department: backendUser.department || undefined,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.firstName}`
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetchApi<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    if (response && response.accessToken && response.user) {
      const user = mapUser(response.user)

      localStorage.setItem('auth-token', response.accessToken)
      localStorage.setItem('auth-user', JSON.stringify(user))

      return user
    }
    return null
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    // Attempt to notify backend
    await fetchApi('/auth/logout', { method: 'POST' })
  } catch (error) {
    // Ignore error if backend is unreachable, we still want to clear local state
    console.error('Error logging out from backend:', error)
  } finally {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-user')
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null

  const userJson = localStorage.getItem('auth-user')
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('auth-token')
}
