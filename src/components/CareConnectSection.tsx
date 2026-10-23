import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  HeartHandshake,
  X,
  Stethoscope
} from 'lucide-react';
import { ClinicProvider, Language } from '../types';
import { translations, formatLocalizedNumber } from '../i18n/translations';

interface CareConnectSectionProps {
  currentLang: Language;
  clinics: ClinicProvider[];
  onOpenScreeningModal: () => void;
}

export const CareConnectSection: React.FC<CareConnectSectionProps> = ({
  currentLang,
  clinics,
  onOpenScreeningModal,
}) => {
  const t = translations[currentLang];
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedClinicForBooking, setSelectedClinicForBooking] = useState<ClinicProvider | null>(null);

  // Booking Form State
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentConcern, setParentConcern] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredClinics = clinics.filter((c) => {
    if (selectedDivision === 'all') return true;
    return c.division.toLowerCase() === selectedDivision.toLowerCase();
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !parentPhone) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedClinicForBooking(null);
      setParentName('');
      setParentPhone('');
      setParentConcern('');
    }, 2800);
  };

  return (
    <section id="care-connect" className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#C85D26] uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>{currentLang === 'bn' ? 'বিশ্বস্ত সাহায্য ও ক্লিনিক' : 'Trusted Clinics & Pediatric Care'}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#2D3142] tracking-tight mt-1">
            {t.careTitle}
          </h2>
          <p className="text-sm text-[#5C6479] mt-1 max-w-2xl">
            {t.careSubtitle}
          </p>
        </div>

        {/* Division Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EED9C7] rounded-xl overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'all', label: currentLang === 'bn' ? 'সারা বাংলাদেশ' : 'All Bangladesh' },
            { id: 'dhaka', label: currentLang === 'bn' ? 'ঢাকা' : 'Dhaka' },
            { id: 'chittagong', label: currentLang === 'bn' ? 'চট্টগ্রাম' : 'Chittagong' },
            { id: 'sylhet', label: currentLang === 'bn' ? 'সিলেট' : 'Sylhet' },
          ].map((div) => (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedDivision === div.id
                  ? 'bg-[#FF8552] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#2D3142]'
              }`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency National Helpline Banner */}
      <div className="bg-[#FFF0E2] border border-[#F0D5C1] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-[#C85D26] flex items-center justify-center shrink-0 shadow-xs">
            <Phone className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#2D3142]">
            {t.hotlineBanner}
          </p>
        </div>
        <a
          href="tel:16263"
          className="px-4 py-2 bg-white text-[#C85D26] hover:bg-[#FAF4ED] border border-[#EED9C7] rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-xs"
        >
          {t.callClinic} (16263)
        </a>
      </div>

      {/* Verified Clinics Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClinics.map((clinic) => (
          <div
            key={clinic.id}
            className="group bg-white rounded-3xl border border-[#EED9C7] hover:border-[#FFB07C] transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md"
          >
            {/* Clinic Card Top */}
            <div>
              {clinic.image && (
                <div className="relative aspect-16/10 w-full overflow-hidden bg-[#FAF3EC]">
                  <img
                    src={clinic.image}
                    alt={currentLang === 'bn' ? clinic.nameBn : clinic.nameEn}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-[#2D3142]/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>{currentLang === 'bn' ? 'সরকারি ও প্রাতিষ্ঠানিক অনুমোদিত' : 'Verified Institution'}</span>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-[#C85D26] uppercase tracking-wide">
                    {currentLang === 'bn' ? clinic.institutionBn : clinic.institutionEn}
                  </div>
                  <h3 className="text-base font-bold text-[#2D3142] mt-0.5 group-hover:text-[#C85D26] transition-colors leading-snug">
                    {currentLang === 'bn' ? clinic.nameBn : clinic.nameEn}
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs text-[#5C6479]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8552] shrink-0 mt-0.5" />
                    <span>{currentLang === 'bn' ? clinic.addressBn : clinic.addressEn}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-[#2F6B47] shrink-0" />
                    <span className="truncate">
                      {currentLang === 'bn' ? clinic.specialtyBn : clinic.specialtyEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#7C8294]">
                    <Clock className="w-3.5 h-3.5 text-[#7C8294] shrink-0" />
                    <span>{t.consultationFee}: {clinic.consultationFeeRange}</span>
                  </div>
                </div>

                {/* Available Services */}
                <div className="pt-2 border-t border-[#F3E7DC]">
                  <div className="text-[11px] font-semibold text-[#2D3142] mb-1.5">
                    {currentLang === 'bn' ? 'সেবাসমূহ' : 'Services'}:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentLang === 'bn' ? clinic.servicesOfferedBn : clinic.servicesOfferedEn).map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-[#FFFAF5] border border-[#F0D5C1] text-[#5C6479] px-2 py-0.5 rounded-lg"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0 mt-2 flex items-center gap-2 border-t border-[#F3E7DC] pt-4">
              <a
                href={`tel:${clinic.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#EAF4EC] hover:bg-[#D6EBD9] text-[#2F6B47] rounded-xl text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.callClinic}</span>
              </a>

              <button
                onClick={() => setSelectedClinicForBooking(clinic)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FF8552] hover:bg-[#E67332] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.bookAppointment}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Inquiry Modal */}
      {selectedClinicForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3142]/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EED9C7] shadow-2xl p-6 sm:p-8 my-8 space-y-5">
            
            <div className="flex items-start justify-between gap-4 border-b border-[#F3E7DC] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#2D3142]">
                  {currentLang === 'bn' ? 'বিশেষজ্ঞ সেন্টারে যোগাযোগের অনুরোধ' : 'Request Clinic Appointment'}
                </h3>
                <p className="text-xs text-[#5C6479] mt-1">
                  {currentLang === 'bn' ? selectedClinicForBooking.nameBn : selectedClinicForBooking.nameEn}
                </p>
              </div>
              <button
                onClick={() => setSelectedClinicForBooking(null)}
                className="p-1.5 rounded-xl bg-[#FFFAF5] hover:bg-[#FAF4ED] text-[#7C8294] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#2D3142]">
                  {currentLang === 'bn' ? 'অনুরোধ সফলভাবে পাঠানো হয়েছে!' : 'Inquiry Submitted!'}
                </h4>
                <p className="text-xs text-[#5C6479] max-w-sm mx-auto leading-relaxed">
                  {currentLang === 'bn' 
                    ? 'কেন্দ্রের সমন্বয়ক শীঘ্রই আপনার দেওয়া নম্বরে যোগাযোগ করবেন।'
                    : 'The clinic coordinator will contact you shortly on your provided phone number.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#2D3142] mb-1">
                    {t.parentNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder={currentLang === 'bn' ? 'যেমন: তানিয়া সুলতানা' : 'e.g. Tania Sultana'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3142] mb-1">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder={currentLang === 'bn' ? '০১৭১২-XXXXXX' : '01712-XXXXXX'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3142] mb-1">
                    {currentLang === 'bn' ? 'পরামর্শের বিষয় (যেমন: দেরিতে কথা বলা, সোজা না বসা)' : 'Consultation Area'}
                  </label>
                  <textarea
                    rows={3}
                    value={parentConcern}
                    onChange={(e) => setParentConcern(e.target.value)}
                    placeholder={currentLang === 'bn' ? 'সন্তানের বিষয়ে কোনো কিছু জানানোর থাকলে লিখুন...' : 'Describe developmental symptoms or questions...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedClinicForBooking(null)}
                    className="px-4 py-2 font-semibold text-[#64748B] hover:text-[#2D3142]"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    {currentLang === 'bn' ? 'অনুরোধ পাঠান' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
