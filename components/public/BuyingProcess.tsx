'use client';

import { Search, FileText, CheckSquare, Handshake, ChevronRight, HelpCircle, Car } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import EnquiryModal from './EnquiryModal';

export default function BuyingProcess() {
  const [showEnquiry, setShowEnquiry] = useState(false);

  return (
    <section className="py-12 bg-[#0a0a0c]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: How It Works Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-8 bg-[#121215] border border-[#1f1f26] rounded-2xl p-8 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-extrabold text-[#b48d36] uppercase tracking-widest mb-1.5">How It Works</h2>
                <p className="text-neutral-400 text-xs font-light">Simple steps to buy or sell your car with ease.</p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 pt-4">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center space-y-3 flex-1">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 text-[#b48d36] flex items-center justify-center border border-amber-500/20 shadow-sm">
                    <Search size={22} className="stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-1">1. Search</h4>
                    <p className="text-[10px] text-neutral-400 font-light leading-relaxed max-w-[120px]">Find the car you want</p>
                  </div>
                </div>

                {/* Arrow 1 */}
                <div className="hidden md:block text-neutral-700">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center space-y-3 flex-1">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 text-[#b48d36] flex items-center justify-center border border-amber-500/20 shadow-sm">
                    <FileText size={22} className="stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-1">2. Get Quote</h4>
                    <p className="text-[10px] text-neutral-400 font-light leading-relaxed max-w-[120px]">Request a quote from us</p>
                  </div>
                </div>

                {/* Arrow 2 */}
                <div className="hidden md:block text-neutral-700">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center space-y-3 flex-1">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 text-[#b48d36] flex items-center justify-center border border-amber-500/20 shadow-sm">
                    <CheckSquare size={22} className="stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-1">3. Review Offer</h4>
                    <p className="text-[10px] text-neutral-400 font-light leading-relaxed max-w-[120px]">We review and share the best offer</p>
                  </div>
                </div>

                {/* Arrow 3 */}
                <div className="hidden md:block text-neutral-700">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center space-y-3 flex-1">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 text-[#b48d36] flex items-center justify-center border border-amber-500/20 shadow-sm">
                    <Handshake size={22} className="stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-1">4. Deal Done</h4>
                    <p className="text-[10px] text-neutral-400 font-light leading-relaxed max-w-[120px]">Close the deal with trust</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right: Interested in a Car? Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-4 bg-[#121215] border border-[#1f1f26] rounded-2xl p-8 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >

            <div className="space-y-6 h-full flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Interested in a Car?</h3>
                <p className="text-[10px] text-neutral-400 font-light">Get the best quote for your dream car.</p>
              </div>

              <ul className="space-y-2.5 pt-1 relative z-10">
                {[
                  { label: 'No commitment', desc: 'No commitment' },
                  { label: 'Best market price', desc: 'Best market price' },
                  { label: 'Quick & easy process', desc: 'Quick & easy process' },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-[10px] text-neutral-300 font-medium">
                    <svg className="w-3.5 h-3.5 text-[#b48d36] bg-amber-500/10 rounded-full p-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item.desc}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowEnquiry(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-neutral-800 text-white font-bold h-[42px] rounded-lg text-xs uppercase tracking-wider transition-all duration-200 mt-4 border border-neutral-800 text-white-keep"
                style={{ color: '#ffffff', backgroundColor: '#171717' }}
              >
                Request a Quote
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      {showEnquiry && (
        <EnquiryModal
          onClose={() => setShowEnquiry(false)}
        />
      )}
    </section>
  );
}
