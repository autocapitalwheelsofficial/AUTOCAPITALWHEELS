'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Phone, User, ChevronDown } from 'lucide-react';
import { NAV_LINKS, WHATSAPP_NUMBER } from '@/lib/constants';
import { getDefaultWhatsAppMessage, getWhatsAppUrl } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
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
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="AutoCapital Wheels Logo"
                className="h-16 lg:h-[72px] w-auto object-contain"
                onError={(e) => {
                  // Fallback if image not loaded
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col items-center justify-center leading-none">
                <div className="font-display font-black text-base lg:text-lg tracking-tight italic select-none">
                  <span className={isDarkHeader ? 'text-white/90' : 'text-[#5a6065]'}>AUTO</span>
                  <span className="text-[#b48d36]">CAPITAL</span>
                </div>
                <div className="flex items-center gap-1 -mt-0.5 select-none w-full justify-center">
                  <span className={`h-[1px] w-2 bg-gradient-to-r from-transparent ${isDarkHeader ? 'to-white/40' : 'to-[#5a6065]/50'}`} />
                  <span className={`font-display font-black text-[8px] tracking-[0.25em] uppercase ${isDarkHeader ? 'text-white/90' : 'text-[#5a6065]'}`}>
                    WHEELS
                  </span>
                  <span className={`h-[1px] w-2 bg-gradient-to-l from-transparent ${isDarkHeader ? 'to-amber-500/40' : 'to-[#b48d36]/50'}`} />
                </div>
              </div>
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
            <div className="flex items-center gap-6">
              {/* Phone contact */}
              <a
                href="tel:+918800243707"
                className={`hidden xl:flex items-center gap-2 text-xs font-bold transition-colors duration-200 ${contactColor}`}
              >
                <Phone size={14} className={isDarkHeader ? 'text-white/80' : 'text-neutral-600'} />
                +91 88002 43707
              </a>

              {/* Login / Profile CTA */}
              {user ? (
                <div className="relative group hidden lg:block">
                  <button className="flex items-center gap-2 bg-[#171717] hover:bg-neutral-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs tracking-wider transition-all duration-200 cursor-pointer">
                    <User size={13} />
                    {user.user_metadata?.full_name || user.email?.split('@')[0].toUpperCase()}
                  </button>
                  <div className="absolute right-0 top-[90%] pt-2 w-48 bg-[#121215] border border-[#1f1f26] rounded-lg shadow-lg py-2 hidden group-hover:block animate-fade-in-scale">
                    {user.email?.toLowerCase() === 'autocapitalwheelsofficial@gmail.com' && (
                      <Link href="/admin/dashboard" className="block px-4 py-2 text-xs font-bold text-amber-500 hover:bg-neutral-800 transition-colors">ADMIN DASHBOARD</Link>
                    )}
                    <Link href="/profile" className="block px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-[#b48d36] transition-colors">MY PROFILE</Link>
                    <Link href="/profile?tab=wishlist" className="block px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-[#b48d36] transition-colors">MY WISHLIST</Link>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push('/');
                        router.refresh();
                      }}
                      className="w-full text-left block px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-[#b48d36] transition-colors cursor-pointer"
                    >
                      LOG OUT
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden lg:inline-flex items-center justify-center bg-[#171717] hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs tracking-wider transition-all duration-200"
                >
                  Login / Sign Up
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-95"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                style={{ color: '#ffffff' }}
              >
                {isMenuOpen ? (
                  <X size={26} strokeWidth={3} style={{ color: '#ffffff' }} />
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
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
                onClick={() => setOpenAccordion(openAccordion === 'buy' ? null : 'buy')}
                className={`w-full text-left px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:pl-6 hover:text-amber-400 flex items-center justify-between ${pathname.startsWith('/cars') ? 'text-amber-500 border-l-2 border-amber-500 pl-4' : 'text-neutral-400 pl-4'}`}
              >
                BUY CARS
                <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === 'buy' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 pl-8 ${openAccordion === 'buy' ? 'max-h-[500px] opacity-100 py-2' : 'max-h-0 opacity-0 py-0'}`}>
                <Link onClick={() => setIsMenuOpen(false)} href="/cars" className="block py-2.5 text-xs font-semibold text-neutral-500 hover:text-amber-500 transition-colors uppercase tracking-wider">All Inventory</Link>
                <Link onClick={() => setIsMenuOpen(false)} href="/cars?body_type=SUV" className="block py-2.5 text-xs font-semibold text-neutral-500 hover:text-amber-500 transition-colors uppercase tracking-wider">SUVs</Link>
                <Link onClick={() => setIsMenuOpen(false)} href="/cars?body_type=Sedan" className="block py-2.5 text-xs font-semibold text-neutral-500 hover:text-amber-500 transition-colors uppercase tracking-wider">Sedans</Link>
                <Link onClick={() => setIsMenuOpen(false)} href="/cars?body_type=Luxury" className="block py-2.5 text-xs font-semibold text-neutral-500 hover:text-amber-500 transition-colors uppercase tracking-wider">Luxury Collection</Link>
              </div>
            </div>

            {/* Sell Your Car Accordion */}
            <div>
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'sell' ? null : 'sell')}
                className={`w-full text-left px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:pl-6 hover:text-amber-400 flex items-center justify-between ${pathname === '/sell' ? 'text-amber-500 border-l-2 border-amber-500 pl-4' : 'text-neutral-400 pl-4'}`}
              >
                SELL YOUR CAR
                <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === 'sell' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 pl-8 ${openAccordion === 'sell' ? 'max-h-[500px] opacity-100 py-2' : 'max-h-0 opacity-0 py-0'}`}>
                <Link onClick={() => setIsMenuOpen(false)} href="/sell" className="block py-2.5 text-xs font-semibold text-neutral-500 hover:text-amber-500 transition-colors uppercase tracking-wider">Get Free Quote</Link>
                <Link onClick={() => setIsMenuOpen(false)} href="/about" className="block py-2.5 text-xs font-semibold text-neutral-500 hover:text-amber-500 transition-colors uppercase tracking-wider">How It Works</Link>
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

            {user?.email?.toLowerCase() === 'autocapitalwheelsofficial@gmail.com' && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3.5 text-xs font-bold tracking-widest uppercase text-amber-500 font-extrabold border-l-2 border-amber-500 pl-4 w-fit transition-all duration-300 hover:pl-6 block"
              >
                ADMIN PANEL
              </Link>
            )}

            {user ? (
              <>
                <Link 
                  href="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3.5 text-xs font-bold tracking-widest uppercase text-neutral-400 pl-4 hover:pl-6 hover:text-amber-400 transition-all duration-300 block"
                >
                  My Profile
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsMenuOpen(false);
                    router.push('/');
                    router.refresh();
                  }}
                  className="px-4 py-3.5 text-xs font-bold tracking-widest uppercase text-neutral-400 pl-4 hover:pl-6 hover:text-amber-400 transition-all duration-300 text-left w-full cursor-pointer block"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3.5 text-xs font-bold tracking-widest uppercase text-neutral-400 pl-4 hover:pl-6 hover:text-amber-400 transition-all duration-300 block"
              >
                Login / Sign Up
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
