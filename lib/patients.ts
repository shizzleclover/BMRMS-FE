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
}

// Mock patient data
const mockPatients: PatientRecord[] = [
  {
    id: 'P001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1-555-0101',
    dateOfBirth: '1985-03-15',
    gender: 'F',
    bloodType: 'O+',
    address: '123 Main St, New York, NY',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: ['Metformin', 'Lisinopril'],
    allergies: ['Penicillin', 'Sulfonamides'],
    lastVisit: '2024-02-15',
    status: 'active',
    syncStatus: 'synced',
  },
  {
    id: 'P002',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1-555-0102',
    dateOfBirth: '1978-07-22',
    gender: 'M',
    bloodType: 'A+',
    address: '456 Oak Ave, Los Angeles, CA',
    medicalHistory: ['Asthma', 'GERD'],
    currentMedications: ['Albuterol', 'Omeprazole'],
    allergies: ['Aspirin'],
    lastVisit: '2024-02-10',
    status: 'active',
    syncStatus: 'synced',
  },
  {
    id: 'P003',
    name: 'Carol Davis',
    email: 'carol@example.com',
    phone: '+1-555-0103',
    dateOfBirth: '1992-11-08',
    gender: 'F',
    bloodType: 'B-',
    address: '789 Pine Rd, Chicago, IL',
    medicalHistory: ['Migraine'],
    currentMedications: ['Sumatriptan'],
    allergies: ['NSAIDs'],
    lastVisit: '2024-02-20',
    status: 'active',
    syncStatus: 'pending',
  },
  {
    id: 'P004',
    name: 'David Wilson',
    email: 'david@example.com',
    phone: '+1-555-0104',
    dateOfBirth: '1988-05-30',
    gender: 'M',
    bloodType: 'AB+',
    address: '321 Elm St, Houston, TX',
    medicalHistory: ['Hyperlipidemia'],
    currentMedications: ['Atorvastatin'],
    allergies: ['Statins (except atorvastatin)'],
    lastVisit: '2024-01-28',
    status: 'active',
    syncStatus: 'synced',
  },
  {
    id: 'P005',
    name: 'Emma Martinez',
    email: 'emma@example.com',
    phone: '+1-555-0105',
    dateOfBirth: '1995-09-12',
    gender: 'F',
    bloodType: 'O-',
    address: '654 Cedar Ln, Phoenix, AZ',
    medicalHistory: ['Anxiety Disorder'],
    currentMedications: ['Sertraline'],
    allergies: ['None known'],
    lastVisit: '2024-02-18',
    status: 'active',
    syncStatus: 'synced',
  },
  {
    id: 'P006',
    name: 'Frank Brown',
    email: 'frank@example.com',
    phone: '+1-555-0106',
    dateOfBirth: '1980-12-25',
    gender: 'M',
    bloodType: 'A-',
    address: '987 Birch Ave, Philadelphia, PA',
    medicalHistory: ['Sleep Apnea'],
    currentMedications: ['CPAP therapy'],
    allergies: ['Latex'],
    lastVisit: '2024-02-05',
    status: 'inactive',
    syncStatus: 'synced',
  },
  {
    id: 'P007',
    name: 'Grace Lee',
    email: 'grace@example.com',
    phone: '+1-555-0107',
    dateOfBirth: '1998-04-03',
    gender: 'F',
    bloodType: 'B+',
    address: '147 Maple Dr, San Antonio, TX',
    medicalHistory: [],
    currentMedications: [],
    allergies: ['None known'],
    lastVisit: '2024-02-22',
    status: 'active',
    syncStatus: 'synced',
  },
  {
    id: 'P008',
    name: 'Henry Taylor',
    email: 'henry@example.com',
    phone: '+1-555-0108',
    dateOfBirth: '1975-06-18',
    gender: 'M',
    bloodType: 'O+',
    address: '258 Oak St, San Diego, CA',
    medicalHistory: ['Rheumatoid Arthritis'],
    currentMedications: ['Methotrexate'],
    allergies: ['Sulfasalazine'],
    lastVisit: '2024-02-08',
    status: 'active',
    syncStatus: 'synced',
  },
  {
    id: 'P009',
    name: 'Iris Chen',
    email: 'iris@example.com',
    phone: '+1-555-0109',
    dateOfBirth: '1990-08-20',
    gender: 'F',
    bloodType: 'AB-',
    address: '369 Pine Ave, Dallas, TX',
    medicalHistory: ['Thyroid Disorder'],
    currentMedications: ['Levothyroxine'],
    allergies: ['Iodine'],
    lastVisit: '2024-02-12',
    status: 'active',
    syncStatus: 'synced',
  },
  {
    id: 'P010',
    name: 'Jack Robinson',
    email: 'jack@example.com',
    phone: '+1-555-0110',
    dateOfBirth: '1983-10-05',
    gender: 'M',
    bloodType: 'A+',
    address: '456 Cedar Ave, Austin, TX',
    medicalHistory: ['COPD'],
    currentMedications: ['Inhaled Corticosteroids'],
    allergies: ['Beta-blockers'],
    lastVisit: '2024-02-19',
    status: 'active',
    syncStatus: 'pending',
  },
]

export function getPatients(): PatientRecord[] {
  // Load from localStorage if available
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('patients')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return mockPatients
      }
    }
  }
  return mockPatients
}

export function getPatientById(id: string): PatientRecord | undefined {
  return getPatients().find(p => p.id === id)
}

export function searchPatients(query: string): PatientRecord[] {
  const patients = getPatients()
  const lowerQuery = query.toLowerCase()
  return patients.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.email.toLowerCase().includes(lowerQuery) ||
    p.id.toLowerCase().includes(lowerQuery)
  )
}

export function updatePatient(id: string, data: Partial<PatientRecord>): PatientRecord | null {
  const patients = getPatients()
  const index = patients.findIndex(p => p.id === id)
  if (index === -1) return null

  patients[index] = { ...patients[index], ...data }

  if (typeof window !== 'undefined') {
    localStorage.setItem('patients', JSON.stringify(patients))

    // Add to sync queue
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

  return patients[index]
}

export function createPatient(patient: Omit<PatientRecord, 'id'>): PatientRecord {
  const newPatient: PatientRecord = {
    ...patient,
    id: `P${String(getPatients().length + 1).padStart(3, '0')}`,
  }

  const patients = getPatients()
  patients.push(newPatient)

  if (typeof window !== 'undefined') {
    localStorage.setItem('patients', JSON.stringify(patients))

    // Add to sync queue
    const queue = localStorage.getItem('sync-queue') || '[]'
    const syncQueue = JSON.parse(queue)
    syncQueue.push({
      type: 'create-patient',
      data: newPatient,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('sync-queue', JSON.stringify(syncQueue))
  }

  return newPatient
}
