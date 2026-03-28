import { fetchApi } from './api'

export type ConsentStatus = 'active' | 'revoked' | 'expired'

export interface Consent {
  id: string
  patientId: string
  patientName: string
  grantedToId: string
  grantedToName: string
  grantedToRole: string
  clinicName: string
  accessLevel: 'read' | 'write' | 'full'
  scope: string
  status: ConsentStatus
  grantedDate: string
  expiryDate?: string
  revokedDate?: string
  grantedByName: string
  blockchainTxHash?: string
}

const accessLevelLabels: Record<string, string> = {
  read: 'Read Only',
  write: 'Read & Write',
  full: 'Full Access',
}

const scopeLabels: Record<string, string> = {
  all_records: 'All Records',
  specific_records: 'Specific Records',
  record_type: 'Record Type',
}

/**
 * Maps a backend consent document (with populated refs) to the frontend Consent type.
 *
 * Backend shape after populate:
 *   patientId          -> { _id, userId: { firstName, lastName, email } }
 *   grantedTo.userId   -> { _id, firstName, lastName, email, role }
 *   grantedTo.clinicId -> { _id, name, clinicCode } | null
 *   grantedBy          -> { _id, firstName, lastName } | ObjectId string
 */
const mapConsent = (raw: any): Consent => {
  const patientUser = raw.patientId?.userId
  const doctor = raw.grantedTo?.userId
  const clinic = raw.grantedTo?.clinicId
  const granter = raw.grantedBy

  return {
    id: String(raw._id ?? raw.id ?? ''),
    patientId: typeof raw.patientId === 'object' ? raw.patientId._id : raw.patientId,
    patientName: patientUser
      ? `${patientUser.firstName} ${patientUser.lastName}`
      : 'Unknown Patient',
    grantedToId: typeof doctor === 'object' ? doctor._id : (doctor || ''),
    grantedToName: typeof doctor === 'object'
      ? `${doctor.firstName} ${doctor.lastName}`
      : (doctor || 'Unknown'),
    grantedToRole: typeof doctor === 'object' ? doctor.role : '',
    clinicName: typeof clinic === 'object' ? clinic.name : '',
    accessLevel: raw.accessLevel || 'read',
    scope: raw.scope || 'all_records',
    status: raw.status || 'active',
    grantedDate: raw.grantedAt || raw.createdAt,
    expiryDate: raw.expiresAt || undefined,
    revokedDate: raw.revokedAt || undefined,
    grantedByName: typeof granter === 'object'
      ? `${granter.firstName} ${granter.lastName}`
      : '',
    blockchainTxHash: raw.blockchainTxHash || undefined,
  }
}

export interface DoctorOption {
  id: string
  name: string
  email: string
  clinicName?: string
}

/** Active doctors the patient can grant consent to (backend: GET /users/doctors). */
export async function getDoctorOptions(): Promise<DoctorOption[]> {
  try {
    const raw = await fetchApi<any>('/users/doctors')
    const list = Array.isArray(raw) ? raw : (raw?.data || [])
    return (list as any[]).map((u) => ({
      id: String(u._id),
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Doctor',
      email: u.email || '',
      clinicName:
        u.clinicId && typeof u.clinicId === 'object' && u.clinicId.name
          ? String(u.clinicId.name)
          : '',
    }))
  } catch (error) {
    console.error('Error fetching doctors for consent:', error)
    return []
  }
}

export type FetchConsentsResult = { consents: Consent[]; error: string | null }

/** Loads consents from the backend; includes error message if the request failed (not an empty list). */
export async function fetchConsents(): Promise<FetchConsentsResult> {
  try {
    const data = await fetchApi<any>('/consent/my-consents')
    const consentsList = Array.isArray(data) ? data : (data.data || [])
    return { consents: consentsList.map(mapConsent), error: null }
  } catch (error: any) {
    console.error('Error fetching consents:', error)
    return {
      consents: [],
      error: error?.message || 'Could not load consents from the server.',
    }
  }
}

export async function getConsents(): Promise<Consent[]> {
  const { consents } = await fetchConsents()
  return consents
}

export async function getConsentById(id: string): Promise<Consent | undefined> {
  const consents = await getConsents()
  return consents.find(c => c.id === id)
}

export async function getPatientConsents(patientId: string): Promise<Consent[]> {
  const consents = await getConsents()
  return consents.filter(c => c.patientId === patientId)
}

function enqueueConsentSync(item: Record<string, unknown>) {
  if (typeof window === 'undefined' || navigator.onLine) return
  const queue = localStorage.getItem('sync-queue') || '[]'
  const syncQueue = JSON.parse(queue)
  syncQueue.push(item)
  localStorage.setItem('sync-queue', JSON.stringify(syncQueue))
  window.dispatchEvent(new Event('sync-queue-changed'))
}

/** Grants consent; throws with server message on failure (does not hide errors behind null). */
export async function createConsent(
  grantedToUserId: string,
  accessLevel: string,
  expiresAt?: string
): Promise<Consent> {
  const backendData: any = {
    grantedToUserId,
    accessLevel: accessLevel || 'read',
    scope: 'all_records',
  }
  if (expiresAt) {
    backendData.expiresAt = expiresAt
  }

  try {
    const response = await fetchApi<any>('/consent/grant', {
      method: 'POST',
      body: JSON.stringify(backendData),
    })
    return mapConsent(response)
  } catch (error: any) {
    console.error('Error creating consent:', error)
    enqueueConsentSync({
      type: 'create-consent',
      data: { grantedToUserId, accessLevel, expiresAt },
      timestamp: new Date().toISOString(),
    })
    throw new Error(error?.message || 'Failed to grant consent')
  }
}

export async function revokeConsent(id: string, reason?: string): Promise<Consent> {
  try {
    const response = await fetchApi<any>(`/consent/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })
    return mapConsent(response)
  } catch (error: any) {
    console.error(`Error revoking consent ${id}:`, error)
    enqueueConsentSync({
      type: 'revoke-consent',
      id,
      reason,
      timestamp: new Date().toISOString(),
    })
    throw new Error(error?.message || 'Failed to revoke consent')
  }
}

export function clearLocalSyncQueue(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('sync-queue')
  window.dispatchEvent(new Event('sync-queue-changed'))
}

export function getAccessLevelLabel(level: string): string {
  return accessLevelLabels[level] || level
}

export function getScopeLabel(scope: string): string {
  return scopeLabels[scope] || scope
}
