"use client";

import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Award, Medal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Achievement {
  id: string;
  name: string;
  description: string;
  points_required: number;
  badge_url: string | null;
}

interface UserAchievement {
  id: string;
  achieved_at: string;
  achievement: Achievement;
}

interface UserStats {
  points: number;
  total_leakages_reported: number;
}

export function UserRewards() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching rewards data for user:", user.id);

        // Fetch user stats from leakage_reports
        const { data: reportsData, error: reportsError } = await supabase
          .from("leakage_reports")
          .select("points_awarded")
          .eq("user_id", user.id);

        if (reportsError) {
          console.error("Error fetching user reports:", reportsError);
          throw reportsError;
        }

        const totalPoints = reportsData.reduce(
          (sum, report) => sum + (report.points_awarded || 0),
          0
        );
        const totalLeakages = reportsData.length;

        setUserStats({
          points: totalPoints,
          total_leakages_reported: totalLeakages,
        });

        // Fetch all achievements
        const { data: achievementsData, error: achievementsError } =
          await supabase
            .from("achievements")
            .select("*")
            .order("points_required", { ascending: true });

        if (achievementsError) {
          console.error("Error fetching achievements:", achievementsError);
          toast({
            title: "Error loading achievements",
            description: "Failed to load achievements. Please try again.",
            variant: "destructive",
          });
          throw achievementsError;
        }

        setAchievements(achievementsData || []);

        // Fetch user's achievements with proper join
        const { data: userAchievementsData, error: userAchievementsError } =
          await supabase
            .from("user_achievements")
            .select(
              `
            id,
            achieved_at,
            achievement:achievements (
              id,
              name,
              description,
              points_required,
              badge_url
            )
          `
            )
            .eq("user_id", user.id);

        if (userAchievementsError) {
          console.error(
            "Error fetching user achievements:",
            userAchievementsError
          );
          toast({
            title: "Error loading your achievements",
            description: "Failed to load your achievements. Please try again.",
            variant: "destructive",
          });
          throw userAchievementsError;
        }

        // Check for new achievements based on points
        if (achievementsData) {
          const earnedAchievements = achievementsData.filter(
            (achievement: Achievement) =>
              achievement.points_required <= totalPoints
          );

          // Add any new achievements that haven't been recorded yet
          for (const achievement of earnedAchievements) {
            const hasAchievement = userAchievementsData?.some(
              (ua: any) => ua.achievement.id === achievement.id
            );

            if (!hasAchievement) {
              const { error: insertError } = await supabase
                .from("user_achievements")
                .insert({
                  user_id: user.id,
                  achievement_id: achievement.id,
                  achieved_at: new Date().toISOString(),
                });

              if (insertError) {
                console.error("Error recording new achievement:", insertError);
              }
            }
          }
        }

        // Fetch updated user achievements after potential new additions
        const { data: updatedAchievements, error: updateError } = await supabase
          .from("user_achievements")
          .select(
            `
            id,
            achieved_at,
            achievement:achievements (
              id,
              name,
              description,
              points_required,
              badge_url
            )
          `
          )
          .eq("user_id", user.id)
          .returns<UserAchievement[]>();

        if (updateError) {
          console.error("Error fetching updated achievements:", updateError);
        } else {
          setUserAchievements(updatedAchievements || []);
        }

        console.log("Rewards data loaded successfully");
      } catch (error) {
        console.error("Error in fetchData:", error);
        toast({
          title: "Error loading rewards",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, toast]);

  const getAchievementIcon = (name: string) => {
    switch (name) {
      case "Novice Reporter":
        return <Medal className="h-6 w-6" />;
      case "Active Citizen":
        return <Star className="h-6 w-6" />;
      case "Water Warrior":
        return <Trophy className="h-6 w-6" />;
      case "Conservation Champion":
        return <Award className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading rewards data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Please sign in to view your rewards</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">{userStats?.points || 0}</h3>
            <p className="text-sm text-gray-500">Total Points</p>
          </div>
          <div className="text-center">
            <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">
              {userStats?.total_leakages_reported || 0}
            </h3>
            <p className="text-sm text-gray-500">Leakages Reported</p>
          </div>
          <div className="text-center">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">{userAchievements.length}</h3>
            <p className="text-sm text-gray-500">Achievements Earned</p>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const userAchievement = userAchievements.find(
            (ua) => ua.achievement.id === achievement.id
          );
          const isAchieved = !!userAchievement;
          const progress = Math.min(
            ((userStats?.points || 0) / achievement.points_required) * 100,
            100
          );

          return (
            <Card
              key={achievement.id}
              className={`p-4 ${
                isAchieved ? "bg-green-50 dark:bg-green-900/20" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${
                    isAchieved
                      ? "bg-green-100 dark:bg-green-800"
                      : "bg-gray-100 dark:bg-gray-800"
                  } flex items-center justify-center`}
                >
                  {getAchievementIcon(achievement.name)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-sm text-gray-500">
                        {achievement.description}
                      </p>
                    </div>
                    {isAchieved && (
                      <Badge variant="default" className="bg-green-500">
                        Achieved
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">
                        {userStats?.points || 0}/{achievement.points_required}{" "}
                        points
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  {isAchieved && userAchievement && (
                    <p className="text-xs text-gray-500 mt-2">
                      Achieved on{" "}
                      {format(
                        new Date(userAchievement.achieved_at),
                        "MMM d, yyyy"
                      )}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
