'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Car, MessageSquare, UserCheck, Navigation,
  Image, Star, HelpCircle, Settings, LogOut, ChevronLeft, ChevronRight,
  BarChart3, FileText
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
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

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
    <aside
      className={`admin-sidebar flex-shrink-0 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } hidden lg:flex`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between min-h-[64px]">
        {!collapsed && (
          <div>
            <div className="font-display font-black text-white text-sm leading-tight">AUTOCAPITAL</div>
            <div className="font-display font-black text-white text-sm leading-tight">WHEELS</div>
            <div className="text-[10px] text-amber-500 font-semibold tracking-widest uppercase">Admin</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`admin-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
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
  );
}
