import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const supabase = createClientComponentClient<Database>();

export async function getCommunityStats() {
  const { data, error } = await supabase
    .rpc('get_community_stats');

  if (error) throw error;
  return data;
}

export async function joinChallenge(userId: string, challengeId: string) {
  const { data, error } = await supabase
    .from('challenge_participants')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveChallenges() {
  const { data, error } = await supabase
    .from('community_challenges')
    .select(`
      *,
      participants:challenge_participants(count),
      top_performers:challenge_participants(
        user:profiles(username, points),
        points_earned
      )
    `)
    .eq('status', 'active')
    .order('end_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function subscribeToChallengeUpdates(challengeId: string, callback: (data: any) => void) {
  return supabase
    .channel(`challenge_${challengeId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'challenge_participants',
        filter: `challenge_id=eq.${challengeId}`,
      },
      callback
    )
    .subscribe();
}