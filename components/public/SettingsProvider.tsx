'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SITE_NAME, SITE_TAGLINE, SITE_EMAIL, SITE_PHONE, WHATSAPP_NUMBER, BUSINESS_HOURS } from '@/lib/constants';

interface SettingsContextType {
  brand_name: string;
  brand_tagline: string;
  business_phone: string;
  business_whatsapp: string;
  business_email: string;
  business_address: string;
  business_hours: string;
  social_instagram: string;
  social_facebook: string;
  social_youtube: string;
}

const defaultSettings: SettingsContextType = {
  brand_name: SITE_NAME,
  brand_tagline: SITE_TAGLINE,
  business_phone: SITE_PHONE,
  business_whatsapp: WHATSAPP_NUMBER,
  business_email: SITE_EMAIL,
  business_address: 'Gurugram, Haryana',
  business_hours: BUSINESS_HOURS,
  social_instagram: 'https://www.instagram.com/autocapital_wheel/',
  social_facebook: '',
  social_youtube: '',
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsContextType>(defaultSettings);

  useEffect(() => {
    // Fetch via public-settings API (uses admin client, bypasses RLS)
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public-settings');
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setSettings(prev => ({
            ...prev,
            brand_name: d.brand_name || prev.brand_name,
            brand_tagline: d.brand_tagline || prev.brand_tagline,
            business_phone: d.business_phone || prev.business_phone,
            business_whatsapp: d.business_whatsapp || prev.business_whatsapp,
            business_email: d.business_email || prev.business_email,
            business_address: d.business_address || prev.business_address,
            business_hours: d.business_hours || prev.business_hours,
            social_instagram: d.social_instagram ?? prev.social_instagram,
            social_facebook: d.social_facebook ?? prev.social_facebook,
            social_youtube: d.social_youtube ?? prev.social_youtube,
          }));
        }
      } catch (err) {
        console.error('Failed to load dynamic settings:', err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
