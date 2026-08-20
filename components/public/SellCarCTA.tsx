import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SellCarCTA() {
  return (
    <section className="py-10 bg-[#faf9f6] border-y border-neutral-200/50 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-0.5 bg-amber-500" />
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sell Your Car</p>
            <div className="w-8 h-0.5 bg-amber-500" />
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 leading-tight">
            Thinking About<br />
            <span className="text-amber-500">Selling Your Car?</span>
          </h2>

          <p className="text-neutral-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-light">
            Submit your vehicle details and our team will review your car and contact you with the next steps.
            No instant valuation gimmicks — just an honest conversation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/sell"
              className="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md"
              id="sell-my-car-cta"
            >
              SELL MY CAR
              <ArrowRight size={14} className="ml-1" />
            </Link>
            <a
              href="https://wa.me/918800243707?text=Hello%20AutoCapital%20Wheels%2C%20I%20would%20like%20to%20sell%20my%20car.%20Please%20guide%20me%20on%20the%20next%20steps."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-3.5 text-xs font-bold tracking-widest uppercase rounded-lg shadow-sm"
            >
              WhatsApp Us Instead
            </a>
          </div>

          <p className="text-neutral-400 text-[10px] font-light">
            We do not charge any listing fee. Our team contacts every genuine submission.
          </p>
        </div>
      </div>
    </section>
  );
}
