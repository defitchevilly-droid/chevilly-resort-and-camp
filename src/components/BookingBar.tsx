import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Users, Compass, ArrowRight, Sparkles, BedDouble, ChevronDown, X, MapPin, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import {
  Currency,
  RoomCategoryItem,
  FasilitasSaranaItem,
  FasilitasOperatingHour,
  ZonaPrabayarItem,
  ZonaRentalFacility,
} from '../types';
import { ACCOMMODATION_DROPDOWN_ITEMS } from '../data/resortData';
import {
  DEFAULT_FASILITAS_ITEMS,
  DEFAULT_FASILITAS_OPERATING_HOURS,
  DEFAULT_ZONA_ITEMS,
  DEFAULT_ZONA_RENTAL_FACILITIES,
} from '../data/fasilitasZonaDefaults';

interface BookingBarProps {
  currency: Currency;
  categories?: RoomCategoryItem[];
  fasilitasItems?: FasilitasSaranaItem[];
  fasilitasHours?: FasilitasOperatingHour[];
  zonaItems?: ZonaPrabayarItem[];
  zonaRentals?: ZonaRentalFacility[];
  onSearch: (params: {
    type: 'room' | 'tour' | 'combo';
    category?: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }) => void;
  onInstantReserve: () => void;
}

type BookingTab = 'room' | 'tour' | 'fasilitas' | 'zona';

const TAB_LABELS: Record<BookingTab, string> = {
  room: 'Rooms & Villas',
  tour: 'Paket Meeting',
  fasilitas: 'Fasilitas & Sarana',
  zona: 'Explore Zona',
};

export const BookingBar: React.FC<BookingBarProps> = ({
  categories: dbCategories,
  fasilitasItems: dbFasilitasItems,
  fasilitasHours: dbFasilitasHours,
  zonaItems: dbZonaItems,
  zonaRentals: dbZonaRentals,
  onSearch,
}) => {
  const activeFasilitasItems = (
    Array.isArray(dbFasilitasItems) ? dbFasilitasItems : DEFAULT_FASILITAS_ITEMS
  ).filter((item) => item.isActive !== false);
  const activeFasilitasHours =
    Array.isArray(dbFasilitasHours) ? dbFasilitasHours : DEFAULT_FASILITAS_OPERATING_HOURS;
  const activeZonaItems = (
    Array.isArray(dbZonaItems) ? dbZonaItems : DEFAULT_ZONA_ITEMS
  ).filter((item) => item.isActive !== false);
  const activeZonaRentals =
    Array.isArray(dbZonaRentals) ? dbZonaRentals : DEFAULT_ZONA_RENTAL_FACILITIES;

  const [activeTab, setActiveTab] = useState<BookingTab>('room');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [roomCategory, setRoomCategory] = useState<string>('all');
  const [fullboardPackage, setFullboardPackage] = useState<string>('fullboard-single');
  const [lightboxType, setLightboxType] = useState<'zona' | 'fasilitas' | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const zonaCarouselRef = useRef<HTMLDivElement | null>(null);
  const fasilitasCarouselRef = useRef<HTMLDivElement | null>(null);
  const lightboxTouchStartXRef = useRef<number | null>(null);

  // Category list strictly synced from backend database
  const categories =
    Array.isArray(dbCategories) && dbCategories.length > 0
      ? dbCategories.map((c) => ({
          id: c.id,
          label: c.label || c.name || c.id,
        }))
      : ACCOMMODATION_DROPDOWN_ITEMS.map((item) => ({ id: item.id, label: item.label }));

  // Default dates: 5 days from today and 7 days from today
  const today = new Date();
  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(today.getDate() + 5);
  const defaultCheckOut = new Date(today);
  defaultCheckOut.setDate(today.getDate() + 7);

  const [checkIn, setCheckIn] = useState(defaultCheckIn.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(defaultCheckOut.toISOString().split('T')[0]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const closeAll = () => {
    clearCloseTimer();
    setIsDropdownOpen(false);
    setIsPinnedOpen(false);
    setGuestDropdownOpen(false);
    setLightboxType(null);
  };

  const scrollCarousel = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'prev' | 'next',
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setIsPinnedOpen(true);
    const el = ref.current;
    if (!el) return;
    const step = Math.max(260, Math.round(el.clientWidth * 0.85));
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (direction === 'next') {
      if (el.scrollLeft >= maxScroll - 8) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 8) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  const handlePrevLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lightboxType) return;
    setIsPinnedOpen(true);
    const total = lightboxType === 'zona' ? activeZonaItems.length : activeFasilitasItems.length;
    if (total === 0) return;
    setLightboxIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNextLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lightboxType) return;
    setIsPinnedOpen(true);
    const total = lightboxType === 'zona' ? activeZonaItems.length : activeFasilitasItems.length;
    if (total === 0) return;
    setLightboxIndex((prev) => (prev + 1) % total);
  };

  // Auto-close on outside click or Escape key (and keyboard nav for Lightbox)
  useEffect(() => {
    if (!isDropdownOpen && !lightboxType) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (lightboxType) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeAll();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (lightboxType) {
          setLightboxType(null);
        } else {
          closeAll();
        }
      } else if (lightboxType) {
        const total = lightboxType === 'zona' ? activeZonaItems.length : activeFasilitasItems.length;
        if (total === 0) return;
        if (event.key === 'ArrowLeft') {
          setLightboxIndex((prev) => (prev - 1 + total) % total);
        } else if (event.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev + 1) % total);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, lightboxType, activeZonaItems.length, activeFasilitasItems.length]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  const handleTabHover = (tab: BookingTab) => {
    clearCloseTimer();
    setActiveTab(tab);
    setIsDropdownOpen(true);
    setGuestDropdownOpen(false);
  };

  const handleTabClick = (tab: BookingTab) => {
    clearCloseTimer();
    if (isDropdownOpen && isPinnedOpen && activeTab === tab) {
      closeAll();
      return;
    }
    setActiveTab(tab);
    setIsDropdownOpen(true);
    setIsPinnedOpen(true);
    setGuestDropdownOpen(false);
  };

  const handleContainerMouseEnter = () => {
    clearCloseTimer();
  };

  const handleContainerMouseLeave = () => {
    // Keep open if user pinned via click, is adjusting guests, viewing lightbox, or focused on a form field
    if (isPinnedOpen || guestDropdownOpen || lightboxType) return;
    const activeEl = document.activeElement;
    if (
      activeEl &&
      containerRef.current?.contains(activeEl) &&
      (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT')
    ) {
      return;
    }
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsDropdownOpen(false);
      setGuestDropdownOpen(false);
    }, 180);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'zona' || activeTab === 'fasilitas') return;
    onSearch({
      type: activeTab,
      category: activeTab === 'room' ? roomCategory : undefined,
      checkIn,
      checkOut,
      adults,
      children,
    });
    closeAll();
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
      className="relative w-full text-white"
    >
      {/* Compact Header Bar with Centered Category Dropdown Triggers */}
      <div className="flex flex-col items-center justify-center gap-2.5 px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="w-full max-w-4xl flex flex-wrap items-center justify-center gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
          {/* Menu 1: Rooms & Villas */}
          <button
            type="button"
            onMouseEnter={() => handleTabHover('room')}
            onClick={() => handleTabClick('room')}
            aria-expanded={isDropdownOpen && activeTab === 'room'}
            aria-haspopup="true"
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-serif uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
              isDropdownOpen && activeTab === 'room'
                ? 'bg-[#d4af37] text-[#0d1613] border-[#d4af37] font-bold shadow-md'
                : 'bg-white/5 border-white/15 text-stone-200 hover:text-white hover:bg-white/15 hover:border-[#d4af37]/50'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5 shrink-0" />
            <span>Rooms &amp; Villas</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                isDropdownOpen && activeTab === 'room' ? 'rotate-180 text-[#0d1613]' : 'text-[#eed492]'
              }`}
            />
          </button>

          {/* Menu 2: Paket Meeting */}
          <button
            type="button"
            onMouseEnter={() => handleTabHover('tour')}
            onClick={() => handleTabClick('tour')}
            aria-expanded={isDropdownOpen && activeTab === 'tour'}
            aria-haspopup="true"
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-serif uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
              isDropdownOpen && activeTab === 'tour'
                ? 'bg-[#d4af37] text-[#0d1613] border-[#d4af37] font-bold shadow-md'
                : 'bg-white/5 border-white/15 text-stone-200 hover:text-white hover:bg-white/15 hover:border-[#d4af37]/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Paket Meeting</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                isDropdownOpen && activeTab === 'tour' ? 'rotate-180 text-[#0d1613]' : 'text-[#eed492]'
              }`}
            />
          </button>

          {/* Menu 3: Fasilitas */}
          <button
            type="button"
            onMouseEnter={() => handleTabHover('fasilitas')}
            onClick={() => handleTabClick('fasilitas')}
            aria-expanded={isDropdownOpen && activeTab === 'fasilitas'}
            aria-haspopup="true"
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-serif uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
              isDropdownOpen && activeTab === 'fasilitas'
                ? 'bg-[#d4af37] text-[#0d1613] border-[#d4af37] font-bold shadow-md'
                : 'bg-white/5 border-white/15 text-stone-200 hover:text-white hover:bg-white/15 hover:border-[#d4af37]/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Fasilitas</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                isDropdownOpen && activeTab === 'fasilitas' ? 'rotate-180 text-[#0d1613]' : 'text-[#eed492]'
              }`}
            />
          </button>

          {/* Menu 4: Explore Zona */}
          <button
            type="button"
            onMouseEnter={() => handleTabHover('zona')}
            onClick={() => handleTabClick('zona')}
            aria-expanded={isDropdownOpen && activeTab === 'zona'}
            aria-haspopup="true"
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-serif uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
              isDropdownOpen && activeTab === 'zona'
                ? 'bg-[#d4af37] text-[#0d1613] border-[#d4af37] font-bold shadow-md'
                : 'bg-white/5 border-white/15 text-stone-200 hover:text-white hover:bg-white/15 hover:border-[#d4af37]/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Explore Zona</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                isDropdownOpen && activeTab === 'zona' ? 'rotate-180 text-[#0d1613]' : 'text-[#eed492]'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#eed492]/90 font-mono text-center">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
          <span>Garansi Tarif Resmi Langsung Resor</span>
        </div>
      </div>

      {/* Hover / Click Floating Availability Dropdown Panel */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 z-40 pt-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-[#14231e]/98 backdrop-blur-xl border border-[#d4af37]/45 shadow-[0_22px_55px_rgba(0,0,0,0.65)] p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/15">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-mono text-[#eed492]">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Cek Ketersediaan · {TAB_LABELS[activeTab]}</span>
              </div>
              <button
                type="button"
                onClick={closeAll}
                aria-label="Tutup panel cek ketersediaan"
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>Tutup</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeTab === 'fasilitas' ? (
              <div className="space-y-4">
                {/* Left-Right Card Carousel of All 11 Cropped Fasilitas & Sarana Photos */}
                <div className="relative">
                  {/* Left Arrow */}
                  <button
                    type="button"
                    onClick={(e) => scrollCarousel(fasilitasCarouselRef, 'prev', e)}
                    aria-label="Geser fasilitas ke kiri"
                    className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-2.5 bg-[#14231e]/95 hover:bg-[#d4af37] text-white hover:text-[#0d1613] border border-[#d4af37]/60 shadow-xl transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Scrollable Carousel Track */}
                  <div
                    ref={fasilitasCarouselRef}
                    className="flex gap-3.5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 [scrollbar-width:thin]"
                  >
                    {activeFasilitasItems.map((item, idx) => (
                      <div
                        key={item.id || item.code}
                        className="snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31.8%] bg-[#0f1c18] border border-white/15 hover:border-[#d4af37]/60 transition-colors flex flex-col overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsPinnedOpen(true);
                            setLightboxIndex(idx);
                            setLightboxType('fasilitas');
                          }}
                          className="relative aspect-[16/10] w-full overflow-hidden bg-[#182a24] cursor-zoom-in group focus:outline-none"
                          aria-label={`Perbesar foto ${item.name}`}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute top-2 left-2 bg-black/70 text-[#eed492] text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#d4af37]/40 backdrop-blur-xs">
                            {item.code}
                          </span>
                          <span className="absolute top-2 right-2 p-1.5 bg-black/65 group-hover:bg-black/85 text-white border border-white/20 backdrop-blur-xs transition-colors">
                            <ZoomIn className="w-3.5 h-3.5 text-[#eed492]" />
                          </span>
                        </button>

                        <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                          <div>
                            <h4 className="font-serif text-base font-medium text-white leading-snug">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-stone-300 mt-0.5 truncate">
                              Fasilitas &amp; Sarana Chevilly Resort
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-white/10 space-y-1 text-[11px]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-stone-400">Harga Sewa</span>
                              <span className="font-mono font-semibold text-[#eed492] text-right">{item.price}</span>
                            </div>
                            {item.capacity && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-stone-400">Kapasitas</span>
                                <span className="text-stone-200 font-medium">{item.capacity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  <button
                    type="button"
                    onClick={(e) => scrollCarousel(fasilitasCarouselRef, 'next', e)}
                    aria-label="Geser fasilitas ke kanan"
                    className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-2.5 bg-[#14231e]/95 hover:bg-[#d4af37] text-white hover:text-[#0d1613] border border-[#d4af37]/60 shadow-xl transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Compact Jam Operasional Reference Strip */}
                <div className="pt-3 border-t border-white/15 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[#eed492]">
                    <span>Jam Operasional Fasilitas &amp; Sarana</span>
                    <span className="text-stone-400">{activeFasilitasItems.length} Fasilitas · Geser Kiri / Kanan</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    {activeFasilitasHours.map((schedule) => (
                      <div
                        key={schedule.day}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 flex items-center justify-between gap-2"
                      >
                        <span className="text-stone-300 text-[10px]">{schedule.day}</span>
                        <span className="font-mono text-[#eed492] font-semibold text-[11px]">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'zona' ? (
              <div className="space-y-4">
                {/* Left-Right Card Carousel of All Cropped Zona Photos */}
                <div className="relative">
                  {/* Left Arrow */}
                  <button
                    type="button"
                    onClick={(e) => scrollCarousel(zonaCarouselRef, 'prev', e)}
                    aria-label="Geser zona ke kiri"
                    className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-2.5 bg-[#14231e]/95 hover:bg-[#d4af37] text-white hover:text-[#0d1613] border border-[#d4af37]/60 shadow-xl transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Scrollable Carousel Track */}
                  <div
                    ref={zonaCarouselRef}
                    className="flex gap-3.5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 [scrollbar-width:thin]"
                  >
                    {activeZonaItems.map((zona, idx) => (
                      <div
                        key={zona.id || zona.code}
                        className="snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31.8%] bg-[#0f1c18] border border-white/15 hover:border-[#d4af37]/60 transition-colors flex flex-col overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsPinnedOpen(true);
                            setLightboxIndex(idx);
                            setLightboxType('zona');
                          }}
                          className="relative aspect-[16/10] w-full overflow-hidden bg-[#182a24] cursor-zoom-in group focus:outline-none"
                          aria-label={`Perbesar foto ${zona.name}`}
                        >
                          <img
                            src={zona.image}
                            alt={zona.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute top-2 left-2 bg-black/70 text-[#eed492] text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#d4af37]/40 backdrop-blur-xs">
                            {zona.code}
                          </span>
                          <span className="absolute top-2 right-2 p-1.5 bg-black/65 group-hover:bg-black/85 text-white border border-white/20 backdrop-blur-xs transition-colors">
                            <ZoomIn className="w-3.5 h-3.5 text-[#eed492]" />
                          </span>
                        </button>

                        <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                          <div>
                            <h4 className="font-serif text-base font-medium text-white leading-snug">
                              {zona.name}
                            </h4>
                            <p className="text-[11px] text-stone-300 mt-0.5 truncate">
                              {zona.area}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-white/10 space-y-1 text-[11px]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-stone-400">Harga Sewa</span>
                              <span className="font-mono font-semibold text-[#eed492]">{zona.price}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-stone-400">Kapasitas</span>
                              <span className="text-stone-200 font-medium">{zona.capacity}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-stone-400">Luas</span>
                              <span className="text-stone-300 font-mono text-[10px] truncate">{zona.size}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  <button
                    type="button"
                    onClick={(e) => scrollCarousel(zonaCarouselRef, 'next', e)}
                    aria-label="Geser zona ke kanan"
                    className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-2.5 bg-[#14231e]/95 hover:bg-[#d4af37] text-white hover:text-[#0d1613] border border-[#d4af37]/60 shadow-xl transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Compact Harga Sewa Fasilitas Reference Strip */}
                <div className="pt-3 border-t border-white/15 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[#eed492]">
                    <span>Harga Sewa Fasilitas Tambahan</span>
                    <span className="text-stone-400">{activeZonaItems.length} Zona Prabayar · Geser Kiri / Kanan</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
                    {activeZonaRentals.map((fac) => (
                      <div
                        key={fac.label}
                        className="bg-white/5 border border-white/10 px-2.5 py-1.5 flex flex-col justify-between"
                      >
                        <span className="text-stone-300 text-[10px] truncate">{fac.label}</span>
                        <span className="font-mono text-[#eed492] font-semibold text-[11px]">{fac.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
            <form
              onSubmit={handleSubmit}
              className={`grid grid-cols-1 ${activeTab === 'room' ? 'sm:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-4'} gap-3.5 items-end`}
            >
              {/* Kategori Room & Villas Input Dropdown */}
              {activeTab === 'room' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-medium text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#eed492]" />
                    <span>Kategori Kamar</span>
                  </label>
                  <select
                    value={roomCategory}
                    onChange={(e) => setRoomCategory(e.target.value)}
                    onFocus={() => setIsPinnedOpen(true)}
                    className="w-full bg-[#182a24]/90 border border-white/25 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] cursor-pointer font-medium"
                  >
                    <option value="all" className="bg-[#182a24] text-white">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#182a24] text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Check-In */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider font-medium text-stone-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#eed492]" />
                  <span>Tanggal Kedatangan</span>
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  onFocus={() => setIsPinnedOpen(true)}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/25 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] font-mono cursor-pointer"
                  required
                />
              </div>

              {/* Check-Out / Paket Fullboard */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider font-medium text-stone-300 flex items-center gap-1.5">
                  {activeTab === 'tour' ? (
                    <>
                      <Compass className="w-3.5 h-3.5 text-[#eed492]" />
                      <span>Paket Fullboard</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-[#eed492]" />
                      <span>Tanggal Kepulangan</span>
                    </>
                  )}
                </label>
                {activeTab === 'tour' ? (
                  <select
                    value={fullboardPackage}
                    onChange={(e) => setFullboardPackage(e.target.value)}
                    onFocus={() => setIsPinnedOpen(true)}
                    className="w-full bg-[#182a24]/90 border border-white/25 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    <option value="fullboard-single" className="bg-[#182a24] text-white">Fullboard Single</option>
                    <option value="fullboard-twin" className="bg-[#182a24] text-white">Fullboard Twin</option>
                    <option value="fullboard-triple" className="bg-[#182a24] text-white">Fullboard Triple</option>
                  </select>
                ) : (
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    onFocus={() => setIsPinnedOpen(true)}
                    className="w-full bg-white/10 hover:bg-white/15 border border-white/25 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] font-mono cursor-pointer"
                    required
                  />
                )}
              </div>

              {/* Guests selector */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[11px] uppercase tracking-wider font-medium text-stone-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#eed492]" />
                  <span>Jumlah Tamu</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsPinnedOpen(true);
                    setGuestDropdownOpen(!guestDropdownOpen);
                  }}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/25 px-3.5 py-2.5 text-xs text-white text-left flex items-center justify-between cursor-pointer focus:outline-none focus:border-[#d4af37]"
                >
                  <span className="font-medium">
                    {adults} Dewasa{children > 0 ? `, ${children} Anak` : ''}
                  </span>
                  <span className="text-[10px] text-[#eed492]">Ubah</span>
                </button>

                {guestDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#14201b] border border-white/25 shadow-2xl p-4 z-50 text-stone-100">
                    <div className="flex items-center justify-between py-2 border-b border-white/15">
                      <div>
                        <div className="text-xs font-semibold text-white">Dewasa</div>
                        <div className="text-[10px] text-stone-300">Usia 13 tahun ke atas</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-7 h-7 flex items-center justify-center border border-white/30 text-sm hover:bg-white/10 text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-medium text-white">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(8, adults + 1))}
                          className="w-7 h-7 flex items-center justify-center border border-white/30 text-sm hover:bg-white/10 text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-xs font-semibold text-white">Anak-anak</div>
                        <div className="text-[10px] text-stone-300">Usia 0 - 12 tahun</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-7 h-7 flex items-center justify-center border border-white/30 text-sm hover:bg-white/10 text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-medium text-white">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(6, children + 1))}
                          className="w-7 h-7 flex items-center justify-center border border-white/30 text-sm hover:bg-white/10 text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGuestDropdownOpen(false)}
                      className="w-full mt-3 py-1.5 text-[11px] font-medium uppercase tracking-wider bg-[#d4af37] hover:bg-[#fae7b3] text-[#0d1613] font-bold transition-colors cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                )}
              </div>

              {/* CTA Button: Cek Ketersediaan */}
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#d4af37]/90 via-[#fae7b3]/95 to-[#d4af37]/90 hover:from-[#fae7b3] hover:to-[#dfbb72] text-[#0d1613] text-xs font-serif font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl border border-white/40"
                >
                  <span>Cek Ketersediaan</span>
                  <ArrowRight className="w-4 h-4 text-[#0d1613]" />
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Popup for Explore Zona & Fasilitas Carousels (Desktop & Mobile) */}
      {lightboxType && (() => {
        const isZona = lightboxType === 'zona';
        const total = isZona ? activeZonaItems.length : activeFasilitasItems.length;
        if (total === 0) return null;
        const safeIndex = lightboxIndex % total;
        const currentZona = isZona ? activeZonaItems[safeIndex] : null;
        const currentFasilitas = !isZona ? activeFasilitasItems[safeIndex] : null;
        const currentImage = currentZona ? currentZona.image : currentFasilitas!.image;
        const currentTitle = currentZona
          ? `${currentZona.name} — ${currentZona.area}`
          : currentFasilitas!.name;
        const currentMeta = currentZona
          ? `${safeIndex + 1} / ${total} · ${currentZona.price} · ${currentZona.capacity} · ${currentZona.size}`
          : `${safeIndex + 1} / ${total} · ${currentFasilitas!.price}${currentFasilitas!.capacity ? ` · Kapasitas ${currentFasilitas!.capacity}` : ''}`;

        return (
          <div
            onClick={() => setLightboxType(null)}
            onTouchStart={(e) => {
              lightboxTouchStartXRef.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (lightboxTouchStartXRef.current === null) return;
              const endX = e.changedTouches[0]?.clientX ?? lightboxTouchStartXRef.current;
              const deltaX = endX - lightboxTouchStartXRef.current;
              lightboxTouchStartXRef.current = null;
              if (Math.abs(deltaX) > 45) {
                if (deltaX < 0) handleNextLightbox();
                else handlePrevLightbox();
              }
            }}
            className="fixed inset-0 z-[100] w-screen h-[100dvh] bg-black/95 flex flex-col select-none animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-label={currentTitle}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/80 to-transparent shrink-0"
            >
              <div className="min-w-0">
                <div className="text-white font-serif text-sm sm:text-lg font-medium truncate">
                  {currentTitle}
                </div>
                <div className="text-[11px] font-mono text-[#eed492]">
                  {currentMeta}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxType(null)}
                aria-label="Tutup tampilan layar penuh"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-mono uppercase tracking-wider border border-white/25 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Tutup</span>
              </button>
            </div>

            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center px-2 sm:px-14 pb-4">
              <button
                type="button"
                onClick={handlePrevLightbox}
                aria-label={isZona ? 'Zona sebelumnya' : 'Fasilitas sebelumnya'}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 bg-black/65 hover:bg-black/90 text-white border border-white/25 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <img
                key={currentImage}
                src={currentImage}
                alt={currentTitle}
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-full w-full h-full object-contain"
              />

              <button
                type="button"
                onClick={handleNextLightbox}
                aria-label={isZona ? 'Zona berikutnya' : 'Fasilitas berikutnya'}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 bg-black/65 hover:bg-black/90 text-white border border-white/25 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
