import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Safely ignore components setAll
            }
          },
        },
      }
    );
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session?.user) {
      const email = session.user.email?.toLowerCase();
      
      // Handle Admin login sync
      if (email === 'autocapitalwheelsofficial@gmail.com') {
        const adminSupabase = createAdminClient();
        
        let { data: admin } = await adminSupabase
          .from('admin_users')
          .select('id')
          .eq('email', 'autocapitalwheelsofficial@gmail.com')
          .single();

        if (!admin) {
          const { data: newAdmin } = await adminSupabase
            .from('admin_users')
            .insert({
              email: 'autocapitalwheelsofficial@gmail.com',
              password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGTbMHCqIqGEMwGgjlH/rCPFtoa',
              full_name: 'AutoCapital Wheels Admin',
              role: 'super_admin',
            })
            .select('id')
            .single();
          admin = newAdmin;
        }

        if (admin) {
          const token = crypto.randomUUID() + '-' + crypto.randomUUID();
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

          await adminSupabase.from('admin_users').update({
            session_token: token,
            session_expires_at: expiresAt,
            last_login_at: new Date().toISOString(),
          }).eq('id', admin.id);

          const response = NextResponse.redirect(`${origin}/admin/dashboard`);
          response.cookies.set('acw_admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          });
          return response;
        }
      }
      
      // For general customer, check if phone number exists
      const phone = session.user.user_metadata?.phone || session.user.phone;
      if (!phone) {
        return NextResponse.redirect(`${origin}/login?needs_phone=true`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
