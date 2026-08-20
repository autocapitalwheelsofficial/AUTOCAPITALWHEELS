'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Tag, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

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

  // Add scroll wheel and touch swipe events for smooth slide navigation
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 70) {
      // swipe left
      goNext();
    }
    if (touchStart - touchEnd < -70) {
      // swipe right
      goPrev();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Only intercept wheel scroll at top of page
    if (window.scrollY === 0) {
      if (e.deltaY > 50) {
        e.preventDefault();
        goNext();
      } else if (e.deltaY < -50) {
        e.preventDefault();
        goPrev();
      }
    }
  };

  return (
    <section 
      className="relative w-full overflow-hidden flex flex-col justify-end lg:justify-center bg-black max-w-full"
      style={{ minHeight: '75svh', paddingTop: '80px' }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

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
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
              index === activeSlide 
                ? 'opacity-100 scale-100 pointer-events-auto z-20' 
                : 'opacity-0 scale-105 pointer-events-none z-10'
            }`}
          >
            {/* Background Media */}
            <div className="absolute inset-0 w-full h-full">
              {isVideo ? (
                <video src={slideUrl} className="w-full h-full object-cover object-center" autoPlay muted loop playsInline />
              ) : (
                <Image
                  src={slideUrl}
                  alt={titleWhite + titleGold}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  className="object-cover object-center"
                  unoptimized={slideUrl.startsWith('http') && !slideUrl.includes('supabase.co') && !slideUrl.includes('unsplash.com')}
                />
              )}
            </div>

            {/* Premium Dark Overlays */}
            <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
              <div className="absolute inset-0 bg-black/50 sm:bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="container-custom relative z-20 w-full pt-10 pb-16 lg:py-24 h-full flex flex-col justify-end lg:justify-center">
              <div className="max-w-2xl">
                {/* Label */}
                <div className={`flex items-center gap-3 mb-4 lg:mb-5 transition-all duration-700 delay-100 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  <div className="w-8 h-[2px] bg-[#b48d36]" />
                  <span className="text-[10px] lg:text-xs font-bold tracking-[0.25em] uppercase text-[#b48d36]">{subtitle}</span>
                </div>

                {/* Headline */}
                <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-black tracking-tighter text-white leading-[1.1] mb-6 drop-shadow-xl transition-all duration-700 delay-200 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {titleWhite}
                  <br />
                  <span className="text-metallic-gold drop-shadow-md">{titleGold}</span>
                </h1>

                {/* Description */}
                <p className={`text-white/80 text-sm lg:text-base max-w-md font-light leading-relaxed mb-8 drop-shadow-md transition-all duration-700 delay-300 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {description}
                </p>

                {/* Trust Badges */}
                <div className={`grid grid-cols-3 gap-3 lg:gap-5 border-t border-white/20 pt-6 max-w-lg mb-8 transition-all duration-700 delay-400 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
                    <div key={title} className="flex flex-col gap-2 items-start group">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-[#b48d36]/20 border border-[#b48d36]/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-[#b48d36] group-hover:border-[#b48d36] transition-all duration-300">
                        <Icon size={18} className="text-[#b48d36] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="text-[10px] lg:text-xs font-bold text-white uppercase tracking-wider leading-tight">{title}</h3>
                        <p className="text-[9px] lg:text-[10px] text-white/60 font-light mt-0.5 leading-tight">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${index === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <Link
                    href="/cars"
                    className="btn-primary w-full sm:w-auto h-12 lg:h-14 px-8 text-sm hover:scale-105"
                    id={`hero-browse-cars-${index}`}
                  >
                    BROWSE INVENTORY
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/sell"
                    className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white hover:text-black w-full sm:w-auto h-12 lg:h-14 px-8 text-sm hover:scale-105"
                    id={`hero-sell-car-${index}`}
                  >
                    SELL YOUR CAR
                    <ArrowRight size={16} />
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
          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeSlide
                    ? 'w-8 h-1.5 bg-[#b48d36]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
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
