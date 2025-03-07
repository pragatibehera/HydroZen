"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, TrendingDown, Award, Users } from 'lucide-react';

export function WaterSavingStats() {
  const stats = [
    {
      title: "Water Saved",
      value: "2,345 L",
      description: "This month",
      icon: <Droplet className="h-5 w-5 text-blue-500" />,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Leaks Detected",
      value: "7",
      description: "Last 30 days",
      icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      trend: "-3",
      trendUp: false,
    },
    {
      title: "Rewards Earned",
      value: "320",
      description: "Points",
      icon: <Award className="h-5 w-5 text-yellow-500" />,
      trend: "+45",
      trendUp: true,
    },
    {
      title: "Community Rank",
      value: "#12",
      description: "Of 234 users",
      icon: <Users className="h-5 w-5 text-green-500" />,
      trend: "+3",
      trendUp: true,
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-700">
                {stat.icon}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
              </div>
              <div className={`text-xs font-medium ${
                stat.trendUp ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.trend}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}