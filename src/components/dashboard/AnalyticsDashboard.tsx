import React from 'react';
import { RefreshCw, BarChart2, ShieldAlert, Download } from 'lucide-react';
import { AnalyticsSummaryData } from '../../types/analytics';
import { Button } from '../ui/button';
import { KpiCards } from './KpiCards';
import { VehiclePieChart } from './VehiclePieChart';
import { DistanceBarChart } from './DistanceBarChart';
import { ReasonsBarChart } from './ReasonsBarChart';
import { GreenReadinessChart } from './GreenReadinessChart';

interface AnalyticsDashboardProps {
  data: AnalyticsSummaryData;
  isLoading: boolean;
  isOnline: boolean;
  onRefresh: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  isLoading,
  isOnline,
  onRefresh,
}) => {
  const handleServerExportCSV = () => {
    window.open('/api/export/csv', '_blank');
  };

  return (
    <div className="space-y-4 pt-2 pb-28">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-900">Báo Cáo Tổng Hợp</h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Server CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleServerExportCSV}
            className="h-9 px-3 rounded-xl border-slate-300 text-xs font-bold gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Xuất</span> CSV
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading || !isOnline}
            className="h-9 px-3 rounded-xl border-slate-300 text-xs font-bold gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Offline Notice on Dashboard */}
      {!isOnline && (
        <div className="flex items-center space-x-2 rounded-2xl bg-amber-50 p-3.5 text-xs text-amber-800 border border-amber-200 shadow-xs">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            Đang hiển thị bản sao báo cáo lưu trong bộ nhớ máy. Số liệu mới nhất từ máy chủ sẽ cập nhật khi có mạng.
          </span>
        </div>
      )}

      {/* 1. KPI Summary Cards */}
      <KpiCards kpis={data.kpis} />

      {/* 2. Charts Grid */}
      <div className="space-y-4 pt-1">
        {/* Biểu đồ tròn phương tiện */}
        <VehiclePieChart data={data.transport_modes} />

        {/* Biểu đồ cột cự ly */}
        <DistanceBarChart data={data.daily_distances} />

        {/* Biểu đồ cột lý do */}
        <ReasonsBarChart data={data.reasons} />

        {/* Biểu đồ mức độ sẵn sàng xe xanh */}
        <GreenReadinessChart data={data.green_readiness} />
      </div>

      {/* Footer Timestamp */}
      <div className="text-center text-[11px] font-medium text-slate-400 pt-2 pb-4">
        Cập nhật: {new Date(data.last_updated).toLocaleTimeString('vi-VN')} ngày {new Date(data.last_updated).toLocaleDateString('vi-VN')}
      </div>
    </div>
  );
};
