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
  MedicalRecord,
  CreateMedicalRecordRequest,
  PaginatedResponse,
  ApiResponse,
} from '../types';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    
    this.setToken(response.token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
    } finally {
      this.clearToken();
    }
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
    return this.request<PaginatedResponse<Doctor>>(
      API_ENDPOINTS.DOCTORS.LIST(clinicId)
    );
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
    return this.request<PaginatedResponse<Patient>>(
      API_ENDPOINTS.PATIENTS.LIST(clinicId)
    );
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
    return this.request<PaginatedResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.LIST(clinicId)
    );
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

  // Medical Record methods
  async getMedicalRecords(clinicId: string): Promise<PaginatedResponse<MedicalRecord>> {
    return this.request<PaginatedResponse<MedicalRecord>>(
      API_ENDPOINTS.MEDICAL_RECORDS.LIST(clinicId)
    );
  }

  async getMedicalRecord(clinicId: string, id: string): Promise<MedicalRecord> {
    return this.request<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(clinicId, id));
  }

  async createMedicalRecord(clinicId: string, data: CreateMedicalRecordRequest): Promise<MedicalRecord> {
    return this.request<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.CREATE(clinicId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMedicalRecord(clinicId: string, id: string, data: Partial<CreateMedicalRecordRequest>): Promise<MedicalRecord> {
    return this.request<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.UPDATE(clinicId, id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMedicalRecord(clinicId: string, id: string): Promise<void> {
    await this.request(API_ENDPOINTS.MEDICAL_RECORDS.DELETE(clinicId, id), { method: 'DELETE' });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<ApiResponse<{ status: string; timestamp: string }>>(
      API_ENDPOINTS.HEALTH
    );
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
