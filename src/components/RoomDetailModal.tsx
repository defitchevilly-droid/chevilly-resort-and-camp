import React, { useState, useEffect, useRef } from 'react';
import { RoomSuite, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { X, Maximize2, Users, Star, Check, Sparkles, Flame, Shield, ArrowRight, Building2, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface RoomDetailModalProps {
  room: RoomSuite | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onBookNow: (room: RoomSuite) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  isOpen,
  onClose,
  currency,
  onBookNow,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedPhotoIndex(0);
    setIsLightboxOpen(false);
  }, [room?.id, room?.image]);

  const extraGallery = room && Array.isArray(room.gallery)
    ? room.gallery.filter((img) => Boolean(img && img.trim() && img.trim() !== (room.image || '').trim()))
    : [];
  const photos = room ? [room.image, ...extraGallery].filter(Boolean) : [];

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, photos.length]);

  if (!isOpen || !room) return null;

  const activePhoto = photos[selectedPhotoIndex] || room.image;

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (photos.length <= 1) return;
    setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (photos.length <= 1) return;
    setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#faf9f5] border border-[#dcd6c8] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2dcd0] flex items-center justify-between bg-[#f4f0e6]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] tracking-widest uppercase font-mono text-[#967d58]">
                {room.kicker} · Elevasi {room.altitude}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase border ${
                room.isAvailable !== false
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                  room.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`} />
                <span>{room.isAvailable !== false ? 'Available' : 'Tidak Available'}</span>
              </span>
            </div>
            <h3 className="font-serif text-2xl text-[#182a24] font-medium">{room.name}</h3>
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
          {/* Main Photo Gallery */}
          <div className="space-y-2">
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
              aria-label={`Perbesar foto ${room.name} ke layar penuh`}
              className="relative aspect-[16/9] overflow-hidden bg-[#24332c] border border-[#dcd6c8] cursor-zoom-in group"
            >
              <img
                key={activePhoto}
                src={activePhoto}
                alt={room.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-black/65 hover:bg-black/80 text-white text-[11px] font-mono px-2.5 py-1.5 border border-white/25 backdrop-blur-sm transition-all">
                <ZoomIn className="w-3.5 h-3.5 text-[#eed492]" />
                <span>Layar Penuh</span>
              </div>
              <div className="absolute bottom-3 left-4 text-white text-xs bg-black/60 backdrop-blur-sm px-3 py-1 font-mono">
                {room.viewType}
              </div>
            </div>

            {/* Thumbnail selector if multiple */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`w-20 h-14 overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedPhotoIndex === index
                        ? 'border-[#182a24] opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#f2eee3] p-4 border border-[#e2dcd0] text-xs">
            <div>
              <span className="text-[10px] text-[#73837b] uppercase block">Luas Ruangan</span>
              <span className="font-mono font-medium text-sm text-[#182a24] flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-[#967d58]" />
                {room.area}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#73837b] uppercase block">Kapasitas Tamu</span>
              <span className="font-medium text-sm text-[#182a24] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#967d58]" />
                {room.capacity}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#73837b] uppercase block">Jumlah Kamar</span>
              <span className="font-mono font-medium text-sm text-[#182a24] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#967d58]" />
                {room.totalRooms || 10} Unit
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#73837b] uppercase block">Konfigurasi Ranjang</span>
              <span className="font-medium text-xs text-[#182a24]">{room.bedType}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#73837b] uppercase block">Kepuasan Tamu</span>
              <span className="font-mono font-medium text-sm text-[#967d58] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#967d58]" />
                {room.rating} ({room.reviewsCount} Ulasan)
              </span>
            </div>
          </div>

          {/* Narrative */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#182a24] mb-2">
              Deskripsi Hunian
            </h4>
            <p className="text-xs sm:text-sm text-[#4e5f57] leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Features & Amenities List */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#182a24] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#967d58]" />
              <span>Fasilitas & Keunggulan Spesial</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {room.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#f8f6f0] p-2.5 border border-[#e8e2d4]">
                  <Flame className="w-3.5 h-3.5 text-[#967d58] shrink-0 mt-0.5" />
                  <span className="text-[#2b3c35]">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Included VIP Services */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#182a24] mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#967d58]" />
              <span>Layanan Termasuk (Complimentary Privilege)</span>
            </h4>
            <div className="space-y-1.5 text-xs text-[#394a42]">
              {room.includedServices.map((svc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{svc}</span>
                </div>
              ))}
            </div>

            {/* Tabel 3 Tarif Hari: Sun-Thurs, Friday, Saturday */}
            <div className="mt-5 pt-5 border-t border-[#ded7cb]">
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <span className="text-xs uppercase font-semibold tracking-wider text-[#182a24]">
                  Daftar Tarif Berdasarkan Hari
                </span>
                <span className="text-[10px] tracking-widest uppercase text-[#967d58] font-mono">
                  Tarif Resmi Chevilly
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Sun - Thurs */}
                <div className="p-4 bg-white border border-[#e2dcd0] border-t-2 border-t-[#182a24] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between text-center">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#73837b] mb-1">
                      Weekday
                    </div>
                    <div className="font-serif text-sm font-semibold text-[#182a24] tracking-wide">
                      Sun – Thurs
                    </div>
                    <div className="text-[11px] text-[#73837b] mt-0.5">Minggu – Kamis</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#f0ebe1]">
                    <div className="font-serif text-lg sm:text-xl font-semibold text-[#182a24] tabular-nums tracking-tight leading-none">
                      {formatPrice(room.priceSunThursIdr ?? room.priceIdr, room.priceSunThursUsd ?? room.priceUsd, currency)}
                    </div>
                    <div className="text-[10px] text-[#84948c] mt-1 font-mono">/ malam</div>
                  </div>
                </div>

                {/* Friday */}
                <div className="p-4 bg-gradient-to-b from-[#fdfaf2] to-[#f8f1df] border border-[#e0cb93] border-t-2 border-t-[#c59d36] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between text-center">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#967d58] mb-1">
                      Pre-Weekend
                    </div>
                    <div className="font-serif text-sm font-semibold text-[#182a24] tracking-wide">
                      Friday
                    </div>
                    <div className="text-[11px] text-[#7d6947] mt-0.5">Jumat</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#e9dbb6]">
                    <div className="font-serif text-lg sm:text-xl font-semibold text-[#182a24] tabular-nums tracking-tight leading-none">
                      {formatPrice(room.priceFridayIdr ?? Math.round(room.priceIdr * 1.25), room.priceFridayUsd ?? Math.round(room.priceUsd * 1.25), currency)}
                    </div>
                    <div className="text-[10px] text-[#8c7650] mt-1 font-mono">/ malam</div>
                  </div>
                </div>

                {/* Saturday */}
                <div className="p-4 bg-gradient-to-b from-[#182a24] to-[#111f1a] border border-[#2b453b] border-t-2 border-t-[#d4af37] shadow-md hover:shadow-lg transition-all flex flex-col justify-between text-center text-white">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#e6c76e] mb-1">
                      Peak Weekend
                    </div>
                    <div className="font-serif text-sm font-semibold text-white tracking-wide">
                      Saturday
                    </div>
                    <div className="text-[11px] text-[#a6b8af] mt-0.5">Sabtu (Peak)</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2a4339]">
                    <div className="font-serif text-lg sm:text-xl font-semibold text-[#fae7b3] tabular-nums tracking-tight leading-none">
                      {formatPrice(room.priceSaturdayIdr ?? Math.round(room.priceIdr * 1.55), room.priceSaturdayUsd ?? Math.round(room.priceUsd * 1.55), currency)}
                    </div>
                    <div className="text-[10px] text-[#9eb2a8] mt-1 font-mono">/ malam</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Price and Booking Trigger */}
        <div className="px-6 py-4 border-t border-[#e2dcd0] bg-[#f4f0e6] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-[#73837b]">Tarif Reservasi</div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-medium text-[#182a24] font-mono tabular-nums">
                {formatPrice(room.priceIdr, room.priceUsd, currency)}
              </span>
              <span className="text-xs text-[#73837b]">/ malam</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookNow(room);
            }}
            className="px-6 py-2.5 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Lanjut Reservasi</span>
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
            if (touchStartXRef.current === null || photos.length <= 1) return;
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
          aria-label={`Foto layar penuh ${room.name}`}
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/80 to-transparent shrink-0"
          >
            <div className="min-w-0">
              <div className="text-white font-serif text-sm sm:text-lg font-medium truncate">
                {room.name}
              </div>
              <div className="text-[11px] font-mono text-[#eed492]">
                Foto {selectedPhotoIndex + 1} / {photos.length}
                {room.viewType ? ` · ${room.viewType}` : ''}
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
            {photos.length > 1 && (
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
              key={activePhoto}
              src={activePhoto}
              alt={room.name}
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full w-full h-full object-contain"
            />

            {photos.length > 1 && (
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
          {photos.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 overflow-x-auto px-4 pb-4 pt-1 shrink-0"
            >
              {photos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`w-14 h-10 sm:w-20 sm:h-12 overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedPhotoIndex === index
                      ? 'border-[#d4af37] opacity-100 scale-105'
                      : 'border-white/20 opacity-55 hover:opacity-95'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
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
