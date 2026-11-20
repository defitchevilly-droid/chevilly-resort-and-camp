import React, { useState, useEffect } from 'react';
import { RoomSuite, TourExperience, Currency, Reservation, VisitorUser, BookingAddOn, RoomCategoryItem } from '../types';
import { ROOM_SUITES, TOUR_EXPERIENCES, BOOKING_ADDONS, ACCOMMODATION_DROPDOWN_ITEMS } from '../data/resortData';
import { formatPrice, formatDateIndonesian } from '../utils/formatters';
import { fetchAddOns } from '../services/api';
import { X, Calendar, Users, Check, ArrowRight, ShieldCheck, Printer, BookmarkCheck } from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { WhatsAppIcon } from './WhatsAppFloatingWidget';

type PriceTierKey = 'sun_thurs' | 'friday' | 'saturday';

const parseYmdLocal = (ymd: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((ymd || '').trim());
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
};

const toYmdLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDaysYmd = (ymd: string, days: number): string => {
  const d = parseYmdLocal(ymd);
  if (!d) return ymd;
  d.setDate(d.getDate() + days);
  return toYmdLocal(d);
};

const calculateStayNights = (checkIn: string, checkOut: string): number => {
  const inDate = parseYmdLocal(checkIn);
  const outDate = parseYmdLocal(checkOut);
  if (!inDate || !outDate) return 1;
  const diffDays = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

const getNightTier = (date: Date): PriceTierKey => {
  const day = date.getDay(); // 0 = Sun ... 4 = Thu, 5 = Fri, 6 = Sat
  if (day === 5) return 'friday';
  if (day === 6) return 'saturday';
  return 'sun_thurs';
};

const calculateRoomStayPricing = (
  room: RoomSuite,
  checkIn: string,
  checkOut: string,
  categoryFallback?: Partial<RoomCategoryItem>
) => {
  const sunThursIdr = room.priceSunThursIdr || categoryFallback?.priceSunThursIdr || room.priceIdr;
  const sunThursUsd = room.priceSunThursUsd || categoryFallback?.priceSunThursUsd || room.priceUsd;

  const fridayIdr = room.priceFridayIdr || categoryFallback?.priceFridayIdr || Math.round(sunThursIdr * 1.25);
  const fridayUsd = room.priceFridayUsd || categoryFallback?.priceFridayUsd || Math.round(sunThursUsd * 1.25);

  const saturdayIdr = room.priceSaturdayIdr || categoryFallback?.priceSaturdayIdr || Math.round(sunThursIdr * 1.55);
  const saturdayUsd = room.priceSaturdayUsd || categoryFallback?.priceSaturdayUsd || Math.round(sunThursUsd * 1.55);

  const tierRates: Record<PriceTierKey, { idr: number; usd: number; label: string; shortLabel: string }> = {
    sun_thurs: { idr: sunThursIdr, usd: sunThursUsd, label: 'Sun - Thurs', shortLabel: 'Sun-Thurs' },
    friday: { idr: fridayIdr, usd: fridayUsd, label: 'Friday', shortLabel: 'Friday' },
    saturday: { idr: saturdayIdr, usd: saturdayUsd, label: 'Saturday (Peak)', shortLabel: 'Saturday' },
  };

  const nights = calculateStayNights(checkIn, checkOut);
  const startDate = parseYmdLocal(checkIn) || new Date();
  const counts: Record<PriceTierKey, number> = { sun_thurs: 0, friday: 0, saturday: 0 };

  let totalIdr = 0;
  let totalUsd = 0;

  for (let i = 0; i < nights; i++) {
    const nightDate = new Date(startDate.getTime());
    nightDate.setDate(startDate.getDate() + i);
    const tier = getNightTier(nightDate);
    counts[tier] += 1;
    totalIdr += tierRates[tier].idr;
    totalUsd += tierRates[tier].usd;
  }

  const activeTiers = (['sun_thurs', 'friday', 'saturday'] as PriceTierKey[]).filter(
    (k) => counts[k] > 0
  );
  const isSingleTier = activeTiers.length === 1;
  const primaryTier: PriceTierKey = activeTiers[0] || 'sun_thurs';

  const tierSummary = isSingleTier
    ? tierRates[primaryTier].label
    : activeTiers.map((k) => `${counts[k]}× ${tierRates[k].shortLabel}`).join(' · ');

  return {
    nights,
    totalIdr,
    totalUsd,
    avgPerNightIdr: Math.round(totalIdr / nights),
    avgPerNightUsd: Math.round(totalUsd / nights),
    isSingleTier,
    primaryTier,
    singleTierLabel: tierRates[primaryTier].label,
    tierSummary,
    counts,
    tierRates,
  };
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  rooms?: RoomSuite[];
  categories?: RoomCategoryItem[];
  tours?: TourExperience[];
  addOns?: BookingAddOn[];
  initialRoom?: RoomSuite | null;
  initialTour?: TourExperience | null;
  onConfirmReservation: (reservation: Reservation) => void | Promise<void>;
  currentUser?: VisitorUser | null;
  onDispatchEmail?: (email: string, code: string, guestName: string, reservation: Reservation) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  currency,
  rooms,
  categories,
  tours,
  addOns: dbAddOns,
  initialRoom,
  initialTour,
  onConfirmReservation,
  currentUser,
  onDispatchEmail,
}) => {
  const activeRooms = rooms && rooms.length > 0 ? rooms : ROOM_SUITES;
  const activeTours = tours && tours.length > 0 ? tours : TOUR_EXPERIENCES;
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedRoomCategory, setSelectedRoomCategory] = useState<string>('all');
  const [publishedCategories, setPublishedCategories] = useState<Array<{
    id: string;
    label: string;
    priceSunThursIdr?: number;
    priceFridayIdr?: number;
    priceSaturdayIdr?: number;
    priceSunThursUsd?: number;
    priceFridayUsd?: number;
    priceSaturdayUsd?: number;
  }>>(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((c) => ({
        id: c.id,
        label: c.label || c.name || c.id,
        priceSunThursIdr: c.priceSunThursIdr,
        priceFridayIdr: c.priceFridayIdr,
        priceSaturdayIdr: c.priceSaturdayIdr,
        priceSunThursUsd: c.priceSunThursUsd,
        priceFridayUsd: c.priceFridayUsd,
        priceSaturdayUsd: c.priceSaturdayUsd,
      }));
    }
    return ACCOMMODATION_DROPDOWN_ITEMS.map((item) => ({ id: item.id, label: item.label }));
  });

  useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      setPublishedCategories(
        categories.map((c) => ({
          id: c.id,
          label: c.label || c.name || c.id,
          priceSunThursIdr: c.priceSunThursIdr,
          priceFridayIdr: c.priceFridayIdr,
          priceSaturdayIdr: c.priceSaturdayIdr,
          priceSunThursUsd: c.priceSunThursUsd,
          priceFridayUsd: c.priceFridayUsd,
          priceSaturdayUsd: c.priceSaturdayUsd,
        }))
      );
    }
  }, [categories]);

  // Fasilitas & Layanan Tambahan Puncak Pegunungan (strictly from backend DB, no localStorage cache)
  const [addOnsList, setAddOnsList] = useState<BookingAddOn[]>(() =>
    Array.isArray(dbAddOns) && dbAddOns.length > 0 ? dbAddOns : BOOKING_ADDONS
  );

  useEffect(() => {
    if (Array.isArray(dbAddOns) && dbAddOns.length > 0) {
      setAddOnsList(dbAddOns);
    }
  }, [dbAddOns]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const loadRemoteAddOns = async () => {
      const remote = await fetchAddOns();
      if (active && Array.isArray(remote)) {
        setAddOnsList(remote);
      }
    };
    loadRemoteAddOns();
    return () => {
      active = false;
    };
  }, [isOpen]);

  // Selected Room
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialRoom ? initialRoom.id : activeRooms[0].id
  );

  // Selected Tours (array of IDs)
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>(
    initialTour ? [initialTour.id] : []
  );

  // Dates
  const today = new Date();
  const defIn = new Date(today);
  defIn.setDate(today.getDate() + 5);
  const defOut = new Date(today);
  defOut.setDate(today.getDate() + 7);

  const [checkIn, setCheckIn] = useState(toYmdLocal(defIn));
  const [checkOut, setCheckOut] = useState(toYmdLocal(defOut));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const handleCheckInChange = (nextCheckIn: string) => {
    setCheckIn(nextCheckIn);
    if (!nextCheckIn) return;
    if (!checkOut || nextCheckIn >= checkOut) {
      setCheckOut(addDaysYmd(nextCheckIn, 1));
    }
  };

  const handleCheckOutChange = (nextCheckOut: string) => {
    if (checkIn && nextCheckOut && nextCheckOut <= checkIn) {
      setCheckOut(addDaysYmd(checkIn, 1));
      return;
    }
    setCheckOut(nextCheckOut);
  };

  // Selected Add-ons
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  // Guest Information (prefilled if currentUser is logged in)
  const [guestName, setGuestName] = useState(currentUser ? currentUser.name : '');
  const [guestEmail, setGuestEmail] = useState(currentUser ? currentUser.email : '');
  const [guestPhone, setGuestPhone] = useState(currentUser ? currentUser.phone : '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank BCA');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (currentUser && !guestName) {
      setGuestName(currentUser.name);
      setGuestEmail(currentUser.email);
      setGuestPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Generated confirmation
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmedReservation(null);
      setIsInvoiceOpen(false);
      setFormErrors({});
      setSpecialRequests('');
      setSelectedAddOnIds([]);
      setSelectedRoomCategory('all');
      setSelectedRoomId(initialRoom ? initialRoom.id : activeRooms[0]?.id || '');
      setSelectedTourIds(initialTour ? [initialTour.id] : []);
      if (currentUser) {
        setGuestName(currentUser.name);
        setGuestEmail(currentUser.email);
        setGuestPhone(currentUser.phone);
      }
    }
  }, [isOpen, initialRoom, initialTour]);

  if (!isOpen) return null;

  const categoryTabs = [
    { id: 'all', label: 'Semua' },
    ...publishedCategories.filter(
      (cat) => !['chalet', 'suite'].includes(cat.id.toLowerCase())
    ),
  ];

  const getCategoryFallback = (room: RoomSuite) => {
    const catKey = (room.category || room.id || '').trim().toLowerCase();
    return publishedCategories.find(
      (c) => c.id.toLowerCase() === catKey || c.id.toLowerCase() === room.id.toLowerCase()
    );
  };

  const getCategoryLabel = (catString?: string): string => {
    if (!catString) return 'Akomodasi';
    const clean = catString.trim().toLowerCase();
    const matched = categoryTabs.find(
      (c) => c.id !== 'all' && (c.id.toLowerCase() === clean || c.label.toLowerCase() === clean)
    );
    if (matched) return matched.label;
    return catString
      .split(/[-_ ]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const filteredRooms = activeRooms.filter((room) => {
    if (selectedRoomCategory === 'all') return true;
    const target = selectedRoomCategory.toLowerCase();
    return (
      (room.category || '').toLowerCase() === target ||
      room.id.toLowerCase() === target
    );
  });

  const currentRoom = activeRooms.find((r) => r.id === selectedRoomId);
  const currentTours = activeTours.filter((t) => selectedTourIds.includes(t.id));
  const nights = calculateStayNights(checkIn, checkOut);

  const currentRoomPricing = currentRoom
    ? calculateRoomStayPricing(currentRoom, checkIn, checkOut, getCategoryFallback(currentRoom))
    : null;

  // Calculate pricing dynamically from 3-tier stay dates (Sun-Thurs / Friday / Saturday)
  const roomTotalIdr = currentRoomPricing ? currentRoomPricing.totalIdr : 0;
  const roomTotalUsd = currentRoomPricing ? currentRoomPricing.totalUsd : 0;

  const tourTotalIdr = currentTours.reduce(
    (sum, tour) => sum + tour.priceIdr * (adults + children),
    0
  );
  const tourTotalUsd = currentTours.reduce(
    (sum, tour) => sum + tour.priceUsd * (adults + children),
    0
  );

  const activeAddOns = addOnsList.filter((a) => a.isActive !== false);
  const selectedAddOns = activeAddOns.filter((a) => selectedAddOnIds.includes(a.id));
  const addOnsTotalIdr = selectedAddOns.reduce((sum, a) => sum + a.priceIdr, 0);
  const addOnsTotalUsd = selectedAddOns.reduce((sum, a) => sum + a.priceUsd, 0);

  const subtotalIdr = roomTotalIdr + tourTotalIdr + addOnsTotalIdr;
  const subtotalUsd = roomTotalUsd + tourTotalUsd + addOnsTotalUsd;

  const grandTotalIdr = subtotalIdr;
  const grandTotalUsd = subtotalUsd;

  const toggleTour = (tourId: string) => {
    setSelectedTourIds((prev) =>
      prev.includes(tourId) ? prev.filter((id) => id !== tourId) : [...prev, tourId]
    );
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  const validateStep3 = () => {
    const errors: { [key: string]: string } = {};
    if (!guestName.trim()) errors.name = 'Nama lengkap wajib diisi';
    if (!guestEmail.trim() || !guestEmail.includes('@')) errors.email = 'Alamat email valid wajib diisi';
    if (!guestPhone.trim() || guestPhone.length < 8) errors.phone = 'Nomor WhatsApp / telepon wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 3) {
      if (!validateStep3()) return;
    }
    if (step === 4) {
      // Process confirmation
      const randomCode = 'CHV-' + Math.floor(10000 + Math.random() * 90000);
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      const newReservation: Reservation = {
        id: `res-${Date.now()}-${uniqueSuffix}`,
        bookingCode: randomCode,
        createdAt: new Date().toISOString().split('T')[0],
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        room: currentRoom
          ? {
              id: currentRoom.id,
              name: currentRoom.name,
              pricePerNight: currentRoomPricing ? currentRoomPricing.avgPerNightIdr : currentRoom.priceIdr,
              nights,
              checkIn,
              checkOut,
              adults,
              children,
            }
          : undefined,
        tours: currentTours.map((t) => ({
          id: t.id,
          name: t.name,
          pricePerPerson: t.priceIdr,
          date: checkIn,
          timeSlot: t.departureTimes[0],
          participants: adults + children,
        })),
        selectedAddOns: selectedAddOns.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.priceIdr,
          quantity: 1,
        })),
        totalPriceIdr: grandTotalIdr,
        totalPriceUsd: grandTotalUsd,
        currency,
        status: 'Konfirmasi',
        paymentMethod,
      };

      setConfirmedReservation(newReservation);
      onConfirmReservation(newReservation);
      setStep(5);
      return;
    }

    setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleFinish = () => {
    if (confirmedReservation && onDispatchEmail) {
      onDispatchEmail(
        confirmedReservation.guestEmail,
        confirmedReservation.bookingCode,
        confirmedReservation.guestName,
        confirmedReservation
      );
    }
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendFormToWhatsApp = () => {
    let msg = `*FORMULIR RESERVASI CALON TAMU BARU*\n`;
    msg += `*CHEVILLY RESORT AND CAMP*\n`;
    msg += `─────────────────────────\n`;
    msg += `👤 *Data Calon Tamu:*\n`;
    msg += `• Nama: ${guestName.trim() || '(Nama belum diisi)'}\n`;
    msg += `• WhatsApp/HP: ${guestPhone.trim() || '(Nomor belum diisi)'}\n`;
    msg += `• Email: ${guestEmail.trim() || '(Email belum diisi)'}\n\n`;

    msg += `🏡 *Pilihan Akomodasi:*\n`;
    if (currentRoom) {
      msg += `• Kamar/Villa: ${currentRoom.name}\n`;
    }
    msg += `• Periode: ${formatDateIndonesian(checkIn)} s/d ${formatDateIndonesian(checkOut)} (${nights} Malam)\n`;
    msg += `• Jumlah Tamu: ${adults} Dewasa${children > 0 ? `, ${children} Anak` : ''}\n\n`;

    if (currentTours.length > 0) {
      msg += `🌲 *Wisata & Petualangan Dipilih:*\n`;
      currentTours.forEach((t) => {
        msg += `• ${t.name}\n`;
      });
      msg += `\n`;
    }

    if (selectedAddOns.length > 0) {
      msg += `✨ *Fasilitas Tambahan:*\n`;
      selectedAddOns.forEach((a) => {
        msg += `• ${a.name}\n`;
      });
      msg += `\n`;
    }

    if (specialRequests.trim()) {
      msg += `📝 *Permintaan Khusus:*\n"${specialRequests.trim()}"\n\n`;
    }

    msg += `💰 *Estimasi Total:* ${formatPrice(grandTotalIdr, grandTotalUsd, currency)}\n`;
    msg += `─────────────────────────\n`;
    msg += `Halo BDE DEFIT (Chevilly Resort), saya calon customer baru yang telah mengisi formulir ini. Mohon info ketersediaan kamar dan panduan booking selanjutnya. Terima kasih! 🙏`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=6285934544901&text=${encoded}`, '_blank');
  };

  const handleSendConfirmedToWhatsApp = () => {
    if (!confirmedReservation) return;
    let msg = `*KONFIRMASI VOUCHER RESERVASI RESMI*\n`;
    msg += `*CHEVILLY RESORT AND CAMP (BDE : DEFIT)*\n`;
    msg += `─────────────────────────\n`;
    msg += `🏷️ *Kode Booking:* ${confirmedReservation.bookingCode}\n`;
    msg += `👤 *Nama Tamu:* ${confirmedReservation.guestName}\n`;
    msg += `📱 *WhatsApp/HP:* ${confirmedReservation.guestPhone}\n`;
    msg += `✉️ *Email:* ${confirmedReservation.guestEmail}\n\n`;

    if (confirmedReservation.room) {
      msg += `🏡 *Akomodasi:* ${confirmedReservation.room.name}\n`;
      msg += `📅 *Check-In:* ${formatDateIndonesian(checkIn)}\n`;
      msg += `📅 *Check-Out:* ${formatDateIndonesian(checkOut)} (${nights} Malam)\n`;
    }

    msg += `💰 *Total Biaya:* ${formatPrice(confirmedReservation.totalPriceIdr, confirmedReservation.totalPriceUsd, confirmedReservation.currency)}\n`;
    msg += `💳 *Metode Pembayaran:* ${confirmedReservation.paymentMethod}\n`;
    msg += `─────────────────────────\n`;
    msg += `Halo BDE DEFIT (Chevilly Resort), ini bukti konfirmasi reservasi saya dengan kode *${confirmedReservation.bookingCode}*. Mohon konfirmasi dan panduan check-in. Terima kasih! 🙏`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=6285934544901&text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#faf9f5] border border-[#dcd6c8] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#e2dcd0] flex items-center justify-between bg-[#f4f0e6]">
          <div>
            <div className="text-[10px] tracking-widest uppercase font-mono text-[#967d58]">
              Chevilly Resort and Camp · Sistem Reservasi Puncak
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#182a24] font-medium">
              {step === 5 ? 'Voucher Reservasi Resmi' : 'Reservasi Penginapan & Wisata'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#52645c] hover:text-[#182a24] transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Unboxed, clean editorial style) */}
        {step < 5 && (
          <div className="px-6 py-3 border-b border-[#e7e2d6] bg-[#fbfaf7] flex items-center justify-between text-xs text-[#73837b] overflow-x-auto">
            <span className={step === 1 ? 'font-semibold text-[#182a24]' : ''}>
              1. Pilihan Kamar & Tur
            </span>
            <span aria-hidden="true">→</span>
            <span className={step === 2 ? 'font-semibold text-[#182a24]' : ''}>
              2. Layanan Tambahan
            </span>
            <span aria-hidden="true">→</span>
            <span className={step === 3 ? 'font-semibold text-[#182a24]' : ''}>
              3. Data Tamu
            </span>
            <span aria-hidden="true">→</span>
            <span className={step === 4 ? 'font-semibold text-[#182a24]' : ''}>
              4. Konfirmasi Pembayaran
            </span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs sm:text-sm text-[#2d3e37]">
          {/* STEP 1: Room & Tour Selection */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Dates & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f3efe6] p-4 border border-[#e2dcd0]">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#63746c] font-medium flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#967d58]" />
                    <span>Check-in</span>
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className="w-full bg-[#faf9f5] border border-[#d4cdc0] px-3 py-2 text-xs font-mono text-[#182a24]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#63746c] font-medium flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#967d58]" />
                    <span>Check-out</span>
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn ? addDaysYmd(checkIn, 1) : undefined}
                    onChange={(e) => handleCheckOutChange(e.target.value)}
                    className="w-full bg-[#faf9f5] border border-[#d4cdc0] px-3 py-2 text-xs font-mono text-[#182a24]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#63746c] font-medium flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#967d58]" />
                    <span>Tamu ({nights} Malam)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="px-2 py-1.5 bg-[#faf9f5] border border-[#d4cdc0] text-xs font-medium cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-medium px-2">{adults} Dewasa</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="px-2 py-1.5 bg-[#faf9f5] border border-[#d4cdc0] text-xs font-medium cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div>
                <div className="mb-3 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#182a24]">
                      Pilih Akomodasi Berdasarkan Kategori Terpublikasi
                    </span>
                    <span className="text-[11px] font-mono text-[#73837b]">
                      {filteredRooms.length} Unit Tersedia
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-[#ece7dc] border border-[#d8d2c4]">
                    {categoryTabs.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedRoomCategory(cat.id)}
                        className={`px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                          selectedRoomCategory.toLowerCase() === cat.id.toLowerCase()
                            ? 'bg-[#182a24] text-[#f7f5ef] shadow-xs font-semibold'
                            : 'text-[#4e5e57] hover:text-[#182a24] hover:bg-[#e2dcd0]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredRooms.length === 0 ? (
                  <div className="p-6 bg-[#f7f4ec] border border-dashed border-[#d4cdc0] text-center space-y-2">
                    <div className="text-xs text-[#52645c]">
                      Belum ada unit akomodasi pada kategori <strong>{getCategoryLabel(selectedRoomCategory)}</strong>.
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRoomCategory('all')}
                      className="px-3.5 py-1.5 bg-[#182a24] text-[#f7f5ef] text-[11px] font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      Tampilkan Semua Kategori
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredRooms.map((room) => {
                      const stayPricing = calculateRoomStayPricing(
                        room,
                        checkIn,
                        checkOut,
                        getCategoryFallback(room)
                      );
                      const tierBadgeClass = !stayPricing.isSingleTier
                        ? 'bg-[#efe9da] text-[#5c4a2d] border-[#d4af37]/50'
                        : stayPricing.primaryTier === 'saturday'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : stayPricing.primaryTier === 'friday'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-[#f3f0e8] text-[#495c53] border-[#d8d2c4]';

                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoomId(room.id)}
                          className={`p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                            selectedRoomId === room.id
                              ? 'border-[#182a24] bg-[#f2eee3] shadow-sm'
                              : 'border-[#ded7cb] bg-[#faf9f5] hover:border-[#b89562]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#967d58]">
                                  {getCategoryLabel(room.category)}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-mono ${
                                    room.isAvailable !== false ? 'text-emerald-700' : 'text-rose-600'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      room.isAvailable !== false ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  />
                                  {room.isAvailable !== false ? 'Available' : 'Tidak Available'}
                                </span>
                              </div>
                              <div className="font-serif text-base font-medium text-[#182a24]">
                                {room.name}
                              </div>
                              <div className="text-[11px] text-[#73837b]">{room.area} · {room.capacity}</div>
                            </div>
                            {selectedRoomId === room.id && (
                              <span className="p-1 bg-[#182a24] text-white rounded-full shrink-0">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div className="pt-2 border-t border-[#e5dfd3] space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${tierBadgeClass}`}>
                                {stayPricing.tierSummary}
                              </span>
                              <span className="font-mono font-semibold text-xs text-[#182a24]">
                                {formatPrice(stayPricing.avgPerNightIdr, stayPricing.avgPerNightUsd, currency)}
                                <span className="text-[10px] font-normal text-[#73837b]"> / mlm</span>
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between text-[11px]">
                              <span className="text-[#73837b]">
                                Total {stayPricing.nights} Malam:
                              </span>
                              <span className="font-mono font-bold text-[#182a24]">
                                {formatPrice(stayPricing.totalIdr, stayPricing.totalUsd, currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tour Experience Add-on */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#182a24] mb-3">
                  Tambahkan Paket Wisata & Ekspedisi (Opsional)
                </div>
                <div className="space-y-2">
                  {activeTours.map((tour) => {
                    const isChecked = selectedTourIds.includes(tour.id);
                    return (
                      <div
                        key={tour.id}
                        onClick={() => toggleTour(tour.id)}
                        className={`p-3 border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                          isChecked
                            ? 'border-[#182a24] bg-[#f2eee3]'
                            : 'border-[#ded7cb] bg-[#faf9f5] hover:border-[#b89562]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent onClick
                            className="w-4 h-4 text-[#182a24] cursor-pointer"
                          />
                          <div>
                            <div className="font-serif text-sm font-medium text-[#182a24]">
                              {tour.name}
                            </div>
                            <div className="text-[11px] text-[#73837b]">
                              {tour.duration} · {tour.difficulty} · {tour.altitude}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-medium text-xs text-[#182a24]">
                            {formatPrice(tour.priceIdr, tour.priceUsd, currency)}
                          </div>
                          <div className="text-[10px] text-[#73837b]">/ orang</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Luxury Add-ons */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#182a24] mb-2">
                Fasilitas & Layanan Tambahan Puncak Pegunungan
              </div>
              <p className="text-xs text-[#63746c] mb-4">
                Sempurnakan liburan Anda dengan layanan logistik helikopter, sambutan sampanye dingin di perapian kamar,
                atau perlengkapan penjelajah pegunungan eksklusif.
              </p>

              <div className="space-y-3">
                {activeAddOns.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[#ded7cb] bg-[#faf9f5] text-xs text-[#63746c]">
                    Saat ini belum ada fasilitas atau layanan tambahan yang tersedia. Anda dapat langsung melanjutkan ke tahap berikutnya.
                  </div>
                ) : (
                  activeAddOns.map((addon) => {
                    const isChecked = selectedAddOnIds.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`p-4 border transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isChecked
                            ? 'border-[#182a24] bg-[#f2eee3]'
                            : 'border-[#ded7cb] bg-[#faf9f5] hover:border-[#b89562]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 text-[#182a24] mt-0.5 cursor-pointer"
                          />
                          <div>
                            {addon.showName !== false && (
                              <div className="font-serif text-base font-medium text-[#182a24]">
                                {addon.name}
                              </div>
                            )}
                            {addon.showDescription !== false && (
                              <p className="text-xs text-[#52645c] mt-0.5">{addon.description}</p>
                            )}
                            {addon.showUnit !== false && (
                              <span className="text-[10px] text-[#967d58] font-mono">{addon.unit}</span>
                            )}
                          </div>
                        </div>

                        {addon.showPrice !== false && (
                          <div className="font-mono font-semibold text-sm text-[#182a24] self-end sm:self-center shrink-0">
                            {formatPrice(addon.priceIdr, addon.priceUsd, currency)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Guest Data */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#182a24]">
                Informasi Tamu & Preferensi Kedatangan
              </div>
              <p className="text-xs text-[#63746c]">
                Tim butler dan concierge kami akan menghubungi Anda sebelum kedatangan untuk mengatur preferensi temperatur kamar, perapian kayu, dan logistik penjemputan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-[#52645c] block mb-1">
                    Nama Lengkap Tamu Utama *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Raden Arya Bramantyo"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#f4f1e8] border border-[#d8d0c0] px-3.5 py-2.5 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                    required
                  />
                  {formErrors.name && (
                    <span className="text-[11px] text-red-600 mt-0.5 block">{formErrors.name}</span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-[#52645c] block mb-1">
                    Alamat Email (Untuk Pengiriman E-Voucher) *
                  </label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-[#f4f1e8] border border-[#d8d0c0] px-3.5 py-2.5 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                    required
                  />
                  {formErrors.email && (
                    <span className="text-[11px] text-red-600 mt-0.5 block">{formErrors.email}</span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-[#52645c] block mb-1">
                    Nomor WhatsApp / Seluler Aktif *
                  </label>
                  <input
                    type="tel"
                    placeholder="+62 811 2345 6789"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-[#f4f1e8] border border-[#d8d0c0] px-3.5 py-2.5 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                    required
                  />
                  {formErrors.phone && (
                    <span className="text-[11px] text-red-600 mt-0.5 block">{formErrors.phone}</span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-[#52645c] block mb-1">
                    Estimasi Jam Kedatangan
                  </label>
                  <select className="w-full bg-[#f4f1e8] border border-[#d8d0c0] px-3.5 py-2.5 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]">
                    <option value="15:00">15:00 WIB (Waktu Check-In Standar)</option>
                    <option value="17:00">17:00 WIB (Senja Menjelang Sunset)</option>
                    <option value="19:00">19:00 WIB (Malam Hari / Late Check-In)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-medium text-[#52645c] block mb-1">
                  Permintaan Khusus / Alergi Makanan
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Mohon sediakan kayu bakar tambahan untuk perapian, bantal bulu angsa non-alergenik, dan preferensi makanan vegan."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-[#f4f1e8] border border-[#d8d0c0] px-3.5 py-2.5 text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Direct WhatsApp Action for New Customer */}
              <div className="p-3.5 bg-[#f0faf3] border-2 border-[#25D366]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <WhatsAppIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#182a24]">
                      Kirim Isian Formulir Calon Tamu ke WhatsApp
                    </div>
                    <div className="text-[11px] text-[#4d6a5c]">
                      Otomatis merangkum nama, tanggal, kamar & rincian pesanan ke chat WhatsApp resmi.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendFormToWhatsApp}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0 rounded-sm"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Payment Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#182a24]">
                Rincian Pesanan & Pembayaran
              </div>

              {/* Order breakdown */}
              <div className="bg-[#f4f0e6] p-4 sm:p-5 border border-[#e2dcd0] space-y-3">
                {currentRoom && (
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2dcd0]">
                    <div>
                      <div className="font-serif text-base font-medium text-[#182a24]">
                        {currentRoom.name}
                      </div>
                      <div className="text-xs text-[#73837b]">
                        {nights} Malam ({formatDateIndonesian(checkIn)} - {formatDateIndonesian(checkOut)}) · {adults} Dewasa
                        {currentRoomPricing ? ` · ${currentRoomPricing.tierSummary}` : ''}
                      </div>
                    </div>
                    <div className="font-mono font-medium text-[#182a24]">
                      {formatPrice(roomTotalIdr, roomTotalUsd, currency)}
                    </div>
                  </div>
                )}

                {currentTours.map((t) => (
                  <div key={t.id} className="flex items-center justify-between pb-3 border-b border-[#e2dcd0]">
                    <div>
                      <div className="font-serif text-sm font-medium text-[#182a24]">{t.name}</div>
                      <div className="text-xs text-[#73837b]">
                        {adults + children} Peserta · {t.duration}
                      </div>
                    </div>
                    <div className="font-mono font-medium text-[#182a24]">
                      {formatPrice(
                        t.priceIdr * (adults + children),
                        t.priceUsd * (adults + children),
                        currency
                      )}
                    </div>
                  </div>
                ))}

                {selectedAddOns.map((a) => (
                  <div key={a.id} className="flex items-center justify-between pb-3 border-b border-[#e2dcd0]">
                    <div>
                      <div className="text-xs font-medium text-[#182a24]">{a.name}</div>
                      <div className="text-[11px] text-[#73837b]">{a.unit}</div>
                    </div>
                    <div className="font-mono font-medium text-[#182a24]">
                      {formatPrice(a.priceIdr, a.priceUsd, currency)}
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-[#d8d2c4] flex justify-between items-baseline">
                  <span className="font-serif text-lg font-medium text-[#182a24]">Total Pembayaran</span>
                  <span className="font-mono text-2xl font-bold text-[#182a24]">
                    {formatPrice(grandTotalIdr, grandTotalUsd, currency)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-[11px] uppercase tracking-wider font-medium text-[#52645c] block mb-2">
                  Pilih Saluran Pembayaran Aman
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Transfer Bank BCA', 'TF Bank Mandiri', 'Kartu Kredit (Visa/Mastercard)'].map((method) => (
                    <label
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 border flex items-center gap-2.5 cursor-pointer text-xs ${
                        paymentMethod === method
                          ? 'border-[#182a24] bg-[#f2eee3] font-medium text-[#182a24]'
                          : 'border-[#ded7cb] bg-[#faf9f5] text-[#52645c]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === method}
                        onChange={() => {}}
                        className="text-[#182a24]"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#eef3ee] border border-[#d2ded2] text-xs text-[#2b4d3a] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2b4d3a] shrink-0" />
                <span>
                  Garansi Reservasi Puncak: Pembatalan gratis hingga 7 hari sebelum kedatangan dengan pengembalian dana 100%.
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: Official Boarding Pass & Confirmation Voucher */}
          {step === 5 && confirmedReservation && (
            <div className="space-y-6">
              {/* Voucher Card */}
              <div className="bg-[#fcfbf9] border-2 border-[#182a24] p-6 sm:p-8 relative shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#e2dcd0] gap-4">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-mono text-[#967d58]">
                      Voucher Reservasi Resmi
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#182a24]">
                      Chevilly Resort and Camp
                    </h2>
                    <div className="text-xs text-[#73837b] mt-0.5">
                      Puncak Lembah Pinus · Elevasi 2.450 mdpl
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-[#f2eee3] p-3 border border-[#ded7cb]">
                    <div className="text-[10px] uppercase text-[#73837b] font-mono">Kode Booking</div>
                    <div className="font-mono text-xl font-bold tracking-wider text-[#182a24]">
                      {confirmedReservation.bookingCode}
                    </div>
                    <div className="text-[10px] text-emerald-800 font-medium">✓ Status: Dikonfirmasi</div>
                  </div>
                </div>

                {/* Automated Email Dispatch Status Banner */}
                <div className="bg-[#101e19] text-[#f7f5ef] p-3.5 border border-[#d4af37]/40 flex items-center justify-between text-xs my-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>Invoice & E-Voucher Otomatis Dikirim ke Email Tamu</span>
                        <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">
                          TERKIRIM
                        </span>
                      </div>
                      <div className="text-[11px] text-[#a7beb3] mt-0.5">
                        PDF resmi telah otomatis dikirimkan ke <span className="text-[#edd28d] font-mono">{confirmedReservation.guestEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#edd28d] font-mono hidden sm:block shrink-0">
                    Auto-Dispatch Active
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-[#e2dcd0] text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-[#73837b] block">Tamu Utama</span>
                    <span className="font-medium text-[#182a24] text-sm">{confirmedReservation.guestName}</span>
                    <span className="text-[11px] text-[#73837b] block">{confirmedReservation.guestPhone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-[#73837b] block">Tanggal Kedatangan</span>
                    <span className="font-medium text-[#182a24] text-sm">
                      {formatDateIndonesian(checkIn)}
                    </span>
                    <span className="text-[11px] text-[#73837b] block">Check-in mulai 15:00 WIB</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-[#73837b] block">Tanggal Kepulangan</span>
                    <span className="font-medium text-[#182a24] text-sm">
                      {formatDateIndonesian(checkOut)}
                    </span>
                    <span className="text-[11px] text-[#73837b] block">{nights} Malam Menginap</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-[#73837b] block">Total Pembayaran</span>
                    <span className="font-mono font-bold text-base text-[#182a24] block">
                      {formatPrice(
                        confirmedReservation.totalPriceIdr,
                        confirmedReservation.totalPriceUsd,
                        confirmedReservation.currency
                      )}
                    </span>
                    <span className="text-[10px] text-[#73837b]">Metode: {confirmedReservation.paymentMethod}</span>
                  </div>
                </div>

                {/* Itemized booked services */}
                <div className="py-4 text-xs space-y-2">
                  <div className="font-semibold text-[#182a24] uppercase text-[11px] tracking-wider mb-2">
                    Layanan & Fasilitas Terkonfirmasi:
                  </div>
                  {confirmedReservation.room && (
                    <div className="flex items-center justify-between text-[#354840]">
                      <span>✓ Akomodasi: {confirmedReservation.room.name} ({nights} Malam)</span>
                      <span className="font-mono">{formatPrice(roomTotalIdr, roomTotalUsd, currency)}</span>
                    </div>
                  )}
                  {confirmedReservation.tours?.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-[#354840]">
                      <span>✓ Ekspedisi: {t.name} ({t.participants} Peserta)</span>
                      <span className="font-mono">
                        {formatPrice(t.pricePerPerson * t.participants, 0, currency)}
                      </span>
                    </div>
                  ))}
                  {confirmedReservation.selectedAddOns?.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-[#354840]">
                      <span>✓ Fasilitas Tambahan: {a.name}</span>
                      <span className="font-mono">{formatPrice(a.price, 0, currency)}</span>
                    </div>
                  ))}
                </div>

                {/* Important notices */}
                <div className="mt-4 p-3 bg-[#f5f2e9] border border-[#e2dcd0] text-[11px] text-[#5d6e66] leading-relaxed">
                  <span className="font-semibold text-[#182a24]">Petunjuk Perjalanan Puncak:</span> Suhu rata-rata malam hari dapat mencapai 8°C. Mohon siapkan pakaian wol atau jaket tebal. Pihak concierge resor siap menjemput Anda di titik koordinat lembah atau helipad kedatangan.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsInvoiceOpen(true)}
                    className="px-4 sm:px-5 py-2.5 bg-[#d4af37] text-[#0d1613] hover:bg-[#edd28d] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all rounded-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Invoice</span>
                  </button>

                  <button
                    onClick={handleSendConfirmedToWhatsApp}
                    className="px-4 sm:px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all rounded-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Kirim Voucher ke WhatsApp</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmedReservation && onDispatchEmail) {
                        onDispatchEmail(
                          confirmedReservation.guestEmail,
                          confirmedReservation.bookingCode,
                          confirmedReservation.guestName,
                          confirmedReservation
                        );
                      }
                      onClose();
                      setTimeout(() => {
                        const suitesEl = document.getElementById('suites');
                        if (suitesEl) {
                          suitesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 120);
                    }}
                    className="px-4 sm:px-5 py-2.5 bg-[#f4f0e6] border border-[#182a24] text-[#182a24] hover:bg-[#e8e1d1] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors rounded-sm"
                  >
                    + Tambah Reservasi Lagi
                  </button>

                  <button
                    onClick={handleFinish}
                    className="px-6 py-2.5 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] text-xs font-semibold uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-sm transition-colors rounded-sm"
                  >
                    <BookmarkCheck className="w-4 h-4 text-[#c5a880]" />
                    <span>Selesai &amp; Kirim ke Email</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1 to 4) */}
        {step < 5 && (
          <div className="px-6 py-4 border-t border-[#e2dcd0] bg-[#f4f0e6] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#495c53] hover:text-[#182a24] cursor-pointer"
              >
                Kembali
              </button>
            ) : (
              <div className="text-xs text-[#73837b]">
                Estimasi: <span className="font-mono font-bold text-[#182a24]">{formatPrice(grandTotalIdr, grandTotalUsd, currency)}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {step === 4 && (
                <button
                  type="button"
                  onClick={handleSendFormToWhatsApp}
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors rounded-sm"
                  title="Kirim rincian formulir ke WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Kirim ke WhatsApp</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-sm rounded-sm"
              >
                <span>{step === 4 ? 'Konfirmasi & Selesaikan' : 'Lanjutkan'}</span>
                <ArrowRight className="w-4 h-4 text-[#c5a880]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Official Tax Invoice & Guest Folio Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        reservation={confirmedReservation}
        currency={currency}
        autoPrint={true}
      />
    </div>
  );
};
