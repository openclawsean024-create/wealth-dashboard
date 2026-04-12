'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AssetAllocation {
  name: string;
  value: number;
  color: string;
}

interface AssetPieChartProps {
  data: AssetAllocation[];
  currency: 'TWD' | 'USD';
  formatCurrency: (value: number, currency?: string) => string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: AssetAllocation }> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="rounded-2xl border border-white/20 bg-slate-900/95 px-4 py-3 text-sm shadow-xl backdrop-blur">
        <p className="font-semibold text-white">{d.name}</p>
        <p className="text-slate-300 mt-1">{payload[0].value.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 })}</p>
      </div>
    );
  }
  return null;
};

export default function AssetPieChart({ data, currency, formatCurrency }: AssetPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">資產配置</p>
        <span className="text-xs text-slate-500">使用 Recharts</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-slate-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with percentages */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-400">{item.name}</span>
            <span className="ml-auto font-medium text-white">
              {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
