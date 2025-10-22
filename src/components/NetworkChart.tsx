'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface NetworkChartProps {
  data: Array<{
    time: string;
    in: number;
    out: number;
  }>;
}

export function NetworkChart({ data }: NetworkChartProps) {
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
        <Line type="monotone" dataKey="in" stroke="#10b981" name="Incoming" strokeWidth={2} />
        <Line type="monotone" dataKey="out" stroke="#3b82f6" name="Outgoing" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
