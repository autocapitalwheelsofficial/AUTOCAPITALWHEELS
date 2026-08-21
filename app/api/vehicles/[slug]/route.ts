import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

// GET /api/vehicles/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      vehicle_images(id, url, thumbnail_url, caption, alt_text, is_main, sort_order),
      vehicle_features(id, category, feature)
    `)
    .eq('slug', slug)
    .single();

  if (error || !vehicle) {
    return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
  }

  // Track view (non-blocking)
  supabase.from('vehicles').update({ view_count: (vehicle.view_count || 0) + 1 }).eq('id', vehicle.id).then(() => {});
  supabase.from('analytics_events').insert({
    event_type: 'vehicle_view',
    vehicle_id: vehicle.id,
    ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
  }).then(() => {});

  // Sort images by sort_order
  if (vehicle.vehicle_images) {
    vehicle.vehicle_images.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return NextResponse.json(
    { success: true, data: vehicle },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
      },
    }
  );
}

// PUT /api/vehicles/[slug] — Admin only: update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sessionToken = request.cookies.get('acw_admin_session')?.value;
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const supabase = createAdminClient();

  // Get existing vehicle
  const { data: existing } = await supabase
    .from('vehicles')
    .select('id, status, price')
    .eq('slug', slug)
    .single();

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
  }

  // Remove fields that shouldn't be updated directly
  const { id, created_at, added_by, ...updateData } = body;

  const { data, error } = await supabase
    .from('vehicles')
    .update(updateData)
    .eq('id', existing.id)
    .select('id, slug, status, price')
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Log activity
  const changes = [];
  if (existing.price !== data.price) changes.push(`Price changed to ₹${data.price}`);
  if (existing.status !== data.status) changes.push(`Status changed to ${data.status}`);

  await supabase.from('admin_activity_logs').insert({
    admin_id: admin.id,
    admin_email: admin.email,
    action: 'VEHICLE_UPDATED',
    entity_type: 'vehicle',
    entity_id: existing.id,
    entity_label: `${body.year} ${body.make} ${body.model}`,
    metadata: { changes },
  });

  return NextResponse.json({ success: true, data });
}

// DELETE /api/vehicles/[slug] — Admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sessionToken = request.cookies.get('acw_admin_session')?.value;
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, make, model, year, main_image_url')
    .eq('slug', slug)
    .single();

  if (!vehicle) {
    return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
  }

  // Nullify any FK references in purchases table before deleting to avoid constraint violations
  await supabase.from('purchases').update({ vehicle_id: null }).eq('vehicle_id', vehicle.id);

  const { error } = await supabase.from('vehicles').delete().eq('id', vehicle.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await supabase.from('admin_activity_logs').insert({
    admin_id: admin.id,
    admin_email: admin.email,
    action: 'VEHICLE_DELETED',
    entity_type: 'vehicle',
    entity_id: vehicle.id,
    entity_label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
  });

  return NextResponse.json({ success: true, message: 'Vehicle deleted' });
}
