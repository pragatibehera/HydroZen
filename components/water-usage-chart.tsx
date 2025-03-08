"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

interface WaterUsageData {
  id: number;
  timestamp: string;
  usage_amount: number;
  location: string;
  device_id: string;
}

interface WaterUsageChartProps {
  data: WaterUsageData[];
}

const generateData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
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

export function WaterUsageChart({ data }: WaterUsageChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formatData = (data: WaterUsageData[]) => {
    return data.map((item) => ({
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      usage: item.usage_amount,
    }));
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formatData(data)}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="timestamp" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "0.5rem",
              border: "none",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="usage"
            name="Water Usage (L)"
            stroke="#2196F3"
            fill="#2196F3"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
