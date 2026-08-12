import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer — AutoCapital Wheels',
  description: 'Read the general disclaimer of AutoCapital Wheels regarding vehicle information, pricing, and warranties.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-20">
      {/* Header */}
      <div className="bg-[#0d0d10] text-white py-14 px-4 border-b border-[#1f1f26]">
        <div className="container-custom max-w-4xl text-center">
          <div className="w-10 h-0.5 bg-[#b48d36] mx-auto mb-4" />
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">Disclaimer</h1>
          <p className="text-neutral-400 text-sm font-light mt-2">
            General limitations of liability and information policies.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom max-w-4xl py-12 px-4">
        <div className="bg-[#121215] border border-[#1f1f26] rounded-2xl p-6 sm:p-10 space-y-6 text-neutral-300 font-light leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#b48d36]">No Warranties</h2>
            <p>
              The information, specifications, pricing, and availability of vehicles listed on the AutoCapital Wheels website are provided "as is" and "as available". We do not warrant the absolute accuracy, completeness, or reliability of any details, including mileage statements or paint condition, without a physical verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#b48d36]">Indicative Pricing</h2>
            <p>
              Prices listed on this website represent standard estimates and are strictly indicative. The final purchase price of any vehicle is finalized only via a signed physical invoice at the time of transaction. Any booking request submitted through the website does not guarantee delivery or price locking.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#b48d36]">Third-Party Links</h2>
            <p>
              Our website may contain links to third-party services (such as bank finance portals or map navigation services). AutoCapital Wheels is not responsible for the contents, privacy terms, or actions of external websites, and clicking such links is done at the user's own discretion.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
