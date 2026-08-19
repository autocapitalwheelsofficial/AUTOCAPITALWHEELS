'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Tag, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface HeroSlide {
  url: string;
  subtitle?: string;
  title_white?: string;
  title_gold?: string;
  description?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    url: '/hero_full_background.png',
    subtitle: "Gurugram's Premium Used Cars",
    title_white: "Trusted Cars. ",
    title_gold: "Trusted Deals.",
    description: "We buy and sell certified, premium pre-owned cars. Get transparent pricing, 100+ checkpoint verified vehicles, and expert support."
  },
  {
    url: '/hero_full_background_2.png',
    subtitle: "Handpicked Premium Fleet",
    title_white: "Elite Quality. ",
    title_gold: "Assured Warranty.",
    description: "Every vehicle in our collection undergoes rigorous certification checks so you can drive home with absolute peace of mind."
  },
  {
    url: '/hero_full_background_3.png',
    subtitle: "Seamless Automobile Trades",
    title_white: "Sell Instantly. ",
    title_gold: "Best Market Price.",
    description: "Get the best market valuation for your pre-owned car with free doorstep inspections and instant paperless transactions."
  }
];

const TRUST_BADGES = [
  { icon: ShieldCheck, title: 'Verified Cars', sub: '100+ Checkpoints' },
  { icon: Tag,        title: 'Best Value',   sub: 'Fair Market Rates' },
  { icon: Headphones, title: 'Expert Help',  sub: 'Hassle-Free Deal' },
];

interface HeroSectionProps {
  initialSlides?: any[] | null;
}

export default function HeroSection({ initialSlides }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState<(string | HeroSlide)[]>(initialSlides || DEFAULT_SLIDES);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (initialSlides) {
      setSlides(initialSlides);
      return;
    }
    const loadSlides = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_slides')
          .single();
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
        }
      } catch { /* fallback */ }
    };
    loadSlides();
  }, [initialSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => goNext(), 6000);
    return () => clearInterval(interval);
  }, [slides, activeSlide]);

  const goNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide((p) => (p + 1) % slides.length);
      setIsTransitioning(false);
    }, 50);
  };

  const goPrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide((p) => (p - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 50);
  };

  return (
    <section className="relative w-full overflow-hidden flex items-center bg-[#0a0a0c]"
      style={{ minHeight: 'calc(100svh - 0px)', paddingTop: '80px' }}>

      {/* Background Slides */}
      {slides.map((slide, index) => {
        const slideUrl = typeof slide === 'string' ? slide : slide.url;
        const subtitle = typeof slide === 'string' ? "Gurugram's Premium Used Cars" : (slide.subtitle || "Gurugram's Premium Used Cars");
        const titleWhite = typeof slide === 'string' ? "Trusted Cars. " : (slide.title_white || "Trusted Cars. ");
        const titleGold = typeof slide === 'string' ? "Trusted Deals." : (slide.title_gold || "Trusted Deals.");
        const description = typeof slide === 'string' 
          ? "We buy and sell certified, premium pre-owned cars. Get transparent pricing, 100+ checkpoint verified vehicles, and expert support." 
          : (slide.description || "");

        const lower = slideUrl.toLowerCase();
        const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.includes('/hero/hero_slide_') && !lower.includes('.png') && !lower.includes('.jpg');
        
        return (
          <div
            key={slideUrl + index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center ${
              index === activeSlide 
                ? 'opacity-100 scale-100 pointer-events-auto z-20' 
                : 'opacity-0 scale-105 pointer-events-none z-10'
            }`}
          >
            {/* Background Media */}
            <div className="absolute inset-0 pointer-events-none">
              {isVideo ? (
                <video src={slideUrl} className="w-full h-full object-cover object-center" autoPlay muted loop playsInline />
              ) : (
                <img src={slideUrl} alt={titleWhite + titleGold} className="w-full h-full object-cover object-center" />
              )}
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c]/95 via-[#0a0a0c]/65 to-[#0a0a0c]/20" />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
            </div>

            {/* Content Container */}
            <div className="container-custom relative z-20 w-full py-16 lg:py-20">
              <div className="max-w-2xl">
                {/* Label */}
                <div className={`flex items-center gap-2 mb-5 transition-all duration-700 delay-100 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  <div className="w-6 h-[1px] bg-[#b48d36]" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b48d36]">{subtitle}</span>
                </div>

                {/* Headline */}
                <h1 className={`font-display text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-black tracking-tight text-white leading-[1.08] mb-5 transition-all duration-700 delay-200 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {titleWhite}
                  <br />
                  <span style={{ color: '#b48d36' }}>{titleGold}</span>
                </h1>

                {/* Description */}
                <p className={`text-neutral-400 text-sm sm:text-base max-w-md font-light leading-relaxed mb-8 transition-all duration-700 delay-300 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {description}
                </p>

                {/* Trust Badges */}
                <div className={`grid grid-cols-3 gap-4 border-t border-white/8 pt-6 max-w-sm mb-8 transition-all duration-700 delay-400 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
                    <div key={title} className="flex flex-col gap-1.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-[#b48d36]/12 border border-[#b48d36]/20 flex items-center justify-center">
                        <Icon size={16} className="text-[#b48d36]" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-wider leading-tight">{title}</h3>
                        <p className="text-[9px] text-neutral-500 font-light mt-0.5 leading-tight">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-500 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <Link
                    href="/cars"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#d4a94e] text-[#0a0a0c] font-bold px-8 py-4 rounded-xl text-xs tracking-widest uppercase transition-all duration-300 hover:shadow-[0_8px_24px_rgba(180,141,54,0.35)] hover:-translate-y-0.5"
                    id={`hero-browse-cars-${index}`}
                  >
                    BROWSE INVENTORY
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/sell"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/15 hover:border-[#b48d36]/50 bg-white/3 hover:bg-[#b48d36]/8 text-white font-bold px-8 py-4 rounded-xl text-xs tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
                    id={`hero-sell-car-${index}`}
                  >
                    SELL YOUR CAR
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slide Controls */}
      {slides.length > 1 && (
        <>
          {/* Prev/Next Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-white hover:bg-black/70 hover:border-white/20 transition-all duration-200 hidden sm:flex items-center justify-center cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-white hover:bg-black/70 hover:border-white/20 transition-all duration-200 hidden sm:flex items-center justify-center cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeSlide
                    ? 'w-6 h-1.5 bg-[#b48d36]'
                    : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
