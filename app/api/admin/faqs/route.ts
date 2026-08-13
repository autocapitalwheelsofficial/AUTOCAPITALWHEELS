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

// GET /api/admin/faqs — List all FAQs for admin
export async function GET(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

// POST /api/admin/faqs — Create new FAQ
export async function POST(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.question || !body.answer) {
      return NextResponse.json({ success: false, error: 'Question and Answer are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        question: body.question.trim(),
        answer: body.answer.trim(),
        category: body.category ? body.category.trim() : 'General',
        sort_order: parseInt(body.sort_order) || 0,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// PUT /api/admin/faqs — Update existing FAQ
export async function PUT(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ success: false, error: 'FAQ ID is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('faqs')
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

// DELETE /api/admin/faqs — Delete FAQ
export async function DELETE(request: NextRequest) {
  const sessionToken = verifyAdminSession(request);
  if (!sessionToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const admin = await checkAdminAuth(sessionToken);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'FAQ ID is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
