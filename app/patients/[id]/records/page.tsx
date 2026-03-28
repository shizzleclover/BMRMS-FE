'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/components/AuthProvider'
import { getPatientById, PatientRecord } from '@/lib/patients'
import { getPatientRecords, MedicalRecordSummary } from '@/lib/records'
import { SyncStatus } from '@/components/SyncStatus'

import { ArrowLeft, Plus } from 'lucide-react'

function RecordsContent() {
  const params = useParams()
  const patientId = params.id as string
  const { user } = useAuth()

  const [patient, setPatient] = useState<PatientRecord | undefined>(undefined)
  const [records, setRecords] = useState<MedicalRecordSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [accessMessage, setAccessMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) return

      setIsLoading(true)
      setForbidden(false)
      setAccessMessage('')

      try {
        if (user.role === 'patient') {
          if (!user.patientId || user.patientId !== patientId) {
            setForbidden(true)
            setAccessMessage('You can only view your own records.')
            setRecords([])
            setIsLoading(false)
            return
          }
        }

        if (user.role === 'doctor' || user.role === 'admin') {
          const found = await getPatientById(patientId)
          setPatient(found)
        }

        const recs = await getPatientRecords(patientId)
        setRecords(recs)
      } catch (e: any) {
        console.error('Error loading records:', e)
        setRecords([])
        setForbidden(true)
        setAccessMessage(
          e?.message ||
            'You are not allowed to view these records. Doctors need active patient consent or clinic assignment.'
        )
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [patientId, user])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 ml-12 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/patients">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <PageHeader
              title="Medical Records"
              description={patient ? `Patient: ${patient.name}` : `Patient ID: ${patientId}`}
              icon="📄"
            />
            <SyncStatus />
          </div>

          {forbidden ? (
            <Card className="border-border">
              <CardContent className="p-6 text-muted-foreground">
                {accessMessage || 'You are not authorized to view these records.'}
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="border-border">
              <CardContent className="p-6 text-muted-foreground">Loading records...</CardContent>
            </Card>
          ) : (
            <Card className="border-border overflow-hidden">
              <CardHeader>
                <CardTitle>Record History</CardTitle>
                <CardDescription>Latest stored records for this patient</CardDescription>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground space-y-3">
                    <p>No records found.</p>
                    {(user?.role === 'doctor' || user?.role === 'admin') && (
                      <Link href={`/patients/${patientId}/records/new`}>
                        <Button size="sm" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add record
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border">
                        <TableHead className="font-semibold text-foreground">Record</TableHead>
                        <TableHead className="font-semibold text-foreground">Type</TableHead>
                        <TableHead className="font-semibold text-foreground">Doctor</TableHead>
                        <TableHead className="font-semibold text-foreground">Visit Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((r) => (
                        <TableRow key={r.id} className="border-b border-border hover:bg-muted/50">
                          <TableCell className="font-medium text-foreground">
                            <div className="flex flex-col">
                              <span>{r.recordNumber}</span>
                              <span className="text-xs text-muted-foreground truncate">{r.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{r.recordType}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{r.doctorName || '—'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(r.visitDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <RecordsContent />
    </ProtectedRoute>
  )
}

