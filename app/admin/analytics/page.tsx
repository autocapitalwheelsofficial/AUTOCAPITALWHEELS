import { createAdminClient } from '@/lib/supabase/admin';
import { BarChart3, Eye, MessageSquare, PhoneCall, Calendar, Car, FileText, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAnalyticsMetrics() {
  const supabase = createAdminClient();

  // Fetch vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, make, model, year, price, view_count')
    .order('view_count', { ascending: false });

  // Fetch all vehicle enquiries to calculate real per-car enquiry counts
  const { data: enquiries } = await supabase
    .from('vehicle_enquiries')
    .select('vehicle_id');

  // Fetch total counts for other lead metrics
  const [
    totalViewsEvent,
    whatsappClicks,
    totalSellRequests,
    totalTestDrives,
  ] = await Promise.all([
    supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'vehicle_view'),
    supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'whatsapp_click'),
    supabase.from('sell_requests').select('id', { count: 'exact', head: true }),
    supabase.from('test_drive_requests').select('id', { count: 'exact', head: true }),
  ]);

  // Compute enquiry counts per vehicle in memory
  const enquiryCountMap: Record<string, number> = {};
  (enquiries || []).forEach((enq: any) => {
    if (enq.vehicle_id) {
      enquiryCountMap[enq.vehicle_id] = (enquiryCountMap[enq.vehicle_id] || 0) + 1;
    }
  });

  const vehicleList = (vehicles || []).map((v) => ({
    ...v,
    real_enquiry_count: enquiryCountMap[v.id] || 0,
  }));

  const totalViews = totalViewsEvent.count || vehicleList.reduce((sum, v) => sum + (v.view_count || 0), 0);
  const totalEnquiries = enquiries?.length || 0;
  const totalLeads = totalEnquiries + (totalSellRequests.count || 0) + (totalTestDrives.count || 0);

  return {
    vehicles: vehicleList,
    totalViews,
    totalEnquiries,
    totalLeads,
    whatsappClicks: whatsappClicks.count || 0,
    totalSellRequests: totalSellRequests.count || 0,
    totalTestDrives: totalTestDrives.count || 0,
  };
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsMetrics();
  
  const averageEnquiryRate = data.totalViews > 0 ? ((data.totalEnquiries / data.totalViews) * 100).toFixed(1) : '0';
  const totalConversions = data.totalLeads + data.whatsappClicks;
  const conversionRate = data.totalViews > 0 ? ((totalConversions / data.totalViews) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="text-amber-500" size={24} />
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">System Analytics</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Accurate inventory views, customer enquiries, and conversion performance.</p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-wider">
            <span>Total Page Views</span>
            <Eye size={14} className="text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-2">
            {data.totalViews.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-wider">
            <span>Purchase Enquiries</span>
            <MessageSquare size={14} className="text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-2">
            {data.totalEnquiries.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-wider">
            <span>WhatsApp Clicks</span>
            <PhoneCall size={14} className="text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-2">
            {data.whatsappClicks.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-wider">
            <span>Enquiry Rate</span>
            <TrendingUp size={14} className="text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-2 flex items-baseline gap-2">
            {averageEnquiryRate}%
            <span className="text-[10px] text-neutral-400 font-light">views to purchase leads</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Lead Breakdown Card */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm col-span-1 space-y-4">
          <h2 className="font-bold text-neutral-800 text-sm border-b border-neutral-100 pb-3">Lead Type Breakdown</h2>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-1">
                <span className="flex items-center gap-1.5"><MessageSquare size={13} /> Quotation Enquiries</span>
                <span>{data.totalEnquiries}</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${data.totalLeads > 0 ? (data.totalEnquiries / data.totalLeads) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-1">
                <span className="flex items-center gap-1.5"><Calendar size={13} /> Test Drive Bookings</span>
                <span>{data.totalTestDrives}</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${data.totalLeads > 0 ? (data.totalTestDrives / data.totalLeads) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-1">
                <span className="flex items-center gap-1.5"><FileText size={13} /> Sell Car Requests</span>
                <span>{data.totalSellRequests}</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${data.totalLeads > 0 ? (data.totalSellRequests / data.totalLeads) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Global Conversion Summary */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-neutral-800 text-sm border-b border-neutral-100 pb-3">Conversion Summary</h2>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Total Leads Generated</span>
                <span className="text-2xl font-black text-neutral-900 block mt-1">{(data.totalLeads + data.whatsappClicks).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Overall Conversion Rate</span>
                <span className="text-2xl font-black text-amber-500 block mt-1">{conversionRate}%</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 font-light mt-6 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
            * Overall Conversion Rate represents the ratio of total combined lead actions (Form Enquiries + Sell Requests + Test Drives + WhatsApp redirects) against total unique website page views.
          </p>
        </div>
      </div>

      {/* Vehicle Performance Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-neutral-100 bg-neutral-50/50">
          <h2 className="font-bold text-neutral-800 text-sm">Vehicle Performance Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Vehicle</th>
                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Views</th>
                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Enquiries</th>
                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Enquiry Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600">
              {data.vehicles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-400 font-light">
                    No vehicles listed in inventory to measure.
                  </td>
                </tr>
              ) : (
                data.vehicles.map((v) => {
                  const rate = v.view_count > 0 ? ((v.real_enquiry_count / v.view_count) * 100).toFixed(1) : '0';
                  return (
                    <tr key={v.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 font-bold text-neutral-800">
                        {v.year} {v.make} {v.model}
                      </td>
                      <td className="p-4 text-center font-semibold text-neutral-800">
                        <span className="inline-flex items-center gap-1">
                          <Eye size={12} className="text-neutral-400" />
                          {v.view_count || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center font-semibold text-neutral-800">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare size={12} className="text-neutral-400" />
                          {v.real_enquiry_count || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-neutral-700">
                        {rate}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
