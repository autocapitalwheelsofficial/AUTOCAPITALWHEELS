import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { NAV_LINKS, WHATSAPP_NUMBER, SITE_EMAIL, SITE_PHONE } from '@/lib/constants';
import { getWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils';

const SocialIcons = {
  Instagram: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  Facebook: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  Youtube: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" /><polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  ),
};


export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d0d10] border-t border-[#1f1f26] text-neutral-400">

      {/* WhatsApp CTA Banner */}
      <div className="border-b border-[#1f1f26] bg-[#0f0f12]">
        <div className="container-custom py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white">Have a question? We're here to help.</p>
              <p className="text-xs text-neutral-500 mt-0.5">Typically replies within minutes on WhatsApp.</p>
            </div>
            <a
              href={getWhatsAppUrl(WHATSAPP_NUMBER, getDefaultWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#128C7E] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Link href="/">
                <img src="/logo.png" alt="AutoCapital Wheels" className="h-10 w-auto object-contain select-none" />
              </Link>
              <p className="text-[9px] font-bold tracking-widest text-[#b48d36] mt-2 uppercase">Trusted Cars. Trusted Deals.</p>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed font-light max-w-xs">
              Delhi's premium destination for certified pre-owned cars. Transparent pricing, expert team, and hassle-free deals.
            </p>

            {/* Social Links */}
            <div className="flex gap-2.5 mt-6">
              {[
                { href: '#', Icon: SocialIcons.Instagram, label: 'Instagram' },
                { href: '#', Icon: SocialIcons.Facebook,  label: 'Facebook' },
                { href: '#', Icon: SocialIcons.Youtube,   label: 'YouTube' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-[#1c1c21] border border-[#252530] hover:border-[#b48d36]/40 hover:bg-[#b48d36]/10 hover:text-[#b48d36] flex items-center justify-center text-neutral-500 transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-5">Navigate</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-neutral-500 hover:text-[#b48d36] transition-colors duration-150 flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-[1px] bg-[#b48d36] transition-all duration-200 inline-block" />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cars?availability=Available" className="text-xs text-neutral-500 hover:text-[#b48d36] transition-colors flex items-center gap-1.5 group">
                  <span className="w-0 group-hover:w-2 h-[1px] bg-[#b48d36] transition-all duration-200 inline-block" />
                  Available Cars
                </Link>
              </li>
              <li>
                <Link href="/profile?tab=wishlist" className="text-xs text-neutral-500 hover:text-[#b48d36] transition-colors flex items-center gap-1.5 group">
                  <span className="w-0 group-hover:w-2 h-[1px] bg-[#b48d36] transition-all duration-200 inline-block" />
                  Saved Cars
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-5">Services</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/cars',    label: 'Buy a Car' },
                { href: '/sell',    label: 'Sell Your Car' },
                { href: '/cars',    label: 'Request Test Drive' },
                { href: '/contact', label: 'Get Quotation' },
                { href: '/about',   label: 'About Us' },
                { href: '/profile', label: 'My Profile' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-xs text-neutral-500 hover:text-[#b48d36] transition-colors flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-[1px] bg-[#b48d36] transition-all duration-200 inline-block" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs text-neutral-500 hover:text-[#25d366] transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#25d366]/10 border border-[#25d366]/20 group-hover:bg-[#25d366]/20 flex items-center justify-center flex-shrink-0 transition-all">
                    <svg className="w-3.5 h-3.5 text-[#25d366]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  +91 8800243707
                </a>
              </li>
              <li>
                <a href={`tel:${SITE_PHONE}`} className="flex items-center gap-3 text-xs text-neutral-500 hover:text-[#b48d36] transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-[#1c1c21] border border-[#252530] group-hover:border-[#b48d36]/30 flex items-center justify-center flex-shrink-0 transition-all">
                    <Phone size={12} className="text-neutral-500 group-hover:text-[#b48d36]" />
                  </div>
                  {SITE_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE_EMAIL}`} className="flex items-center gap-3 text-xs text-neutral-500 hover:text-[#b48d36] transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-[#1c1c21] border border-[#252530] group-hover:border-[#b48d36]/30 flex items-center justify-center flex-shrink-0 transition-all">
                    <Mail size={12} className="text-neutral-500 group-hover:text-[#b48d36]" />
                  </div>
                  {SITE_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3 text-xs text-neutral-500">
                <div className="w-7 h-7 rounded-lg bg-[#1c1c21] border border-[#252530] flex items-center justify-center flex-shrink-0">
                  <MapPin size={12} className="text-neutral-500" />
                </div>
                <span className="leading-relaxed">Plot No. 12, Wazirpur Industrial Area, New Delhi, Delhi 110052</span>
              </li>
              <li className="flex items-start gap-3 text-xs text-neutral-500">
                <div className="w-7 h-7 rounded-lg bg-[#1c1c21] border border-[#252530] flex items-center justify-center flex-shrink-0">
                  <Clock size={12} className="text-neutral-500" />
                </div>
                <span className="leading-relaxed">Mon–Sat: 10am–7pm<br />Sunday: 11am–5pm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="border-t border-[#1a1a20]">
        <div className="container-custom py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-600">
            <p>© {currentYear} AutoCapital Wheels. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy-policy" className="hover:text-[#b48d36] transition-colors">Privacy Policy</Link>
              <Link href="/terms"          className="hover:text-[#b48d36] transition-colors">Terms &amp; Conditions</Link>
              <Link href="/disclaimer"     className="hover:text-[#b48d36] transition-colors">Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
