import React, { useEffect, useRef, useState } from 'react';
import { Reservation, Currency } from '../types';
import { formatPrice, formatDateIndonesian } from '../utils/formatters';
import { X, Printer, CheckCircle2, Download, Building, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  currency: Currency;
  autoPrint?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  reservation,
  currency,
  autoPrint = true,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && autoPrint && reservation) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, reservation]);

  if (!isOpen || !reservation) return null;

  const invoiceNumber = `INV-CHV-${reservation.bookingCode}`;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nights = reservation.room?.nights || 1;
  const roomPrice = reservation.room ? reservation.room.pricePerNight * nights : 0;
  
  const toursTotal = reservation.tours
    ? reservation.tours.reduce((acc, t) => acc + t.pricePerPerson * t.participants, 0)
    : 0;

  const addOnsTotal = reservation.selectedAddOns
    ? reservation.selectedAddOns.reduce((acc, a) => acc + a.price * a.quantity, 0)
    : 0;

  const subtotal = roomPrice + toursTotal + addOnsTotal || reservation.totalPriceIdr;
  const tax = 0;

  const normalizedStatus =
    reservation.status === 'Konfirmasi' ||
    reservation.status === 'Down Payment' ||
    reservation.status === 'Lunas' ||
    reservation.status === 'Selesai'
      ? reservation.status
      : 'Konfirmasi';

  const statusBadgeClass =
    normalizedStatus === 'Lunas'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : normalizedStatus === 'Selesai'
        ? 'bg-sky-50 border-sky-200 text-sky-800'
        : normalizedStatus === 'Down Payment'
          ? 'bg-violet-50 border-violet-200 text-violet-800'
          : 'bg-amber-50 border-amber-300 text-amber-800';

  const buildPrintableHtml = (autoTriggerPrintOnLoad = false): string => {
    const printEl = document.getElementById('invoice-print-area');
    if (!printEl) return '';

    const origin = window.location.origin;
    const clonedHtml = printEl.outerHTML.replace(/src="\/(?!\/)/g, `src="${origin}/`);

    const headStyles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((node) => {
        if (node.tagName.toLowerCase() === 'link') {
          const href = (node as HTMLLinkElement).href;
          return `<link rel="stylesheet" href="${href}" />`;
        }
        return node.outerHTML;
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNumber} - Chevilly Resort and Camp</title>
  ${headStyles}
  <style>
    @page { size: A4; margin: 10mm; }
    html, body {
      background: #ffffff !important;
      color: #1a1a1a !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #invoice-print-area {
      position: static !important;
      width: 100% !important;
      max-width: 100% !important;
      padding: 18px !important;
      margin: 0 !important;
      background: #ffffff !important;
      visibility: visible !important;
    }
    #invoice-print-area * {
      visibility: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  </style>
</head>
<body>
  ${clonedHtml}
  ${autoTriggerPrintOnLoad ? '<script>window.addEventListener("load", function(){ setTimeout(function(){ window.print(); }, 250); });</script>' : ''}
</body>
</html>`;
  };

  const handleDownloadPrintableHtml = () => {
    const html = buildPrintableHtml(true);
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleManualPrint = () => {
    setIsPrinting(true);
    setPrintNotice(null);

    try {
      const html = buildPrintableHtml(false);
      if (!html) {
        window.print();
        setIsPrinting(false);
        return;
      }

      const existingFrame = document.getElementById('chevilly-print-frame');
      if (existingFrame && existingFrame.parentNode) {
        existingFrame.parentNode.removeChild(existingFrame);
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'chevilly-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!frameDoc || !iframe.contentWindow) {
        window.print();
        setIsPrinting(false);
        return;
      }

      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setPrintNotice('Perintah cetak dikirim ke printer lokal. Pilih printer atau "Save as PDF".');
        } catch {
          window.print();
          setPrintNotice('Dialog cetak browser dijalankan.');
        } finally {
          setIsPrinting(false);
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }, 3000);
        }
      }, 220);
    } catch {
      try {
        window.print();
        setPrintNotice('Dialog cetak browser dijalankan.');
      } catch {
        setPrintNotice('Browser membatasi cetak langsung dari iframe. Gunakan tombol Unduh Siap Cetak.');
      }
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/85 backdrop-blur-md flex items-start justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      {/* Top action bar - Hidden when printing */}
      <div className="fixed top-4 right-4 z-[85] flex items-center gap-2 print:hidden">
        <button
          type="button"
          disabled={isPrinting}
          onClick={handleManualPrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#edd28d] text-[#0d1613] text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-70"
          title="Cetak langsung ke printer lokal atau simpan sebagai PDF"
        >
          <Printer className="w-4 h-4" />
          <span>{isPrinting ? 'Menyiapkan Cetak...' : 'Cetak Printer / PDF'}</span>
        </button>
        <button
          type="button"
          onClick={handleDownloadPrintableHtml}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#182a24] hover:bg-[#243d35] text-[#fae7b3] border border-[#d4af37]/50 text-xs font-semibold tracking-wider shadow-lg transition-all cursor-pointer"
          title="Unduh file invoice siap cetak untuk dibuka & diprint langsung"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">File Cetak</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2 bg-black/70 hover:bg-black text-white border border-white/20 transition-all cursor-pointer"
          title="Tutup Invoice"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Invoice Sheet Container (A4 Printable Layout) */}
      <div
        ref={printRef}
        className="bg-white text-stone-900 w-full max-w-3xl shadow-2xl overflow-hidden border border-stone-300 print:border-none print:shadow-none print:max-w-none print:w-full print:m-0 print:overflow-visible my-auto print:my-0"
      >
        {/* Printable CSS style tags to ensure pristine document render */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            html, body {
              background: #ffffff !important;
              overflow: visible !important;
              height: auto !important;
            }
            body * {
              visibility: hidden;
            }
            #invoice-print-area, #invoice-print-area * {
              visibility: visible;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #invoice-print-area {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 18px;
              background: #ffffff !important;
              color: #1a1a1a !important;
            }
          }
        `}} />

        <div id="invoice-print-area" className="p-8 sm:p-12 space-y-8 bg-white text-stone-900">
          
          {/* Header Zone: Simple & Elegant Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dfd8ca] pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#182a24] px-2.5 py-1.5 border border-[#d4af37]/50 shrink-0">
                <img
                  src="/assets/aistudio/LOGO_KUNING_2_7dfae9a0.png"
                  alt="Chevilly Resort and Camp"
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#967d58]">
                  Official Resort Invoice
                </div>
                <h1 className="font-serif text-base sm:text-lg font-medium tracking-wide text-[#182a24] leading-tight">
                  Chevilly Resort and Camp
                </h1>
                <p className="text-[10px] text-stone-500 tracking-wide">
                  Jl. Raya Veteran III, Ciawi · Bogor 16720
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <span className={`inline-block px-2 py-0.5 border text-[9px] font-mono tracking-[0.16em] uppercase ${statusBadgeClass}`}>
                {normalizedStatus}
              </span>
              <div className="text-sm sm:text-base font-mono font-semibold text-[#182a24] tracking-tight pt-0.5">
                {invoiceNumber}
              </div>
              <div className="text-[11px] text-stone-500">
                {currentDate} · <span className="font-mono font-medium text-[#182a24]">{reservation.bookingCode}</span>
              </div>
            </div>
          </div>

          {/* Billing & Guest Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-b border-stone-200 pb-6">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold mb-2">
                DITAGIHKAN KEPADA (GUEST INFORMATION):
              </div>
              <div className="font-semibold text-base text-stone-900 font-serif">
                {reservation.guestName}
              </div>
              <div className="text-stone-600 mt-1 flex flex-col gap-0.5">
                <span>Email: {reservation.guestEmail}</span>
                <span>Telepon: {reservation.guestPhone}</span>
                {reservation.specialRequests && (
                  <span className="italic text-stone-500 mt-1">
                    Permintaan: "{reservation.specialRequests}"
                  </span>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold mb-2">
                DETAIL KEDATANGAN & METODE:
              </div>
              <div className="text-stone-700 space-y-1">
                {reservation.room && (
                  <div>
                    <span className="font-medium text-stone-900">Periode Menginap:</span>
                    <br />
                    {formatDateIndonesian(reservation.room.checkIn)} — {formatDateIndonesian(reservation.room.checkOut)} ({reservation.room.nights} Malam)
                  </div>
                )}
                <div>
                  <span className="font-medium text-stone-900">Metode Pembayaran:</span>
                  <br />
                  {reservation.paymentMethod || 'Virtual Account BCA'}
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table of Charges */}
          <div>
            <div className="text-[11px] uppercase font-mono tracking-wider text-stone-700 font-bold mb-3">
              RINCIAN TAGIHAN & LAYANAN (ITEMIZED CHARGES)
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-800 text-stone-700 uppercase font-mono text-[10px]">
                  <th className="py-2.5 font-bold">Deskripsi Layanan</th>
                  <th className="py-2.5 text-center font-bold">Kuantitas / Durasi</th>
                  <th className="py-2.5 text-right font-bold">Tarif Satuan</th>
                  <th className="py-2.5 text-right font-bold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {/* Room */}
                {reservation.room && (
                  <tr>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-stone-900 font-serif text-sm">
                        {reservation.room.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Check-in: {formatDateIndonesian(reservation.room.checkIn)} (15:00 WIB) · Check-out: {formatDateIndonesian(reservation.room.checkOut)} (12:00 WIB)
                      </div>
                    </td>
                    <td className="py-3 text-center text-stone-700 font-mono">
                      {reservation.room.nights} Malam ({reservation.room.adults} Dewasa{reservation.room.children > 0 ? `, ${reservation.room.children} Anak` : ''})
                    </td>
                    <td className="py-3 text-right font-mono text-stone-700">
                      {formatPrice(reservation.room.pricePerNight, 0, currency)}
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-stone-900">
                      {formatPrice(roomPrice, 0, currency)}
                    </td>
                  </tr>
                )}

                {/* Tours */}
                {reservation.tours && reservation.tours.map((tour, idx) => (
                  <tr key={idx}>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-stone-900 font-serif text-sm">
                        {tour.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Tanggal: {formatDateIndonesian(tour.date)} · Waktu: {tour.timeSlot}
                      </div>
                    </td>
                    <td className="py-3 text-center text-stone-700 font-mono">
                      {tour.participants} Peserta
                    </td>
                    <td className="py-3 text-right font-mono text-stone-700">
                      {formatPrice(tour.pricePerPerson, 0, currency)}
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-stone-900">
                      {formatPrice(tour.pricePerPerson * tour.participants, 0, currency)}
                    </td>
                  </tr>
                ))}

                {/* Add-ons */}
                {reservation.selectedAddOns && reservation.selectedAddOns.map((addon, idx) => (
                  <tr key={idx}>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-stone-900">
                        Fasilitas Tambahan: {addon.name}
                      </div>
                    </td>
                    <td className="py-3 text-center text-stone-700 font-mono">
                      {addon.quantity} Paket
                    </td>
                    <td className="py-3 text-right font-mono text-stone-700">
                      {formatPrice(addon.price, 0, currency)}
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-stone-900">
                      {formatPrice(addon.price * addon.quantity, 0, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-stone-300">
            <div className="text-[11px] text-stone-500 max-w-sm space-y-1">
              <span className="font-bold text-stone-800">Catatan & Ketentuan Resor:</span>
              <p>
                1. Invoice resmi ini merupakan bukti sah reservasi dan pelunasan di Chevilly Resort and Camp.
              </p>
              <p>
                2. Tunjukkan invoice ini (cetak atau e-voucher) di meja front desk concierge saat check-in.
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Layanan:</span>
                <span className="font-mono font-medium text-stone-900">
                  {formatPrice(subtotal, 0, currency)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Pajak Restoran &amp; Daerah (0%):</span>
                <span className="font-mono text-stone-700">
                  {formatPrice(tax, 0, currency)}
                </span>
              </div>
              <div className="pt-3 border-t-2 border-stone-800 flex justify-between items-baseline font-bold">
                <span className="text-sm uppercase tracking-wider text-stone-900">Total Tagihan:</span>
                <span className="text-lg font-mono text-[#182a24]">
                  {formatPrice(reservation.totalPriceIdr, reservation.totalPriceUsd, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Validation Stamp */}
          <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-stone-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-dashed border-emerald-600 rounded flex items-center justify-center text-emerald-700 font-mono text-[9px] font-bold text-center leading-tight p-1 uppercase">
                VERIFIED PAID
              </div>
              <div>
                <div className="font-semibold text-stone-800">Finance & Front Desk Office</div>
                <div>Chevilly Resort & Camp</div>
                <div className="font-mono text-[10px] text-stone-500">Otorisasi ID: CHV-SEC-{reservation.bookingCode}</div>
              </div>
            </div>

            <div className="text-center sm:text-right font-mono text-[10px] text-stone-500">
              <div>Dicetak otomatis oleh Sistem Reservasi Chevilly</div>
              <div>Hotline 24 Jam: +62 21 8089 2450</div>
            </div>
          </div>

        </div>
      </div>

      {printNotice && (
        <div className="fixed top-16 right-4 z-50 print:hidden bg-[#182a24] text-[#fae7b3] border border-[#d4af37]/60 px-3 py-1.5 text-[11px] shadow-xl flex items-center gap-2 max-w-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{printNotice}</span>
          <button
            type="button"
            onClick={() => setPrintNotice(null)}
            className="text-white/70 hover:text-white font-bold ml-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
