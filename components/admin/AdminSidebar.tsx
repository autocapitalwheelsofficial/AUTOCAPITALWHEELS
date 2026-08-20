'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Car, MessageSquare, UserCheck, Navigation,
  Image, Star, HelpCircle, Settings, LogOut, ChevronLeft, ChevronRight,
  BarChart3, FileText, Menu, X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/types';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/admin/sell-requests', label: 'Sell Requests', icon: FileText },
  { href: '/admin/test-drives', label: 'Test Drives', icon: Navigation },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/cms', label: 'Website CMS', icon: Settings },
  { href: '/admin/categories', label: 'Categories', icon: Image },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: UserCheck },
];

interface AdminSidebarProps {
  admin: Pick<AdminUser, 'email' | 'full_name' | 'role'>;
}

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();
  const [counts, setCounts] = useState<Record<string, number>>({
    enquiries: 0,
    sellRequests: 0,
    testDrives: 0,
  });

  useEffect(() => {
    const handleCountsUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setCounts(detail);
      }
    };
    window.addEventListener('acw-unread-counts', handleCountsUpdate);
    return () => window.removeEventListener('acw-unread-counts', handleCountsUpdate);
  }, []);

  // Close mobile menu when pathname changes (user navigated)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-[#121215] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-neutral-800">
        <div>
            <img src="/logo.png" alt="AutoCapital Wheels" className="h-10 w-auto object-contain select-none" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 hover:bg-white/10 rounded-md transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-[45] backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar flex-shrink-0 flex flex-col transition-all duration-300 ${
          collapsed ? 'lg:w-16' : 'lg:w-64'
        } ${
          mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 w-64 translate-x-0' : 'fixed inset-y-0 left-0 z-50 w-64 -translate-x-full lg:static lg:translate-x-0'
        }`}
      >
        {/* Logo / Header Area */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between min-h-[64px]">
          {!collapsed && (
            <div>
              <img src="/logo.png" alt="AutoCapital Wheels" className="h-12 w-auto object-contain select-none" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
          )}
          
          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-auto hidden lg:block"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Toggle */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-auto lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          
          let badgeCount = 0;
          if (href === '/admin/enquiries') badgeCount = counts.enquiries;
          if (href === '/admin/sell-requests') badgeCount = counts.sellRequests;
          if (href === '/admin/test-drives') badgeCount = counts.testDrives;

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`admin-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {badgeCount > 0 && (
                <span className={`ml-auto px-1.5 py-0.5 text-[9px] font-bold bg-red-600 text-white rounded-full min-w-[16px] text-center ${collapsed ? 'absolute -top-1 -right-1' : ''}`}>
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-white/10">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-white truncate">{admin.full_name}</p>
            <p className="text-xs text-white/40 truncate">{admin.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`admin-nav-item text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
