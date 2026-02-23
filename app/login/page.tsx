'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { login, getMockUsers } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const mockUsers = getMockUsers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const user = login(email, password)
    if (user) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password')
    }

    setIsLoading(false)
  }

  const demoLogin = (demoEmail: string) => {
    setEmail(demoEmail)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">BMRMS</h1>
          <p className="text-muted-foreground">Healthcare Records Management System</p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Users</span>
              </div>
            </div>

            <div className="space-y-2">
              {mockUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => demoLogin(user.email)}
                  className="w-full px-4 py-2 text-sm text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left"
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground block">{user.email}</span>
                </button>
              ))}
            </div>

            <div className="text-xs text-center text-muted-foreground pt-2">
              Password: <span className="font-mono">password123</span>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="border-border bg-blue-50">
          <CardContent className="pt-6 text-sm text-foreground">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Doctor: doctor@bmrms.com</li>
              <li>• Patient: patient@bmrms.com</li>
              <li>• Admin: admin@bmrms.com</li>
              <li>• Password: password123</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
