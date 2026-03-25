import { fetchApi } from './api'

export interface PatientRecord {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'M' | 'F' | 'Other'
  bloodType: string
  address: string
  medicalHistory: string[]
  currentMedications: string[]
  allergies: string[]
  lastVisit: string
  status: 'active' | 'inactive'
  syncStatus: 'synced' | 'pending' | 'failed'
  // Only used for UI role-scoping (doctor/admin vs patient)
  primaryClinicId?: string
}

// Map backend patient schema to frontend generic PatientRecord interface
const mapPatient = (backendPatient: any): PatientRecord => {
  return {
    id: backendPatient._id,
    name: `${backendPatient.userId?.firstName || ''} ${backendPatient.userId?.lastName || ''}`.trim(),
    email: backendPatient.userId?.email || '',
    phone: backendPatient.userId?.phone || '',
    dateOfBirth: backendPatient.userId?.dateOfBirth || '',
    gender: backendPatient.userId?.gender?.toUpperCase()?.charAt(0) || 'Other',
    bloodType: backendPatient.bloodType || 'Unknown',
    address: backendPatient.address || backendPatient.userId?.address || 'Not provided',
    medicalHistory: backendPatient.chronicConditions?.map((c: any) => c.condition) || [],
    currentMedications: backendPatient.medications?.map((m: any) => typeof m === 'string' ? m : m.name) || [],
    allergies: backendPatient.allergies?.map((a: any) => typeof a === 'string' ? a : a.name) || [],
    lastVisit: backendPatient.updatedAt || backendPatient.createdAt,
    status: backendPatient.status || 'active',
    syncStatus: backendPatient.syncStatus || 'synced',
    primaryClinicId: backendPatient.primaryClinic?._id
      ? String(backendPatient.primaryClinic._id)
      : (backendPatient.primaryClinic ? String(backendPatient.primaryClinic) : undefined),
  }
}

export async function getPatients(): Promise<PatientRecord[]> {
  try {
    const data = await fetchApi<any>('/patients')
    // Backend returns paginated response { data: [...], pagination: {...} } or just the array depending on route wrap
    // Here we handle the `data` wrapper which might be returned from `api.ts` extraction
    const patientsList = Array.isArray(data) ? data : (data.patients || data.data || [])
    return patientsList.map(mapPatient)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return []
  }
}

export async function getPatientById(id: string): Promise<PatientRecord | undefined> {
  try {
    const data = await fetchApi<any>(`/patients/${id}`)
    return mapPatient(data)
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error)
    return undefined
  }
}

export async function searchPatients(query: string): Promise<PatientRecord[]> {
  // If backend supports search, we can use a query param:
  // const data = await fetchApi<any>(`/patients?search=${encodeURIComponent(query)}`)
  // For now, fetch all and filter client-side as fallback if endpoint doesn't support generic search
  const patients = await getPatients()
  const lowerQuery = query.toLowerCase()
  return patients.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.email.toLowerCase().includes(lowerQuery) ||
    p.id.toLowerCase().includes(lowerQuery)
  )
}

export async function updatePatient(id: string, data: Partial<PatientRecord>): Promise<PatientRecord | null> {
  try {
    // Note: We'd need to map Frontend PatientRecord back to Backend Schema
    // For simplicity, we assume backend takes direct updates for now

    // We queue offline updates into sync-queue if we catch a network error
    const backendData: any = {}
    if (data.bloodType !== undefined) backendData.bloodType = data.bloodType
    if (data.allergies !== undefined) {
      backendData.allergies = data.allergies.map(a => ({ name: a, severity: 'moderate' }))
    }
    if (data.medicalHistory !== undefined) {
      backendData.chronicConditions = data.medicalHistory.map(c => ({ condition: c, status: 'active' }))
    }
    if (data.currentMedications !== undefined) {
      backendData.medications = data.currentMedications
    }

    const response = await fetchApi<any>(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(backendData)
    })

    return mapPatient(response)
  } catch (error) {
    console.error(`Error updating patient ${id}:`, error)

    // Add to sync queue for offline support
    if (typeof window !== 'undefined') {
      const queue = localStorage.getItem('sync-queue') || '[]'
      const syncQueue = JSON.parse(queue)
      syncQueue.push({
        type: 'update-patient',
        id,
        data,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('sync-queue', JSON.stringify(syncQueue))
    }

    return null
  }
}

export async function createPatient(patient: Omit<PatientRecord, 'id'>): Promise<PatientRecord | null> {
  try {
    const backendData: any = {
      bloodType: patient.bloodType,
    }
    if (patient.allergies?.length) {
      backendData.allergies = patient.allergies.map(a => ({ name: a, severity: 'moderate' }))
    }
    if (patient.medicalHistory?.length) {
      backendData.chronicConditions = patient.medicalHistory.map(c => ({ condition: c, status: 'active' }))
    }
    if (patient.currentMedications?.length) {
      backendData.medications = patient.currentMedications
    }

    const response = await fetchApi<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(backendData)
    })

    return mapPatient(response)
  } catch (error) {
    console.error('Error creating patient:', error)

    if (typeof window !== 'undefined') {
      const queue = localStorage.getItem('sync-queue') || '[]'
      const syncQueue = JSON.parse(queue)
      syncQueue.push({
        type: 'create-patient',
        data: patient,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('sync-queue', JSON.stringify(syncQueue))
    }

    return null
  }
}
