import React, { useEffect } from 'react';
import { Mail, CheckCircle2, X, FileText, Download, ExternalLink } from 'lucide-react';

interface EmailDeliveryToastProps {
  email: string;
  bookingCode: string;
  guestName: string;
  onClose: () => void;
  onViewInvoice?: () => void;
}

export const EmailDeliveryToast: React.FC<EmailDeliveryToastProps> = ({
  email,
  bookingCode,
  guestName,
  onClose,
  onViewInvoice,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 7000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#0e1714] border border-[#d4af37]/50 shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-4 sm:p-5 text-[#f4efe4] animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-3 mb-2 pb-2 border-b border-[#2d4239]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#d4af37] font-semibold">
              Sistem Email Otomatis Chevilly
            </div>
            <div className="font-serif text-sm font-semibold text-white">
              Invoice & Voucher Berhasil Dikirim!
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[#9ea8a2] hover:text-white transition-colors cursor-pointer p-1"
          aria-label="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-xs text-[#cad5cf]">
        <p>
          Dokumen resmi untuk <span className="text-white font-medium">{guestName}</span> (Kode: <span className="font-mono text-[#edd28d]">{bookingCode}</span>) telah otomatis dikirimkan ke kotak masuk:
        </p>
        
        <div className="bg-black/40 border border-[#263c33] p-2.5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[#edd28d] truncate">
            <Mail className="w-3.5 h-3.5 shrink-0 text-[#d4af37]" />
            <span className="truncate">{email}</span>
          </div>
          <span className="text-emerald-400 text-[10px] font-semibold shrink-0">TERKIRIM</span>
        </div>

        {/* Attachments preview */}
        <div className="space-y-1 pt-1 text-[11px] text-[#9fb1a7]">
          <div className="text-[10px] uppercase tracking-wider text-[#d4af37]">Lampiran Dokumen:</div>
          <div className="flex items-center gap-2 text-white">
            <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Invoice-Resmi-{bookingCode}.pdf (142 KB)</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>E-Voucher-Checkin-{bookingCode}.pdf (98 KB)</span>
          </div>
        </div>
      </div>

      {onViewInvoice && (
        <div className="mt-3 pt-2.5 border-t border-[#2d4239] flex items-center justify-between text-xs">
          <span className="text-[10px] text-[#869990]">Periksa folder Spam jika belum masuk</span>
          <button
            onClick={() => {
              onClose();
              onViewInvoice();
            }}
            className="text-[#edd28d] hover:text-white font-semibold underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Lembar Invoice</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
