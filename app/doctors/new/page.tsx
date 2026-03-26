'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/components/AuthProvider'
import { fetchApi } from '@/lib/api'
import { SyncStatus } from '@/components/SyncStatus'

type Clinic = {
  _id: string
  name: string
  clinicCode?: string
}

export default function AddDoctorPage() {
  const { user } = useAuth()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [clinicId, setClinicId] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const c = await fetchApi<any>('/clinics')
        const list = Array.isArray(c) ? c : []
        setClinics(list)
        if (list[0]?._id) setClinicId(list[0]._id)
      } catch (e: any) {
        console.error('Failed to load clinics', e)
        setError('Failed to load clinics.')
      }
    }
    load()
  }, [])

  const normalizePhone = (raw?: string) => {
    const p = (raw || '').trim()
    if (!p) return undefined
    if (p.startsWith('0') && !p.startsWith('+')) return `+${p.slice(1)}`
    return p
  }

  const handleAddDoctor = async () => {
    if (!user || user.role !== 'admin') return
    if (!clinicId) {
      setError('Select a clinic first.')
      return
    }

    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const registerResp = await fetchApi<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: 'doctor',
          phone: normalizePhone(phone) || undefined,
          dateOfBirth: dateOfBirth || undefined,
          gender: (gender || undefined) as any,
        }),
      })

      const doctorUser = registerResp?.user
      if (!doctorUser?._id) {
        throw new Error('Doctor registration succeeded but no user id was returned.')
      }

      await fetchApi<any>(`/clinics/${clinicId}/staff`, {
        method: 'POST',
        body: JSON.stringify({
          userId: doctorUser._id,
          role: 'doctor',
        }),
      })

      setSuccess('Doctor added to clinic successfully.')
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setPhone('')
      setDateOfBirth('')
      setGender('')
    } catch (e: any) {
      console.error('Add doctor failed', e)
      setError(e?.message || 'Failed to add doctor.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  if (user.role !== 'admin') {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="md:ml-0 ml-12 p-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Access denied</CardTitle>
                  <CardDescription>You must be an admin to add doctors.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="md:ml-0 ml-12 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <PageHeader
                title="Add Doctor"
                description="Register a doctor account and allocate it to a clinic"
                icon="➕"
              />
              <SyncStatus />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {clinics.length === 0 ? (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>No clinics found</CardTitle>
                  <CardDescription>
                    Create a clinic first, then come back to add doctors.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    You can create one here: {' '}
                    <Link href="/clinics/new" className="text-primary hover:underline">
                      Create Clinic
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Doctor Details</CardTitle>
                  <CardDescription>All doctor fields are optional except email and password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Clinic</Label>
                    <Select value={clinicId} onValueChange={setClinicId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone (optional)</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth (optional)</Label>
                      <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender (optional)</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => window.location.reload()} disabled={isLoading}>
                      Reset
                    </Button>
                    <Button onClick={handleAddDoctor} disabled={isLoading || !clinicId || !email.trim() || !password}>
                      {isLoading ? 'Adding...' : 'Add Doctor'}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    If you do not see new doctors on the patient records screen, ensure the patient has been assigned to this clinic.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

