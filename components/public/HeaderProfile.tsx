'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';
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
        <div className="absolute top-full right-0 mt-3 w-56 bg-[#121215] border border-neutral-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-scale z-50">
          
          <div className="px-4 py-3 border-b border-neutral-800 bg-[#1c1c21]/50">
            <p className="text-sm font-bold text-white truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0].toUpperCase()}
            </p>
            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
          </div>

          <div className="py-2">
            {user.email?.toLowerCase() === 'autocapitalwheelsofficial@gmail.com' && (
              <Link 
                href="/admin/dashboard" 
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-xs font-bold text-amber-500 hover:bg-neutral-800 transition-colors"
              >
                ADMIN DASHBOARD
              </Link>
            )}
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-[#b48d36] transition-colors"
            >
              MY PROFILE
            </Link>
            <Link 
              href="/profile?tab=wishlist" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-[#b48d36] transition-colors"
            >
              MY WISHLIST
            </Link>
          </div>

          <div className="py-2 border-t border-neutral-800">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              LOG OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
