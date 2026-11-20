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
import { ToursSection, TourCategoryFilter } from './components/ToursSection';
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
import { RoomSuite, TourExperience, Currency, Reservation, VisitorUser, RoomCategoryItem, GuestReview, BookingAddOn } from './types';
import { ROOM_SUITES, TOUR_EXPERIENCES } from './data/resortData';
import { HeroVideoItem } from './data/heroVideos';
import { MapLocation } from './components/WellnessAndDining';
import {
  fetchRooms, fetchTours, fetchFacilities, fetchReservations, fetchCategories, fetchReviews,
  fetchResortInfo, fetchHeroVideos, fetchMapLocations, fetchAddOns,
  createReservation, deleteReservation, fetchLiveUsdRate, FacilitiesData, ResortInfoData
} from './services/api';
import { setLiveUsdRate } from './utils/formatters';

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
  const [, setUsdRateVersion] = useState(0);

  // Fetch live USD/IDR exchange rate so USD prices always match the current dollar rate while IDR stays fixed
  useEffect(() => {
    let active = true;
    fetchLiveUsdRate().then((info) => {
      if (active && info?.rate) {
        setLiveUsdRate(info.rate);
      }
    });
    const handleRateUpdate = () => setUsdRateVersion((v) => v + 1);
    window.addEventListener('chevilly-usd-rate-updated', handleRateUpdate);
    return () => {
      active = false;
      window.removeEventListener('chevilly-usd-rate-updated', handleRateUpdate);
    };
  }, []);

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

  // Reservations loaded strictly from backend database (no localStorage cache)
  const [reservations, setReservations] = useState<Reservation[]>([]);

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

  // Backend Dynamic Data States (always render fixed data strictly from DB, never localStorage cache)
  const [roomsData, setRoomsData] = useState<RoomSuite[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState<boolean>(true);
  const [categoriesData, setCategoriesData] = useState<RoomCategoryItem[]>([]);
  const [toursData, setToursData] = useState<TourExperience[]>([]);
  const [isToursLoading, setIsToursLoading] = useState<boolean>(true);
  const [facilitiesData, setFacilitiesData] = useState<FacilitiesData | null>(null);
  const [resortInfoData, setResortInfoData] = useState<ResortInfoData | null>(null);
  const [heroVideosData, setHeroVideosData] = useState<HeroVideoItem[] | null>(null);
  const [mapLocationsData, setMapLocationsData] = useState<MapLocation[] | null>(null);
  const [addOnsData, setAddOnsData] = useState<BookingAddOn[]>([]);
  const [reviewsData, setReviewsData] = useState<GuestReview[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Sync all front-page data directly with backend database (no-cache)
  const loadBackendData = async () => {
    try {
      const [r, t, f, resList, catsList, revList, infoRes, heroVids, mapLocs, addOnsList] = await Promise.all([
        fetchRooms(),
        fetchTours(),
        fetchFacilities(),
        fetchReservations(),
        fetchCategories(),
        fetchReviews(),
        fetchResortInfo(),
        fetchHeroVideos<HeroVideoItem>(),
        fetchMapLocations<MapLocation>(),
        fetchAddOns(),
      ]);

      if (Array.isArray(r)) {
        setRoomsData(r);
        setDetailRoom((prev) => (prev ? r.find((item) => item.id === prev.id) || null : null));
        setRoomForBooking((prev) => (prev ? r.find((item) => item.id === prev.id) || prev : null));
      } else {
        setRoomsData((prev) => (prev.length > 0 ? prev : ROOM_SUITES));
      }

      if (Array.isArray(t)) {
        setToursData(t);
        setDetailTour((prev) => (prev ? t.find((item) => item.id === prev.id) || null : null));
      } else {
        setToursData((prev) => (prev.length > 0 ? prev : TOUR_EXPERIENCES));
      }

      if (f) setFacilitiesData(f);
      if (infoRes) setResortInfoData(infoRes);
      if (Array.isArray(resList)) setReservations(resList);
      if (Array.isArray(revList)) {
        setReviewsData(revList);
      } else {
        setReviewsData((prev) => (prev.length > 0 ? prev : DEFAULT_REVIEWS));
      }
      if (Array.isArray(catsList)) setCategoriesData(catsList);
      if (Array.isArray(heroVids)) setHeroVideosData(heroVids);
      if (Array.isArray(mapLocs)) setMapLocationsData(mapLocs);
      if (Array.isArray(addOnsList)) setAddOnsData(addOnsList);
    } catch (err) {
      console.warn('Backend sync error:', err);
      setRoomsData((prev) => (prev.length > 0 ? prev : ROOM_SUITES));
      setToursData((prev) => (prev.length > 0 ? prev : TOUR_EXPERIENCES));
      setReviewsData((prev) => (prev.length > 0 ? prev : DEFAULT_REVIEWS));
    } finally {
      setIsRoomsLoading(false);
      setIsToursLoading(false);
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
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
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
  const [selectedTourCategory, setSelectedTourCategory] = useState<TourCategoryFilter>('all');

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
      if (params.category) {
        setSelectedTourCategory(params.category as TourCategoryFilter);
      }
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
        categories={categoriesData}
      />

      <main className="flex-1">
        {/* 2. Hero Section with HD Video Carousel (Strictly from DB) */}
        <HeroSection videos={heroVideosData} />

        {/* 3. Floating Reservation & Availability Bar — masuk 30px ke bawah video carousel */}
        <section
          id="cek-reservasi"
          className="relative z-20 -mt-[30px] px-4 sm:px-8 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto w-full bg-[#14231e]/92 backdrop-blur-md border border-[#d4af37]/40 shadow-[0_18px_45px_rgba(0,0,0,0.45)] p-4 sm:p-6">
            <BookingBar
              currency={currency}
              categories={categoriesData}
              onSearch={handleSearchFromHero}
              onInstantReserve={handleOpenGeneralBooking}
            />
          </div>
        </section>

        {/* 4. Luxury Suites & Chalets Collection with Dynamic Backend Data */}
        <SuitesSection
          currency={currency}
          rooms={roomsData}
          isLoading={isRoomsLoading}
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
          isLoading={isToursLoading}
          onSelectTour={handleSelectTour}
          onViewTourDetails={(tour) => setDetailTour(tour)}
          selectedCategory={selectedTourCategory}
          onSelectCategory={setSelectedTourCategory}
        />

        {/* 5. Thermal Springs, Summit Fine Dining & Executive Meeting Bento with Dynamic Backend Data */}
        <WellnessAndDining
          currency={currency}
          facilities={facilitiesData}
          mapLocations={mapLocationsData}
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
      <Footer resortInfo={resortInfoData} onOpenAdmin={() => setIsAdminModalOpen(true)} />

      {/* Interactive Booking Engine Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        currency={currency}
        rooms={roomsData}
        categories={categoriesData}
        tours={toursData}
        addOns={addOnsData}
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
