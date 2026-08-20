'use client';

import { Shield, Eye, Users, Star, CheckCircle, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

const trustPoints = [
  {
    icon: Shield,
    title: 'Quality Vehicles',
    description:
      'Each vehicle is carefully reviewed before listing. Vehicle details are provided as supplied and verified where possible.',
  },
  {
    icon: Eye,
    title: 'Transparent Deals',
    description:
      'We provide clear vehicle information, honest pricing, and upfront details — no hidden surprises.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description:
      'Simple enquiry and buying process. Our team is available to guide you from enquiry to delivery.',
  },
  {
    icon: Handshake,
    title: 'Trusted Assistance',
    description:
      'Whether you are buying or selling, our team helps throughout the process and handles your queries.',
  },
  {
    icon: CheckCircle,
    title: 'Complete Documentation',
    description:
      'Insurance status, RC availability, ownership history, and PUC status are clearly documented for each vehicle.',
  },
  {
    icon: Star,
    title: 'After-Purchase Support',
    description:
      'Our relationship with you does not end at the sale. We are available for any questions or concerns you have.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-8 lg:py-10 bg-white border-t border-[var(--color-border)] relative overflow-hidden">
      {/* Decorative luxury backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#b48d36]/3 rounded-full filter blur-3xl -translate-y-1/2" />
      
      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-bold text-[#b48d36] tracking-[0.2em] uppercase">WHY AUTOCAPITAL WHEELS</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[var(--color-text-primary)] uppercase tracking-wide">
            The AutoCapital <span className="text-metallic-gold">Difference</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-4 max-w-xl mx-auto text-sm font-medium leading-relaxed">
            We built this dealership on a simple principle: be the kind of car dealer you can actually trust.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trustPoints.map(({ icon: Icon, title, description }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.25, 1, 0.5, 1] }}
              className="p-8 bg-[#fafafc] border border-neutral-200/60 rounded-2xl transition-all duration-300 hover:border-[#b48d36]/40 group hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)]"
            >
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-[#b48d36]/10 border border-[#b48d36]/20 flex items-center justify-center text-[#b48d36] mb-6 group-hover:bg-[#b48d36] group-hover:text-white transition-all duration-300">
                <Icon size={22} className="stroke-[1.75]" />
              </div>
              <h3 className="font-display font-bold text-base text-[var(--color-text-primary)] mb-3">{title}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
