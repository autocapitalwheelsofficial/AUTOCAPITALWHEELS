import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Public endpoint — returns all public-safe settings using admin client (bypasses RLS)
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('site_settings')
      .select('key, value');

    const result: Record<string, any> = {};
    const jsonKeys = ['homepage_categories', 'hero_slides'];

    if (data) {
      for (const row of data) {
        if (jsonKeys.includes(row.key)) {
          try {
            result[row.key] = JSON.parse(row.value);
          } catch {
            result[row.key] = [];
          }
        } else {
          result[row.key] = row.value;
        }
      }
    }

    return NextResponse.json({ success: true, data: result }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, data: {} }, { status: 500 });
  }
}
