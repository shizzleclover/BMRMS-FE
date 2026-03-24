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
    id: raw._id,
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

export async function getConsents(): Promise<Consent[]> {
  try {
    const data = await fetchApi<any>('/consent/my-consents')
    const consentsList = Array.isArray(data) ? data : (data.data || [])
    return consentsList.map(mapConsent)
  } catch (error) {
    console.error('Error fetching consents:', error)
    return []
  }
}

export async function getConsentById(id: string): Promise<Consent | undefined> {
  const consents = await getConsents()
  return consents.find(c => c.id === id)
}

export async function getPatientConsents(patientId: string): Promise<Consent[]> {
  const consents = await getConsents()
  return consents.filter(c => c.patientId === patientId)
}

export async function createConsent(grantedToUserId: string, accessLevel: string, expiresAt?: string): Promise<Consent | null> {
  try {
    const backendData: any = {
      grantedToUserId,
      accessLevel: accessLevel || 'read',
      scope: 'all_records',
    }
    if (expiresAt) {
      backendData.expiresAt = expiresAt
    }

    const response = await fetchApi<any>('/consent/grant', {
      method: 'POST',
      body: JSON.stringify(backendData),
    })

    return mapConsent(response)
  } catch (error) {
    console.error('Error creating consent:', error)

    if (typeof window !== 'undefined') {
      const queue = localStorage.getItem('sync-queue') || '[]'
      const syncQueue = JSON.parse(queue)
      syncQueue.push({
        type: 'create-consent',
        data: { grantedToUserId, accessLevel, expiresAt },
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('sync-queue', JSON.stringify(syncQueue))
    }

    return null
  }
}

export async function revokeConsent(id: string, reason?: string): Promise<Consent | null> {
  try {
    const response = await fetchApi<any>(`/consent/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })

    return mapConsent(response)
  } catch (error) {
    console.error(`Error revoking consent ${id}:`, error)

    if (typeof window !== 'undefined') {
      const queue = localStorage.getItem('sync-queue') || '[]'
      const syncQueue = JSON.parse(queue)
      syncQueue.push({
        type: 'revoke-consent',
        id,
        reason,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('sync-queue', JSON.stringify(syncQueue))
    }

    return null
  }
}

export function getAccessLevelLabel(level: string): string {
  return accessLevelLabels[level] || level
}

export function getScopeLabel(scope: string): string {
  return scopeLabels[scope] || scope
}
