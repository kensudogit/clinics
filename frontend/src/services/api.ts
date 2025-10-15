import { API_CONFIG, API_ENDPOINTS } from '../lib/constants';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Clinic,
  CreateClinicRequest,
  UpdateClinicRequest,
  Doctor,
  CreateDoctorRequest,
  Patient,
  CreatePatientRequest,
  Appointment,
  CreateAppointmentRequest,
  ElectronicMedicalRecord,
  CreateMedicalRecordRequest,
  PaginatedResponse,
  ApiResponse,
} from '../types';

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private useMockData: boolean = true; // モックデータを使用（Vercelデプロイ用）

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // モックデータを使用する場合
    if (this.useMockData) {
      return this.getMockData<T>(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async getMockData<T>(endpoint: string, options: RequestInit): Promise<T> {
    // モックデータの生成
    const mockData = this.generateMockData(endpoint, options);
    
    // 実際のAPIリクエストをシミュレートするための遅延
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockData as T;
  }

  private generateMockData(endpoint: string, options: RequestInit): any {
    // オンライン診療のモックデータ
    if (endpoint.includes('/online_consultations/')) {
      return {
        id: 'consultation-001',
        clinic_id: 'clinic-001',
        doctor_id: 'doctor-001',
        patient_id: 'patient-001',
        consultation_type: 'video',
        status: 'scheduled',
        scheduled_at: new Date().toISOString(),
        meeting_room_id: 'room-001',
        consultation_notes: '初回オンライン診療',
        vital_signs: {
          blood_pressure: '120/80',
          heart_rate: 72,
          temperature: 36.5,
          oxygen_saturation: 98,
          recorded_at: new Date().toISOString()
        },
        prescriptions: [
          {
            medication_name: 'アセトアミノフェン',
            dosage: '500mg',
            frequency: '1日3回',
            duration: '7日間',
            instructions: '食後に服用',
            prescribed_at: new Date().toISOString()
          }
        ],
        doctor: {
          id: 'doctor-001',
          full_name: '田中太郎',
          specialization: '内科'
        },
        patient: {
          id: 'patient-001',
          full_name: '山田花子',
          date_of_birth: '1985-03-15'
        }
      };
    }

    // 電子カルテのモックデータ
    if (endpoint.includes('/electronic_medical_records/')) {
      return {
        id: 'record-001',
        clinic_id: 'clinic-001',
        patient_id: 'patient-001',
        doctor_id: 'doctor-001',
        record_type: 'consultation',
        status: 'draft',
        chief_complaint: '頭痛と発熱',
        present_illness: '3日前から頭痛が続き、昨日から発熱',
        past_history: '特になし',
        family_history: '父親が高血圧',
        social_history: '喫煙なし、飲酒は月1-2回',
        physical_examination: '体温37.8℃、血圧120/80、脈拍72',
        assessment: '風邪の疑い',
        plan: '解熱鎮痛剤の処方、安静、水分補給',
        vital_signs: {
          blood_pressure: '120/80',
          heart_rate: 72,
          temperature: 37.8,
          oxygen_saturation: 98,
          recorded_at: new Date().toISOString()
        },
        medications: [
          {
            medication_name: 'アセトアミノフェン',
            dosage: '500mg',
            frequency: '1日3回',
            duration: '7日間',
            instructions: '食後に服用',
            prescribed_at: new Date().toISOString()
          }
        ],
        allergies: [
          {
            substance: 'ペニシリン',
            reaction: '発疹',
            severity: 'mild'
          }
        ],
        follow_up_plan: '1週間後に再診',
        icd10_codes: 'J06.9',
        doctor: {
          id: 'doctor-001',
          full_name: '田中太郎',
          specialization: '内科'
        },
        patient: {
          id: 'patient-001',
          full_name: '山田花子',
          date_of_birth: '1985-03-15'
        }
      };
    }

    // 患者の診療記録一覧のモックデータ
    if (endpoint.includes('/patients/') && endpoint.includes('/medical_records')) {
      return [
        {
          id: 'record-001',
          record_type: 'consultation',
          status: 'signed',
          chief_complaint: '頭痛と発熱',
          assessment: '風邪の疑い',
          created_at: new Date().toISOString(),
          doctor: {
            full_name: '田中太郎'
          }
        },
        {
          id: 'record-002',
          record_type: 'follow_up',
          status: 'draft',
          chief_complaint: '定期健診',
          assessment: '健康状態良好',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          doctor: {
            full_name: '田中太郎'
          }
        }
      ];
    }

    // デフォルトのモックデータ
    return {
      id: 'mock-id',
      message: 'Mock data generated',
      timestamp: new Date().toISOString()
    };
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Clinic methods
  async getClinics(): Promise<PaginatedResponse<Clinic>> {
    return this.request<PaginatedResponse<Clinic>>(API_ENDPOINTS.CLINICS.LIST);
  }

  async getClinic(id: string): Promise<Clinic> {
    return this.request<Clinic>(API_ENDPOINTS.CLINICS.DETAIL(id));
  }

  async createClinic(data: CreateClinicRequest): Promise<Clinic> {
    return this.request<Clinic>(API_ENDPOINTS.CLINICS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClinic(id: string, data: UpdateClinicRequest): Promise<Clinic> {
    return this.request<Clinic>(API_ENDPOINTS.CLINICS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteClinic(id: string): Promise<void> {
    await this.request(API_ENDPOINTS.CLINICS.DELETE(id), { method: 'DELETE' });
  }

  // Doctor methods
  async getDoctors(clinicId: string): Promise<PaginatedResponse<Doctor>> {
    return this.request<PaginatedResponse<Doctor>>(API_ENDPOINTS.DOCTORS.LIST(clinicId));
  }

  async getDoctor(clinicId: string, id: string): Promise<Doctor> {
    return this.request<Doctor>(API_ENDPOINTS.DOCTORS.DETAIL(clinicId, id));
  }

  async createDoctor(clinicId: string, data: CreateDoctorRequest): Promise<Doctor> {
    return this.request<Doctor>(API_ENDPOINTS.DOCTORS.CREATE(clinicId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctor(clinicId: string, id: string, data: Partial<CreateDoctorRequest>): Promise<Doctor> {
    return this.request<Doctor>(API_ENDPOINTS.DOCTORS.UPDATE(clinicId, id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDoctor(clinicId: string, id: string): Promise<void> {
    await this.request(API_ENDPOINTS.DOCTORS.DELETE(clinicId, id), { method: 'DELETE' });
  }

  // Patient methods
  async getPatients(clinicId: string): Promise<PaginatedResponse<Patient>> {
    return this.request<PaginatedResponse<Patient>>(API_ENDPOINTS.PATIENTS.LIST(clinicId));
  }

  async getPatient(clinicId: string, id: string): Promise<Patient> {
    return this.request<Patient>(API_ENDPOINTS.PATIENTS.DETAIL(clinicId, id));
  }

  async createPatient(clinicId: string, data: CreatePatientRequest): Promise<Patient> {
    return this.request<Patient>(API_ENDPOINTS.PATIENTS.CREATE(clinicId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(clinicId: string, id: string, data: Partial<CreatePatientRequest>): Promise<Patient> {
    return this.request<Patient>(API_ENDPOINTS.PATIENTS.UPDATE(clinicId, id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePatient(clinicId: string, id: string): Promise<void> {
    await this.request(API_ENDPOINTS.PATIENTS.DELETE(clinicId, id), { method: 'DELETE' });
  }

  // Appointment methods
  async getAppointments(clinicId: string): Promise<PaginatedResponse<Appointment>> {
    return this.request<PaginatedResponse<Appointment>>(API_ENDPOINTS.APPOINTMENTS.LIST(clinicId));
  }

  async getAppointment(clinicId: string, id: string): Promise<Appointment> {
    return this.request<Appointment>(API_ENDPOINTS.APPOINTMENTS.DETAIL(clinicId, id));
  }

  async createAppointment(clinicId: string, data: CreateAppointmentRequest): Promise<Appointment> {
    return this.request<Appointment>(API_ENDPOINTS.APPOINTMENTS.CREATE(clinicId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(clinicId: string, id: string, data: Partial<CreateAppointmentRequest>): Promise<Appointment> {
    return this.request<Appointment>(API_ENDPOINTS.APPOINTMENTS.UPDATE(clinicId, id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(clinicId: string, id: string): Promise<void> {
    await this.request(API_ENDPOINTS.APPOINTMENTS.DELETE(clinicId, id), { method: 'DELETE' });
  }

  // Electronic Medical Record methods
  async getElectronicMedicalRecords(clinicId: string): Promise<PaginatedResponse<ElectronicMedicalRecord>> {
    return this.request<PaginatedResponse<ElectronicMedicalRecord>>(
      API_ENDPOINTS.MEDICAL_RECORDS.LIST(clinicId)
    );
  }

  async getElectronicMedicalRecord(clinicId: string, recordId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/electronic_medical_records/${recordId}`);
  }

  async createElectronicMedicalRecord(clinicId: string, data: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/electronic_medical_records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateElectronicMedicalRecord(clinicId: string, recordId: string, data: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/electronic_medical_records/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async signElectronicMedicalRecord(clinicId: string, recordId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/electronic_medical_records/${recordId}/sign`, {
      method: 'POST',
    });
  }

  async getPatientMedicalRecords(clinicId: string, patientId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/patients/${patientId}/medical_records`);
  }

  // Web Booking methods
  async getAvailability(clinicId: string, doctorId: string, date: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/availability?doctor_id=${doctorId}&date=${date}`);
  }

  async createWebBooking(clinicId: string, data: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/web_bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWebBookings(clinicId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/web_bookings`);
  }

  async updateWebBooking(clinicId: string, bookingId: string, data: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/web_bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Web Questionnaire methods
  async createWebQuestionnaire(clinicId: string, data: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/web_questionnaires`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWebQuestionnaires(clinicId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/web_questionnaires`);
  }

  async getWebQuestionnaire(clinicId: string, questionnaireId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/web_questionnaires/${questionnaireId}`);
  }

  // Online Consultation methods
  async createOnlineConsultation(clinicId: string, data: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOnlineConsultations(clinicId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations`);
  }

  async getOnlineConsultation(clinicId: string, consultationId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}`);
  }

  async updateOnlineConsultation(clinicId: string, consultationId: string, data: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async startOnlineConsultation(clinicId: string, consultationId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}/start`, {
      method: 'POST',
    });
  }

  async endOnlineConsultation(clinicId: string, consultationId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}/end`, {
      method: 'POST',
    });
  }

  async startConsultation(clinicId: string, consultationId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}/start`, {
      method: 'POST',
    });
  }

  async endConsultation(clinicId: string, consultationId: string, notes: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}/end`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async recordVitalSigns(clinicId: string, consultationId: string, vitals: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}/vital_signs`, {
      method: 'POST',
      body: JSON.stringify(vitals),
    });
  }

  // Prescription methods
  async createPrescription(clinicId: string, consultationId: string, prescription: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}/prescriptions`, {
      method: 'POST',
      body: JSON.stringify({ prescription }),
    });
  }

  async addPrescription(clinicId: string, consultationId: string, prescription: any): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.CLINICS.DETAIL(clinicId)}/online_consultations/${consultationId}/prescriptions`, {
      method: 'POST',
      body: JSON.stringify(prescription),
    });
  }

  // Analytics methods
  async getAnalytics(clinicId: string, params: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`${API_ENDPOINTS.ANALYTICS.DASHBOARD}?clinic_id=${clinicId}&${queryString}`);
  }

  async getRealtimeAnalytics(clinicId: string): Promise<any> {
    return this.request<any>(`${API_ENDPOINTS.ANALYTICS.DASHBOARD}/realtime?clinic_id=${clinicId}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<ApiResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.HEALTH);
  }
}

export const apiService = new ApiService();
export default apiService;