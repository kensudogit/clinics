// ユーティリティ関数
// アプリケーション全体で使用される共通のヘルパー関数

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSSクラス名のマージ
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日付フォーマット関数
export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    case 'long':
      return d.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    case 'time':
      return d.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString('ja-JP');
  }
}

// 相対時間の表示
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'たった今';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}時間前`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}日前`;
  } else {
    return formatDate(date, 'short');
  }
}

// 文字列の省略表示
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 電話番号のフォーマット
export function formatPhoneNumber(phone: string): string {
  // 数字のみを抽出
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 11 && numbers.startsWith('0')) {
    // 携帯電話番号: 090-1234-5678
    return `${numbers.substring(0, 3)}-${numbers.substring(3, 7)}-${numbers.substring(7)}`;
  } else if (numbers.length === 10 && numbers.startsWith('0')) {
    // 固定電話番号: 03-1234-5678
    return `${numbers.substring(0, 2)}-${numbers.substring(2, 6)}-${numbers.substring(6)}`;
  }
  
  return phone;
}

// メールアドレスの検証
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 電話番号の検証
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^0\d{9,10}$/;
  const numbers = phone.replace(/\D/g, '');
  return phoneRegex.test(numbers);
}

// 郵便番号のフォーマット
export function formatPostalCode(postalCode: string): string {
  const numbers = postalCode.replace(/\D/g, '');
  if (numbers.length === 7) {
    return `${numbers.substring(0, 3)}-${numbers.substring(3)}`;
  }
  return postalCode;
}

// 金額のフォーマット
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

// 数値のフォーマット（カンマ区切り）
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ja-JP').format(num);
}

// ファイルサイズのフォーマット
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ランダムIDの生成
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// UUIDの生成（簡易版）
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 配列のシャッフル
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 配列の重複削除
export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  return Array.from(new Set(array));
}

// オブジェクトの深いコピー
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// オブジェクトのマージ
export function mergeObjects<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

// デバウンス関数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// スロットル関数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ローカルストレージの安全な操作
export function safeLocalStorage() {
  return {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage.getItem failed:', error);
        return null;
      }
    },
    setItem: (key: string, value: string): boolean => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error('localStorage.setItem failed:', error);
        return false;
      }
    },
    removeItem: (key: string): boolean => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('localStorage.removeItem failed:', error);
        return false;
      }
    },
  };
}

// URLパラメータの取得
export function getUrlParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// URLパラメータの設定
export function setUrlParams(params: Record<string, string>): void {
  const url = new URL(window.location.href);
  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.set(key, params[key]);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.replaceState({}, '', url.toString());
}

// ファイルのダウンロード
export function downloadFile(data: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ファイルの読み込み
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// 画像のリサイズ
export function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // アスペクト比を保持してリサイズ
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, { type: file.type });
          resolve(resizedFile);
        } else {
          reject(new Error('画像のリサイズに失敗しました'));
        }
      }, file.type, 0.8);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// エラーメッセージの取得
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '不明なエラーが発生しました';
}

// 成功メッセージの表示
export function showSuccessMessage(message: string): void {
  // 実際の実装では、トースト通知ライブラリを使用
  console.log('Success:', message);
}

// エラーメッセージの表示
export function showErrorMessage(message: string): void {
  // 実際の実装では、トースト通知ライブラリを使用
  console.error('Error:', message);
}

// 確認ダイアログの表示
export function showConfirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(message);
    resolve(result);
  });
}

// 年齢の計算
export function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// 診療時間の計算
export function calculateConsultationDuration(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // 分単位
}

// 診療料金の計算
export function calculateConsultationFee(duration: number, baseFee: number = 3000): number {
  // 30分を基本として、15分ごとに追加料金
  const baseDuration = 30;
  const additionalDuration = Math.max(0, duration - baseDuration);
  const additionalFee = Math.ceil(additionalDuration / 15) * 1000;
  
  return baseFee + additionalFee;
}

// デフォルトエクスポート
export default {
  cn,
  formatDate,
  getRelativeTime,
  truncateText,
  formatPhoneNumber,
  isValidEmail,
  isValidPhoneNumber,
  formatPostalCode,
  formatCurrency,
  formatNumber,
  formatFileSize,
  generateId,
  generateUUID,
  shuffleArray,
  removeDuplicates,
  deepClone,
  mergeObjects,
  debounce,
  throttle,
  safeLocalStorage,
  getUrlParams,
  setUrlParams,
  downloadFile,
  readFile,
  resizeImage,
  getErrorMessage,
  showSuccessMessage,
  showErrorMessage,
  showConfirmDialog,
  calculateAge,
  calculateConsultationDuration,
  calculateConsultationFee,
};