'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import HeaderSearch from '@/components/public/HeaderSearch';
import HeaderProfile from '@/components/public/HeaderProfile';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({ buy: true, sell: true });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const isHomePage = pathname === '/';

  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    // Fetch dynamic categories — via public API (bypasses RLS)
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/public-settings');
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.homepage_categories)) {
          setDbCategories(json.data.homepage_categories);
        }
      } catch (err) {
        // ignore
      }
    };
    loadCategories();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const headerBg = isScrolled 
    ? 'bg-[var(--color-bg-card)]/90 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm' 
    : 'bg-[var(--color-bg-card)] border-b border-[var(--color-border)] shadow-xs';

  const isDarkHeader = false;

  const textColor = 'text-[var(--color-text-primary)] hover:text-[#b48d36]';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <img
                src="/logo.png"
                alt="AutoCapital Wheels Logo"
                className="h-10 sm:h-12 lg:h-[72px] w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>

            {/* Desktop Nav with Mega Menu */}
            <nav className="hidden lg:flex items-center gap-1 group/nav h-full">
              {/* HOME */}
              <Link
                href="/"
                className={`relative px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname === '/' ? 'text-[#b48d36]' : textColor
                }`}
              >
                HOME
                {pathname === '/' && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#b48d36]" />
                )}
              </Link>

              {/* BUY CARS */}
              <Link
                href="/cars"
                className={`relative flex items-center gap-1 px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname.startsWith('/cars') ? 'text-[#b48d36]' : textColor
                }`}
              >
                BUY CARS
                <ChevronDown size={12} className="transition-transform duration-300 group-hover/nav:rotate-180 text-neutral-400" />
                {pathname.startsWith('/cars') && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#b48d36]" />
                )}
              </Link>

              {/* SELL YOUR CAR */}
              <Link
                href="/sell"
                className={`relative flex items-center gap-1 px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname === '/sell' ? 'text-[#b48d36]' : textColor
                }`}
              >
                SELL YOUR CAR
                <ChevronDown size={12} className="transition-transform duration-300 group-hover/nav:rotate-180 text-neutral-400" />
                {pathname === '/sell' && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#b48d36]" />
                )}
              </Link>

              {/* ABOUT US */}
              <Link
                href="/about"
                className={`relative px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname === '/about' ? 'text-[#b48d36]' : textColor
                }`}
              >
                ABOUT US
                {pathname === '/about' && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#b48d36]" />
                )}
              </Link>

              {/* CONTACT US */}
              <Link
                href="/contact"
                className={`relative px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname === '/contact' ? 'text-[#b48d36]' : textColor
                }`}
              >
                CONTACT US
                {pathname === '/contact' && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#b48d36]" />
                )}
              </Link>

              {/* ADMIN PANEL */}
              {user?.email?.toLowerCase() === 'autocapitalwheelsofficial@gmail.com' && (
                <Link
                  href="/admin/dashboard"
                  className="relative px-3.5 py-6 text-[11px] font-extrabold tracking-widest uppercase transition-all duration-200 text-[#b48d36] hover:text-[#a07d2f]"
                >
                  ADMIN PANEL
                </Link>
              )}

              {/* FULL WIDTH MEGA MENU */}
              <div className="absolute top-full left-0 w-full opacity-0 invisible translate-y-4 transition-all duration-500 ease-out group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 z-[60]">
                <div className="w-full bg-[var(--color-bg-card)]/98 backdrop-blur-xl border-t border-b border-[var(--color-border)] shadow-xl relative overflow-hidden">
                  <div className="container-custom py-10 relative z-10">
                    <div className="grid grid-cols-4 gap-8">
                      
                      {/* Column 1: Buy Cars */}
                      <div className="space-y-4 border-r border-[var(--color-border)]">
                        <h3 className="font-display font-black text-sm tracking-widest uppercase text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b48d36]" />
                          Inventory
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <Link href="/cars" className="text-xs font-bold tracking-wider text-neutral-500 hover:text-[#b48d36] hover:translate-x-1 transition-all uppercase py-1">All Inventory</Link>
                          {dbCategories.map((cat, idx) => (
                              <Link 
                                key={idx} 
                                href={`/cars?body_type=${encodeURIComponent(cat.body_type)}`} 
                                className="text-xs font-bold tracking-wider text-neutral-500 hover:text-[#b48d36] hover:translate-x-1 transition-all uppercase py-1"
                              >
                                {cat.name}
                              </Link>
                            ))}
                        </div>
                      </div>

                      {/* Column 2: Sell Your Car */}
                      <div className="space-y-4 border-r border-[var(--color-border)]">
                        <h3 className="font-display font-black text-sm tracking-widest uppercase text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b48d36]" />
                          Sell / Trade
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <Link href="/sell" className="text-xs font-bold tracking-wider text-neutral-500 hover:text-[#b48d36] hover:translate-x-1 transition-all uppercase py-1">Get Free Quote</Link>
                          <Link href="/about" className="text-xs font-bold tracking-wider text-neutral-500 hover:text-[#b48d36] hover:translate-x-1 transition-all uppercase py-1">How It Works</Link>
                        </div>
                      </div>

                      {/* Column 3: Company */}
                      <div className="space-y-4">
                        <h3 className="font-display font-black text-sm tracking-widest uppercase text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b48d36]" />
                          Company
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <Link href="/about" className="text-xs font-bold tracking-wider text-neutral-500 hover:text-[#b48d36] hover:translate-x-1 transition-all uppercase py-1">About Us</Link>
                          <Link href="/contact" className="text-xs font-bold tracking-wider text-neutral-500 hover:text-[#b48d36] hover:translate-x-1 transition-all uppercase py-1">Contact Us</Link>
                          <Link href="/privacy-policy" className="text-xs font-bold tracking-wider text-neutral-500 hover:text-[#b48d36] hover:translate-x-1 transition-all uppercase py-1">Privacy Policy</Link>
                          <Link href="/terms" className="text-xs font-bold tracking-wider text-neutral-500 hover:text-[#b48d36] hover:translate-x-1 transition-all uppercase py-1">Terms of Service</Link>
                        </div>
                      </div>

                      {/* Column 4: Premium Card */}
                      <div className="col-span-1 pl-4">
                        <div className="relative h-full rounded-2xl overflow-hidden group/card cursor-pointer border border-[var(--color-border)]">
                          <img 
                            src="/mega-menu-luxury.png" 
                            alt="Luxury Collection" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute inset-0 p-5 flex flex-col justify-end">
                            <h4 className="text-white font-display font-black text-lg uppercase tracking-wider mb-1">Discover Luxury</h4>
                            <p className="text-neutral-350 text-xs mb-3">Explore our handpicked collection of premium vehicles.</p>
                            <Link href="/cars" className="inline-block bg-[#b48d36] hover:bg-[#a37e2c] text-black font-bold text-[10px] tracking-widest uppercase px-4 py-2 rounded transition-colors w-fit">
                              View Collection
                            </Link>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-6 flex-shrink-0">
              <div className="flex items-center gap-1">
                <HeaderSearch isDarkHeader={isDarkHeader} />
                <HeaderProfile user={user} isDarkHeader={isDarkHeader} />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg transition-all duration-200 hover:bg-neutral-100 active:scale-95 flex items-center justify-center cursor-pointer text-[var(--color-text-primary)]"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-all duration-500"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 bg-[var(--color-bg-card)] border-l border-[var(--color-border)] shadow-2xl lg:hidden transform transition-transform duration-500 ease-out flex flex-col justify-between ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center">
              <img src="/logo.png" alt="AutoCapital Wheels" className="h-10 w-auto object-contain" />
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full text-neutral-500 hover:text-[var(--color-text-primary)] hover:bg-neutral-100 transition-all duration-200"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="p-6 flex flex-col gap-1.5 overflow-y-auto">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:pl-6 hover:text-[#b48d36] block ${pathname === '/' ? 'text-[#b48d36] border-l-2 border-[#b48d36] pl-4 w-fit' : 'text-neutral-500 pl-4'}`}
            >
              HOME
            </Link>

            {/* Buy Cars / Inventory Accordion */}
            <div>
              <button 
                onClick={() => toggleAccordion('buy')}
                className="w-full flex items-center justify-between px-4 py-3.5 transition-all duration-300 group cursor-pointer"
              >
                <span className="text-xs font-bold tracking-widest text-neutral-500 group-hover:text-[#b48d36] uppercase">BUY CARS</span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${openAccordions.buy ? 'rotate-180 text-[#b48d36]' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordions.buy ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-[var(--color-border)] ml-4 py-1">
                  <Link onClick={() => setIsMenuOpen(false)} href="/cars" className="text-xs font-semibold text-neutral-500 hover:text-[#b48d36] transition-all duration-300 hover:translate-x-1 uppercase tracking-wider py-2 pl-3">All Inventory</Link>
                  {dbCategories.map((cat, idx) => (
                      <Link 
                        key={idx} 
                        onClick={() => setIsMenuOpen(false)} 
                        href={`/cars?body_type=${encodeURIComponent(cat.body_type)}`} 
                        className="text-xs font-semibold text-neutral-500 hover:text-[#b48d36] transition-all duration-300 hover:translate-x-1 uppercase tracking-wider py-2 pl-3"
                      >
                        {cat.name}
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            {/* Sell Your Car Accordion */}
            <div>
              <button 
                onClick={() => toggleAccordion('sell')}
                className="w-full flex items-center justify-between px-4 py-3.5 transition-all duration-300 group cursor-pointer"
              >
                <span className="text-xs font-bold tracking-widest text-neutral-500 group-hover:text-[#b48d36] uppercase">SELL YOUR CAR</span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${openAccordions.sell ? 'rotate-180 text-[#b48d36]' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordions.sell ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-[var(--color-border)] ml-4 py-1">
                  <Link onClick={() => setIsMenuOpen(false)} href="/sell" className="text-xs font-semibold text-neutral-500 hover:text-[#b48d36] transition-all duration-300 hover:translate-x-1 uppercase tracking-wider py-2 pl-3">Get Free Quote</Link>
                  <Link onClick={() => setIsMenuOpen(false)} href="/about" className="text-xs font-semibold text-neutral-500 hover:text-[#b48d36] transition-all duration-300 hover:translate-x-1 uppercase tracking-wider py-2 pl-3">How It Works</Link>
                </div>
              </div>
            </div>

            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:pl-6 hover:text-[#b48d36] block ${pathname === '/about' ? 'text-[#b48d36] border-l-2 border-[#b48d36] pl-4 w-fit' : 'text-neutral-500 pl-4'}`}
            >
              ABOUT US
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:pl-6 hover:text-[#b48d36] block ${pathname === '/contact' ? 'text-[#b48d36] border-l-2 border-[#b48d36] pl-4 w-fit' : 'text-neutral-500 pl-4'}`}
            >
              CONTACT US
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
