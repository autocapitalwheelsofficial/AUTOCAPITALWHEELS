'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, X, CheckCircle2, Loader2 } from 'lucide-react';
import type { Testimonial } from '@/types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_location: '',
    review: '',
    rating: 5,
    vehicle_purchased: '',
  });

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const handleOpenModal = () => {
    setFormData({
      customer_name: '',
      customer_location: '',
      review: '',
      rating: 5,
      vehicle_purchased: '',
    });
    setError('');
    setSuccess(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
        }, 3000);
      } else {
        setError(json.error || 'Failed to submit review.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-8 lg:py-10 bg-[var(--color-bg-base)] border-t border-[var(--color-border)]">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 border-b border-[var(--color-border)] pb-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-[#b48d36] tracking-[0.2em] uppercase">TESTIMONIALS</span>
            </div>
            <h2 className="font-display font-light text-3xl sm:text-4xl text-[var(--color-text-primary)]">
              What Our Customers <span className="font-bold text-[#b48d36]">Say</span>
            </h2>
          </div>
          <button
            onClick={handleOpenModal}
            className="btn-accent self-start sm:self-auto"
          >
            Write a Review
          </button>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 italic text-xs font-light">
            No testimonials approved yet. Be the first to write a review!
          </div>
        ) : (
          <>
            {/* Desktop: show all in minimal columns */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-10">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex flex-col justify-between border-t border-[var(--color-border)] pt-6 group"
                >
                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          fill={i < (testimonial.rating || 5) ? 'currentColor' : 'none'}
                          className={i < (testimonial.rating || 5) ? 'text-amber-500' : 'text-neutral-700'}
                        />
                      ))}
                    </div>
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
                <div className="flex items-center gap-0.5 text-amber-500 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill={i < (testimonials[current].rating || 5) ? 'currentColor' : 'none'}
                      className={i < (testimonials[current].rating || 5) ? 'text-amber-500' : 'text-neutral-700'}
                    />
                  ))}
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed font-light italic mb-6">
                  &ldquo;{testimonials[current].review}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white tracking-wide uppercase">{testimonials[current].customer_name}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 tracking-wider uppercase font-semibold">
                      {testimonials[current].customer_location}
                      {testimonials[current].vehicle_purchased && ` • ${testimonials[current].vehicle_purchased}`}
                    </div>
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
          </>
        )}
      </div>

      {/* Customer Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <div>
                <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">Share Your Experience</h3>
                <p className="text-[9px] text-neutral-400 font-light uppercase tracking-wider mt-0.5">Submit your feedback review</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 size={48} className="text-[#b48d36] animate-bounce" />
                </div>
                <h4 className="font-display font-bold text-base text-white uppercase tracking-wider">Review Submitted!</h4>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  Thank you for your feedback! Your review has been sent to our team for moderation. It will show live on the website after approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-950/50 border border-red-900 rounded-lg p-3 text-xs text-red-400 text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Kumar"
                      className="w-full text-xs font-semibold px-3 py-2 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] text-white"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Your City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gurugram"
                      className="w-full text-xs font-semibold px-3 py-2 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] text-white"
                      value={formData.customer_location}
                      onChange={(e) => setFormData({ ...formData, customer_location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Vehicle Purchased</label>
                    <input
                      type="text"
                      placeholder="e.g. Hyundai Creta"
                      className="w-full text-xs font-semibold px-3 py-2 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] text-white"
                      value={formData.vehicle_purchased}
                      onChange={(e) => setFormData({ ...formData, vehicle_purchased: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Rating (1 to 5 Stars) *</label>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const starVal = idx + 1;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: starVal })}
                            className="text-neutral-500 hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            <Star
                              size={18}
                              fill={starVal <= formData.rating ? 'currentColor' : 'none'}
                              className={starVal <= formData.rating ? 'text-amber-500' : 'text-neutral-600'}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Your Feedback Statement *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your experience buying/selling with AutoCapital Wheels..."
                    className="w-full text-xs font-semibold px-3 py-2 bg-[#16161a] border border-neutral-800 rounded-lg focus:outline-none focus:border-[#b48d36] text-white resize-none leading-relaxed font-light"
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a845a] text-black font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : 'SUBMIT REVIEW'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
