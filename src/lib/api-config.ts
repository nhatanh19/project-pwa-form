import { Capacitor } from '@capacitor/core';

/**
 * Cấu hình đường dẫn kết nối API Máy chủ
 * - Trên Native App (Capacitor Android / iOS): Webview chạy tại origin 'https://localhost',
 *   bắt buộc phải gắn domain gốc đầy đủ của Cloudflare Backend để không bị lỗi kết nối.
 * - Trên Trình duyệt Web / PWA: Có thể dùng đường dẫn tương đối (relative path) hoặc cấu hình VITE_API_BASE_URL.
 */

export const CLOUDFLARE_BACKEND_URL = 'https://pwa-traffic-survey.pages.dev';

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, '');
  }

  // Khi chạy trong ứng dụng di động Capacitor Native
  if (Capacitor.isNativePlatform()) {
    return CLOUDFLARE_BACKEND_URL;
  }

  // Khi chạy trong trình duyệt web thông thường
  return '';
}

/**
 * Trả về URL đầy đủ cho một endpoint API.
 * Ví dụ: apiUrl('/api/sync/batch')
 *  -> Trong Capacitor: 'https://pwa-traffic-survey.pages.dev/api/sync/batch'
 *  -> Trên Web PWA:   '/api/sync/batch'
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${cleanPath}`;
}
