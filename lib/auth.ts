// Mock user data for demo
export interface User {
  id: string
  name: string
  email: string
  role: 'doctor' | 'patient' | 'admin'
  department?: string
  avatar?: string
}

// Simulated user database
const mockUsers: Record<string, { password: string; user: User }> = {
  'doctor@bmrms.com': {
    password: 'password123',
    user: {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'doctor@bmrms.com',
      role: 'doctor',
      department: 'Cardiology',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
  },
  'patient@bmrms.com': {
    password: 'password123',
    user: {
      id: '2',
      name: 'John Doe',
      email: 'patient@bmrms.com',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  },
  'admin@bmrms.com': {
    password: 'password123',
    user: {
      id: '3',
      name: 'Admin User',
      email: 'admin@bmrms.com',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  },
}

export function login(email: string, password: string): User | null {
  const userEntry = mockUsers[email]
  if (userEntry && userEntry.password === password) {
    // Store session in localStorage
    const token = btoa(`${email}:${Date.now()}`)
    localStorage.setItem('auth-token', token)
    localStorage.setItem('auth-user', JSON.stringify(userEntry.user))
    return userEntry.user
  }
  return null
}

export function logout(): void {
  localStorage.removeItem('auth-token')
  localStorage.removeItem('auth-user')
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

export function getMockUsers(): User[] {
  return Object.values(mockUsers).map(entry => entry.user)
}
