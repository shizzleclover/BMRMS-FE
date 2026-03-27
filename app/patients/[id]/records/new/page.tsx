'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/components/AuthProvider'
import { createMedicalRecord, CreateMedicalRecordPayload } from '@/lib/records'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewRecordPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [recordType, setRecordType] = useState<CreateMedicalRecordPayload['recordType']>('consultation')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canCreate = user?.role === 'doctor' || user?.role === 'admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate) return
    if (!file) {
      setError('Please upload a file for the medical record.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')
    try {
      await createMedicalRecord({
        patientId,
        recordType,
        title: title.trim(),
        description: description.trim() || undefined,
        file,
      })
      setSuccess('Medical record created successfully.')
      setTimeout(() => router.push(`/patients/${patientId}/records`), 900)
    } catch (err: any) {
      setError(err?.message || 'Failed to create medical record.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="md:ml-0 ml-12 p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Link href={`/patients/${patientId}/records`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <PageHeader
                title="Add Medical Record"
                description="Create a record for this specific patient"
                icon="🧾"
              />
            </div>

            {!canCreate && (
              <Alert variant="destructive">
                <AlertDescription>You are not allowed to create records.</AlertDescription>
              </Alert>
            )}
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
                <CardTitle>Record Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Record Type</Label>
                    <Select value={recordType} onValueChange={(v: any) => setRecordType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="diagnosis">Diagnosis</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="lab_result">Lab Result</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <Input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSaving || !canCreate} className="gap-2">
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Create Record'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

