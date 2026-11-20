import React from 'react';
import { RESORT_INFO } from '../data/resortData';
import { ResortInfoData } from '../services/api';
import { Phone, Mail, MapPin, Compass, ShieldCheck, ExternalLink, Navigation, Car } from 'lucide-react';

interface FooterProps {
  onOpenAdmin?: () => void;
  resortInfo?: ResortInfoData | null;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, resortInfo: dbResortInfo }) => {
  const resortInfo = dbResortInfo ? { ...RESORT_INFO, ...dbResortInfo } : RESORT_INFO;

  return (
    <footer id="contact" className="bg-[#101b17] text-[#ded8cc] border-t border-[#22352e] pt-14 pb-12 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10 pb-12">
        {/* Kolom 1: Brand identity & Alamat Asli */}
        <div className="md:col-span-1 space-y-3.5">
          <div className="flex items-center">
            <img
              src="/assets/aistudio/LOGO_KUNING_2_7dfae9a0.png"
              alt="Chevilly Resort and Camp"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]"
            />
          </div>
          <p className="text-xs text-[#95a69e] leading-relaxed">
            Resor liburan keluarga, vila eksklusif, glamping, taman rekreasi terpadu, serta venue meeting & wedding di kawasan sejuk Ciawi, Bogor. Nikmati keasrian alam perbukitan dengan udara segar alami.
          </p>
          <div className="space-y-1 pt-1 text-[11px] font-mono text-[#c5a880]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>{resortInfo.coordinates}</span>
            </div>
            <div className="text-[10px] text-[#869990]">
              {resortInfo.elevation}
            </div>
          </div>
        </div>

        {/* Kolom 2: Menu Resor & Fasilitas (Sesuai Navigasi & Admin Portal) */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#faf9f5] mb-3 pb-1 border-b border-[#233830]">
            Menu & Eksplorasi
          </div>
          <ul className="space-y-2 text-xs text-[#95a69e]">
            <li>
              <a href="#suites" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Rooms & Villas (8 Kategori)</span>
                <span className="text-[10px] text-stone-500 group-hover:text-[#d4af37] transition-colors">Deluxe s/d Villa</span>
              </a>
            </li>
            <li>
              <a href="#expeditions" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Explore Wisata & Wahana</span>
                <span className="text-[10px] text-stone-500 group-hover:text-[#d4af37] transition-colors">Waterpark & Spot Foto</span>
              </a>
            </li>
            <li>
              <a href="#dining" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Resto, Cafe & Oleh-Oleh</span>
                <span className="text-[10px] text-stone-500 group-hover:text-[#d4af37] transition-colors">Vine Resto & Le Ciel</span>
              </a>
            </li>
            <li>
              <a href="#meeting" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Meeting Room & MICE</span>
                <span className="text-[10px] text-stone-500 group-hover:text-[#d4af37] transition-colors">Ballroom & Boardroom</span>
              </a>
            </li>
            <li>
              <a href="#meeting" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Wedding & Social Events</span>
                <span className="text-[10px] text-stone-500 group-hover:text-[#d4af37] transition-colors">Pine Outdoor & Pavilion</span>
              </a>
            </li>
            <li>
              <a href="#lokasi-resor" className="hover:text-white text-[#d4af37] font-medium transition-colors flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span>Peta Lokasi Google Maps</span>
              </a>
            </li>
            <li>
              <a href="#map" className="hover:text-[#fae7b3] text-[#ebd498] font-medium transition-colors flex items-center gap-1.5">
                <Navigation className="w-3 h-3" />
                <span>Peta Kawasan (65 Titik Resor)</span>
              </a>
            </li>
            <li className="pt-2 border-t border-[#233830]">
              <button
                type="button"
                onClick={onOpenAdmin || (() => { window.location.hash = 'admin'; })}
                className="text-[#d4af37] hover:text-[#fff0c2] transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal Admin CMS (CRUD)</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Layanan Tamu & Kontak BDE (Sesuai Admin Portal) */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#faf9f5] mb-3 pb-1 border-b border-[#233830]">
            Kontak BDE & Layanan Tamu
          </div>
          <ul className="space-y-3 text-xs text-[#95a69e]">
            {/* WhatsApp BDE Button */}
            <li>
              <div className="text-[10.5px] uppercase tracking-wider text-[#a4b8af] font-mono mb-1">
                Kontak BDE Resmi:
              </div>
              <a
                href={`https://wa.me/${resortInfo.whatsapp}?text=${encodeURIComponent(`Halo ${resortInfo.bdeName || 'BDE DEFIT'} (Chevilly Resort & Camp), saya ingin menanyakan informasi reservasi vila, wahana, resto, dan paket meeting/wedding.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/20 border border-[#25D366]/40 text-[#54e287] hover:bg-[#25D366]/30 hover:text-white transition-all text-xs font-semibold rounded-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                <span>{resortInfo.whatsappFormatted} ({resortInfo.bdeName || 'BDE : DEFIT'})</span>
              </a>
            </li>

            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
              <span>{resortInfo.phone}</span>
            </li>

            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
              <a href={`mailto:${resortInfo.conciergeEmail}`} className="hover:text-white transition-colors">
                {resortInfo.conciergeEmail}
              </a>
            </li>

            {/* Tautan Rute Google Maps */}
            <li className="pt-1 border-t border-[#233830]/80">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Chevilly+Resort+and+Camp+Bogor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10.5px] text-[#d4af37] hover:text-[#fae7b3] underline underline-offset-2 pt-0.5"
              >
                <span>Buka Petunjuk Rute Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>

        {/* Kolom 4: Jam Operasional & Akses Rute Resor */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#faf9f5] mb-3 pb-1 border-b border-[#233830]">
            Jam Operasional & Akses
          </div>
          <div className="space-y-3 text-xs text-[#95a69e]">
            <div className="p-3 bg-[#14231e] border border-[#233830] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white font-medium">Resor & Glamping:</span>
                <span className="font-mono text-emerald-400 font-semibold">24 Jam</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white font-medium">Wahana & Spot Foto:</span>
                <span className="font-mono text-[#d4af37]">08:00 - 17:00 WIB</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white font-medium">Vine Resto & Cafe:</span>
                <span className="font-mono text-[#d4af37]">07:00 - 22:00 WIB</span>
              </div>
            </div>

            <div className="text-[11px] text-[#c5a880] font-mono bg-[#14231e] px-3 py-2 border border-[#233830]">
              Check-In: {resortInfo.checkInTime} · Check-Out: {resortInfo.checkOutTime}
            </div>

            <div className="space-y-1 text-[11px] text-[#95a69e] pt-1">
              <div className="text-white font-semibold flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Akses Bebas Ganjil-Genap:</span>
              </div>
              <p className="leading-relaxed text-[10.5px] text-[#869990]">
                ±15 menit dari Gerbang Tol Ciawi / Gadog (Tol Jagorawi) via Jl. Raya Veteran III Banjarsari. Bebas aturan ganjil-genap utama Puncak.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-[#1c2e28] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71857c]">
        <div>
          © {new Date().getFullYear()} Chevilly Resort and Camp. Hak Cipta Dilindungi.
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Syarat Reservasi</a>
          <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
          <button
            onClick={onOpenAdmin || (() => { window.location.hash = 'admin'; })}
            className="text-[#d4af37] hover:text-[#fff2ce] transition-colors flex items-center gap-1 font-semibold cursor-pointer underline decoration-[#d4af37]/40 underline-offset-4"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal Admin CMS (CRUD Backend)</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
