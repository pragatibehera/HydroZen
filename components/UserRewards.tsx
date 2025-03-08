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
        console.log("No user found");
        return;
      }

      try {
        console.log("Fetching data for user:", user.id);

        // Fetch user stats
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("points, total_leakages_reported")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user stats:", userError);
          toast({
            title: "Error fetching stats",
            description: "Failed to load your statistics. Please try again.",
            variant: "destructive",
          });
          throw userError;
        }
        console.log("User stats:", userData);
        setUserStats(userData);

        // Fetch all achievements
        const { data: achievementsData, error: achievementsError } =
          await supabase
            .from("achievements")
            .select("*")
            .order("points_required", { ascending: true });

        if (achievementsError) {
          console.error("Error fetching achievements:", achievementsError);
          toast({
            title: "Error fetching achievements",
            description: "Failed to load achievements. Please try again.",
            variant: "destructive",
          });
          throw achievementsError;
        }
        console.log("Achievements:", achievementsData);
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
            title: "Error fetching your achievements",
            description: "Failed to load your achievements. Please try again.",
            variant: "destructive",
          });
          throw userAchievementsError;
        }

        console.log("User achievements:", userAchievementsData);
        setUserAchievements(
          userAchievementsData as unknown as UserAchievement[]
        );
      } catch (error) {
        console.error("Error fetching rewards data:", error);
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
