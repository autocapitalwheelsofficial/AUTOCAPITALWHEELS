import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const uploadedUrls: string[] = [];

    if (newFiles.length > 0) {
      for (const fileItem of newFiles) {
        if (fileItem instanceof File) {
          const extension = fileItem.name.split('.').pop() || 'jpg';
          const filename = `hero_slide_${crypto.randomUUID()}.${extension}`;
          
          const { error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(`hero/${filename}`, fileItem, {
              contentType: fileItem.type,
              cacheControl: '3600',
            });

          if (uploadError) {
            console.error('[Upload Slide Error]', uploadError);
            return NextResponse.json({ success: false, error: `Upload failed: ${uploadError.message}` }, { status: 500 });
          }

          const { data: { publicUrl } } = supabase.storage
            .from('vehicle-images')
            .getPublicUrl(`hero/${filename}`);
          uploadedUrls.push(publicUrl);
        }
      }
    }

    // Replace PENDING_UPLOAD_X placeholders in the slidesList with uploadedUrls
    let placeholderCounter = 0;
    slidesList = slidesList.map((slide) => {
      const url = typeof slide === 'string' ? slide : slide.url;
      if (url.startsWith('PENDING_UPLOAD_')) {
        const replacementUrl = uploadedUrls[placeholderCounter++];
        if (replacementUrl) {
          if (typeof slide === 'string') {
            return replacementUrl;
          } else {
            return { ...slide, url: replacementUrl };
          }
        }
      }
      return slide;
    });

    // Save slides array in site_settings
    await supabase
      .from('site_settings')
      .upsert({
        key: 'hero_slides',
        value: JSON.stringify(slidesList),
        type: 'json'
      }, { onConflict: 'key' });

    // Process homepage categories uploads (if any)
    const existingCategoriesStr = formData.get('homepage_categories');
    if (existingCategoriesStr) {
      const newCategoryFiles = formData.getAll('category_files');
      let categoriesList: any[] = JSON.parse(existingCategoriesStr.toString());
      const uploadedCategoryUrls: string[] = [];

      if (newCategoryFiles.length > 0) {
        for (const fileItem of newCategoryFiles) {
          if (fileItem instanceof File) {
            const extension = fileItem.name.split('.').pop() || 'jpg';
            const filename = `category_${crypto.randomUUID()}.${extension}`;
            
            const { error: uploadError } = await supabase.storage
              .from('vehicle-images')
              .upload(`categories/${filename}`, fileItem, {
                contentType: fileItem.type,
                cacheControl: '3600',
              });

            if (uploadError) {
              console.error('[Upload Category Error]', uploadError);
              return NextResponse.json({ success: false, error: `Upload failed: ${uploadError.message}` }, { status: 500 });
            }

            const { data: { publicUrl } } = supabase.storage
              .from('vehicle-images')
              .getPublicUrl(`categories/${filename}`);
            uploadedCategoryUrls.push(publicUrl);
          }
        }
      }

      let catPlaceholderCounter = 0;
      categoriesList = categoriesList.map((cat) => {
        if (cat.image_url && cat.image_url.startsWith('PENDING_UPLOAD_')) {
          const replacementUrl = uploadedCategoryUrls[catPlaceholderCounter++];
          if (replacementUrl) {
            return { ...cat, image_url: replacementUrl };
          }
        }
        return cat;
      });

      await supabase
        .from('site_settings')
        .upsert({
          key: 'homepage_categories',
          value: JSON.stringify(categoriesList),
          type: 'json'
        }, { onConflict: 'key' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Settings Update Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
