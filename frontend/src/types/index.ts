// Type definitions for the application

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'doctor' | 'patient';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  full_name?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  license_number: string;
  status: 'active' | 'inactive' | 'suspended';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  clinic_id: string;
  user_id: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  status: 'active' | 'inactive' | 'on_leave';
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Patient {
  id: string;
  clinic_id: string;
  user_id: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  user?: User;
  age?: number;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface MedicalRecord {
  id: string;
  clinic_id: string;
  doctor_id: string;
  patient_id: string;
  diagnosis: string;
  treatment: string;
  medications?: string;
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'doctor' | 'patient';
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface CreateClinicRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  license_number: string;
}

export interface UpdateClinicRequest extends Partial<CreateClinicRequest> {
  status?: 'active' | 'inactive' | 'suspended';
}

export interface CreateDoctorRequest {
  user_id: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
}

export interface CreatePatientRequest {
  user_id: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export interface CreateAppointmentRequest {
  doctor_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  notes?: string;
}

export interface CreateMedicalRecordRequest {
  doctor_id: string;
  patient_id: string;
  diagnosis: string;
  treatment: string;
  medications?: string;
  notes?: string;
  follow_up_date?: string;
}
