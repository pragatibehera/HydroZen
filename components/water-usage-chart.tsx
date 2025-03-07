"use client";

import { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card } from '@/components/ui/card';

const generateData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.map((month, index) => {
    const household = Math.floor(Math.random() * 200) + 100;
    const average = Math.floor(Math.random() * 50) + 150;
    
    // Make current month and future months have no data
    return {
      name: month,
      household: index <= currentMonth ? household : null,
      average: index <= currentMonth ? average : null,
    };
  });
};

export function WaterUsageChart() {
  const [data, setData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setData(generateData());
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '0.5rem',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }} 
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="household" 
            name="Your Usage (L)"
            stroke="hsl(var(--chart-1))" 
            fill="hsl(var(--chart-1))" 
            fillOpacity={0.2} 
          />
          <Area 
            type="monotone" 
            dataKey="average" 
            name="Community Average (L)"
            stroke="hsl(var(--chart-2))" 
            fill="hsl(var(--chart-2))" 
            fillOpacity={0.2} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}