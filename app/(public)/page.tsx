import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import HeroSection from '@/components/public/HeroSection';
import QuickSearch from '@/components/public/QuickSearch';
import FeaturedInventory from '@/components/public/FeaturedInventory';
import BrowseByCategory from '@/components/public/BrowseByCategory';
import WhyChooseUs from '@/components/public/WhyChooseUs';
import BuyingProcess from '@/components/public/BuyingProcess';
import SellCarCTA from '@/components/public/SellCarCTA';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import FAQSection from '@/components/public/FAQSection';
import type { Vehicle, Testimonial, FAQ } from '@/types';
import { ShieldCheck, Tag, Clock, MessageSquare, Users, Headphones } from 'lucide-react';

export const revalidate = 10;

export const metadata: Metadata = {
  title: 'AutoCapital Wheels — Trusted Pre-Owned Cars in Delhi',
  description: 'Buy and sell trusted pre-owned cars in Delhi. AutoCapital Wheels offers quality second-hand cars with transparent pricing and honest deals.',
  openGraph: {
    title: 'AutoCapital Wheels — Trusted Pre-Owned Cars in Delhi',
    description: 'Buy and sell trusted pre-owned cars in Delhi.',
    type: 'website',
  },
};

import { MOCK_VEHICLES, MOCK_TESTIMONIALS, MOCK_FAQS } from '@/lib/supabase/mock-data';

async function getHomepageData() {
  try {
    const supabase = createAdminClient();

    const [featuredRes, testimonialsRes, faqsRes, slidesRes] = await Promise.all([
      supabase
        .from('vehicles')
        .select(`
          id, slug, make, model, variant, year, price, original_price,
          mileage, fuel_type, transmission, main_image_url, location,
          ownership, vehicle_category, is_featured, is_new_arrival,
          is_hot_deal, is_price_drop, status, availability, view_count, enquiry_count,
          vehicle_images(url, is_main, sort_order)
        `)
        .eq('status', 'Active')
        .or('is_featured.eq.true,is_new_arrival.eq.true,is_hot_deal.eq.true')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['hero_slides', 'homepage_categories']),
    ]);

    const featuredVehicles = featuredRes.data && featuredRes.data.length > 0
      ? featuredRes.data
      : MOCK_VEHICLES;

    const testimonials = testimonialsRes.data && testimonialsRes.data.length > 0
      ? testimonialsRes.data
      : MOCK_TESTIMONIALS;

    const faqs = faqsRes.data && faqsRes.data.length > 0
      ? faqsRes.data
      : MOCK_FAQS;

    let heroSlides = null;
    let homepageCategories: any[] = [];

    if (slidesRes.data) {
      slidesRes.data.forEach((setting) => {
        if (setting.key === 'hero_slides') {
          try {
            const parsed = JSON.parse(setting.value);
            if (Array.isArray(parsed) && parsed.length > 0) heroSlides = parsed;
          } catch {}
        }
        if (setting.key === 'homepage_categories') {
          try {
            const parsed = JSON.parse(setting.value);
            if (Array.isArray(parsed) && parsed.length > 0) homepageCategories = parsed;
          } catch {}
        }
      });
    }

    return {
      featuredVehicles: featuredVehicles as Vehicle[],
      testimonials: testimonials as Testimonial[],
      faqs: faqs as FAQ[],
      heroSlides,
      homepageCategories,
    };
  } catch (e) {
    console.warn('[Supabase Fallback] Using mock data because:', e);
    return {
      featuredVehicles: MOCK_VEHICLES,
      testimonials: MOCK_TESTIMONIALS,
      faqs: MOCK_FAQS,
      heroSlides: null,
      homepageCategories: [],
    };
  }
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: '100% Transparency',  sub: 'No hidden charges' },
  { icon: Tag,         label: 'Best Market Price',   sub: 'Honest, fair deals' },
  { icon: Clock,       label: 'Quick & Easy',        sub: 'Hassle-free process' },
  { icon: MessageSquare, label: 'Instant Quotes',    sub: 'Fast response' },
  { icon: Users,       label: 'Trusted by Many',     sub: '1000+ customers' },
  { icon: Headphones,  label: '24/7 Support',        sub: 'Always available' },
];

export default async function HomePage() {
  const { featuredVehicles, testimonials, faqs, heroSlides, homepageCategories } = await getHomepageData();

  return (
    <>
      <HeroSection initialSlides={heroSlides} />
      <QuickSearch />

      {/* ── Premium Trust Bar ─────────────────────────────────────────── */}
      <section className="bg-white" style={{ boxShadow: 'none' }}>
        <div className="container-custom overflow-x-auto scrollbar-hide">
          <div className="flex lg:grid lg:grid-cols-6 min-w-max lg:min-w-0 py-2">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-5 py-4 lg:py-5 flex-shrink-0 lg:flex-shrink group cursor-default"
              >
                {/* Gold icon square */}
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#b48d36] group-hover:border-[#b48d36] transition-all duration-300">
                  <Icon size={15} className="text-[#b48d36] group-hover:text-white stroke-[2] transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-[11.5px] font-bold text-neutral-800 leading-tight whitespace-nowrap" style={{ color: '#1f2937' }}>{label}</p>
                  <p className="text-[10px] text-neutral-500 leading-tight mt-0.5 whitespace-nowrap" style={{ color: '#6b7280' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrowseByCategory categories={homepageCategories} />
      <FeaturedInventory vehicles={featuredVehicles} />
      <BuyingProcess />
      <WhyChooseUs />
      <SellCarCTA />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
    </>
  );
}
