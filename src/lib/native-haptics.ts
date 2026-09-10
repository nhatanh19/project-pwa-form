import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Tiện ích phản hồi rung xúc giác (Haptic Feedback)
 * Tạo cảm giác nảy chạm tự nhiên như ứng dụng Native Mobile thuần túy.
 */

export const triggerHaptic = {
  // Rung nhẹ khi chạm nút chọn đáp án, thanh trượt, hoặc rating
  light: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Bỏ qua lỗi nếu thiết bị không hỗ trợ motor rung
    }
  },

  // Rung vừa khi chuyển câu hỏi (Next/Back)
  medium: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Bỏ qua
    }
  },

  // Rung mạnh khi có thao tác quan trọng hoặc cảnh báo lỗi
  heavy: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      // Bỏ qua
    }
  },

  // Rung thành công khi hoàn thành nộp phiếu khảo sát
  success: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // Bỏ qua
    }
  },

  // Rung cảnh báo khi nhập thiếu thông tin bắt buộc
  warning: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {
      // Bỏ qua
    }
  },

  // Rung lỗi khi gặp sự cố
  error: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      // Bỏ qua
    }
  },

  // Rung khi chọn tab / bước chuyển tiếp
  selection: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.selectionChanged();
    } catch {
      // Bỏ qua
    }
  },
};
