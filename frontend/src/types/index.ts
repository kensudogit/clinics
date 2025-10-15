// 型定義
// アプリケーション全体で使用されるTypeScript型定義

// 基本型
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// ユーザー関連
export interface User extends BaseEntity {
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin' | 'doctor' | 'patient';
  is_active: boolean;
  last_login_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'doctor' | 'patient';
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_at: string;
}

// クリニック関連
export interface Clinic extends BaseEntity {
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
  user?: User;
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

// 医師関連
export interface Doctor extends BaseEntity {
  user_id: string;
  clinic_id: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  education: string;
  certifications: string[];
  languages: string[];
  status: 'active' | 'inactive' | 'on_leave';
  user?: User;
  clinic?: Clinic;
}

export interface CreateDoctorRequest {
  user_id: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  education: string;
  certifications: string[];
  languages: string[];
}

// 患者関連
export interface Patient extends BaseEntity {
  user_id: string;
  clinic_id: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_history: string[];
  allergies: string[];
  status: 'active' | 'inactive';
  user?: User;
  clinic?: Clinic;
}

export interface CreatePatientRequest {
  user_id: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_history?: string[];
  allergies?: string[];
}

// 予約関連
export interface Appointment extends BaseEntity {
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  patient?: Patient;
  doctor?: Doctor;
  clinic?: Clinic;
}

export interface CreateAppointmentRequest {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  notes?: string;
}

// Web予約関連
export interface WebBooking extends BaseEntity {
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  consultation_type: 'video' | 'audio' | 'chat';
  status: 'pending' | 'confirmed' | 'cancelled';
  patient_notes?: string;
  patient?: Patient;
  doctor?: Doctor;
  clinic?: Clinic;
}

// Web問診関連
export interface WebQuestionnaire extends BaseEntity {
  patient_id: string;
  clinic_id: string;
  web_booking_id?: string;
  questionnaire_type: 'initial' | 'follow_up' | 'specialized';
  responses: QuestionnaireResponses;
  ai_analysis?: any;
  risk_score: number;
  patient?: Patient;
  clinic?: Clinic;
}

export interface QuestionnaireResponses {
  symptoms: Symptom[];
  medical_history: string[];
  medications: string[];
  allergies: Allergy[];
  lifestyle: LifestyleInfo;
}

export interface Symptom {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: number;
  description: string;
}

export interface Allergy {
  substance: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface LifestyleInfo {
  smoking: boolean;
  alcohol: boolean;
  exercise: 'none' | 'light' | 'moderate' | 'intense';
  sleep_hours: number;
}

// オンライン診療関連
export interface OnlineConsultation extends BaseEntity {
  clinic_id: string;
  doctor_id: string;
  patient_id: string;
  web_booking_id?: string;
  consultation_type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  meeting_room_id: string;
  consultation_notes?: string;
  vital_signs?: VitalSigns;
  prescriptions?: Prescription[];
  follow_up_instructions?: string[];
  technical_issues?: any;
  recording_url?: string;
  clinic?: Clinic;
  doctor?: Doctor;
  patient?: Patient;
  web_booking?: WebBooking;
}

export interface VitalSigns {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  recorded_at: string;
}

export interface Prescription {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  prescribed_at: string;
}

// 電子カルテ関連
export interface ElectronicMedicalRecord extends BaseEntity {
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  online_consultation_id?: string;
  record_type: 'consultation' | 'follow_up' | 'emergency';
  status: 'draft' | 'signed' | 'locked';
  chief_complaint: string;
  present_illness?: string;
  past_history?: string;
  family_history?: string;
  social_history?: string;
  physical_examination?: string;
  assessment: string;
  plan: string;
  vital_signs?: VitalSigns;
  medications?: Prescription[];
  allergies?: Allergy[];
  follow_up_plan?: string;
  icd10_codes?: string;
  signed_at?: string;
  signed_by?: string;
  clinic?: Clinic;
  patient?: Patient;
  doctor?: Doctor;
  online_consultation?: OnlineConsultation;
}

export interface CreateMedicalRecordRequest {
  patient_id: string;
  doctor_id: string;
  online_consultation_id?: string;
  record_type: 'consultation' | 'follow_up' | 'emergency';
  chief_complaint: string;
  present_illness?: string;
  past_history?: string;
  family_history?: string;
  social_history?: string;
  physical_examination?: string;
  assessment: string;
  plan: string;
  vital_signs?: VitalSigns;
  medications?: Prescription[];
  allergies?: Allergy[];
  follow_up_plan?: string;
  icd10_codes?: string;
}

// 分析・レポート関連
export interface AnalyticsData {
  revenue_data: RevenueData[];
  consultation_data: ConsultationData[];
  doctor_performance: DoctorPerformance[];
  consultation_types: ConsultationTypeData[];
  satisfaction_scores: SatisfactionScore[];
  alerts: Alert[];
}

export interface RevenueData {
  date: string;
  amount: number;
  consultation_count: number;
}

export interface ConsultationData {
  date: string;
  count: number;
  type: 'video' | 'audio' | 'chat';
}

export interface DoctorPerformance {
  doctor_id: string;
  name: string;
  consultations: number;
  revenue: number;
  satisfaction_score: number;
}

export interface ConsultationTypeData {
  type: 'video' | 'audio' | 'chat';
  count: number;
  percentage: number;
}

export interface SatisfactionScore {
  consultation_id: string;
  score: number;
  feedback?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

// API関連
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// フォーム関連
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: any;
}

// 通知関連
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

// 設定関連
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    data_sharing: boolean;
    analytics: boolean;
  };
}

export interface ClinicSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  business_hours: BusinessHours;
  consultation_fees: ConsultationFees;
  features: ClinicFeatures;
}

export interface BusinessHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  start: string;
  end: string;
  is_open: boolean;
}

export interface ConsultationFees {
  video: number;
  audio: number;
  chat: number;
  base_duration: number;
  additional_fee_per_15min: number;
}

export interface ClinicFeatures {
  online_consultation: boolean;
  web_booking: boolean;
  web_questionnaire: boolean;
  electronic_medical_record: boolean;
  analytics: boolean;
}

// ファイル関連
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

// 検索・フィルター関連
export interface SearchParams {
  query?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'number' | 'boolean';
  options?: { value: any; label: string }[];
}

// チャート・グラフ関連
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// カレンダー関連
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'appointment' | 'consultation' | 'meeting';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  color?: string;
}

// 統計関連
export interface Statistics {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  total_revenue: number;
  active_consultations: number;
  pending_bookings: number;
  today_appointments: number;
  monthly_growth: number;
}

// デフォルトエクスポート
export default {
  // 基本型は個別にエクスポート
};