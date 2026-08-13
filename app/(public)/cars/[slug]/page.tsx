import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import VehicleDetailClient from '@/components/public/VehicleDetailClient';
import type { Vehicle } from '@/types';
import { MOCK_VEHICLES } from '@/lib/supabase/mock-data';

export const revalidate = 10;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from('vehicles').select('slug');
    return (data || []).map((v) => ({ slug: v.slug }));
  } catch {
    return MOCK_VEHICLES.map((v) => ({ slug: v.slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let vehicle = null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('vehicles')
      .select('make, model, variant, year, price, seo_title, seo_description, main_image_url')
      .eq('slug', slug)
      .single();
    vehicle = data;
  } catch {
    vehicle = MOCK_VEHICLES.find((v) => v.slug === slug) || null;
  }

  if (!vehicle) return { title: 'Vehicle Not Found' };

  const title = vehicle.seo_title || `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''} — AutoCapital Wheels`;
  const description = vehicle.seo_description || `Buy this ${vehicle.year} ${vehicle.make} ${vehicle.model} from AutoCapital Wheels. Quality pre-owned cars with transparent pricing.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: vehicle.main_image_url ? [{ url: vehicle.main_image_url }] : undefined,
    },
  };
}

async function getVehicle(slug: string): Promise<Vehicle | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_images(id, url, thumbnail_url, caption, alt_text, is_main, sort_order),
        vehicle_features(id, category, feature)
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) throw new Error();
    if (data.vehicle_images) {
      data.vehicle_images.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }
    return data as Vehicle;
  } catch {
    return MOCK_VEHICLES.find((v) => v.slug === slug) || null;
  }
}

async function getSimilarVehicles(vehicle: Vehicle): Promise<Vehicle[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('vehicles')
      .select(`
        id, slug, make, model, variant, year, price, mileage,
        fuel_type, transmission, main_image_url, is_featured,
        is_new_arrival, is_hot_deal, is_price_drop, status, availability,
        vehicle_images(url, is_main, sort_order)
      `)
      .eq('status', 'Active')
      .neq('slug', vehicle.slug)
      .or(`make.eq.${vehicle.make},body_type.eq.${vehicle.body_type || 'SUV'}`)
      .limit(4);

    return (data || []) as Vehicle[];
  } catch {
    return MOCK_VEHICLES.filter((v) => v.slug !== vehicle.slug).slice(0, 4);
  }
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);

  if (!vehicle) notFound();

  // Update view count server-side (async, non-blocking)
  const supabase = createAdminClient();
  supabase.from('vehicles')
    .update({ view_count: (vehicle.view_count || 0) + 1 })
    .eq('id', vehicle.id)
    .then(() => {});

  const similarVehicles = await getSimilarVehicles(vehicle);

  return <VehicleDetailClient vehicle={vehicle} similarVehicles={similarVehicles} />;
}
