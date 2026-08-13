import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/testimonials — Public: returns approved testimonials only
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// POST /api/testimonials — Public/Customer: submits a review for moderation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_location, review, rating, vehicle_purchased } = body;

    if (!customer_name || !review || !rating) {
      return NextResponse.json({ success: false, error: 'Name, review text, and rating are required.' }, { status: 400 });
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be an integer between 1 and 5.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        customer_name: customer_name.trim().substring(0, 100),
        customer_location: customer_location ? customer_location.trim().substring(0, 100) : null,
        review: review.trim().substring(0, 1000),
        rating: ratingVal,
        vehicle_purchased: vehicle_purchased ? vehicle_purchased.trim().substring(0, 100) : null,
        is_active: false, // Default to FALSE for admin moderation approval
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
