'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SITE_NAME, SITE_TAGLINE, SITE_EMAIL, SITE_PHONE, WHATSAPP_NUMBER, BUSINESS_HOURS } from '@/lib/constants';

interface SettingsContextType {
  brand_name: string;
  brand_tagline: string;
  business_phone: string;
  business_whatsapp: string;
  business_email: string;
  business_address: string;
  business_hours: string;
}

const defaultSettings: SettingsContextType = {
  brand_name: SITE_NAME,
  brand_tagline: SITE_TAGLINE,
  business_phone: SITE_PHONE,
  business_whatsapp: WHATSAPP_NUMBER,
  business_email: SITE_EMAIL,
  business_address: 'Gurugram, Haryana',
  business_hours: BUSINESS_HOURS,
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsContextType>(defaultSettings);
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value');

        if (data && !error) {
          const loaded: Partial<SettingsContextType> = {};
          data.forEach((s) => {
            if (s.key === 'brand_name') loaded.brand_name = s.value;
            if (s.key === 'brand_tagline') loaded.brand_tagline = s.value;
            if (s.key === 'business_phone') loaded.business_phone = s.value;
            if (s.key === 'business_whatsapp') loaded.business_whatsapp = s.value;
            if (s.key === 'business_email') loaded.business_email = s.value;
            if (s.key === 'business_address') loaded.business_address = s.value;
            if (s.key === 'business_hours') loaded.business_hours = s.value;
          });
          setSettings((prev) => ({ ...prev, ...loaded }));
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
