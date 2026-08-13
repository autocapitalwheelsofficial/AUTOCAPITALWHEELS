'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LiveTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Generate or fetch session ID from sessionStorage
    let sessionId = sessionStorage.getItem('acw_live_session_id');
    if (!sessionId) {
      sessionId = 'sess-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
      sessionStorage.setItem('acw_live_session_id', sessionId);
    }

    const sendHeartbeat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        const payload = {
          session_id: sessionId,
          user_name: user?.user_metadata?.full_name || user?.user_metadata?.name || null,
          user_email: user?.email || null,
          user_phone: user?.user_metadata?.phone || user?.phone || null,
          current_path: pathname || window.location.pathname,
          page_title: document.title || 'AutoCapital Wheels',
        };

        await fetch('/api/live-tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        // Silent error
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 10 seconds
    const interval = setInterval(sendHeartbeat, 10000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
