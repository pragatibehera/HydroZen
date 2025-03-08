"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  BarChart2,
  Settings,
  Droplet,
  Activity,
  Users,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface WaterQualityData {
  tds: number;
  quality: "Excellent" | "Good" | "Fair" | "Poor";
  flowRate: number;
  tankLevel: number;
}

interface UsagePattern {
  hour: number;
  usage: number;
}

interface MemberUsage {
  memberId: string;
  name: string;
  dailyUsage: number;
  monthlyUsage: number;
  complianceRate: number;
}

interface UsageAlert {
  type: "success" | "warning" | "danger";
  message: string;
}

interface WaterUsage {
  daily: number;
  weekly: number;
  monthly: number;
  yearlyAverage: number;
  lastUpdated: Date;
}

export function HouseholdManagement() {
  const [activeTab, setActiveTab] = useState("quality");
  const [waterQuality, setWaterQuality] = useState<WaterQualityData>({
    tds: 250,
    quality: "Good",
    flowRate: 12.5,
    tankLevel: 85,
  });

  const [waterUsage, setWaterUsage] = useState<WaterUsage>({
    daily: 285,
    weekly: 1950,
    monthly: 8500,
    yearlyAverage: 300,
    lastUpdated: new Date(),
  });

  const [alerts, setAlerts] = useState<UsageAlert[]>([]);
  const [usageStatus, setUsageStatus] = useState<"good" | "warning" | "high">(
    "good"
  );
  const [dailyTarget] = useState(300); // Daily target in liters
  const [averageDailyUsage, setAverageDailyUsage] = useState(310);
  const [currentDailyUsage, setCurrentDailyUsage] = useState(285);
  const [monthlyRewards, setMonthlyRewards] = useState(0);
  const [monthlyPenalties, setMonthlyPenalties] = useState(0);

  const usagePatterns: UsagePattern[] = [
    { hour: 6, usage: 45 },
    { hour: 7, usage: 65 },
    { hour: 8, usage: 55 },
    { hour: 12, usage: 25 },
    { hour: 18, usage: 40 },
    { hour: 20, usage: 35 },
  ];

  const memberUsage: MemberUsage[] = [
    {
      memberId: "1",
      name: "Parent 1",
      dailyUsage: 85,
      monthlyUsage: 2550,
      complianceRate: 92,
    },
    {
      memberId: "2",
      name: "Parent 2",
      dailyUsage: 75,
      monthlyUsage: 2250,
      complianceRate: 88,
    },
    {
      memberId: "3",
      name: "Child 1",
      dailyUsage: 65,
      monthlyUsage: 1950,
      complianceRate: 95,
    },
  ];

  useEffect(() => {
    // Calculate usage status
    const dailyPercentage = (waterUsage.daily / dailyTarget) * 100;
    if (dailyPercentage > 120) {
      setUsageStatus("high");
    } else if (dailyPercentage > 90) {
      setUsageStatus("warning");
    } else {
      setUsageStatus("good");
    }

    // Generate alerts
    const newAlerts: UsageAlert[] = [];
    if (dailyPercentage > 120) {
      newAlerts.push({
        type: "danger",
        message: "Daily usage significantly above target",
      });
    } else if (dailyPercentage > 90) {
      newAlerts.push({
        type: "warning",
        message: "Approaching daily usage limit",
      });
    }

    if (waterUsage.daily > waterUsage.yearlyAverage) {
      newAlerts.push({
        type: "warning",
        message: "Usage above yearly average",
      });
    }

    setAlerts(newAlerts);
    setCurrentDailyUsage(waterUsage.daily);
    setAverageDailyUsage(waterUsage.yearlyAverage);
  }, [waterUsage, dailyTarget]);

  // Calculate rewards or penalties based on usage
  useEffect(() => {
    const usageDifference = currentDailyUsage - averageDailyUsage;
    if (usageDifference > 0) {
      // Calculate penalty (₹10 for every 50L excess)
      const penalty = Math.ceil(usageDifference / 50) * 10;
      setMonthlyPenalties((prev) => prev + penalty);
    } else if (usageDifference < 0) {
      // Calculate reward (₹5 for every 25L saved)
      const reward = Math.floor(Math.abs(usageDifference) / 25) * 5;
      setMonthlyRewards((prev) => prev + reward);
    }
  }, [currentDailyUsage, averageDailyUsage]);

  const getStatusColor = (status: typeof usageStatus) => {
    switch (status) {
      case "good":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
    }
  };

  const formatUsage = (liters: number) => {
    return `${liters.toFixed(1)}L`;
  };

  const getUsageIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    }
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-500" />
            Smart Water Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time monitoring and intelligent water usage optimization
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-blue-50 dark:bg-blue-900/30 p-1">
          <TabsTrigger value="quality">
            <Droplet className="h-4 w-4 mr-2" />
            Water Quality
          </TabsTrigger>
          <TabsTrigger value="usage">
            <Activity className="h-4 w-4 mr-2" />
            Usage Tracking
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <Clock className="h-4 w-4 mr-2" />
            Usage Patterns
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Member Analysis
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Activity className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Water Quality Parameters</CardTitle>
              <CardDescription>
                Real-time water quality monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500">TDS Level</p>
                <p className="text-2xl font-bold">{waterQuality.tds} ppm</p>
                <Badge
                  className="mt-2"
                  variant={waterQuality.tds < 300 ? "outline" : "destructive"}
                >
                  {waterQuality.tds < 300 ? "Normal" : "High"}
                </Badge>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Water Quality</p>
                <p className="text-2xl font-bold">{waterQuality.quality}</p>
                <Badge className="mt-2" variant="outline">
                  {waterQuality.quality}
                </Badge>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Flow Rate</p>
                <p className="text-2xl font-bold">
                  {waterQuality.flowRate} L/min
                </p>
                <Badge className="mt-2" variant="outline">
                  Normal Flow
                </Badge>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Tank Level</p>
                <p className="text-2xl font-bold">{waterQuality.tankLevel}%</p>
                <Progress value={waterQuality.tankLevel} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Water Usage Parameters</CardTitle>
              <CardDescription>
                Real-time water consumption tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Daily Usage</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${getStatusColor(usageStatus)}`}
                    >
                      {formatUsage(waterUsage.daily)}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {formatUsage(dailyTarget)}
                    </span>
                  </div>
                </div>
                <Progress
                  value={(waterUsage.daily / dailyTarget) * 100}
                  className="h-2"
                />
              </div>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Weekly Average
                    </span>
                    <div className="flex items-center gap-2">
                      {getUsageIndicator(
                        waterUsage.weekly / 7,
                        waterUsage.daily
                      )}
                      <span className="font-medium">
                        {formatUsage(waterUsage.weekly / 7)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Monthly Average
                    </span>
                    <div className="flex items-center gap-2">
                      {getUsageIndicator(
                        waterUsage.monthly / 30,
                        waterUsage.daily
                      )}
                      <span className="font-medium">
                        {formatUsage(waterUsage.monthly / 30)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Yearly Average
                    </span>
                    <div className="flex items-center gap-2">
                      {getUsageIndicator(
                        waterUsage.yearlyAverage,
                        waterUsage.daily
                      )}
                      <span className="font-medium">
                        {formatUsage(waterUsage.yearlyAverage)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-3 rounded-lg ${
                        alert.type === "danger"
                          ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{alert.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Last Updated */}
              <div className="text-xs text-gray-500">
                Last updated: {waterUsage.lastUpdated.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Patterns</CardTitle>
              <CardDescription>
                Time-based water consumption analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usagePatterns.map((pattern) => (
                  <div key={pattern.hour} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-500">
                      {pattern.hour}:00
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={(pattern.usage / 100) * 100}
                        className="h-4"
                      />
                    </div>
                    <div className="w-20 text-sm font-medium">
                      {pattern.usage}L
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Member Usage Analysis</CardTitle>
              <CardDescription>
                Individual water consumption tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberUsage.map((member) => (
                  <div key={member.memberId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">
                          Daily: {member.dailyUsage}L | Monthly:{" "}
                          {member.monthlyUsage}L
                        </p>
                      </div>
                      <Badge
                        variant={
                          member.complianceRate >= 90 ? "outline" : "default"
                        }
                        className={
                          member.complianceRate >= 90 ? "text-green-500" : ""
                        }
                      >
                        {member.complianceRate}% Compliant
                      </Badge>
                    </div>
                    <Progress value={member.complianceRate} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Rewards & Penalties</CardTitle>
              <CardDescription>Usage-based incentive system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Average Daily Target</p>
                  <p className="text-2xl font-bold">{averageDailyUsage} L</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Current Daily Usage</p>
                  <p className="text-2xl font-bold">{currentDailyUsage} L</p>
                  <Badge
                    className={
                      currentDailyUsage <= averageDailyUsage
                        ? "bg-green-500"
                        : "bg-red-500"
                    }
                  >
                    {currentDailyUsage <= averageDailyUsage
                      ? "Under Target"
                      : "Over Target"}
                  </Badge>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Monthly Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    +₹{monthlyRewards}
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    -₹{monthlyPenalties}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
