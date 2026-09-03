import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { TransportModeDistribution } from '../../types/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface VehiclePieChartProps {
  data: TransportModeDistribution[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

export const VehiclePieChart: React.FC<VehiclePieChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.transport_mode,
    value: item.count,
    percentage: item.percentage,
  }));

  const hasData = chartData.some((d) => d.value > 0);

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-900">
          Cơ cấu phương tiện chính
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Tỷ lệ người được khảo sát sử dụng hàng ngày
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} người`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value: string) => (
                    <span className="text-xs font-medium text-slate-700">{value}</span>
                  )}
                />
              </PieChart>
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
