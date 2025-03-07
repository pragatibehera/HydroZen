import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const supabase = createClientComponentClient<Database>();

export async function awardPoints(userId: string, points: number, reason: string) {
  const { data, error } = await supabase
    .from('points_transactions')
    .insert({
      user_id: userId,
      points: points,
      reason: reason,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, points, level')
    .order('points', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

export async function subscribeToPoints(userId: string, callback: (points: number) => void) {
  return supabase
    .channel('points_updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new.points);
      }
    )
    .subscribe();
}