export type OJTState = 'FL' | 'GA';
export type OJTProgramStatus = 'draft' | 'active' | 'completed' | 'closed';
export type OJTEnrollmentStatus = 'pending' | 'active' | 'completed' | 'withdrawn';
export type EvidenceStatus = 'missing' | 'in_review' | 'verified' | 'expired' | 'waived';

export interface OJTProgram {
  id: string;
  state_code: OJTState;
  title: string;
  sponsor_name: string;
  occupation_title: string;
  required_hours: number;
  start_date: string | null;
  end_date: string | null;
  status: OJTProgramStatus;
  created_at: string;
  updated_at: string;
}

export interface OJTEnrollment {
  id: string;
  program_id: string;
  trainee_name: string;
  employer_name: string;
  supervisor_name: string;
  supervisor_email: string | null;
  start_date: string;
  end_date: string | null;
  wage_at_start: number | null;
  status: OJTEnrollmentStatus;
  created_at: string;
  updated_at: string;
}

export interface OJTHourEntry {
  id: string;
  enrollment_id: string;
  work_date: string;
  hours: number;
  work_activity: string;
  supervisor_name: string;
  supervisor_approved_at: string | null;
  trainee_attested_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface ComplianceRequirement {
  id: string;
  state_code: OJTState;
  title: string;
  description: string;
  evidence_type: string;
  required: boolean;
  effective_from: string | null;
  effective_to: string | null;
}

export interface ComplianceEvidence {
  id: string;
  enrollment_id: string;
  requirement_id: string;
  status: EvidenceStatus;
  document_url: string | null;
  verified_by: string | null;
  verified_at: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
