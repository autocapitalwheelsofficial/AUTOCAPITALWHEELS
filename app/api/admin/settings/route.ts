import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

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

    // Only process hero slides if the hero slides data is present in the request
    const existingSlidesStr = formData.get('existing_hero_slides');
    if (existingSlidesStr !== null) {
      let slidesList: any[] = JSON.parse(existingSlidesStr.toString());

      // Process new hero slides files uploads (if any)
      const newFiles = formData.getAll('hero_slides_files');
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
                upsert: false,
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
        if (url && url.startsWith('PENDING_UPLOAD_')) {
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
      const { error: slidesError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'hero_slides',
          value: JSON.stringify(slidesList),
          type: 'json'
        }, { onConflict: 'key' });

      if (slidesError) {
        console.error('[Hero Slides Upsert Error]', slidesError);
        return NextResponse.json({ success: false, error: slidesError.message }, { status: 500 });
      }
    }

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
                upsert: false,
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

      const { error: catError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'homepage_categories',
          value: JSON.stringify(categoriesList),
          type: 'json'
        }, { onConflict: 'key' });

      if (catError) {
        console.error('[Categories Upsert Error]', catError);
        return NextResponse.json({ success: false, error: catError.message }, { status: 500 });
      }

      // Auto-assign vehicles to categories:
      // If only 1 category exists → assign ALL vehicles to it
      // If multiple categories → assign only vehicles with null/unmatched body_type to the first category
      // CRITICAL: Only perform this update if the body_type value is allowed by the DB check constraint!
      const ALLOWED_DB_BODY_TYPES = ['Sedan', 'Hatchback', 'SUV', 'MUV', 'Coupe', 'Convertible', 'Van', 'Pickup', 'Wagon'];
      const categoryBodyTypes = categoriesList.map((c: any) => c.body_type).filter(Boolean);
      
      if (categoryBodyTypes.length > 0 && ALLOWED_DB_BODY_TYPES.includes(categoryBodyTypes[0])) {
        const targetBodyType = categoryBodyTypes[0];
        if (categoryBodyTypes.length === 1) {
          // Only one category — assign every vehicle to it
          await supabase
            .from('vehicles')
            .update({ body_type: targetBodyType })
            .neq('body_type', targetBodyType);
          // Also assign nulls
          await supabase
            .from('vehicles')
            .update({ body_type: targetBodyType })
            .is('body_type', null);
        } else if (categoryBodyTypes.length > 1) {
          // Multiple categories — only update vehicles whose body_type doesn't match any category
          await supabase
            .from('vehicles')
            .update({ body_type: targetBodyType })
            .is('body_type', null);
        }
      }
    }

    // Bust the home page cache so changes appear immediately
    try {
      revalidatePath('/');
      revalidatePath('/cars');
    } catch (_e) {
      // revalidatePath only works in server components context; ignore if it fails here
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Settings Update Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
