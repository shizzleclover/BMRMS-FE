import { Badge } from "@/components/ui/badge"

export type StatusType = 'active' | 'inactive' | 'pending' | 'approved' | 'revoked' | 'archived'

interface StatusBadgeProps {
  status: StatusType
  label?: string
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  approved: {
    label: 'Approved',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  revoked: {
    label: 'Revoked',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-100 text-slate-800 border-slate-300',
  },
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant="outline" className={`${config.className} border`}>
      {label || config.label}
    </Badge>
  )
}
