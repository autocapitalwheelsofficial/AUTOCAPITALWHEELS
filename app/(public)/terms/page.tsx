import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — AutoCapital Wheels',
  description: 'Read the terms of service and conditions for using AutoCapital Wheels website and our vehicle transaction services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-20">
      {/* Header */}
      <div className="bg-[#0d0d10] text-white py-14 px-4 border-b border-[#1f1f26]">
        <div className="container-custom max-w-4xl text-center">
          <div className="w-10 h-0.5 bg-[#b48d36] mx-auto mb-4" />
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">Terms & Conditions</h1>
          <p className="text-neutral-400 text-sm font-light mt-2">
            Please read these terms carefully before utilizing our services.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom max-w-4xl py-12 px-4">
        <div className="bg-[#121215] border border-[#1f1f26] rounded-2xl p-6 sm:p-10 space-y-6 text-neutral-300 font-light leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#b48d36]">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or using the AutoCapital Wheels website, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree with these terms, please do not use this website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#b48d36]">2. Vehicle Listings & Descriptions</h2>
            <p>
              While AutoCapital Wheels makes every reasonable effort to verify vehicle listings, mileage logs, document status, and specifications, all vehicle descriptions are provided as supplied by the seller. We strongly encourage buyers to perform a thorough physical inspection and professional evaluation before finalizing a transaction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#b48d36]">3. Buying & Selling Transactions</h2>
            <p>
              All listed vehicle prices on the platform are indicative. Final sale pricing, terms, documentation handover, and payments are subject to a mutual written contract signed between the transacting parties at our showroom. We reserve the right to decline any listing or purchase request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#b48d36]">4. User Accounts & Safety</h2>
            <p>
              Users registering an account are responsible for maintaining the confidentiality of their profile login details. Any unauthorized transaction request or fraudulent vehicle listing will result in account suspension and appropriate legal recourse.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
