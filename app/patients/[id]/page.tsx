'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getPatientById, updatePatient, PatientRecord } from '@/lib/patients'
import { ArrowLeft, Save, Eye, Plus } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

function PatientDetailContent() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<PatientRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true)
      const found = await getPatientById(patientId)
      setPatient(found || null)
      if (found) {
        setFormData(found)
      }
      setIsLoading(false)
    }
    fetchPatient()
  }, [patientId])

  const handleSave = async () => {
    if (!formData) return
    setIsSaving(true)

    // Simulate slight delay for UX
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const updated = await updatePatient(patientId, formData)
      if (updated) {
        setPatient(updated)
        setIsEditing(false)
      }
    } catch (e) {
      console.error('Failed to update patient', e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof PatientRecord, value: any) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center md:ml-0 ml-12">
          <p className="text-muted-foreground">Loading patient details...</p>
        </main>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center md:ml-0 ml-12">
          <p className="text-muted-foreground">Patient not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 ml-12 p-6 space-y-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <Link href="/patients">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <PageHeader
              title={patient.name}
              description={`Patient ID: ${patient.id}`}
              icon="👤"
              action={
                <Button
                  onClick={() => {
                    if (isEditing) {
                      handleSave()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? (isSaving ? 'Saving...' : 'Save Changes') : 'Edit'}
                </Button>
              }
            />

            <Link href={`/patients/${patient.id}/records`}>
              <Button variant="outline" className="hidden sm:inline-flex gap-2">
                <Eye className="w-4 h-4" />
                View Records
              </Button>
            </Link>

            {(user?.role === 'doctor' || user?.role === 'admin') && (
              <Link href={`/patients/${patient.id}/records/new`}>
                <Button className="hidden sm:inline-flex gap-2">
                  <Plus className="w-4 h-4" />
                  Add Record
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={formData?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData?.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        value={formData?.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData?.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Medical History */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Input
                      id="bloodType"
                      value={formData?.bloodType || ''}
                      onChange={(e) => handleInputChange('bloodType', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="history">Medical History</Label>
                    <Textarea
                      id="history"
                      value={formData?.medicalHistory.join(', ') || ''}
                      onChange={(e) => handleInputChange('medicalHistory', e.target.value.split(',').map(s => s.trim()))}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      value={formData?.currentMedications.join(', ') || ''}
                      onChange={(e) => handleInputChange('currentMedications', e.target.value.split(',').map(s => s.trim()))}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData?.allergies.join(', ') || ''}
                      onChange={(e) => handleInputChange('allergies', e.target.value.split(',').map(s => s.trim()))}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Record Status</p>
                    <StatusBadge status={patient.status === 'active' ? 'active' : 'inactive'} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Sync Status</p>
                    <StatusBadge status={patient.syncStatus === 'synced' ? 'approved' : 'pending'} label={patient.syncStatus === 'synced' ? 'Synced' : 'Pending'} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                    <p className="text-xs pt-2">Patient ID: <span className="font-mono">{patient.id}</span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PatientDetailPage() {
  return (
    <ProtectedRoute>
      <PatientDetailContent />
    </ProtectedRoute>
  )
}
