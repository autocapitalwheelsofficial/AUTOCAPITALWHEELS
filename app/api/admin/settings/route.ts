import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) throw error;
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const formData = await request.formData();
    
    // Process text settings
    const textSettings = ['brand_name', 'brand_tagline', 'business_phone', 'business_whatsapp', 'business_email', 'business_address', 'business_hours'];
    for (const key of textSettings) {
      const val = formData.get(key);
      if (val !== null) {
        await supabase
          .from('site_settings')
          .upsert({ key, value: val.toString(), type: 'text' }, { onConflict: 'key' });
      }
    }

    // Process new hero slides files uploads (if any)
    const newFiles = formData.getAll('hero_slides_files');
    const existingSlidesStr = formData.get('existing_hero_slides') || '[]';
    let slidesList: any[] = JSON.parse(existingSlidesStr.toString());

    if (newFiles.length > 0) {
      for (const fileItem of newFiles) {
        if (fileItem instanceof File) {
          const extension = fileItem.name.split('.').pop();
          const filename = `hero_slide_${crypto.randomUUID()}.${extension}`;
          
          const { error: uploadError } = await supabase.storage
            .from('vehicles')
            .upload(`hero/${filename}`, fileItem, {
              contentType: fileItem.type,
              cacheControl: '3600',
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('vehicles')
              .getPublicUrl(`hero/${filename}`);
            
            slidesList.push({
              url: publicUrl,
              subtitle: "Delhi's Premium Used Cars",
              title_white: "Trusted Cars. ",
              title_gold: "Trusted Deals.",
              description: "We buy and sell certified, premium pre-owned cars. Get transparent pricing, 100+ checkpoint verified vehicles, and expert support."
            });
          }
        }
      }
    }

    // Save slides array in site_settings
    await supabase
      .from('site_settings')
      .upsert({
        key: 'hero_slides',
        value: JSON.stringify(slidesList),
        type: 'json'
      }, { onConflict: 'key' });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Settings Update Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
