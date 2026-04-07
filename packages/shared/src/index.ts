// ─── Enums ────────────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'DOCTOR' | 'STAFF';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type BillingStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface UserPayload {
  id: string;
  clinicId: string;
  username: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  user: UserPayload;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  statusCode?: number;
}
