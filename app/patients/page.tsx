'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { SyncStatus } from '@/components/SyncStatus'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getPatients, searchPatients, PatientRecord } from '@/lib/patients'
import { Plus, Search, Eye } from 'lucide-react'

function PatientsContent() {
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const allPatients = getPatients()
    setPatients(allPatients)
    setIsLoading(false)
  }, [])

  const filteredPatients = searchQuery
    ? searchPatients(searchQuery)
    : patients

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 ml-12 p-6 space-y-6">
          <PageHeader
            title="Patient Records"
            description="Manage and view patient medical records"
            icon="👥"
            action={
              <Link href="/patients/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Record
                </Button>
              </Link>
            }
          />

          {/* Search and Sync Status */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <SyncStatus />
          </div>

          {/* Patients Table */}
          <Card className="border-border overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No patients found matching your search.' : 'No patient records available.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="font-semibold text-foreground">Name</TableHead>
                    <TableHead className="font-semibold text-foreground">ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Contact</TableHead>
                    <TableHead className="font-semibold text-foreground">Blood Type</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Sync</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{patient.id}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{patient.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{patient.bloodType}</TableCell>
                      <TableCell>
                        <StatusBadge status={patient.status === 'active' ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={patient.syncStatus === 'synced' ? 'approved' : 'pending'} label={patient.syncStatus === 'synced' ? 'Synced' : 'Pending'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function PatientsPage() {
  return (
    <ProtectedRoute>
      <PatientsContent />
    </ProtectedRoute>
  )
}
