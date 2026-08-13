import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enquirySchema } from '@/lib/validations';
import { sendEmail, buildEnquiryEmail } from '@/lib/email/send';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    if (!checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Sanitize optional UUID fields — empty string should be treated as undefined
    if (body.vehicle_id === '') body.vehicle_id = undefined;
    if (body.user_id === '') body.user_id = undefined;

    const parseResult = enquirySchema.safeParse(body);


    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const supabase = createAdminClient();

    // Fetch vehicle snapshot if vehicle_id provided
    let vehicleSnapshot = null;
    if (data.vehicle_id) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('id, make, model, variant, year, price, slug, status')
        .eq('id', data.vehicle_id)
        .single();
      vehicleSnapshot = vehicle;
    }

    // Insert enquiry
    const { data: enquiry, error } = await supabase
      .from('vehicle_enquiries')
      .insert({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        customer_city: data.customer_city || null,
        vehicle_id: data.vehicle_id || null,
        vehicle_snapshot: vehicleSnapshot,
        message: data.message || null,
        preferred_contact: data.preferred_contact,
        preferred_time: data.preferred_time || null,
        test_drive_requested: data.test_drive_requested,
        lead_type: 'ENQUIRY',
        status: 'NEW',
        source: 'website',
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || undefined,
        user_id: data.user_id || null,
      })
      .select('enquiry_id, id')
      .single();

    if (error) {
      console.error('[Enquiry API] DB error:', error);
      return NextResponse.json({ success: false, error: 'Failed to save enquiry' }, { status: 500 });
    }

    // Increment vehicle enquiry count (Disabled: enquiry_count column is not in the database schema)
    /*
    if (data.vehicle_id) {
      supabase.rpc('increment_vehicle_enquiry', { vehicle_id: data.vehicle_id }).then(({ error }) => {
        if (error) console.error('[Enquiry API] increment rpc error:', error);
      });
    }
    */

    // Send email notification (non-blocking)
    const adminEmail = process.env.EMAIL_TO || 'autocapitalwheels@gmail.com';
    sendEmail({
      to: adminEmail,
      subject: `New Vehicle Enquiry — AutoCapital Wheels (${enquiry.enquiry_id})`,
      html: buildEnquiryEmail({
        enquiry_id: enquiry.enquiry_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || undefined,
        customer_city: data.customer_city || undefined,
        vehicle: vehicleSnapshot || undefined,
        message: data.message || undefined,
        preferred_contact: data.preferred_contact,
        preferred_time: data.preferred_time || undefined,
        test_drive_requested: data.test_drive_requested,
        created_at: new Date().toISOString(),
      }),
    }).catch((err) => console.error('[Enquiry API] Email error:', err));

    // Track analytics event
    supabase.from('analytics_events').insert({
      event_type: 'enquiry_submitted',
      vehicle_id: data.vehicle_id || null,
      metadata: { enquiry_id: enquiry.enquiry_id },
      ip_address: ip,
    }).then(({ error }) => {
      if (error) console.error('[Enquiry API] Analytics error:', error);
    });

    return NextResponse.json({
      success: true,
      data: { enquiry_id: enquiry.enquiry_id },
      message: 'Enquiry submitted successfully',
    });
  } catch (error) {
    console.error('[Enquiry API] Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Admin: GET all enquiries
export async function GET(request: NextRequest) {
  // Auth check — must have admin session
  const sessionToken = request.cookies.get('acw_admin_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Verify session
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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const lead_type = searchParams.get('lead_type');
  const page = parseInt(searchParams.get('page') || '1');
  const per_page = parseInt(searchParams.get('per_page') || '20');
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('vehicle_enquiries')
    .select('*, vehicles(make, model, variant, year, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (status) query = query.eq('status', status);
  if (lead_type) query = query.eq('lead_type', lead_type);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  });
}
