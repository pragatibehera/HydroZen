import { NextResponse } from 'next/server';
import { getAIRecommendations } from '@/lib/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const recommendations = await getAIRecommendations(body);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error in recommendations route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}