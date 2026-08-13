import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/admin/notifications — Fetch unread counts and recent alerts
export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('acw_admin_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Validate admin session
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

  try {
    // 1. Fetch counts of status = 'NEW' for all tables
    const [enquiriesCount, sellCount, testDriveCount] = await Promise.all([
      supabase.from('vehicle_enquiries').select('id', { count: 'exact', head: true }).eq('status', 'NEW'),
      supabase.from('sell_requests').select('id', { count: 'exact', head: true }).eq('status', 'NEW'),
      supabase.from('test_drive_requests').select('id', { count: 'exact', head: true }).eq('status', 'NEW'),
    ]);

    // 2. Fetch very recent alerts (created in the last 15 seconds) to trigger real-time popup toasts
    const recentCutoff = new Date(Date.now() - 15 * 1000).toISOString();

    const [recentEnquiries, recentSells, recentTestDrives] = await Promise.all([
      supabase.from('vehicle_enquiries').select('id, customer_name, created_at, vehicles(make, model)').eq('status', 'NEW').gt('created_at', recentCutoff),
      supabase.from('sell_requests').select('id, owner_name, make, model, created_at').eq('status', 'NEW').gt('created_at', recentCutoff),
      supabase.from('test_drive_requests').select('id, customer_name, created_at, vehicles(make, model)').eq('status', 'NEW').gt('created_at', recentCutoff),
    ]);

    const notifications: any[] = [];

    (recentEnquiries.data || []).forEach((item: any) => {
      notifications.push({
        id: item.id,
        type: 'enquiry',
        title: 'New Enquiry Received',
        message: `${item.customer_name} enquired about ${item.vehicles ? `${item.vehicles.make} ${item.vehicles.model}` : 'a car'}`,
        link: '/admin/enquiries',
        created_at: item.created_at,
      });
    });

    (recentSells.data || []).forEach((item: any) => {
      notifications.push({
        id: item.id,
        type: 'sell_request',
        title: 'New Sell Request',
        message: `${item.owner_name} wants to sell their ${item.make} ${item.model}`,
        link: '/admin/sell-requests',
        created_at: item.created_at,
      });
    });

    (recentTestDrives.data || []).forEach((item: any) => {
      notifications.push({
        id: item.id,
        type: 'test_drive',
        title: 'Test Drive Requested',
        message: `${item.customer_name} requested a test drive for ${item.vehicles ? `${item.vehicles.make} ${item.vehicles.model}` : 'a car'}`,
        link: '/admin/test-drives',
        created_at: item.created_at,
      });
    });

    return NextResponse.json({
      success: true,
      counts: {
        enquiries: enquiriesCount.count || 0,
        sellRequests: sellCount.count || 0,
        testDrives: testDriveCount.count || 0,
        total: (enquiriesCount.count || 0) + (sellCount.count || 0) + (testDriveCount.count || 0),
      },
      recentAlerts: notifications,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
