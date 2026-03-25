import { fetchApi } from './api'

export type MedicalRecordStatus = 'latest'

export interface MedicalRecordSummary {
  id: string
  recordNumber: string
  title: string
  visitDate: string
  doctorName: string
  recordType: string
}

const mapRecord = (raw: any): MedicalRecordSummary => {
  const doctor = raw.doctorId
  const doctorName =
    doctor && typeof doctor === 'object'
      ? `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()
      : String(raw.doctorId || '')

  return {
    id: raw._id ? String(raw._id) : String(raw.id || ''),
    recordNumber: raw.recordNumber || '',
    title: raw.title || '',
    visitDate: raw.visitDate ? new Date(raw.visitDate).toISOString() : new Date().toISOString(),
    doctorName,
    recordType: raw.recordType || '',
  }
}

export async function getPatientRecords(patientId: string): Promise<MedicalRecordSummary[]> {
  if (!patientId) return []

  try {
    const records = await fetchApi<any[]>(`/records/patient/${patientId}`)
    return (Array.isArray(records) ? records : []).map(mapRecord)
  } catch (error) {
    console.error('Error fetching patient records:', error)
    return []
  }
}

