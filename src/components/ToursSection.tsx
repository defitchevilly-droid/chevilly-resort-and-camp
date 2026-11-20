import React, { useState } from 'react';
import { TOUR_EXPERIENCES } from '../data/resortData';
import { TourExperience, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { Clock, Mountain, ShieldCheck, Compass, ArrowUpRight } from 'lucide-react';

interface ToursSectionProps {
  currency: Currency;
  onSelectTour: (tour: TourExperience) => void;
  onViewTourDetails: (tour: TourExperience) => void;
  tours?: TourExperience[];
}

export const ToursSection: React.FC<ToursSectionProps> = ({
  currency,
  onSelectTour,
  onViewTourDetails,
  tours = TOUR_EXPERIENCES,
}) => {
  const [filter, setFilter] = useState<'all' | 'wahana' | 'spot-foto' | 'adventure' | 'keluarga'>('all');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredTours.map((tour) => (
            <div
              key={tour.id}
              className="group bg-[#faf9f5] border border-[#ded7cb] hover:border-[#b89562] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Card Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e6e1d6]">
                <img
                  src={tour.gallery?.[0] || tour.image}
                  alt={tour.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                    tour.gallery?.[1] ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
                  }`}
                />
                {tour.gallery?.[1] && (
                  <img
                    src={tour.gallery[1]}
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
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  {/* Unboxed Metadata (NO PILLS) */}
                  <div className="flex items-center gap-2 text-xs text-[#73837b] mb-2 flex-wrap">
                    {tour.showDuration !== false && tour.duration && (
                      <>
                        <span className="flex items-center gap-1 font-mono tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-[#967d58]" />
                          {tour.duration}
                        </span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span className="flex items-center gap-1 text-[#384841]">
                      <Mountain className="w-3.5 h-3.5 text-[#967d58]" />
                      {tour.difficulty}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#967d58] font-mono tabular-nums">★ {tour.rating}</span>
                  </div>

                  {tour.showName !== false && tour.name && (
                    <h3 className="font-serif text-xl text-[#182a24] font-medium mb-2.5 group-hover:text-[#967d58] transition-colors leading-snug">
                      {tour.name}
                    </h3>
                  )}

                  {tour.showDescription !== false && tour.description && (
                    <p className="text-xs text-[#52645c] leading-relaxed mb-4 line-clamp-2">
                      {tour.description}
                    </p>
                  )}

                  {/* Certified Guide Marker */}
                  <div className="flex items-start gap-2 text-[11px] text-[#34463f] bg-[#f2eee4] p-2.5 border border-[#e2dcd0] mb-4">
                    <ShieldCheck className="w-4 h-4 text-[#967d58] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{tour.guideType}</span>
                  </div>

                  {/* Quick Inclusions */}
                  <div className="text-[11px] text-[#6b7b73] space-y-1 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3 h-3 text-[#b89562]" />
                      <span className="truncate">{tour.inclusions[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3 h-3 text-[#b89562]" />
                      <span className="truncate">{tour.inclusions[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-[#eee9de] flex items-end justify-between gap-3">
                  {tour.showPrice !== false ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#73837b]">Tiket Wahana / Wisata</div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-xl sm:text-2xl font-medium text-[#182a24] font-mono tabular-nums">
                          {formatPrice(tour.priceIdr, tour.priceUsd, currency)}
                        </span>
                        <span className="text-[11px] text-[#73837b]">/ orang</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#73837b]">Tiket Masuk</div>
                      <div className="text-xs font-serif italic text-stone-500">Info di Lokasi</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewTourDetails(tour)}
                      className="p-2 border border-[#cfc7b8] text-[#34453e] hover:border-[#182a24] hover:text-[#182a24] transition-colors cursor-pointer"
                      title="Lihat Detail Wahana"
                      aria-label="Detail Wisata"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectTour(tour)}
                      className="px-4 py-2 text-xs font-medium uppercase tracking-wider bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] transition-colors cursor-pointer shadow-sm"
                    >
                      Pesan Tiket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
