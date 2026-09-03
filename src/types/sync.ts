import { SurveySubmission } from './survey';

export interface OfflineSubmissionRecord extends SurveySubmission {
  is_synced: 0 | 1;              // 0: Chưa sync, 1: Đã sync
  sync_attempts: number;         // Số lần thử đồng bộ
  last_attempt_at?: string;      // Thời gian thử sync gần nhất
  error_message?: string;        // Thông báo lỗi nếu thất bại
}

export interface SyncStatusState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface BatchSyncRequest {
  submissions: SurveySubmission[];
}

export interface BatchSyncResponse {
  success: boolean;
  synced_count: number;
  failed_ids?: string[];
  message: string;
}
