export type AppointmentStatus =
  | 'proposed'
  | 'pending_confirmation'
  | 'confirmed'
  | 'cancelled'
  | 'failed'

export type HandoffStatus = 'not_required' | 'pending' | 'sent' | 'acknowledged'

export type AppointmentListTab =
  | 'upcoming'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'

export type AppointmentSortField = 'title' | 'status' | 'starts_at' | 'created_at'

export type SortDirection = 'asc' | 'desc'

export interface Appointment {
  id: string
  organization_id: string
  lead_id: string
  conversation_id: string
  campaign_id: string
  created_by_id: string | null
  status: AppointmentStatus
  title: string
  description: string | null
  attendee_email: string | null
  attendee_name: string | null
  starts_at: string
  ends_at: string
  timezone: string
  google_event_id: string | null
  google_calendar_id: string | null
  google_event_link: string | null
  agent_metadata: Record<string, unknown>
  handoff_status: HandoffStatus
  handoff_payload: Record<string, unknown> | null
  handed_off_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface AvailabilitySlot {
  starts_at: string
  ends_at: string
  timezone: string
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[]
  total: number
}

export interface PaginatedAppointmentsResponse {
  items: Appointment[]
  total: number
  limit: number
  offset: number
}

export interface AppointmentListParams {
  lead_id?: string
  conversation_id?: string
  status?: AppointmentStatus
  limit?: number
  offset?: number
}

export interface AppointmentCreateRequest {
  starts_at: string
  ends_at: string
  attendee_email?: string | null
  attendee_name?: string | null
  title?: string | null
  description?: string | null
  timezone?: string
  confirm_immediately?: boolean
}

export interface AppointmentProposeRequest {
  attendee_email?: string | null
  attendee_name?: string | null
  duration_minutes?: number
  timezone?: string
  notes?: string | null
}

export type GoogleCalendarConnectionStatus = 'active' | 'expired' | 'revoked'

export interface GoogleCalendarStatus {
  connected: boolean
  status?: GoogleCalendarConnectionStatus | null
  google_email?: string | null
  calendar_id?: string | null
  scopes: string[]
}

export interface GoogleCalendarConnectResponse {
  authorization_url: string
}
