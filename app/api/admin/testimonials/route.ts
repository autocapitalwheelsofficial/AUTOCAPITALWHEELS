import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function verifyAdminSession(request: NextRequest) {
  const sessionToken = request.cookies.get('acw_admin_session')?.value;
  return sessionToken || null;
}

async function checkAdminAuth(sessionToken: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('session_expires_at', new Date().toISOString())
    .single();
  return data;
}

// GET /api/admin/testimonials — List all testimonials for admin
export async function GET(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

// POST /api/admin/testimonials — Create direct admin testimonial
export async function POST(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        customer_name: body.customer_name,
        customer_location: body.customer_location || null,
        review: body.review,
        rating: parseInt(body.rating) || 5,
        vehicle_purchased: body.vehicle_purchased || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// PUT /api/admin/testimonials — Edit or moderate testimonial
export async function PUT(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// DELETE /api/admin/testimonials — Delete testimonial
export async function DELETE(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
