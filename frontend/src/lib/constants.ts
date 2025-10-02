// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  CLINICS: {
    LIST: '/clinics',
    CREATE: '/clinics',
    DETAIL: (id: string) => `/clinics/${id}`,
    UPDATE: (id: string) => `/clinics/${id}`,
    DELETE: (id: string) => `/clinics/${id}`,
  },
  DOCTORS: {
    LIST: (clinicId: string) => `/clinics/${clinicId}/doctors`,
    CREATE: (clinicId: string) => `/clinics/${clinicId}/doctors`,
    DETAIL: (clinicId: string, id: string) => `/clinics/${clinicId}/doctors/${id}`,
    UPDATE: (clinicId: string, id: string) => `/clinics/${clinicId}/doctors/${id}`,
    DELETE: (clinicId: string, id: string) => `/clinics/${clinicId}/doctors/${id}`,
  },
  PATIENTS: {
    LIST: (clinicId: string) => `/clinics/${clinicId}/patients`,
    CREATE: (clinicId: string) => `/clinics/${clinicId}/patients`,
    DETAIL: (clinicId: string, id: string) => `/clinics/${clinicId}/patients/${id}`,
    UPDATE: (clinicId: string, id: string) => `/clinics/${clinicId}/patients/${id}`,
    DELETE: (clinicId: string, id: string) => `/clinics/${clinicId}/patients/${id}`,
  },
  APPOINTMENTS: {
    LIST: (clinicId: string) => `/clinics/${clinicId}/appointments`,
    CREATE: (clinicId: string) => `/clinics/${clinicId}/appointments`,
    DETAIL: (clinicId: string, id: string) => `/clinics/${clinicId}/appointments/${id}`,
    UPDATE: (clinicId: string, id: string) => `/clinics/${clinicId}/appointments/${id}`,
    DELETE: (clinicId: string, id: string) => `/clinics/${clinicId}/appointments/${id}`,
  },
  MEDICAL_RECORDS: {
    LIST: (clinicId: string) => `/clinics/${clinicId}/medical_records`,
    CREATE: (clinicId: string) => `/clinics/${clinicId}/medical_records`,
    DETAIL: (clinicId: string, id: string) => `/clinics/${clinicId}/medical_records/${id}`,
    UPDATE: (clinicId: string, id: string) => `/clinics/${clinicId}/medical_records/${id}`,
    DELETE: (clinicId: string, id: string) => `/clinics/${clinicId}/medical_records/${id}`,
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REPORTS: '/analytics/reports',
    STATISTICS: '/analytics/statistics',
  },
  SEARCH: '/search',
  HEALTH: '/health',
} as const;
