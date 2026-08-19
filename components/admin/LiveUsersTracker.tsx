'use client';

import { useState, useEffect } from 'react';
import { Users, ShieldAlert, Monitor, User } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

interface ActiveUser {
  session_id: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  current_path: string;
  page_title: string;
  last_active_at: string;
}

export default function LiveUsersTracker() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveUsers = async () => {
    try {
      const res = await fetch('/api/live-tracker');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setActiveUsers(json.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch live traffic:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    // Poll every 4 seconds for real-time accuracy
    const interval = setInterval(fetchActiveUsers, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#121215] rounded-xl border border-[#1f1f26] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-[#1f1f26] flex items-center justify-between bg-[#16161a]/60">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping absolute" />
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-sm">Real-time Live Site Traffic</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Active users on the website right now</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold bg-green-950/40 text-green-400 rounded-full border border-green-900/30 flex items-center gap-1.5">
          <Users size={12} />
          {activeUsers.length} Active
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-[#1f1f26] max-h-[350px] overflow-y-auto">
        {loading && activeUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading live site traffic...</div>
        ) : activeUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Monitor size={24} className="mx-auto text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-500">No active visitors on the site right now</p>
          </div>
        ) : (
          activeUsers.map((visitor) => (
            <div key={visitor.session_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#16161a]/60 transition-colors">
              {/* User Identity */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#16161a] border border-[#1f1f26] flex items-center justify-center text-neutral-400 mt-0.5 flex-shrink-0">
                  <User size={15} />
                </div>
                <div>
                  <div className="font-semibold text-xs text-white">
                    {visitor.user_name || 'Anonymous Guest'}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {visitor.user_email || 'No email registered'}
                  </div>
                  {visitor.user_phone && (
                    <div className="text-[9px] text-[#b48d36] font-semibold mt-0.5">
                      📞 {visitor.user_phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Page */}
              <div className="min-w-0 flex-1 max-w-sm sm:text-right">
                <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-[#16161a] border border-[#1f1f26]/60 text-neutral-300 rounded">
                  {visitor.current_path === '/' ? 'Home Page' : visitor.current_path}
                </span>
                <div className="text-[11px] text-neutral-400 font-medium truncate mt-1">
                  {visitor.page_title}
                </div>
              </div>

              {/* Activity Timestamp */}
              <div className="text-right text-[10px] text-neutral-500 whitespace-nowrap self-end sm:self-center">
                Active {timeAgo(visitor.last_active_at) === 'just now' ? 'just now' : timeAgo(visitor.last_active_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
