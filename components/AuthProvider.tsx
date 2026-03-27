'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User, login as apiLogin, logout as apiLogout } from '@/lib/auth'
import { fetchApi } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getRefId = (value: any): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value._id) return String(value._id)
  return undefined
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize state from local storage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('auth-token')
      const storedUserJson = localStorage.getItem('auth-user')

      if (storedToken && storedUserJson) {
        try {
          const storedUser = JSON.parse(storedUserJson)
          setUser(storedUser)
        } catch {
          setUser(null)
          localStorage.removeItem('auth-token')
          localStorage.removeItem('auth-user')
        }
      }

      // Always refresh profile from backend so refs like patientId/clinicId are correct.
      ;(async () => {
        if (!storedToken) {
          setUser(null)
          setIsLoading(false)
          return
        }

        try {
          const profile = await fetchApi<any>('/auth/profile')
          if (profile) {
            const mapped: User = {
              id: profile._id,
              name: `${profile.firstName} ${profile.lastName}`,
              email: profile.email,
              role: profile.role,
              department: profile.department || undefined,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.firstName}`,
              patientId: getRefId(profile.patientId),
              clinicId: getRefId(profile.clinicId),
            }
            setUser(mapped)
            localStorage.setItem('auth-user', JSON.stringify(mapped))
          }
        } catch {
          // If refresh fails, keep whatever we had (or clear if missing).
          if (!storedUserJson) {
            setUser(null)
            localStorage.removeItem('auth-token')
            localStorage.removeItem('auth-user')
          }
        } finally {
          setIsLoading(false)
        }
      })()
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const loggedInUser = await apiLogin(email, password)
      if (loggedInUser) {
        setUser(loggedInUser)
        return true
      }
    } catch (err) {
      console.error('Login failed', err)
    } finally {
      setIsLoading(false)
    }
    return false
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await apiLogout()
    } finally {
      setUser(null)
      setIsLoading(false)
      // If we are not on the login page already, redirect
      if (pathname !== '/login') {
        router.push('/login')
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
