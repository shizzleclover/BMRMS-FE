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

const mockConsents: Consent[] = [
  {
    id: 'C001',
    patientId: 'P001',
    patientName: 'Alice Johnson',
    consentType: 'medical-records',
    grantedTo: 'Dr. Sarah Johnson',
    status: 'active',
    grantedDate: '2024-01-15',
    expiryDate: '2025-01-15',
    purpose: 'Primary Care Treatment',
    scope: ['read', 'share-with-specialists'],
    auditTrail: [
      { timestamp: '2024-01-15T10:00:00Z', action: 'created', actor: 'Alice Johnson' },
      { timestamp: '2024-01-15T10:05:00Z', action: 'granted', actor: 'Dr. Sarah Johnson' },
    ],
  },
  {
    id: 'C002',
    patientId: 'P001',
    patientName: 'Alice Johnson',
    consentType: 'research',
    grantedTo: 'Medical Research Institute',
    status: 'pending',
    grantedDate: '2024-02-20',
    purpose: 'Diabetes Research Study',
    scope: ['read', 'anonymized-data'],
    auditTrail: [
      { timestamp: '2024-02-20T14:00:00Z', action: 'created', actor: 'Medical Research Institute' },
    ],
  },
  {
    id: 'C003',
    patientId: 'P002',
    patientName: 'Bob Smith',
    consentType: 'treatment',
    grantedTo: 'City Hospital',
    status: 'active',
    grantedDate: '2024-01-10',
    purpose: 'Hospital Treatment Authorization',
    scope: ['read', 'write', 'emergency-access'],
    auditTrail: [
      { timestamp: '2024-01-10T09:00:00Z', action: 'created', actor: 'Bob Smith' },
      { timestamp: '2024-01-10T09:15:00Z', action: 'granted', actor: 'Hospital Admin' },
    ],
  },
  {
    id: 'C004',
    patientId: 'P002',
    patientName: 'Bob Smith',
    consentType: 'billing',
    grantedTo: 'Insurance Company',
    status: 'revoked',
    grantedDate: '2023-12-01',
    revokedDate: '2024-02-01',
    purpose: 'Insurance Claims Processing',
    scope: ['read', 'billing-data'],
    auditTrail: [
      { timestamp: '2023-12-01T08:00:00Z', action: 'created', actor: 'Bob Smith' },
      { timestamp: '2023-12-01T08:10:00Z', action: 'granted', actor: 'Insurance Admin' },
      { timestamp: '2024-02-01T15:00:00Z', action: 'revoked', actor: 'Bob Smith' },
    ],
  },
  {
    id: 'C005',
    patientId: 'P003',
    patientName: 'Carol Davis',
    consentType: 'medical-records',
    grantedTo: 'Dr. Michael Chen',
    status: 'active',
    grantedDate: '2024-02-15',
    purpose: 'Specialist Consultation',
    scope: ['read', 'consultation-notes'],
    auditTrail: [
      { timestamp: '2024-02-15T11:00:00Z', action: 'created', actor: 'Carol Davis' },
      { timestamp: '2024-02-15T11:20:00Z', action: 'granted', actor: 'Dr. Michael Chen' },
    ],
  },
  {
    id: 'C006',
    patientId: 'P004',
    patientName: 'David Wilson',
    consentType: 'treatment',
    grantedTo: 'Cardiology Center',
    status: 'active',
    grantedDate: '2023-11-20',
    expiryDate: '2024-11-20',
    purpose: 'Cardiac Treatment Program',
    scope: ['read', 'write', 'test-results'],
    auditTrail: [
      { timestamp: '2023-11-20T13:00:00Z', action: 'created', actor: 'David Wilson' },
      { timestamp: '2023-11-20T13:15:00Z', action: 'granted', actor: 'Cardiology Admin' },
    ],
  },
  {
    id: 'C007',
    patientId: 'P005',
    patientName: 'Emma Martinez',
    consentType: 'research',
    grantedTo: 'University Hospital',
    status: 'active',
    grantedDate: '2024-01-20',
    purpose: 'Mental Health Treatment Study',
    scope: ['read', 'anonymized-data', 'follow-up'],
    auditTrail: [
      { timestamp: '2024-01-20T10:30:00Z', action: 'created', actor: 'Emma Martinez' },
      { timestamp: '2024-01-20T10:45:00Z', action: 'granted', actor: 'Research Coordinator' },
    ],
  },
  {
    id: 'C008',
    patientId: 'P006',
    patientName: 'Frank Brown',
    consentType: 'insurance',
    grantedTo: 'Health Insurance Co',
    status: 'active',
    grantedDate: '2024-01-05',
    purpose: 'Insurance Coverage Verification',
    scope: ['read', 'billing-data'],
    auditTrail: [
      { timestamp: '2024-01-05T09:00:00Z', action: 'created', actor: 'Frank Brown' },
      { timestamp: '2024-01-05T09:10:00Z', action: 'granted', actor: 'Insurance Admin' },
    ],
  },
  {
    id: 'C009',
    patientId: 'P007',
    patientName: 'Grace Lee',
    consentType: 'medical-records',
    grantedTo: 'Primary Care Doctor',
    status: 'active',
    grantedDate: '2024-02-01',
    purpose: 'Routine Medical Care',
    scope: ['read', 'write', 'test-ordering'],
    auditTrail: [
      { timestamp: '2024-02-01T08:30:00Z', action: 'created', actor: 'Grace Lee' },
      { timestamp: '2024-02-01T08:45:00Z', action: 'granted', actor: 'Doctor Admin' },
    ],
  },
  {
    id: 'C010',
    patientId: 'P008',
    patientName: 'Henry Taylor',
    consentType: 'treatment',
    grantedTo: 'Rheumatology Clinic',
    status: 'active',
    grantedDate: '2024-01-25',
    purpose: 'Arthritis Management',
    scope: ['read', 'write', 'medication-tracking'],
    auditTrail: [
      { timestamp: '2024-01-25T12:00:00Z', action: 'created', actor: 'Henry Taylor' },
      { timestamp: '2024-01-25T12:15:00Z', action: 'granted', actor: 'Clinic Admin' },
    ],
  },
]

export function getConsents(): Consent[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('consents')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return mockConsents
      }
    }
  }
  return mockConsents
}

export function getConsentById(id: string): Consent | undefined {
  return getConsents().find(c => c.id === id)
}

export function getPatientConsents(patientId: string): Consent[] {
  return getConsents().filter(c => c.patientId === patientId)
}

export function createConsent(consent: Omit<Consent, 'id' | 'auditTrail'>): Consent {
  const newConsent: Consent = {
    ...consent,
    id: `C${String(getConsents().length + 1).padStart(3, '0')}`,
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: 'created',
        actor: consent.patientName,
      },
    ],
  }

  const consents = getConsents()
  consents.push(newConsent)

  if (typeof window !== 'undefined') {
    localStorage.setItem('consents', JSON.stringify(consents))

    // Add to sync queue
    const queue = localStorage.getItem('sync-queue') || '[]'
    const syncQueue = JSON.parse(queue)
    syncQueue.push({
      type: 'create-consent',
      data: newConsent,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('sync-queue', JSON.stringify(syncQueue))
  }

  return newConsent
}

export function revokeConsent(id: string, reason?: string): Consent | null {
  const consents = getConsents()
  const index = consents.findIndex(c => c.id === id)
  if (index === -1) return null

  const consent = consents[index]
  consent.status = 'revoked'
  consent.revokedDate = new Date().toISOString().split('T')[0]
  consent.auditTrail.push({
    timestamp: new Date().toISOString(),
    action: 'revoked',
    actor: 'User',
    details: reason,
  })

  if (typeof window !== 'undefined') {
    localStorage.setItem('consents', JSON.stringify(consents))

    // Add to sync queue
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

  return consent
}

export function getConsentTypeLabel(type: ConsentType): string {
  return consentTypeLabels[type]
}
