'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar, Gauge, Fuel, Settings, Users, MapPin, Shield, CheckCircle,
  AlertCircle, X, ZoomIn, ChevronLeft, ChevronRight, MessageCircle, Phone
} from 'lucide-react';
import type { Vehicle } from '@/types';
import {
  formatPrice, formatMileage, getOwnershipLabel, getVehicleTitle,
  getWhatsAppUrl, getVehicleWhatsAppMessage
} from '@/lib/utils';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import EnquiryModal from './EnquiryModal';
import TestDriveModal from './TestDriveModal';
import VehicleCard from './VehicleCard';
import EmiCalculator from './EmiCalculator';

interface VehicleDetailClientProps {
  vehicle: Vehicle;
  similarVehicles: Vehicle[];
}

export default function VehicleDetailClient({ vehicle, similarVehicles }: VehicleDetailClientProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showTestDrive, setShowTestDrive] = useState(false);

  const title = getVehicleTitle(vehicle);
  const isSold = vehicle.status === 'Sold' || vehicle.availability === 'Sold';
  const whatsappUrl = getWhatsAppUrl(WHATSAPP_NUMBER, getVehicleWhatsAppMessage(title));

  const images = vehicle.vehicle_images?.length
    ? vehicle.vehicle_images.sort((a, b) => a.sort_order - b.sort_order)
    : vehicle.main_image_url
    ? [{ id: '0', url: vehicle.main_image_url, is_main: true, sort_order: 0, alt_text: title, caption: '' }]
    : [];

  const prevImage = () => setSelectedImageIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setSelectedImageIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  // Group features by category
  const featuresByCategory = (vehicle.vehicle_features || []).reduce((acc, feat) => {
    if (!acc[feat.category]) acc[feat.category] = [];
    acc[feat.category].push(feat.feature);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <>
      <div className="pt-20 min-h-screen bg-[#0a0a0c]">
        {/* Breadcrumb */}
        <div className="bg-[#0d0d10] border-b border-[#1f1f26]">
          <div className="container-custom py-4 text-[10px] font-bold tracking-widest uppercase text-neutral-500 flex items-center gap-2.5">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-neutral-700" />
            <Link href="/cars" className="hover:text-amber-400 transition-colors">Cars</Link>
            <ChevronRight size={12} className="text-neutral-700" />
            <span className="text-metallic-gold truncate drop-shadow-sm">{title}</span>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* LEFT — Gallery */}
            <div className="space-y-3">
              {/* Main Image */}
              <div
                className="gallery-main aspect-[4/3] relative cursor-zoom-in rounded-xl overflow-hidden border border-[#1f1f26]"
                onClick={() => setLightboxOpen(true)}
              >
                {images.length > 0 ? (
                  <Image
                    src={images[selectedImageIdx]?.url || '/placeholder-car.jpg'}
                    alt={images[selectedImageIdx]?.alt_text || title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                    No Image
                  </div>
                )}

                {/* Sold banner */}
                {isSold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <span className="badge badge-sold text-lg px-6 py-3">SOLD</span>
                    </div>
                  </div>
                )}

                {/* Marketing badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {vehicle.is_featured && <span className="badge badge-featured">Featured</span>}
                  {vehicle.is_new_arrival && <span className="badge badge-new">New Arrival</span>}
                  {vehicle.is_hot_deal && <span className="badge badge-hot">Hot Deal</span>}
                  {vehicle.is_price_drop && <span className="badge badge-price-drop">Price Drop</span>}
                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 p-1.5 rounded-md bg-black/40 text-white">
                  <ZoomIn size={14} />
                </div>

                {/* Image count */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-md">
                    {selectedImageIdx + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`flex-shrink-0 relative w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                        idx === selectedImageIdx ? 'border-neutral-900' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt_text || `${title} image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Vehicle Info */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                {vehicle.location && (
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-2">
                    <MapPin size={14} />
                    {vehicle.location}
                    {vehicle.registration_state && `, ${vehicle.registration_state}`}
                  </div>
                )}
                <h1 className="font-display font-black text-2xl sm:text-3xl text-white leading-tight">{title}</h1>
                {/* Marketing tags */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {vehicle.is_featured && (
                    <span style={{ backgroundColor: '#b48d36' }} className="text-white text-[8px] font-bold px-2 py-0.5 rounded tracking-widest uppercase shadow-md shadow-amber-500/10">
                      Featured
                    </span>
                  )}
                  {vehicle.is_new_arrival && (
                    <span className="bg-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 rounded tracking-widest uppercase shadow-md shadow-emerald-500/10">
                      New Arrival
                    </span>
                  )}
                  {vehicle.is_hot_deal && (
                    <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded tracking-widest uppercase shadow-md shadow-red-500/10">
                      Hot Deal
                    </span>
                  )}
                  {vehicle.is_price_drop && (
                    <span className="bg-amber-600 text-white text-[8px] font-bold px-2 py-0.5 rounded tracking-widest uppercase shadow-md shadow-amber-500/10">
                      Price Drop
                    </span>
                  )}
                </div>
                {vehicle.variant && (
                  <p className="text-neutral-500 mt-1">{vehicle.variant}</p>
                )}

                <div className="flex items-center gap-6 mt-3 pt-3 border-t border-neutral-100 w-full">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Selling Price</span>
                    <span className="text-3xl font-extrabold block text-neutral-800" style={{ color: '#1a1a1a', fontFamily: 'var(--font-display)' }}>
                      {formatPrice(vehicle.price)}
                    </span>
                  </div>
                  {vehicle.original_price && vehicle.original_price > vehicle.price && (
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Original Price</span>
                      <span className="text-base line-through block text-neutral-400 font-medium" style={{ color: '#9ca3af', fontFamily: 'var(--font-display)' }}>
                        {formatPrice(vehicle.original_price)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-2 font-medium">Price is indicative. Contact us for final quote.</p>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Calendar, label: 'Year', value: vehicle.year },
                  { icon: Gauge, label: 'Mileage', value: formatMileage(vehicle.mileage) },
                  { icon: Fuel, label: 'Fuel', value: vehicle.fuel_type },
                  { icon: Settings, label: 'Transmission', value: vehicle.transmission },
                  { icon: Users, label: 'Ownership', value: getOwnershipLabel(vehicle.ownership) },
                  { icon: MapPin, label: 'Location', value: vehicle.location || 'Gurugram' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#121215] rounded-lg border border-[#1f1f26] p-3 hover:border-[#b48d36]/30 hover:shadow-[0_0_20px_rgba(180,141,54,0.05)] transition-all duration-300">
                    <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                      <Icon size={13} />
                      <span className="text-xs">{label}</span>
                    </div>
                    <div className="font-semibold text-sm text-white">{value || 'N/A'}</div>
                  </div>
                ))}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                {!isSold ? (
                  <span className="badge badge-available text-sm">Available</span>
                ) : (
                  <span className="badge badge-sold text-sm">Sold</span>
                )}
                {vehicle.availability === 'Reserved' && (
                  <span className="badge badge-reserved text-sm">Reserved</span>
                )}
              </div>

              {/* Action Buttons */}
              {!isSold ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowEnquiry(true)}
                    className="btn-primary w-full py-4 text-base justify-center font-extrabold text-white bg-[#b48d36] hover:bg-[#9a7a2f] transition-all duration-300"
                    style={{ color: '#ffffff' }}
                    id="get-quotation-btn"
                  >
                    GET QUOTATION
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowTestDrive(true)}
                      className="inline-flex items-center justify-center gap-2 border border-[#b48d36] hover:border-[#9a7a2f] bg-neutral-100 hover:bg-neutral-200 font-extrabold py-3 px-4 rounded-lg text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer text-[#b48d36]"
                      style={{ color: '#b48d36' }}
                      id="request-test-drive-btn"
                    >
                      Request Test Drive
                    </button>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp py-3 justify-center text-sm font-extrabold text-white flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] rounded-lg"
                      style={{ color: '#ffffff' }}
                      id="whatsapp-vehicle-btn"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </a>
                  </div>
                  <a
                    href="tel:+918800243707"
                    className="flex items-center justify-center gap-2 w-full py-3.5 border border-neutral-300 hover:border-neutral-400 rounded-md text-sm font-bold bg-neutral-100 hover:bg-neutral-200 transition-all cursor-pointer"
                    style={{ color: '#1a1a1a' }}
                  >
                    <Phone size={15} style={{ color: '#1a1a1a' }} />
                    Call +91 8800243707
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-950/20 border border-red-900/60 rounded-lg p-4 text-center">
                    <p className="text-red-400 font-semibold text-sm">This vehicle has been sold.</p>
                    <p className="text-neutral-400 text-xs mt-1">Browse our available inventory for similar vehicles.</p>
                  </div>
                  <Link href="/cars" className="btn-primary w-full py-3 justify-center">
                    View Similar Cars
                  </Link>
                </div>
              )}

              {/* Document Status */}
              <div className="bg-[#121215] rounded-xl border border-[#1f1f26] p-4">
                <h3 className="font-semibold text-sm text-white mb-3">Documents & Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'RC Available', value: vehicle.rc_available },
                    { label: 'PUC', value: vehicle.puc_available },
                    { label: 'Insurance', value: vehicle.insurance_status && vehicle.insurance_status !== 'Expired' && vehicle.insurance_status !== 'Not Available' },
                    { label: 'No Accident', value: !vehicle.accident_history },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      {value ? (
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                      )}
                      <span className="text-neutral-300">{label}</span>
                    </div>
                  ))}
                </div>
                {vehicle.insurance_status && (
                  <p className="text-xs text-neutral-400 mt-2">Insurance: {vehicle.insurance_status}</p>
                )}
              </div>

              {/* EMI Calculator */}
              {!isSold && vehicle.price > 0 && (
                <div className="pt-2">
                  <EmiCalculator vehiclePrice={vehicle.price} />
                </div>
              )}
            </div>
          </div>

          {/* Detail Sections */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {vehicle.description && (
                <section className="bg-[#121215] rounded-xl border border-[#1f1f26] p-6">
                  <h2 className="font-display font-bold text-lg text-white mb-3">Vehicle Overview</h2>
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
                </section>
              )}

              {/* Specifications */}
              <section className="bg-[#121215] rounded-xl border border-[#1f1f26] p-6">
                <h2 className="font-display font-bold text-lg text-white mb-4">Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0">
                  {[
                    ['Make', vehicle.make],
                    ['Model', vehicle.model],
                    ['Variant', vehicle.variant],
                    ['Year', vehicle.year],
                    ['Registration Year', vehicle.registration_year],
                    ['Body Type', vehicle.body_type],
                    ['Fuel Type', vehicle.fuel_type],
                    ['Transmission', vehicle.transmission],
                    ['Engine', vehicle.engine_description || (vehicle.engine_cc ? `${vehicle.engine_cc}cc` : undefined)],
                    ['Colour', vehicle.colour],
                    ['Seating', vehicle.seating_capacity ? `${vehicle.seating_capacity} Seater` : undefined],
                    ['Mileage', formatMileage(vehicle.mileage)],
                    ['Ownership', getOwnershipLabel(vehicle.ownership)],
                    ['Location', vehicle.location],
                    ['Registration State', vehicle.registration_state],
                    ['Service History', vehicle.service_history],
                    ['Accident History', vehicle.accident_history ? 'Yes' : 'No'],
                    ['Warranty', vehicle.warranty_available ? (vehicle.warranty_description || 'Yes') : 'No'],
                  ]
                    .filter(([, val]) => val !== undefined && val !== null && val !== '')
                    .map(([label, value]) => (
                      <div key={String(label)} className="flex items-center justify-between py-2.5 border-b border-[#1f1f26] last:border-0">
                        <span className="text-sm text-neutral-400">{label}</span>
                        <span className="text-sm font-medium text-white text-right">{String(value)}</span>
                      </div>
                    ))}
                </div>
              </section>

              {/* Features */}
              {Object.keys(featuresByCategory).length > 0 && (
                <section className="bg-[#121215] rounded-xl border border-[#1f1f26] p-6">
                  <h2 className="font-display font-bold text-lg text-white mb-4">Features</h2>
                  <div className="space-y-5">
                    {Object.entries(featuresByCategory).map(([category, features]) => (
                      <div key={category}>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {features.map((feature) => (
                            <span
                              key={feature}
                              className="flex items-center gap-1.5 text-xs bg-neutral-900 border border-[#1f1f26] text-neutral-300 px-3 py-1.5 rounded-md"
                            >
                              <CheckCircle size={11} className="text-green-500" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Additional Info */}
              {vehicle.additional_info && (
                <section className="bg-[#121215] rounded-xl border border-[#1f1f26] p-6">
                  <h2 className="font-display font-bold text-lg text-white mb-3">Additional Information</h2>
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{vehicle.additional_info}</p>
                </section>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                <Shield size={14} className="inline mr-1.5 text-amber-600" />
                Vehicle specifications and details are provided as supplied and verified where possible. We recommend a thorough physical inspection before purchase. Final price subject to confirmation.
              </div>
            </div>

            {/* Right: Contact sticky */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 lg:sticky lg:top-20">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 bg-[#b48d36] rounded-full" />
                  <h3 className="font-display font-bold text-base text-neutral-800">Interested in this car?</h3>
                </div>

                {!isSold ? (
                  <div className="space-y-2.5">
                    {/* Primary CTA */}
                    <button
                      onClick={() => setShowEnquiry(true)}
                      className="w-full flex items-center justify-center gap-2 bg-[#b48d36] hover:bg-[#9a7a2f] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
                      style={{ color: '#ffffff' }}
                    >
                      Get Quotation
                    </button>

                    {/* Secondary CTA */}
                    <button
                      onClick={() => setShowTestDrive(true)}
                      className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 font-bold py-3 px-4 rounded-xl text-sm border border-neutral-300 transition-all duration-200 active:scale-[0.98]"
                      style={{ color: '#1a1a1a' }}
                    >
                      <span style={{ color: '#1a1a1a' }}>Request Test Drive</span>
                    </button>

                    {/* WhatsApp CTA */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 active:scale-[0.98]"
                      style={{ color: '#ffffff' }}
                    >
                      <MessageCircle size={15} />
                      WhatsApp Us
                    </a>
                  </div>
                ) : (
                  <Link href="/cars" className="w-full flex items-center justify-center bg-[#b48d36] hover:bg-[#9a7a2f] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200">
                    View Available Cars
                  </Link>
                )}

                {/* Contact */}
                <div className="mt-4 pt-4 border-t border-neutral-100 text-center">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">AutoCapital Wheels</p>
                  <a
                    href="tel:+918800243707"
                    className="flex items-center justify-center gap-2 w-full py-3 border border-neutral-300 hover:border-neutral-400 rounded-xl text-sm font-bold bg-neutral-100 hover:bg-neutral-200 transition-all cursor-pointer"
                    style={{ color: '#1a1a1a' }}
                  >
                    <Phone size={14} style={{ color: '#1a1a1a' }} />
                    Call +91 8800243707
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Vehicles */}
          {similarVehicles.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-neutral-800">Similar Cars</h2>
                <Link href="/cars" className="text-sm font-semibold text-neutral-500 hover:text-[#b48d36] transition-colors">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {similarVehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X size={22} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full mx-16" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedImageIdx].url}
              alt={images[selectedImageIdx].alt_text || title}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[85vh]"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {selectedImageIdx + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {showEnquiry && (
        <EnquiryModal vehicle={vehicle} onClose={() => setShowEnquiry(false)} />
      )}

      {/* Test Drive Modal */}
      {showTestDrive && (
        <TestDriveModal vehicle={vehicle} onClose={() => setShowTestDrive(false)} />
      )}
    </>
  );
}
