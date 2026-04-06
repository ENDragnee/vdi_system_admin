"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function NetworkChart({ data }: { data: any[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="timestamp" hide />
          <YAxis fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="basis"
            dataKey="netIn"
            stroke="#22c55e"
            strokeWidth={3}
            dot={false}
            name="Inbound (MB/s)"
            animationDuration={1000}
            animationEasing="linear"
          />
          <Line
            type="basis"
            dataKey="netOut"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            name="Outbound (MB/s)"
            animationDuration={1000}
            animationEasing="linear"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
