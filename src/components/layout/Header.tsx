import React from 'react';
import { WifiOff, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onManualSync: () => void;
  onOpenQuestionManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  pendingCount,
  isSyncing,
  onManualSync,
  onOpenQuestionManager,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-3 sm:px-4 gap-2">
        {/* Left: Brand Logo & Title (With strict truncate protection) */}
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <img
            src="/icons/icon-192x192.png"
            alt="App Icon"
            className="h-9 w-9 rounded-xl shadow-xs border border-slate-200/80 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 truncate leading-tight">
              Khảo Sát Thực Địa
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600 truncate leading-tight">
              ● Giao Thông & Xe Xanh
            </p>
          </div>
        </div>

        {/* Right: Actions & Status Bar (Compact fixed-width toolbar) */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Question Manager Button */}
          {onOpenQuestionManager && (
            <button
              type="button"
              onClick={onOpenQuestionManager}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs shrink-0"
              title="Cấu hình & Quản lý câu hỏi"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-700" />
            </button>
          )}

          {/* Status / Sync Pill */}
          {isSyncing ? (
            <div className="flex h-8 items-center space-x-1.5 rounded-xl bg-blue-50 px-2.5 text-blue-700 border border-blue-200/80 shadow-2xs shrink-0 animate-fadeIn">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600 shrink-0" />
              <span className="text-[11px] font-bold">Đang gửi</span>
            </div>
          ) : pendingCount > 0 && isOnline ? (
            <button
              type="button"
              onClick={onManualSync}
              className="flex h-8 items-center space-x-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-2.5 text-white shadow-xs shrink-0 transition-transform active:scale-95 animate-fadeIn"
              title="Bấm để gửi ngay các phiếu đã lưu vào máy"
            >
              <RefreshCw className="h-3 w-3 shrink-0" />
              <span className="text-[11px] font-black">Gửi ({pendingCount})</span>
            </button>
          ) : isOnline ? (
            <div className="flex h-8 items-center space-x-1.5 rounded-xl bg-emerald-50 px-2.5 text-emerald-800 border border-emerald-200/80 shadow-2xs shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold">Online</span>
            </div>
          ) : (
            <div className="flex h-8 items-center space-x-1 rounded-xl bg-amber-500 px-2 text-white shadow-xs shrink-0">
              <WifiOff className="h-3 w-3 shrink-0" />
              <span className="text-[11px] font-bold">Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
