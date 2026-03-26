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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/components/AuthProvider'
import { fetchApi } from '@/lib/api'
import { SyncStatus } from '@/components/SyncStatus'

export default function CreateClinicPage() {
  const { user } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [zipCode, setZipCode] = useState('')

  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')

  const [licenseNumber, setLicenseNumber] = useState('')

  const normalizePhone = (raw?: string) => {
    const p = (raw || '').trim()
    if (!p) return undefined
    if (p.startsWith('0') && !p.startsWith('+')) return `+${p.slice(1)}`
    return p
  }

  const handleCreate = async () => {
    if (!user || user.role !== 'admin') return

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          zipCode: zipCode.trim(),
        },
        contact: {
          phone: normalizePhone(phone),
          email: email.trim().toLowerCase(),
          website: website.trim() || '',
        },
        licenseNumber: licenseNumber.trim() || undefined,
      }

      await fetchApi<any>('/clinics', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      setSuccess('Clinic created successfully.')
    } catch (e: any) {
      console.error('Create clinic failed', e)
      setError(e?.message || 'Failed to create clinic.')
    } finally {
      setIsSubmitting(false)
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
                  <CardDescription>Only admins can create clinics.</CardDescription>
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
                title="Create Clinic"
                description="Create a clinic before adding doctors"
                icon="🏥"
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

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Clinic details</CardTitle>
                <CardDescription>All required fields are marked by input validation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Clinic name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
                    <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                    <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                    <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                    <Input placeholder="Zip code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                    <div />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contact</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Phone (e.g. +234...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input placeholder="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    <Input placeholder="License number (optional)" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setName('')
                      setDescription('')
                      setStreet('')
                      setCity('')
                      setState('')
                      setCountry('')
                      setZipCode('')
                      setPhone('')
                      setEmail('')
                      setWebsite('')
                      setLicenseNumber('')
                      setError('')
                      setSuccess('')
                    }}
                    disabled={isSubmitting}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleCreate} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Clinic'}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  After creating a clinic, go to <Link href="/doctors/new" className="text-primary hover:underline">Add Doctor</Link>.
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

