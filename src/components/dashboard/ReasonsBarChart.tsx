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
import { ReasonDistribution } from '../../types/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface ReasonsBarChartProps {
  data: ReasonDistribution[];
}

const BAR_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

export const ReasonsBarChart: React.FC<ReasonsBarChartProps> = ({ data }) => {
  const hasData = data.some((d) => d.count > 0);

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-900">
          Lý do ưu tiên phương tiện
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Các yếu tố chính ảnh hưởng đến lựa chọn di chuyển
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="reason"
                  type="category"
                  width={110}
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} lượt chọn`, 'Số lượng']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
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
