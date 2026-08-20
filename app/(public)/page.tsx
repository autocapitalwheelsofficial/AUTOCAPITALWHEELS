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

    // Fallback if data is empty (not seeded yet)
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

import { ShieldCheck, Tag, Clock, MessageSquare, Users, Headphones } from 'lucide-react';

export default async function HomePage() {
  const { featuredVehicles, testimonials, faqs, heroSlides, homepageCategories } = await getHomepageData();

  return (
    <>
      <HeroSection initialSlides={heroSlides} />
      <QuickSearch />
      {/* Trust Badges Row — light theme, horizontal scroll on mobile */}
      <section className="py-4 bg-[var(--color-bg-base)]">
        <div className="container-custom">
          {/* Mobile: horizontal scroll strip */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:pb-0">
            {[
              { icon: ShieldCheck, label: '100% Transparency', sub: 'No hidden charges' },
              { icon: Tag, label: 'Best Market Price', sub: 'Get the best deals' },
              { icon: Clock, label: 'Easy & Quick', sub: 'Hassle free experience' },
              { icon: MessageSquare, label: 'Instant Quotes', sub: 'Quick response' },
              { icon: Users, label: 'Trusted by Many', sub: '1000+ happy customers' },
              { icon: Headphones, label: '24/7 Support', sub: 'We\'re always here' },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 min-w-[160px] snap-start flex-shrink-0 lg:min-w-0 lg:flex-shrink bg-white rounded-xl px-4 py-3.5 border border-neutral-200 shadow-sm hover:border-[#b48d36]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-[#b48d36]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-[#b48d36] stroke-[1.75]" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-neutral-800 leading-tight">{label}</span>
                  <span className="block text-[10px] text-neutral-500 font-normal leading-tight mt-0.5">{sub}</span>
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
