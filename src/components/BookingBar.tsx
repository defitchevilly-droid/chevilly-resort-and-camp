import React, { useState, useEffect } from 'react';
import { Calendar, Users, Compass, ArrowRight, Sparkles, BedDouble } from 'lucide-react';
import { Currency } from '../types';
import { ACCOMMODATION_DROPDOWN_ITEMS } from '../data/resortData';

interface BookingBarProps {
  currency: Currency;
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

export const BookingBar: React.FC<BookingBarProps> = ({
  onSearch,
  onInstantReserve,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'tour' | 'combo'>('room');
  const [roomCategory, setRoomCategory] = useState<string>('all');
  
  // Category list synced with Navbar and Admin Portal categories
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(() => {
    try {
      const saved = localStorage.getItem('chevilly_room_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => ({
            id: c.id,
            label: c.label || c.name || c.id,
          }));
        }
      }
    } catch {}
    return ACCOMMODATION_DROPDOWN_ITEMS.map((item) => ({ id: item.id, label: item.label }));
  });

  useEffect(() => {
    const syncCategories = () => {
      try {
        const saved = localStorage.getItem('chevilly_room_categories');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(
              parsed.map((c: any) => ({
                id: c.id,
                label: c.label || c.name || c.id,
              }))
            );
            return;
          }
        }
      } catch {}
      setCategories(ACCOMMODATION_DROPDOWN_ITEMS.map((item) => ({ id: item.id, label: item.label })));
    };

    window.addEventListener('storage', syncCategories);
    window.addEventListener('chevilly-categories-updated', syncCategories);
    return () => {
      window.removeEventListener('storage', syncCategories);
      window.removeEventListener('chevilly-categories-updated', syncCategories);
    };
  }, []);
  
  // Default dates: tomorrow and 3 days later
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      type: activeTab,
      category: activeTab === 'room' ? roomCategory : undefined,
      checkIn,
      checkOut,
      adults,
      children,
    });
  };

  return (
    <div className="w-full text-white">
      {/* Sleek Tab Selectors & Direct Booking Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/15 pb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Menu 1: Rooms & Villas */}
          <button
            type="button"
            onClick={() => setActiveTab('room')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-serif uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'room'
                ? 'bg-[#d4af37] text-[#0d1613] font-bold shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5" />
            <span>Rooms & Villas</span>
          </button>

          {/* Menu 2: Paket Meeting */}
          <button
            type="button"
            onClick={() => setActiveTab('tour')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-serif uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'tour'
                ? 'bg-[#d4af37] text-[#0d1613] font-bold shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Paket Meeting</span>
          </button>

          {/* Menu 3: Explore Wisata */}
          <button
            type="button"
            onClick={() => setActiveTab('combo')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-serif uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'combo'
                ? 'bg-[#d4af37] text-[#0d1613] font-bold shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Wisata</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#eed492] font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Garansi Tarif Resmi Langsung Resor</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`grid grid-cols-1 ${activeTab === 'room' ? 'sm:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-4'} gap-3.5 items-end`}>
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
            className="w-full bg-white/10 hover:bg-white/15 border border-white/25 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] font-mono cursor-pointer"
            required
          />
        </div>

        {/* Check-Out / Tour Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider font-medium text-stone-300 flex items-center gap-1.5">
            {activeTab === 'tour' ? (
              <>
                <Compass className="w-3.5 h-3.5 text-[#eed492]" />
                <span>Waktu Pilihan Tur</span>
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
              className="w-full bg-[#182a24]/90 border border-white/25 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              <option value="fajar" className="bg-[#182a24] text-white">Pagi Hari (04:30 WIB - Golden Hour)</option>
              <option value="siang" className="bg-[#182a24] text-white">Siang Hari (09:00 WIB - Alpine Clear)</option>
              <option value="senja" className="bg-[#182a24] text-white">Sore / Senja (15:30 WIB - Sunset Ridge)</option>
            </select>
          ) : (
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
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
            onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}
            className="w-full bg-white/10 hover:bg-white/15 border border-white/25 px-3.5 py-2.5 text-xs text-white text-left flex items-center justify-between cursor-pointer focus:outline-none focus:border-[#d4af37]"
          >
            <span className="font-medium">
              {adults} Dewasa{children > 0 ? `, ${children} Anak` : ''}
            </span>
            <span className="text-[10px] text-[#eed492]">Ubah</span>
          </button>

          {guestDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#14201b] border border-white/25 shadow-2xl p-4 z-40 text-stone-100">
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

        {/* CTA Button: Cek Ketersediaan (Transparan Glassmorphic di atas video) */}
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
    </div>
  );
};
