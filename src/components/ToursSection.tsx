import React, { useState } from 'react';
import { TourExperience, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { ArrowUpRight } from 'lucide-react';

export type TourCategoryFilter = 'all' | 'wahana' | 'spot-foto' | 'adventure' | 'keluarga';

interface ToursSectionProps {
  currency: Currency;
  onSelectTour: (tour: TourExperience) => void;
  onViewTourDetails: (tour: TourExperience) => void;
  tours?: TourExperience[];
  isLoading?: boolean;
  selectedCategory?: TourCategoryFilter;
  onSelectCategory?: (category: TourCategoryFilter) => void;
}

export const ToursSection: React.FC<ToursSectionProps> = ({
  currency,
  onSelectTour,
  onViewTourDetails,
  tours = [],
  isLoading = false,
  selectedCategory,
  onSelectCategory,
}) => {
  const [internalFilter, setInternalFilter] = useState<TourCategoryFilter>('all');
  const filter = selectedCategory ?? internalFilter;
  const setFilter = (cat: TourCategoryFilter) => {
    setInternalFilter(cat);
    onSelectCategory?.(cat);
  };

  const filteredTours = tours.filter((tour) => {
    if (filter === 'all') return true;
    return tour.category === filter;
  });

  return (
    <section id="expeditions" className="py-24 bg-[#f3efe6] border-y border-[#e2dcd0] px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[#ded7cb]">
          <div>
            <div className="text-xs tracking-widest uppercase text-[#967d58] font-medium mb-2">
              02. Explore Wisata
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#182a24] font-normal [text-wrap:balance]">
              Explore Wisata & Wahana Seru Chevilly
            </h2>
            <p className="text-xs sm:text-sm text-[#5d6e66] mt-2 max-w-2xl leading-relaxed">
              Jelajahi beragam wahana rekreasi favorit keluarga dan spot petualangan ikonik di Chevilly Resort and Camp.
              Mulai dari kesegaran Waterpark, keindahan The Aviary, nuansa oriental Chinatown, kemegahan Colosseum,
              sensasi Zip Coaster, arena Kids Zone & Labirin, hingga tantangan off-road UTV & ATV.
            </p>
          </div>

          {/* Filter Segmented Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#e7e1d4] border border-[#d2cbbe] self-start md:self-end">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm'
                  : 'text-[#4e5e57] hover:text-[#182a24]'
              }`}
            >
              Semua Wisata ({tours.length})
            </button>
            <button
              onClick={() => setFilter('wahana')}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'wahana'
                  ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm'
                  : 'text-[#4e5e57] hover:text-[#182a24]'
              }`}
            >
              Waterpark
            </button>
            <button
              onClick={() => setFilter('spot-foto')}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'spot-foto'
                  ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm'
                  : 'text-[#4e5e57] hover:text-[#182a24]'
              }`}
            >
              Spot Foto Ikonik
            </button>
            <button
              onClick={() => setFilter('adventure')}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'adventure'
                  ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm'
                  : 'text-[#4e5e57] hover:text-[#182a24]'
              }`}
            >
              Adventure & Adrenalin
            </button>
            <button
              onClick={() => setFilter('keluarga')}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'keluarga'
                  ? 'bg-[#182a24] text-[#f7f5ef] shadow-sm'
                  : 'text-[#4e5e57] hover:text-[#182a24]'
              }`}
            >
              Keluarga & Edukasi
            </button>
          </div>
        </div>

        {/* 3-Column Expedition Card Grid */}
        {isLoading && tours.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="bg-[#faf9f5] border border-[#ded7cb] overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#e6e1d6]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-1/3 bg-[#ded7cb]" />
                  <div className="h-6 w-2/3 bg-[#ded7cb]" />
                  <div className="h-4 w-full bg-[#ece7dd]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredTours.map((tour) => {
            const primaryImage = tour.image || tour.gallery?.[0] || '';
            const hoverImage = Array.isArray(tour.gallery)
              ? tour.gallery.find((img) => Boolean(img && img.trim() && img.trim() !== primaryImage.trim()))
              : undefined;
            return (
            <div
              key={tour.id}
              className="group bg-[#faf9f5] border border-[#ded7cb] hover:border-[#b89562] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Card Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e6e1d6]">
                {primaryImage && (
                  <img
                    key={primaryImage}
                    src={primaryImage}
                    alt={tour.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                      hoverImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
                    }`}
                  />
                )}
                {hoverImage && (
                  <img
                    key={hoverImage}
                    src={hoverImage}
                    alt={`${tour.name} preview`}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Quiet Badge: Altitude & Duration */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 border border-white/20">
                    {tour.altitude}
                  </span>
                </div>

                {tour.showKicker !== false && tour.kicker && (
                  <div className="absolute bottom-3 left-4 right-4 text-white text-xs">
                    <span className="font-serif italic text-[#ded8cc]">{tour.kicker}</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                <div className="space-y-2.5">
                  {/* Clean editorial category & essential info */}
                  <div className="flex items-center justify-between gap-3 flex-wrap text-[11px] text-[#7c8a83]">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#967d58]">
                      {tour.category === 'wahana'
                        ? 'Waterpark'
                        : tour.category === 'spot-foto'
                          ? 'Spot Foto'
                          : tour.category === 'adventure'
                            ? 'Adventure'
                            : 'Keluarga'}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums">
                      {tour.showDuration !== false && tour.duration && (
                        <>
                          <span>{tour.duration}</span>
                          <span className="text-[#cfc7b8]" aria-hidden="true">·</span>
                        </>
                      )}
                      <span className="text-[#967d58]">★ {tour.rating}</span>
                    </div>
                  </div>

                  {tour.showName !== false && tour.name && (
                    <h3 className="font-serif text-[21px] sm:text-2xl text-[#182a24] font-normal tracking-tight leading-snug group-hover:text-[#967d58] transition-colors">
                      {tour.name}
                    </h3>
                  )}

                  {tour.showDescription !== false && tour.description && (
                    <p className="text-xs text-[#5d6e66] leading-relaxed line-clamp-2">
                      {tour.description}
                    </p>
                  )}
                </div>

                {/* Minimal Price & Actions Footer */}
                <div className="pt-4 border-t border-[#ebe5d9] flex items-end justify-between gap-3">
                  {tour.showPrice !== false ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8a968f] mb-0.5">
                        Tiket masuk
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-xl sm:text-2xl font-medium text-[#182a24] tabular-nums tracking-tight">
                          {formatPrice(tour.priceIdr, tour.priceUsd, currency)}
                        </span>
                        <span className="text-[11px] text-[#8a968f]">/ orang</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8a968f] mb-0.5">
                        Tiket masuk
                      </div>
                      <div className="text-xs font-serif italic text-[#5d6e66]">Info di Lokasi</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewTourDetails(tour)}
                      className="px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#34453e] hover:text-[#967d58] border-b border-transparent hover:border-[#967d58] transition-colors cursor-pointer inline-flex items-center gap-1"
                      title="Lihat Detail Wahana"
                    >
                      <span>Detail</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTour(tour)}
                      className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] bg-[#182a24] text-[#f7f5ef] hover:bg-[#233a32] transition-colors cursor-pointer"
                    >
                      Pesan
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};
