import React, { useState, useEffect, useRef } from 'react';
import { Currency, VisitorUser, RoomCategoryItem } from '../types';
import { Menu, X, BookmarkCheck, User, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { ACCOMMODATION_DROPDOWN_ITEMS } from '../data/resortData';

interface NavbarProps {
  currency: Currency;
  onToggleCurrency: () => void;
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
  bookingsCount: number;
  currentUser?: VisitorUser | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
  onSelectRoomCategory?: (category: string) => void;
  categories?: RoomCategoryItem[];
}

const RESTO_CAFE_ITEMS = [
  { id: 'vine-restaurant', name: 'Vine Restaurant', searchKey: 'Vine Restaurant' },
  { id: 'le-ciel-cafe', name: 'Le Ciel Cafe', searchKey: 'Le Ciel' },
  { id: 'pujasera-1', name: 'Pujasera 1', searchKey: 'Pujasera 1' },
  { id: 'pujasera-3', name: 'Pujasera 3', searchKey: 'Pujasera 3' },
  { id: 'oleh-oleh', name: 'Oleh-Oleh', searchKey: 'Oleh-Oleh' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onToggleCurrency,
  onOpenBooking,
  onOpenMyBookings,
  bookingsCount,
  currentUser,
  onOpenLogin,
  onLogout,
  onSelectRoomCategory,
  categories: dbCategories,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [mobileRoomsExpanded, setMobileRoomsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [diningDropdownOpen, setDiningDropdownOpen] = useState(false);
  const [mobileDiningExpanded, setMobileDiningExpanded] = useState(false);
  const diningDropdownRef = useRef<HTMLDivElement>(null);

  const categories =
    Array.isArray(dbCategories) && dbCategories.length > 0
      ? dbCategories.map((c) => ({
          id: c.id,
          label: c.label || c.name || c.id,
        }))
      : ACCOMMODATION_DROPDOWN_ITEMS.map((item) => ({ id: item.id, label: item.label }));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoomDropdownOpen(false);
      }
      if (diningDropdownRef.current && !diningDropdownRef.current.contains(e.target as Node)) {
        setDiningDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    setRoomDropdownOpen(false);
    setDiningDropdownOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectDiningItem = (searchKey: string) => {
    setDiningDropdownOpen(false);
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('chevilly-select-dining', { detail: searchKey }));
    scrollTo('dining');
  };

  const handleSelectAccommodation = (catId: string) => {
    setRoomDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onSelectRoomCategory) {
      onSelectRoomCategory(catId);
    } else {
      const el = document.getElementById(`room-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        scrollTo('suites');
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 font-['Outfit',sans-serif] antialiased ${
        isScrolled
          ? 'bg-black/40 backdrop-blur-md border-b border-[#d4af37]/30 py-3 sm:py-3.5 shadow-lg'
          : 'bg-black border-b border-[#d4af37]/20 py-3.5 sm:py-4.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-6 sm:gap-8">
        {/* Brand / Logo Zone with uploaded gold emblem */}
        <a
          href="#"
          className="flex items-center group shrink-0 focus:outline-none"
          aria-label="Chevilly Resort and Camp"
        >
          <img
            src="/assets/aistudio/LOGO_KUNING_2_7dfae9a0.png"
            alt="Chevilly Resort and Camp Logo"
            className="h-11 sm:h-14 w-auto object-contain transition-all duration-500 group-hover:scale-105 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.65))_drop-shadow(0_0_16px_rgba(212,175,55,0.55))_drop-shadow(0_4px_28px_rgba(238,212,146,0.32))] group-hover:[filter:drop-shadow(0_3px_8px_rgba(0,0,0,0.75))_drop-shadow(0_0_22px_rgba(212,175,55,0.75))_drop-shadow(0_6px_34px_rgba(250,231,179,0.45))]"
          />
        </a>

        {/* Navigation links with luxury gold typography */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11.5px] lg:text-xs tracking-[0.2em] uppercase font-normal">
          {/* Dropdown: Rooms & Villas - Clean & Sederhana Cuma Nama Kategori */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setRoomDropdownOpen(true)}
            onMouseLeave={() => setRoomDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setRoomDropdownOpen((prev) => !prev)}
              aria-expanded={roomDropdownOpen}
              aria-haspopup="true"
              className="text-[#e8d29b] hover:text-[#fff5db] transition-colors relative py-1 cursor-pointer flex items-center gap-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fae7b3] after:transition-all after:duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] group"
            >
              <span>Rooms & Villas</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#dfb76c] transition-transform duration-200 ${
                  roomDropdownOpen ? 'rotate-180 text-white' : 'group-hover:translate-y-0.5'
                }`}
              />
            </button>

            {/* Dropdown Menu Overlay - Clean & Sederhana Cuma Tampil Nama Kategori */}
            {roomDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-[#0c1613]/98 backdrop-blur-2xl border border-[#d4af37]/40 shadow-[0_15px_35px_rgba(0,0,0,0.7)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectAccommodation(cat.id)}
                      className="w-full text-left px-4 py-2 hover:bg-[#d4af37]/20 text-[#e8d29b] hover:text-[#fff5db] transition-colors text-xs tracking-wider uppercase font-medium cursor-pointer"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => scrollTo('expeditions')}
            className="text-[#e8d29b] hover:text-[#fff5db] transition-colors relative py-1 cursor-pointer after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fae7b3] after:transition-all after:duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          >
            Explore Wisata
          </button>
          <button
            onClick={() => scrollTo('wellness')}
            className="text-[#e8d29b] hover:text-[#fff5db] transition-colors relative py-1 cursor-pointer after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fae7b3] after:transition-all after:duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          >
            Wedding Premium
          </button>
          {/* Dropdown: Resto & Cafe */}
          <div
            ref={diningDropdownRef}
            className="relative"
            onMouseEnter={() => setDiningDropdownOpen(true)}
            onMouseLeave={() => setDiningDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDiningDropdownOpen((prev) => !prev)}
              aria-expanded={diningDropdownOpen}
              aria-haspopup="true"
              className="text-[#e8d29b] hover:text-[#fff5db] transition-colors relative py-1 cursor-pointer flex items-center gap-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fae7b3] after:transition-all after:duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] group"
            >
              <span>Resto & Cafe</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#dfb76c] transition-transform duration-200 ${
                  diningDropdownOpen ? 'rotate-180 text-white' : 'group-hover:translate-y-0.5'
                }`}
              />
            </button>

            {/* Dropdown Menu Overlay: Resto & Cafe */}
            {diningDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 min-w-[210px] bg-[#0c1613]/98 backdrop-blur-2xl border border-[#d4af37]/40 shadow-[0_15px_35px_rgba(0,0,0,0.7)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  {RESTO_CAFE_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectDiningItem(item.searchKey)}
                      className="w-full text-left px-4 py-2 hover:bg-[#d4af37]/20 text-[#e8d29b] hover:text-[#fff5db] transition-colors text-xs tracking-wider uppercase font-medium cursor-pointer border-b border-white/5 last:border-0"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => scrollTo('meeting')}
            className="text-[#e8d29b] hover:text-[#fff5db] transition-colors relative py-1 cursor-pointer after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fae7b3] after:transition-all after:duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          >
            Meeting
          </button>
          <button
            onClick={() => scrollTo('map')}
            className="text-[#e8d29b] hover:text-[#fff5db] transition-colors relative py-1 cursor-pointer after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fae7b3] after:transition-all after:duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-semibold"
          >
            Peta Kawasan
          </button>

          {/* Visitor Profile (if logged in) */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenMyBookings}
                className="flex items-center gap-1.5 text-xs text-[#edd28d] hover:text-[#fff5db] bg-[#d4af37]/15 border border-[#d4af37]/50 px-2.5 py-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                title="Lihat Akun & Reservasi"
              >
                <User className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="font-medium max-w-[95px] truncate">{currentUser.name.split(' ')[0]}</span>
                {bookingsCount > 0 && (
                  <span className="font-mono text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-[#d4af37]/30 text-[#fff0c8] font-semibold">
                    {bookingsCount}
                  </span>
                )}
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Keluar Akun Tamu"
                  className="p-1 text-[#a89d87] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </nav>

        {/* Right zone: Currency Switcher & Gold Luxury CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleCurrency}
            aria-label="Ganti Mata Uang"
            className="px-2.5 py-1 text-[11px] font-mono tracking-wider transition-all duration-300 cursor-pointer border border-[#d4af37]/45 text-[#ebd6a0] hover:text-white hover:border-[#fce5a3] hover:bg-[#d4af37]/15 bg-black/30 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
          >
            {currency}
          </button>

          <button
            onClick={onOpenMyBookings}
            className="px-4 sm:px-5 py-2 text-xs font-medium tracking-[0.2em] uppercase text-[#0d1613] bg-gradient-to-r from-[#cfab60] via-[#eed492] to-[#cfab60] hover:from-[#eed492] hover:via-[#fff1c7] hover:to-[#eed492] transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_0_18px_rgba(212,175,55,0.35)] border border-[#fae7b3]/70 hover:shadow-[0_0_24px_rgba(212,175,55,0.6)] flex items-center gap-2 group"
            title="Kelola & Lihat Total Reservasi Anda"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-[#0d1613] group-hover:scale-110 transition-transform" />
            <span>Reservasi</span>
            {bookingsCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-[#182a24] text-[#fae7b3] font-bold shadow-xs">
                {bookingsCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 transition-colors cursor-pointer text-[#eed492] hover:text-[#fff5db]"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with luxury dark translucent gold styling */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a1210]/95 backdrop-blur-2xl border-b border-[#d4af37]/30 px-6 py-6 shadow-2xl animate-in fade-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4 text-xs font-medium uppercase tracking-[0.16em] text-[#e8d29b]">
            {currentUser && (
              <div className="p-3 bg-[#13221e] border border-[#d4af37]/30 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#d4af37]" />
                  <div className="text-left">
                    <div className="font-semibold text-white truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-[#edd28d]">{currentUser.membershipTier || 'Priority Guest'}</div>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 underline"
                  >
                    Keluar
                  </button>
                )}
              </div>
            )}

            {/* Rooms & Villas Accordion - Clean & Sederhana Cuma Nama Kategori */}
            <div className="border-b border-[#d4af37]/15 pb-1">
              <button
                onClick={() => setMobileRoomsExpanded(!mobileRoomsExpanded)}
                className="w-full text-left py-2 hover:text-[#fff5db] transition-colors flex items-center justify-between"
              >
                <span>Rooms & Villas</span>
                <ChevronDown className={`w-4 h-4 text-[#dfb76c] transition-transform ${mobileRoomsExpanded ? 'rotate-180' : ''}`} />
              </button>

              {mobileRoomsExpanded && (
                <div className="pl-3 pr-1 py-1 space-y-0.5 bg-[#101b17] border-l-2 border-[#d4af37]/50 my-1 animate-in fade-in duration-200">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectAccommodation(cat.id)}
                      className="w-full text-left py-2 px-2 hover:bg-[#d4af37]/10 text-xs font-semibold uppercase tracking-wider text-[#fae7b3] hover:text-white transition-colors"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => scrollTo('expeditions')}
              className="text-left py-2 hover:text-[#fff5db] transition-colors border-b border-[#d4af37]/15 flex items-center justify-between"
            >
              <span>Explore Wisata</span>
              <span className="text-[10px] text-[#dfb76c]/60">→</span>
            </button>
            <button
              onClick={() => scrollTo('wellness')}
              className="text-left py-2 hover:text-[#fff5db] transition-colors border-b border-[#d4af37]/15 flex items-center justify-between"
            >
              <span>Wedding Premium</span>
              <span className="text-[10px] text-[#dfb76c]/60">→</span>
            </button>
            {/* Resto & Cafe Accordion */}
            <div className="border-b border-[#d4af37]/15 pb-1">
              <button
                onClick={() => setMobileDiningExpanded(!mobileDiningExpanded)}
                className="w-full text-left py-2 hover:text-[#fff5db] transition-colors flex items-center justify-between"
              >
                <span>Resto & Cafe</span>
                <ChevronDown className={`w-4 h-4 text-[#dfb76c] transition-transform ${mobileDiningExpanded ? 'rotate-180' : ''}`} />
              </button>

              {mobileDiningExpanded && (
                <div className="pl-3 pr-1 py-1 space-y-0.5 bg-[#101b17] border-l-2 border-[#d4af37]/50 my-1 animate-in fade-in duration-200">
                  {RESTO_CAFE_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectDiningItem(item.searchKey)}
                      className="w-full text-left py-2 px-2 hover:bg-[#d4af37]/10 text-xs font-semibold uppercase tracking-wider text-[#fae7b3] hover:text-white transition-colors"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => scrollTo('meeting')}
              className="text-left py-2 hover:text-[#fff5db] transition-colors border-b border-[#d4af37]/15 flex items-center justify-between"
            >
              <span>Meeting</span>
              <span className="text-[10px] text-[#dfb76c]/60">→</span>
            </button>
            <button
              onClick={() => scrollTo('map')}
              className="text-left py-2 hover:text-[#fff5db] transition-colors border-b border-[#d4af37]/15 flex items-center justify-between text-[#fae7b3] font-semibold"
            >
              <span>Peta Kawasan (14 Hektar)</span>
              <span className="text-[10px] text-[#dfb76c]">64 Titik →</span>
            </button>

            {!currentUser && onOpenLogin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="flex items-center justify-between text-left py-2 hover:text-[#fff5db] transition-colors border-b border-[#d4af37]/15"
              >
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-[#dfb76c]" />
                  <span>Login Tamu / Cek Kode</span>
                </div>
                <span className="text-[10px] text-[#dfb76c]/60">→</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMyBookings();
              }}
              className="flex items-center justify-between text-left py-2 hover:text-[#fff5db] transition-colors border-b border-[#d4af37]/15"
            >
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-[#dfb76c]" />
                <span>Reservasi Saya</span>
              </div>
              {bookingsCount > 0 && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/25 text-[#fff2d1] border border-[#d4af37]/50 font-semibold">
                  {bookingsCount}
                </span>
              )}
            </button>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-[11px] text-[#beab80] tracking-wider">Mata Uang</span>
              <button
                onClick={onToggleCurrency}
                className="px-3.5 py-1 text-xs font-mono border border-[#d4af37]/50 text-[#eed492] bg-[#d4af37]/10"
              >
                {currency}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
