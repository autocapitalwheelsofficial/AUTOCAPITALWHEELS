'use client';

import { useState } from 'react';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch {
      setError('Failed to initialize Google login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl translate-y-1/2 translate-x-1/2" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* Logo */}
        <div className="text-center flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt="AutoCapital Wheels Logo"
            className="h-20 w-auto object-contain select-none mx-auto"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <p className="text-[9px] text-[#b48d36] font-semibold tracking-[0.3em] uppercase mt-2">
            SECURE PORTAL
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
            <Shield size={18} className="text-amber-500/90" />
            <h1 className="font-semibold text-white text-base">
              Authorized Portal Access
            </h1>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Admin access is restricted to authorized accounts only. Please sign in using your company Google account.
          </p>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-neutral-950 font-bold py-3.5 rounded-lg text-sm hover:bg-amber-400 hover:text-neutral-950 transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-neutral-600 tracking-wider uppercase">
          Secure Portal. Admin logins are audited and logged.
        </p>
      </div>
    </div>
  );
}
