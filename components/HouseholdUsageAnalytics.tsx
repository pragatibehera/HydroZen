"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import { Clock, Users, Calendar, Activity } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface HouseholdMember {
  id: string;
  name: string;
  role: string;
}

interface WaterUsage {
  id: string;
  member_id: string;
  device_type: string;
  usage_amount: number;
  timestamp: string;
}

interface UsagePattern {
  hour_of_day: number;
  day_of_week: number;
  average_usage: number;
  month: string;
}

export function HouseholdUsageAnalytics() {
  const [activeTab, setActiveTab] = useState("daily");
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [waterUsage, setWaterUsage] = useState<WaterUsage[]>([]);
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouseholdData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) return;

        // Fetch household ID
        const { data: household } = await supabase
          .from("households")
          .select("id")
          .eq("user_id", authUser.id)
          .single();

        if (!household) return;

        // Fetch members
        const { data: membersData } = await supabase
          .from("household_members")
          .select("*")
          .eq("household_id", household.id);

        // Fetch water usage
        const { data: usageData } = await supabase
          .from("water_usage")
          .select("*")
          .eq("household_id", household.id)
          .order("timestamp", { ascending: true });

        // Fetch usage patterns
        const { data: patternsData } = await supabase
          .from("usage_patterns")
          .select("*")
          .eq("household_id", household.id)
          .order("month", { ascending: false });

        setMembers(membersData || []);
        setWaterUsage(usageData || []);
        setUsagePatterns(patternsData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching household data:", error);
        setLoading(false);
      }
    };

    fetchHouseholdData();
  }, []);

  const getDailyUsageData = () => {
    const dailyMap = waterUsage.reduce((acc, usage) => {
      const date = new Date(usage.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + usage.usage_amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyMap).map(([date, amount]) => ({
      date,
      usage: amount,
    }));
  };

  const getHourlyUsageData = () => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      usage:
        usagePatterns
          .filter((pattern) => pattern.hour_of_day === hour)
          .reduce((sum, pattern) => sum + pattern.average_usage, 0) /
        (usagePatterns.filter((pattern) => pattern.hour_of_day === hour)
          .length || 1),
    }));

    return hourlyData;
  };

  const getMemberUsageData = () => {
    const memberUsage = members.map((member) => ({
      name: member.name,
      usage: waterUsage
        .filter((usage) => usage.member_id === member.id)
        .reduce((sum, usage) => sum + usage.usage_amount, 0),
    }));

    return memberUsage;
  };

  const getWeekdayUsageData = () => {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekdayData = weekdays.map((day, index) => ({
      day,
      usage:
        usagePatterns
          .filter((pattern) => pattern.day_of_week === index)
          .reduce((sum, pattern) => sum + pattern.average_usage, 0) /
        (usagePatterns.filter((pattern) => pattern.day_of_week === index)
          .length || 1),
    }));

    return weekdayData;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Household Water Usage Analytics</CardTitle>
        <CardDescription>
          Detailed analysis of water consumption patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-4 mb-4">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Usage
            </TabsTrigger>
            <TabsTrigger value="hourly" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time-Based
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Member Usage
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Weekly Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getDailyUsageData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#2196F3"
                  name="Water Usage (L)"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="hourly" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getHourlyUsageData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#8884d8" name="Average Usage (L)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="members" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMemberUsageData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#82ca9d" name="Total Usage (L)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="patterns" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getWeekdayUsageData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#ffc658" name="Average Usage (L)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        {/* Usage Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Peak Usage Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getHourlyUsageData()
                  .sort((a, b) => b.usage - a.usage)
                  .slice(0, 3)
                  .map((peak, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>
                        {peak.hour}:00 - {peak.hour + 1}:00
                      </span>
                      <span className="font-medium">
                        {peak.usage.toFixed(1)}L
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Water Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getMemberUsageData()
                  .sort((a, b) => b.usage - a.usage)
                  .map((member, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>{member.name}</span>
                      <span className="font-medium">
                        {member.usage.toFixed(1)}L
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
