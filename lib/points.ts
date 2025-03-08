'use client';

import { supabase } from './supabase';

const POINTS_FOR_LEAKAGE = 50; // Points awarded for a verified leakage report

export async function addPointsForLeakage(userId: string, imageUrl: string, verificationResult: any): Promise<void> {
  try {
    console.log("Starting points addition process for user:", userId);

    // Start a transaction-like sequence
    // 1. Create leakage report
    const { error: reportError } = await supabase
      .from('leakage_reports')
      .insert([{
        user_id: userId,
        image_url: imageUrl,
        status: 'verified',
        verification_confidence: verificationResult.confidence,
        verification_description: verificationResult.description,
        points_awarded: POINTS_FOR_LEAKAGE
      }]);

    if (reportError) {
      console.error("Error creating leakage report:", reportError);
      throw new Error("Failed to create leakage report");
    }

    // 2. Update user points
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points, total_leakages_reported')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      throw new Error("Failed to fetch user data");
    }

    const newPoints = (userData?.points || 0) + POINTS_FOR_LEAKAGE;
    const newTotalLeakages = (userData?.total_leakages_reported || 0) + 1;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        points: newPoints,
        total_leakages_reported: newTotalLeakages,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating user points:", updateError);
      throw new Error("Failed to update points");
    }

    // 3. Log points history
    const { error: historyError } = await supabase
      .from('points_history')
      .insert([{
        user_id: userId,
        points: POINTS_FOR_LEAKAGE,
        action: 'LEAKAGE_REPORT',
        description: 'Points awarded for verified water leakage report'
      }]);

    if (historyError) {
      console.error("Error logging points history:", historyError);
      // Don't throw here as points were already added
    }

    // 4. Check and award achievements
    await checkAndAwardAchievements(userId, newPoints, newTotalLeakages);

    console.log(`Successfully processed leakage report for user ${userId}`);
  } catch (error) {
    console.error("Error in addPointsForLeakage:", error);
    throw error;
  }
}

async function checkAndAwardAchievements(userId: string, totalPoints: number, totalLeakages: number) {
  try {
    // Get all achievements user hasn't earned yet
    const { data: availableAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .not('id', 'in', (
        supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', userId)
      ));

    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError);
      return;
    }

    // Check each achievement
    for (const achievement of availableAchievements || []) {
      if (totalPoints >= achievement.points_required) {
        // Award the achievement
        const { error: awardError } = await supabase
          .from('user_achievements')
          .insert([{
            user_id: userId,
            achievement_id: achievement.id
          }]);

        if (awardError) {
          console.error("Error awarding achievement:", awardError);
        } else {
          console.log(`Awarded achievement: ${achievement.name} to user ${userId}`);
        }
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}

export async function getUserPoints(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user points:", error);
      throw error;
    }

    return data?.points || 0;
  } catch (error) {
    console.error("Error in getUserPoints:", error);
    throw new Error("Failed to fetch user points");
  }
}

export async function getPointsHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching points history:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getPointsHistory:", error);
    throw new Error("Failed to fetch points history");
  }
}

export async function getUserAchievements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          name,
          description,
          badge_url
        )
      `)
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (error) {
      console.error("Error fetching user achievements:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserAchievements:", error);
    throw new Error("Failed to fetch user achievements");
  }
} 