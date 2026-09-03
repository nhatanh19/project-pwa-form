import React from 'react';
import { Database, RefreshCw, CheckCircle2, Clock, Trash2, Wifi } from 'lucide-react';
import { OfflineSubmissionRecord } from '../../types/sync';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { db } from '../../db/dexie';

interface SyncQueueViewProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSubmissions: OfflineSubmissionRecord[];
  onTriggerSync: () => void;
  lastSyncedAt: string | null;
}

export const SyncQueueView: React.FC<SyncQueueViewProps> = ({
  isOnline,
  isSyncing,
  pendingSubmissions,
  onTriggerSync,
  lastSyncedAt,
}) => {
  const handleClearSynced = async () => {
    if (window.confirm('Bạn có chắc chắn muốn dọn dẹp các bản ghi đã đồng bộ thành công?')) {
      await db.offline_submissions.where('is_synced').equals(1).delete();
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Queue Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Hàng Đợi Lưu Trữ</h2>
        </div>

        <Button
          variant="emerald"
          size="sm"
          onClick={onTriggerSync}
          disabled={isSyncing || !isOnline || pendingSubmissions.length === 0}
          className="h-8 gap-1.5 text-xs font-bold shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Đang gửi...' : 'Đồng bộ ngay'}</span>
        </Button>
      </div>

      {/* Sync Status Banner */}
      <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Trạng thái hàng đợi</p>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black">{pendingSubmissions.length}</span>
              <span className="text-xs text-slate-300">phiếu đang chờ gửi</span>
            </div>
          </div>

          <div className="text-right">
            <Badge
              variant={isOnline ? 'success' : 'warning'}
              className="text-[11px] gap-1"
            >
              <Wifi className="h-3 w-3" />
              <span>{isOnline ? 'Sẵn sàng đẩy dữ liệu' : 'Chế độ Offline'}</span>
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 text-xs text-slate-600 space-y-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Đồng bộ gần nhất:</span>
            <span className="font-semibold text-slate-800">
              {lastSyncedAt
                ? `${new Date(lastSyncedAt).toLocaleTimeString('vi-VN')} - ${new Date(
                    lastSyncedAt
                  ).toLocaleDateString('vi-VN')}`
                : 'Chưa đồng bộ trong phiên này'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Cơ chế đồng bộ tự động:</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đang bật (Auto Network Trigger)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* List of Pending Submissions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Danh sách bản ghi IndexedDB
          </h3>
          <button
            type="button"
            onClick={handleClearSynced}
            className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Xóa lịch sử đã sync
          </button>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-700">Tất cả dữ liệu đã được đồng bộ!</p>
            <p className="text-xs text-slate-500 mt-1">
              Khi mất mạng, các phiếu mới tạo sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          pendingSubmissions.map((sub, idx) => (
            <Card key={sub.id} className="border-slate-200/80 bg-white shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-700">
                      ID: {sub.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(sub.client_created_at).toLocaleTimeString('vi-VN')} {new Date(sub.client_created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="warning" className="text-[10px] bg-amber-100 text-amber-800">
                    Chờ gửi
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
