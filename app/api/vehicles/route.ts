import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { VehicleFilters, VehicleSortOption } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

import { MOCK_VEHICLES } from '@/lib/supabase/mock-data';

// GET /api/vehicles — Public list with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const per_page = Math.min(50, parseInt(searchParams.get('per_page') || '12'));
  const offset = (page - 1) * per_page;
  const sort = (searchParams.get('sort') || 'recommended') as VehicleSortOption;

  // Admin view — show all statuses
  const sessionToken = verifyAdminSession(request);
  const isAdminView = searchParams.get('admin') === '1' && sessionToken;
  let admin = null;

  try {
    if (isAdminView) admin = await checkAdminAuth(sessionToken!);
  } catch {
    admin = null;
  }

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('vehicles')
      .select(
        `
        id, slug, make, model, variant, year, registration_year,
        price, original_price, mileage, fuel_type, transmission,
        body_type, colour, seating_capacity, engine_description,
        location, ownership, vehicle_category,
        main_image_url, is_featured, is_new_arrival, is_hot_deal, is_price_drop,
        status, availability, view_count, enquiry_count, created_at, updated_at,
        vehicle_images(id, url, thumbnail_url, is_main, sort_order)
      `,
        { count: 'exact' }
      );

    // Public only sees Active vehicles unless admin
    if (!admin) {
      query = query.eq('status', 'Active');
    } else if (searchParams.get('status')) {
      query = query.eq('status', searchParams.get('status')!);
    }

    // Apply filters
    const filters: VehicleFilters = {
      search: searchParams.get('search') || undefined,
      make: searchParams.get('make') || undefined,
      model: searchParams.get('model') || undefined,
      fuel_type: searchParams.get('fuel_type') as any || undefined,
      transmission: searchParams.get('transmission') as any || undefined,
      body_type: searchParams.get('body_type') as any || undefined,
      vehicle_category: searchParams.get('vehicle_category') as any || undefined,
      min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
      min_year: searchParams.get('min_year') ? parseInt(searchParams.get('min_year')!) : undefined,
      max_year: searchParams.get('max_year') ? parseInt(searchParams.get('max_year')!) : undefined,
      min_mileage: searchParams.get('min_mileage') ? parseInt(searchParams.get('min_mileage')!) : undefined,
      max_mileage: searchParams.get('max_mileage') ? parseInt(searchParams.get('max_mileage')!) : undefined,
      location: searchParams.get('location') || undefined,
      availability: searchParams.get('availability') as any || undefined,
      is_featured: searchParams.get('featured') === '1' ? true : undefined,
    };

    // Support fetching by specific IDs (for wishlist)
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const idList = idsParam.split(',').map(s => s.trim()).filter(Boolean);
      if (idList.length > 0) {
        query = query.in('id', idList);
      }
    }

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        const orConditions = searchTerms.flatMap((term) => [
          `make.ilike.%${term}%`,
          `model.ilike.%${term}%`,
          `variant.ilike.%${term}%`,
        ]);
        query = query.or(orConditions.join(','));
      }
    }
    if (filters.make) query = query.ilike('make', `%${filters.make}%`);
    if (filters.model) query = query.ilike('model', `%${filters.model}%`);
    if (filters.fuel_type) query = query.eq('fuel_type', filters.fuel_type);
    if (filters.transmission) query = query.eq('transmission', filters.transmission);
    if (filters.body_type) query = query.eq('body_type', filters.body_type);
    if (filters.vehicle_category) query = query.eq('vehicle_category', filters.vehicle_category);
    if (filters.min_price) query = query.gte('price', filters.min_price);
    if (filters.max_price) query = query.lte('price', filters.max_price);
    if (filters.min_year) query = query.gte('year', filters.min_year);
    if (filters.max_year) query = query.lte('max_year', filters.max_year);
    if (filters.min_mileage) query = query.gte('mileage', filters.min_mileage);
    if (filters.max_mileage) query = query.lte('mileage', filters.max_mileage);
    if (filters.location) query = query.ilike('location', `%${filters.location}%`);
    if (filters.availability) query = query.eq('availability', filters.availability);
    if (filters.is_featured) query = query.eq('is_featured', true);

    // Sorting
    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'newest': query = query.order('created_at', { ascending: false }); break;
      case 'oldest': query = query.order('created_at', { ascending: true }); break;
      case 'mileage_asc': query = query.order('mileage', { ascending: true }); break;
      case 'mileage_desc': query = query.order('mileage', { ascending: false }); break;
      default: // recommended — featured first, then newest
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + per_page - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const headers: Record<string, string> = {};
    if (!admin) {
      headers['Cache-Control'] = 'public, s-maxage=30, stale-while-revalidate=59';
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    }, { headers });
  } catch {
    // Fallback to mock data with in-memory filtering
    let list = [...MOCK_VEHICLES];

    const search = searchParams.get('search');
    const make = searchParams.get('make');
    const fuel_type = searchParams.get('fuel_type');
    const transmission = searchParams.get('transmission');
    const body_type = searchParams.get('body_type');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');

    if (search) {
      const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        list = list.filter((v) =>
          searchTerms.some(
            (term) =>
              v.make.toLowerCase().includes(term) ||
              v.model.toLowerCase().includes(term) ||
              (v.variant && v.variant.toLowerCase().includes(term))
          )
        );
      }
    }
    if (make) list = list.filter((v) => v.make.toLowerCase() === make.toLowerCase());
    if (fuel_type) list = list.filter((v) => v.fuel_type === fuel_type);
    if (transmission) list = list.filter((v) => v.transmission === transmission);
    if (body_type) list = list.filter((v) => v.body_type === body_type);
    if (min_price) list = list.filter((v) => v.price >= parseInt(min_price));
    if (max_price) list = list.filter((v) => v.price <= parseInt(max_price));

    // Sort in-memory
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'mileage_asc') list.sort((a, b) => a.mileage - b.mileage);
    else list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));

    const total = list.length;
    const paginated = list.slice(offset, offset + per_page);

    const fallbackHeaders: Record<string, string> = {};
    if (!admin) {
      fallbackHeaders['Cache-Control'] = 'public, s-maxage=30, stale-while-revalidate=59';
    }

    return NextResponse.json({
      success: true,
      data: paginated,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    }, { headers: fallbackHeaders });
  }
}

// POST /api/vehicles — Admin only: create vehicle
export async function POST(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const supabase = createAdminClient();

  // Generate slug
  const slugBase = `${body.make}-${body.model}-${body.variant || ''}-${body.year}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Ensure unique slug
  let slug = slugBase;
  let counter = 1;
  while (true) {
    const { data: existing } = await supabase
      .from('vehicles')
      .select('id')
      .eq('slug', slug)
      .single();
    if (!existing) break;
    slug = `${slugBase}-${counter++}`;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert({ ...body, slug, added_by: admin.id })
    .select('id, slug')
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('admin_activity_logs').insert({
    admin_id: admin.id,
    admin_email: admin.email,
    action: 'VEHICLE_CREATED',
    entity_type: 'vehicle',
    entity_id: data.id,
    entity_label: `${body.year} ${body.make} ${body.model}`,
  });

  return NextResponse.json({ success: true, data });
}
