import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { RatingDistribution } from '../../types/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface GreenReadinessChartProps {
  data: RatingDistribution[];
}

const STAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981', '#059669'];

export const GreenReadinessChart: React.FC<GreenReadinessChartProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    name: `${d.rating_score} ⭐`,
    count: d.count,
    score: d.rating_score,
  }));

  const hasData = chartData.some((d) => d.count > 0);

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-900">
          Phân bổ sẵn sàng xe điện / xe xanh
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Thống kê đánh giá từ 1 sao (thấp nhất) đến 5 sao (cao nhất)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} người`, 'Số phiếu']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STAR_COLORS[entry.score - 1] || '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center text-xs text-slate-400">
            Chưa có dữ liệu khảo sát
          </div>
        )}
      </CardContent>
    </Card>
  );
};
