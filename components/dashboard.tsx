"use client";

import { useState, useEffect } from "react";
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
import { createClient } from "@supabase/supabase-js";
import { AlertTriangle, Trophy, Droplet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  total_leakages_reported: number;
  created_at: string;
  updated_at: string;
}

interface LeakageReport {
  id: string;
  user_id: string;
  image_url: string;
  location: string;
  description: string;
  status: "pending" | "verified" | "rejected";
  verification_confidence: number;
  verification_description: string;
  points_awarded: number;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  points_required: number;
  badge_url: string | null;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achieved_at: string;
  achievement: Achievement;
}

interface PointsHistory {
  id: string;
  user_id: string;
  points: number;
  action: string;
  description: string | null;
  created_at: string;
}

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [leakageReports, setLeakageReports] = useState<LeakageReport[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch user data
    const fetchUserData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (userError) throw userError;
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Function to fetch leakage reports
    const fetchLeakageReports = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data, error } = await supabase
          .from("leakage_reports")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLeakageReports(data || []);
      } catch (error) {
        console.error("Error fetching leakage reports:", error);
      }
    };

    // Function to fetch user achievements
    const fetchUserAchievements = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data, error } = await supabase
          .from("user_achievements")
          .select(
            `
            *,
            achievement:achievements(*)
          `
          )
          .eq("user_id", authUser.id)
          .order("achieved_at", { ascending: false });

        if (error) throw error;
        setUserAchievements(data || []);
      } catch (error) {
        console.error("Error fetching user achievements:", error);
      }
    };

    // Function to fetch points history
    const fetchPointsHistory = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data, error } = await supabase
          .from("points_history")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setPointsHistory(data || []);
      } catch (error) {
        console.error("Error fetching points history:", error);
      }
    };

    // Initial fetch
    fetchUserData();
    fetchLeakageReports();
    fetchUserAchievements();
    fetchPointsHistory();

    // Set up real-time subscriptions
    const leakageSubscription = supabase
      .channel("leakage_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leakage_reports",
          filter: `user_id=eq.${user?.id}`,
        },
        fetchLeakageReports
      )
      .subscribe();

    const achievementsSubscription = supabase
      .channel("achievements_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_achievements",
          filter: `user_id=eq.${user?.id}`,
        },
        fetchUserAchievements
      )
      .subscribe();

    const pointsSubscription = supabase
      .channel("points_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "points_history",
          filter: `user_id=eq.${user?.id}`,
        },
        fetchPointsHistory
      )
      .subscribe();

    setLoading(false);

    // Cleanup subscriptions
    return () => {
      leakageSubscription.unsubscribe();
      achievementsSubscription.unsubscribe();
      pointsSubscription.unsubscribe();
    };
  }, [user?.id]);

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
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {user.full_name || user.email}
              </p>
              <p className="text-sm text-gray-500">{user.points} points</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Active Leakage Reports */}
        {leakageReports.filter((report) => report.status === "pending").length >
          0 && (
          <div className="grid grid-cols-1 gap-4">
            {leakageReports
              .filter((report) => report.status === "pending")
              .map((report) => (
                <Alert
                  key={report.id}
                  variant="default"
                  className="border-yellow-500 text-yellow-700 bg-yellow-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    Pending Verification - {report.location}
                  </AlertTitle>
                  <AlertDescription>
                    Reported: {new Date(report.created_at).toLocaleString()} |
                    Status:{" "}
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </AlertDescription>
                </Alert>
              ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.points || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Lifetime points earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Leakages Reported
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.total_leakages_reported || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total verified reports
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent leakage reports and points earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pointsHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Droplet className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {history.action}
                        </p>
                        <p className="text-sm text-gray-500">
                          {history.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      +{history.points} points
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Achievements
                </CardTitle>
                <CardDescription>Your earned badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAchievements.map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {userAchievement.achievement.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {userAchievement.achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <WaterTips />
          </div>
        </div>
      </div>
    </div>
  );
}
