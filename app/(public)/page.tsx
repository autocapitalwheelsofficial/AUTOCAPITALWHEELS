import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import HeroSection from '@/components/public/HeroSection';
import QuickSearch from '@/components/public/QuickSearch';
import FeaturedInventory from '@/components/public/FeaturedInventory';
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

    const [featuredRes, testimonialsRes, faqsRes] = await Promise.all([
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

    return {
      featuredVehicles: featuredVehicles as Vehicle[],
      testimonials: testimonials as Testimonial[],
      faqs: faqs as FAQ[],
    };
  } catch (e) {
    console.warn('[Supabase Fallback] Using mock data because:', e);
    return {
      featuredVehicles: MOCK_VEHICLES,
      testimonials: MOCK_TESTIMONIALS,
      faqs: MOCK_FAQS,
    };
  }
}

import { ShieldCheck, Tag, Clock, MessageSquare, Users, Headphones } from 'lucide-react';

export default async function HomePage() {
  const { featuredVehicles, testimonials, faqs } = await getHomepageData();

  return (
    <>
      <HeroSection />
      <QuickSearch />
      
      {/* Target Screenshot Trust Badges Row */}
      <section className="-mt-4 pb-12 bg-[#0a0a0c]">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-6 border-y border-[#1f1f26] bg-[#121215]/50 rounded-xl px-6">
            
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="text-[#b48d36] flex-shrink-0">
                <ShieldCheck size={18} className="stroke-[1.5]" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-white leading-tight">100% Transparency</span>
                <span className="block text-[9px] text-neutral-400 font-light leading-none">No hidden charges</span>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="text-[#b48d36] flex-shrink-0">
                <Tag size={18} className="stroke-[1.5]" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-white leading-tight">Best Market Price</span>
                <span className="block text-[9px] text-neutral-400 font-light leading-none">Get the best deals</span>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="text-[#b48d36] flex-shrink-0">
                <Clock size={18} className="stroke-[1.5]" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-white leading-tight">Easy & Quick Process</span>
                <span className="block text-[9px] text-neutral-400 font-light leading-none">Hassle free experience</span>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="text-[#b48d36] flex-shrink-0">
                <MessageSquare size={18} className="stroke-[1.5]" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-white leading-tight">Instant Quotes</span>
                <span className="block text-[9px] text-neutral-400 font-light leading-none">Quick response</span>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="text-[#b48d36] flex-shrink-0">
                <Users size={18} className="stroke-[1.5]" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-white leading-tight">Trusted by Many</span>
                <span className="block text-[9px] text-neutral-400 font-light leading-none">1000+ happy customers</span>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="text-[#b48d36] flex-shrink-0">
                <Headphones size={18} className="stroke-[1.5]" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-white leading-tight">24/7 Support</span>
                <span className="block text-[9px] text-neutral-400 font-light leading-none">We're always here</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <BuyingProcess />
      <FeaturedInventory vehicles={featuredVehicles} />
      <WhyChooseUs />
      <SellCarCTA />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
    </>
  );
}
