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

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { href: '/', label: 'HOME' },
                { href: '/cars', label: 'INVENTORY' },
                { href: '/sell', label: 'SELL YOUR CAR' },
                { href: '/about', label: 'ABOUT US' },
                { href: '/contact', label: 'CONTACT US' },
                ...(user?.email?.toLowerCase() === 'autocapitalwheelsofficial@gmail.com'
                  ? [{ href: '/admin/dashboard', label: 'ADMIN PANEL' }]
                  : []),
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
                    link.label === 'ADMIN PANEL'
                      ? 'text-amber-500 hover:text-amber-400 font-extrabold'
                      : pathname === link.href
                      ? 'text-amber-500'
                      : textColor
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-amber-500" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-6 flex-shrink-0">
              {/* Phone contact */}
              <a
                href="tel:+918800243707"
                className={`hidden xl:flex items-center gap-2 text-xs font-bold transition-colors duration-200 ${contactColor}`}
              >
                <Phone size={14} className={isDarkHeader ? 'text-white/80' : 'text-neutral-600'} />
                +91 88002 43707
              </a>

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
