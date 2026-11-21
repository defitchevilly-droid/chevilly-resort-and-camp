import React, { useState, useEffect, useRef } from 'react';
import { TourExperience, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { X, Clock, Mountain, ShieldCheck, Compass, Check, ArrowRight, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface TourDetailModalProps {
  tour: TourExperience | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onBookNow: (tour: TourExperience) => void;
}

export const TourDetailModal: React.FC<TourDetailModalProps> = ({
  tour,
  isOpen,
  onClose,
  currency,
  onBookNow,
}) => {
  const [activePhoto, setActivePhoto] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    setActivePhoto(0);
    setIsLightboxOpen(false);
  }, [tour?.id]);

  const gallery = tour
    ? tour.gallery && tour.gallery.filter(Boolean).length > 0
      ? tour.gallery.filter(Boolean)
      : [tour.image]
    : [];

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight' && gallery.length > 1) {
        setActivePhoto((prev) => (prev + 1) % gallery.length);
      } else if (e.key === 'ArrowLeft' && gallery.length > 1) {
        setActivePhoto((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, gallery.length]);

  if (!isOpen || !tour) return null;

  const activePhotoSrc = gallery[activePhoto] || gallery[0] || tour.image;
  const departureTimes = tour.departureTimes || [];
  const inclusions = tour.inclusions || [];
  const equipmentProvided = tour.equipmentProvided || [];

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (gallery.length <= 1) return;
    setActivePhoto((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (gallery.length <= 1) return;
    setActivePhoto((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#faf9f5] border border-[#dcd6c8] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2dcd0] flex items-center justify-between bg-[#f4f0e6]">
          <div>
            <div className="text-[10px] tracking-widest uppercase font-mono text-[#967d58]">
              {tour.kicker} · Elevasi {tour.altitude}
            </div>
            <h3 className="font-serif text-2xl text-[#182a24] font-medium">{tour.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#52645c] hover:text-[#182a24] transition-colors cursor-pointer"
            aria-label="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs sm:text-sm text-[#2d3e37] space-y-6">
          {/* Main Photo Banner & Thumbnails */}
          <div className="space-y-3">
            <div
              onClick={() => setIsLightboxOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsLightboxOpen(true);
                }
              }}
              aria-label={`Perbesar foto ${tour.name} ke layar penuh`}
              className="relative aspect-[16/9] overflow-hidden bg-[#24332c] border border-[#dcd6c8] cursor-zoom-in group"
            >
              <img
                src={activePhotoSrc}
                alt={tour.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-black/65 hover:bg-black/80 text-white text-[11px] font-mono px-2.5 py-1.5 border border-white/25 backdrop-blur-sm transition-all">
                <ZoomIn className="w-3.5 h-3.5 text-[#eed492]" />
                <span>Layar Penuh</span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="font-serif italic text-[#dfd9ce]">{tour.guideType}</span>
                <span className="font-mono text-[11px] bg-black/60 px-2.5 py-0.5 border border-white/20">
                  ★ {tour.rating} ({tour.reviewsCount} Pelancong Puas)
                </span>
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto">
                {gallery.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(idx)}
                    className={`w-20 h-14 overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activePhoto === idx ? 'border-[#182a24] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt={`Sudut ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-[#f2eee3] p-4 border border-[#e2dcd0] text-xs">
            <div>
              <span className="text-[10px] text-[#73837b] uppercase block">Jam Operasional / Durasi</span>
              <span className="font-mono font-medium text-sm text-[#182a24] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#967d58]" />
                {tour.duration}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#73837b] uppercase block">Tingkat Kesulitan</span>
              <span className="font-medium text-sm text-[#182a24] flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-[#967d58]" />
                {tour.difficulty}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#73837b] uppercase block">Ketinggian Puncak</span>
              <span className="font-mono font-medium text-sm text-[#182a24] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#967d58]" />
                {tour.altitude}
              </span>
            </div>
          </div>

          {/* Narrative */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#182a24] mb-2">
              Tentang Ekspedisi Ini
            </h4>
            <p className="text-xs sm:text-sm text-[#4e5f57] leading-relaxed">
              {tour.description}
            </p>
          </div>

          {/* Certified Guide Details */}
          <div className="bg-[#f0ece1] p-4 border border-[#ddd6c7] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#967d58] shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold text-[#182a24]">Standar Keselamatan & Pemandu</div>
              <div className="text-[#55665e] mt-0.5">{tour.guideType}</div>
              <div className="text-[11px] text-[#788880] mt-1">
                {tour.safetyNote ||
                  'Setiap pemandu dilengkapi sistem komunikasi standar resort, pertolongan pertama P3K, dan pengawasan area wahana yang terverifikasi.'}
              </div>
            </div>
          </div>

          {/* Departure Slots */}
          {departureTimes.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-semibold tracking-wider text-[#182a24] mb-2">
                Pilihan Jam Keberangkatan
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {departureTimes.map((time, idx) => (
                  <div key={idx} className="bg-[#f7f5ef] border border-[#dcd6c8] px-3 py-1.5 font-mono text-[#182a24]">
                    {time}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions & Equipment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs uppercase font-semibold tracking-wider text-[#182a24] mb-2">
                Fasilitas & Layanan Termasuk
              </h4>
              <div className="space-y-1.5 text-xs text-[#394a42]">
                {inclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-semibold tracking-wider text-[#182a24] mb-2">
                Perlengkapan yang Disediakan
              </h4>
              <div className="space-y-1.5 text-xs text-[#394a42]">
                {equipmentProvided.map((eq, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#967d58] shrink-0 mt-0.5" />
                    <span>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e2dcd0] bg-[#f4f0e6] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-[#73837b]">Tarif Tiket Wahana</div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-medium text-[#182a24] font-mono tabular-nums">
                {formatPrice(tour.priceIdr, tour.priceUsd, currency)}
              </span>
              <span className="text-xs text-[#73837b]">/ orang</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookNow(tour);
            }}
            className="px-6 py-2.5 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Pesan Tiket Wahana</span>
            <ArrowRight className="w-4 h-4 text-[#c5a880]" />
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Popup (Desktop & Mobile) */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartXRef.current === null || gallery.length <= 1) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
            const deltaX = endX - touchStartXRef.current;
            touchStartXRef.current = null;
            if (Math.abs(deltaX) > 45) {
              if (deltaX < 0) handleNextPhoto();
              else handlePrevPhoto();
            }
          }}
          className="fixed inset-0 z-[100] w-screen h-[100dvh] bg-black/95 flex flex-col select-none animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto layar penuh ${tour.name}`}
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/80 to-transparent shrink-0"
          >
            <div className="min-w-0">
              <div className="text-white font-serif text-sm sm:text-lg font-medium truncate">
                {tour.name}
              </div>
              <div className="text-[11px] font-mono text-[#eed492]">
                Foto {activePhoto + 1} / {gallery.length}
                {tour.guideType ? ` · ${tour.guideType}` : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Tutup tampilan layar penuh"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-mono uppercase tracking-wider border border-white/25 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Tutup</span>
            </button>
          </div>

          {/* Main Fullscreen Image Area */}
          <div className="relative flex-1 min-h-0 w-full flex items-center justify-center px-2 sm:px-14 pb-3">
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                aria-label="Foto sebelumnya"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 bg-black/60 hover:bg-black/85 text-white border border-white/25 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            <img
              key={activePhotoSrc}
              src={activePhotoSrc}
              alt={tour.name}
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full w-full h-full object-contain"
            />

            {gallery.length > 1 && (
              <button
                type="button"
                onClick={handleNextPhoto}
                aria-label="Foto berikutnya"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 bg-black/60 hover:bg-black/85 text-white border border-white/25 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {gallery.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 overflow-x-auto px-4 pb-4 pt-1 shrink-0"
            >
              {gallery.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhoto(idx)}
                  className={`w-14 h-10 sm:w-20 sm:h-12 overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activePhoto === idx
                      ? 'border-[#d4af37] opacity-100 scale-105'
                      : 'border-white/20 opacity-55 hover:opacity-95'
                  }`}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
