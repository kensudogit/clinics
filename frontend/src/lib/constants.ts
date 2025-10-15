// 定数定義
// アプリケーション全体で使用される定数

// API設定
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// APIエンドポイント
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
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
    LIST: (clinicId: string) => `/clinics/${clinicId}/medical-records`,
    CREATE: (clinicId: string) => `/clinics/${clinicId}/medical-records`,
    DETAIL: (clinicId: string, id: string) => `/clinics/${clinicId}/medical-records/${id}`,
    UPDATE: (clinicId: string, id: string) => `/clinics/${clinicId}/medical-records/${id}`,
    DELETE: (clinicId: string, id: string) => `/clinics/${clinicId}/medical-records/${id}`,
  },
  ANALYTICS: {
    DASHBOARD: '/analytics',
    REALTIME: '/analytics/realtime',
    REPORTS: '/analytics/reports',
  },
  HEALTH: '/health',
} as const;

// ユーザーロール
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// 診療ステータス
export const CONSULTATION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ConsultationStatus = typeof CONSULTATION_STATUS[keyof typeof CONSULTATION_STATUS];

// 診療タイプ
export const CONSULTATION_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  CHAT: 'chat',
} as const;

export type ConsultationType = typeof CONSULTATION_TYPES[keyof typeof CONSULTATION_TYPES];

// 予約ステータス
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// 診療記録ステータス
export const MEDICAL_RECORD_STATUS = {
  DRAFT: 'draft',
  SIGNED: 'signed',
  LOCKED: 'locked',
} as const;

export type MedicalRecordStatus = typeof MEDICAL_RECORD_STATUS[keyof typeof MEDICAL_RECORD_STATUS];

// 性別
export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export type Gender = typeof GENDERS[keyof typeof GENDERS];

// 症状の重症度
export const SYMPTOM_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe',
} as const;

export type SymptomSeverity = typeof SYMPTOM_SEVERITY[keyof typeof SYMPTOM_SEVERITY];

// アレルギーの重症度
export const ALLERGY_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe',
} as const;

export type AllergySeverity = typeof ALLERGY_SEVERITY[keyof typeof ALLERGY_SEVERITY];

// 運動レベル
export const EXERCISE_LEVELS = {
  NONE: 'none',
  LIGHT: 'light',
  MODERATE: 'moderate',
  INTENSE: 'intense',
} as const;

export type ExerciseLevel = typeof EXERCISE_LEVELS[keyof typeof EXERCISE_LEVELS];

// 問診タイプ
export const QUESTIONNAIRE_TYPES = {
  INITIAL: 'initial',
  FOLLOW_UP: 'follow_up',
  SPECIALIZED: 'specialized',
} as const;

export type QuestionnaireType = typeof QUESTIONNAIRE_TYPES[keyof typeof QUESTIONNAIRE_TYPES];

// 診療記録タイプ
export const MEDICAL_RECORD_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency',
} as const;

export type MedicalRecordType = typeof MEDICAL_RECORD_TYPES[keyof typeof MEDICAL_RECORD_TYPES];

// 通知タイプ
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// アラートタイプ
export const ALERT_TYPES = {
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
  INFO: 'info',
} as const;

export type AlertType = typeof ALERT_TYPES[keyof typeof ALERT_TYPES];

// テーマ
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

// 言語
export const LANGUAGES = {
  JAPANESE: 'ja',
  ENGLISH: 'en',
} as const;

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

// ファイルタイプ
export const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

// 許可されるファイル拡張子
export const ALLOWED_FILE_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  DOCUMENT: ['.pdf', '.doc', '.docx', '.txt'],
  VIDEO: ['.mp4', '.avi', '.mov', '.wmv'],
  AUDIO: ['.mp3', '.wav', '.m4a', '.aac'],
} as const;

// ファイルサイズ制限（バイト）
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 20 * 1024 * 1024, // 20MB
} as const;

// 診療時間のオプション（分）
export const CONSULTATION_DURATIONS = [
  15,
  30,
  45,
  60,
  90,
  120,
] as const;

// 診療料金（円）
export const CONSULTATION_FEES = {
  VIDEO: 3000,
  AUDIO: 2500,
  CHAT: 2000,
  BASE_DURATION: 30,
  ADDITIONAL_FEE_PER_15MIN: 1000,
} as const;

// 営業時間のデフォルト
export const DEFAULT_BUSINESS_HOURS = {
  start: '09:00',
  end: '18:00',
  is_open: true,
} as const;

// 曜日
export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

// 曜日の日本語表示
export const WEEKDAY_LABELS = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
} as const;

// 時間スロット（15分間隔）
export const TIME_SLOTS = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
] as const;

// 専門分野
export const SPECIALIZATIONS = [
  '内科',
  '外科',
  '小児科',
  '産婦人科',
  '眼科',
  '耳鼻咽喉科',
  '皮膚科',
  '泌尿器科',
  '整形外科',
  '精神科',
  '循環器内科',
  '消化器内科',
  '呼吸器内科',
  '神経内科',
  '内分泌内科',
  '腎臓内科',
  '血液内科',
  '腫瘍内科',
  'リハビリテーション科',
  '放射線科',
  '麻酔科',
  '病理診断科',
  '臨床検査科',
] as const;

// 症状の種類
export const SYMPTOM_TYPES = [
  '発熱',
  '咳',
  '頭痛',
  '胸痛',
  '腹痛',
  '倦怠感',
  '吐き気',
  '嘔吐',
  '下痢',
  '便秘',
  'めまい',
  '息切れ',
  '動悸',
  '不眠',
  '食欲不振',
  '体重減少',
  '体重増加',
  '関節痛',
  '筋肉痛',
  '皮膚の発疹',
  'その他',
] as const;

// 既往歴
export const MEDICAL_HISTORY_OPTIONS = [
  '高血圧',
  '糖尿病',
  '脂質異常症',
  '心疾患',
  '脳血管疾患',
  '腎疾患',
  '肝疾患',
  '喘息',
  'COPD',
  '甲状腺疾患',
  'がん',
  '精神疾患',
  'アレルギー',
  'その他',
] as const;

// 薬剤の服用頻度
export const MEDICATION_FREQUENCIES = [
  '1日1回',
  '1日2回',
  '1日3回',
  '1日4回',
  '1週間に1回',
  '1週間に2回',
  '1ヶ月に1回',
  '必要時のみ',
  'その他',
] as const;

// 薬剤の服用期間
export const MEDICATION_DURATIONS = [
  '1日',
  '3日',
  '1週間',
  '2週間',
  '1ヶ月',
  '3ヶ月',
  '6ヶ月',
  '1年',
  '継続',
  'その他',
] as const;

// リスクスコアの閾値
export const RISK_SCORE_THRESHOLDS = {
  LOW: 0,
  MEDIUM: 3,
  HIGH: 5,
} as const;

// ページネーション
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// キャッシュ時間（ミリ秒）
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5分
  MEDIUM: 30 * 60 * 1000, // 30分
  LONG: 60 * 60 * 1000, // 1時間
  VERY_LONG: 24 * 60 * 60 * 1000, // 24時間
} as const;

// リトライ設定
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_FACTOR: 2,
} as const;

// フォームバリデーション
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^0\d{9,10}$/,
  POSTAL_CODE: /^\d{3}-\d{4}$/,
  LICENSE_NUMBER: /^[A-Z0-9]{6,12}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  REQUIRED: 'この項目は必須です',
  INVALID_EMAIL: '有効なメールアドレスを入力してください',
  INVALID_PHONE: '有効な電話番号を入力してください',
  INVALID_POSTAL_CODE: '有効な郵便番号を入力してください（例：123-4567）',
  PASSWORD_TOO_SHORT: 'パスワードは8文字以上で入力してください',
  NAME_TOO_LONG: '名前は50文字以内で入力してください',
  DESCRIPTION_TOO_LONG: '説明は1000文字以内で入力してください',
  FILE_TOO_LARGE: 'ファイルサイズが大きすぎます',
  INVALID_FILE_TYPE: '無効なファイルタイプです',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  SERVER_ERROR: 'サーバーエラーが発生しました',
  UNAUTHORIZED: '認証が必要です',
  FORBIDDEN: 'アクセス権限がありません',
  NOT_FOUND: 'リソースが見つかりません',
  CONFLICT: 'データの競合が発生しました',
} as const;

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  SAVED: '保存しました',
  UPDATED: '更新しました',
  DELETED: '削除しました',
  CREATED: '作成しました',
  SENT: '送信しました',
  UPLOADED: 'アップロードしました',
  DOWNLOADED: 'ダウンロードしました',
  EXPORTED: 'エクスポートしました',
  IMPORTED: 'インポートしました',
} as const;

// ローカルストレージキー
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  CLINIC_SETTINGS: 'clinic_settings',
  CACHE_PREFIX: 'cache_',
  OFFLINE_DATA: 'offline_data',
} as const;

// デフォルトエクスポート
export default {
  API_CONFIG,
  API_ENDPOINTS,
  USER_ROLES,
  CONSULTATION_STATUS,
  CONSULTATION_TYPES,
  BOOKING_STATUS,
  MEDICAL_RECORD_STATUS,
  GENDERS,
  SYMPTOM_SEVERITY,
  ALLERGY_SEVERITY,
  EXERCISE_LEVELS,
  QUESTIONNAIRE_TYPES,
  MEDICAL_RECORD_TYPES,
  NOTIFICATION_TYPES,
  ALERT_TYPES,
  THEMES,
  LANGUAGES,
  FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  FILE_SIZE_LIMITS,
  CONSULTATION_DURATIONS,
  CONSULTATION_FEES,
  DEFAULT_BUSINESS_HOURS,
  WEEKDAYS,
  WEEKDAY_LABELS,
  TIME_SLOTS,
  SPECIALIZATIONS,
  SYMPTOM_TYPES,
  MEDICAL_HISTORY_OPTIONS,
  MEDICATION_FREQUENCIES,
  MEDICATION_DURATIONS,
  RISK_SCORE_THRESHOLDS,
  PAGINATION,
  CACHE_DURATION,
  RETRY_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
};