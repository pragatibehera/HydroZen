import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const supabase = createClientComponentClient<Database>();

export async function checkAndAwardAchievements(userId: string) {
  // Get user's current stats
  const { data: userStats } = await supabase
    .from('profiles')
    .select('points, water_saved, reports_submitted')
    .eq('id', userId)
    .single();

  if (!userStats) return;

  // Get unearned achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .not('id', 'in', (
      supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
    ));

  if (!achievements) return;

  // Check each achievement condition
  for (const achievement of achievements) {
    const earned = checkAchievementCondition(achievement, userStats);
    if (earned) {
      await awardAchievement(userId, achievement.id);
    }
  }
}

function checkAchievementCondition(achievement: any, userStats: any) {
  switch (achievement.condition_type) {
    case 'points':
      return userStats.points >= achievement.condition_value;
    case 'water_saved':
      return userStats.water_saved >= achievement.condition_value;
    case 'reports':
      return userStats.reports_submitted >= achievement.condition_value;
    default:
      return false;
  }
}

async function awardAchievement(userId: string, achievementId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}