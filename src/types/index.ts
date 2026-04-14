export type UserRole = 'lawyer' | 'immigrant' | 'admin'

export type LawyerApprovalStatus = 'pending_approval' | 'approved' | 'rejected'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface LawyerProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  license_number: string
  specialization?: string
  bar_association?: string
  bio?: string
  avatar_url?: string
  is_active: boolean
  approval_status: LawyerApprovalStatus
  created_at: string
}

export interface ImmigrantProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  nationality: string
  passport_number?: string
  date_of_birth?: string
  address_in_spain?: string
  assigned_lawyer_id?: string
  case_status: CaseStatus
  avatar_url?: string
  created_at: string
}

export type CaseStatus =
  | 'pending'
  | 'in_review'
  | 'documents_required'
  | 'submitted'
  | 'approved'
  | 'rejected'

export interface CaseDocument {
  id: string
  immigrant_id: string
  document_type: string
  file_name: string
  file_url: string
  uploaded_at: string
  notes?: string
}

export interface CaseNote {
  id: string
  immigrant_id: string
  lawyer_id: string
  content: string
  is_private: boolean
  created_at: string
}

export type LawyerAssignmentRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export interface LawyerAssignmentRequest {
  id: string
  immigrant_id: string
  lawyer_user_id: string
  status: LawyerAssignmentRequestStatus
  message?: string | null
  created_at: string
  responded_at?: string | null
}

export type FlagCategory =
  | 'lawyer_misconduct'
  | 'document_issue'
  | 'technical_problem'
  | 'other'

export type FlagStatus = 'open' | 'in_review' | 'resolved' | 'dismissed'

export interface AdminFlag {
  id: string
  reporter_user_id: string
  target_user_id?: string | null
  category: FlagCategory
  description: string
  status: FlagStatus
  admin_notes?: string | null
  created_at: string
  resolved_at?: string | null
}

export interface AuditLogEntry {
  id: string
  actor_user_id?: string | null
  action: string
  target_type?: string | null
  target_id?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}
