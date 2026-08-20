import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import LiveTracker from '@/components/public/LiveTracker';
import { SettingsProvider } from '@/components/public/SettingsProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://autocapitalwheels.com'),
  title: {
    default: 'AutoCapital Wheels — Trusted Pre-Owned Cars in Delhi',
    template: '%s | AutoCapital Wheels',
  },
  description:
    'Buy and sell trusted pre-owned cars in Delhi. AutoCapital Wheels offers a curated selection of quality second-hand cars with transparent pricing and honest deals.',
  keywords: ['used cars Delhi', 'pre-owned cars', 'second hand cars Delhi', 'sell my car Delhi', 'AutoCapital Wheels'],
  authors: [{ name: 'AutoCapital Wheels' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'AutoCapital Wheels',
    title: 'AutoCapital Wheels — Trusted Pre-Owned Cars in Delhi',
    description: 'Buy and sell trusted pre-owned cars in Delhi.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoCapital Wheels — Trusted Pre-Owned Cars in Delhi',
    description: 'Buy and sell trusted pre-owned cars in Delhi.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={`${inter.className} bg-[var(--color-bg-base)] text-neutral-800`}>
        <SettingsProvider>
          <LiveTracker />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
