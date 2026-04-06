"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ResourceUtilizationChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
          <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" />
          <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="ram" fill="#a855f7" radius={[4, 4, 0, 0]} name="Avg RAM %" />
          <Bar dataKey="storage" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Storage %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
