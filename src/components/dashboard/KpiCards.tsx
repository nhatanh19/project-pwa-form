import React from 'react';
import { Users, DollarSign, Leaf } from 'lucide-react';
import { KpiSummary } from '../../types/analytics';
import { formatNumber, formatVND } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';

interface KpiCardsProps {
  kpis: KpiSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 1. Tổng số phiếu */}
      <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/40 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng phiếu khảo sát
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatNumber(kpis.total_responses)}
            </h3>
            <span className="text-[11px] text-blue-600 font-medium">Bản ghi thu thập</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Users className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Chi phí trung bình */}
      <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Chi phí xăng/vé TB
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatVND(kpis.avg_monthly_cost)}
            </h3>
            <span className="text-[11px] text-indigo-600 font-medium">Mỗi người / tháng</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <DollarSign className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Điểm xe xanh trung bình */}
      <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sẵn sàng xe xanh
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {kpis.avg_green_readiness > 0 ? kpis.avg_green_readiness.toFixed(1) : '0.0'} <span className="text-sm font-normal text-slate-500">/ 5.0</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">Mức độ ủng hộ TB</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <Leaf className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
