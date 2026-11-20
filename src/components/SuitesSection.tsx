import React, { useState, useEffect, useMemo } from 'react';
import { ROOM_SUITES, ACCOMMODATION_DROPDOWN_ITEMS } from '../data/resortData';
import { RoomSuite, Currency, RoomCategoryItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { Maximize2, Users, ArrowUpRight, Building2 } from 'lucide-react';

interface SuitesSectionProps {
  currency: Currency;
  onSelectRoom: (room: RoomSuite) => void;
  onViewRoomDetails: (room: RoomSuite) => void;
  rooms?: RoomSuite[];
  categories?: RoomCategoryItem[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

type AvailabilityFilter = 'available' | 'all' | 'unavailable';

const getStoredPublishedCategories = (): { id: string; label: string }[] => {
  try {
    const saved = localStorage.getItem('chevilly_room_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: { id: string; label?: string; name?: string }) => ({
          id: c.id,
          label: c.label || c.name || c.id,
        }));
      }
    }
  } catch {
    // ignore
  }
  return ACCOMMODATION_DROPDOWN_ITEMS.map((item) => ({ id: item.id, label: item.label }));
};

export const SuitesSection: React.FC<SuitesSectionProps> = ({
  currency,
  onSelectRoom,
  onViewRoomDetails,
  rooms = ROOM_SUITES,
  categories: dbCategories,
  selectedCategory = 'all',
  onSelectCategory,
}) => {
  const [internalFilter, setInternalFilter] = useState<string>(selectedCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('available');
  const [publishedCategories, setPublishedCategories] = useState<{ id: string; label: string }[]>(
    getStoredPublishedCategories
  );

  // Sync with backend categories prop when loaded
  useEffect(() => {
    if (Array.isArray(dbCategories) && dbCategories.length > 0) {
      setPublishedCategories(
        dbCategories.map((c) => ({
          id: c.id,
          label: c.label || c.name || c.id,
        }))
      );
    }
  }, [dbCategories]);

  useEffect(() => {
    const syncCategories = () => {
      setPublishedCategories(getStoredPublishedCategories());
    };
    window.addEventListener('storage', syncCategories);
    window.addEventListener('chevilly-categories-updated', syncCategories);
    return () => {
      window.removeEventListener('storage', syncCategories);
      window.removeEventListener('chevilly-categories-updated', syncCategories);
    };
  }, []);

  // Sync internal filter when parent passes new selectedCategory
  useEffect(() => {
    if (selectedCategory) {
      setInternalFilter(selectedCategory);
    }
  }, [selectedCategory]);

  const handleFilterChange = (cat: string) => {
    setInternalFilter(cat);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  const getCategoryLabel = (catString?: string): string => {
    if (!catString) return 'Deluxe';
    const clean = catString.trim().toLowerCase();

    const matched = publishedCategories.find(
      (c) => c.id.toLowerCase() === clean || c.label.toLowerCase() === clean
    );
    if (matched) return matched.label;

    switch (clean) {
      case 'deluxe':
        return 'Deluxe';
      case 'ftb':
        return 'FTB';
      case 'executive':
        return 'Executive';
      case 'premiere':
        return 'Premiere';
      case 'president-suite':
      case 'president':
      case 'presidential':
        return 'President Suite';
      case 'villas':
      case 'villa':
        return 'Villas';
      case 'bunkbed':
      case 'bunk-bed':
        return 'BunkBed';
      case 'transit-room':
      case 'transit':
        return 'Transit Room';
      default:
        return catString
          .split(/[-_ ]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
    }
  };

  // Merge database category definitions with any unique categories present on database rooms
  const categories = useMemo(() => {
    const baseList = publishedCategories.filter(
      (cat) => !['chalet', 'suite'].includes(cat.id.toLowerCase())
    );
    const seen = new Set(baseList.map((c) => c.id.toLowerCase()));
    const seenLabels = new Set(baseList.map((c) => c.label.toLowerCase()));

    const extraFromRooms: { id: string; label: string }[] = [];
    rooms.forEach((room) => {
      const rawCat = (room.category || '').trim();
      if (!rawCat) return;
      const lower = rawCat.toLowerCase();
      if (!seen.has(lower) && !seenLabels.has(lower)) {
        seen.add(lower);
        extraFromRooms.push({ id: rawCat, label: getCategoryLabel(rawCat) });
      }
    });

    return [{ id: 'all', label: 'Semua' }, ...baseList, ...extraFromRooms];
  }, [publishedCategories, rooms]);

  // Availability counts from the database rooms list
  const availableCount = useMemo(
    () => rooms.filter((r) => r.isAvailable !== false).length,
    [rooms]
  );
  const unavailableCount = useMemo(
    () => rooms.filter((r) => r.isAvailable === false).length,
    [rooms]
  );

  // Step 1: Filter rooms by availability status from database
  const roomsByAvailability = useMemo(() => {
    if (availabilityFilter === 'available') {
      return rooms.filter((r) => r.isAvailable !== false);
    }
    if (availabilityFilter === 'unavailable') {
      return rooms.filter((r) => r.isAvailable === false);
    }
    // 'all': show available rooms first, then unavailable rooms
    return [...rooms].sort((a, b) => {
      const aAvail = a.isAvailable !== false ? 0 : 1;
      const bAvail = b.isAvailable !== false ? 0 : 1;
      return aAvail - bAvail;
    });
  }, [rooms, availabilityFilter]);

  const matchesCategory = (suite: RoomSuite, catId: string): boolean => {
    if (catId === 'all') return true;
    const cleanTarget = catId.toLowerCase();
    const cleanSuiteCat = (suite.category || '').trim().toLowerCase();
    const matchedCatObj = categories.find((c) => c.id.toLowerCase() === cleanTarget);
    return (
      cleanSuiteCat === cleanTarget ||
      (matchedCatObj ? cleanSuiteCat === matchedCatObj.label.toLowerCase() : false) ||
      suite.id.toLowerCase() === cleanTarget
    );
  };

  // Step 2: Filter by selected database category
  const filteredSuites = useMemo(
    () => roomsByAvailability.filter((suite) => matchesCategory(suite, internalFilter)),
    [roomsByAvailability, internalFilter, categories]
  );

  // Check if the selected category has rooms in DB under another availability status
  const matchingCategoryAllStatus = useMemo(
    () => rooms.filter((suite) => matchesCategory(suite, internalFilter)),
    [rooms, internalFilter, categories]
  );

  const selectedCategoryLabel =
    categories.find((c) => c.id.toLowerCase() === internalFilter.toLowerCase())?.label ||
    getCategoryLabel(internalFilter);

  return (
    <section id="suites" className="py-24 px-6 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Editorial Header */}
      <div className="flex flex-col gap-6 mb-12 pb-6 border-b border-[#e2dcd0]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="text-xs tracking-widest uppercase text-[#967d58] font-medium mb-2">
              01. Akomodasi Eksklusif Chevilly
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#182a24] font-normal [text-wrap:balance]">
              Koleksi Rooms, Suites &amp; Villas
            </h2>
            <p className="text-xs sm:text-sm text-[#5d6e66] mt-2 max-w-2xl">
              Pilihan lengkap mulai dari Deluxe Room, FTB (Fullboard Twin Bed), Executive, Premiere, President Suite,
              Villa keluarga privat, BunkBed komunitas, hingga Transit Room harian di alam sejuk Puncak.
            </p>
          </div>

          {/* Filter Ketersediaan (Tersedia / Semua / Tidak Available) */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#73837b]">
              Filter Ketersediaan
            </span>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#ece7dc] border border-[#d8d2c4]">
              <button
                type="button"
                onClick={() => setAvailabilityFilter('available')}
                className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  availabilityFilter === 'available'
                    ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm font-semibold'
                    : 'text-[#4e5e57] hover:text-[#182a24] hover:bg-[#e2dcd0]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Tersedia ({availableCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('all')}
                className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  availabilityFilter === 'all'
                    ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm font-semibold'
                    : 'text-[#4e5e57] hover:text-[#182a24] hover:bg-[#e2dcd0]'
                }`}
              >
                Semua Status ({rooms.length})
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('unavailable')}
                className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  availabilityFilter === 'unavailable'
                    ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm font-semibold'
                    : 'text-[#4e5e57] hover:text-[#182a24] hover:bg-[#e2dcd0]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Tidak Available ({unavailableCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Kategori dari List Database */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#ece7dc] border border-[#d8d2c4] max-w-full">
            {categories.map((cat) => {
              const countInFilter = roomsByAvailability.filter((suite) =>
                matchesCategory(suite, cat.id)
              ).length;
              const isSelected = internalFilter.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleFilterChange(cat.id)}
                  className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm font-semibold'
                      : 'text-[#4e5e57] hover:text-[#182a24] hover:bg-[#e2dcd0]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`font-mono text-[10px] ${
                      isSelected ? 'text-[#d4af37]' : 'text-[#73837b]'
                    }`}
                  >
                    ({countInFilter})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty State when no rooms match selected category + availability */}
      {filteredSuites.length === 0 ? (
        <div className="bg-[#fcfbf9] border border-[#e2dcd0] p-10 text-center max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-[#967d58] mb-2">
            Informasi Ketersediaan Database
          </div>
          <h3 className="font-serif text-2xl text-[#182a24] mb-2">
            {internalFilter === 'all'
              ? 'Tidak ada kamar sesuai filter status saat ini'
              : `Tidak ada unit ${availabilityFilter === 'available' ? 'Tersedia (Available)' : availabilityFilter === 'unavailable' ? 'Tidak Available' : ''} pada kategori ${selectedCategoryLabel}`}
          </h3>
          <p className="text-xs sm:text-sm text-[#5d6e66] mb-6">
            {matchingCategoryAllStatus.length > 0
              ? `Terdapat ${matchingCategoryAllStatus.length} tipe kamar pada kategori ${selectedCategoryLabel} di database dengan status lain.`
              : `Belum ada tipe kamar terdaftar pada kategori ${selectedCategoryLabel} di database saat ini.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {availabilityFilter !== 'all' && matchingCategoryAllStatus.length > 0 && (
              <button
                type="button"
                onClick={() => setAvailabilityFilter('all')}
                className="px-4 py-2 text-xs font-medium uppercase tracking-wider bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] transition-colors cursor-pointer"
              >
                Tampilkan Semua Status ({matchingCategoryAllStatus.length})
              </button>
            )}
            {internalFilter !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  handleFilterChange('all');
                  setAvailabilityFilter('available');
                }}
                className="px-4 py-2 text-xs font-medium uppercase tracking-wider border border-[#cfc7b8] text-[#34453e] hover:border-[#182a24] hover:text-[#182a24] transition-colors cursor-pointer"
              >
                Lihat Semua Kamar Tersedia
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Grid of Suites */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredSuites.map((suite) => {
            const isAvailable = suite.isAvailable !== false;
            return (
              <div
                key={suite.id}
                id={`room-${suite.id}`}
                className={`group bg-[#fcfbf9] border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm scroll-mt-28 ${
                  isAvailable
                    ? 'border-[#e2dcd0] hover:border-[#b89562] hover:shadow-md'
                    : 'border-[#ddd6c8] opacity-90'
                }`}
              >
                {/* Image Container with measured aspect ratio and deluxe hover transition */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#e9e4d8]">
                  <img
                    src={suite.image}
                    alt={suite.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out ${
                      !isAvailable ? 'grayscale-[35%] opacity-85' : ''
                    }`}
                  />
                  {suite.gallery && suite.gallery.length > 1 && (
                    <img
                      src={suite.gallery[1] || suite.gallery[0]}
                      alt={`${suite.name} Interior`}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none ${
                        !isAvailable ? 'grayscale-[35%]' : ''
                      }`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Quiet photo overlay indicator */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs gap-2">
                    {suite.showKicker !== false && suite.kicker && (
                      <span className="font-serif italic text-[#ded8cc] truncate max-w-[36%]">{suite.kicker}</span>
                    )}
                    {/* Span Status Available (titik hijau) dan Tidak Available (titik merah) */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase border backdrop-blur-md transition-colors shrink-0 ${
                        isAvailable
                          ? 'bg-black/55 text-emerald-300 border-emerald-500/50 shadow-xs'
                          : 'bg-black/65 text-rose-300 border-rose-500/60 shadow-xs'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${
                          isAvailable
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse'
                            : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
                        }`}
                      />
                      <span>{isAvailable ? 'Available' : 'Tidak Available'}</span>
                    </span>
                    <span className="font-mono text-[11px] bg-black/40 backdrop-blur-sm px-2 py-0.5 border border-white/20 shrink-0">
                      {suite.altitude}
                    </span>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Unboxed Metadata (NO PILLS) */}
                    <div className="flex items-center gap-2 text-xs text-[#73837b] mb-2.5 flex-wrap">
                      <span className="uppercase tracking-wider font-semibold text-[#967d58]">
                        {getCategoryLabel(suite.category)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Maximize2 className="w-3 h-3 text-[#967d58]" />
                        {suite.area}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#967d58]" />
                        {suite.capacity}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#4e5e57]">
                        <Building2 className="w-3 h-3 text-[#967d58]" />
                        <span>{suite.totalRooms || 10} Unit</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold ${
                          isAvailable ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{isAvailable ? 'Available' : 'Tidak Available'}</span>
                      </span>
                    </div>

                    {suite.showName !== false && suite.name && (
                      <h3 className="font-serif text-2xl text-[#182a24] font-medium mb-2 group-hover:text-[#967d58] transition-colors">
                        {suite.name}
                      </h3>
                    )}

                    {suite.showDescription !== false && suite.description && (
                      <p className="text-xs sm:text-sm text-[#52645c] leading-relaxed mb-4 line-clamp-2">
                        {suite.description}
                      </p>
                    )}
                  </div>

                  {/* Price baseline and Action Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    {suite.showPrice !== false ? (
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-[#73837b]">Mulai Dari</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-serif text-2xl sm:text-3xl font-medium text-[#182a24] font-mono tabular-nums">
                            {formatPrice(suite.priceIdr, suite.priceUsd, currency)}
                          </span>
                          <span className="text-xs text-[#73837b]">/ malam</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-[#73837b]">Tarif Kamar</div>
                        <div className="text-xs font-serif italic text-stone-500">Hubungi Reservasi</div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewRoomDetails(suite)}
                        className="px-3.5 py-2 text-xs font-medium uppercase tracking-wider border border-[#cfc7b8] text-[#34453e] hover:border-[#182a24] hover:text-[#182a24] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Detail</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && onSelectRoom(suite)}
                        className={`px-5 py-2 text-xs font-medium uppercase tracking-widest transition-colors shadow-sm ${
                          isAvailable
                            ? 'bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] cursor-pointer'
                            : 'bg-[#e3ddd0] text-[#7d796f] cursor-not-allowed border border-[#d1cabd]'
                        }`}
                      >
                        {isAvailable ? 'Pesan Suite' : 'Tidak Available'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
