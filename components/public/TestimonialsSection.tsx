'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Testimonial } from '@/types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);

  if (testimonials.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section className="py-16 bg-[#0a0a0c] border-t border-[#1f1f26]">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-bold text-[#b48d36] tracking-[0.2em] uppercase">TESTIMONIALS</span>
          </div>
          <h2 className="font-display font-light text-3xl sm:text-4xl text-white">
            What Our Customers <span className="font-bold text-[#b48d36]">Say</span>
          </h2>
        </div>

        {/* Desktop: show all in minimal columns */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col justify-between border-t border-[#1f1f26] pt-6 group"
            >
              <div>
                <p className="text-neutral-300 text-sm leading-relaxed font-light italic mb-6">
                  &ldquo;{testimonial.review}&rdquo;
                </p>
              </div>
              <div>
                <div className="font-bold text-xs text-white tracking-wide uppercase">{testimonial.customer_name}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5 tracking-wider uppercase font-semibold">
                  {testimonial.customer_location}
                  {testimonial.vehicle_purchased && ` • ${testimonial.vehicle_purchased}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: carousel */}
        <div className="md:hidden">
          <div className="border-t border-[#1f1f26] pt-6">
            <p className="text-neutral-300 text-sm leading-relaxed font-light italic mb-6">
              &ldquo;{testimonials[current].review}&rdquo;
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-white tracking-wide uppercase">{testimonials[current].customer_name}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5 tracking-wider uppercase font-semibold">{testimonials[current].customer_location}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="p-2 border border-[#1f1f26] text-neutral-400 rounded hover:text-white hover:bg-neutral-800 transition-colors" aria-label="Previous">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={next} className="p-2 border border-[#1f1f26] text-neutral-400 rounded hover:text-white hover:bg-neutral-800 transition-colors" aria-label="Next">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
