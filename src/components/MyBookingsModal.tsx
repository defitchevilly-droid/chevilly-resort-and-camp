import React, { useState } from 'react';
import { Reservation, Currency, VisitorUser } from '../types';
import { formatPrice, formatDateIndonesian } from '../utils/formatters';
import {
  X, Calendar, BookmarkCheck, Printer, Trash2, Compass,
  CheckCircle2, LogOut, UserCheck, Plus, ShoppingBag, AlertCircle,
  Upload, Eye, EyeOff, Image as ImageIcon, FileCheck2, UserCog, Lock
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { WhatsAppIcon } from './WhatsAppFloatingWidget';
import { uploadImage, updateReservation } from '../services/api';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  currency: Currency;
  onCancelReservation: (id: string) => void | Promise<boolean | void>;
  onReservationUpdated?: (updated: Reservation) => void;
  onNewReservation: () => void;
  currentUser?: VisitorUser | null;
  onUpdateProfile?: (user: VisitorUser) => void;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

const normalizeReservationStatus = (
  status?: string
): 'Konfirmasi' | 'Down Payment' | 'Lunas' | 'Selesai' => {
  if (
    status === 'Konfirmasi' ||
    status === 'Down Payment' ||
    status === 'Lunas' ||
    status === 'Selesai'
  ) {
    return status;
  }
  return 'Konfirmasi';
};

const getStatusBadgeClass = (
  status: 'Konfirmasi' | 'Down Payment' | 'Lunas' | 'Selesai'
) => {
  if (status === 'Lunas') {
    return 'text-emerald-800 bg-emerald-50 border-emerald-200';
  }
  if (status === 'Selesai') {
    return 'text-sky-800 bg-sky-50 border-sky-200';
  }
  if (status === 'Down Payment') {
    return 'text-violet-800 bg-violet-50 border-violet-200';
  }
  return 'text-amber-800 bg-amber-50 border-amber-300';
};

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  reservations,
  currency,
  onCancelReservation,
  onReservationUpdated,
  onNewReservation,
  currentUser,
  onUpdateProfile,
  onLogout,
  onOpenLogin,
}) => {
  // Daftar reservasi hanya tampil jika sudah login; jika belum login akan kosong
  const displayReservations = currentUser
    ? (() => {
        const matched = reservations.filter(
          (r) => r.guestEmail.toLowerCase() === currentUser.email.toLowerCase()
        );
        return matched.length > 0 ? matched : reservations;
      })()
    : [];

  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(
    displayReservations.length > 0 ? displayReservations[0] : null
  );
  const [invoiceReservation, setInvoiceReservation] = useState<Reservation | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<Reservation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Guest Profile Edit Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPasswordValues, setShowPasswordValues] = useState(false);
  const [hasStoredPassword, setHasStoredPassword] = useState(false);

  // Payment Proof Upload & View Modal States
  const [uploadProofTarget, setUploadProofTarget] = useState<Reservation | null>(null);
  const [proofPreviewDataUrl, setProofPreviewDataUrl] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadProofError, setUploadProofError] = useState<string | null>(null);
  const [viewProofTarget, setViewProofTarget] = useState<Reservation | null>(null);

  // Total Calculations across all active reservations
  const totalAmountIdr = displayReservations.reduce((sum, r) => sum + (r.totalPriceIdr || 0), 0);
  const totalAmountUsd = displayReservations.reduce((sum, r) => sum + (r.totalPriceUsd || 0), 0);

  // Sync selected booking if list or status/proof changes
  React.useEffect(() => {
    if (displayReservations.length === 0) {
      if (selectedBooking) setSelectedBooking(null);
    } else {
      const currentMatch = selectedBooking
        ? displayReservations.find((r) => r.id === selectedBooking.id)
        : null;
      if (!currentMatch) {
        setSelectedBooking(displayReservations[0]);
      } else if (currentMatch !== selectedBooking) {
        setSelectedBooking(currentMatch);
      }
    }
  }, [displayReservations, selectedBooking]);

  const handleOpenUploadProof = (res: Reservation) => {
    setUploadProofTarget(res);
    setProofPreviewDataUrl(res.paymentProofUrl || '');
    setProofNote(res.paymentProofNote || '');
    setUploadProofError(null);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadProofError('Harap pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadProofError('Ukuran file maksimal 10MB.');
      return;
    }
    setUploadProofError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofPreviewDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadProofTarget) return;
    if (!proofPreviewDataUrl) {
      setUploadProofError('Silakan pilih gambar bukti transfer terlebih dahulu.');
      return;
    }

    setIsUploadingProof(true);
    setUploadProofError(null);
    try {
      let finalUrl = proofPreviewDataUrl;
      if (proofPreviewDataUrl.startsWith('data:image/')) {
        const uploadRes = await uploadImage(
          proofPreviewDataUrl,
          `bukti_tf_${uploadProofTarget.bookingCode}`
        );
        if (!uploadRes.success || !uploadRes.url) {
          setUploadProofError(uploadRes.message || 'Gagal mengunggah bukti transfer.');
          return;
        }
        finalUrl = uploadRes.url;
      }

      const uploadedAt = new Date().toISOString();
      const updatedReservation: Reservation = {
        ...uploadProofTarget,
        paymentProofUrl: finalUrl,
        paymentProofUploadedAt: uploadedAt,
        paymentProofNote: proofNote.trim(),
      };

      const saved = await updateReservation(uploadProofTarget.id, {
        paymentProofUrl: finalUrl,
        paymentProofUploadedAt: uploadedAt,
        paymentProofNote: proofNote.trim(),
      });

      if (!saved) {
        setUploadProofError('Gagal menyimpan data bukti transfer ke database.');
        return;
      }

      if (onReservationUpdated) {
        onReservationUpdated(updatedReservation);
      }
      if (selectedBooking?.id === updatedReservation.id) {
        setSelectedBooking(updatedReservation);
      }

      setDeleteNotice(`Bukti transfer untuk kode ${uploadProofTarget.bookingCode} berhasil diunggah.`);
      setTimeout(() => setDeleteNotice(null), 5000);
      setUploadProofTarget(null);
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;
    setIsDeleting(true);
    const targetId = confirmDeleteItem.id;
    const targetCode = confirmDeleteItem.bookingCode;
    try {
      await onCancelReservation(targetId);
      if (selectedBooking?.id === targetId) {
        setSelectedBooking(null);
      }
      setDeleteNotice(`Reservasi ${targetCode} berhasil dihapus dari database.`);
      setTimeout(() => setDeleteNotice(null), 4000);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteItem(null);
    }
  };

  // Handler: Send ALL reservations summary automatically to WhatsApp BDE Defit
  const handleSendAllToWhatsApp = () => {
    if (displayReservations.length === 0) {
      const text = encodeURIComponent(
        `Halo BDE Defit, saya ingin menanyakan informasi dan membuat reservasi baru di Chevilly Resort and Camp.`
      );
      window.open(`https://wa.me/6285934544901?text=${text}`, '_blank');
      return;
    }

    let msg = `Halo BDE Defit, saya ingin mengonfirmasi total reservasi saya di *Chevilly Resort and Camp*:\n\n`;
    msg += `📋 *TOTAL RINGKASAN RESERVASI (${displayReservations.length} ITEM):*\n`;
    msg += `─────────────────────────\n`;

    displayReservations.forEach((res, i) => {
      const title = res.room ? res.room.name : (res.tours?.[0]?.name || 'Paket Reservasi');
      msg += `*${i + 1}. ${title}*\n`;
      msg += `   • Kode Booking: *${res.bookingCode}*\n`;
      if (res.room) {
        msg += `   • Tanggal: ${formatDateIndonesian(res.room.checkIn)} (${res.room.nights} Malam)\n`;
        msg += `   • Tamu: ${res.room.adults} Dewasa${res.room.children ? `, ${res.room.children} Anak` : ''}\n`;
      }
      if (res.tours && res.tours.length > 0) {
        res.tours.forEach((t) => {
          msg += `   • Tiket/Wahana: ${t.name} (${t.participants} Orang)\n`;
        });
      }
      if (res.selectedAddOns && res.selectedAddOns.length > 0) {
        msg += `   • Tambahan: ${res.selectedAddOns.map((a) => a.name).join(', ')}\n`;
      }
      msg += `   • Subtotal: Rp ${res.totalPriceIdr.toLocaleString('id-ID')} ($${res.totalPriceUsd})\n\n`;
    });

    msg += `─────────────────────────\n`;
    msg += `💰 *TOTAL BIAYA KESELURUHAN:* *Rp ${totalAmountIdr.toLocaleString('id-ID')}* (~$${totalAmountUsd} USD)\n\n`;

    const guest = currentUser || (displayReservations[0] ? {
      name: displayReservations[0].guestName,
      phone: displayReservations[0].guestPhone,
      email: displayReservations[0].guestEmail
    } : null);

    if (guest) {
      msg += `👤 *DATA PEMESAN:*\n`;
      msg += `• Nama: ${guest.name}\n`;
      if (guest.phone) msg += `• WhatsApp: ${guest.phone}\n`;
      if (guest.email) msg += `• Email: ${guest.email}\n`;
    }

    msg += `\nMohon konfirmasi ketersediaan dan panduan pembayarannya ke BDE Defit (+62 859-3454-4901). Terima kasih!`;

    const url = `https://wa.me/6285934544901?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Handler: Send single selected booking to WhatsApp
  const handleSendSingleToWhatsApp = (res: Reservation) => {
    const title = res.room ? res.room.name : (res.tours?.[0]?.name || 'Paket Reservasi');
    let msg = `Halo BDE Defit, saya ingin mengonfirmasi voucher reservasi saya:\n\n`;
    msg += `🎫 *KODE BOOKING:* *${res.bookingCode}*\n`;
    msg += `🏨 *LAYANAN:* *${title}*\n`;
    if (res.room) {
      msg += `📅 *Check-in:* ${formatDateIndonesian(res.room.checkIn)} (${res.room.nights} Malam)\n`;
      msg += `👥 *Tamu:* ${res.room.adults} Dewasa${res.room.children ? `, ${res.room.children} Anak` : ''}\n`;
    }
    if (res.tours && res.tours.length > 0) {
      res.tours.forEach((t) => {
        msg += `🎟️ *Tiket:* ${t.name} (${t.participants} Orang)\n`;
      });
    }
    msg += `💰 *Total Biaya:* Rp ${res.totalPriceIdr.toLocaleString('id-ID')} ($${res.totalPriceUsd})\n`;
    msg += `👤 *Nama Tamu:* ${res.guestName}\n`;
    msg += `📱 *WhatsApp:* ${res.guestPhone}\n\n`;
    msg += `Mohon bantuan konfirmasi dari BDE Defit (+62 859-3454-4901). Terima kasih!`;

    window.open(`https://wa.me/6285934544901?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const readGuestCredentials = (): Record<string, { password: string; name?: string; phone?: string }> => {
    try {
      const raw = localStorage.getItem('chevilly_guest_credentials');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const writeGuestCredentials = (creds: Record<string, { password: string; name?: string; phone?: string }>) => {
    try {
      localStorage.setItem('chevilly_guest_credentials', JSON.stringify(creds));
    } catch {
      // Ignore storage errors
    }
  };

  const handleOpenProfileModal = () => {
    const fallbackRes = selectedBooking || displayReservations[0] || null;
    const initialEmail = currentUser?.email || fallbackRes?.guestEmail || '';
    const creds = readGuestCredentials();
    const existingCred = initialEmail ? creds[initialEmail.trim().toLowerCase()] : undefined;

    setProfileName(currentUser?.name || fallbackRes?.guestName || '');
    setProfileEmail(initialEmail);
    setProfilePhone(currentUser?.phone || fallbackRes?.guestPhone || '');
    setProfileError(null);
    setShowPasswordSection(false);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setShowPasswordValues(false);
    setHasStoredPassword(Boolean(existingCred?.password));
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (!profileName.trim()) {
      setProfileError('Nama lengkap tamu wajib diisi.');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      setProfileError('Alamat email yang valid wajib diisi.');
      return;
    }

    const oldEmailKey = currentUser?.email?.trim().toLowerCase() || '';
    const newEmailKey = profileEmail.trim().toLowerCase();
    const creds = readGuestCredentials();
    const existingCred = (oldEmailKey && creds[oldEmailKey]) || creds[newEmailKey];

    const wantsPasswordChange =
      showPasswordSection &&
      Boolean(currentPasswordInput || newPasswordInput || confirmPasswordInput);

    if (wantsPasswordChange) {
      if (existingCred?.password && currentPasswordInput !== existingCred.password) {
        setProfileError('Password saat ini tidak sesuai.');
        return;
      }
      if (!newPasswordInput || newPasswordInput.length < 6) {
        setProfileError('Password baru minimal harus terdiri dari 6 karakter.');
        return;
      }
      if (newPasswordInput !== confirmPasswordInput) {
        setProfileError('Konfirmasi password baru tidak cocok.');
        return;
      }

      if (oldEmailKey && oldEmailKey !== newEmailKey) {
        delete creds[oldEmailKey];
      }
      creds[newEmailKey] = {
        password: newPasswordInput,
        name: profileName.trim(),
        phone: profilePhone.trim() || '-',
      };
      writeGuestCredentials(creds);
    } else if (existingCred?.password) {
      if (oldEmailKey && oldEmailKey !== newEmailKey) {
        delete creds[oldEmailKey];
      }
      creds[newEmailKey] = {
        password: existingCred.password,
        name: profileName.trim(),
        phone: profilePhone.trim() || '-',
      };
      writeGuestCredentials(creds);
    }

    const updatedUser: VisitorUser = {
      id: currentUser?.id || `usr-${Date.now()}`,
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim() || '-',
      membershipTier: currentUser?.membershipTier || 'Chevilly Priority Guest',
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }

    setIsProfileModalOpen(false);
    setDeleteNotice(
      wantsPasswordChange
        ? `Profil & password tamu "${updatedUser.name}" berhasil diperbarui.`
        : `Profil tamu "${updatedUser.name}" berhasil diperbarui.`
    );
    setTimeout(() => setDeleteNotice(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#faf9f5] border border-[#dcd6c8] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2dcd0] flex items-center justify-between bg-[#f4f0e6]">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-[#967d58]" />
            <div>
              <div className="text-[10px] tracking-widest uppercase font-mono text-[#967d58]">
                Chevilly Resort and Camp · Portal Tamu
              </div>
              <h3 className="font-serif text-2xl text-[#182a24] font-medium">
                Daftar Reservasi Anda ({displayReservations.length})
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#52645c] hover:text-[#182a24] transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visitor Profile / Auth Banner */}
        {currentUser ? (
          <div className="bg-[#101b17] text-[#f7f5ef] px-6 py-3 border-b border-[#263e34] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#edd28d] font-serif font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{currentUser.name}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider bg-[#d4af37]/25 text-[#edd28d] border border-[#d4af37]/40">
                    {currentUser.membershipTier || 'Priority Guest'}
                  </span>
                </div>
                <div className="text-[11px] text-[#a1b2a9]">
                  {currentUser.email} {currentUser.phone && `· ${currentUser.phone}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenProfileModal}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#d4af37]/50 text-[11px] font-semibold text-[#fae7b3] transition-colors cursor-pointer"
                title="Edit Profil Tamu"
              >
                <UserCog className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Profile</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1 bg-black/40 hover:bg-black/70 border border-[#395045] hover:border-[#d4af37] text-[11px] text-[#edd28d] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar Akun</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#f0ebe0] px-6 py-2.5 border-b border-[#e2dcd0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#52645c]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#967d58]" />
              <span>Silakan login untuk melihat profil dan daftar reservasi Anda.</span>
            </div>
            <div className="flex items-center gap-3">
              {onOpenLogin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="font-semibold text-[#182a24] hover:text-[#967d58] underline cursor-pointer"
                >
                  Masuk / Cek Kode Booking →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Total Reservasi & Quick Actions Banner */}
        <div className="bg-gradient-to-r from-[#182a24] via-[#20362f] to-[#182a24] text-[#f7f5ef] px-6 py-4 border-b border-[#2d473b] shadow-inner">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-[#eed492]" />
              </div>
              <div>
                <div className="text-[10px] tracking-widest uppercase font-mono text-[#d4af37]">
                  Ringkasan Total Reservasi
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-bold text-white">
                    {formatPrice(totalAmountIdr, totalAmountUsd, currency)}
                  </span>
                  <span className="text-xs text-[#b8cbbe]">
                    ({displayReservations.length} Item Reservasi)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onNewReservation();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#d4af37]/60 text-[#fae7b3] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-[#ffd977]" />
                <span>+ Tambah Reservasi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs sm:text-sm text-[#2d3e37]">
          {deleteNotice && (
            <div className="mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{deleteNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteNotice(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
          {displayReservations.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f2eee3] border border-[#dcd6c8] flex items-center justify-center mx-auto text-[#967d58]">
                <Compass className="w-8 h-8 opacity-75" />
              </div>
              <div className="font-serif text-2xl text-[#182a24]">
                {currentUser ? 'Belum Ada Reservasi Aktif' : 'Daftar Reservasi Kosong'}
              </div>
              <p className="text-xs text-[#73837b] max-w-md mx-auto">
                {currentUser
                  ? 'Anda belum memiliki pesanan kamar chalet, villa, atau tiket wahana wisata Chevilly. Rencanakan liburan mewah atau kegiatan Anda sekarang.'
                  : 'Anda belum login ke akun tamu. Silakan masuk terlebih dahulu untuk melihat daftar reservasi dan mengelola profil Anda.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!currentUser && onOpenLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className="px-6 py-2.5 bg-[#182a24] text-[#fae7b3] hover:bg-[#284138] text-xs font-semibold uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-[#d4af37]" />
                    <span>Masuk / Login Tamu</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onClose();
                    onNewReservation();
                  }}
                  className="px-6 py-2.5 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] text-xs font-medium uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#eed492]" />
                  <span>+ Tambah Reservasi Sekarang</span>
                </button>
                <button
                  onClick={handleSendAllToWhatsApp}
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current text-white shrink-0" />
                  <span>Konsultasi BDE Defit via WA</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2dcd0]">
                <span className="text-[11px] uppercase tracking-wider text-[#73837b] font-semibold">
                  Daftar Reservasi ({displayReservations.length} Item)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNewReservation();
                  }}
                  className="text-[11px] text-[#967d58] hover:text-[#182a24] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Item</span>
                </button>
              </div>

              <div className="bg-white border border-[#dcd6c8] overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f4f0e6] border-b border-[#dcd6c8] text-[10px] uppercase tracking-wider font-mono text-[#52645c]">
                      <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Kode Booking</th>
                      <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Tamu</th>
                      <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Akomodasi / Paket</th>
                      <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Jadwal</th>
                      <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Total Biaya</th>
                      <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Status</th>
                      <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Bukti TF</th>
                      <th className="py-3 px-3.5 font-semibold text-right whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee8db]">
                    {displayReservations.map((res) => {
                      const normalizedStatus = normalizeReservationStatus(res.status);
                      return (
                        <tr
                          key={res.id}
                          className="hover:bg-[#faf8f3] transition-colors"
                        >
                          <td className="py-3 px-3.5 align-top whitespace-nowrap">
                            <div className="font-mono font-bold text-[#182a24]">
                              {res.bookingCode}
                            </div>
                            <div className="text-[10px] text-[#73837b] mt-0.5">
                              {res.paymentMethod || 'Transfer Bank'}
                            </div>
                          </td>

                          <td className="py-3 px-3.5 align-top">
                            <div className="font-semibold text-[#182a24] whitespace-nowrap">
                              {res.guestName}
                            </div>
                            <div className="text-[11px] text-[#73837b] whitespace-nowrap">
                              {res.guestPhone}
                            </div>
                          </td>

                          <td className="py-3 px-3.5 align-top min-w-[180px]">
                            <div className="font-serif text-sm font-medium text-[#182a24]">
                              {res.room ? res.room.name : res.tours?.[0]?.name || 'Paket Ekspedisi'}
                            </div>
                            {((res.tours && res.tours.length > 0 && res.room) ||
                              (res.selectedAddOns && res.selectedAddOns.length > 0)) && (
                              <div className="text-[11px] text-[#73837b] mt-0.5 space-y-0.5">
                                {res.room && res.tours && res.tours.length > 0 && (
                                  <div>+ {res.tours.length} Paket Wisata</div>
                                )}
                                {res.selectedAddOns && res.selectedAddOns.length > 0 && (
                                  <div>+ {res.selectedAddOns.length} Fasilitas Tambahan</div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3.5 align-top whitespace-nowrap">
                            {res.room ? (
                              <div>
                                <div className="text-[#182a24] font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#967d58] shrink-0" />
                                  <span>{formatDateIndonesian(res.room.checkIn)}</span>
                                </div>
                                <div className="text-[11px] text-[#63746c] mt-0.5">
                                  s/d {formatDateIndonesian(res.room.checkOut)} ({res.room.nights} Malam · {res.room.adults} Dewasa)
                                </div>
                              </div>
                            ) : (
                              <span className="text-[#63746c]">{res.createdAt}</span>
                            )}
                          </td>

                          <td className="py-3 px-3.5 align-top whitespace-nowrap">
                            <span className="font-mono font-bold text-[#182a24]">
                              {formatPrice(res.totalPriceIdr, res.totalPriceUsd, currency)}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 align-top whitespace-nowrap">
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 border ${getStatusBadgeClass(normalizedStatus)}`}>
                              {normalizedStatus}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 align-top whitespace-nowrap">
                            {res.paymentProofUrl ? (
                              <button
                                type="button"
                                onClick={() => setViewProofTarget(res)}
                                className="px-2.5 py-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 hover:border-emerald-600 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Lihat bukti transfer yang sudah diunggah"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Bukti TF</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenUploadProof(res)}
                                className="px-2.5 py-1 text-[#182a24] bg-[#f4ebd3] hover:bg-[#182a24] hover:text-[#fae7b3] border border-[#d4af37]/60 hover:border-[#182a24] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Upload bukti transfer pembayaran"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Upload Bukti TF</span>
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-3.5 align-top text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setInvoiceReservation(res)}
                                className="px-2.5 py-1 border border-[#d2cbbe] hover:border-[#b89562] bg-[#f8f5ee] hover:bg-[#eae4d5] text-[#182a24] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Cetak Invoice & Folio Tamu Resmi"
                              >
                                <Printer className="w-3 h-3 text-[#967d58]" />
                                <span>Invoice</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteItem(res)}
                                className="px-2.5 py-1 text-red-700 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Hapus reservasi ini dari database"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e2dcd0] bg-[#f4f0e6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onNewReservation();
              }}
              className="text-xs text-[#182a24] hover:text-[#967d58] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#967d58]" />
              <span>+ Buat Reservasi Tambahan</span>
            </button>
            <span className="text-[#c5beaf]">|</span>
            <div className="text-xs text-[#52645c]">
              Total: <span className="font-bold text-[#182a24] font-mono">{formatPrice(totalAmountIdr, totalAmountUsd, currency)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {displayReservations.length > 0 && (
              <button
                onClick={handleSendAllToWhatsApp}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-white shrink-0" />
                <span>Kirim ke WhatsApp</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] text-xs font-medium uppercase tracking-wider cursor-pointer shadow-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Official Tax Invoice & Guest Folio Modal */}
      <InvoiceModal
        isOpen={Boolean(invoiceReservation)}
        onClose={() => setInvoiceReservation(null)}
        reservation={invoiceReservation}
        currency={currency}
        autoPrint={true}
      />

      {/* In-App Delete Confirmation Modal */}
      {confirmDeleteItem && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setConfirmDeleteItem(null)}
        >
          <div
            className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-md shadow-2xl overflow-hidden text-[#182a24]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#d4af37]" />
                <span className="font-serif text-base font-semibold">Konfirmasi Hapus Reservasi</span>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteItem(null)}
                className="text-[#eed492] hover:text-white cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-sm font-semibold text-[#182a24]">
                Yakin akan menghapus data reservasi ini dari database?
              </p>
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#182a24]">{confirmDeleteItem.bookingCode}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 border ${getStatusBadgeClass(normalizeReservationStatus(confirmDeleteItem.status))}`}>
                    {normalizeReservationStatus(confirmDeleteItem.status)}
                  </span>
                </div>
                <div className="font-semibold text-[#182a24]">{confirmDeleteItem.guestName}</div>
                <div className="text-[#52645c]">
                  {confirmDeleteItem.room
                    ? confirmDeleteItem.room.name
                    : confirmDeleteItem.tours?.[0]?.name || 'Paket Reservasi'}
                </div>
                <div className="font-mono text-[#967d58] font-bold pt-1">
                  {formatPrice(confirmDeleteItem.totalPriceIdr, confirmDeleteItem.totalPriceUsd, currency)}
                </div>
              </div>
              <p className="text-[11px] text-[#73837b]">
                Tindakan ini akan menghapus data reservasi secara permanen dari database sistem.
              </p>
            </div>

            <div className="px-5 py-3 bg-[#f4f0e6] border-t border-[#e2dcd0] flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteItem(null)}
                className="px-4 py-2 bg-white hover:bg-stone-100 border border-[#d2cbbe] text-[#182a24] text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Upload Bukti Transfer */}
      {uploadProofTarget && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isUploadingProof && setUploadProofTarget(null)}
        >
          <div
            className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-lg shadow-2xl overflow-hidden text-[#182a24]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#d4af37]" />
                <div>
                  <div className="font-serif text-base font-semibold">Upload Bukti Transfer</div>
                  <div className="text-[10px] font-mono text-[#eed492]">
                    {uploadProofTarget.bookingCode} · {uploadProofTarget.guestName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={isUploadingProof}
                onClick={() => setUploadProofTarget(null)}
                className="text-[#eed492] hover:text-white cursor-pointer disabled:opacity-50"
                aria-label="Tutup Upload Bukti Transfer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUploadProof} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#f2eee3] border border-[#ded7cb] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-[#73837b]">Metode Pembayaran</div>
                  <div className="font-semibold text-[#182a24]">{uploadProofTarget.paymentMethod || 'Transfer Bank'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-[#73837b]">Total Tagihan</div>
                  <div className="font-mono font-bold text-[#182a24]">
                    {formatPrice(uploadProofTarget.totalPriceIdr, uploadProofTarget.totalPriceUsd, currency)}
                  </div>
                </div>
              </div>

              {uploadProofError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs">
                  {uploadProofError}
                </div>
              )}

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1.5">
                  Pilih Foto / Screenshot Bukti Transfer *
                </label>
                <label className="block border-2 border-dashed border-[#c9bfa9] hover:border-[#182a24] bg-white p-4 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofFileChange}
                    className="hidden"
                  />
                  {proofPreviewDataUrl ? (
                    <div className="space-y-2">
                      <img
                        src={proofPreviewDataUrl}
                        alt="Preview Bukti Transfer"
                        className="max-h-56 mx-auto object-contain border border-[#ded7cb]"
                      />
                      <div className="text-[11px] text-[#967d58] font-medium">
                        Klik area ini untuk mengganti file gambar
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 space-y-1.5 text-[#52645c]">
                      <ImageIcon className="w-8 h-8 mx-auto text-[#967d58]" />
                      <div className="font-semibold text-[#182a24]">
                        Klik untuk memilih foto struk / bukti transfer
                      </div>
                      <div className="text-[11px] text-[#73837b]">
                        Format JPG, PNG, WEBP (Maks. 10MB)
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                  Catatan / Nama Rekening Pengirim (Opsional)
                </label>
                <input
                  type="text"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="Contoh: Transfer BCA a.n. Budi Santoso"
                  className="w-full bg-white border border-[#ded7cb] px-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              <div className="pt-2 border-t border-[#e2dcd0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isUploadingProof}
                  onClick={() => setUploadProofTarget(null)}
                  className="px-4 py-2 bg-white hover:bg-stone-100 border border-[#d2cbbe] text-[#182a24] text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingProof || !proofPreviewDataUrl}
                  className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{isUploadingProof ? 'Mengunggah...' : 'Simpan Bukti Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup View Bukti Transfer */}
      {viewProofTarget && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setViewProofTarget(null)}
        >
          <div
            className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-xl shadow-2xl overflow-hidden text-[#182a24] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#d4af37]" />
                <div>
                  <div className="font-serif text-base font-semibold">Bukti Transfer Pembayaran</div>
                  <div className="text-[10px] font-mono text-[#eed492]">
                    {viewProofTarget.bookingCode} · {viewProofTarget.guestName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewProofTarget(null)}
                className="text-[#eed492] hover:text-white cursor-pointer"
                aria-label="Tutup Preview Bukti Transfer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-[#f2eee3] border border-[#ded7cb] grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] uppercase text-[#73837b]">Status Reservasi</div>
                  <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 border ${getStatusBadgeClass(normalizeReservationStatus(viewProofTarget.status))}`}>
                    {normalizeReservationStatus(viewProofTarget.status)}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#73837b]">Total Tagihan</div>
                  <div className="font-mono font-bold text-[#182a24] mt-0.5">
                    {formatPrice(viewProofTarget.totalPriceIdr, viewProofTarget.totalPriceUsd, currency)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#73837b]">Metode</div>
                  <div className="font-medium text-[#182a24] mt-0.5 truncate">
                    {viewProofTarget.paymentMethod || 'Transfer Bank'}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#ded7cb] p-3 flex items-center justify-center">
                <img
                  src={viewProofTarget.paymentProofUrl}
                  alt={`Bukti Transfer ${viewProofTarget.bookingCode}`}
                  className="max-h-[55vh] w-auto object-contain"
                />
              </div>

              {(viewProofTarget.paymentProofNote || viewProofTarget.paymentProofUploadedAt) && (
                <div className="p-3 bg-white border border-[#ded7cb] space-y-1">
                  {viewProofTarget.paymentProofNote && (
                    <div>
                      <span className="text-[#73837b]">Catatan Pengirim: </span>
                      <span className="font-medium text-[#182a24]">{viewProofTarget.paymentProofNote}</span>
                    </div>
                  )}
                  {viewProofTarget.paymentProofUploadedAt && (
                    <div className="text-[11px] text-[#73837b]">
                      Diunggah pada:{' '}
                      <span className="font-mono text-[#182a24]">
                        {new Date(viewProofTarget.paymentProofUploadedAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-[#f4f0e6] border-t border-[#e2dcd0] flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const target = viewProofTarget;
                  setViewProofTarget(null);
                  handleOpenUploadProof(target);
                }}
                className="px-3.5 py-2 bg-white hover:bg-[#f7efd8] border border-[#d4af37]/70 text-[#182a24] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#967d58]" />
                <span>Upload Ulang Bukti</span>
              </button>
              <button
                type="button"
                onClick={() => setViewProofTarget(null)}
                className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-xs font-semibold cursor-pointer shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Edit Profile Tamu */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#182a24]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40 shrink-0">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-[#d4af37]" />
                <div>
                  <div className="font-serif text-base font-semibold">Edit Profil Tamu</div>
                  <div className="text-[10px] font-mono text-[#eed492]">
                    {currentUser?.membershipTier || 'Chevilly Priority Guest'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-[#eed492] hover:text-white cursor-pointer"
                aria-label="Tutup Edit Profil Tamu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-xs overflow-y-auto">
              {profileError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs">
                  {profileError}
                </div>
              )}

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                  Nama Lengkap Tamu *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Contoh: Bpk. Raden Arya Bramantyo"
                  className="w-full bg-white border border-[#ded7cb] px-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-white border border-[#ded7cb] px-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                  Nomor WhatsApp / Telepon
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full bg-white border border-[#ded7cb] px-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Section Ganti Password */}
              <div className="pt-2 border-t border-[#e2dcd0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#354840]">
                    <Lock className="w-3.5 h-3.5 text-[#967d58]" />
                    <span>Keamanan & Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection((prev) => !prev);
                      setProfileError(null);
                      if (showPasswordSection) {
                        setCurrentPasswordInput('');
                        setNewPasswordInput('');
                        setConfirmPasswordInput('');
                      }
                    }}
                    className="text-[11px] font-semibold text-[#182a24] underline hover:text-[#967d58] cursor-pointer"
                  >
                    {showPasswordSection ? 'Batal Ganti Password' : 'Ganti Password'}
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="mt-3 p-3.5 bg-[#f4f0e6] border border-[#dcd6c8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#52645c]">
                        {hasStoredPassword
                          ? 'Masukkan password saat ini untuk verifikasi.'
                          : 'Buat password baru untuk login akun tamu Anda.'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPasswordValues((prev) => !prev)}
                        className="text-[10px] text-[#354840] hover:text-[#182a24] flex items-center gap-1 cursor-pointer"
                      >
                        {showPasswordValues ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Sembunyikan</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Lihat</span>
                          </>
                        )}
                      </button>
                    </div>

                    {hasStoredPassword && (
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                          Password Saat Ini *
                        </label>
                        <input
                          type={showPasswordValues ? 'text' : 'password'}
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          placeholder="Masukkan password saat ini"
                          className="w-full bg-white border border-[#ded7cb] px-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                        Password Baru (Min. 6 Karakter) *
                      </label>
                      <input
                        type={showPasswordValues ? 'text' : 'password'}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Masukkan password baru"
                        className="w-full bg-white border border-[#ded7cb] px-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-[#354840] block mb-1">
                        Konfirmasi Password Baru *
                      </label>
                      <input
                        type={showPasswordValues ? 'text' : 'password'}
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full bg-white border border-[#ded7cb] px-3 py-2 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#e2dcd0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-stone-100 border border-[#d2cbbe] text-[#182a24] text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
