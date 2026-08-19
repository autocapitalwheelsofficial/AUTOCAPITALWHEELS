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
    <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-100">
      <AdminSidebar admin={admin} />
      <AdminRealtimeNotifier />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
