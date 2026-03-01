import { fetchApi } from './api'

export type ConsentStatus = 'active' | 'revoked' | 'pending' | 'expired'
export type ConsentType = 'medical-records' | 'treatment' | 'research' | 'billing' | 'insurance'

export interface Consent {
  id: string
  patientId: string
  patientName: string
  consentType: ConsentType
  grantedTo: string
  status: ConsentStatus
  grantedDate: string
  expiryDate?: string
  revokedDate?: string
  purpose: string
  scope: string[]
  auditTrail: AuditEntry[]
}

export interface AuditEntry {
  timestamp: string
  action: 'created' | 'granted' | 'revoked' | 'viewed'
  actor: string
  details?: string
}

const consentTypeLabels: Record<ConsentType, string> = {
  'medical-records': 'Medical Records Access',
  'treatment': 'Treatment Authorization',
  'research': 'Research Participation',
  'billing': 'Billing Information',
  'insurance': 'Insurance Claims',
}

// Map backend consent schema to frontend generic Consent interface
const mapConsent = (backendConsent: any): Consent => {
  return {
    id: backendConsent._id,
    patientId: backendConsent.patientId?._id || backendConsent.patientId,
    patientName: backendConsent.patientId?.userId?.firstName
      ? `${backendConsent.patientId.userId.firstName} ${backendConsent.patientId.userId.lastName}`
      : 'Unknown Patient',
    consentType: backendConsent.consentType || 'medical-records',
    grantedTo: backendConsent.grantedToUserId?.firstName
      ? `Dr. ${backendConsent.grantedToUserId.lastName}`
      : backendConsent.grantedToUserId,
    status: backendConsent.status === 'active' ? 'active' : 'revoked', // simplified status mapping
    grantedDate: backendConsent.grantedAt || backendConsent.createdAt,
    expiryDate: backendConsent.expiresAt,
    revokedDate: backendConsent.revokedAt,
    purpose: backendConsent.accessLevel || 'read',
    scope: backendConsent.scope ? [backendConsent.scope] : ['all_records'],
    auditTrail: backendConsent.auditTrail?.map((entry: any) => ({
      timestamp: entry.timestamp || entry.createdAt,
      action: entry.action,
      actor: entry.actor || entry.userId || 'System',
      details: entry.details,
    })) || [],
  }
}

export async function getConsents(): Promise<Consent[]> {
  try {
    // Determine route based on user role if necessary. Default to current user's consents.
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
  // If backend supports filtering by patient:
  // const data = await fetchApi<any>(`/consent?patientId=${patientId}`)
  // Return mapped data. For now, filter client-side:
  const consents = await getConsents()
  return consents.filter(c => c.patientId === patientId)
}

export async function createConsent(consentData: Omit<Consent, 'id' | 'auditTrail'>): Promise<Consent | null> {
  try {
    const backendData = {
      grantedToUserId: consentData.grantedTo, // UI needs to supply User ID, not name
      accessLevel: consentData.purpose === 'read' ? 'read' : 'full',
      scope: 'all_records', // default for now, can map from consentData.scope
      expiresAt: consentData.expiryDate,
    }

    const response = await fetchApi<any>('/consent/grant', {
      method: 'POST',
      body: JSON.stringify(backendData)
    })

    return mapConsent(response)
  } catch (error) {
    console.error('Error creating consent:', error)

    // Add to sync queue
    if (typeof window !== 'undefined') {
      const queue = localStorage.getItem('sync-queue') || '[]'
      const syncQueue = JSON.parse(queue)
      syncQueue.push({
        type: 'create-consent',
        data: consentData,
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
      body: JSON.stringify({ reason })
    })

    return mapConsent(response)
  } catch (error) {
    console.error(`Error revoking consent ${id}:`, error)

    // Add to sync queue for offline support
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

export function getConsentTypeLabel(type: ConsentType): string {
  return consentTypeLabels[type]
}
