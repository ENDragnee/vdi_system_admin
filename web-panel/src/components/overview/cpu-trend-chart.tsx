"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CpuTrendChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
          <XAxis dataKey="time" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
          <YAxis fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="usage"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
