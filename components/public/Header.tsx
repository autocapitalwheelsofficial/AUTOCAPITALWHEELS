'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Phone, User, ChevronDown } from 'lucide-react';
import { NAV_LINKS, WHATSAPP_NUMBER } from '@/lib/constants';
import { getDefaultWhatsAppMessage, getWhatsAppUrl } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import HeaderSearch from '@/components/public/HeaderSearch';
import HeaderProfile from '@/components/public/HeaderProfile';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({ buy: true, sell: true });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const headerBg = 'bg-[#0a0a0c] border-b border-neutral-800/80 shadow-md';

  const isDarkHeader = true;

  const textColor = 'text-white/80 hover:text-white';

  const contactColor = 'text-white/95 hover:text-white';

  const burgerColor = 'text-white hover:bg-white/10';

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
                  // Fallback if image not loaded
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
                  pathname === '/' ? 'text-amber-500' : textColor
                } hover:text-amber-400`}
              >
                HOME
                {pathname === '/' && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-amber-500" />
                )}
              </Link>

              {/* BUY CARS */}
              <Link
                href="/cars"
                className={`relative flex items-center gap-1 px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname.startsWith('/cars') ? 'text-amber-500' : textColor
                } hover:text-amber-400`}
              >
                BUY CARS
                <ChevronDown size={12} className="transition-transform duration-300 group-hover/nav:rotate-180" />
                {pathname.startsWith('/cars') && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-amber-500" />
                )}
              </Link>

              {/* SELL YOUR CAR */}
              <Link
                href="/sell"
                className={`relative flex items-center gap-1 px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname === '/sell' ? 'text-amber-500' : textColor
                } hover:text-amber-400`}
              >
                SELL YOUR CAR
                <ChevronDown size={12} className="transition-transform duration-300 group-hover/nav:rotate-180" />
                {pathname === '/sell' && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-amber-500" />
                )}
              </Link>

              {/* ABOUT US */}
              <Link
                href="/about"
                className={`relative px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname === '/about' ? 'text-amber-500' : textColor
                } hover:text-amber-400`}
              >
                ABOUT US
                {pathname === '/about' && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-amber-500" />
                )}
              </Link>

              {/* CONTACT US */}
              <Link
                href="/contact"
                className={`relative px-3.5 py-6 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                  pathname === '/contact' ? 'text-amber-500' : textColor
                } hover:text-amber-400`}
              >
                CONTACT US
                {pathname === '/contact' && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-amber-500" />
                )}
              </Link>

              {/* ADMIN PANEL (if applicable) */}
              {user?.email?.toLowerCase() === 'autocapitalwheelsofficial@gmail.com' && (
                <Link
                  href="/admin/dashboard"
                  className="relative px-3.5 py-6 text-[11px] font-extrabold tracking-widest uppercase transition-all duration-200 text-amber-500 hover:text-amber-400"
                >
                  ADMIN PANEL
                </Link>
              )}

              {/* FULL WIDTH MEGA MENU */}
              <div className="absolute top-full left-0 w-full opacity-0 invisible translate-y-4 transition-all duration-500 ease-out group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 z-[60]">
                <div className="w-full bg-[#121215]/95 backdrop-blur-3xl border-t border-b border-[#2a2a33] shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
                  
                  {/* Subtle Glows */}
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#b48d36]/5 rounded-full filter blur-3xl -translate-y-1/2" />
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-3xl translate-y-1/2" />

                  <div className="container-custom py-10 relative z-10">
                    <div className="grid grid-cols-4 gap-8">
                      
                      {/* Column 1: Buy Cars */}
                      <div className="space-y-4 border-r border-[#1f1f26]">
                        <h3 className="font-display font-black text-sm tracking-widest uppercase text-white mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Inventory
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <Link href="/cars" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">All Inventory</Link>
                          <Link href="/cars?body_type=SUV" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">Premium SUVs</Link>
                          <Link href="/cars?body_type=Sedan" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">Luxury Sedans</Link>
                          <Link href="/cars?body_type=Luxury" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">Exclusive Collection</Link>
                        </div>
                      </div>

                      {/* Column 2: Sell Your Car */}
                      <div className="space-y-4 border-r border-[#1f1f26]">
                        <h3 className="font-display font-black text-sm tracking-widest uppercase text-white mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Sell / Trade
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <Link href="/sell" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">Get Free Quote</Link>
                          <Link href="/about" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">How It Works</Link>
                        </div>
                      </div>

                      {/* Column 3: Company */}
                      <div className="space-y-4">
                        <h3 className="font-display font-black text-sm tracking-widest uppercase text-white mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Company
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <Link href="/about" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">About Us</Link>
                          <Link href="/contact" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">Contact Us</Link>
                          <Link href="/privacy-policy" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">Privacy Policy</Link>
                          <Link href="/terms" className="text-xs font-bold tracking-wider text-neutral-400 hover:text-amber-400 transition-colors uppercase py-1">Terms of Service</Link>
                        </div>
                      </div>

                      {/* Column 4: Premium Card */}
                      <div className="col-span-1 pl-4">
                        <div className="relative h-full rounded-2xl overflow-hidden group/card cursor-pointer border border-[#2a2a33]">
                          <img 
                            src="/mega-menu-luxury.png" 
                            alt="Luxury Collection" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          <div className="absolute inset-0 p-5 flex flex-col justify-end">
                            <h4 className="text-white font-display font-black text-lg uppercase tracking-wider mb-1">Discover Luxury</h4>
                            <p className="text-neutral-300 text-xs mb-3">Explore our handpicked collection of premium vehicles.</p>
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
              {/* Phone contact removed as per request */}

              {/* Search & Profile Icons */}
              <div className="flex items-center gap-1">
                <HeaderSearch isDarkHeader={isDarkHeader} />
                <HeaderProfile user={user} isDarkHeader={isDarkHeader} />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? (
                  <X size={20} className={isDarkHeader ? 'text-white' : 'text-neutral-600'} />
                ) : (
                  <Menu size={20} className={isDarkHeader ? 'text-white' : 'text-neutral-600'} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

       {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-500"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 bg-[#0f0f11]/95 backdrop-blur-xl border-l border-neutral-800/80 shadow-2xl lg:hidden transform transition-transform duration-500 ease-out flex flex-col justify-between ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-6 border-b border-neutral-800/60">
            <div className="flex items-center">
              <img src="/logo.png" alt="AutoCapital Wheels" className="h-10 w-auto object-contain" />
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="p-6 flex flex-col gap-1.5 overflow-y-auto">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:pl-6 hover:text-amber-400 block ${pathname === '/' ? 'text-amber-500 border-l-2 border-amber-500 pl-4 w-fit' : 'text-neutral-400 pl-4'}`}
            >
              HOME
            </Link>

            {/* Buy Cars / Inventory Accordion */}
            <div>
              <button 
                onClick={() => toggleAccordion('buy')}
                className="w-full flex items-center justify-between px-4 py-3.5 transition-all duration-300 group cursor-pointer"
              >
                <span className="text-xs font-bold tracking-widest text-neutral-400 group-hover:text-amber-400 uppercase">BUY CARS</span>
                <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 ${openAccordions.buy ? 'rotate-180 text-amber-500' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordions.buy ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-neutral-800 ml-4 py-1">
                  <Link onClick={() => setIsMenuOpen(false)} href="/cars" className="text-xs font-semibold text-neutral-500 hover:text-amber-400 transition-colors uppercase tracking-wider py-2 pl-3">All Inventory</Link>
                  <Link onClick={() => setIsMenuOpen(false)} href="/cars?body_type=SUV" className="text-xs font-semibold text-neutral-500 hover:text-amber-400 transition-colors uppercase tracking-wider py-2 pl-3">SUVs</Link>
                  <Link onClick={() => setIsMenuOpen(false)} href="/cars?body_type=Sedan" className="text-xs font-semibold text-neutral-500 hover:text-amber-400 transition-colors uppercase tracking-wider py-2 pl-3">Sedans</Link>
                  <Link onClick={() => setIsMenuOpen(false)} href="/cars?body_type=Luxury" className="text-xs font-semibold text-neutral-500 hover:text-amber-400 transition-colors uppercase tracking-wider py-2 pl-3">Luxury Collection</Link>
                </div>
              </div>
            </div>

            {/* Sell Your Car Accordion */}
            <div>
              <button 
                onClick={() => toggleAccordion('sell')}
                className="w-full flex items-center justify-between px-4 py-3.5 transition-all duration-300 group cursor-pointer"
              >
                <span className="text-xs font-bold tracking-widest text-neutral-400 group-hover:text-amber-400 uppercase">SELL YOUR CAR</span>
                <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 ${openAccordions.sell ? 'rotate-180 text-amber-500' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordions.sell ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-neutral-800 ml-4 py-1">
                  <Link onClick={() => setIsMenuOpen(false)} href="/sell" className="text-xs font-semibold text-neutral-500 hover:text-amber-400 transition-colors uppercase tracking-wider py-2 pl-3">Get Free Quote</Link>
                  <Link onClick={() => setIsMenuOpen(false)} href="/about" className="text-xs font-semibold text-neutral-500 hover:text-amber-400 transition-colors uppercase tracking-wider py-2 pl-3">How It Works</Link>
                </div>
              </div>
            </div>

            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:pl-6 hover:text-amber-400 block ${pathname === '/about' ? 'text-amber-500 border-l-2 border-amber-500 pl-4 w-fit' : 'text-neutral-400 pl-4'}`}
            >
              ABOUT US
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:pl-6 hover:text-amber-400 block ${pathname === '/contact' ? 'text-amber-500 border-l-2 border-amber-500 pl-4 w-fit' : 'text-neutral-400 pl-4'}`}
            >
              CONTACT US
            </Link>


          </nav>
        </div>
      </div>
    </>
  );
}
