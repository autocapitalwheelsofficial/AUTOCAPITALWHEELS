'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';

interface AlertItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  created_at: string;
}

export default function AdminRealtimeNotifier() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());

  // Function to synthesize a clean, high-tech notification chime sound
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Chime tone 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      
      // Chime tone 2
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain2.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.68);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);

      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.5);
      osc2.start(audioCtx.currentTime + 0.08);
      osc2.stop(audioCtx.currentTime + 0.68);
    } catch (e) {
      // Sound blocked by browser autoplay policy
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            // Dispatch unread counts to the sidebar
            window.dispatchEvent(new CustomEvent('acw-unread-counts', { detail: json.counts }));

            // Check for new alerts we haven't shown yet
            const newAlerts: AlertItem[] = json.recentAlerts || [];
            let hasNew = false;
            
            newAlerts.forEach((alert) => {
              if (!shownIds.has(alert.id)) {
                shownIds.add(alert.id);
                setAlerts((prev) => [...prev, alert]);
                hasNew = true;
              }
            });

            if (hasNew) {
              setShownIds(new Set(shownIds));
              playNotificationSound();
            }
          }
        }
      } catch (err) {
        console.error('Failed to poll notifications:', err);
      }
    };

    // Run first check
    fetchNotifications();

    // Poll every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, [shownIds]);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-neutral-900 border border-amber-500/30 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-slide-in relative overflow-hidden"
        >
          {/* Decorative left accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
          
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5">
            <Bell size={16} className="animate-bounce" />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h4 className="font-bold text-xs text-neutral-100 flex items-center gap-1.5">
              {alert.title}
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            </h4>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">{alert.message}</p>
            <Link
              href={alert.link}
              onClick={() => removeAlert(alert.id)}
              className="inline-block mt-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider"
            >
              View Details →
            </Link>
          </div>

          <button
            onClick={() => removeAlert(alert.id)}
            className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
