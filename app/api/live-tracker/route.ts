import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/live-tracker — Retrieve currently active users (active in the last 1 minute)
export async function GET(request: NextRequest) {
  // Verify admin auth
  const sessionToken = request.cookies.get('acw_admin_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('session_expires_at', new Date().toISOString())
    .single();

  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch users active in the last 60 seconds
  const cutoffTime = new Date(Date.now() - 60 * 1000).toISOString();

  const { data: activeUsers, error } = await supabase
    .from('live_site_activity')
    .select('*')
    .gt('last_active_at', cutoffTime)
    .order('last_active_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: activeUsers });
}

// POST /api/live-tracker — Client ping (heartbeat)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, user_name, user_email, user_phone, current_path, page_title } = body;

    if (!session_id || !current_path || !page_title) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('live_site_activity')
      .upsert({
        session_id,
        user_name: user_name || null,
        user_email: user_email || null,
        user_phone: user_phone || null,
        current_path,
        page_title,
        last_active_at: new Date().toISOString(),
      }, {
        onConflict: 'session_id',
      });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Clean up old active sessions (older than 5 minutes) randomly to reduce DB writes (5% probability)
    if (Math.random() < 0.05) {
      const oldCutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      supabase.from('live_site_activity').delete().lt('last_active_at', oldCutoff).then(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
