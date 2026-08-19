import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Car, MessageSquare, FileText, Navigation, TrendingUp, Eye, Plus, ArrowRight } from 'lucide-react';
import { formatDateTime, timeAgo } from '@/lib/utils';
import LiveUsersTracker from '@/components/admin/LiveUsersTracker';

async function getDashboardStats() {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    activeVehicles,
    soldVehicles,
    draftVehicles,
    newEnquiries,
    newSellRequests,
    newTestDrives,
    recentEnquiries,
    recentActivity,
    viewsToday,
  ] = await Promise.all([
    supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'Sold'),
    supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'Draft'),
    supabase.from('vehicle_enquiries').select('id', { count: 'exact', head: true }).eq('status', 'NEW'),
    supabase.from('sell_requests').select('id', { count: 'exact', head: true }).eq('status', 'NEW'),
    supabase.from('test_drive_requests').select('id', { count: 'exact', head: true }).eq('status', 'NEW'),
    supabase.from('vehicle_enquiries').select('*, vehicles(make, model, year)').order('created_at', { ascending: false }).limit(5),
    supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'vehicle_view').gte('created_at', today.toISOString()),
  ]);

  return {
    activeVehicles: activeVehicles.count || 0,
    soldVehicles: soldVehicles.count || 0,
    draftVehicles: draftVehicles.count || 0,
    newEnquiries: newEnquiries.count || 0,
    newSellRequests: newSellRequests.count || 0,
    newTestDrives: newTestDrives.count || 0,
    totalLeads: (newEnquiries.count || 0) + (newSellRequests.count || 0) + (newTestDrives.count || 0),
    viewsToday: viewsToday.count || 0,
    recentEnquiries: recentEnquiries.data || [],
    recentActivity: recentActivity.data || [],
  };
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-950/40 text-blue-400 border border-blue-900/30',
  CONTACTED: 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/30',
  FOLLOW_UP: 'bg-orange-950/40 text-orange-400 border border-orange-900/30',
  NEGOTIATION: 'bg-purple-950/40 text-purple-400 border border-purple-900/30',
  CONVERTED: 'bg-green-950/40 text-green-400 border border-green-900/30',
  CLOSED: 'bg-neutral-900 text-neutral-400 border border-neutral-800',
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: 'Active Vehicles', value: stats.activeVehicles, icon: Car, color: 'text-blue-400', bg: 'bg-blue-950/30 border border-blue-900/30', href: '/admin/vehicles?status=Active' },
    { label: 'Sold Vehicles', value: stats.soldVehicles, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-950/30 border border-green-900/30', href: '/admin/vehicles?status=Sold' },
    { label: 'New Enquiries', value: stats.newEnquiries, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-950/30 border border-purple-900/30', href: '/admin/enquiries?status=NEW' },
    { label: 'Sell Requests', value: stats.newSellRequests, icon: FileText, color: 'text-orange-400', bg: 'bg-orange-950/30 border border-orange-900/30', href: '/admin/sell-requests?status=NEW' },
    { label: 'Test Drive Reqs', value: stats.newTestDrives, icon: Navigation, color: 'text-rose-400', bg: 'bg-rose-950/30 border border-rose-900/30', href: '/admin/test-drives?status=NEW' },
    { label: 'Views Today', value: stats.viewsToday, icon: Eye, color: 'text-indigo-400', bg: 'bg-indigo-950/30 border border-indigo-900/30', href: '/admin/analytics' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/vehicles/new" className="btn-primary text-sm py-2.5 px-5" id="add-vehicle-btn">
          <Plus size={16} />
          Add Vehicle
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="admin-stat-card group">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon size={20} className={color} />
            </div>
            <div className="font-display font-bold text-2xl text-white">{value}</div>
            <div className="text-xs text-neutral-400 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Vehicle', href: '/admin/vehicles/new', icon: Plus },
          { label: 'View Enquiries', href: '/admin/enquiries', icon: MessageSquare },
          { label: 'Sell Requests', href: '/admin/sell-requests', icon: FileText },
          { label: 'Manage Site', href: '/admin/cms', icon: Car },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-2.5 p-3 bg-[#121215] border border-[#1f1f26] rounded-xl text-sm font-medium text-neutral-300 hover:border-[#b48d36]/35 hover:bg-[#16161a] transition-all"
          >
            <Icon size={16} className="text-neutral-400" />
            {label}
          </Link>
        ))}
      </div>

      {/* Real-time active users panel */}
      <LiveUsersTracker />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <div className="bg-[#121215] rounded-2xl border border-[#1f1f26]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f26]">
            <h2 className="font-semibold text-white">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-xs text-[#b48d36] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[#1f1f26]">
            {stats.recentEnquiries.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">No enquiries yet</p>
            ) : (
              stats.recentEnquiries.map((enq: any) => (
                <Link
                  key={enq.id}
                  href="/admin/enquiries"
                  className="flex items-start justify-between px-5 py-3 hover:bg-[#16161a] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-white truncate">{enq.customer_name}</p>
                    <p className="text-xs text-neutral-400 truncate">
                      {enq.vehicles ? `${enq.vehicles.year} ${enq.vehicles.make} ${enq.vehicles.model}` : 'General Enquiry'}
                    </p>
                    <p className="text-xs text-neutral-500">{timeAgo(enq.created_at)}</p>
                  </div>
                  <span className={`badge ${statusColors[enq.status] || 'bg-neutral-800 text-neutral-400'} ml-2 flex-shrink-0`}>
                    {enq.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#121215] rounded-2xl border border-[#1f1f26]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f26]">
            <h2 className="font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-[#1f1f26]">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">No activity yet</p>
            ) : (
              stats.recentActivity.map((log: any) => (
                <div key={log.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-300 font-medium">
                        {log.action.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        {log.entity_label && (
                          <span className="font-normal text-neutral-400 font-mono text-[11px] bg-[#16161a] border border-[#1f1f26] px-1.5 py-0.5 rounded ml-1.5">{log.entity_label}</span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500">{log.admin_email}</p>
                    </div>
                    <p className="text-xs text-neutral-500 flex-shrink-0">{timeAgo(log.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Draft vehicles warning */}
      {stats.draftVehicles > 0 && (
        <div className="bg-amber-950/30 border border-amber-900/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-amber-300">
            <strong>{stats.draftVehicles}</strong> vehicle{stats.draftVehicles !== 1 ? 's are' : ' is'} in draft — not visible on the public website.
          </p>
          <Link href="/admin/vehicles?status=Draft" className="text-sm font-semibold text-[#b48d36] hover:text-[#d4a94e]">
            Review →
          </Link>
        </div>
      )}
    </div>
  );
}
