'use client'

import { useEffect, useMemo, useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/AuthProvider'
import { fetchApi } from '@/lib/api'

type DoctorRow = {
  id: string
  name: string
  email: string
  clinicName: string
}

export default function DoctorsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [rows, setRows] = useState<DoctorRow[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      if (user?.role !== 'admin') {
        setRows([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const resp = await fetchApi<any>('/clinics?limit=100')
        // GET /clinics returns { data: Clinic[] }; fetchApi unwraps to the array directly.
        const clinics = Array.isArray(resp) ? resp : (resp?.clinics || resp?.data || [])
        const flattened: DoctorRow[] = []

        for (const clinic of clinics) {
          const detail = await fetchApi<any>(`/clinics/${clinic._id}`)
          const staff = detail?.staff || []
          for (const member of staff) {
            if (member?.role !== 'doctor' || !member?.userId) continue
            const u = member.userId
            const uid = typeof u === 'object' && u !== null && '_id' in u ? String((u as any)._id) : String(u)
            flattened.push({
              id: uid,
              name:
                typeof u === 'object' && u !== null && 'firstName' in u
                  ? `${(u as any).firstName || ''} ${(u as any).lastName || ''}`.trim() || 'Unknown'
                  : 'Unknown',
              email: typeof u === 'object' && u !== null && 'email' in u ? String((u as any).email || '') : '',
              clinicName: clinic.name || 'Unknown clinic',
            })
          }
        }

        const dedup = new Map<string, DoctorRow>()
        for (const d of flattened) dedup.set(d.id, d)
        setRows(Array.from(dedup.values()))
      } catch (e) {
        console.error('Failed to load doctors', e)
        setRows([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.role])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.clinicName.toLowerCase().includes(q)
    )
  }, [rows, query])

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="md:ml-0 ml-12 p-6 space-y-6">
            <PageHeader title="Doctors" description="View registered doctors by clinic" icon="🩺" />

            {user?.role !== 'admin' ? (
              <Card className="border-border p-6 text-muted-foreground">Only admins can view doctors.</Card>
            ) : (
              <>
                <div className="space-y-2 max-w-md">
                  <Label>Search doctors</Label>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, email, clinic..."
                  />
                </div>
                <Card className="border-border overflow-hidden">
                  {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading doctors...</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No registered doctors found.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border">
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Email</TableHead>
                          <TableHead>Clinic</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((r) => (
                          <TableRow key={r.id} className="border-b border-border">
                            <TableCell className="font-medium">{r.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">{r.email}</TableCell>
                            <TableCell>{r.clinicName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

