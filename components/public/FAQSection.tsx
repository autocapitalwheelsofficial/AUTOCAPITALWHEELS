'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FAQ } from '@/types';
import { useSettings } from '@/components/public/SettingsProvider';
import { getWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils';

interface FAQSectionProps {
  faqs: FAQ[];
}

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-left gap-4"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <span className="font-semibold text-[var(--color-text-primary)] text-sm sm:text-base pr-4">{faq.question}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#b48d36]' : 'text-neutral-400'}`}
        />
      </button>
      <div
        id={`faq-answer-${faq.id}`}
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-light whitespace-pre-line">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { brand_name, business_whatsapp, business_email } = useSettings();

  return (
    <section className="py-8 lg:py-10 bg-[var(--color-bg-base)]">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="divider mx-auto" />
            <p className="section-label mb-2">FAQ</p>
            <h2 className="font-display font-black text-3xl text-[var(--color-text-primary)] uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2 font-light">
              Quick answers to common questions about buying and selling cars with {brand_name}.
            </p>
          </div>

          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Still have questions?{' '}
              <a
                href={getWhatsAppUrl(business_whatsapp, getDefaultWhatsAppMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b48d36] font-semibold hover:underline"
              >
                WhatsApp us directly
              </a>{' '}
              or{' '}
              <a href={`mailto:${business_email}`} className="text-[#b48d36] font-semibold hover:underline">
                send us an email
              </a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
