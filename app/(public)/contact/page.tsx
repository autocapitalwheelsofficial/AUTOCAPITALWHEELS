import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactFormClient from '@/components/public/ContactFormClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { SITE_EMAIL, SITE_PHONE, BUSINESS_HOURS } from '@/lib/constants';

export const revalidate = 10;

export const metadata: Metadata = {
  title: 'Contact Us — AutoCapital Wheels',
  description: 'Get in touch with AutoCapital Wheels. Find our showroom showroom location in Delhi, contact numbers, email, business hours, or send us a message directly.',
};

async function getContactSettings() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['business_phone', 'business_email', 'business_address', 'business_hours']);

    const settings: Record<string, string> = {};
    if (data) {
      data.forEach((s) => {
        settings[s.key] = s.value;
      });
    }
    return settings;
  } catch (err) {
    console.error('Failed to load contact settings:', err);
    return {};
  }
}

export default async function ContactPage() {
  const settings = await getContactSettings();

  const phone = settings.business_phone || SITE_PHONE;
  const email = settings.business_email || SITE_EMAIL;
  const address = settings.business_address || 'PLOT NO-16 KILLA NO-12,13,25,21, NEW PALAM VIHAR PHASE II, SECTOR 110, GURUGRAM';
  const hours = settings.business_hours || BUSINESS_HOURS;

  const contactDetails = [
    {
      icon: Phone,
      title: 'Call or WhatsApp',
      value: phone,
      subValue: 'Available Mon–Sat',
      link: `tel:${phone.replace(/\s+/g, '')}`,
    },
    {
      icon: Mail,
      title: 'Email Address',
      value: email,
      subValue: 'Response within 24 hours',
      link: `mailto:${email}`,
    },
    {
      icon: MapPin,
      title: 'Showroom Location',
      value: address,
      subValue: 'Visit us for physical inspection & test drives',
      link: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: hours,
      subValue: 'We are happy to assist you',
      link: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-24 pb-16">
      {/* Header Banner */}
      <div className="border-b border-[#1f1f26] bg-[#0d0d10] py-16 px-4">
        <div className="container-custom max-w-5xl text-center">
          <div className="w-12 h-0.5 bg-[#b48d36] mx-auto mb-5" />
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mb-4 uppercase">
            Contact Us
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Have questions about a car, want to schedule a test drive, or ready to list your vehicle? We're here to help.
          </p>
        </div>
      </div>

      <div className="container-custom max-w-5xl py-14 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-display font-bold text-xl text-white mb-6 uppercase tracking-wider border-b border-[#1f1f26] pb-3">
              Get in Touch
            </h2>
            <div className="grid grid-cols-1 gap-5">
              {contactDetails.map((detail, idx) => {
                const Icon = detail.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#121215] rounded-2xl border border-[#1f1f26] p-5 flex items-start gap-4 hover:border-[#b48d36]/30 transition-all duration-300 shadow-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#b48d36]/10 border border-[#b48d36]/20 flex items-center justify-center text-[#b48d36] flex-shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                        {detail.title}
                      </h3>
                      {detail.link ? (
                        <a
                          href={detail.link}
                          target={detail.link.startsWith('http') ? '_blank' : undefined}
                          rel={detail.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="font-bold text-white text-sm hover:text-[#b48d36] transition-colors break-words"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="font-bold text-white text-sm break-words whitespace-pre-line">{detail.value}</p>
                      )}
                      <p className="text-[11px] text-neutral-400 font-light mt-1">{detail.subValue}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Contact Form Client */}
          <div className="lg:col-span-7 bg-[#121215] border border-[#1f1f26] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="font-display font-bold text-xl text-white mb-6 uppercase tracking-wider border-b border-[#1f1f26] pb-3">
              Send a Message
            </h2>
            <ContactFormClient />
          </div>
        </div>
      </div>
    </div>
  );
}
