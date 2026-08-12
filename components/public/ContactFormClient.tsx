'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactFormClient() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setFormState('loading');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: data.name,
          customer_phone: data.phone,
          customer_email: data.email || null,
          message: `[Subject: ${data.subject}] ${data.message}`,
          preferred_contact: 'Phone',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFormState('success');
        reset();
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  if (formState === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-green-950/20 border border-green-900/60 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-500" size={28} />
        </div>
        <h3 className="font-display font-bold text-lg text-white mb-2">Message Sent!</h3>
        <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
          Thank you for contacting AutoCapital Wheels. Our representative will get in touch with you shortly.
        </p>
        <button
          onClick={() => setFormState('idle')}
          className="btn-secondary py-2.5 px-6 text-sm"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="form-label text-neutral-300">Full Name *</label>
        <input
          id="contact-name"
          type="text"
          placeholder="Your full name"
          className={`form-input bg-neutral-900 border-[#1f1f26] text-white focus:border-[#b48d36] focus:ring-0 ${errors.name ? 'border-red-500' : ''}`}
          {...register('name')}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-phone" className="form-label text-neutral-300">Mobile Number *</label>
          <div className="flex mt-1.5">
            <span className="flex items-center px-3 bg-[#1c1c21] border border-r-0 border-[#1f1f26] rounded-l-md text-sm text-neutral-400 font-medium">+91</span>
            <input
              id="contact-phone"
              type="tel"
              placeholder="10-digit number"
              maxLength={10}
              className={`form-input rounded-l-none bg-neutral-900 border-[#1f1f26] text-white focus:border-[#b48d36] focus:ring-0 ${errors.phone ? 'border-red-500' : ''}`}
              {...register('phone')}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="contact-email" className="form-label text-neutral-300">Email Address <span className="text-neutral-500 font-normal">(optional)</span></label>
          <input
            id="contact-email"
            type="email"
            placeholder="your@email.com"
            className={`form-input bg-neutral-900 border-[#1f1f26] text-white focus:border-[#b48d36] focus:ring-0 ${errors.email ? 'border-red-500' : ''}`}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="form-label text-neutral-300">Subject *</label>
        <input
          id="contact-subject"
          type="text"
          placeholder="e.g. Enquiry about Creta, Selling queries"
          className={`form-input bg-neutral-900 border-[#1f1f26] text-white focus:border-[#b48d36] focus:ring-0 ${errors.subject ? 'border-red-500' : ''}`}
          {...register('subject')}
        />
        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="form-label text-neutral-300">Message *</label>
        <textarea
          id="contact-message"
          rows={4}
          placeholder="Write your message here..."
          className={`form-input resize-none bg-neutral-900 border-[#1f1f26] text-white focus:border-[#b48d36] focus:ring-0 ${errors.message ? 'border-red-500' : ''}`}
          {...register('message')}
        />
        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
      </div>

      {formState === 'error' && (
        <p className="text-sm text-red-400 bg-red-950/20 border border-red-900/60 px-4 py-3 rounded-md">
          Something went wrong. Please try again or contact us directly on WhatsApp.
        </p>
      )}

      <button
        type="submit"
        disabled={formState === 'loading'}
        className="w-full bg-[#b48d36] hover:bg-[#a37e2c] text-black font-bold py-3.5 justify-center text-sm flex items-center justify-center gap-2 transition-all rounded-lg"
      >
        {formState === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending Message...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
