import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Get the user from the current session request context
    const { data: { user } } = await supabase.auth.getUser(
      request.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    // If there is no user or the email is not autocapitalwheelsofficial@gmail.com, block access
    if (!user || user.email?.toLowerCase() !== 'autocapitalwheelsofficial@gmail.com') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find the admin user record in the DB
    let { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'autocapitalwheelsofficial@gmail.com')
      .single();

    // If the admin user doesn't exist in the custom admin table, create one automatically
    if (!admin) {
      const { data: newAdmin } = await supabase
        .from('admin_users')
        .insert({
          email: 'autocapitalwheelsofficial@gmail.com',
          password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGTbMHCqIqGEMwGgjlH/rCPFtoa', // default dummy
          full_name: 'AutoCapital Wheels Admin',
          role: 'super_admin',
        })
        .select('id')
        .single();
      
      admin = newAdmin;
    }

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Failed to initialize session' }, { status: 500 });
    }

    // Generate secure admin session token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('admin_users').update({
      session_token: token,
      session_expires_at: expiresAt,
      last_login_at: new Date().toISOString(),
    }).eq('id', admin.id);

    const response = NextResponse.json({ success: true });

    // Set secure HttpOnly cookie for the middleware
    response.cookies.set('acw_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Auth Sync]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
