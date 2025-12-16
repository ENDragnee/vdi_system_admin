'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ResourceChartProps {
  data: Array<{
    time: string;
    cpu: number;
    ram: number;
    storage: number;
  }>;
}

export function ResourceChart({ data }: ResourceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #475569',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" strokeWidth={2} />
        <Line type="monotone" dataKey="ram" stroke="#10b981" name="RAM %" strokeWidth={2} />
        <Line type="monotone" dataKey="storage" stroke="#a855f7" name="Storage %" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
