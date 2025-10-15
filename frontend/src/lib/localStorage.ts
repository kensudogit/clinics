// ローカルストレージ管理機能
// オフライン対応とデータ永続化を提供する

interface StoredData {
  data: any;
  timestamp: string;
  version: string;
}

interface PendingData {
  key: string;
  timestamp: string;
  retryCount: number;
}

// データバージョン管理
const DATA_VERSION = '1.0.0';

// ストレージキーの定数
const STORAGE_KEYS = {
  BOOKINGS: 'clinics_bookings',
  QUESTIONNAIRES: 'clinics_questionnaires',
  CONSULTATIONS: 'clinics_consultations',
  MEDICAL_RECORDS: 'clinics_medical_records',
  VITAL_SIGNS: 'clinics_vital_signs',
  PRESCRIPTIONS: 'clinics_prescriptions',
  PENDING_DATA: 'clinics_pending_data',
  USER_PREFERENCES: 'clinics_user_preferences',
  CACHE: 'clinics_cache',
} as const;

// クリニックデータ管理クラス
export class ClinicsDataManager {
  // データを保存
  static saveData<T>(key: string, data: T): void {
    try {
      const storedData: StoredData = {
        data,
        timestamp: new Date().toISOString(),
        version: DATA_VERSION,
      };
      
      localStorage.setItem(key, JSON.stringify(storedData));
    } catch (error) {
      console.error(`データの保存に失敗: ${key}`, error);
    }
  }

  // データを取得
  static getData<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const storedData: StoredData = JSON.parse(stored);
      
      // バージョンチェック
      if (storedData.version !== DATA_VERSION) {
        console.warn(`データバージョンが異なります: ${key}`);
        return null;
      }

      return storedData.data;
    } catch (error) {
      console.error(`データの取得に失敗: ${key}`, error);
      return null;
    }
  }

  // データを削除
  static removeData(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`データの削除に失敗: ${key}`, error);
    }
  }

  // データの存在確認
  static hasData(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  // 予約データの管理
  static saveBookingData(bookingId: string, data: any): void {
    const bookings = this.getBookingData();
    bookings[bookingId] = {
      ...data,
      id: bookingId,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData(STORAGE_KEYS.BOOKINGS, bookings);
  }

  static getBookingData(): Record<string, any> {
    return this.getData(STORAGE_KEYS.BOOKINGS) || {};
  }

  static getBookingById(bookingId: string): any {
    const bookings = this.getBookingData();
    return bookings[bookingId] || null;
  }

  // 問診データの管理
  static saveQuestionnaireData(questionnaireId: string, data: any): void {
    const questionnaires = this.getQuestionnaireData();
    questionnaires[questionnaireId] = {
      ...data,
      id: questionnaireId,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData(STORAGE_KEYS.QUESTIONNAIRES, questionnaires);
  }

  static getQuestionnaireData(): Record<string, any> {
    return this.getData(STORAGE_KEYS.QUESTIONNAIRES) || {};
  }

  static getQuestionnaireById(questionnaireId: string): any {
    const questionnaires = this.getQuestionnaireData();
    return questionnaires[questionnaireId] || null;
  }

  // 診療データの管理
  static saveConsultationData(consultationId: string, data: any): void {
    const consultations = this.getConsultationData();
    consultations[consultationId] = {
      ...data,
      id: consultationId,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData(STORAGE_KEYS.CONSULTATIONS, consultations);
  }

  static getConsultationData(): Record<string, any> {
    return this.getData(STORAGE_KEYS.CONSULTATIONS) || {};
  }

  static getConsultationById(consultationId: string): any {
    const consultations = this.getConsultationData();
    return consultations[consultationId] || null;
  }

  // 診療記録データの管理
  static saveMedicalRecordData(recordId: string, data: any): void {
    const records = this.getMedicalRecordData();
    records[recordId] = {
      ...data,
      id: recordId,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData(STORAGE_KEYS.MEDICAL_RECORDS, records);
  }

  static getMedicalRecordData(): Record<string, any> {
    return this.getData(STORAGE_KEYS.MEDICAL_RECORDS) || {};
  }

  static getMedicalRecordById(recordId: string): any {
    const records = this.getMedicalRecordData();
    return records[recordId] || null;
  }

  // バイタルサイン履歴の管理
  static saveVitalSignsHistory(patientId: string, vitals: any): void {
    const history = this.getVitalSignsHistory(patientId);
    const newEntry = {
      ...vitals,
      id: `vital_${Date.now()}`,
      recordedAt: new Date().toISOString(),
    };
    
    history.push(newEntry);
    
    // 最新100件のみ保持
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.saveData(`${STORAGE_KEYS.VITAL_SIGNS}_${patientId}`, history);
  }

  static getVitalSignsHistory(patientId: string): any[] {
    return this.getData(`${STORAGE_KEYS.VITAL_SIGNS}_${patientId}`) || [];
  }

  // 処方箋履歴の管理
  static savePrescriptionHistory(patientId: string, prescription: any): void {
    const history = this.getPrescriptionHistory(patientId);
    const newEntry = {
      ...prescription,
      id: `prescription_${Date.now()}`,
      prescribedAt: new Date().toISOString(),
    };
    
    history.push(newEntry);
    
    // 最新50件のみ保持
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.saveData(`${STORAGE_KEYS.PRESCRIPTIONS}_${patientId}`, history);
  }

  static getPrescriptionHistory(patientId: string): any[] {
    return this.getData(`${STORAGE_KEYS.PRESCRIPTIONS}_${patientId}`) || [];
  }

  // オフライン対応の管理
  static markDataAsPending(key: string): void {
    const pendingData = this.getPendingDataKeys();
    const pendingEntry: PendingData = {
      key,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    
    pendingData.push(pendingEntry);
    this.saveData(STORAGE_KEYS.PENDING_DATA, pendingData);
  }

  static getPendingDataKeys(): PendingData[] {
    return this.getData(STORAGE_KEYS.PENDING_DATA) || [];
  }

  static removePendingDataKey(key: string): void {
    const pendingData = this.getPendingDataKeys();
    const filtered = pendingData.filter(item => item.key !== key);
    this.saveData(STORAGE_KEYS.PENDING_DATA, filtered);
  }

  static incrementRetryCount(key: string): void {
    const pendingData = this.getPendingDataKeys();
    const item = pendingData.find(p => p.key === key);
    if (item) {
      item.retryCount++;
      this.saveData(STORAGE_KEYS.PENDING_DATA, pendingData);
    }
  }

  // ユーザー設定の管理
  static saveUserPreferences(preferences: any): void {
    this.saveData(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  static getUserPreferences(): any {
    return this.getData(STORAGE_KEYS.USER_PREFERENCES) || {};
  }

  // キャッシュの管理
  static saveCache(key: string, data: any, ttl: number = 300000): void { // デフォルト5分
    const cacheData = {
      data,
      timestamp: new Date().toISOString(),
      ttl,
    };
    this.saveData(`${STORAGE_KEYS.CACHE}_${key}`, cacheData);
  }

  static getCache(key: string): any | null {
    const cacheData = this.getData(`${STORAGE_KEYS.CACHE}_${key}`) as { data: any; timestamp: string; ttl: number } | null;
    if (!cacheData) return null;

    const now = new Date().getTime();
    const cacheTime = new Date(cacheData.timestamp).getTime();
    
    if (now - cacheTime > cacheData.ttl) {
      this.removeData(`${STORAGE_KEYS.CACHE}_${key}`);
      return null;
    }

    return cacheData.data;
  }

  // ストレージのクリーンアップ
  static cleanup(): void {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const allKeys = Object.keys(localStorage);
      
      // クリニック関連のキーのみをクリーンアップ
      const clinicKeys = allKeys.filter(key => 
        keys.some(storageKey => key.startsWith(storageKey))
      );
      
      clinicKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`クリーンアップ完了: ${clinicKeys.length}件のデータを削除`);
    } catch (error) {
      console.error('クリーンアップに失敗:', error);
    }
  }

  // ストレージ使用量の確認
  static getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      const keys = Object.values(STORAGE_KEYS);
      
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          used += data.length;
        }
      });

      // ブラウザのストレージ制限を推定（通常5-10MB）
      const total = 5 * 1024 * 1024; // 5MB
      const percentage = (used / total) * 100;

      return {
        used,
        total,
        percentage: Math.min(percentage, 100),
      };
    } catch (error) {
      console.error('ストレージ使用量の取得に失敗:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  // データのエクスポート
  static exportData(): string {
    try {
      const exportData: Record<string, any> = {};
      const keys = Object.values(STORAGE_KEYS);
      
      keys.forEach(key => {
        const data = this.getData(key);
        if (data) {
          exportData[key] = data;
        }
      });

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('データのエクスポートに失敗:', error);
      return '';
    }
  }

  // データのインポート
  static importData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      Object.keys(importData).forEach(key => {
        this.saveData(key, importData[key]);
      });

      console.log('データのインポートが完了しました');
      return true;
    } catch (error) {
      console.error('データのインポートに失敗:', error);
      return false;
    }
  }
}

// デフォルトエクスポート
export default ClinicsDataManager;