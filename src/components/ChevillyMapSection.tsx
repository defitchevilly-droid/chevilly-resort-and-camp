import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Car,
  Clock,
  Layers,
  Mountain
} from 'lucide-react';

export const ChevillyMapSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const resortAddress =
    'Jl. Raya Veteran III Banjarsari RT.005/RW.004, Ciawi, Kec. Caringin, Kabupaten Bogor, Jawa Barat 16720';
  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Chevilly+Resort+and+Camp+Bogor';
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=Chevilly+Resort+and+Camp+Bogor';

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(resortAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleScrollToResortMap = () => {
    const el = document.getElementById('map');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Google Maps embed URL
  const embedSrc = `https://maps.google.com/maps?q=Chevilly+Resort+and+Camp+Bogor+Jawa+Barat&t=${
    mapType === 'satellite' ? 'k' : 'm'
  }&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section
      id="lokasi-resor"
      className="bg-[#101b17] text-[#f7f5ef] border-y border-[#263c34] py-10 sm:py-12 px-4 sm:px-8 transition-colors"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#263c34]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#d4af37]">
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Akses & Lokasi Resor</span>
              <span className="text-stone-500">·</span>
              <span className="text-[#a4b8af]">Bogor, Jawa Barat</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#faf9f5]">
              Peta Lokasi Chevilly Resort & Camp
            </h2>
            <p className="text-xs sm:text-sm text-[#adbdb6] max-w-2xl">
              Terletak strategis di kawasan sejuk perbukitan Ciawi, Bogor. Hanya ±15 menit dari Gerbang Tol Ciawi / Gadog (Tol Jagorawi) dengan akses jalan mulus menuju resor.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleScrollToResortMap}
              className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] border border-[#d4af37]/40 text-[#fae7b3] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Lihat Denah Kawasan (65 Titik)</span>
            </button>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#d4af37] hover:bg-[#fae7b3] text-[#0d1613] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>Petunjuk Rute Google Maps</span>
            </a>
          </div>
        </div>

        {/* Main Grid: Details Card & Interactive Google Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Resort Address & Route Guide (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#14231e] border border-[#263c34] p-5 sm:p-6 space-y-6 shadow-xl">
            <div className="space-y-5">
              {/* Resor Name & Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#faf9f5]">
                    Chevilly Resort & Camp
                  </h3>
                  <div className="text-xs text-[#d4af37] font-medium flex items-center gap-1.5 mt-0.5">
                    <Mountain className="w-3.5 h-3.5" />
                    <span>Lembah Pinus & Lereng Gunung Salak - Pangrango</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-xs shrink-0">
                  Buka 24 Jam
                </span>
              </div>

              {/* Alamat Lengkap */}
              <div className="space-y-2 p-3.5 bg-[#0d1714] border border-[#20332c]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#fae7b3]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Alamat Lengkap</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="text-[11px] font-mono text-[#a4b8af] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    title="Salin Alamat ke Clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#cfdad5] leading-relaxed">
                  {resortAddress}
                </p>
                <div className="text-[10.5px] font-mono text-[#8a9f95] pt-1 border-t border-[#20332c] flex items-center justify-between">
                  <span>GPS: -6.685934, 106.852441</span>
                  <span>Alt: ± 850 mdpl</span>
                </div>
              </div>

              {/* Akses & Estimasi Waktu Tempuh */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>Akses Menuju Resor:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#0d1714]/80 border border-[#20332c]">
                    <div className="font-bold text-[#faf9f5]">Exit Tol Ciawi / Gadog</div>
                    <div className="text-[11px] text-[#adbdb6] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#d4af37]" />
                      <span>± 15 Menit (5.8 km)</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0d1714]/80 border border-[#20332c]">
                    <div className="font-bold text-[#faf9f5]">Pusat Kota Bogor</div>
                    <div className="text-[11px] text-[#adbdb6] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#d4af37]" />
                      <span>± 25 Menit (14 km)</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0d1714]/80 border border-[#20332c]">
                    <div className="font-bold text-[#faf9f5]">Dari Jakarta (Cawang)</div>
                    <div className="text-[11px] text-[#adbdb6] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#d4af37]" />
                      <span>± 60 Menit via Jagorawi</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0d1714]/80 border border-[#20332c]">
                    <div className="font-bold text-[#faf9f5]">Stasiun KRL Bogor</div>
                    <div className="text-[11px] text-[#adbdb6] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#d4af37]" />
                      <span>± 30 Menit berkendara</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Links */}
            <div className="pt-4 border-t border-[#263c34] flex flex-wrap items-center justify-between gap-3 text-xs">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d4af37] hover:text-[#fae7b3] font-medium flex items-center gap-1 transition-colors underline underline-offset-4"
              >
                <span>Buka di Aplikasi Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-[11px] text-[#849a90] font-mono">
                Bebas Jalur Ganjil-Genap Puncak Utama
              </span>
            </div>
          </div>

          {/* Right Column: Google Maps Interactive Frame (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-[#14231e] border border-[#263c34] overflow-hidden shadow-xl relative min-h-[380px] sm:min-h-[440px]">
            {/* Map Top Bar Controls */}
            <div className="px-4 py-2.5 bg-[#0d1714] border-b border-[#263c34] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#faf9f5] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Peta Interaktif Real-Time Google Maps</span>
              </div>

              {/* View Switcher: Standard vs Satellite */}
              <div className="flex items-center gap-1 bg-[#14231e] border border-[#263c34] p-0.5 rounded-xs">
                <button
                  type="button"
                  onClick={() => setMapType('standard')}
                  className={`px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    mapType === 'standard'
                      ? 'bg-[#d4af37] text-[#0d1613]'
                      : 'text-[#a4b8af] hover:text-white'
                  }`}
                >
                  Peta Jalan
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('satellite')}
                  className={`px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    mapType === 'satellite'
                      ? 'bg-[#d4af37] text-[#0d1613]'
                      : 'text-[#a4b8af] hover:text-white'
                  }`}
                >
                  Satelit
                </button>
              </div>
            </div>

            {/* Embedded Google Map iframe */}
            <div className="relative w-full flex-1 min-h-[360px] sm:min-h-[420px] bg-[#1a2d26]">
              <iframe
                title="Peta Chevilly Resort and Camp Bogor"
                src={embedSrc}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full block"
              />

              {/* Float Overlay Pin Badge at Bottom Left */}
              <div className="absolute bottom-3 left-3 bg-[#0c1613]/90 backdrop-blur-md border border-[#d4af37]/40 px-3 py-2 text-xs text-white shadow-xl pointer-events-none hidden sm:flex items-center gap-2 rounded">
                <MapPin className="w-4 h-4 text-red-500 fill-red-500 shrink-0" />
                <div>
                  <div className="font-bold text-[#faf9f5]">Chevilly Resort and Camp</div>
                  <div className="text-[10px] text-[#a4b8af]">Ciawi, Bogor · Jawa Barat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
