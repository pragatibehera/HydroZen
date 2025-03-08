"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplet,
  Upload,
  CheckCircle,
  AlertTriangle,
  Camera,
  MapPin,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeakageVerification } from "@/components/LeakageVerification";
import { LeakageHistory } from "../LeakageHistory";
import { UserRewards } from "../UserRewards";
import { supabase } from "@/lib/supabase";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RecentLeak {
  id: string;
  location: string | null;
  severity: string;
  status: string;
  reported_by: string;
  created_at: string;
  points_awarded: number | null;
  user_id: string;
  verification_confidence: number | null;
}

interface UserContribution {
  total_reports: number;
  verified_reports: number;
  total_points: number;
  verification_rate: number;
}

export function LeakageDetection() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentLeaks, setRecentLeaks] = useState<RecentLeak[]>([]);
  const [userContribution, setUserContribution] = useState<UserContribution>({
    total_reports: 0,
    verified_reports: 0,
    total_points: 0,
    verification_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching dashboard data for user:", user.id);

        // Fetch recent leaks with error handling
        const { data: leaksData, error: leaksError } = await supabase
          .from("leakage_reports")
          .select(
            `
            id,
            location,
            status,
            user_id,
            created_at,
            points_awarded,
            verification_confidence
          `
          )
          .order("created_at", { ascending: false })
          .limit(5);

        if (leaksError) {
          console.error("Error fetching recent leaks:", leaksError);
          toast({
            title: "Error loading recent leaks",
            description: leaksError.message,
            variant: "destructive",
          });
          return;
        }

        // Transform the data to include reported_by and calculate severity
        const transformedLeaks = (leaksData || []).map((leak) => {
          // Calculate severity based on verification confidence
          let severity = "Low";
          if (leak.verification_confidence) {
            if (leak.verification_confidence >= 0.8) {
              severity = "High";
            } else if (leak.verification_confidence >= 0.5) {
              severity = "Medium";
            }
          }

          return {
            ...leak,
            severity,
            reported_by: leak.user_id === user.id ? user.email : "Other User",
          };
        }) as RecentLeak[];

        setRecentLeaks(transformedLeaks);

        // Fetch user contribution stats with error handling
        const { data: userStats, error: statsError } = await supabase
          .from("leakage_reports")
          .select("id, status, points_awarded")
          .eq("user_id", user.id);

        if (statsError) {
          console.error("Error fetching user stats:", statsError);
          toast({
            title: "Error loading user statistics",
            description: statsError.message,
            variant: "destructive",
          });
          return;
        }

        // Calculate user contribution stats
        if (userStats) {
          const totalReports = userStats.length;
          const verifiedReports = userStats.filter(
            (report) => report.status === "verified"
          ).length;
          const totalPoints = userStats.reduce(
            (sum, report) => sum + (report.points_awarded || 0),
            0
          );
          const verificationRate =
            totalReports > 0 ? (verifiedReports / totalReports) * 100 : 0;

          setUserContribution({
            total_reports: totalReports,
            verified_reports: verifiedReports,
            total_points: totalPoints,
            verification_rate: verificationRate,
          });
        }

        console.log("Dashboard data loaded successfully");
      } catch (error) {
        console.error("Error in fetchDashboardData:", error);
        toast({
          title: "Error loading dashboard",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, toast]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show message if no user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to view the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Droplet className="h-6 w-6 text-blue-500" />
            Leakage Detection & Reporting
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Detect and report water leaks to earn rewards and save water
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("report")}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
        >
          <Camera className="mr-2 h-4 w-4" /> Report New Leak
        </Button>
      </div>

      <Tabs
        defaultValue="dashboard"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-blue-50 dark:bg-blue-900/30 p-1">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-blue-800"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="report"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-blue-800"
          >
            Report Leak
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-blue-800"
          >
            History
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-blue-800"
          >
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Network Sensors
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> Online
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    AI Detection
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Community Reports
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> Processing
                  </Badge>
                </div>

                <Separator />

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>System Health</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex gap-2 text-yellow-700 dark:text-yellow-500">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Potential Leak Detected</p>
                      <p className="mt-1">
                        Flow discrepancy in Sector 7, Block B. Verification
                        needed.
                      </p>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex gap-2 text-red-700 dark:text-red-500">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Confirmed Leak</p>
                      <p className="mt-1">
                        Main Street Pipeline showing significant water loss.
                        Maintenance team dispatched.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs border-red-200 dark:border-red-800"
                        >
                          High Priority
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-yellow-200 dark:border-yellow-800"
                        >
                          In Progress
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Contribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Leaks Reported
                  </span>
                  <span className="font-medium">
                    {userContribution.total_reports}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Verified Reports
                  </span>
                  <span className="font-medium">
                    {userContribution.verified_reports}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Points Earned
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {userContribution.total_points}
                  </span>
                </div>

                <Separator />

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Verification Rate</span>
                    <span className="font-medium">
                      {Math.round(userContribution.verification_rate)}%
                    </span>
                  </div>
                  <Progress
                    value={userContribution.verification_rate}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Leaks</CardTitle>
              <CardDescription>
                Latest reported and detected leaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Severity
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Reported By
                      </th>
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-left py-3 px-4 font-medium">
                        Points
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaks.map((leak) => (
                      <tr
                        key={leak.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4">
                          {leak.location || "Unknown Location"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              leak.severity === "High" ? "default" : "outline"
                            }
                            className={
                              leak.severity === "High"
                                ? "bg-red-500"
                                : leak.severity === "Medium"
                                ? "text-yellow-500 border-yellow-200 dark:border-yellow-800"
                                : "text-green-500 border-green-200 dark:border-green-800"
                            }
                          >
                            {leak.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{leak.status}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {leak.reported_by === "System"
                                  ? "SYS"
                                  : leak.reported_by === user?.email
                                  ? "YOU"
                                  : leak.reported_by
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {leak.reported_by === user?.email
                                ? "You"
                                : leak.reported_by}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-500">
                            {format(
                              new Date(leak.created_at),
                              "MMM d, yyyy h:mm a"
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {leak.points_awarded ? (
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              +{leak.points_awarded}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Report a Water Leak</CardTitle>
              <CardDescription>
                Upload photos and details of water leaks you&apos;ve found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeakageVerification />
            </CardContent>
          </Card>

          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Learn how leak reporting and verification works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-2">1. Report a Leak</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Take photos of water leaks you find and submit them through
                    the app
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-2">2. AI Verification</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Our AI system verifies your report and confirms the leak
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <Badge className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-2">3. Earn Rewards</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get points for verified reports and climb the leaderboard
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Reporting History</CardTitle>
              <CardDescription>
                All your past leak reports and their status
              </CardDescription>
            </CardHeader>

            <CardContent></CardContent>
            <LeakageHistory />
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Rewards & Achievements</CardTitle>
              <CardDescription>
                Track your conservation contributions and rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRewards />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
