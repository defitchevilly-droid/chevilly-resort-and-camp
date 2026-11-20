import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Phone, Calendar, Users, MessageSquare, Check, GripVertical } from 'lucide-react';

export const MEETING_PACKAGES = [
  { id: 'fullboard_single', name: 'Fullboard Single', desc: '1 Kamar / 1 Pax (VIP)' },
  { id: 'fullboard_twin', name: 'Fullboard Twin', desc: '1 Kamar / 2 Pax (Twin Bed)' },
  { id: 'fullboard_triple', name: 'Fullboard Triple', desc: '1 Kamar / 3 Pax (Sharing)' },
  { id: 'bunkbed', name: 'Bunkbed', desc: 'Kamar Tingkat Rombongan' },
];

export const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16ZM16.57 14.39C16.32 14.27 15.1 13.67 14.88 13.58C14.65 13.5 14.49 13.46 14.32 13.71C14.16 13.95 13.69 14.51 13.55 14.67C13.41 14.84 13.26 14.86 13.02 14.73C12.77 14.61 11.98 14.35 11.04 13.51C10.3 12.86 9.81 12.05 9.67 11.8C9.52 11.56 9.65 11.42 9.78 11.3C9.89 11.19 10.02 11.02 10.15 10.87C10.27 10.72 10.31 10.62 10.39 10.45C10.47 10.29 10.43 10.15 10.37 10.02C10.31 9.9 9.82 8.7 9.62 8.21C9.42 7.73 9.22 7.8 9.07 7.79C8.93 7.78 8.76 7.78 8.6 7.78C8.44 7.78 8.17 7.84 7.94 8.09C7.72 8.33 7.08 8.93 7.08 10.15C7.08 11.37 7.97 12.55 8.09 12.71C8.22 12.88 9.84 15.37 12.32 16.44C12.91 16.7 13.37 16.85 13.73 16.96C14.32 17.15 14.86 17.12 15.28 17.06C15.76 16.99 16.75 16.46 16.96 15.87C17.16 15.28 17.16 14.77 17.1 14.67C17.04 14.57 16.82 14.51 16.57 14.39Z" />
  </svg>
);

const WA_POSITION_STORAGE_KEY = 'chevilly_wa_floating_pos';

export const WhatsAppFloatingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('Paket Meeting & Gathering Perusahaan (MICE)');
  const [selectedMeetingPackages] = useState<string[]>(['fullboard_twin']);
  const [date, setDate] = useState('');
  const [guestsCount, setGuestsCount] = useState('20 Orang');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  // Flexible Draggable Position State
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem(WA_POSITION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });
  const suppressNextClickRef = useRef(false);

  const clampPosition = (x: number, y: number) => {
    const margin = 12;
    const rect = buttonRef.current?.getBoundingClientRect();
    const btnWidth = rect?.width || 180;
    const btnHeight = rect?.height || 56;
    const maxX = Math.max(margin, window.innerWidth - btnWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - btnHeight - margin);
    return {
      x: Math.max(margin, Math.min(x, maxX)),
      y: Math.max(margin, Math.min(y, maxY)),
    };
  };

  // Keep button safely inside viewport on initial load & window resize
  useEffect(() => {
    const handleClampOnResize = () => {
      setPosition((prev) => (prev ? clampPosition(prev.x, prev.y) : prev));
    };
    handleClampOnResize();
    window.addEventListener('resize', handleClampOnResize);
    return () => window.removeEventListener('resize', handleClampOnResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > 5) {
      drag.moved = true;
      setIsDragging(true);
    }

    if (drag.moved) {
      const next = clampPosition(drag.originX + dx, drag.originY + dy);
      setPosition(next);
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (drag.moved) {
      suppressNextClickRef.current = true;
      setIsDragging(false);
      setPosition((current) => {
        if (current) {
          try {
            localStorage.setItem(WA_POSITION_STORAGE_KEY, JSON.stringify(current));
          } catch {
            // ignore storage errors
          }
        }
        return current;
      });
      setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 60);
    }

    dragStateRef.current.active = false;
  };

  // Compute smart popup orientation relative to current button position
  const isLeftHalf = position ? position.x + 90 < (typeof window !== 'undefined' ? window.innerWidth / 2 : 500) : false;
  const isTopHalf = position ? position.y + 28 < (typeof window !== 'undefined' ? window.innerHeight / 2 : 400) : false;

  // Target WhatsApp phone (national/international digits only)
  const targetWhatsAppNumber = '6285934544901';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    // Compose formatted WhatsApp text message
    let text = `*FORMULIR CALON CUSTOMER BARU*\n`;
    text += `*CHEVILLY RESORT AND CAMP (BDE : DEFIT)*\n`;
    text += `─────────────────────────\n`;
    text += `👤 *Nama Calon Tamu:* ${name.trim()}\n`;
    text += `📱 *Nomor WhatsApp / HP:* ${phone.trim() || '-'}\n`;
    text += `🛎️ *Layanan yang Diminati:* ${serviceType}\n`;

    // Append meeting packages checklist if selected
    if (selectedMeetingPackages.length > 0) {
      const pkgNames = selectedMeetingPackages.map(
        (id) => MEETING_PACKAGES.find((p) => p.id === id)?.name || id
      );
      text += `🏢 *Pilihan Paket Meeting:* ${pkgNames.join(', ')}\n`;
    }

    if (date) {
      text += `📅 *Rencana Tanggal:* ${date}\n`;
    }
    text += `👥 *Estimasi Jumlah Tamu:* ${guestsCount}\n`;
    if (message.trim()) {
      text += `📝 *Catatan / Pertanyaan Khusus:*\n"${message.trim()}"\n`;
    }
    text += `─────────────────────────\n`;
    text += `Halo BDE DEFIT (Chevilly Resort), saya calon customer baru. Mohon info ketersediaan & penawaran terbaik untuk rencana reservasi ini. Terima kasih! 🙏`;

    const encodedText = encodeURIComponent(text);
    const waUrl = `https://api.whatsapp.com/send?phone=${targetWhatsAppNumber}&text=${encodedText}`;

    // Open WhatsApp
    window.open(waUrl, '_blank');

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setIsOpen(false);
    }, 2500);
  };

  return (
    <div
      className={`fixed z-50 ${position ? '' : 'bottom-6 right-6'}`}
      style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
    >
      {/* Floating Popup Form Card — adapts cleanly above/below & left/right of button */}
      {isOpen && (
        <div
          className={`absolute ${isTopHalf ? 'top-full mt-3' : 'bottom-full mb-3'} ${
            isLeftHalf ? 'left-0' : 'right-0'
          } w-[92vw] sm:w-[380px] max-h-[82vh] flex flex-col bg-[#fcfbf9] border-2 border-[#182a24] shadow-2xl overflow-hidden animate-in fade-in duration-200`}
        >
          {/* Card Header */}
          <div className="shrink-0 bg-[#182a24] text-[#f7f5ef] p-4 flex items-center justify-between border-b border-[#d4af37]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-white tracking-wide">
                  Formulir Calon Customer Baru
                </h3>
                <div className="text-[10px] text-[#edd28d] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>BDE : DEFIT (+62 859-3454-4901)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#d4af37] hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup Formulir WhatsApp"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          {sentSuccess ? (
            <div className="p-8 text-center space-y-3 bg-[#f5fbf7] overflow-y-auto">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                Formulir Berhasil Dikirim!
              </h4>
              <p className="text-xs text-[#52645c] leading-relaxed">
                Aplikasi WhatsApp Anda telah terbuka. Pesan formulir calon tamu otomatis tersusun dan siap dikirim ke tim Concierge Chevilly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto max-h-[calc(82vh-72px)] sm:max-h-[500px] p-4 sm:p-5 space-y-3.5 text-xs text-[#182a24] overscroll-contain"
            >
              <div className="text-[11px] text-[#6b7b73] bg-[#f2eee3] p-2.5 border border-[#ded7cb] leading-relaxed">
                Isi data di bawah ini, lalu klik tombol di bawah untuk <strong>otomatis membuka WhatsApp</strong> dengan format data yang rapi.
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                  Nama Lengkap Calon Tamu <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#967d58] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Hendra Gunawan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#ded7cb] pl-9 pr-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                  Nomor WhatsApp / HP
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#967d58] absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="Contoh: 0812-3456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#ded7cb] pl-9 pr-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              {/* Layanan yang Diminati & Pilihan Paket Meeting */}
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                    Pilihan Layanan
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-white border border-[#ded7cb] px-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#25D366]"
                  >
                    <option value="Paket Meeting & Gathering Perusahaan (MICE)">Paket Meeting & Gathering Perusahaan (MICE)</option>
                    <option value="Kamar & Villa (Villas & Suites)">Kamar & Villa (Rooms & Suites)</option>
                    <option value="Paket Wedding & Honeymoon Eksklusif">Paket Wedding & Honeymoon Eksklusif</option>
                    <option value="Reservasi Restoran (Vine Resto)">Reservasi Restoran (Vine Resto)</option>
                    <option value="Tiket Explore Wisata (Waterpark, Aviary, Colosseum, ATV dll)">Tiket Explore Wisata (Waterpark, Aviary, Colosseum, ATV dll)</option>
                    <option value="Konsultasi Umum / Paket Custom">Konsultasi Umum / Paket Custom</option>
                  </select>
                </div>
              </div>

              {/* Tanggal & Jumlah Orang */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                    Rencana Tanggal
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-[#967d58] absolute left-2.5 top-3" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white border border-[#ded7cb] pl-8 pr-2 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#25D366]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                    Jumlah Tamu
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-[#967d58] absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Contoh: 2 Orang"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className="w-full bg-white border border-[#ded7cb] pl-8 pr-2 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#25D366]"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan / Kebutuhan Khusus */}
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                  Catatan / Kebutuhan Khusus
                </label>
                <div className="relative">
                  <MessageSquare className="w-3.5 h-3.5 text-[#967d58] absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    placeholder="Contoh: Ruang meeting 30 pax, projector + 2x coffee break..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-[#ded7cb] pl-9 pr-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              {/* Submit to WhatsApp Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all rounded-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Kirim Form Otomatis ke WhatsApp</span>
                <Send className="w-3.5 h-3.5" />
              </button>

              <div className="text-[10px] text-center text-[#73837b]">
                Terhubung langsung ke BDE : DEFIT · <span className="font-mono font-medium text-[#182a24]">+62 859-3454-4901</span>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Draggable Floating Trigger Button with Pulsing Badge */}
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        onClick={() => {
          if (suppressNextClickRef.current) return;
          setIsOpen((prev) => !prev);
        }}
        title="Klik untuk buka form WhatsApp · Tahan & geser untuk memindahkan posisi"
        className={`group flex items-center gap-2 pl-2.5 pr-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.65)] transition-shadow duration-200 border-2 border-white/60 select-none touch-none ${
          isDragging ? 'cursor-grabbing scale-[1.03] shadow-[0_12px_32px_rgba(37,211,102,0.65)]' : 'cursor-grab'
        }`}
        aria-label="Kirim Form ke WhatsApp BDE DEFIT (Geser untuk pindah posisi)"
      >
        <GripVertical className="w-3.5 h-3.5 text-white/75 group-hover:text-white shrink-0 -mr-0.5" />
        <div className="relative">
          <WhatsAppIcon className="w-6 h-6 text-white drop-shadow-sm" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full border border-white animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full border border-white" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/90 leading-none">
            BDE : DEFIT
          </div>
          <div className="text-xs font-bold leading-tight">
            +62 859-3454-4901
          </div>
        </div>
      </button>
    </div>
  );
};
