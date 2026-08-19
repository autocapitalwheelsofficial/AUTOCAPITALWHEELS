'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Heart, LayoutDashboard, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function HeaderProfile({ user, isDarkHeader }: { user: any; isDarkHeader?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push('/');
    router.refresh();
  };

  const iconColor = isDarkHeader ? 'text-white' : 'text-neutral-600';

  return (
    <div className="relative" ref={profileRef}>
      {/* Trigger Button */}
      <button
        onClick={handleProfileClick}
        className="p-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-95 flex items-center justify-center cursor-pointer"
        aria-label="User Profile"
      >
        <User size={20} className={iconColor} />
      </button>

      {/* Profile Dropdown */}
      {isOpen && user && (
        <div className="fixed top-20 right-4 w-[calc(100vw-2rem)] sm:absolute sm:top-full sm:right-0 sm:w-64 mt-3 bg-[#121215]/90 backdrop-blur-2xl border border-[#2a2a33] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in-scale z-[60]">
          
          <div className="px-5 py-4 border-b border-[#2a2a33] bg-gradient-to-b from-white/[0.05] to-transparent">
            <p className="text-sm font-bold text-white truncate drop-shadow-md">
              {user.user_metadata?.full_name || user.email?.split('@')[0].toUpperCase()}
            </p>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="py-2 px-2">
            {user.email?.toLowerCase() === 'autocapitalwheelsofficial@gmail.com' && (
              <Link 
                href="/admin/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-amber-500 hover:bg-amber-500/10 hover:translate-x-1 rounded-xl transition-all duration-300"
              >
                <LayoutDashboard size={14} />
                ADMIN DASHBOARD
              </Link>
            )}
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white hover:translate-x-1 rounded-xl transition-all duration-300"
            >
              <User size={14} />
              MY PROFILE
            </Link>
            <Link 
              href="/profile?tab=wishlist" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white hover:translate-x-1 rounded-xl transition-all duration-300"
            >
              <Heart size={14} />
              MY WISHLIST
            </Link>
          </div>

          <div className="p-2 border-t border-[#2a2a33] bg-black/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 cursor-pointer"
            >
              <LogOut size={14} />
              LOG OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
