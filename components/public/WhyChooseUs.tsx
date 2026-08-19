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
    <section className="py-16 bg-[#0a0a0c] border-t border-[#1f1f26]">
      <div className="container-custom">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-bold text-[#b48d36] tracking-[0.2em] uppercase">WHY AUTOCAPITAL WHEELS</span>
          </div>
          <h2 className="font-display font-light text-3xl sm:text-4xl text-white">
            The AutoCapital <span className="font-bold text-[#b48d36]">Difference</span>
          </h2>
          <p className="text-neutral-400 mt-4 max-w-xl mx-auto text-sm font-light">
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
              className="p-6 bg-[#121215] border border-[#1f1f26] rounded-xl transition-all duration-300 hover:border-[#b48d36]/30 group hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50"
            >
              <div className="text-[#b48d36] mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={24} className="stroke-[1.5]" />
              </div>
              <h3 className="font-display font-semibold text-base text-white mb-2">{title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
