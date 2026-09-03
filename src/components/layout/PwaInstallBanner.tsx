import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '../ui/button';

interface PwaInstallBannerProps {
  onInstall: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onInstall }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-4 text-white shadow-xl shadow-blue-950/20 border border-slate-700/50 my-2 animate-fadeIn">
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3">
        {/* Left App Icon & Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <img
            src="/icons/icon-192x192.png"
            alt="App Icon"
            className="h-11 w-11 rounded-2xl shadow-md border border-white/20 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black tracking-tight text-white">Khảo Sát Thực Địa</span>
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">PWA</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              Cài đặt để làm việc Offline 100% ngoài hiện trường
            </p>
          </div>
        </div>

        {/* Right Install & Close Buttons */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <Button
            size="sm"
            onClick={onInstall}
            className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Cài đặt</span>
          </Button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
