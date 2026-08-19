import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminRealtimeNotifier from '@/components/admin/AdminRealtimeNotifier';
import { cache } from 'react';

const getAdminUser = cache(async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('acw_admin_session')?.value;
  if (!sessionToken) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('session_expires_at', new Date().toISOString())
    .single();

  return data;
});

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0a0a0c] text-white relative overflow-hidden">
      {/* Decorative luxury gradient glow background */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#b48d36]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#b48d36]/3 blur-[120px] pointer-events-none z-0" />

      <AdminSidebar admin={admin} />
      <AdminRealtimeNotifier />
      <main className="flex-1 min-w-0 overflow-auto p-4 lg:p-8 relative z-10">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto w-full space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
