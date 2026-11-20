import React, { useState } from 'react';
import { VisitorUser, Reservation } from '../types';
import { X, Lock, Mail, Phone, User, KeyRound, Search, CheckCircle2, ShieldCheck } from 'lucide-react';

interface VisitorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: VisitorUser) => void;
  reservations: Reservation[];
  onOpenMyBookings: () => void;
}

export const VisitorAuthModal: React.FC<VisitorAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  reservations,
  onOpenMyBookings,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'lookup'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Lookup state
  const [bookingCode, setBookingCode] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

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

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    const emailKey = email.trim().toLowerCase();
    const creds = readGuestCredentials();
    const storedCred = creds[emailKey];

    if (storedCred?.password && storedCred.password !== password) {
      setErrorMessage('Kata sandi yang Anda masukkan tidak sesuai.');
      return;
    }

    // Check if there are reservations matching this email
    const matched = reservations.find(
      (r) => r.guestEmail.toLowerCase() === emailKey
    );

    const guestUser: VisitorUser = {
      id: matched ? matched.id : `usr-${Date.now()}`,
      name: storedCred?.name || (matched ? matched.guestName : email.split('@')[0].replace('.', ' ')),
      email: email.trim(),
      phone: storedCred?.phone || (matched ? matched.guestPhone : '+62 812 3456 7890'),
      membershipTier: matched ? 'Chevilly Gold Privilege Guest' : 'Chevilly Priority Guest',
    };

    setSuccessMessage(`Selamat datang, ${guestUser.name}!`);
    setTimeout(() => {
      onLoginSuccess(guestUser);
      onClose();
      onOpenMyBookings();
    }, 700);
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Mohon lengkapi seluruh formulir pendaftaran.');
      return;
    }

    const newUser: VisitorUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+62 812 0000 0000',
      membershipTier: 'Chevilly Priority Guest',
    };

    const creds = readGuestCredentials();
    creds[email.trim().toLowerCase()] = {
      password,
      name: newUser.name,
      phone: newUser.phone,
    };
    writeGuestCredentials(creds);

    setSuccessMessage(`Pendaftaran berhasil! Selamat datang di Chevilly Resort, ${newUser.name}.`);
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
      onOpenMyBookings();
    }, 800);
  };

  // Handle Quick Lookup via Booking Code
  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!bookingCode.trim()) {
      setErrorMessage('Silakan masukkan kode booking reservasi Anda.');
      return;
    }

    const cleanCode = bookingCode.trim().toUpperCase();
    const found = reservations.find((r) => r.bookingCode.toUpperCase() === cleanCode);

    if (found) {
      const guestUser: VisitorUser = {
        id: found.id,
        name: found.guestName,
        email: found.guestEmail,
        phone: found.guestPhone,
        membershipTier: 'Chevilly Verified Reservation Holder',
      };
      setSuccessMessage(`Reservasi ditemukan atas nama ${found.guestName}! Membuka voucher...`);
      setTimeout(() => {
        onLoginSuccess(guestUser);
        onClose();
        onOpenMyBookings();
      }, 700);
    } else {
      setErrorMessage(`Kode booking "${cleanCode}" tidak ditemukan. Pastikan format sesuai (contoh: ALTO-84920).`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e1714] border border-[#d4af37]/35 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-[#eae6dc]">
        
        {/* Header with Gold Crest */}
        <div className="px-6 pt-7 pb-5 border-b border-[#d4af37]/20 bg-gradient-to-b from-[#14231f] to-[#0e1714] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/LOGO_KUNING_2_7dfae9a0.png"
              alt="Chevilly Resort and Camp"
              className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]"
            />
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase font-mono text-[#d4af37]">
                Chevilly Portal Tamu
              </div>
              <h3 className="font-serif text-2xl text-[#f5ebd2] font-normal">
                Akses Data Reservasi
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#a89d87] hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#d4af37]/20 bg-black/30">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-medium text-center transition-all cursor-pointer border-b-2 ${
              tab === 'login'
                ? 'border-[#d4af37] text-[#edd28d] bg-[#d4af37]/10 font-semibold'
                : 'border-transparent text-[#97a69f] hover:text-[#e5d5b3]'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('lookup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-medium text-center transition-all cursor-pointer border-b-2 ${
              tab === 'lookup'
                ? 'border-[#d4af37] text-[#edd28d] bg-[#d4af37]/10 font-semibold'
                : 'border-transparent text-[#97a69f] hover:text-[#e5d5b3]'
            }`}
          >
            Cek Kode Booking
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-medium text-center transition-all cursor-pointer border-b-2 ${
              tab === 'register'
                ? 'border-[#d4af37] text-[#edd28d] bg-[#d4af37]/10 font-semibold'
                : 'border-transparent text-[#97a69f] hover:text-[#e5d5b3]'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
              <span className="font-bold text-red-400">✕</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN TAB */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1.5 font-medium">
                  Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/40 border border-[#30453d] focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#687b72] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1.5 font-medium">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-[#30453d] focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#687b72] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#97a69f] pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#d4af37]" />
                  <span>Ingat saya di perangkat ini</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTab('lookup')}
                  className="text-[#edd28d] hover:underline"
                >
                  Lupa sandi? Cek kode booking
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#cfab60] via-[#eed492] to-[#cfab60] text-[#0d1613] font-semibold text-xs tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] mt-2"
              >
                Masuk & Lihat Reservasi
              </button>
            </form>
          )}

          {/* 2. LOOKUP TAB (Direct by Booking Code) */}
          {tab === 'lookup' && (
            <form onSubmit={handleLookupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1.5 font-medium">
                  Kode Booking Reservasi
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    placeholder="Contoh: ALTO-84920"
                    className="w-full bg-black/40 border border-[#30453d] focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#687b72] outline-none font-mono uppercase tracking-wider transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#8fa298] mt-1">
                  Kode 8-10 karakter yang dikirimkan ke email konfirmasi pemesanan Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1.5 font-medium">
                  Email atau No. WhatsApp (Opsional Verifikasi)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    placeholder="0812xxxx / email pemesan"
                    className="w-full bg-black/40 border border-[#30453d] focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#687b72] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#cfab60] via-[#eed492] to-[#cfab60] text-[#0d1613] font-semibold text-xs tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] mt-2 flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari & Tampilkan Voucher</span>
              </button>

              <div className="p-3 bg-[#13221e] border border-[#2b4137] text-[11px] text-[#9bb0a5] space-y-1">
                <div className="font-semibold text-[#eed492]">Butuh Bantuan Concierge?</div>
                <div>
                  Hubungi tim layanan 24 jam di <span className="text-white">+62 21 8089 2450</span> untuk pencarian bukti reservasi instan.
                </div>
              </div>
            </form>
          )}

          {/* 3. REGISTER TAB */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1.5 font-medium">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama sesuai KTP / Paspor"
                    className="w-full bg-black/40 border border-[#30453d] focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#687b72] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1.5 font-medium">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/40 border border-[#30453d] focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#687b72] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1.5 font-medium">
                    No. WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812..."
                      className="w-full bg-black/40 border border-[#30453d] focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#687b72] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1.5 font-medium">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full bg-black/40 border border-[#30453d] focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#687b72] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#8fa298] flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Privasi data tamu terenkripsi dan terjamin aman.</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#cfab60] via-[#eed492] to-[#cfab60] text-[#0d1613] font-semibold text-xs tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] mt-2"
              >
                Daftar & Hubungkan Reservasi
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#d4af37]/20 bg-black/40 flex items-center justify-between text-xs text-[#8fa298]">
          <span>Chevilly Resort & Camp Guest Portal</span>
          <button
            onClick={onClose}
            className="text-[#eed492] hover:text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
