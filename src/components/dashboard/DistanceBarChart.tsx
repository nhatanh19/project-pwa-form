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
import { DistanceDistribution } from '../../types/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface DistanceBarChartProps {
  data: DistanceDistribution[];
}

const DISTANCE_COLORS = ['#38bdf8', '#3b82f6', '#2563eb', '#1d4ed8'];

export const DistanceBarChart: React.FC<DistanceBarChartProps> = ({ data = [] }) => {
  const hasData = data.some((d) => d.count > 0);

  return (
    <Card className="border-slate-200/90 bg-white shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-black text-slate-900">
          Cự Ly Di Chuyển Hàng Ngày
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Phân bổ quãng đường trung bình mỗi ngày
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {hasData ? (
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="distance_range" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} người`, 'Số lượng']}
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DISTANCE_COLORS[index % DISTANCE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center text-xs text-slate-400">
            Chưa có dữ liệu khảo sát
          </div>
        )}
      </CardContent>
    </Card>
  );
};
