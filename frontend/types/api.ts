// ── Auth ──

export interface RegisterRequest {
  email: string;
  password: string;
  role: "LANDLORD" | "TENANT";
  full_name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  id_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserResponse;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: "LANDLORD" | "TENANT" | "ADMIN";
  created_at: string;
}

export interface MessageResponse {
  detail: string;
}

// ── Properties ──

export interface PropertyCreate {
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  bedrooms?: number;
  bathrooms?: number;
  monthly_rent?: number;
  description?: string;
}

export interface PropertyUpdate {
  address_line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  bedrooms?: number;
  bathrooms?: number;
  monthly_rent?: number;
  description?: string;
  status?: "VACANT" | "LISTED" | "OCCUPIED";
}

export interface PropertyResponse {
  id: string;
  landlord_id: string;
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number | null;
  bathrooms: number | null;
  monthly_rent: number | null;
  description: string | null;
  ai_optimized_description: string | null;
  status: "VACANT" | "LISTED" | "OCCUPIED";
  listed_at: string | null;
  photos: string[];
  application_count: number;
}

export interface PropertyListResponse {
  items: PropertyResponse[];
  total: number;
}

export interface PropertySearchResponse {
  items: PropertyResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface PhotoUploadResponse {
  upload_url: string;
  s3_key: string;
}

export interface PhotoConfirmRequest {
  s3_key: string;
}

export interface OptimizedListingResponse {
  description: string;
  suggested_price: number;
  tags: string[];
}

// ── Applications ──

export interface ApplicationCreate {
  property_id: string;
}

export interface ApplicationStatusUpdate {
  status: "APPROVED" | "REJECTED";
}

export interface ApplicationResponse {
  id: string;
  property_id: string;
  tenant_id: string;
  status:
    | "SUBMITTED"
    | "SCREENING"
    | "SCORED"
    | "APPROVED"
    | "REJECTED"
    | "WITHDRAWN";
  qualification_score: number | null;
  screening_report_url: string | null;
  smartmove_order_id: string | null;
  landlord_notes: string | null;
  submitted_at: string;
  screened_at: string | null;
  decided_at: string | null;
  score_explanation?: string | null;
}

export interface ApplicationListResponse {
  items: ApplicationResponse[];
  total: number;
}

export interface ScreeningResponse {
  smartmove_order_id: string;
  payment_url: string;
}

// ── Viewings ──

export interface ViewingCreate {
  application_id: string;
  scheduled_at: string;
}

export interface ViewingStatusUpdate {
  status: "COMPLETED" | "CANCELLED" | "NO_SHOW";
  landlord_notes?: string;
}

export interface ViewingResponse {
  id: string;
  application_id: string;
  scheduled_at: string;
  google_event_id: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  landlord_notes: string | null;
}

export interface ViewingListResponse {
  items: ViewingResponse[];
  total: number;
}

// ─��� Leases ──

export interface LeaseCreate {
  application_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
}

export interface LeaseResponse {
  id: string;
  application_id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  docusign_envelope_id: string | null;
  status: "DRAFT" | "SENT" | "SIGNED" | "ACTIVE" | "TERMINATED";
  signed_lease_url: string | null;
}

export interface LeaseDownloadResponse {
  download_url: string;
}
