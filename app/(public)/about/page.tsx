import type { Metadata } from 'next';
import { Shield, Sparkles, Handshake, Heart } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — AutoCapital Wheels',
  description: 'Learn more about AutoCapital Wheels, Delhi\'s premier pre-owned car dealership. Discover our values of 100% transparency, quality assurance, and premium service.',
};

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: '100% Transparency',
      description: 'We believe trust is earned through complete clarity. From detailed vehicle history reports to clear pricing policies, what you see is exactly what you get.',
    },
    {
      icon: Sparkles,
      title: 'Quality Above All',
      description: 'Every vehicle in our showroom undergoes a meticulous multi-point inspection and sanitization process before being showcased. Only the finest cars make the cut.',
    },
    {
      icon: Handshake,
      title: 'Reliable Partnerships',
      description: 'We guide you through the entire transaction seamlessly, from documentation transfer and RC transfer support to instant payouts when selling.',
    },
    {
      icon: Heart,
      title: 'Customer-First Approach',
      description: 'Our relationship doesn\'t end at delivery. We strive to provide premium post-sales support and expert consultation whenever you need it.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-24 pb-16">
      {/* Header Banner */}
      <div className="border-b border-[#1f1f26] bg-[#0d0d10] py-16 px-4">
        <div className="container-custom max-w-4xl text-center">
          <div className="w-12 h-0.5 bg-[#b48d36] mx-auto mb-5" />
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mb-4 uppercase">
            About AutoCapital Wheels
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Redefining the pre-owned luxury and premium automotive experience in Delhi with absolute trust and transparency.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom max-w-4xl py-14 px-4">
        {/* Our Story */}
        <section className="space-y-6 mb-16 text-center sm:text-left bg-[#121215] border border-[#1f1f26] rounded-2xl p-8 shadow-xl">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight border-b border-[#1f1f26] pb-3 mb-4 uppercase">
            Our Story
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-light">
            Founded with a vision to eliminate the ambiguity and friction typically associated with buying and selling pre-owned cars, <strong className="text-[#b48d36]">AutoCapital Wheels</strong> has grown to become one of the most trusted names in Delhi NCR's automotive space.
          </p>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-light">
            We specialize in curated, high-quality, pre-owned vehicles that meet strict cosmetic and mechanical standards. By prioritizing client satisfaction and rigorous quality verification, we deliver a premium dealership experience that matches the excitement of purchasing a brand-new car.
          </p>
        </section>

        {/* Our Core Values */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight text-center mb-10 uppercase">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#121215] rounded-2xl border border-[#1f1f26] p-6 flex flex-col items-center sm:items-start text-center sm:text-left hover:border-[#b48d36]/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-[#b48d36]/10 border border-[#b48d36]/20 flex items-center justify-center text-[#b48d36] mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-2 uppercase tracking-wide">
                    {val.title}
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to Action Box */}
        <section className="bg-[#121215] border border-[#1f1f26] rounded-2xl p-8 sm:p-10 text-center shadow-2xl">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white mb-4 uppercase tracking-wider">
            Ready to find your next ride?
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-xl mx-auto mb-8 leading-relaxed">
            Browse our carefully vetted inventory of premium pre-owned cars or request a direct quotation for your current vehicle today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cars" className="btn-primary py-3 px-8 text-xs font-bold tracking-widest uppercase rounded-lg">
              Explore Inventory
            </Link>
            <Link href="/sell" className="btn-secondary py-3 px-8 text-xs font-bold tracking-widest uppercase rounded-lg">
              Sell Your Car
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
