"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WaterSavingStats } from "@/components/water-saving-stats";
import { WaterUsageChart } from "@/components/water-usage-chart";
import { LeaderboardWidget } from "@/components/leaderboard-widget";
import { WaterTips } from "@/components/water-tips";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Water Conservation Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor and optimize your water usage with AI-powered insights
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WaterSavingStats />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Water Usage Trends</CardTitle>
                <CardDescription>
                  Your water consumption over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WaterUsageChart />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <LeaderboardWidget />
              <WaterTips />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
