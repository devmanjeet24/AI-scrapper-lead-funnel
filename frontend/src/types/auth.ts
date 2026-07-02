export interface OrganizationSummary {
  id: string
  name: string
}

export interface User {
  id: string
  organization_id: string
  full_name: string
  email: string
  is_active: boolean
  created_at: string
  organization: OrganizationSummary
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  organization_name: string
  full_name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}
