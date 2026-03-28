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
  const records = await fetchApi<any[]>(`/records/patient/${patientId}`)
  return (Array.isArray(records) ? records : []).map(mapRecord)
}

export interface CreateMedicalRecordPayload {
  patientId: string
  recordType: 'consultation' | 'diagnosis' | 'prescription' | 'lab_result' | 'imaging' | 'surgery' | 'vaccination' | 'other'
  title: string
  description?: string
  file: File
}

export async function createMedicalRecord(payload: CreateMedicalRecordPayload): Promise<any> {
  const form = new FormData()
  form.append('patientId', payload.patientId)
  form.append('recordType', payload.recordType)
  form.append('title', payload.title)
  if (payload.description) form.append('description', payload.description)
  form.append('file', payload.file)

  // fetchApi handles FormData by not setting Content-Type
  return await fetchApi<any>('/records', {
    method: 'POST',
    body: form,
  })
}

