import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface OfflineSyncBannerProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastError: string | null;
  onSync: () => void;
  syncSuccessToast: { count: number; timestamp: number } | null;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOnline,
  pendingCount,
  isSyncing,
  lastError,
  onSync,
  syncSuccessToast,
}) => {
  // Hiển thị toast thành công trong 5 giây sau khi sync
  const isRecentSyncSuccess =
    syncSuccessToast && Date.now() - syncSuccessToast.timestamp < 5000;

  if (isRecentSyncSuccess) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium animate-fadeIn">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
          <span>
            Đã tự động đồng bộ thành công <b>{syncSuccessToast?.count}</b> phiếu lên hệ thống!
          </span>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="bg-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
          <div>
            <span className="font-bold text-amber-300">Chế độ Offline 100%:</span>{' '}
            <span className="text-slate-300">
              {pendingCount > 0
                ? `${pendingCount} phiếu đã lưu an toàn trên máy.`
                : 'Phiếu mới sẽ lưu tạm trên máy.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-100" />
          <div>
            <span className="font-bold">Đã có mạng trở lại:</span>{' '}
            <span>{pendingCount} phiếu trong hàng đợi cần gửi.</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onSync}
          disabled={isSyncing}
          className="h-7 text-xs bg-white text-amber-800 border-none hover:bg-amber-50 font-bold px-2.5"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Đang gửi...' : 'Đẩy ngay'}
        </Button>
      </div>
    );
  }

  if (lastError) {
    return (
      <div className="bg-red-600 text-white px-4 py-2 shadow-md flex items-center justify-between text-xs font-medium">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{lastError}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onSync}
          className="h-6 text-[11px] bg-white text-red-700 border-none px-2"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return null;
};
