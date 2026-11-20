/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChevillyMapSection } from './components/ChevillyMapSection';
import { HeroSection } from './components/HeroSection';
import { BookingBar } from './components/BookingBar';
import { SuitesSection } from './components/SuitesSection';
import { ToursSection } from './components/ToursSection';
import { WellnessAndDining } from './components/WellnessAndDining';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { RoomDetailModal } from './components/RoomDetailModal';
import { TourDetailModal } from './components/TourDetailModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { VisitorAuthModal } from './components/VisitorAuthModal';
import { EmailDeliveryToast } from './components/EmailDeliveryToast';
import { InvoiceModal } from './components/InvoiceModal';
import { WhatsAppFloatingWidget } from './components/WhatsAppFloatingWidget';
import { AdminPortalModal } from './components/AdminPortalModal';
import { RoomSuite, TourExperience, Currency, Reservation, VisitorUser, RoomCategoryItem, GuestReview } from './types';
import { ROOM_SUITES, TOUR_EXPERIENCES } from './data/resortData';
import { fetchRooms, fetchTours, fetchFacilities, fetchReservations, fetchCategories, fetchReviews, createReservation, deleteReservation, FacilitiesData } from './services/api';

const DEFAULT_REVIEWS: GuestReview[] = [
  {
    id: 'rev-1',
    authorName: 'Dr. Nadia Wiratama',
    authorRole: 'Spesialis Bedah & Penggemar Alam · Jakarta',
    quote:
      'Menyaksikan kabut pagi membuka panorama puncak alpine dari perapian Presidential Chalet adalah momen paling menenangkan dalam hidup kami. Layanan butler begitu penuh perhatian dan hangat.',
    rating: 5,
    isActive: true,
    createdAt: '2026-10-12',
  },
  {
    id: 'rev-2',
    authorName: 'Marcus & Helena Vance',
    authorRole: 'Architectural Conservators · Zurich',
    quote:
      'The private glacier ridge trek was world-class. UIAGM certified guides gave us absolute confidence, and the sunrise champagne table above the clouds was unforgettable.',
    rating: 5,
    isActive: true,
    createdAt: '2026-10-20',
  },
  {
    id: 'rev-3',
    authorName: 'Rayhan Syahputra',
    authorRole: 'Tech Founder & Alpine Enthusiast · Bandung',
    quote:
      'Kolam air panas belerang alami di tepi jurang batu saat senja adalah pengalaman restoratif terbaik. Udara pegunungannya sangat segar dan murni.',
    rating: 5,
    isActive: true,
    createdAt: '2026-11-01',
  },
];

export default function App() {
  const [currency, setCurrency] = useState<Currency>('IDR');

  // Visitor Auth user session
  const [currentUser, setCurrentUser] = useState<VisitorUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('chevilly_guest_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch {
      // fallback
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [emailNotification, setEmailNotification] = useState<{
    email: string;
    bookingCode: string;
    guestName: string;
    reservation: Reservation;
  } | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Reservation | null>(null);

  // Load reservations from localStorage or default
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('altovista_reservations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Save reservations on changes
  useEffect(() => {
    try {
      localStorage.setItem('altovista_reservations', JSON.stringify(reservations));
    } catch {
      // ignore
    }
  }, [reservations]);

  const handleLoginSuccess = (user: VisitorUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('chevilly_guest_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('chevilly_guest_user');
    } catch {
      // ignore
    }
  };

  // Backend Dynamic Data States
  const [roomsData, setRoomsData] = useState<RoomSuite[]>(ROOM_SUITES);
  const [categoriesData, setCategoriesData] = useState<RoomCategoryItem[]>([]);
  const [toursData, setToursData] = useState<TourExperience[]>(TOUR_EXPERIENCES);
  const [facilitiesData, setFacilitiesData] = useState<FacilitiesData | null>(null);
  const [reviewsData, setReviewsData] = useState<GuestReview[]>(() => {
    try {
      const saved = localStorage.getItem('chevilly_guest_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_REVIEWS;
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Sync data with backend API
  const loadBackendData = async () => {
    try {
      const [r, t, f, resList, catsList, revList] = await Promise.all([
        fetchRooms(),
        fetchTours(),
        fetchFacilities(),
        fetchReservations(),
        fetchCategories(),
        fetchReviews(),
      ]);
      if (Array.isArray(r) && r.length > 0) setRoomsData(r);
      if (Array.isArray(t) && t.length > 0) setToursData(t);
      if (f) setFacilitiesData(f);
      if (Array.isArray(resList)) setReservations(resList);
      if (Array.isArray(revList)) {
        setReviewsData(revList);
        try {
          localStorage.setItem('chevilly_guest_reviews', JSON.stringify(revList));
        } catch {
          // ignore storage errors
        }
      }
      if (Array.isArray(catsList) && catsList.length > 0) {
        setCategoriesData(catsList);
        try {
          localStorage.setItem('chevilly_room_categories', JSON.stringify(catsList));
          window.dispatchEvent(new CustomEvent('chevilly-categories-updated', { detail: catsList }));
        } catch {
          // ignore storage errors
        }
      }
    } catch (err) {
      console.warn('Backend sync fallback to static state:', err);
    }
  };

  useEffect(() => {
    loadBackendData();

    // Support direct URL access via hash #admin
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminModalOpen(true);
      }
    };
    const handleReviewsUpdated = () => {
      try {
        const saved = localStorage.getItem('chevilly_guest_reviews');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setReviewsData(parsed);
        }
      } catch {
        // ignore
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('chevilly-reviews-updated', handleReviewsUpdated);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('chevilly-reviews-updated', handleReviewsUpdated);
    };
  }, []);

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [roomForBooking, setRoomForBooking] = useState<RoomSuite | null>(null);
  const [tourForBooking, setTourForBooking] = useState<TourExperience | null>(null);

  const [detailRoom, setDetailRoom] = useState<RoomSuite | null>(null);
  const [detailTour, setDetailTour] = useState<TourExperience | null>(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [selectedRoomCategory, setSelectedRoomCategory] = useState<string>('all');

  const handleSelectRoomCategory = (category: string) => {
    setSelectedRoomCategory(category);
    setTimeout(() => {
      const specificRoomEl = document.getElementById(`room-${category}`);
      if (specificRoomEl) {
        specificRoomEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        const suitesEl = document.getElementById('suites');
        if (suitesEl) suitesEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'IDR' ? 'USD' : 'IDR'));
  };

  const handleOpenGeneralBooking = () => {
    setRoomForBooking(roomsData[0] || ROOM_SUITES[0]);
    setTourForBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleSelectRoom = (room: RoomSuite) => {
    setRoomForBooking(room);
    setTourForBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleSelectTour = (tour: TourExperience) => {
    setTourForBooking(tour);
    setRoomForBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleBookSpa = () => {
    const spaTour = toursData.find((t) => t.id === 'thermal-springs-spa') || toursData[0] || TOUR_EXPERIENCES[0];
    if (spaTour) {
      handleSelectTour(spaTour);
    } else {
      handleOpenGeneralBooking();
    }
  };

  const handleBookDining = () => {
    const diningTour = toursData.find((t) => t.id === 'twilight-gastronomy') || toursData[1] || toursData[0] || TOUR_EXPERIENCES[0];
    if (diningTour) {
      handleSelectTour(diningTour);
    } else {
      handleOpenGeneralBooking();
    }
  };

  const handleSearchFromHero = (params: {
    type: 'room' | 'tour' | 'combo';
    category?: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }) => {
    if (params.type === 'tour') {
      const element = document.getElementById('meeting');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else if (params.type === 'combo') {
      const element = document.getElementById('expeditions');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (params.category && params.category !== 'all') {
        setSelectedRoomCategory(params.category);
        setTimeout(() => {
          const roomEl = document.getElementById(`room-${params.category}`);
          if (roomEl) {
            roomEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            const suitesEl = document.getElementById('suites');
            if (suitesEl) suitesEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 60);
      } else {
        setSelectedRoomCategory('all');
        const element = document.getElementById('suites');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleAddReservation = async (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev]);
    const saved = await createReservation(newRes);
    if (saved) {
      const latest = await fetchReservations();
      if (Array.isArray(latest)) {
        setReservations(latest);
      }
    }
  };

  const handleCancelReservation = async (id: string): Promise<boolean> => {
    try {
      await deleteReservation(id);
      const latest = await fetchReservations();
      if (Array.isArray(latest)) {
        setReservations(latest);
      } else {
        setReservations((prev) => prev.filter((r) => r.id !== id));
      }
      return true;
    } catch (err) {
      console.error('Gagal menghapus reservasi dari database:', err);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#1f2923] flex flex-col font-body selection:bg-[#c5a880] selection:text-white">
      {/* 1. Header Navigation conforming to Top Bar Contract */}
      <Navbar
        currency={currency}
        onToggleCurrency={toggleCurrency}
        onOpenBooking={handleOpenGeneralBooking}
        onOpenMyBookings={() => {
          setIsMyBookingsOpen(true);
          loadBackendData();
        }}
        bookingsCount={
          currentUser
            ? (() => {
                const matched = reservations.filter(
                  (r) => r.guestEmail.toLowerCase() === currentUser.email.toLowerCase()
                );
                return matched.length > 0 ? matched.length : reservations.length;
              })()
            : 0
        }
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onSelectRoomCategory={handleSelectRoomCategory}
      />

      <main className="flex-1">
        {/* 2. Hero Section with HD Video Carousel */}
        <HeroSection />

        {/* 3. Floating Reservation & Availability Bar — masuk 30px ke bawah video carousel */}
        <section
          id="cek-reservasi"
          className="relative z-20 -mt-[30px] px-4 sm:px-8 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto w-full bg-[#14231e]/92 backdrop-blur-md border border-[#d4af37]/40 shadow-[0_18px_45px_rgba(0,0,0,0.45)] p-4 sm:p-6">
            <BookingBar
              currency={currency}
              onSearch={handleSearchFromHero}
              onInstantReserve={handleOpenGeneralBooking}
            />
          </div>
        </section>

        {/* 4. Luxury Suites & Chalets Collection with Dynamic Backend Data */}
        <SuitesSection
          currency={currency}
          rooms={roomsData}
          categories={categoriesData}
          onSelectRoom={handleSelectRoom}
          onViewRoomDetails={(room) => setDetailRoom(room)}
          selectedCategory={selectedRoomCategory}
          onSelectCategory={setSelectedRoomCategory}
        />

        {/* 4. Mountain Expeditions & Excursions with Dynamic Backend Data */}
        <ToursSection
          currency={currency}
          tours={toursData}
          onSelectTour={handleSelectTour}
          onViewTourDetails={(tour) => setDetailTour(tour)}
        />

        {/* 5. Thermal Springs, Summit Fine Dining & Executive Meeting Bento with Dynamic Backend Data */}
        <WellnessAndDining
          currency={currency}
          facilities={facilitiesData}
          onBookSpa={handleBookSpa}
          onBookDining={handleBookDining}
          onBookMeeting={handleOpenGeneralBooking}
        />

        {/* 6. Peta Chevilly Resort and Camp (Google Maps & Akses Lokasi) — di atas section ulasan */}
        <ChevillyMapSection />

        {/* 7. Section Ulasan Para Penjelajah & Tamu Kehormatan */}
        {(() => {
          const activeReviews = reviewsData.filter((rev) => rev.isActive !== false);
          if (activeReviews.length === 0) return null;
          return (
            <section id="ulasan" className="bg-[#101b17] text-[#ded8cc] border-t border-[#22352e] py-14 px-6 sm:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-[10px] tracking-widest uppercase font-mono text-[#c5a880] mb-6 text-center">
                  Ulasan Para Penjelajah & Tamu Kehormatan
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed">
                  {activeReviews.map((rev) => {
                    const stars = Math.min(5, Math.max(1, Number(rev.rating) || 5));
                    return (
                      <div key={rev.id} className="p-5 bg-[#14231e] border border-[#263e34] flex flex-col justify-between">
                        <div>
                          <div className="text-[#d4af37] text-[11px] tracking-widest mb-2.5" aria-label={`Rating ${stars} dari 5`}>
                            {'★'.repeat(stars)}
                            {'☆'.repeat(5 - stars)}
                          </div>
                          <p className="italic text-[#e2ded6] mb-4">
                            &quot;{rev.quote}&quot;
                          </p>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{rev.authorName}</div>
                          <div className="text-[11px] text-[#869990]">{rev.authorRole}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })()}
      </main>

      {/* 7. Quiet Luxury Footer & Attribution */}
      <Footer onOpenAdmin={() => setIsAdminModalOpen(true)} />

      {/* Interactive Booking Engine Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        currency={currency}
        rooms={roomsData}
        categories={categoriesData}
        tours={toursData}
        initialRoom={roomForBooking}
        initialTour={tourForBooking}
        onConfirmReservation={handleAddReservation}
        currentUser={currentUser}
        onDispatchEmail={(email, code, name, res) => {
          setEmailNotification({ email, bookingCode: code, guestName: name, reservation: res });
        }}
      />

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={detailRoom}
        isOpen={Boolean(detailRoom)}
        onClose={() => setDetailRoom(null)}
        currency={currency}
        onBookNow={handleSelectRoom}
      />

      {/* Tour Detail Modal */}
      <TourDetailModal
        tour={detailTour}
        isOpen={Boolean(detailTour)}
        onClose={() => setDetailTour(null)}
        currency={currency}
        onBookNow={handleSelectTour}
      />

      {/* My Bookings Portal Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        reservations={reservations}
        currency={currency}
        onCancelReservation={handleCancelReservation}
        onReservationUpdated={(updatedRes) => {
          setReservations((prev) =>
            prev.map((r) => (r.id === updatedRes.id ? updatedRes : r))
          );
        }}
        onNewReservation={() => {
          setSelectedRoomCategory('all');
          setTimeout(() => {
            const suitesEl = document.getElementById('suites');
            if (suitesEl) {
              suitesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 120);
        }}
        currentUser={currentUser}
        onUpdateProfile={handleLoginSuccess}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthModalOpen(true)}
      />

      {/* Visitor Auth Modal (Login / Register / Quick Lookup) */}
      <VisitorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        reservations={reservations}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />

      {/* Automated Email Dispatch Toast Notification */}
      {emailNotification && (
        <EmailDeliveryToast
          email={emailNotification.email}
          bookingCode={emailNotification.bookingCode}
          guestName={emailNotification.guestName}
          onClose={() => setEmailNotification(null)}
          onViewInvoice={() => {
            setActiveInvoice(emailNotification.reservation);
            setEmailNotification(null);
          }}
        />
      )}

      {/* Direct Invoice Viewer from Email Notification */}
      <InvoiceModal
        isOpen={Boolean(activeInvoice)}
        onClose={() => setActiveInvoice(null)}
        reservation={activeInvoice}
        currency={currency}
        autoPrint={true}
      />

      {/* Direct WhatsApp Floating Form for Prospective Customers */}
      <WhatsAppFloatingWidget />

      {/* Admin CMS Portal Modal with full CRUD for all pages */}
      <AdminPortalModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          if (window.location.hash === '#admin') {
            window.history.pushState('', document.title, window.location.pathname);
          }
        }}
        currency={currency}
        onDataChanged={loadBackendData}
      />
    </div>
  );
}
