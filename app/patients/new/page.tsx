'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchApi } from '@/lib/api'
import { ArrowLeft, Save } from 'lucide-react'

interface NewPatientForm {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
    dateOfBirth: string
    gender: string
    bloodType: string
    allergies: string
    chronicConditions: string
}

function NewPatientContent() {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [form, setForm] = useState<NewPatientForm>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        allergies: '',
        chronicConditions: '',
    })

    const handleChange = (field: keyof NewPatientForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSaving(true)

        try {
            // Step 1: Register the user account
            await fetchApi<any>('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    password: form.password,
                    role: 'patient',
                    phone: form.phone || undefined,
                    dateOfBirth: form.dateOfBirth || undefined,
                    gender: form.gender || undefined,
                }),
            })

            setSuccess(true)
            // Redirect to patients list after a short delay
            setTimeout(() => router.push('/patients'), 1500)
        } catch (err: any) {
            setError(err.message || 'Failed to create patient record. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 overflow-auto">
                <div className="md:ml-0 ml-12 p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href="/patients">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <PageHeader
                            title="New Patient Record"
                            description="Register a new patient in the system"
                            icon="➕"
                        />
                    </div>

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <AlertDescription className="text-green-800">
                                Patient created successfully! Redirecting...
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Form */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Personal Information */}
                                <Card className="border-border">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Personal Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="firstName">First Name *</Label>
                                                <Input
                                                    id="firstName"
                                                    value={form.firstName}
                                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                                    required
                                                    className="mt-1"
                                                    placeholder="John"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName">Last Name *</Label>
                                                <Input
                                                    id="lastName"
                                                    value={form.lastName}
                                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                                    required
                                                    className="mt-1"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="email">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={form.email}
                                                    onChange={(e) => handleChange('email', e.target.value)}
                                                    required
                                                    className="mt-1"
                                                    placeholder="patient@example.com"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="password">Password *</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={form.password}
                                                    onChange={(e) => handleChange('password', e.target.value)}
                                                    required
                                                    className="mt-1"
                                                    placeholder="Minimum 8 characters"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input
                                                    id="phone"
                                                    value={form.phone}
                                                    onChange={(e) => handleChange('phone', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="+1234567890"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="dob">Date of Birth</Label>
                                                <Input
                                                    id="dob"
                                                    type="date"
                                                    value={form.dateOfBirth}
                                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="gender">Gender</Label>
                                                <Select value={form.gender} onValueChange={(v) => handleChange('gender', v)}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="bloodType">Blood Type</Label>
                                                <Select value={form.bloodType} onValueChange={(v) => handleChange('bloodType', v)}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select blood type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="A+">A+</SelectItem>
                                                        <SelectItem value="A-">A-</SelectItem>
                                                        <SelectItem value="B+">B+</SelectItem>
                                                        <SelectItem value="B-">B-</SelectItem>
                                                        <SelectItem value="AB+">AB+</SelectItem>
                                                        <SelectItem value="AB-">AB-</SelectItem>
                                                        <SelectItem value="O+">O+</SelectItem>
                                                        <SelectItem value="O-">O-</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Medical Info */}
                                <Card className="border-border">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Medical Information (Optional)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="allergies">Known Allergies</Label>
                                            <Textarea
                                                id="allergies"
                                                value={form.allergies}
                                                onChange={(e) => handleChange('allergies', e.target.value)}
                                                className="mt-1"
                                                rows={3}
                                                placeholder="Enter known allergies, separated by commas"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="conditions">Chronic Conditions</Label>
                                            <Textarea
                                                id="conditions"
                                                value={form.chronicConditions}
                                                onChange={(e) => handleChange('chronicConditions', e.target.value)}
                                                className="mt-1"
                                                rows={3}
                                                placeholder="Enter chronic conditions, separated by commas"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-4">
                                <Card className="border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            type="submit"
                                            className="w-full gap-2"
                                            disabled={isSaving}
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? 'Creating...' : 'Create Patient'}
                                        </Button>
                                        <Link href="/patients">
                                            <Button variant="outline" className="w-full" type="button">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="border-border bg-blue-50 border-blue-200">
                                    <CardContent className="pt-6 text-sm text-foreground space-y-2">
                                        <p className="font-medium">Required fields:</p>
                                        <ul className="text-xs text-muted-foreground space-y-1">
                                            <li>• First Name</li>
                                            <li>• Last Name</li>
                                            <li>• Email</li>
                                            <li>• Password</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default function NewPatientPage() {
    return (
        <ProtectedRoute>
            <NewPatientContent />
        </ProtectedRoute>
    )
}
