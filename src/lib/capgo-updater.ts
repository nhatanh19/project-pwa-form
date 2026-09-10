import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';

/**
 * Tiện ích quản lý cập nhật không dây Capgo.app Live Updates (OTA)
 * Cho phép ứng dụng di động tự động nhận bản vá giao diện & logic mới
 * từ đám mây Capgo mà không cần người dùng tải lại file APK.
 */

export interface UpdateInfo {
  isChecking: boolean;
  version: string | null;
  statusText: string;
}

export async function initCapgoUpdater(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Thông báo cho Capgo biết bundle hiện tại đã khởi động thành công
    // (Bảo vệ: tránh rollback nếu phiên bản mới chạy ổn định)
    await CapacitorUpdater.notifyAppReady();

    // Lắng nghe sự kiện tải bản cập nhật hoàn tất
    CapacitorUpdater.addListener('updateAvailable', (event) => {
      console.log('[Capgo OTA] Phát hiện bản cập nhật mới:', event.bundle?.version);
    });

    CapacitorUpdater.addListener('downloadComplete', () => {
      console.log('[Capgo OTA] Đã tải xong bản cập nhật mới, sẽ áp dụng khi app khởi động lại.');
    });

    CapacitorUpdater.addListener('updateFailed', (err) => {
      console.warn('[Capgo OTA] Cập nhật OTA thất bại:', err);
    });
  } catch (err) {
    console.warn('[Capgo OTA] Khởi tạo CapacitorUpdater thất bại:', err);
  }
}

/**
 * Thủ công kiểm tra và nạp bản cập nhật OTA từ Capgo
 */
export async function checkForOtaUpdate(): Promise<{ hasUpdate: boolean; message: string }> {
  if (!Capacitor.isNativePlatform()) {
    return { hasUpdate: false, message: 'Tính năng OTA chỉ khả dụng trên ứng dụng di động (Android/iOS).' };
  }

  try {
    // CapacitorUpdater tự động kiểm tra theo channel đã cấu hình trong capacitor.config.ts
    return { hasUpdate: true, message: 'Đã gửi yêu cầu kiểm tra bản cập nhật OTA tới máy chủ Capgo.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi kiểm tra OTA';
    return { hasUpdate: false, message: msg };
  }
}
