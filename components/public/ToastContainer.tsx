'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Info } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info';
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      const id = Date.now();
      setToasts([{ id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    };

    window.addEventListener('acw-toast', handleToast);
    return () => window.removeEventListener('acw-toast', handleToast);
  }, []);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 pointer-events-none w-full max-w-xs px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3.5 shadow-[0_15px_30px_rgba(0,0,0,0.08)] text-neutral-800 pointer-events-auto border-l-4 border-l-[#b48d36]"
          style={{
            animation: 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {t.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <Info size={16} className="text-[#b48d36] shrink-0" />
          )}
          <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-800">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
