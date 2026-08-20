'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FAQ } from '@/types';

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
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  if (faqs.length === 0) return null;

  return (
    <section className="py-12 bg-[var(--color-bg-base)] border-t border-[var(--color-border)]">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-[1px] bg-[#b48d36]/50" />
              <p className="text-xs font-bold text-[#b48d36] tracking-[0.2em] uppercase">FAQ</p>
              <div className="w-8 h-[1px] bg-[#b48d36]/50" />
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text-primary)]">
              Frequently Asked Questions
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-3 text-base">
              Quick answers to common questions about buying and selling cars with AutoCapital Wheels.
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
                href="https://wa.me/918800243707"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b48d36] font-semibold hover:underline"
              >
                WhatsApp us directly
              </a>{' '}
              or{' '}
              <a href="mailto:autocapitalwheels@gmail.com" className="text-[#b48d36] font-semibold hover:underline">
                send us an email
              </a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
