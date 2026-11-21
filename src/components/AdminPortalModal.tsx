import React, { useState, useEffect, useRef } from 'react';
import {
  RoomSuite,
  TourExperience,
  Reservation,
  Currency,
  BookingAddOn,
  RoomCategoryItem,
  GuestReview,
  FasilitasSaranaItem,
  FasilitasOperatingHour,
  ZonaPrabayarItem,
  ZonaRentalFacility,
} from '../types';
import {
  X, Plus, Edit, Trash2, Check, RefreshCw, Eye, EyeOff, ShieldCheck,
  Building2, Compass, Sparkles, Phone, BookmarkCheck, ExternalLink,
  Save, AlertCircle, Printer, Lock, KeyRound, UserCheck, LogIn, LogOut,
  Camera, Upload, Image as ImageIcon, ChevronDown, Layers, Tag, DollarSign,
  MapPin, Video, Play, Search, UtensilsCrossed, Users, MessageCircle, Heart, Clock,
  CheckSquare, Square, Star
} from 'lucide-react';
import { formatPrice, formatDateIndonesian, getLiveUsdRate, setLiveUsdRate, idrToLiveUsd } from '../utils/formatters';
import { BOOKING_ADDONS } from '../data/resortData';
import {
  fetchResortInfo, updateResortInfo,
  fetchFacilities, updateFacility,
  fetchRooms, createRoom, updateRoom, deleteRoom,
  fetchCategories, syncCategoriesToServer,
  fetchTours, createTour, updateTour, deleteTour,
  fetchReservations, updateReservation, deleteReservation,
  fetchAddOns, createAddOn, updateAddOn, deleteAddOn,
  fetchReviews, createReview, updateReview, deleteReview,
  fetchHeroVideos, saveHeroVideosToServer,
  fetchMapLocations, saveMapLocationsToServer,
  fetchVenues, saveVenuesToServer,
  fetchFasilitasSarana, fetchZonaPrabayar,
  ResortInfoData, FacilitiesData,
  loginAdmin, changeAdminPassword, AdminUser, uploadImage, fetchLiveUsdRate
} from '../services/api';
import { AdminFasilitasTab, AdminZonaTab } from './AdminFasilitasZonaTab';
import {
  MapLocation,
  MAP_LOCATIONS,
  saveStoredMapLocations,
  getLocationDetails
} from './WellnessAndDining';
import {
  HeroVideoItem,
  INITIAL_HERO_VIDEOS,
  saveStoredHeroVideos,
  parseYouTubeVideo
} from '../data/heroVideos';
import { InvoiceModal } from './InvoiceModal';
import { WhatsAppIcon } from './WhatsAppFloatingWidget';

export interface VenueItem {
  id: string;
  name: string;
  category: 'resto' | 'meeting' | 'wedding';
  categoryLabel?: string;
  capacity: string;
  hours: string;
  priceNote: string;
  description: string;
  image: string;
  features?: string[];
  showName?: boolean;
  showDescription?: boolean;
  showPrice?: boolean;
  showHours?: boolean;
  showCapacity?: boolean;
}

export const DEFAULT_VENUE_ITEMS: VenueItem[] = [
  {
    id: 'vine-restaurant',
    name: 'Vine Restaurant (Indonesian & Western Cuisine)',
    category: 'resto',
    categoryLabel: 'Resto & Cafe',
    capacity: '150 Kursi',
    hours: '07:00 - 22:00 WIB',
    priceNote: 'Mulai Rp 35.000 / porsi',
    description: 'Restoran utama bernuansa pegunungan sejuk dengan hidangan nusantara, western, dan pemandangan lembah hijau nan asri.',
    image: '/src/assets/images/dining_summit_bistro_1794216168611.jpg',
    features: ['Indoor & Semi Outdoor', 'Live Music Weekend', 'Prasmanan & Ala Carte', 'VIP Dining Area'],
  },
  {
    id: 'le-ciel-cafe',
    name: 'Le Ciel Cafe & Pastry Bar',
    category: 'resto',
    categoryLabel: 'Resto & Cafe',
    capacity: '80 Kursi',
    hours: '09:00 - 23:00 WIB',
    priceNote: 'Mulai Rp 25.000',
    description: 'Kafe modern estetik menyajikan aneka specialty coffee, pastry renyah, dessert, dan spot foto panorama langit perbukitan.',
    image: '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
    features: ['Specialty Coffee', 'Artisan Bakery', 'Sunset Viewing Deck', 'High Speed Wi-Fi'],
  },
  {
    id: 'pujasera-1',
    name: 'Pujasera 1 (Kuliner Khas Nusantara)',
    category: 'resto',
    categoryLabel: 'Resto & Cafe',
    capacity: '200 Kursi',
    hours: '08:00 - 21:00 WIB',
    priceNote: 'Mulai Rp 15.000',
    description: 'Sentra kuliner aneka hidangan khas Jawa Barat, nasi liwet komplit, bakso kuah hangat, soto, dan jajanan tradisional.',
    image: '/src/assets/images/chinatown_chevilly_1794289471017.jpg',
    features: ['Aneka Stand Makanan', 'Harga Terjangkau', 'Kapasitas Rombongan', 'Pelayanan Cepat'],
  },
  {
    id: 'pujasera-3',
    name: 'Pujasera 3 (Kantin Wisata & Minuman Segar)',
    category: 'resto',
    categoryLabel: 'Resto & Cafe',
    capacity: '120 Kursi',
    hours: '08:00 - 18:00 WIB',
    priceNote: 'Mulai Rp 10.000',
    description: 'Area kuliner dekat wahana air waterpark menyediakan camilan renyah, es kelapa muda, jus segar, dan aneka minuman dingin.',
    image: '/src/assets/images/waterpark_chevilly_1794289440273.jpg',
    features: ['Dekat Wahana Air', 'Es Kelapa Muda & Jus', 'Snack & Fast Food', 'Tempat Istirahat Wisatawan'],
  },
  {
    id: 'oleh-oleh',
    name: 'Pusat Oleh-Oleh & Souvenir Chevilly',
    category: 'resto',
    categoryLabel: 'Resto & Cafe',
    capacity: 'Area Belanja Wisata',
    hours: '08:00 - 20:00 WIB',
    priceNote: 'Mulai Rp 15.000',
    description: 'Galeri suvenir resmi merchandise Chevilly, madu murni hutan, talas bogor, dodol, dan aneka camilan khas Bogor.',
    image: '/src/assets/images/labirin_chevilly_1794289535305.jpg',
    features: ['Merchandise Resmi', 'Madu Murni & Herbal', 'Kue & Camilan Lokal', 'Kemasan Hadiah Cantik'],
  },
  {
    id: 'grand-ballroom',
    name: 'Grand Ballroom Summit Ridge',
    category: 'meeting',
    categoryLabel: 'Meeting Room',
    capacity: '300 - 500 Orang (Theatre)',
    hours: 'Full Day / Half Day',
    priceNote: 'Mulai Rp 250.000 / pax',
    description: 'Ballroom megah bebas pilar dengan tata suara profesional, proyektor laser resolusi tinggi, panggung, dan pendingin ruangan sentral.',
    image: '/src/assets/images/resort_meeting_room_1794221120880.jpg',
    features: ['Tanpa Pilar (Plafon 6m)', 'Sound System & Mic Wireless', 'Panggung & Podium', '2x Coffee Break & Lunch'],
  },
  {
    id: 'orchid-boardroom',
    name: 'Orchid Executive Boardroom',
    category: 'meeting',
    categoryLabel: 'Meeting Room',
    capacity: '20 - 40 Orang (U-Shape / Board)',
    hours: 'Full Day / Half Day',
    priceNote: 'Mulai Rp 220.000 / pax',
    description: 'Ruang rapat VIP berkarpet mewah untuk rapat direksi, negosiasi bisnis, dan pertemuan privat berkelas tinggi.',
    image: '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
    features: ['Smart Interactive TV 75"', 'Kursi Ergonomis Kulit', 'Flipchart & Perlengkapan ATK', 'Free Flow Kopi & Teh'],
  },
  {
    id: 'lavender-hall',
    name: 'Lavender Meeting & Function Hall',
    category: 'meeting',
    categoryLabel: 'Meeting Room',
    capacity: '80 - 150 Orang (Classroom)',
    hours: 'Full Day / Half Day',
    priceNote: 'Mulai Rp 200.000 / pax',
    description: 'Hall fleksibel untuk pelatihan karyawan, rapat koordinasi tahunan, seminar komunitas, dan workshop interaktif.',
    image: '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
    features: ['Layout Fleksibel', 'High Speed Wi-Fi 100Mbps', 'Screen & LCD Projector', 'Ruang Transit Pembicara'],
  },
  {
    id: 'pine-wedding',
    name: 'Pine Forest Outdoor Wedding Venue',
    category: 'wedding',
    categoryLabel: 'Wedding & Social',
    capacity: '300 - 800 Tamu Undangan',
    hours: '08:00 - 22:00 WIB',
    priceNote: 'Paket Mulai Rp 28.500.000',
    description: 'Pernikahan sakral dan romantis di bawah kanopi pohon pinus alami berhawa sejuk dengan instalasi lampu fairy lights.',
    image: '/src/assets/images/colosseum_chevilly_1794289493620.jpg',
    features: ['Altar Kayu Natural', 'Sound System Outdoor', 'Kamar Pengantin Gratis', 'Area Parkir Luas & Valet'],
  },
  {
    id: 'glasshouse-wedding',
    name: 'Glasshouse & Pavilion Wedding Venue',
    category: 'wedding',
    categoryLabel: 'Wedding & Social',
    capacity: '200 - 500 Tamu Undangan',
    hours: '09:00 - 22:00 WIB',
    priceNote: 'Paket Mulai Rp 35.000.000',
    description: 'Pavilion dinding kaca elegan dengan panorama 360 derajat pegunungan, menghadirkan kemewahan modern bercampur keasrian alam.',
    image: '/src/assets/images/dining_summit_bistro_1794216168611.jpg',
    features: ['Struktur Kaca Mewah (AC)', 'Ruang Rias & VIP Holding', 'Pencahayaan Artistik', 'Bebas Khawatir Cuaca Hujan'],
  },
  {
    id: 'gathering-package',
    name: 'Corporate Gathering & Gala Dinner Package',
    category: 'wedding',
    categoryLabel: 'Wedding & Social',
    capacity: '100 - 1.000 Tamu',
    hours: 'Siang / Malam',
    priceNote: 'Mulai Rp 185.000 / pax',
    description: 'Paket perhelatan akbar gathering instansi, reuni sekolah, gala dinner perusahaan, dilengkapi panggung hiburan dan api unggun.',
    image: '/src/assets/images/utv_atv_chevilly_1794289555220.jpg',
    features: ['Panggung Hiburan & Audio', 'Prasmanan Makanan Lengkap', 'Fasilitas Api Unggun Malam', 'Fun Games & MC Guide'],
  },
];

export const getStoredVenues = (): VenueItem[] => {
  return DEFAULT_VENUE_ITEMS;
};

export const saveStoredVenues = (items: VenueItem[]) => {
  window.dispatchEvent(new CustomEvent('chevilly-venues-updated', { detail: items }));
};

export const ROOM_CATEGORY_PRESETS: Record<
  string,
  {
    label: string;
    name: string;
    kicker: string;
    area: string;
    capacity: string;
    priceIdr: number;
    priceUsd: number;
    priceSunThursIdr: number;
    priceFridayIdr: number;
    priceSaturdayIdr: number;
    priceSunThursUsd: number;
    priceFridayUsd: number;
    priceSaturdayUsd: number;
    bedType: string;
    desc: string;
  }
> = {
  'deluxe': {
    label: 'Deluxe',
    name: 'Deluxe Room (Hortensia & Jasmine)',
    kicker: 'Kamar Deluxe Pilihan dengan Balkon Lembah Pinus',
    area: '38 m²',
    capacity: '2 Dewasa, 1 Anak',
    priceIdr: 850000,
    priceUsd: 55,
    priceSunThursIdr: 850000,
    priceFridayIdr: 1050000,
    priceSaturdayIdr: 1350000,
    priceSunThursUsd: 55,
    priceFridayUsd: 68,
    priceSaturdayUsd: 88,
    bedType: '1 Custom Alpine King Bed / Twin Bed',
    desc: 'Hortensia & Jasmine',
  },
  'ftb': {
    label: 'FTB',
    name: 'FTB - Fullboard Twin Bed (Orchid & Marigold)',
    kicker: 'Pilihan Twin Bed Ideal untuk Paket Gathering & Corporate Meeting',
    area: '42 m²',
    capacity: '2 Dewasa',
    priceIdr: 1050000,
    priceUsd: 68,
    priceSunThursIdr: 1050000,
    priceFridayIdr: 1250000,
    priceSaturdayIdr: 1550000,
    priceSunThursUsd: 68,
    priceFridayUsd: 82,
    priceSaturdayUsd: 102,
    bedType: '2 Single Twin Beds',
    desc: 'Fullboard Twin Bed Gathering',
  },
  'executive': {
    label: 'Executive',
    name: 'Executive Mountain Suite (Asoka & Aster)',
    kicker: 'Suite Eksekutif Luas dengan Living Room & Panorama Pegunungan',
    area: '52 m²',
    capacity: '2 Dewasa, 2 Anak',
    priceIdr: 1350000,
    priceUsd: 88,
    priceSunThursIdr: 1350000,
    priceFridayIdr: 1650000,
    priceSaturdayIdr: 2100000,
    priceSunThursUsd: 88,
    priceFridayUsd: 108,
    priceSaturdayUsd: 138,
    bedType: '1 Super King Bed + Sofa Bed',
    desc: 'Asoka & Aster Suite',
  },
  'premiere': {
    label: 'Premiere',
    name: 'Premiere Luxury Room (Rafflesia & Clover)',
    kicker: 'Kamar Premiere Kontemporer dengan Teras Bathtub Romantis',
    area: '58 m²',
    capacity: '2 Dewasa, 2 Anak',
    priceIdr: 1650000,
    priceUsd: 108,
    priceSunThursIdr: 1650000,
    priceFridayIdr: 1950000,
    priceSaturdayIdr: 2450000,
    priceSunThursUsd: 108,
    priceFridayUsd: 128,
    priceSaturdayUsd: 160,
    bedType: '1 Super King Alpine Bed',
    desc: 'Rafflesia & Clover',
  },
  'president-suite': {
    label: 'President Suite',
    name: 'President Suite (The Presidential Peak Chalet)',
    kicker: 'Hunian Tertinggi, Paling Privat & Panorama 360 Derajat',
    area: '185 m²',
    capacity: '4 Dewasa, 2 Anak',
    priceIdr: 4500000,
    priceUsd: 295,
    priceSunThursIdr: 4500000,
    priceFridayIdr: 5250000,
    priceSaturdayIdr: 6500000,
    priceSunThursUsd: 295,
    priceFridayUsd: 345,
    priceSaturdayUsd: 425,
    bedType: '2 King Master Suite + Private Plunge Pool',
    desc: 'The Presidential Peak Chalet',
  },
  'villas': {
    label: 'Villas',
    name: 'Villas Chevilly (Villa Typha & Summit Cedar)',
    kicker: 'Villa Mewah 2-3 Kamar dengan Dapur Lengkap, Halaman & Api Unggun',
    area: '210 m²',
    capacity: '6 - 10 Tamu',
    priceIdr: 3200000,
    priceUsd: 210,
    priceSunThursIdr: 3200000,
    priceFridayIdr: 3850000,
    priceSaturdayIdr: 4800000,
    priceSunThursUsd: 210,
    priceFridayUsd: 252,
    priceSaturdayUsd: 315,
    bedType: '3 Kamar Tidur (2 King + 4 Single Beds)',
    desc: 'Villa Typha & Summit Cedar',
  },
  'bunkbed': {
    label: 'BunkBed',
    name: 'Lavender Bunk Bed (Komunitas & Outbound)',
    kicker: 'Kamar Tingkat Bersih, Modern & Higienis untuk Grup & Komunitas',
    area: '36 m²',
    capacity: '4 - 8 Orang',
    priceIdr: 450000,
    priceUsd: 30,
    priceSunThursIdr: 450000,
    priceFridayIdr: 550000,
    priceSaturdayIdr: 700000,
    priceSunThursUsd: 30,
    priceFridayUsd: 36,
    priceSaturdayUsd: 46,
    bedType: '2-4 Set Bunk Beds Tingkat',
    desc: 'Lavender Bunk Bed Komunitas',
  },
  'transit-room': {
    label: 'Transit Room',
    name: 'Transit Room (Day-Use Refreshment & Rest)',
    kicker: 'Kamar Singgah Nyaman untuk Mandi Segar & Istirahat Singkat Wisatawan',
    area: '26 m²',
    capacity: '2 Orang',
    priceIdr: 350000,
    priceUsd: 24,
    priceSunThursIdr: 350000,
    priceFridayIdr: 400000,
    priceSaturdayIdr: 500000,
    priceSunThursUsd: 24,
    priceFridayUsd: 27,
    priceSaturdayUsd: 33,
    bedType: '1 Queen Bed / 2 Single Beds',
    desc: 'Day-Use Refreshment & Rest',
  },
};

export type { RoomCategoryItem };

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onDataChanged: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  currency,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'categories' | 'tours' | 'fasilitas_sarana' | 'zona_prabayar' | 'facilities' | 'addons' | 'reviews' | 'settings' | 'reservations' | 'map_locations' | 'hero_videos'>('rooms');
  const [isUpdateDataMenuOpen, setIsUpdateDataMenuOpen] = useState(false);
  const updateDataMenuRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Admin Authentication states (signed Bearer token held strictly in React memory)
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Change Password States in Settings Tab
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passChangeLoading, setPassChangeLoading] = useState(false);
  const [passChangeSuccess, setPassChangeSuccess] = useState<string | null>(null);
  const [passChangeError, setPassChangeError] = useState<string | null>(null);

  // Data states
  const [resortInfo, setResortInfo] = useState<ResortInfoData | null>(null);
  const [facilities, setFacilities] = useState<FacilitiesData | null>(null);
  const [rooms, setRooms] = useState<RoomSuite[]>([]);
  const [tours, setTours] = useState<TourExperience[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [fasilitasSaranaItems, setFasilitasSaranaItems] = useState<FasilitasSaranaItem[]>([]);
  const [fasilitasHours, setFasilitasHours] = useState<FasilitasOperatingHour[]>([]);
  const [zonaPrabayarItems, setZonaPrabayarItems] = useState<ZonaPrabayarItem[]>([]);
  const [zonaRentals, setZonaRentals] = useState<ZonaRentalFacility[]>([]);

  // Edit/Create Modal states
  const [editingRoom, setEditingRoom] = useState<Partial<RoomSuite> | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isRoomDetailEditorOpen, setIsRoomDetailEditorOpen] = useState(false);
  const [uploadingGallerySlot, setUploadingGallerySlot] = useState<number | null>(null);
  const [detailPreviewActivePhoto, setDetailPreviewActivePhoto] = useState<number>(0);
  const [adminRoomFilter, setAdminRoomFilter] = useState<string>('all');

  // Kurs Dollar (USD) Live state
  const [usdExchangeRate, setUsdExchangeRate] = useState<number>(() => getLiveUsdRate());
  const [isRefreshingUsdRate, setIsRefreshingUsdRate] = useState<boolean>(false);
  const [isAutoUsdCalc, setIsAutoUsdCalc] = useState<boolean>(true);

  const handleRefreshLiveUsdRate = async (force = true) => {
    setIsRefreshingUsdRate(true);
    try {
      const res = await fetchLiveUsdRate(force);
      if (res?.rate) {
        setUsdExchangeRate(res.rate);
        setLiveUsdRate(res.rate);
        setEditingRoom((prev) => {
          if (!prev) return prev;
          const sunIdr = prev.priceSunThursIdr ?? prev.priceIdr ?? 0;
          const friIdr = prev.priceFridayIdr ?? sunIdr;
          const satIdr = prev.priceSaturdayIdr ?? sunIdr;
          return {
            ...prev,
            priceUsd: idrToLiveUsd(sunIdr, res.rate),
            priceSunThursUsd: idrToLiveUsd(sunIdr, res.rate),
            priceFridayUsd: idrToLiveUsd(friIdr, res.rate),
            priceSaturdayUsd: idrToLiveUsd(satIdr, res.rate),
          };
        });
        if (force) {
          showFeedback(`Kurs live diperbarui: 1 USD = Rp ${res.rate.toLocaleString('id-ID')}`);
        }
      }
    } finally {
      setIsRefreshingUsdRate(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    handleRefreshLiveUsdRate(false);
  }, [isOpen]);

  // Room Categories state (strictly loaded from backend DB, no localStorage cache)
  const [categories, setCategories] = useState<RoomCategoryItem[]>(() =>
    Object.entries(ROOM_CATEGORY_PRESETS).map(([id, p]) => ({
      id,
      label: p.label,
      name: p.name,
      kicker: p.kicker,
      desc: p.desc,
      area: p.area,
      capacity: p.capacity,
      bedType: p.bedType,
      priceSunThursIdr: p.priceSunThursIdr,
      priceFridayIdr: p.priceFridayIdr,
      priceSaturdayIdr: p.priceSaturdayIdr,
      priceIdr: p.priceIdr,
      priceUsd: p.priceUsd,
    }))
  );
  const [editingCategory, setEditingCategory] = useState<RoomCategoryItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<RoomCategoryItem | null>(null);

  const [editingTour, setEditingTour] = useState<Partial<TourExperience> | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isTourDetailEditorOpen, setIsTourDetailEditorOpen] = useState(false);
  const [uploadingTourGallerySlot, setUploadingTourGallerySlot] = useState<number | null>(null);
  const [tourDetailPreviewActivePhoto, setTourDetailPreviewActivePhoto] = useState<number>(0);

  // Map Locations (Kawasan) States (strictly loaded from backend DB)
  const [mapLocations, setMapLocations] = useState<MapLocation[]>(MAP_LOCATIONS);
  const [editingMapLocation, setEditingMapLocation] = useState<Partial<MapLocation> | null>(null);
  const [isMapLocationModalOpen, setIsMapLocationModalOpen] = useState(false);
  const [isMapDetailEditorOpen, setIsMapDetailEditorOpen] = useState(false);
  const [uploadingMapGallerySlot, setUploadingMapGallerySlot] = useState<number | null>(null);
  const [mapDetailPreviewActivePhoto, setMapDetailPreviewActivePhoto] = useState<number>(0);
  const [adminMapCategoryFilter, setAdminMapCategoryFilter] = useState<string>('all');
  const [adminMapSearch, setAdminMapSearch] = useState<string>('');

  // Resto, Meeting & Wedding States (strictly loaded from backend DB)
  const [venueItems, setVenueItems] = useState<VenueItem[]>(DEFAULT_VENUE_ITEMS);
  const [editingVenue, setEditingVenue] = useState<Partial<VenueItem> | null>(null);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [venueCategoryFilter, setVenueCategoryFilter] = useState<'all' | 'resto' | 'meeting' | 'wedding'>('all');
  const [venueSearch, setVenueSearch] = useState<string>('');

  // Hero Videos (HD Embed & Carousel) States (strictly loaded from backend DB)
  const [heroVideos, setHeroVideos] = useState<HeroVideoItem[]>(INITIAL_HERO_VIDEOS);
  const [editingHeroVideo, setEditingHeroVideo] = useState<Partial<HeroVideoItem> | null>(null);
  const [isHeroVideoModalOpen, setIsHeroVideoModalOpen] = useState(false);
  const [heroVideoToDelete, setHeroVideoToDelete] = useState<HeroVideoItem | null>(null);

  // Fasilitas & Layanan Tambahan Puncak Pegunungan (Booking Add-ons) States (strictly from backend DB)
  const [addOns, setAddOns] = useState<BookingAddOn[]>(() => BOOKING_ADDONS.map((a) => ({ ...a, isActive: true })));
  const [editingAddOn, setEditingAddOn] = useState<Partial<BookingAddOn> | null>(null);
  const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
  const [addOnToDelete, setAddOnToDelete] = useState<BookingAddOn | null>(null);
  const [addOnSearch, setAddOnSearch] = useState('');

  // Guest Reviews (Ulasan Para Penjelajah & Tamu Kehormatan) States (strictly from backend DB)
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [editingReview, setEditingReview] = useState<Partial<GuestReview> | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<GuestReview | null>(null);
  const [reviewSearch, setReviewSearch] = useState('');

  // Reservation Delete, Invoice & Payment Proof Preview States
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isDeletingReservation, setIsDeletingReservation] = useState(false);
  const [invoiceReservation, setInvoiceReservation] = useState<Reservation | null>(null);
  const [proofReservation, setProofReservation] = useState<Reservation | null>(null);

  // Room Delete Confirmation States
  const [roomToDelete, setRoomToDelete] = useState<RoomSuite | null>(null);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);

  // Upload States
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [isModalUploading, setIsModalUploading] = useState(false);

  // Helper to read file as Data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Helper to parse YouTube / Embed URL / MP4 for live preview
  const parseVideoEmbedSource = (embedOrUrl?: string) => {
    if (!embedOrUrl) return null;
    const trimmed = embedOrUrl.trim();
    if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
      const match = trimmed.match(/src=["']([^"']+)["']/i);
      return match ? { type: 'iframe', src: match[1] } : null;
    }
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }
    if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.ogg')) {
      return { type: 'video', src: trimmed };
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return { type: 'iframe', src: trimmed };
    }
    return null;
  };

  // Direct upload from Room Card
  const handleDirectRoomImageUpload = async (roomId: string, file: File) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    setUploadingItemId(roomId);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadImage(dataUrl, file.name);
      const newImageUrl = res.url || dataUrl;

      const remainingGallery = (Array.isArray(room.gallery) ? room.gallery : []).filter(
        (g) => Boolean(g && g.trim() && g.trim() !== (room.image || '').trim() && g.trim() !== newImageUrl.trim())
      );
      const updatedRoom: RoomSuite = {
        ...room,
        image: newImageUrl,
        gallery: [newImageUrl, ...remainingGallery],
      };
      const success = await updateRoom(roomId, updatedRoom);
      if (success) {
        setRooms((prev) => prev.map((r) => (r.id === roomId ? updatedRoom : r)));
        showFeedback(`Foto kamar "${room.name}" berhasil diperbarui & foto lama dihapus!`);
        await loadAllData();
        onDataChanged();
      } else {
        showFeedback('Gagal menyimpan foto kamar baru', 'error');
      }
    } catch (err) {
      console.error('Error uploading room image:', err);
      showFeedback('Terjadi kesalahan saat memproses gambar', 'error');
    } finally {
      setUploadingItemId(null);
    }
  };

  // Direct upload from Tour Card
  const handleDirectTourImageUpload = async (tourId: string, file: File) => {
    const tour = tours.find((t) => t.id === tourId);
    if (!tour) return;
    setUploadingItemId(tourId);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadImage(dataUrl, file.name);
      const newImageUrl = res.url || dataUrl;

      const remainingGallery = (Array.isArray(tour.gallery) ? tour.gallery : []).filter(
        (g) => Boolean(g && g.trim() && g.trim() !== (tour.image || '').trim() && g.trim() !== newImageUrl.trim())
      );
      const updatedTour: TourExperience = {
        ...tour,
        image: newImageUrl,
        gallery: [newImageUrl, ...remainingGallery],
      };
      const success = await updateTour(tourId, updatedTour);
      if (success) {
        setTours((prev) => prev.map((t) => (t.id === tourId ? updatedTour : t)));
        showFeedback(`Foto wahana "${tour.name}" berhasil diperbarui & foto lama dihapus!`);
        await loadAllData();
        onDataChanged();
      } else {
        showFeedback('Gagal menyimpan foto wahana baru', 'error');
      }
    } catch (err) {
      console.error('Error uploading tour image:', err);
      showFeedback('Terjadi kesalahan saat memproses gambar', 'error');
    } finally {
      setUploadingItemId(null);
    }
  };

  const updateRoomGallerySlot = (slotIndex: number, url: string) => {
    setEditingRoom((prev) => {
      if (!prev) return prev;
      const base0 = prev.gallery?.[0] ?? prev.image ?? '';
      const base1 = prev.gallery?.[1] ?? '';
      const base2 = prev.gallery?.[2] ?? '';
      const slots = [base0, base1, base2];
      slots[slotIndex] = url;
      return {
        ...prev,
        ...(slotIndex === 0 && url ? { image: url } : {}),
        gallery: slots,
      };
    });
  };

  // Upload handler inside Room Edit/Create Modal
  const handleModalRoomImageUpload = async (file: File) => {
    if (!editingRoom) return;
    setIsModalUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const prevTempUrl =
        editingRoom.image && editingRoom.image.startsWith('/uploads/') ? editingRoom.image : undefined;
      const res = await uploadImage(dataUrl, file.name, prevTempUrl);
      const newImageUrl = res.url || dataUrl;
      setEditingRoom((prev) => {
        if (!prev) return prev;
        const oldPrimary = (prev.image || '').trim();
        const base1 = (prev.gallery?.[1] ?? '').trim();
        const base2 = (prev.gallery?.[2] ?? '').trim();
        return {
          ...prev,
          image: newImageUrl,
          gallery: [
            newImageUrl,
            base1 && base1 !== oldPrimary ? base1 : '',
            base2 && base2 !== oldPrimary ? base2 : '',
          ],
        };
      });
      showFeedback('Foto kamar baru berhasil dimuat! Klik Simpan Kamar untuk menerapkan & menghapus foto lama.');
    } catch (err) {
      console.error('Error uploading modal room image:', err);
      showFeedback('Gagal memproses gambar', 'error');
    } finally {
      setIsModalUploading(false);
    }
  };

  const handleModalRoomGallerySlotUpload = async (slotIndex: number, file: File) => {
    if (!editingRoom) return;
    setUploadingGallerySlot(slotIndex);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadImage(dataUrl, file.name);
      const newImageUrl = res.url || dataUrl;
      updateRoomGallerySlot(slotIndex, newImageUrl);
      showFeedback(
        slotIndex === 1
          ? 'Foto hover berhasil dimuat! Klik Simpan Kamar untuk menerapkan.'
          : `Foto galeri #${slotIndex + 1} berhasil dimuat!`
      );
    } catch (err) {
      console.error('Error uploading gallery slot image:', err);
      showFeedback('Gagal memproses gambar', 'error');
    } finally {
      setUploadingGallerySlot(null);
    }
  };

  const updateTourGallerySlot = (slotIndex: number, url: string) => {
    setEditingTour((prev) => {
      if (!prev) return prev;
      const base0 = prev.gallery?.[0] ?? prev.image ?? '';
      const base1 = prev.gallery?.[1] ?? '';
      const base2 = prev.gallery?.[2] ?? '';
      const slots = [base0, base1, base2];
      slots[slotIndex] = url;
      return {
        ...prev,
        ...(slotIndex === 0 && url ? { image: url } : {}),
        gallery: slots,
      };
    });
  };

  // Upload handler inside Tour Edit/Create Modal
  const handleModalTourImageUpload = async (file: File) => {
    if (!editingTour) return;
    setIsModalUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadImage(dataUrl, file.name);
      const newImageUrl = res.url || dataUrl;
      setEditingTour((prev) => {
        if (!prev) return prev;
        const base1 = prev.gallery?.[1] ?? '';
        const base2 = prev.gallery?.[2] ?? '';
        return {
          ...prev,
          image: newImageUrl,
          gallery: [newImageUrl, base1, base2],
        };
      });
      showFeedback('Foto wahana baru berhasil dimuat! Klik Simpan Wahana untuk memperbarui.');
    } catch (err) {
      console.error('Error uploading modal tour image:', err);
      showFeedback('Gagal memproses gambar', 'error');
    } finally {
      setIsModalUploading(false);
    }
  };

  const handleModalTourGallerySlotUpload = async (slotIndex: number, file: File) => {
    if (!editingTour) return;
    setUploadingTourGallerySlot(slotIndex);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadImage(dataUrl, file.name);
      const newImageUrl = res.url || dataUrl;
      updateTourGallerySlot(slotIndex, newImageUrl);
      showFeedback(
        slotIndex === 1
          ? 'Foto hover wahana berhasil dimuat! Klik Simpan Wahana untuk menerapkan.'
          : `Foto galeri wahana #${slotIndex + 1} berhasil dimuat!`
      );
    } catch (err) {
      console.error('Error uploading tour gallery slot image:', err);
      showFeedback('Gagal memproses gambar', 'error');
    } finally {
      setUploadingTourGallerySlot(null);
    }
  };

  // Load ALL data strictly from Backend Database (no browser localStorage cache)
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        infoRes,
        facRes,
        roomsRes,
        toursRes,
        resRes,
        addOnsRes,
        catsRes,
        reviewsRes,
        heroVidsRes,
        mapLocsRes,
        venuesRes,
        fasilitasSaranaRes,
        zonaPrabayarRes,
      ] = await Promise.all([
        fetchResortInfo(),
        fetchFacilities(),
        fetchRooms(),
        fetchTours(),
        fetchReservations(),
        fetchAddOns(),
        fetchCategories(),
        fetchReviews(),
        fetchHeroVideos<HeroVideoItem>(),
        fetchMapLocations<MapLocation>(),
        fetchVenues<VenueItem>(),
        fetchFasilitasSarana(),
        fetchZonaPrabayar(),
      ]);
      if (infoRes) setResortInfo(infoRes);
      if (facRes) setFacilities(facRes);
      if (Array.isArray(roomsRes)) setRooms(roomsRes);
      if (Array.isArray(toursRes)) setTours(toursRes);
      if (Array.isArray(resRes)) setReservations(resRes);
      if (Array.isArray(addOnsRes)) setAddOns(addOnsRes);
      if (Array.isArray(reviewsRes)) setReviews(reviewsRes);
      if (Array.isArray(catsRes) && catsRes.length > 0) setCategories(catsRes);
      if (Array.isArray(heroVidsRes)) setHeroVideos(heroVidsRes);
      if (Array.isArray(mapLocsRes)) setMapLocations(mapLocsRes);
      if (Array.isArray(venuesRes)) setVenueItems(venuesRes);
      if (fasilitasSaranaRes) {
        setFasilitasSaranaItems(fasilitasSaranaRes.items);
        setFasilitasHours(fasilitasSaranaRes.operatingHours);
      }
      if (zonaPrabayarRes) {
        setZonaPrabayarItems(zonaPrabayarRes.items);
        setZonaRentals(zonaPrabayarRes.rentalFacilities);
      }
    } catch (err) {
      console.error('Error loading backend data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAllData();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (!isUpdateDataMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (updateDataMenuRef.current && !updateDataMenuRef.current.contains(e.target as Node)) {
        setIsUpdateDataMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUpdateDataMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isUpdateDataMenuOpen]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await loginAdmin(loginUsername, loginPassword);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setIsAuthenticated(true);
        setAdminUser(res.admin || null);
        showFeedback(res.message || 'Berhasil masuk ke Portal Admin');
        loadAllData();
      } else {
        setLoginError(res.message || 'Username atau kata sandi tidak valid.');
      }
    } catch {
      setLoginError('Terjadi kesalahan koneksi server saat memproses login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    setIsAuthenticated(false);
    setAdminUser(null);
    setLoginPassword('');
    showFeedback('Anda telah berhasil keluar dari akun Admin');
  };

  const handleAdminSessionExpired = () => {
    setAdminToken('');
    setIsAuthenticated(false);
    setAdminUser(null);
    setLoginError('Sesi admin telah berakhir. Silakan login kembali untuk menyimpan perubahan.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError(null);
    setPassChangeSuccess(null);

    if (newPass !== confirmPass) {
      setPassChangeError('Konfirmasi kata sandi baru tidak sesuai');
      return;
    }
    if (newPass.length < 5) {
      setPassChangeError('Kata sandi baru minimal 5 karakter');
      return;
    }

    setPassChangeLoading(true);
    try {
      const res = await changeAdminPassword(currentPass, newPass);
      if (res.success) {
        setPassChangeSuccess('Kata sandi admin berhasil diperbarui!');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassChangeError(res.message || 'Gagal mengubah kata sandi');
      }
    } catch {
      setPassChangeError('Gagal menghubungi server');
    } finally {
      setPassChangeLoading(false);
    }
  };

  // ==========================================
  // ROOM CRUD
  // ==========================================
  const handleOpenAddRoom = (defaultCategory: string = 'deluxe') => {
    const foundCat = categories.find(
      (c) =>
        c.id.toLowerCase() === defaultCategory.toLowerCase() ||
        c.label.toLowerCase() === defaultCategory.toLowerCase()
    );
    const preset = foundCat || ROOM_CATEGORY_PRESETS[defaultCategory] || categories[0] || ROOM_CATEGORY_PRESETS['deluxe'];
    setEditingRoom({
      id: `room-${defaultCategory}-${Date.now()}`,
      name: '',
      kicker: '',
      category: defaultCategory,
      priceIdr: preset.priceIdr,
      priceUsd: idrToLiveUsd(preset.priceSunThursIdr || preset.priceIdr, usdExchangeRate),
      priceSunThursIdr: preset.priceSunThursIdr || preset.priceIdr,
      priceFridayIdr: preset.priceFridayIdr || Math.round(preset.priceIdr * 1.25),
      priceSaturdayIdr: preset.priceSaturdayIdr || Math.round(preset.priceIdr * 1.55),
      priceSunThursUsd: idrToLiveUsd(preset.priceSunThursIdr || preset.priceIdr, usdExchangeRate),
      priceFridayUsd: idrToLiveUsd(preset.priceFridayIdr || Math.round(preset.priceIdr * 1.25), usdExchangeRate),
      priceSaturdayUsd: idrToLiveUsd(preset.priceSaturdayIdr || Math.round(preset.priceIdr * 1.55), usdExchangeRate),
      isAvailable: true,
      totalRooms: 10,
      area: preset.area,
      capacity: preset.capacity,
      maxAdults: 2,
      maxChildren: 1,
      bedType: preset.bedType,
      altitude: '2.430 mdpl',
      rating: 4.96,
      reviewsCount: 15,
      image: '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
      gallery: ['/src/assets/images/deluxe_room_resort_1794221424197.jpg'],
      viewType: 'Panorama Puncak Pegunungan & Lembah Kabut',
      features: ['Balkon pribadi dengan pemandangan pegunungan', 'Kamar mandi marmer dengan shower air hangat'],
      includedServices: ['Sarapan gourmet hangat untuk 2 tamu', 'Akses gratis area taman & kolam renang Chevilly'],
      description: 'Akomodasi berkelas di kawasan sejuk pegunungan Chevilly Resort and Camp.',
    });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name?.trim()) return;

    const trimmedName = editingRoom.name.trim();
    const trimmedKicker = (editingRoom.kicker || '').trim();
    const primaryImage = (editingRoom.image || '').trim();
    const rawGallery = Array.isArray(editingRoom.gallery)
      ? editingRoom.gallery.map((g) => (g || '').trim()).filter(Boolean)
      : [];
    const syncedGallery = primaryImage
      ? [primaryImage, ...rawGallery.filter((g) => g !== primaryImage)]
      : rawGallery;

    // Lock exact fixed IDR values as inputted (never overwrite with multiplier drift)
    const fixedSunThursIdr = Number(editingRoom.priceSunThursIdr ?? editingRoom.priceIdr ?? 0);
    const fixedFridayIdr = Number(editingRoom.priceFridayIdr ?? fixedSunThursIdr);
    const fixedSaturdayIdr = Number(editingRoom.priceSaturdayIdr ?? fixedSunThursIdr);

    // USD values dynamically adjust to the current live USD/IDR exchange rate
    const liveSunThursUsd = idrToLiveUsd(fixedSunThursIdr, usdExchangeRate);
    const liveFridayUsd = idrToLiveUsd(fixedFridayIdr, usdExchangeRate);
    const liveSaturdayUsd = idrToLiveUsd(fixedSaturdayIdr, usdExchangeRate);

    const preparedRoom: Partial<RoomSuite> = {
      ...editingRoom,
      name: trimmedName,
      kicker: trimmedKicker,
      image: primaryImage || syncedGallery[0] || '',
      priceIdr: fixedSunThursIdr,
      priceSunThursIdr: fixedSunThursIdr,
      priceFridayIdr: fixedFridayIdr,
      priceSaturdayIdr: fixedSaturdayIdr,
      priceUsd: liveSunThursUsd,
      priceSunThursUsd: liveSunThursUsd,
      priceFridayUsd: liveFridayUsd,
      priceSaturdayUsd: liveSaturdayUsd,
      gallery: syncedGallery,
      features: Array.isArray(editingRoom.features)
        ? editingRoom.features.map((f) => f.trim()).filter(Boolean)
        : [],
      includedServices: Array.isArray(editingRoom.includedServices)
        ? editingRoom.includedServices.map((s) => s.trim()).filter(Boolean)
        : [],
    };

    if (rooms.some((r) => r.id === preparedRoom.id)) {
      // Update
      const success = await updateRoom(preparedRoom.id!, preparedRoom);
      if (success) {
        showFeedback(`Kamar "${preparedRoom.name}" berhasil diperbarui!`);
      } else {
        showFeedback('Gagal memperbarui kamar', 'error');
      }
    } else {
      // Create
      const created = await createRoom(preparedRoom);
      if (created) {
        showFeedback(`Kamar "${preparedRoom.name}" berhasil ditambahkan!`);
      } else {
        showFeedback('Gagal menambahkan kamar baru', 'error');
      }
    }

    setIsRoomDetailEditorOpen(false);
    setIsRoomModalOpen(false);
    setEditingRoom(null);
    await loadAllData();
    onDataChanged();
  };

  const handleConfirmDeleteRoom = async () => {
    if (!roomToDelete || isDeletingRoom) return;
    setIsDeletingRoom(true);
    try {
      const target = roomToDelete;
      const success = await deleteRoom(target.id);
      if (success) {
        setRooms((prev) => prev.filter((r) => r.id !== target.id));
        setRoomToDelete(null);
        showFeedback(`Kamar "${target.name}" berhasil dihapus`);
        await loadAllData();
        onDataChanged();
      } else {
        showFeedback(`Gagal menghapus kamar "${target.name}"`, 'error');
      }
    } finally {
      setIsDeletingRoom(false);
    }
  };

  // ==========================================
  // ROOM CATEGORY CRUD (PERSISTED IN BACKEND DB)
  // ==========================================
  const saveCategories = async (updated: RoomCategoryItem[]): Promise<boolean> => {
    const ok = await syncCategoriesToServer(updated);
    if (ok) {
      setCategories(updated);
      window.dispatchEvent(new CustomEvent('chevilly-categories-updated', { detail: updated }));
    }
    return ok;
  };

  const handleOpenAddCategory = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      label: '',
      name: '',
      kicker: 'Akomodasi Pilihan di Ketinggian Chevilly',
      desc: '',
      area: '40 m²',
      capacity: '2 Dewasa',
      bedType: '1 King Bed',
      priceSunThursIdr: 850000,
      priceFridayIdr: 1050000,
      priceSaturdayIdr: 1350000,
      priceIdr: 850000,
      priceUsd: 55,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: RoomCategoryItem) => {
    setEditingCategory({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.label.trim()) return;

    const trimmedId = (editingCategory.id || editingCategory.label)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-');
    const preparedCategory: RoomCategoryItem = {
      ...editingCategory,
      id: trimmedId,
      label: editingCategory.label.trim(),
      name: (editingCategory.name || editingCategory.label).trim(),
      priceIdr: editingCategory.priceSunThursIdr || editingCategory.priceIdr || 850000,
    };

    const existsIndex = categories.findIndex((c) => c.id === preparedCategory.id);
    let updated: RoomCategoryItem[];
    if (existsIndex >= 0) {
      updated = [...categories];
      const oldCat = categories[existsIndex];
      updated[existsIndex] = preparedCategory;

      // If id or label changed, update any existing rooms under this category
      if (oldCat.id !== preparedCategory.id || oldCat.label !== preparedCategory.label) {
        const roomsToUpdate = rooms.filter(
          (r) =>
            (r.category || '').toLowerCase() === oldCat.id.toLowerCase() ||
            (r.category || '').toLowerCase() === oldCat.label.toLowerCase()
        );
        for (const r of roomsToUpdate) {
          await updateRoom(r.id, { ...r, category: preparedCategory.id });
        }
      }
    } else {
      updated = [...categories, preparedCategory];
    }

    const ok = await saveCategories(updated);
    if (ok) {
      showFeedback(
        existsIndex >= 0
          ? `Kategori "${preparedCategory.label}" berhasil diperbarui di database!`
          : `Kategori baru "${preparedCategory.label}" berhasil disimpan ke database!`
      );
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menyimpan kategori ke database', 'error');
    }
  };

  const handleDeleteCategory = (cat: RoomCategoryItem) => {
    // Open in-app confirmation modal with exact text " Yakin akan menghapus data ini "
    setCategoryToDelete(cat);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const cat = categoryToDelete;
    const updated = categories.filter((c) => c.id !== cat.id);
    const ok = await saveCategories(updated);
    if (ok) {
      showFeedback(`Kategori "${cat.label}" berhasil dihapus dari database.`);
      setCategoryToDelete(null);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menghapus kategori dari database', 'error');
    }
  };

  // ==========================================
  // TOUR / WAHANA CRUD
  // ==========================================
  const handleOpenAddTour = () => {
    setEditingTour({
      id: `tour-${Date.now()}`,
      name: '',
      kicker: 'Wahana Wisata Seru Chevilly',
      category: 'wahana',
      priceIdr: 35000,
      priceUsd: 2.5,
      duration: 'Bebas Eksplorasi (08:00 - 17:00 WIB)',
      difficulty: 'Santai',
      altitude: '2.450 mdpl',
      rating: 4.96,
      reviewsCount: 150,
      image: '/src/assets/images/waterpark_chevilly_1794289440273.jpg',
      gallery: ['/src/assets/images/waterpark_chevilly_1794289440273.jpg'],
      departureTimes: ['08:00 - 17:00 WIB (Setiap Hari)'],
      inclusions: ['Akses seluruh area wahana', 'Fasilitas keselamatan standar'],
      equipmentProvided: ['Perlengkapan keselamatan standar', 'Peta panduan area wahana'],
      description: 'Wahana rekreasi seru ramah keluarga di tengah sejuknya udara pegunungan Chevilly.',
      guideType: 'Petugas Pengawas & Ranger Siaga',
      safetyNote: 'Setiap pemandu dilengkapi sistem komunikasi standar resort, pertolongan pertama P3K, dan pengawasan area wahana yang terverifikasi.',
    });
    setIsTourModalOpen(true);
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour || !editingTour.name?.trim()) return;

    const rawGallery = Array.isArray(editingTour.gallery)
      ? editingTour.gallery.map((g) => (g || '').trim())
      : [editingTour.image || ''];
    const cleanedGallery = rawGallery.filter(Boolean);
    const preparedTour: Partial<TourExperience> = {
      ...editingTour,
      image: editingTour.image || cleanedGallery[0] || '/src/assets/images/waterpark_chevilly_1794289440273.jpg',
      gallery:
        cleanedGallery.length > 0
          ? cleanedGallery
          : editingTour.image
          ? [editingTour.image]
          : [],
      departureTimes: Array.isArray(editingTour.departureTimes)
        ? editingTour.departureTimes.map((d) => d.trim()).filter(Boolean)
        : [],
      inclusions: Array.isArray(editingTour.inclusions)
        ? editingTour.inclusions.map((inc) => inc.trim()).filter(Boolean)
        : [],
      equipmentProvided: Array.isArray(editingTour.equipmentProvided)
        ? editingTour.equipmentProvided.map((eq) => eq.trim()).filter(Boolean)
        : [],
    };

    if (tours.some((t) => t.id === preparedTour.id)) {
      // Update
      const success = await updateTour(preparedTour.id!, preparedTour);
      if (success) {
        showFeedback(`Wahana "${preparedTour.name}" berhasil diperbarui!`);
      } else {
        showFeedback('Gagal memperbarui wahana', 'error');
      }
    } else {
      // Create
      const created = await createTour(preparedTour);
      if (created) {
        showFeedback(`Wahana "${preparedTour.name}" berhasil ditambahkan!`);
      } else {
        showFeedback('Gagal menambahkan wahana baru', 'error');
      }
    }

    setIsTourDetailEditorOpen(false);
    setIsTourModalOpen(false);
    setEditingTour(null);
    await loadAllData();
    onDataChanged();
  };

  const handleDeleteTour = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus wahana "${name}"?`)) return;
    const success = await deleteTour(id);
    if (success) {
      showFeedback(`Wahana "${name}" berhasil dihapus`);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menghapus wahana', 'error');
    }
  };

  // ==========================================
  // MAP LOCATIONS (PETA KAWASAN) CRUD
  // ==========================================
  const handleOpenAddMapLocation = () => {
    setEditingMapLocation({
      id: `loc-${Date.now()}`,
      number: `${mapLocations.length + 1}`,
      name: '',
      category: 'wahana',
      categoryLabel: 'Wahana & Wisata',
      description: '',
      image: '',
      images: [],
      tagline: '',
      features: [],
      videoPoster: '',
      videoUrl: '',
      videoEmbed: '',
      hours: '08:00 - 17:00 WIB',
      priceNote: '',
    });
    setIsMapDetailEditorOpen(false);
    setMapDetailPreviewActivePhoto(0);
    setIsMapLocationModalOpen(true);
  };

  const handleOpenEditMapLocation = (loc: MapLocation) => {
    const resolved = getLocationDetails(loc);
    setEditingMapLocation({
      ...loc,
      images: loc.images && loc.images.length > 0 ? [...loc.images] : [...resolved.images],
      tagline: loc.tagline || resolved.tagline,
      hours: loc.hours || resolved.hours,
      priceNote: loc.priceNote || resolved.priceNote,
      features: loc.features && loc.features.length > 0 ? [...loc.features] : [...resolved.features],
      videoPoster: loc.videoPoster || resolved.videoPoster,
    });
    setIsMapDetailEditorOpen(false);
    setMapDetailPreviewActivePhoto(0);
    setIsMapLocationModalOpen(true);
  };

  const updateMapLocationImageSlot = (slotIndex: number, url: string) => {
    setEditingMapLocation((prev) => {
      if (!prev) return prev;
      const baseGallery =
        prev.images && prev.images.length > 0
          ? [...prev.images]
          : prev.image
          ? [prev.image]
          : [];
      while (baseGallery.length < 3) {
        baseGallery.push('');
      }
      baseGallery[slotIndex] = url;
      const nextPrimary = slotIndex === 0 ? url : prev.image || baseGallery[0] || '';
      return {
        ...prev,
        image: nextPrimary,
        images: baseGallery,
      };
    });
  };

  const handleMapLocationGallerySlotUpload = async (slotIndex: number, file: File) => {
    if (!file) return;
    setUploadingMapGallerySlot(slotIndex);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadImage(dataUrl, file.name);
      const uploadedUrl = res.url || dataUrl;
      updateMapLocationImageSlot(slotIndex, uploadedUrl);
      setMapDetailPreviewActivePhoto(slotIndex);
      showFeedback(`Foto Popup Detail #${slotIndex + 1} berhasil diunggah!`);
    } catch {
      showFeedback('Gagal memuat foto popup detail', 'error');
    } finally {
      setUploadingMapGallerySlot(null);
    }
  };

  const handleSaveMapLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMapLocation || !editingMapLocation.name?.trim()) return;

    const categoryLabels: Record<string, string> = {
      wahana: 'Wahana & Wisata',
      villa: 'Vila & Penginapan',
      kuliner: 'Restoran & Kuliner',
      meeting: 'Meeting & Event',
      fasilitas: 'Fasilitas Umum',
    };

    const rawImages = Array.isArray(editingMapLocation.images) ? editingMapLocation.images : [];
    const cleanedImages = rawImages.map((u) => (u || '').trim()).filter(Boolean);
    const primaryImage = (editingMapLocation.image || '').trim() || cleanedImages[0] || '';
    const finalImages =
      cleanedImages.length > 0
        ? primaryImage && cleanedImages[0] !== primaryImage
          ? [primaryImage, ...cleanedImages.filter((u) => u !== primaryImage)]
          : cleanedImages
        : primaryImage
        ? [primaryImage]
        : undefined;

    const cleanedFeatures = Array.isArray(editingMapLocation.features)
      ? editingMapLocation.features.map((f) => f.trim()).filter(Boolean)
      : undefined;

    const prepared: MapLocation = {
      id: editingMapLocation.id || `loc-${Date.now()}`,
      number: String(editingMapLocation.number || mapLocations.length + 1),
      name: editingMapLocation.name.trim(),
      category: (editingMapLocation.category as any) || 'wahana',
      categoryLabel: categoryLabels[editingMapLocation.category || 'wahana'] || 'Kawasan',
      description: editingMapLocation.description || '',
      image: primaryImage,
      images: finalImages,
      tagline: editingMapLocation.tagline?.trim() || undefined,
      features: cleanedFeatures && cleanedFeatures.length > 0 ? cleanedFeatures : undefined,
      videoPoster: editingMapLocation.videoPoster?.trim() || undefined,
      videoUrl: editingMapLocation.videoUrl || '',
      videoEmbed: editingMapLocation.videoEmbed || '',
      hours: editingMapLocation.hours || '08:00 - 17:00 WIB',
      priceNote: editingMapLocation.priceNote || '',
      showName: editingMapLocation.showName,
      showDescription: editingMapLocation.showDescription,
      showHours: editingMapLocation.showHours,
      showPrice: editingMapLocation.showPrice,
    };

    const existsIdx = mapLocations.findIndex((l) => String(l.id) === String(prepared.id));
    let updated: MapLocation[];
    if (existsIdx >= 0) {
      updated = [...mapLocations];
      updated[existsIdx] = prepared;
    } else {
      updated = [...mapLocations, prepared];
    }

    const ok = await saveMapLocationsToServer(updated);
    if (ok) {
      setMapLocations(updated);
      saveStoredMapLocations(updated);
      showFeedback(
        existsIdx >= 0
          ? `Titik kawasan "${prepared.name}" berhasil disimpan ke database!`
          : `Titik kawasan baru "${prepared.name}" berhasil ditambahkan ke database!`
      );
      setIsMapDetailEditorOpen(false);
      setIsMapLocationModalOpen(false);
      setEditingMapLocation(null);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menyimpan titik kawasan ke database', 'error');
    }
  };

  const handleDeleteMapLocation = async (loc: MapLocation) => {
    if (!window.confirm(`Yakin ingin menghapus titik kawasan "${loc.name}" (Nomor ${loc.number})?`)) return;
    const updated = mapLocations.filter((l) => String(l.id) !== String(loc.id));
    const ok = await saveMapLocationsToServer(updated);
    if (ok) {
      setMapLocations(updated);
      saveStoredMapLocations(updated);
      showFeedback(`Titik kawasan "${loc.name}" berhasil dihapus dari database`);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menghapus titik kawasan dari database', 'error');
    }
  };

  const handleMapLocationImageUpload = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const prevTempUrl =
        editingMapLocation?.image && editingMapLocation.image.startsWith('/uploads/')
          ? editingMapLocation.image
          : undefined;
      const res = await uploadImage(dataUrl, file.name, prevTempUrl);
      const uploadedUrl = res.url || dataUrl;
      updateMapLocationImageSlot(0, uploadedUrl);
      showFeedback('Foto titik kawasan berhasil dimuat! Klik Simpan untuk menyimpan ke database.');
    } catch {
      showFeedback('Gagal memuat foto', 'error');
    }
  };

  // ==========================================
  // RESTO, MEETING & WEDDING CRUD & WHATSAPP (PERSISTED IN BACKEND DB)
  // ==========================================
  const getBdeWhatsappUrl = (item: VenueItem) => {
    const bdePhone = (resortInfo?.whatsapp || '6285934544901').replace(/[^0-9]/g, '');
    const bdeName = resortInfo?.bdeName || 'BDE DEFIT';
    const text = `Halo ${bdeName} (Chevilly Resort & Camp), saya ingin konsultasi dan reservasi untuk:\n\n• Venue / Paket: ${item.name}\n• Kategori: ${item.categoryLabel || item.category.toUpperCase()}\n• Kapasitas: ${item.capacity || '-'}\n• Estimasi Tarif / Harga: ${item.priceNote || '-'}\n• Jam Operasional: ${item.hours || '-'}\n\nMohon informasi ketersediaan jadwal, penawaran harga terbaik, dan brosur lengkapnya. Terima kasih!`;
    return `https://wa.me/${bdePhone}?text=${encodeURIComponent(text)}`;
  };

  const handleOpenAddVenue = () => {
    setEditingVenue({
      id: `venue-${Date.now()}`,
      name: '',
      category: 'resto',
      categoryLabel: 'Resto & Cafe',
      capacity: '100 Kursi',
      hours: '08:00 - 22:00 WIB',
      priceNote: '',
      description: '',
      image: '',
      features: [],
    });
    setIsVenueModalOpen(true);
  };

  const handleOpenEditVenue = (item: VenueItem) => {
    setEditingVenue({ ...item });
    setIsVenueModalOpen(true);
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue || !editingVenue.name?.trim()) return;

    const categoryLabels: Record<string, string> = {
      resto: 'Resto & Cafe',
      meeting: 'Meeting Room',
      wedding: 'Wedding & Social',
    };

    const prepared: VenueItem = {
      id: editingVenue.id || `venue-${Date.now()}`,
      name: editingVenue.name.trim(),
      category: (editingVenue.category as any) || 'resto',
      categoryLabel: categoryLabels[editingVenue.category || 'resto'] || 'Venue',
      capacity: editingVenue.capacity || '-',
      hours: editingVenue.hours || '08:00 - 22:00 WIB',
      priceNote: editingVenue.priceNote || '-',
      description: editingVenue.description || '',
      image: editingVenue.image || '',
      features: editingVenue.features || [],
      showName: editingVenue.showName,
      showDescription: editingVenue.showDescription,
      showPrice: editingVenue.showPrice,
      showHours: editingVenue.showHours,
      showCapacity: editingVenue.showCapacity,
    };

    const existsIdx = venueItems.findIndex((v) => v.id === prepared.id);
    let updated: VenueItem[];
    if (existsIdx >= 0) {
      updated = [...venueItems];
      updated[existsIdx] = prepared;
    } else {
      updated = [prepared, ...venueItems];
    }

    const ok = await saveVenuesToServer(updated);
    if (ok) {
      setVenueItems(updated);
      saveStoredVenues(updated);
      showFeedback(
        existsIdx >= 0
          ? `"${prepared.name}" berhasil diperbarui di database!`
          : `"${prepared.name}" berhasil disimpan ke database!`
      );
      setIsVenueModalOpen(false);
      setEditingVenue(null);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menyimpan data venue ke database', 'error');
    }
  };

  const handleDeleteVenue = async (item: VenueItem) => {
    if (!window.confirm(`Yakin ingin menghapus "${item.name}"?`)) return;
    const updated = venueItems.filter((v) => v.id !== item.id);
    const ok = await saveVenuesToServer(updated);
    if (ok) {
      setVenueItems(updated);
      saveStoredVenues(updated);
      showFeedback(`"${item.name}" berhasil dihapus dari database`);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menghapus venue dari database', 'error');
    }
  };

  const handleVenueImageUpload = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const prevTempUrl =
        editingVenue?.image && editingVenue.image.startsWith('/uploads/')
          ? editingVenue.image
          : undefined;
      const res = await uploadImage(dataUrl, file.name, prevTempUrl);
      const uploadedUrl = res.url || dataUrl;
      setEditingVenue((prev) => (prev ? { ...prev, image: uploadedUrl } : prev));
      showFeedback('Foto venue berhasil diunggah ke server!');
    } catch {
      showFeedback('Gagal memuat foto', 'error');
    }
  };

  // ==========================================
  // HERO VIDEOS CRUD (YouTube HD Carousel — PERSISTED IN BACKEND DB)
  // ==========================================
  const handleOpenAddHeroVideo = () => {
    setEditingHeroVideo({
      id: `hero-vid-${Date.now()}`,
      title: '',
      youtubeUrl: '',
      badge: 'Full Tour HD 1080p',
      duration: 'Full Tour',
      description: '',
      isActive: true,
      showTitle: true,
      showDescription: true,
      showBadge: true,
      showDuration: true,
    });
    setIsHeroVideoModalOpen(true);
  };

  const handleOpenEditHeroVideo = (vid: HeroVideoItem) => {
    setEditingHeroVideo({
      ...vid,
      showTitle: vid.showTitle !== false,
      showDescription: vid.showDescription !== false,
      showBadge: vid.showBadge !== false,
      showDuration: vid.showDuration !== false,
    });
    setIsHeroVideoModalOpen(true);
  };

  const handleSaveHeroVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHeroVideo || !editingHeroVideo.title?.trim() || !editingHeroVideo.youtubeUrl?.trim()) {
      showFeedback('Mohon isi judul dan link video YouTube / embed', 'error');
      return;
    }

    const prepared: HeroVideoItem = {
      id: editingHeroVideo.id || `hero-vid-${Date.now()}`,
      title: editingHeroVideo.title.trim(),
      youtubeUrl: editingHeroVideo.youtubeUrl.trim(),
      badge: editingHeroVideo.badge || 'HD 1080p',
      duration: editingHeroVideo.duration || 'Short Highlight',
      description: editingHeroVideo.description || '',
      isActive: editingHeroVideo.isActive !== false,
      thumbnail: editingHeroVideo.thumbnail || '',
      showTitle: editingHeroVideo.showTitle !== false,
      showDescription: editingHeroVideo.showDescription !== false,
      showBadge: editingHeroVideo.showBadge !== false,
      showDuration: editingHeroVideo.showDuration !== false,
    };

    const existsIdx = heroVideos.findIndex((v) => v.id === prepared.id);
    let updated: HeroVideoItem[];
    if (existsIdx >= 0) {
      updated = [...heroVideos];
      updated[existsIdx] = prepared;
    } else {
      updated = [prepared, ...heroVideos];
    }

    const ok = await saveHeroVideosToServer(updated);
    if (ok) {
      setHeroVideos(updated);
      saveStoredHeroVideos(updated);
      showFeedback(
        existsIdx >= 0
          ? `Video "${prepared.title}" berhasil disimpan ke database!`
          : `Video "${prepared.title}" berhasil ditambahkan ke database!`
      );
      setIsHeroVideoModalOpen(false);
      setEditingHeroVideo(null);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menyimpan video hero ke database', 'error');
    }
  };

  const handleToggleHeroVideoActive = async (vid: HeroVideoItem) => {
    const updated = heroVideos.map((v) =>
      v.id === vid.id ? { ...v, isActive: !v.isActive } : v
    );
    const ok = await saveHeroVideosToServer(updated);
    if (ok) {
      setHeroVideos(updated);
      saveStoredHeroVideos(updated);
      showFeedback(`Status video "${vid.title}" diperbarui di database.`);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal mengubah status video di database', 'error');
    }
  };

  const handleConfirmDeleteHeroVideo = async () => {
    if (!heroVideoToDelete) return;
    const vid = heroVideoToDelete;
    const updated = heroVideos.filter((v) => v.id !== vid.id);
    const ok = await saveHeroVideosToServer(updated);
    if (ok) {
      setHeroVideos(updated);
      saveStoredHeroVideos(updated);
      showFeedback(`Video "${vid.title}" berhasil dihapus dari database.`);
      setHeroVideoToDelete(null);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menghapus video dari database', 'error');
    }
  };

  // ==========================================
  // FASILITAS & LAYANAN TAMBAHAN CRUD
  // ==========================================
  const handleOpenAddAddOn = () => {
    setEditingAddOn({
      id: `addon-${Date.now()}`,
      name: '',
      description: '',
      priceIdr: 500000,
      priceUsd: Math.max(1, Math.round(500000 / usdExchangeRate)),
      unit: 'per paket',
      isActive: true,
      showName: true,
      showDescription: true,
      showPrice: true,
      showUnit: true,
    });
    setIsAddOnModalOpen(true);
  };

  const handleOpenEditAddOn = (addon: BookingAddOn) => {
    setEditingAddOn({
      ...addon,
      isActive: addon.isActive !== false,
      showName: addon.showName !== false,
      showDescription: addon.showDescription !== false,
      showPrice: addon.showPrice !== false,
      showUnit: addon.showUnit !== false,
    });
    setIsAddOnModalOpen(true);
  };

  const handleSaveAddOn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddOn) return;

    const cleanName = (editingAddOn.name || '').trim();
    if (!cleanName) {
      showFeedback('Nama layanan tambahan wajib diisi!', 'error');
      return;
    }

    const prepared: BookingAddOn = {
      id: editingAddOn.id || `addon-${Date.now()}`,
      name: cleanName,
      description: (editingAddOn.description || '').trim() || 'Fasilitas & layanan tambahan eksklusif Chevilly.',
      priceIdr: Number(editingAddOn.priceIdr) || 0,
      priceUsd: Number(editingAddOn.priceUsd) || 0,
      unit: (editingAddOn.unit || '').trim() || 'per paket',
      isActive: editingAddOn.isActive !== false,
      showName: editingAddOn.showName !== false,
      showDescription: editingAddOn.showDescription !== false,
      showPrice: editingAddOn.showPrice !== false,
      showUnit: editingAddOn.showUnit !== false,
    };

    const isExisting = addOns.some((a) => a.id === prepared.id);
    if (isExisting) {
      const ok = await updateAddOn(prepared.id, prepared);
      if (ok) {
        showFeedback(`Layanan "${prepared.name}" berhasil diperbarui di database!`);
      } else {
        showFeedback('Gagal memperbarui layanan di database', 'error');
        return;
      }
    } else {
      const created = await createAddOn(prepared);
      if (created) {
        showFeedback(`Layanan "${created.name}" berhasil disimpan ke database!`);
      } else {
        showFeedback('Gagal menambahkan layanan ke database', 'error');
        return;
      }
    }

    setIsAddOnModalOpen(false);
    setEditingAddOn(null);
    await loadAllData();
    onDataChanged();
  };

  const handleToggleAddOnActive = async (addon: BookingAddOn) => {
    const nextActive = addon.isActive === false;
    const ok = await updateAddOn(addon.id, { isActive: nextActive });
    if (ok) {
      showFeedback(
        `Layanan "${addon.name}" ${nextActive ? 'diaktifkan' : 'dinonaktifkan'} di database.`
      );
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal memperbarui status layanan di database', 'error');
    }
  };

  const handleConfirmDeleteAddOn = async () => {
    if (!addOnToDelete) return;
    const target = addOnToDelete;
    const ok = await deleteAddOn(target.id);
    if (ok) {
      setAddOnToDelete(null);
      showFeedback(`Layanan "${target.name}" berhasil dihapus dari database.`);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menghapus layanan dari database', 'error');
    }
  };

  // ==========================================
  // ULASAN PARA PENJELAJAH & TAMU KEHORMATAN CRUD (PERSISTED IN BACKEND DB)
  // ==========================================
  const handleOpenAddReview = () => {
    setEditingReview({
      id: `rev-${Date.now()}`,
      authorName: '',
      authorRole: '',
      quote: '',
      rating: 5,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    });
    setIsReviewModalOpen(true);
  };

  const handleOpenEditReview = (review: GuestReview) => {
    setEditingReview({
      ...review,
      rating: review.rating ?? 5,
      isActive: review.isActive !== false,
    });
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    const cleanAuthor = (editingReview.authorName || '').trim();
    const cleanQuote = (editingReview.quote || '').trim();
    if (!cleanAuthor || !cleanQuote) {
      showFeedback('Nama tamu dan isi ulasan wajib diisi!', 'error');
      return;
    }

    const prepared: GuestReview = {
      id: editingReview.id || `rev-${Date.now()}`,
      authorName: cleanAuthor,
      authorRole: (editingReview.authorRole || '').trim() || 'Tamu Chevilly Resort & Camp',
      quote: cleanQuote,
      rating: Math.min(5, Math.max(1, Number(editingReview.rating) || 5)),
      isActive: editingReview.isActive !== false,
      createdAt: editingReview.createdAt || new Date().toISOString().split('T')[0],
    };

    const isExisting = reviews.some((r) => r.id === prepared.id);
    if (isExisting) {
      const ok = await updateReview(prepared.id, prepared);
      if (ok) {
        showFeedback(`Ulasan dari "${prepared.authorName}" berhasil diperbarui di database!`);
      } else {
        showFeedback('Gagal memperbarui ulasan di database', 'error');
        return;
      }
    } else {
      const created = await createReview(prepared);
      if (created) {
        showFeedback(`Ulasan baru dari "${created.authorName}" berhasil disimpan ke database!`);
      } else {
        showFeedback('Gagal menambahkan ulasan ke database', 'error');
        return;
      }
    }

    setIsReviewModalOpen(false);
    setEditingReview(null);
    await loadAllData();
    onDataChanged();
  };

  const handleToggleReviewActive = async (review: GuestReview) => {
    const nextActive = review.isActive === false;
    const ok = await updateReview(review.id, { isActive: nextActive });
    if (ok) {
      showFeedback(
        `Ulasan "${review.authorName}" ${nextActive ? 'ditampilkan' : 'disembunyikan'} di database.`
      );
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal memperbarui status ulasan di database', 'error');
    }
  };

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    const target = reviewToDelete;
    const ok = await deleteReview(target.id);
    if (ok) {
      setReviewToDelete(null);
      showFeedback(`Ulasan dari "${target.authorName}" berhasil dihapus dari database.`);
      await loadAllData();
      onDataChanged();
    } else {
      showFeedback('Gagal menghapus ulasan dari database', 'error');
    }
  };

  // ==========================================
  // RESORT SETTINGS & BDE UPDATE
  // ==========================================
  const handleSaveResortInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resortInfo) return;
    const success = await updateResortInfo(resortInfo);
    if (success) {
      showFeedback('Pengaturan Resor & Kontak BDE berhasil disimpan!');
      onDataChanged();
    } else {
      showFeedback('Gagal menyimpan pengaturan', 'error');
    }
  };

  // ==========================================
  // FACILITIES UPDATE (Wellness, Dining, Meeting)
  // ==========================================
  const handleSaveFacility = async (key: 'wellness' | 'dining' | 'meeting') => {
    if (!facilities || !facilities[key]) return;
    const success = await updateFacility(key, facilities[key]);
    if (success) {
      showFeedback(`Bagian ${key.toUpperCase()} berhasil diperbarui!`);
      onDataChanged();
    } else {
      showFeedback(`Gagal memperbarui ${key}`, 'error');
    }
  };

  // ==========================================
  // RESERVATION STATUS UPDATE
  // ==========================================
  const handleUpdateReservationStatus = async (id: string, newStatus: string) => {
    const success = await updateReservation(id, { status: newStatus as any });
    if (success) {
      showFeedback(`Status reservasi diubah menjadi "${newStatus}"`);
      await loadAllData();
      onDataChanged();
    }
  };

  const normalizeWhatsAppNumber = (rawPhone?: string): string => {
    const digits = (rawPhone || '').replace(/[^0-9]/g, '');
    if (!digits) return '';
    if (digits.startsWith('0')) return `62${digits.slice(1)}`;
    if (digits.startsWith('62')) return digits;
    if (digits.startsWith('8')) return `62${digits}`;
    return digits;
  };

  const buildGuestWhatsAppUrl = (res: Reservation): string => {
    const guestPhoneWa = normalizeWhatsAppNumber(res.guestPhone);
    const senderNumber = '+62 859-3454-4901';

    let msg = `*CHEVILLY RESORT AND CAMP*\n`;
    msg += `*Detail Pesanan Reservasi Anda*\n`;
    msg += `─────────────────────────\n`;
    msg += `Halo Bapak/Ibu *${res.guestName}*,\n`;
    msg += `Saya Defit (Business Development Executive) Chevilly Resort & Camp menginformasikan rincian pesanan Anda sbb:\n\n`;
    msg += `🏷️ *Kode Booking:* ${res.bookingCode}\n`;
    msg += `📌 *Status:* ${res.status || 'Konfirmasi'}\n`;

    if (res.room) {
      msg += `🏡 *Akomodasi:* ${res.room.name}\n`;
      msg += `📅 *Check-In:* ${formatDateIndonesian(res.room.checkIn)} (15:00 WIB)\n`;
      msg += `📅 *Check-Out:* ${formatDateIndonesian(res.room.checkOut)} (12:00 WIB)\n`;
      msg += `🌙 *Durasi & Tamu:* ${res.room.nights} Malam · ${res.room.adults} Dewasa${res.room.children ? `, ${res.room.children} Anak` : ''}\n`;
    }

    if (res.tours && res.tours.length > 0) {
      msg += `🌲 *Paket Wisata:*\n`;
      res.tours.forEach((t) => {
        msg += `   • ${t.name} (${t.participants} Orang${t.timeSlot ? ` · ${t.timeSlot}` : ''})\n`;
      });
    }

    if (res.selectedAddOns && res.selectedAddOns.length > 0) {
      msg += `✨ *Fasilitas Tambahan:*\n`;
      res.selectedAddOns.forEach((a) => {
        msg += `   • ${a.name} (${a.quantity}x)\n`;
      });
    }

    if (res.specialRequests) {
      msg += `📝 *Permintaan Khusus:* ${res.specialRequests}\n`;
    }

    msg += `💳 *Metode Pembayaran:* ${res.paymentMethod || 'Transfer Bank BCA'}\n`;
    msg += `💰 *Total Biaya:* ${formatPrice(res.totalPriceIdr, res.totalPriceUsd, res.currency)}\n`;
    msg += `─────────────────────────\n`;
    msg += `Balas pesan ini atau hubungi WhatsApp resmi kami di *${senderNumber}* jika ada pertanyaan lebih lanjut. Terima kasih! 🙏`;

    return `https://wa.me/${guestPhoneWa}?text=${encodeURIComponent(msg)}`;
  };

  const handleConfirmDeleteReservation = async () => {
    if (!reservationToDelete || isDeletingReservation) return;
    setIsDeletingReservation(true);
    try {
      const target = reservationToDelete;
      const success = await deleteReservation(target.id);
      if (success) {
        setReservations((prev) => prev.filter((r) => r.id !== target.id));
        setReservationToDelete(null);
        showFeedback(`Reservasi ${target.bookingCode} berhasil dihapus.`);
        await loadAllData();
        onDataChanged();
      } else {
        showFeedback(`Gagal menghapus reservasi ${target.bookingCode} dari server.`, 'error');
      }
    } finally {
      setIsDeletingReservation(false);
    }
  };

  if (!isOpen) return null;

  // ==========================================
  // ADMIN AUTHENTICATION GUARD (LOGIN REQUIRED)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#101b17] border border-[#d4af37]/60 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden text-[#f7f5ef] relative">
          
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#cfab60] via-[#fae7b3] to-[#cfab60]" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#eed492] hover:text-white transition-colors cursor-pointer"
            title="Tutup & Kembali"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Header */}
          <div className="p-7 pb-4 text-center border-b border-[#d4af37]/20 bg-gradient-to-b from-[#182a24] to-[#101b17]">
            <div className="flex justify-center mb-3">
              <img
                src="/assets/aistudio/LOGO_KUNING_2_7dfae9a0.png"
                alt="Chevilly Resort and Camp"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_2px_14px_rgba(212,175,55,0.45)]"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#eed492] text-[11px] font-mono uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Otentikasi Pengelola Resor</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
              Login Portal Admin CMS
            </h2>
            <p className="text-xs text-[#a8b8b0] mt-1">
              Harap masuk untuk mengelola konten halaman beranda, atraksi, dan reservasi tamu
            </p>
          </div>

          {/* Login Form Body */}
          <form onSubmit={handleAdminLogin} className="p-7 space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#eed492] block">
                Username atau Email BDE
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin atau defitchevilly@gmail.com"
                  required
                  className="w-full bg-[#0a1210] border border-[#d4af37]/40 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                />
                <UserCheck className="w-4 h-4 text-[#eed492]/60 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#eed492] block">
                  Kata Sandi Keamanan
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#a8b8b0] hover:text-[#eed492] flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan kata sandi admin"
                  required
                  className="w-full bg-[#0a1210] border border-[#d4af37]/40 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                />
                <KeyRound className="w-4 h-4 text-[#eed492]/60 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-[#cfab60] via-[#eed492] to-[#cfab60] hover:from-[#eed492] hover:via-[#fff1c7] hover:to-[#eed492] text-[#0d1613] font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{loginLoading ? 'Memverifikasi...' : 'Masuk ke Portal Admin'}</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#a8b8b0] hover:text-[#eed492] transition-colors cursor-pointer"
              >
                ← Kembali ke Website Beranda
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#fcfbf9] border-2 border-[#182a24] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-[#182a24]">
        
        {/* Top Header Bar */}
        <div className="bg-[#182a24] text-[#f7f5ef] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#d4af37]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#d4af37] text-[#0d1613] flex items-center justify-center font-bold font-serif text-lg shadow-md">
              CMS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
                  Portal Admin & Backend CRUD System
                </h2>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded">
                  REST API Active :3000
                </span>
              </div>
              <div className="text-xs text-[#eed492]">
                Chevilly Resort and Camp · Kontrol Data Halaman Index Real-Time
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Profile Pill */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#eed492] text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{adminUser?.name || 'BDE : DEFIT'}</span>
            </span>

            <button
              onClick={() => {
                onClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 bg-[#d4af37] hover:bg-[#fae7b3] text-[#0d1613] text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Lihat Halaman Index Live"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Halaman Beranda</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              title="Keluar dari Akun Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#eed492] hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup Portal Admin"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedback && (
          <div className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between transition-all ${
            feedback.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-300' : 'bg-red-100 text-red-900 border-b border-red-300'
          }`}>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-xs font-bold">×</button>
          </div>
        )}

        {/* Quick Link Info Ribbon */}
        <div className="bg-[#f0ece1] px-6 py-2 border-b border-[#ded7cb] flex flex-wrap items-center justify-between text-xs text-[#52645c] gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#967d58] font-bold">Tautan Akses:</span>
            <span className="bg-white px-2 py-0.5 border border-[#ded7cb] text-[#182a24]">
              Beranda Publik: <strong className="text-emerald-800">/</strong>
            </span>
            <span className="bg-white px-2 py-0.5 border border-[#ded7cb] text-[#182a24]">
              Portal Admin CMS: <strong className="text-[#967d58]">/#admin</strong>
            </span>
          </div>
          <div className="text-[11px] text-[#73837b]">
            Perubahan yang disimpan di sini otomatis tampil pada halaman depan (Index Page).
          </div>
        </div>

        {/* Tab Navigation Controls — Dropdown "Update Data" */}
        <div className="px-5 sm:px-6 py-3 bg-[#f4f0e6] border-b border-[#ded7cb]">
          {(() => {
            const adminMenuItems = [
              { id: 'rooms' as const, label: 'Rooms & Villas', count: rooms.length, icon: Building2 },
              { id: 'categories' as const, label: 'Kelola Kategori', count: categories.length, icon: Layers },
              { id: 'tours' as const, label: 'Explore Wisata', count: tours.length, icon: Compass },
              { id: 'fasilitas_sarana' as const, label: 'Fasilitas & Sarana', count: fasilitasSaranaItems.length, icon: Sparkles },
              { id: 'zona_prabayar' as const, label: 'Explore Zona', count: zonaPrabayarItems.length, icon: MapPin },
              { id: 'facilities' as const, label: 'Resto, Meeting & Wedding', count: venueItems.length, icon: UtensilsCrossed },
              { id: 'addons' as const, label: 'Layanan Tambahan', count: addOns.length, icon: Tag },
              { id: 'reviews' as const, label: 'Ulasan Tamu', count: reviews.length, icon: Star },
              { id: 'settings' as const, label: 'Kontak BDE & Resor', count: null, icon: Phone },
              { id: 'reservations' as const, label: 'Data Reservasi', count: reservations.length, icon: BookmarkCheck },
              { id: 'map_locations' as const, label: 'Peta Kawasan', count: mapLocations.length, icon: MapPin },
              { id: 'hero_videos' as const, label: 'Video Hero HD', count: heroVideos.length, icon: Video },
            ];
            const currentMenu = adminMenuItems.find((item) => item.id === activeTab) || adminMenuItems[0];
            const CurrentIcon = currentMenu.icon;

            return (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div ref={updateDataMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUpdateDataMenuOpen((prev) => !prev)}
                    aria-expanded={isUpdateDataMenuOpen}
                    aria-haspopup="menu"
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#182a24] hover:bg-[#233b33] text-[#f7f5ef] border border-[#182a24] text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-[#d4af37] shrink-0" />
                    <span>Update Data</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#eed492] transition-transform duration-200 ${
                        isUpdateDataMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isUpdateDataMenuOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full mt-1.5 z-50 w-[min(92vw,480px)] bg-white border border-[#182a24]/30 shadow-[0_18px_40px_rgba(24,42,36,0.22)] p-2 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="px-2.5 py-1.5 mb-1 border-b border-[#ece6da] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#73837b]">
                        <span>Pilih Modul Update Data</span>
                        <span>{adminMenuItems.length} Modul</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {adminMenuItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsUpdateDataMenuOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                                isActive
                                  ? 'bg-[#182a24] border-[#182a24] text-[#f7f5ef]'
                                  : 'bg-white hover:bg-[#f4f0e6] border-transparent hover:border-[#ded7cb] text-[#3b4e46] hover:text-[#182a24]'
                              }`}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <Icon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isActive ? 'text-[#d4af37]' : 'text-[#967d58]'
                                  }`}
                                />
                                <span className="text-xs font-semibold truncate">{item.label}</span>
                              </span>
                              {item.count !== null && (
                                <span
                                  className={`shrink-0 px-1.5 py-0.5 text-[10px] font-mono leading-none border ${
                                    isActive
                                      ? 'bg-[#d4af37]/20 text-[#fae7b3] border-[#d4af37]/40'
                                      : 'bg-[#f4f0e6] text-[#6d7c74] border-[#e4ded2]'
                                  }`}
                                >
                                  {item.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Module Indicator */}
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#ded7cb] text-xs text-[#182a24]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#73837b]">Aktif:</span>
                  <CurrentIcon className="w-3.5 h-3.5 text-[#967d58] shrink-0" />
                  <span className="font-semibold">{currentMenu.label}</span>
                  {currentMenu.count !== null && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#f4f0e6] border border-[#e4ded2] text-[#52645c] leading-none">
                      {currentMenu.count}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Main Tab Panels */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#faf9f5]">
          
          {/* TAB 1: ROOMS & VILLAS */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#182a24]">
                    Manajemen Koleksi Kamar & Villa (Index Page Section 01)
                  </h3>
                  <p className="text-xs text-[#52645c]">
                    Kelola data, foto, tarif per malam, luas m², dan fasilitas kamar yang tampil pada Koleksi Villas & Suite.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative group/add">
                    <button
                      onClick={() => handleOpenAddRoom('deluxe')}
                      className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4 text-[#d4af37]" />
                      <span>Tambah Kamar Baru</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#eed492]" />
                    </button>

                    {/* Popover / Dropdown Pilihan Kategori Kamar */}
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-[#ded7cb] shadow-2xl py-1.5 z-40 hidden group-hover/add:block animate-in fade-in max-h-80 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] uppercase font-mono text-[#967d58] border-b border-stone-100 font-bold flex items-center justify-between">
                        <span>Pilih Kategori Tambah:</span>
                        <span className="text-[9px] text-stone-400">{categories.length} Opsi</span>
                      </div>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAddRoom(cat.id);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-[#f4f1e8] hover:text-[#182a24] flex items-center justify-between cursor-pointer border-b border-stone-50 last:border-0"
                        >
                          <div>
                            <div className="font-semibold text-xs text-[#182a24]">{cat.label}</div>
                            <div className="text-[10px] text-stone-500 line-clamp-1">{cat.desc || cat.name || cat.kicker}</div>
                          </div>
                          <span className="text-[10px] text-[#967d58] font-mono font-bold shrink-0 ml-2">+ Tambah</span>
                        </button>
                      ))}
                      <div className="pt-1 border-t border-stone-100 px-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('categories');
                          }}
                          className="w-full py-1 text-center text-[10px] font-bold text-[#182a24] hover:text-[#967d58] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Layers className="w-3 h-3 text-[#967d58]" />
                          <span>Buka Menu Kelola Kategori</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs for Admin */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#ece7dc] border border-[#d8d2c4]">
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'all', label: 'Semua Kamar' },
                    ...categories.map((c) => ({ id: c.id, label: c.label })),
                    ...Array.from(new Set(rooms.map((r) => r.category).filter(Boolean)))
                      .filter(
                        (cat) =>
                          !['all', ...categories.map((c) => c.id.toLowerCase()), ...categories.map((c) => c.label.toLowerCase())].includes(
                            cat.toLowerCase()
                          )
                      )
                      .map((cat) => ({ id: cat, label: cat })),
                  ].map((c) => {
                    const isSelected =
                      adminRoomFilter.toLowerCase() === c.id.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAdminRoomFilter(c.id)}
                        className={`px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#182a24] text-[#fae7b3] shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-[#ded7cb]'
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  Menampilkan:{' '}
                  {
                    rooms.filter(
                      (r) =>
                        adminRoomFilter === 'all' ||
                        (r.category || '').toLowerCase() ===
                          adminRoomFilter.toLowerCase()
                    ).length
                  }{' '}
                  Kamar
                </div>
              </div>

              {/* Rooms Table */}
              <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                    <tr>
                      <th className="p-3">Foto &amp; Media</th>
                      <th className="p-3">Kamar / Villa</th>
                      <th className="p-3">Kategori &amp; Spec</th>
                      <th className="p-3">Tarif per Malam</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ded7cb]">
                    {rooms
                      .filter(
                        (r) =>
                          adminRoomFilter === 'all' ||
                          (r.category || '').toLowerCase() === adminRoomFilter.toLowerCase()
                      )
                      .map((room) => (
                        <tr key={room.id} className="hover:bg-[#faf9f5] align-top">
                          <td className="p-3 w-32">
                            <div className="w-24 aspect-[16/10] bg-stone-200 overflow-hidden border border-[#ded7cb] mb-1.5">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-full h-full object-cover object-center"
                              />
                            </div>
                            <label
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[10px] font-semibold cursor-pointer transition-colors"
                              title="Upload dan ganti foto kamar ini langsung dari perangkat"
                            >
                              {uploadingItemId === room.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin text-[#d4af37]" />
                              ) : (
                                <Camera className="w-3 h-3 text-[#d4af37]" />
                              )}
                              <span>{uploadingItemId === room.id ? 'Unggah...' : 'Ganti Foto'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingItemId === room.id}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleDirectRoomImageUpload(room.id, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="font-serif font-bold text-sm text-[#182a24] leading-snug">
                              {room.name}
                            </div>
                            <div className="text-[11px] text-[#967d58] font-medium mt-0.5">
                              {room.kicker}
                            </div>
                            <p className="text-[11px] text-[#52645c] line-clamp-2 mt-1">
                              {room.description}
                            </p>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="inline-block bg-[#182a24] text-[#eed492] font-mono text-[10px] uppercase px-2 py-0.5 mb-1">
                              {room.category}
                            </span>
                            <div className="text-[11px] text-[#394942] font-mono">
                              {room.area} · {room.altitude}
                            </div>
                            <div className="text-[11px] text-[#52645c]">
                              {room.capacity} · <strong>{room.totalRooms || 10} Unit</strong>
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap font-mono">
                            {(() => {
                              const sunIdr = room.priceSunThursIdr ?? room.priceIdr;
                              const friIdr = room.priceFridayIdr ?? Math.round(sunIdr * 1.25);
                              const satIdr = room.priceSaturdayIdr ?? Math.round(sunIdr * 1.55);
                              const sunUsd = idrToLiveUsd(sunIdr, usdExchangeRate);
                              const friUsd = idrToLiveUsd(friIdr, usdExchangeRate);
                              const satUsd = idrToLiveUsd(satIdr, usdExchangeRate);
                              return (
                                <>
                                  <div className="font-bold text-[#182a24]">
                                    {formatPrice(sunIdr, sunUsd, currency)}
                                    <span className="text-[10px] font-normal text-[#73837b]"> / malam</span>
                                  </div>
                                  <div className="mt-1 space-y-0.5 text-[10px] text-[#52645c]">
                                    <div>
                                      Sun-Thu:{' '}
                                      <strong>{formatPrice(sunIdr, sunUsd, 'IDR')}</strong>
                                      <span className="text-[#967d58] ml-1">(${sunUsd})</span>
                                    </div>
                                    <div>
                                      Fri:{' '}
                                      <strong>{formatPrice(friIdr, friUsd, 'IDR')}</strong>
                                      <span className="text-[#967d58] ml-1">(${friUsd})</span>
                                    </div>
                                    <div className="text-rose-800">
                                      Sat:{' '}
                                      <strong>{formatPrice(satIdr, satUsd, 'IDR')}</strong>
                                      <span className="text-[#967d58] ml-1">(${satUsd})</span>
                                    </div>
                                  </div>
                                  <div className="mt-1 text-[9px] text-[#73837b]">
                                    IDR Fix · Kurs $1 = Rp {usdExchangeRate.toLocaleString('id-ID')}
                                  </div>
                                </>
                              );
                            })()}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={async () => {
                                const newStatus = room.isAvailable === false ? true : false;
                                const updated = { ...room, isAvailable: newStatus };
                                await updateRoom(room.id, updated);
                                showFeedback(`Status kamar "${room.name}": ${newStatus ? 'Available (Tersedia)' : 'Tidak Available'}`);
                                await loadAllData();
                                onDataChanged();
                              }}
                              className={`px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border cursor-pointer flex items-center gap-1.5 transition-colors ${
                                room.isAvailable !== false
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              }`}
                              title="Klik untuk mengubah status: Available / Tidak Available"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full inline-block ${
                                  room.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                                }`}
                              />
                              <span>{room.isAvailable !== false ? 'Available' : 'Tidak Available'}</span>
                            </button>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const snapSunIdr = room.priceSunThursIdr ?? room.priceIdr ?? 0;
                                  const snapFriIdr = room.priceFridayIdr ?? Math.round(snapSunIdr * 1.25);
                                  const snapSatIdr = room.priceSaturdayIdr ?? Math.round(snapSunIdr * 1.55);
                                  setEditingRoom({
                                    ...room,
                                    priceIdr: snapSunIdr,
                                    priceSunThursIdr: snapSunIdr,
                                    priceFridayIdr: snapFriIdr,
                                    priceSaturdayIdr: snapSatIdr,
                                    priceUsd: idrToLiveUsd(snapSunIdr, usdExchangeRate),
                                    priceSunThursUsd: idrToLiveUsd(snapSunIdr, usdExchangeRate),
                                    priceFridayUsd: idrToLiveUsd(snapFriIdr, usdExchangeRate),
                                    priceSaturdayUsd: idrToLiveUsd(snapSatIdr, usdExchangeRate),
                                  });
                                  setIsRoomModalOpen(true);
                                }}
                                className="p-1.5 text-stone-700 hover:text-emerald-700 border border-[#ded7cb] hover:border-emerald-600 bg-white cursor-pointer transition-colors"
                                title="Edit Kamar"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRoomToDelete(room)}
                                className="p-1.5 text-stone-700 hover:text-red-700 hover:bg-red-50 border border-[#ded7cb] hover:border-red-600 bg-white cursor-pointer transition-colors"
                                title="Hapus Kamar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: KELOLA KATEGORI KAMAR */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#967d58]" />
                    <span>Manajemen Daftar Kategori Kamar & Tarif</span>
                  </h3>
                  <p className="text-xs text-[#52645c]">
                    Kelola nama kategori, deskripsi template, dan 3 tarif hari (Sun-Thurs, Friday, Saturday) untuk setiap kategori akomodasi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <span>Tambah Kategori Baru</span>
                </button>
              </div>

              {/* Categories Table */}
              <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                    <tr>
                      <th className="p-3 w-14">No.</th>
                      <th className="p-3">Nama Kategori</th>
                      <th className="p-3">Tarif Sun-Thu</th>
                      <th className="p-3">Tarif Friday</th>
                      <th className="p-3">Tarif Saturday</th>
                      <th className="p-3">Unit Kamar</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ded7cb]">
                    {categories.map((cat, idx) => {
                      const roomCount = rooms.filter(
                        (r) =>
                          (r.category || '').toLowerCase() === cat.id.toLowerCase() ||
                          (r.category || '').toLowerCase() === cat.label.toLowerCase()
                      ).length;

                      return (
                        <tr key={cat.id || idx} className="hover:bg-[#faf9f5]">
                          <td className="p-3 font-mono font-bold text-[#967d58]">#{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-serif text-sm font-bold text-[#182a24]">
                              {cat.label}
                            </div>
                            <div className="text-[10px] font-mono text-[#73837b]">
                              ID: {cat.id}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[#182a24] whitespace-nowrap">
                            {formatPrice(cat.priceSunThursIdr || cat.priceIdr, cat.priceUsd, currency)}
                          </td>
                          <td className="p-3 font-mono text-[#182a24] whitespace-nowrap">
                            {formatPrice(cat.priceFridayIdr || cat.priceIdr, cat.priceUsd, currency)}
                          </td>
                          <td className="p-3 font-mono font-semibold text-rose-800 whitespace-nowrap">
                            {formatPrice(cat.priceSaturdayIdr || cat.priceIdr, cat.priceUsd, currency)}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminRoomFilter(cat.id);
                                setActiveTab('rooms');
                              }}
                              className="px-2.5 py-1 bg-[#f5f2ea] hover:bg-[#e9e3d4] text-[#182a24] text-[11px] font-mono font-semibold border border-[#ded7cb] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3 h-3 text-[#967d58]" />
                              <span>{roomCount} Kamar</span>
                            </button>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCategory(cat)}
                                className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-emerald-800 border border-[#ded7cb] hover:border-emerald-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Edit Kategori Ini"
                              >
                                <Edit className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-red-700 border border-[#ded7cb] hover:border-red-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Hapus Kategori Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
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

          {/* TAB 2: EXPLORE WISATA & WAHANA */}
          {activeTab === 'tours' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#182a24]">
                    Manajemen Explore Wisata & Wahana (Index Page Section 02)
                  </h3>
                  <p className="text-xs text-[#52645c]">
                    Kelola seluruh wahana (Waterpark, Aviary, Chinatown, Colosseum, Zip Coaster, Labirin, UTV ATV, dll).
                  </p>
                </div>
                <button
                  onClick={handleOpenAddTour}
                  className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <span>Tambah Wahana Baru</span>
                </button>
              </div>

              {/* Tours Table */}
              <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                    <tr>
                      <th className="p-3">Foto &amp; Media</th>
                      <th className="p-3">Wahana Wisata</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Durasi &amp; Level</th>
                      <th className="p-3">Harga / Orang</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ded7cb]">
                    {tours.map((tour) => (
                      <tr key={tour.id} className="hover:bg-[#faf9f5] align-top">
                        <td className="p-3 w-32">
                          <div className="w-24 aspect-[4/3] bg-stone-200 overflow-hidden border border-[#ded7cb] mb-1.5">
                            <img
                              src={tour.image}
                              alt={tour.name}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                          <label
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[10px] font-semibold cursor-pointer transition-colors"
                            title="Upload dan ganti foto wahana ini langsung dari perangkat"
                          >
                            {uploadingItemId === tour.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-[#d4af37]" />
                            ) : (
                              <Camera className="w-3 h-3 text-[#d4af37]" />
                            )}
                            <span>{uploadingItemId === tour.id ? 'Unggah...' : 'Ganti Foto'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingItemId === tour.id}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleDirectTourImageUpload(tour.id, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </td>
                        <td className="p-3 max-w-sm">
                          <div className="text-[10px] text-[#967d58] font-medium uppercase">
                            {tour.kicker}
                          </div>
                          <div className="font-serif text-sm font-bold text-[#182a24] leading-snug mt-0.5">
                            {tour.name}
                          </div>
                          <p className="text-[11px] text-[#52645c] line-clamp-2 mt-1">
                            {tour.description}
                          </p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-[#f4f0e6] text-[#182a24] border border-[#ded7cb] font-mono text-[10px] uppercase">
                            {tour.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-[#182a24] font-medium">{tour.duration}</div>
                          <div className="text-[10.5px] text-[#73837b] mt-0.5">
                            Tingkat: {tour.difficulty}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                          {formatPrice(tour.priceIdr, tour.priceUsd, currency)}
                          <div className="text-[10px] font-normal text-[#73837b]">/ orang</div>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTour({ ...tour });
                                setIsTourModalOpen(true);
                              }}
                              className="p-1.5 text-stone-700 hover:text-emerald-700 border border-[#ded7cb] hover:border-emerald-600 bg-white cursor-pointer transition-colors"
                              title="Edit Wahana"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTour(tour.id, tour.name)}
                              className="p-1.5 text-stone-700 hover:text-red-700 border border-[#ded7cb] hover:border-red-600 bg-white cursor-pointer transition-colors"
                              title="Hapus Wahana"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RESTO, MEETING ROOM & WEDDING (CRUD & WHATSAPP) */}
          {activeTab === 'facilities' && (
            <div className="space-y-6">
              {/* Header and Add Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-[#967d58]" />
                    <span>Manajemen Resto & Cafe, Meeting Room, dan Wedding (CRUD)</span>
                  </h3>
                  <p className="text-xs text-[#52645c]">
                    Kelola venue kuliner, ruang rapat MICE, dan paket wedding. Bisa upload foto dari galeri/perangkat dan kirim pesan WhatsApp langsung ke kontak BDE ({resortInfo?.bdeName || 'BDE DEFIT'} · {resortInfo?.whatsappFormatted || '+62 859-3454-4901'}).
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenAddVenue}
                    className="px-4 py-2 bg-[#182a24] text-[#fae7b3] hover:bg-[#284138] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#d4af37]" />
                    <span>Tambah Venue / Paket</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-[#ded7cb] shadow-2xs">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'Semua Venue', count: venueItems.length },
                    { id: 'resto', label: 'Resto & Cafe', count: venueItems.filter((v) => v.category === 'resto').length },
                    { id: 'meeting', label: 'Meeting Room', count: venueItems.filter((v) => v.category === 'meeting').length },
                    { id: 'wedding', label: 'Wedding & Social', count: venueItems.filter((v) => v.category === 'wedding').length },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setVenueCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        venueCategoryFilter === cat.id
                          ? 'bg-[#182a24] text-[#fae7b3] shadow-xs'
                          : 'bg-[#faf9f5] hover:bg-[#eee9df] text-[#52645c] border border-[#ded7cb]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                        venueCategoryFilter === cat.id ? 'bg-[#284138] text-[#d4af37]' : 'bg-[#ded7cb]/50 text-stone-600'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                    placeholder="Cari nama, kapasitas, harga..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#ded7cb] bg-[#faf9f5] focus:bg-white focus:outline-none focus:border-[#967d58]"
                  />
                  {venueSearch && (
                    <button
                      type="button"
                      onClick={() => setVenueSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Cards Grid */}
              {(() => {
                const filtered = venueItems.filter((item) => {
                  const matchCategory =
                    venueCategoryFilter === 'all' || item.category === venueCategoryFilter;
                  const searchLower = venueSearch.toLowerCase().trim();
                  const matchSearch =
                    !searchLower ||
                    item.name.toLowerCase().includes(searchLower) ||
                    (item.capacity && item.capacity.toLowerCase().includes(searchLower)) ||
                    (item.priceNote && item.priceNote.toLowerCase().includes(searchLower)) ||
                    (item.description && item.description.toLowerCase().includes(searchLower));
                  return matchCategory && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center bg-white border border-[#ded7cb] text-stone-500 space-y-2">
                      <UtensilsCrossed className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="text-xs font-semibold">Tidak ada venue atau paket yang sesuai filter.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setVenueCategoryFilter('all');
                          setVenueSearch('');
                        }}
                        className="text-xs text-[#967d58] hover:underline font-semibold"
                      >
                        Reset Filter
                      </button>
                    </div>
                  );
                }

                const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
                  resto: { bg: 'bg-amber-50 border-amber-200 text-amber-800', text: 'Resto & Cafe', label: 'Resto & Cafe' },
                  meeting: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', text: 'Meeting Room', label: 'Meeting Room' },
                  wedding: { bg: 'bg-rose-50 border-rose-200 text-rose-800', text: 'Wedding & Social', label: 'Wedding & Social' },
                };

                return (
                  <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                        <tr>
                          <th className="p-3">Foto</th>
                          <th className="p-3">Venue / Paket &amp; Fasilitas</th>
                          <th className="p-3">Kategori</th>
                          <th className="p-3">Kapasitas &amp; Jam</th>
                          <th className="p-3">Estimasi Tarif</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ded7cb]">
                        {filtered.map((item) => {
                          const badgeInfo = categoryStyles[item.category] || categoryStyles.resto;

                          return (
                            <tr key={item.id} className="hover:bg-[#faf9f5] align-top">
                              <td className="p-3 w-28">
                                <div className="w-24 h-16 bg-[#182a24]/10 overflow-hidden border border-[#ded7cb]">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#faf9f5] text-stone-400">
                                      {item.category === 'resto' ? (
                                        <UtensilsCrossed className="w-5 h-5 text-stone-300" />
                                      ) : item.category === 'meeting' ? (
                                        <Building2 className="w-5 h-5 text-stone-300" />
                                      ) : (
                                        <Heart className="w-5 h-5 text-stone-300" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 max-w-sm">
                                <div className="font-serif font-bold text-sm text-[#182a24]">
                                  {item.name}
                                </div>
                                <p className="text-[11px] text-[#52645c] line-clamp-2 mt-0.5 leading-relaxed">
                                  {item.description || 'Fasilitas resmi di Chevilly Resort and Camp Bogor.'}
                                </p>
                                {item.features && item.features.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1.5">
                                    {item.features.slice(0, 3).map((feat, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[9.5px] font-medium px-1.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-200"
                                      >
                                        ✓ {feat}
                                      </span>
                                    ))}
                                    {item.features.length > 3 && (
                                      <span className="text-[9.5px] text-stone-500 font-mono self-center">
                                        +{item.features.length - 3} lagi
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`text-[10px] font-semibold px-2.5 py-0.5 border rounded-xs ${badgeInfo.bg}`}>
                                  {item.categoryLabel || badgeInfo.label}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="text-stone-700 flex items-center gap-1 font-medium">
                                  <Users className="w-3.5 h-3.5 text-[#967d58]" />
                                  <span>{item.capacity || 'Kapasitas Fleksibel'}</span>
                                </div>
                                {item.hours && (
                                  <div className="text-[10.5px] font-mono text-[#73837b] flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{item.hours}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                {item.priceNote ? (
                                  <span className="font-mono font-bold text-[#967d58] bg-[#fbf9f4] px-2 py-0.5 border border-[#ded7cb]">
                                    {item.priceNote}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-stone-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <a
                                    href={getBdeWhatsappUrl(item)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#1faa4b] text-white text-[11px] font-semibold inline-flex items-center gap-1 rounded-xs transition-colors"
                                    title={`Kirim pesan WhatsApp otomatis untuk ${item.name} ke kontak ${resortInfo?.bdeName || 'BDE DEFIT'}`}
                                  >
                                    <MessageCircle className="w-3 h-3 fill-current" />
                                    <span>WA BDE</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditVenue(item)}
                                    className="px-2.5 py-1.5 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Edit Data & Ganti Foto"
                                  >
                                    <Edit className="w-3 h-3 text-[#d4af37]" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVenue(item)}
                                    className="p-1.5 text-stone-500 hover:text-red-600 transition-colors cursor-pointer border border-[#ded7cb] hover:border-red-400 bg-white"
                                    title="Hapus Venue"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: SETTINGS & BDE CONTACT */}
          {activeTab === 'settings' && resortInfo && (
            <form onSubmit={handleSaveResortInfo} autoComplete="off" className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-[#ded7cb]">
                <h3 className="font-serif text-lg font-bold text-[#182a24]">
                  Pengaturan Resor & Kontak BDE (Footer, Navbar & WhatsApp)
                </h3>
                <p className="text-xs text-[#52645c]">
                  Perbarui nomor WhatsApp target tujuan (+62 859-3454-4901), nama BDE, dan kontak concierge resor.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#354840] block mb-1">Nama Kontak BDE</label>
                  <input
                    type="text"
                    value={resortInfo.bdeName || ''}
                    onChange={(e) => setResortInfo({ ...resortInfo, bdeName: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                  <span className="text-[10px] text-[#73837b]">Tampil di tombol mengambang: BDE : DEFIT</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#354840] block mb-1">Nomor WhatsApp Target</label>
                  <input
                    type="text"
                    value={resortInfo.whatsapp || ''}
                    onChange={(e) => setResortInfo({ ...resortInfo, whatsapp: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white font-mono"
                  />
                  <span className="text-[10px] text-[#73837b]">Format digit: 6285934544901</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#354840] block mb-1">Format Tampilan WhatsApp</label>
                  <input
                    type="text"
                    value={resortInfo.whatsappFormatted || ''}
                    onChange={(e) => setResortInfo({ ...resortInfo, whatsappFormatted: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white font-mono"
                  />
                  <span className="text-[10px] text-[#73837b]">Contoh: +62 859-3454-4901</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#354840] block mb-1">Telepon Concierge</label>
                  <input
                    type="text"
                    value={resortInfo.phone || ''}
                    onChange={(e) => setResortInfo({ ...resortInfo, phone: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#354840] block mb-1">Nama Resor</label>
                  <input
                    type="text"
                    value={resortInfo.name || ''}
                    onChange={(e) => setResortInfo({ ...resortInfo, name: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#354840] block mb-1">Tagline Kemewahan</label>
                  <input
                    type="text"
                    value={resortInfo.tagline || ''}
                    onChange={(e) => setResortInfo({ ...resortInfo, tagline: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#354840] block mb-1">Email Concierge</label>
                  <input
                    type="email"
                    value={resortInfo.conciergeEmail || ''}
                    onChange={(e) => setResortInfo({ ...resortInfo, conciergeEmail: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#354840] block mb-1">Elevasi</label>
                  <input
                    type="text"
                    value={resortInfo.elevation || ''}
                    onChange={(e) => setResortInfo({ ...resortInfo, elevation: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Save className="w-4 h-4 text-[#d4af37]" />
                <span>Simpan Pengaturan Kontak</span>
              </button>

              {/* Card Keamanan Kata Sandi Admin */}
              <div className="pt-6 border-t border-[#ded7cb]">
                <div className="bg-white p-5 border border-[#ded7cb] shadow-sm max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-4 h-4 text-[#967d58]" />
                    <h4 className="font-serif font-bold text-sm text-[#182a24]">
                      Keamanan Akun & Ganti Kata Sandi Admin
                    </h4>
                  </div>
                  <p className="text-xs text-[#73837b] mb-4">
                    Perbarui kata sandi otentikasi login Portal Admin untuk menjaga keamanan sistem pengelolaan Chevilly.
                  </p>

                  <div className="space-y-3">
                    {passChangeSuccess && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{passChangeSuccess}</span>
                      </div>
                    )}
                    {passChangeError && (
                      <div className="p-2.5 bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>{passChangeError}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold text-[#354840] block mb-1">
                        Kata Sandi Saat Ini
                      </label>
                      <input
                        type="password"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="Masukkan sandi saat ini"
                        className="w-full border border-[#ded7cb] px-3 py-2 bg-stone-50 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#354840] block mb-1">
                          Kata Sandi Baru
                        </label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="Minimal 5 karakter"
                          className="w-full border border-[#ded7cb] px-3 py-2 bg-stone-50 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#354840] block mb-1">
                          Konfirmasi Sandi Baru
                        </label>
                        <input
                          type="password"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="Ulangi sandi baru"
                          className="w-full border border-[#ded7cb] px-3 py-2 bg-stone-50 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={passChangeLoading}
                      className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 transition-all mt-2"
                    >
                      {passChangeLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                      )}
                      <span>{passChangeLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 5: RESERVATIONS */}
          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#ded7cb]">
                <h3 className="font-serif text-lg font-bold text-[#182a24]">
                  Daftar Reservasi Tamu & Calon Customer (CRUD)
                </h3>
                <p className="text-xs text-[#52645c]">
                  Pantau pesanan yang masuk, ubah status reservasi (Konfirmasi / Down Payment / Lunas / Selesai), atau hapus data.
                </p>
              </div>

              {reservations.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#73837b] bg-white border border-[#ded7cb]">
                  Belum ada data reservasi masuk.
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                      <tr>
                        <th className="p-3">Kode Booking</th>
                        <th className="p-3">Nama Tamu</th>
                        <th className="p-3">Kontak Tamu</th>
                        <th className="p-3">Layanan / Kamar</th>
                        <th className="p-3">Total Biaya</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded7cb]">
                      {reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-[#faf9f5]">
                          <td className="p-3 font-mono font-bold text-[#182a24]">
                            <div>{res.bookingCode}</div>
                            <button
                              type="button"
                              onClick={() => setProofReservation(res)}
                              className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-sans font-semibold border cursor-pointer transition-colors ${
                                res.paymentProofUrl
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100 hover:text-stone-700'
                              }`}
                              title={res.paymentProofUrl ? 'Klik untuk melihat bukti transfer' : 'Lihat status bukti transfer'}
                            >
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>{res.paymentProofUrl ? 'View Bukti TF' : 'Belum Upload TF'}</span>
                            </button>
                          </td>
                          <td className="p-3 font-semibold">{res.guestName}</td>
                          <td className="p-3 text-[#52645c]">
                            <div>{res.guestPhone}</div>
                            <div className="text-[10px] text-[#73837b]">{res.guestEmail}</div>
                          </td>
                          <td className="p-3 text-[#354840]">
                            {res.room ? res.room.name : (res.tours?.[0]?.name || 'Reservasi')}
                          </td>
                          <td className="p-3 font-mono font-medium">
                            {formatPrice(res.totalPriceIdr, res.totalPriceUsd, res.currency)}
                          </td>
                          <td className="p-3">
                            <select
                              value={
                                res.status === 'Konfirmasi' ||
                                res.status === 'Down Payment' ||
                                res.status === 'Lunas' ||
                                res.status === 'Selesai'
                                  ? res.status
                                  : 'Konfirmasi'
                              }
                              onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value)}
                              className="text-[11px] font-semibold border border-[#ded7cb] bg-[#faf9f5] px-2 py-1 rounded cursor-pointer"
                            >
                              <option value="Konfirmasi">Konfirmasi</option>
                              <option value="Down Payment">Down Payment</option>
                              <option value="Lunas">Lunas</option>
                              <option value="Selesai">Selesai</option>
                            </select>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {normalizeWhatsAppNumber(res.guestPhone) ? (
                                <a
                                  href={buildGuestWhatsAppUrl(res)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#25D366] hover:bg-[#1fb858] text-white border border-[#20bd5a] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  title={`Kirim detail pesanan via WA (dari +6285934544901 ke ${res.guestPhone})`}
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-white" />
                                  <span>WA Tamu</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="px-2.5 py-1 text-[11px] font-semibold text-stone-400 bg-stone-100 border border-stone-200 inline-flex items-center gap-1 cursor-not-allowed"
                                  title="Nomor WhatsApp tamu belum terdaftar"
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                                  <span>No. WA Kosong</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setInvoiceReservation(res)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#182a24] hover:bg-[#182a24] hover:text-[#fae7b3] border border-[#ded7cb] hover:border-[#182a24] bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Lihat & Cetak Invoice Reservasi"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setReservationToDelete(res)}
                                className="p-1.5 text-stone-600 hover:text-red-700 hover:bg-red-50 border border-[#ded7cb] hover:border-red-600 bg-white transition-colors cursor-pointer"
                                title="Hapus Reservasi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PETA KAWASAN (MAP LOCATIONS) */}
          {activeTab === 'map_locations' && (
            <div className="space-y-6">
              {/* Header and Add Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#967d58]" />
                    <span>Manajemen Peta Kawasan & Titik Resor (Peta Interaktif)</span>
                  </h3>
                  <p className="text-xs text-[#52645c]">
                    Kelola {mapLocations.length} titik kawasan, wahana, vila, resto, serta update foto galeri dan sematkan video embed YouTube / player langsung.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddMapLocation}
                  className="px-4 py-2 bg-[#182a24] text-[#fae7b3] hover:bg-[#284138] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <span>Tambah Titik Kawasan</span>
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-[#ded7cb] shadow-2xs">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'Semua Titik', count: mapLocations.length },
                    { id: 'wahana', label: 'Wahana & Wisata', count: mapLocations.filter((l) => !l.category || l.category === 'wahana').length },
                    { id: 'villa', label: 'Vila & Glamping', count: mapLocations.filter((l) => l.category === 'villa').length },
                    { id: 'kuliner', label: 'Resto & Kuliner', count: mapLocations.filter((l) => l.category === 'kuliner').length },
                    { id: 'meeting', label: 'Meeting & Event', count: mapLocations.filter((l) => l.category === 'meeting').length },
                    { id: 'fasilitas', label: 'Fasilitas Umum', count: mapLocations.filter((l) => l.category === 'fasilitas').length },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAdminMapCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        adminMapCategoryFilter === cat.id
                          ? 'bg-[#182a24] text-[#fae7b3] shadow-xs'
                          : 'bg-[#faf9f5] hover:bg-[#eee9df] text-[#52645c] border border-[#ded7cb]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                        adminMapCategoryFilter === cat.id ? 'bg-[#284138] text-[#d4af37]' : 'bg-[#ded7cb]/50 text-stone-600'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminMapSearch}
                    onChange={(e) => setAdminMapSearch(e.target.value)}
                    placeholder="Cari nomor atau nama..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#ded7cb] bg-[#faf9f5] focus:bg-white focus:outline-none focus:border-[#967d58]"
                  />
                  {adminMapSearch && (
                    <button
                      type="button"
                      onClick={() => setAdminMapSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Cards Grid */}
              {(() => {
                const filtered = mapLocations.filter((loc) => {
                  const matchCategory =
                    adminMapCategoryFilter === 'all' ||
                    loc.category === adminMapCategoryFilter ||
                    (adminMapCategoryFilter === 'wahana' && (!loc.category || loc.category === 'wahana'));
                  const searchLower = adminMapSearch.toLowerCase().trim();
                  const matchSearch =
                    !searchLower ||
                    loc.name.toLowerCase().includes(searchLower) ||
                    String(loc.number).toLowerCase().includes(searchLower) ||
                    (loc.description && loc.description.toLowerCase().includes(searchLower));
                  return matchCategory && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center bg-white border border-[#ded7cb] text-stone-500 space-y-2">
                      <MapPin className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="text-xs font-semibold">Tidak ada titik kawasan yang sesuai dengan pencarian atau filter.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminMapCategoryFilter('all');
                          setAdminMapSearch('');
                        }}
                        className="text-xs text-[#967d58] hover:underline font-semibold"
                      >
                        Reset Filter
                      </button>
                    </div>
                  );
                }

                const categoryBadgeStyles: Record<string, { bg: string; text: string; label: string }> = {
                  wahana: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', text: 'Wahana & Wisata', label: 'Wahana & Wisata' },
                  villa: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', text: 'Vila & Glamping', label: 'Vila & Glamping' },
                  kuliner: { bg: 'bg-amber-50 border-amber-200 text-amber-800', text: 'Resto & Kuliner', label: 'Resto & Kuliner' },
                  meeting: { bg: 'bg-purple-50 border-purple-200 text-purple-800', text: 'Meeting & Event', label: 'Meeting & Event' },
                  fasilitas: { bg: 'bg-sky-50 border-sky-200 text-sky-800', text: 'Fasilitas Umum', label: 'Fasilitas Umum' },
                };

                return (
                  <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                        <tr>
                          <th className="p-3 w-14">No. Pin</th>
                          <th className="p-3">Media</th>
                          <th className="p-3">Nama Titik &amp; Deskripsi</th>
                          <th className="p-3">Kategori</th>
                          <th className="p-3">Jam &amp; Tarif</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ded7cb]">
                        {filtered.map((loc) => {
                          const badgeInfo = categoryBadgeStyles[loc.category || 'wahana'] || categoryBadgeStyles.wahana;
                          const hasVideo = !!(loc.videoEmbed || loc.videoUrl);
                          const hasPhoto = !!loc.image;

                          return (
                            <tr key={loc.id || loc.number} className="hover:bg-[#faf9f5] align-top">
                              <td className="p-3">
                                <span className="w-7 h-7 rounded-full bg-[#182a24] text-[#d4af37] border border-[#d4af37]/50 inline-flex items-center justify-center font-serif font-bold text-xs">
                                  {loc.number}
                                </span>
                              </td>
                              <td className="p-3 w-28">
                                <div className="w-24 h-14 bg-[#182a24]/10 overflow-hidden border border-[#ded7cb] mb-1">
                                  {loc.image ? (
                                    <img
                                      src={loc.image}
                                      alt={loc.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#faf9f5] text-stone-400">
                                      <MapPin className="w-4 h-4 text-stone-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-[9.5px] font-mono">
                                  {hasPhoto && (
                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      Foto
                                    </span>
                                  )}
                                  {hasVideo && (
                                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200">
                                      Video
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 max-w-sm">
                                <div className="font-serif font-bold text-sm text-[#182a24]">
                                  {loc.name}
                                </div>
                                <p className="text-[11px] text-[#52645c] line-clamp-2 mt-0.5 leading-relaxed">
                                  {loc.description || 'Titik kawasan resmi di Chevilly Resort and Camp.'}
                                </p>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 border ${badgeInfo.bg}`}>
                                  {loc.categoryLabel || badgeInfo.label}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="font-mono text-[11px] text-stone-600">
                                  {loc.hours || '-'}
                                </div>
                                {loc.priceNote && (
                                  <div className="text-[10px] font-mono font-medium text-[#967d58] mt-1">
                                    {loc.priceNote}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditMapLocation(loc)}
                                    className="px-2.5 py-1 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Edit className="w-3 h-3 text-[#d4af37]" />
                                    <span>Edit &amp; Media</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMapLocation(loc)}
                                    className="p-1.5 text-stone-500 hover:text-red-600 border border-[#ded7cb] hover:border-red-400 bg-white transition-colors cursor-pointer"
                                    title="Hapus Titik Kawasan"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 7: VIDEO HERO HD (CAROUSEL BERANDA) */}
          {activeTab === 'hero_videos' && (
            <div className="space-y-6">
              {/* Header and Add Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#967d58]" />
                    <span>Manajemen Video Hero & Carousel HD YouTube (Beranda Utama)</span>
                  </h3>
                  <p className="text-xs text-[#52645c]">
                    Kelola video embed YouTube kualitas HD dan video singkat full untuk carousel latar belakang beranda. Form Cek Ketersediaan tampil transparan mengambang di atasnya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddHeroVideo}
                  className="px-4 py-2 bg-[#182a24] text-[#fae7b3] hover:bg-[#284138] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <span>Tambah Video Hero Baru</span>
                </button>
              </div>

              {/* Summary Info Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-wrap items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>
                    Total Video: <strong>{heroVideos.length}</strong> · Video Aktif di Beranda: <strong>{heroVideos.filter((v) => v.isActive !== false).length}</strong>
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Didukung: YouTube URL standar, YouTube Shorts, atau kode embed &lt;iframe&gt;
                </div>
              </div>

              {/* Hero Videos Table */}
              <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                    <tr>
                      <th className="p-3 w-12">No.</th>
                      <th className="p-3 w-44">Preview Video</th>
                      <th className="p-3">Judul &amp; URL</th>
                      <th className="p-3">Visibilitas Depan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ded7cb]">
                    {heroVideos.map((vid, idx) => {
                      const parsed = parseYouTubeVideo(vid.youtubeUrl);

                      return (
                        <tr
                          key={vid.id || idx}
                          className={`hover:bg-[#faf9f5] align-top ${
                            vid.isActive !== false ? '' : 'opacity-65 bg-stone-50'
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-[#967d58]">#{idx + 1}</td>
                          <td className="p-3">
                            <div className="w-36 aspect-video bg-black overflow-hidden border border-[#ded7cb] mb-1">
                              {parsed ? (
                                parsed.type === 'video' ? (
                                  <video
                                    src={parsed.embedUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <iframe
                                    src={parsed.embedUrl.replace('autoplay=1', 'autoplay=0')}
                                    title={vid.title}
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full object-cover border-0"
                                  />
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">
                                  Video Tidak Valid
                                </div>
                              )}
                            </div>
                            <a
                              href={vid.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] font-semibold text-[#182a24] hover:text-[#967d58] inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3 text-[#967d58]" />
                              <span>Buka di YouTube</span>
                            </a>
                          </td>
                          <td className="p-3 max-w-sm">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="px-1.5 py-0.5 bg-[#d4af37] text-[#0d1613] text-[9.5px] font-bold uppercase font-mono">
                                {vid.badge || 'HD 1080p'}
                              </span>
                              {vid.duration && (
                                <span className="px-1.5 py-0.5 bg-stone-200 text-stone-800 text-[9.5px] font-mono">
                                  {vid.duration}
                                </span>
                              )}
                            </div>
                            <div className="font-serif text-sm font-bold text-[#182a24]">
                              {vid.title}
                            </div>
                            {vid.description && (
                              <p className="text-[11px] text-[#52645c] line-clamp-2 mt-0.5">
                                {vid.description}
                              </p>
                            )}
                            <div className="text-[10px] font-mono text-stone-400 truncate max-w-[260px] mt-1">
                              {vid.youtubeUrl}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono max-w-[200px]">
                              <span
                                className={`px-1.5 py-0.5 border ${
                                  vid.showTitle !== false
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                    : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                                }`}
                              >
                                Judul: {vid.showTitle !== false ? '✓' : '✗'}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 border ${
                                  vid.showDescription !== false
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                    : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                                }`}
                              >
                                Keterangan: {vid.showDescription !== false ? '✓' : '✗'}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 border ${
                                  vid.showBadge !== false
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                    : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                                }`}
                              >
                                Badge: {vid.showBadge !== false ? '✓' : '✗'}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 border ${
                                  vid.showDuration !== false
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                    : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                                }`}
                              >
                                Durasi: {vid.showDuration !== false ? '✓' : '✗'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleHeroVideoActive(vid)}
                              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                                vid.isActive !== false
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-stone-500 text-white hover:bg-stone-600'
                              }`}
                              title="Klik untuk mengubah status aktif"
                            >
                              {vid.isActive !== false ? '● Aktif' : '○ Nonaktif'}
                            </button>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditHeroVideo(vid)}
                                className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-emerald-800 border border-[#ded7cb] hover:border-emerald-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Edit Video Ini"
                              >
                                <Edit className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setHeroVideoToDelete(vid)}
                                className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-red-700 border border-[#ded7cb] hover:border-red-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Hapus Video Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
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

          {/* TAB 9: FASILITAS & LAYANAN TAMBAHAN PUNCAK PEGUNUNGAN (BOOKING ADD-ONS) */}
          {activeTab === 'addons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#182a24]">
                    Fasilitas & Layanan Tambahan Puncak Pegunungan
                  </h3>
                  <p className="text-xs text-[#52645c]">
                    Kelola daftar layanan tambahan (Helipad, Api Unggun, Perlengkapan Ekspedisi, Paket Meeting Fullboard) yang tampil pada Tahap 2 formulir Reservasi Tamu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAddOn}
                  className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <span>Tambah Layanan Tambahan</span>
                </button>
              </div>

              {/* Filter & Ringkasan Status */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#ded7cb]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-[#967d58] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={addOnSearch}
                    onChange={(e) => setAddOnSearch(e.target.value)}
                    placeholder="Cari nama layanan, deskripsi, atau unit satuan..."
                    className="w-full pl-8 pr-3 py-1.5 border border-[#ded7cb] text-xs bg-[#faf9f5] text-[#182a24] focus:outline-none focus:border-[#182a24]"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 bg-[#f4f0e6] border border-[#ded7cb] text-[#182a24]">
                    Total: <strong>{addOns.length}</strong>
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800">
                    Aktif: <strong>{addOns.filter((a) => a.isActive !== false).length}</strong>
                  </span>
                  <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-600">
                    Nonaktif: <strong>{addOns.filter((a) => a.isActive === false).length}</strong>
                  </span>
                </div>
              </div>

              {/* Daftar Layanan Tambahan */}
              {addOns.filter((item) => {
                if (!addOnSearch.trim()) return true;
                const q = addOnSearch.trim().toLowerCase();
                return (
                  item.name.toLowerCase().includes(q) ||
                  item.description.toLowerCase().includes(q) ||
                  item.unit.toLowerCase().includes(q)
                );
              }).length === 0 ? (
                <div className="p-10 text-center bg-white border border-dashed border-[#ded7cb] space-y-3">
                  <Sparkles className="w-8 h-8 text-[#967d58] mx-auto" />
                  <div className="font-serif text-base font-semibold text-[#182a24]">
                    Belum ada layanan tambahan yang sesuai
                  </div>
                  <p className="text-xs text-[#63746c]">
                    Klik tombol &quot;Tambah Layanan Tambahan&quot; untuk membuat layanan atau ubah kata kunci pencarian.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                      <tr>
                        <th className="p-3 w-12">No.</th>
                        <th className="p-3">Nama &amp; Rincian Layanan</th>
                        <th className="p-3">Satuan / Unit</th>
                        <th className="p-3">Tarif (IDR / USD)</th>
                        <th className="p-3">Tampil Elemen</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded7cb]">
                      {addOns
                        .filter((item) => {
                          if (!addOnSearch.trim()) return true;
                          const q = addOnSearch.trim().toLowerCase();
                          return (
                            item.name.toLowerCase().includes(q) ||
                            item.description.toLowerCase().includes(q) ||
                            item.unit.toLowerCase().includes(q)
                          );
                        })
                        .map((addon, idx) => {
                          const isActive = addon.isActive !== false;
                          return (
                            <tr
                              key={addon.id}
                              className={`hover:bg-[#faf9f5] align-top ${
                                isActive ? '' : 'opacity-75 bg-stone-50'
                              }`}
                            >
                              <td className="p-3 font-mono font-bold text-[#967d58]">#{idx + 1}</td>
                              <td className="p-3 max-w-sm">
                                <div className="font-serif text-sm font-bold text-[#182a24]">
                                  {addon.name}
                                </div>
                                <p className="text-[11px] text-[#52645c] mt-0.5 leading-relaxed">
                                  {addon.description}
                                </p>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 text-[10.5px] font-mono bg-[#f7f5ef] border border-[#e4ded2] text-[#967d58]">
                                  {addon.unit}
                                </span>
                              </td>
                              <td className="p-3 font-mono whitespace-nowrap">
                                <div className="font-bold text-[#182a24]">
                                  {formatPrice(addon.priceIdr, addon.priceUsd, 'IDR')}
                                </div>
                                <div className="text-[10.5px] text-[#73837b]">
                                  USD ${addon.priceUsd.toLocaleString('en-US')}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono max-w-[190px]">
                                  <span
                                    className={`px-1.5 py-0.5 border ${
                                      addon.showName !== false
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                                    }`}
                                  >
                                    Nama: {addon.showName !== false ? '✓' : '✗'}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 border ${
                                      addon.showDescription !== false
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                                    }`}
                                  >
                                    Desk: {addon.showDescription !== false ? '✓' : '✗'}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 border ${
                                      addon.showUnit !== false
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                                    }`}
                                  >
                                    Unit: {addon.showUnit !== false ? '✓' : '✗'}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 border ${
                                      addon.showPrice !== false
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                                    }`}
                                  >
                                    Harga: {addon.showPrice !== false ? '✓' : '✗'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAddOnActive(addon)}
                                  className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border cursor-pointer inline-flex items-center gap-1 transition-colors ${
                                    isActive
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                                  }`}
                                  title="Klik untuk aktif/nonaktifkan layanan di formulir reservasi"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isActive ? 'bg-emerald-600' : 'bg-stone-400'
                                    }`}
                                  />
                                  <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                                </button>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditAddOn(addon)}
                                    className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-emerald-800 border border-[#ded7cb] hover:border-emerald-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAddOnToDelete(addon)}
                                    className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-red-700 border border-[#ded7cb] hover:border-red-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
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
              )}
            </div>
          )}

          {/* TAB: ULASAN PARA PENJELAJAH & TAMU KEHORMATAN */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
                    <span>Ulasan Para Penjelajah &amp; Tamu Kehormatan</span>
                  </h3>
                  <p className="text-xs text-[#52645c]">
                    Kelola testimoni dan ulasan tamu kehormatan yang tampil pada section <strong>Ulasan</strong> di halaman beranda secara real-time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddReview}
                  className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <span>Tambah Ulasan Baru</span>
                </button>
              </div>

              {/* Search & Summary Bar */}
              <div className="bg-white border border-[#ded7cb] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-[#73837b] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    placeholder="Cari nama tamu, profesi/kota, atau isi ulasan..."
                    className="w-full pl-8 pr-3 py-1.5 border border-[#ded7cb] text-xs bg-[#faf9f5] text-[#182a24] focus:outline-none focus:border-[#182a24]"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 bg-[#f4f0e6] border border-[#ded7cb] text-[#182a24]">
                    Total: <strong>{reviews.length}</strong>
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800">
                    Tampil: <strong>{reviews.filter((r) => r.isActive !== false).length}</strong>
                  </span>
                  <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-600">
                    Disembunyikan: <strong>{reviews.filter((r) => r.isActive === false).length}</strong>
                  </span>
                </div>
              </div>

              {/* Reviews Table */}
              {reviews.filter((item) => {
                if (!reviewSearch.trim()) return true;
                const q = reviewSearch.trim().toLowerCase();
                return (
                  item.authorName.toLowerCase().includes(q) ||
                  item.authorRole.toLowerCase().includes(q) ||
                  item.quote.toLowerCase().includes(q)
                );
              }).length === 0 ? (
                <div className="p-10 text-center bg-white border border-dashed border-[#ded7cb] space-y-3">
                  <Star className="w-8 h-8 text-[#967d58] mx-auto" />
                  <div className="font-serif text-base font-semibold text-[#182a24]">
                    Belum ada ulasan tamu yang sesuai
                  </div>
                  <p className="text-xs text-[#63746c]">
                    Klik tombol &quot;Tambah Ulasan Baru&quot; untuk menambahkan testimoni tamu atau ubah kata kunci pencarian.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
                      <tr>
                        <th className="p-3 w-12">No.</th>
                        <th className="p-3">Nama &amp; Profesi / Kota</th>
                        <th className="p-3">Isi Ulasan / Testimoni</th>
                        <th className="p-3 whitespace-nowrap">Rating</th>
                        <th className="p-3 whitespace-nowrap">Status</th>
                        <th className="p-3 text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded7cb]">
                      {reviews
                        .filter((item) => {
                          if (!reviewSearch.trim()) return true;
                          const q = reviewSearch.trim().toLowerCase();
                          return (
                            item.authorName.toLowerCase().includes(q) ||
                            item.authorRole.toLowerCase().includes(q) ||
                            item.quote.toLowerCase().includes(q)
                          );
                        })
                        .map((review, idx) => {
                          const isActive = review.isActive !== false;
                          const stars = Math.min(5, Math.max(1, Number(review.rating) || 5));
                          return (
                            <tr
                              key={review.id}
                              className={`hover:bg-[#faf9f5] align-top ${
                                isActive ? '' : 'opacity-70 bg-stone-50'
                              }`}
                            >
                              <td className="p-3 font-mono font-bold text-[#967d58]">#{idx + 1}</td>
                              <td className="p-3 min-w-[180px]">
                                <div className="font-serif text-sm font-bold text-[#182a24]">
                                  {review.authorName}
                                </div>
                                <div className="text-[11px] text-[#63746c] mt-0.5">
                                  {review.authorRole}
                                </div>
                                {review.createdAt && (
                                  <div className="text-[10px] font-mono text-[#8e9b94] mt-1">
                                    {review.createdAt}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 max-w-md">
                                <p className="text-xs text-[#3b4e46] italic leading-relaxed">
                                  &quot;{review.quote}&quot;
                                </p>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="text-[#c59b27] text-xs tracking-wider font-mono">
                                  {'★'.repeat(stars)}
                                  <span className="text-stone-300">{'★'.repeat(5 - stars)}</span>
                                </div>
                                <div className="text-[10px] font-mono text-[#73837b] mt-0.5">
                                  {stars}.0 / 5.0
                                </div>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleReviewActive(review)}
                                  className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border cursor-pointer inline-flex items-center gap-1 transition-colors ${
                                    isActive
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                                  }`}
                                  title="Klik untuk tampilkan atau sembunyikan ulasan di beranda"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isActive ? 'bg-emerald-600' : 'bg-stone-400'
                                    }`}
                                  />
                                  <span>{isActive ? 'Tampil' : 'Sembunyi'}</span>
                                </button>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditReview(review)}
                                    className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-emerald-800 border border-[#ded7cb] hover:border-emerald-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReviewToDelete(review)}
                                    className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-red-700 border border-[#ded7cb] hover:border-red-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
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
              )}
            </div>
          )}

          {/* TAB: FASILITAS & SARANA (CRUD) */}
          {activeTab === 'fasilitas_sarana' && (
            <AdminFasilitasTab
              items={fasilitasSaranaItems}
              operatingHours={fasilitasHours}
              adminToken={adminToken}
              onRefresh={loadAllData}
              onDataChanged={onDataChanged}
              onFeedback={showFeedback}
              onAuthExpired={handleAdminSessionExpired}
            />
          )}

          {/* TAB: EXPLORE ZONA PRABAYAR (CRUD) */}
          {activeTab === 'zona_prabayar' && (
            <AdminZonaTab
              items={zonaPrabayarItems}
              rentalFacilities={zonaRentals}
              adminToken={adminToken}
              onRefresh={loadAllData}
              onDataChanged={onDataChanged}
              onFeedback={showFeedback}
              onAuthExpired={handleAdminSessionExpired}
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#f0ece1] px-6 py-3 border-t border-[#ded7cb] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[#52645c] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#967d58]" />
            <span>Sistem Backend Berjalan Aktif di Port 3000 · REST API JSON Engine</span>
          </div>
          <button
            onClick={() => {
              onClose();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-2 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Tutup & Kembali ke Beranda
          </button>
        </div>

      </div>

      {/* CREATE / EDIT ROOM MODAL */}
      {isRoomModalOpen && editingRoom && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-lg shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb] mb-4">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                {rooms.some((r) => r.id === editingRoom.id) ? 'Edit Data Kamar / Villa' : 'Tambah Kamar / Villa Baru'}
              </h4>
              <button onClick={() => setIsRoomModalOpen(false)}><X className="w-5 h-5 text-stone-600" /></button>
            </div>

            <form onSubmit={handleSaveRoom} autoComplete="off" className="space-y-3.5">
              {/* Status Ketersediaan Kamar & Isian Jumlah Kamar */}
              <div className="p-3.5 bg-[#f5f2ea] border border-[#ded7cb] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block">
                      Status Ketersediaan Kamar:
                    </label>
                    <span className="text-[10px] text-stone-600 block">
                      Pilihan status: Available (titik hijau) / Tidak Available (titik merah)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoom((prev) => (prev ? { ...prev, isAvailable: prev.isAvailable === false ? true : false } : prev));
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      editingRoom.isAvailable !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 border-rose-400 hover:bg-rose-100'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        editingRoom.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <span>{editingRoom.isAvailable !== false ? 'Available' : 'Tidak Available'}</span>
                  </button>
                </div>

                {/* Isian Jumlah Kamar (Total Unit Tersedia) */}
                <div className="pt-2.5 border-t border-[#ded7cb] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#967d58]" />
                      <span>Jumlah Kamar (Total Unit Tersedia):</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-600 block">
                      Total unit kamar tipe ini di resor (contoh: 10 unit).
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoom((prev) =>
                          prev ? { ...prev, totalRooms: Math.max(1, (prev.totalRooms ?? 10) - 1) } : prev
                        );
                      }}
                      className="w-7 h-7 bg-white hover:bg-stone-100 border border-[#ded7cb] font-bold text-xs text-[#182a24] flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                      title="Kurangi 1 unit"
                    >
                      -
                    </button>
                    <div className="relative w-28">
                      <input
                        type="number"
                        min={1}
                        max={999}
                        required
                        value={editingRoom.totalRooms ?? 10}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setEditingRoom((prev) => (prev ? { ...prev, totalRooms: val } : prev));
                        }}
                        className="w-full pl-3 pr-8 py-1.5 border border-[#ded7cb] focus:border-[#182a24] bg-white font-mono text-xs font-bold text-[#182a24] text-center"
                        placeholder="10"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-stone-500 font-semibold pointer-events-none">
                        Unit
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoom((prev) =>
                          prev ? { ...prev, totalRooms: (prev.totalRooms ?? 10) + 1 } : prev
                        );
                      }}
                      className="w-7 h-7 bg-white hover:bg-stone-100 border border-[#ded7cb] font-bold text-xs text-[#182a24] flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                      title="Tambah 1 unit"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Pilihan Kategori Kamar dari Tabel Kategori */}
              <div>
                <label className="text-[11px] font-semibold block mb-1 text-[#182a24] flex items-center justify-between">
                  <span>Kategori Kamar <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-[#73837b] font-mono">
                    Pilihan dari Tabel Kategori
                  </span>
                </label>
                <select
                  value={
                    categories.find(
                      (c) =>
                        c.id.toLowerCase() === (editingRoom.category || '').toLowerCase() ||
                        c.label.toLowerCase() === (editingRoom.category || '').toLowerCase()
                    )?.id || (categories[0]?.id || '')
                  }
                  onChange={(e) => {
                    const newCatId = e.target.value;
                    const selectedCat = categories.find((c) => c.id === newCatId);
                    setEditingRoom((prev) => {
                      if (!prev) return prev;
                      const isExistingRoom = rooms.some((r) => r.id === prev.id);
                      // Never overwrite fixed prices when editing an existing room!
                      if (isExistingRoom || !selectedCat) {
                        return { ...prev, category: newCatId };
                      }
                      const catSunIdr = selectedCat.priceSunThursIdr ?? selectedCat.priceIdr ?? 850000;
                      const catFriIdr = selectedCat.priceFridayIdr ?? Math.round(catSunIdr * 1.25);
                      const catSatIdr = selectedCat.priceSaturdayIdr ?? Math.round(catSunIdr * 1.55);
                      return {
                        ...prev,
                        category: newCatId,
                        area: selectedCat.area,
                        capacity: selectedCat.capacity,
                        bedType: selectedCat.bedType,
                        priceIdr: catSunIdr,
                        priceSunThursIdr: catSunIdr,
                        priceFridayIdr: catFriIdr,
                        priceSaturdayIdr: catSatIdr,
                        priceUsd: idrToLiveUsd(catSunIdr, usdExchangeRate),
                        priceSunThursUsd: idrToLiveUsd(catSunIdr, usdExchangeRate),
                        priceFridayUsd: idrToLiveUsd(catFriIdr, usdExchangeRate),
                        priceSaturdayUsd: idrToLiveUsd(catSatIdr, usdExchangeRate),
                      };
                    });
                  }}
                  className="w-full border border-[#ded7cb] px-3.5 py-2.5 bg-white text-xs font-semibold text-[#182a24] cursor-pointer focus:outline-none focus:border-[#182a24] shadow-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#73837b] mt-1">
                  Nama kategori diambil dari tabel daftar kategori (tidak bisa diedit manual di sini).
                </p>
              </div>

              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#182a24] flex items-center gap-1.5">
                    <span>Nama Kamar / Villa</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingRoom((prev) => prev ? { ...prev, showName: prev.showName === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingRoom.showName !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Nama Kamar di halaman depan"
                  >
                    {editingRoom.showName !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingRoom.showName !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  name="room_name_fresh_input"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  value={editingRoom.name || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  placeholder="Ketik nama kamar / villa baru..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs font-medium"
                />
              </div>

              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#182a24]">Kicker / Sub-Judul</label>
                  <button
                    type="button"
                    onClick={() => setEditingRoom((prev) => prev ? { ...prev, showKicker: prev.showKicker === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingRoom.showKicker !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Sub-judul di halaman depan"
                  >
                    {editingRoom.showKicker !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingRoom.showKicker !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  name="room_kicker_fresh_input"
                  autoComplete="off"
                  value={editingRoom.kicker || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, kicker: e.target.value })}
                  placeholder="Contoh: Kamar Deluxe Pilihan dengan Balkon Lembah Pinus"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs"
                />
              </div>

              {/* TABEL ISIAN 3 HARGA BERBEDA: Sun-Thurs, Friday, Saturday */}
              <div>
                <div className="p-3 bg-[#f5f2ea] border border-[#ded7cb] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#182a24] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#967d58]" />
                      <span>Tabel Isian 3 Harga Berbeda</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingRoom((prev) => prev ? { ...prev, showPrice: prev.showPrice === false ? true : false } : prev)}
                        className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                          editingRoom.showPrice !== false
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                        }`}
                        title="Checklist tombol untuk menampilkan atau menyembunyikan Harga di halaman depan"
                      >
                        {editingRoom.showPrice !== false ? (
                          <CheckSquare className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <Square className="w-3 h-3 text-stone-400" />
                        )}
                        <span>{editingRoom.showPrice !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                      </button>
                      <span className="text-[10px] font-mono font-bold text-[#182a24] bg-white px-2 py-0.5 border border-[#ded7cb] shadow-xs">
                        Sun-Thurs · Friday · Saturday
                      </span>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-[#52645c] leading-relaxed">
                    Tentukan tarif menginap per malam berdasarkan hari reservasi tamu sesuai brosur resmi:
                  </p>

                  {/* Kurs Dollar Saat Ini (Live) & Harga IDR Fix */}
                  <div className="bg-[#ede7d8] p-2.5 border border-[#ded7cb] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#182a24] text-[11px] flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#967d58]" />
                        <span>Kurs Dollar (USD) Saat Ini:</span>
                      </span>
                      <div className="flex items-center gap-1 bg-white px-2 py-1 border border-[#c8c0b0] shadow-xs">
                        <span className="text-[10px] font-mono text-stone-500 font-semibold">1 USD = Rp</span>
                        <input
                          type="number"
                          min={1000}
                          value={usdExchangeRate}
                          onChange={(e) => {
                            const newRate = Math.max(1000, Number(e.target.value) || 16350);
                            setUsdExchangeRate(newRate);
                            setLiveUsdRate(newRate);
                            setEditingRoom((prev) => {
                              if (!prev) return prev;
                              const idrSun = prev.priceSunThursIdr ?? prev.priceIdr ?? 0;
                              const idrFri = prev.priceFridayIdr ?? idrSun;
                              const idrSat = prev.priceSaturdayIdr ?? idrSun;
                              return {
                                ...prev,
                                priceUsd: idrToLiveUsd(idrSun, newRate),
                                priceSunThursUsd: idrToLiveUsd(idrSun, newRate),
                                priceFridayUsd: idrToLiveUsd(idrFri, newRate),
                                priceSaturdayUsd: idrToLiveUsd(idrSat, newRate),
                              };
                            });
                          }}
                          className="w-20 font-mono font-bold text-xs text-[#182a24] focus:outline-none"
                        />
                      </div>
                      <span className="text-[9.5px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-300 font-mono font-semibold">
                        ● IDR Fix · USD Live
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={isRefreshingUsdRate}
                        onClick={() => handleRefreshLiveUsdRate(true)}
                        className="px-2.5 py-1 bg-[#182a24] hover:bg-[#284138] disabled:opacity-60 text-white text-[10px] font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        title="Ambil kurs dollar (USD/IDR) terbaru saat ini dan sesuaikan harga USD secara otomatis"
                      >
                        <RefreshCw className={`w-3 h-3 text-[#d4af37] ${isRefreshingUsdRate ? 'animate-spin' : ''}`} />
                        <span>{isRefreshingUsdRate ? 'Memuat...' : 'Perbarui Kurs Live'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Responsive Table */}
                  <div className="border border-[#ded7cb] bg-white overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#182a24] text-[#f7f5ef] border-b border-[#ded7cb]">
                          <th className="py-2 px-2.5 font-serif font-bold text-[10.5px] uppercase tracking-wider">
                            Periode Hari
                          </th>
                          <th className="py-2 px-2.5 font-semibold text-[10.5px]">
                            Harga IDR (Fix) <span className="text-red-400">*</span>
                          </th>
                          <th className="py-2 px-2.5 font-semibold text-[10.5px]">
                            Harga USD ($) <span className="text-[9px] text-[#fae7b3] font-normal font-mono">(Sesuai Kurs Saat Ini)</span>
                          </th>
                          <th className="py-2 px-2.5 font-semibold text-[10.5px] hidden sm:table-cell">
                            Kategori Hari
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eee9df]">
                        {/* 1. Sun - Thurs (Minggu - Kamis) */}
                        <tr className="hover:bg-[#faf9f5] transition-colors">
                          <td className="py-2 px-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                              <div>
                                <div className="font-bold text-[#182a24] text-xs">Sun - Thurs</div>
                                <div className="text-[9.5px] text-[#73837b]">Minggu s/d Kamis</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[10px] font-mono text-stone-400">Rp</span>
                              <input
                                type="number"
                                min={0}
                                required
                                value={editingRoom.priceSunThursIdr ?? editingRoom.priceIdr ?? 0}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const val = raw === '' ? 0 : Math.max(0, Number(raw));
                                  const liveUsd = idrToLiveUsd(val, usdExchangeRate);
                                  setEditingRoom((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          priceSunThursIdr: val,
                                          priceIdr: val,
                                          priceSunThursUsd: liveUsd,
                                          priceUsd: liveUsd,
                                        }
                                      : prev
                                  );
                                }}
                                className="w-full pl-7 pr-2 py-1.5 border border-[#ded7cb] focus:border-[#182a24] bg-white font-mono text-xs font-semibold text-[#182a24]"
                                placeholder="850000"
                              />
                            </div>
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[10px] font-mono text-stone-400">$</span>
                              <input
                                type="number"
                                readOnly
                                value={idrToLiveUsd(editingRoom.priceSunThursIdr ?? editingRoom.priceIdr ?? 0, usdExchangeRate)}
                                className="w-full pl-5 pr-10 py-1.5 border border-[#ded7cb] bg-[#f7f5ef] font-mono text-xs font-semibold text-[#182a24] cursor-default"
                                title={`Otomatis mengikuti kurs saat ini: Rp ${(editingRoom.priceSunThursIdr ?? editingRoom.priceIdr ?? 0).toLocaleString('id-ID')} ÷ ${usdExchangeRate.toLocaleString('id-ID')}`}
                              />
                              <span className="absolute right-1.5 top-1.5 px-1 py-0.5 bg-emerald-100 text-emerald-800 text-[8.5px] font-mono font-bold rounded uppercase">
                                Live
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 hidden sm:table-cell">
                            <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[9.5px] font-semibold border border-emerald-200">
                              Weekday
                            </span>
                          </td>
                        </tr>

                        {/* 2. Friday (Jumat) */}
                        <tr className="hover:bg-[#faf9f5] transition-colors bg-[#fdfcf9]">
                          <td className="py-2 px-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                              <div>
                                <div className="font-bold text-[#182a24] text-xs">Friday</div>
                                <div className="text-[9.5px] text-[#73837b]">Hari Jumat</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[10px] font-mono text-stone-400">Rp</span>
                              <input
                                type="number"
                                min={0}
                                required
                                value={editingRoom.priceFridayIdr ?? 0}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const val = raw === '' ? 0 : Math.max(0, Number(raw));
                                  const liveUsd = idrToLiveUsd(val, usdExchangeRate);
                                  setEditingRoom((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          priceFridayIdr: val,
                                          priceFridayUsd: liveUsd,
                                        }
                                      : prev
                                  );
                                }}
                                className="w-full pl-7 pr-2 py-1.5 border border-[#ded7cb] focus:border-[#182a24] bg-white font-mono text-xs font-semibold text-[#182a24]"
                                placeholder="1050000"
                              />
                            </div>
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[10px] font-mono text-stone-400">$</span>
                              <input
                                type="number"
                                readOnly
                                value={idrToLiveUsd(editingRoom.priceFridayIdr ?? 0, usdExchangeRate)}
                                className="w-full pl-5 pr-10 py-1.5 border border-[#ded7cb] bg-[#f7f5ef] font-mono text-xs font-semibold text-[#182a24] cursor-default"
                                title={`Otomatis mengikuti kurs saat ini: Rp ${(editingRoom.priceFridayIdr ?? 0).toLocaleString('id-ID')} ÷ ${usdExchangeRate.toLocaleString('id-ID')}`}
                              />
                              <span className="absolute right-1.5 top-1.5 px-1 py-0.5 bg-emerald-100 text-emerald-800 text-[8.5px] font-mono font-bold rounded uppercase">
                                Live
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 hidden sm:table-cell">
                            <span className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[9.5px] font-semibold border border-amber-200">
                              Pra-Weekend
                            </span>
                          </td>
                        </tr>

                        {/* 3. Saturday (Sabtu) */}
                        <tr className="hover:bg-[#faf9f5] transition-colors">
                          <td className="py-2 px-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                              <div>
                                <div className="font-bold text-[#182a24] text-xs">Saturday</div>
                                <div className="text-[9.5px] text-[#73837b]">Hari Sabtu</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[10px] font-mono text-stone-400">Rp</span>
                              <input
                                type="number"
                                min={0}
                                required
                                value={editingRoom.priceSaturdayIdr ?? 0}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const val = raw === '' ? 0 : Math.max(0, Number(raw));
                                  const liveUsd = idrToLiveUsd(val, usdExchangeRate);
                                  setEditingRoom((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          priceSaturdayIdr: val,
                                          priceSaturdayUsd: liveUsd,
                                        }
                                      : prev
                                  );
                                }}
                                className="w-full pl-7 pr-2 py-1.5 border border-[#ded7cb] focus:border-[#182a24] bg-white font-mono text-xs font-semibold text-[#182a24]"
                                placeholder="1350000"
                              />
                            </div>
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[10px] font-mono text-stone-400">$</span>
                              <input
                                type="number"
                                readOnly
                                value={idrToLiveUsd(editingRoom.priceSaturdayIdr ?? 0, usdExchangeRate)}
                                className="w-full pl-5 pr-10 py-1.5 border border-[#ded7cb] bg-[#f7f5ef] font-mono text-xs font-semibold text-[#182a24] cursor-default"
                                title={`Otomatis mengikuti kurs saat ini: Rp ${(editingRoom.priceSaturdayIdr ?? 0).toLocaleString('id-ID')} ÷ ${usdExchangeRate.toLocaleString('id-ID')}`}
                              />
                              <span className="absolute right-1.5 top-1.5 px-1 py-0.5 bg-emerald-100 text-emerald-800 text-[8.5px] font-mono font-bold rounded uppercase">
                                Live
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 hidden sm:table-cell">
                            <span className="inline-block px-1.5 py-0.5 bg-rose-50 text-rose-800 text-[9.5px] font-semibold border border-rose-200">
                              Peak Weekend
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#76847d] pt-0.5">
                    <span>* Tarif Sun-Thurs otomatis tersimpan sebagai harga dasar (base price).</span>
                    <span className="font-mono text-[#182a24] font-medium">Brosur Chevilly 2026</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Luas Kamar</label>
                  <input
                    type="text"
                    value={editingRoom.area || '68 m²'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, area: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Kapasitas</label>
                  <input
                    type="text"
                    value={editingRoom.capacity || '2 Dewasa'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, capacity: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3 p-3 bg-[#f2eee3] border border-[#ded7cb]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-semibold text-[#182a24] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#967d58]" />
                    <span>Foto Kamar / Villa &amp; Hover</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDetailPreviewActivePhoto(0);
                        setIsRoomDetailEditorOpen(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-[#182a24] text-[#182a24] hover:text-[#fae7b3] border border-[#182a24] text-[10.5px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      title="Edit 3 Foto Galeri & Detail Preview Kamar"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Detail (3 Foto &amp; Preview)</span>
                    </button>
                    <label className="px-3 py-1 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[10.5px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all">
                      {isModalUploading ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-[#d4af37]" />
                      ) : (
                        <Upload className="w-3 h-3 text-[#d4af37]" />
                      )}
                      <span>{isModalUploading ? 'Mengunggah...' : 'Upload Foto Utama'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isModalUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleModalRoomImageUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Foto Utama */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#52645c] font-semibold block">
                    1. Foto Utama (Tampilan Awal Kartu)
                  </span>
                  <div className="flex items-center gap-3">
                    {editingRoom.image && (
                      <div className="w-16 h-12 rounded border border-[#ded7cb] overflow-hidden bg-stone-200 shrink-0">
                        <img
                          src={editingRoom.image}
                          alt="Preview Foto Utama"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      value={editingRoom.image || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingRoom((prev) => {
                          if (!prev) return prev;
                          const base1 = prev.gallery?.[1] ?? '';
                          const base2 = prev.gallery?.[2] ?? '';
                          return { ...prev, image: val, gallery: [val, base1, base2] };
                        });
                      }}
                      placeholder="/src/assets/images/... atau https://..."
                      className="flex-1 border border-[#ded7cb] px-3 py-2 bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Foto Hover (gallery[1]) */}
                <div className="pt-2.5 border-t border-[#ded7cb] space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#52645c] font-semibold">
                      2. Foto Hover (Muncul Saat Kursor Diarahkan ke Kartu)
                    </span>
                    <div className="flex items-center gap-1.5">
                      {editingRoom.gallery?.[1] && (
                        <button
                          type="button"
                          onClick={() => updateRoomGallerySlot(1, '')}
                          className="px-2 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50 border border-rose-200 bg-white cursor-pointer"
                          title="Hapus Foto Hover"
                        >
                          Hapus
                        </button>
                      )}
                      <label className="px-2.5 py-0.5 bg-[#967d58] hover:bg-[#7d6644] text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors">
                        {uploadingGallerySlot === 1 ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        <span>{uploadingGallerySlot === 1 ? 'Unggah...' : 'Upload Foto Hover'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingGallerySlot === 1}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleModalRoomGallerySlotUpload(1, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded border border-[#ded7cb] overflow-hidden bg-stone-200 shrink-0 flex items-center justify-center">
                      {editingRoom.gallery?.[1] ? (
                        <img
                          src={editingRoom.gallery[1]}
                          alt="Preview Foto Hover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-stone-400 font-mono text-center px-1">Belum ada</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editingRoom.gallery?.[1] || ''}
                      onChange={(e) => updateRoomGallerySlot(1, e.target.value)}
                      placeholder="URL foto kedua saat hover (/src/assets/... atau https://...)"
                      className="flex-1 border border-[#ded7cb] px-3 py-2 bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Strip ringkas status 3 foto & detail preview */}
                <div className="pt-2 border-t border-[#ded7cb] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#52645c]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>Galeri Detail:</span>
                    {[0, 1, 2].map((idx) => {
                      const hasPhoto = Boolean(
                        idx === 0
                          ? editingRoom.gallery?.[0] || editingRoom.image
                          : editingRoom.gallery?.[idx]
                      );
                      return (
                        <span
                          key={idx}
                          className={`px-1.5 py-0.5 border text-[9.5px] ${
                            hasPhoto
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-stone-100 text-stone-400 border-stone-300'
                          }`}
                        >
                          Foto {idx + 1}{idx === 1 ? ' (Hover)' : ''}
                        </span>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailPreviewActivePhoto(0);
                      setIsRoomDetailEditorOpen(true);
                    }}
                    className="font-semibold text-[#182a24] hover:text-[#967d58] underline cursor-pointer"
                  >
                    Atur 3 Foto &amp; Detail Preview ({(editingRoom.features || []).length} fitur)
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#182a24]">Deskripsi / Keterangan Singkat</label>
                  <button
                    type="button"
                    onClick={() => setEditingRoom((prev) => prev ? { ...prev, showDescription: prev.showDescription === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingRoom.showDescription !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Deskripsi di halaman depan"
                  >
                    {editingRoom.showDescription !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingRoom.showDescription !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editingRoom.description || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  placeholder="Deskripsi singkat fasilitas dan keunggulan kamar..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#ded7cb] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 border border-[#ded7cb] text-stone-600 hover:text-stone-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#182a24] text-white font-semibold uppercase tracking-wider hover:bg-[#284138]"
                >
                  Simpan Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TOUR MODAL */}
      {isTourModalOpen && editingTour && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-lg shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb] mb-4">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                {tours.some((t) => t.id === editingTour.id) ? 'Edit Data Wahana Wisata' : 'Tambah Wahana Wisata Baru'}
              </h4>
              <button onClick={() => setIsTourModalOpen(false)}><X className="w-5 h-5 text-stone-600" /></button>
            </div>

            <form onSubmit={handleSaveTour} autoComplete="off" className="space-y-3.5">
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#182a24]">Nama Wahana / Wisata</label>
                  <button
                    type="button"
                    onClick={() => setEditingTour((prev) => prev ? { ...prev, showName: prev.showName === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingTour.showName !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Nama Wahana di halaman depan"
                  >
                    {editingTour.showName !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingTour.showName !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editingTour.name || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, name: e.target.value })}
                  placeholder="Contoh: Chevilly Waterpark & Splashing Lagoon"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs font-medium"
                />
              </div>

              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#182a24]">Kicker / Sub-Judul Singkat</label>
                  <button
                    type="button"
                    onClick={() => setEditingTour((prev) => prev ? { ...prev, showKicker: prev.showKicker === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingTour.showKicker !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Kicker di halaman depan"
                  >
                    {editingTour.showKicker !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingTour.showKicker !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editingTour.kicker || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, kicker: e.target.value })}
                  placeholder="Contoh: Kolam Renang & Wahana Air Keluarga Pegunungan"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Kategori Filter</label>
                  <select
                    value={editingTour.category || 'wahana'}
                    onChange={(e) => setEditingTour({ ...editingTour, category: e.target.value as any })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  >
                    <option value="wahana">Waterpark & Wahana Air</option>
                    <option value="spot-foto">Spot Foto Ikonik</option>
                    <option value="adventure">Adventure & Adrenalin</option>
                    <option value="keluarga">Keluarga & Edukasi</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#182a24]">Harga Tiket (Rp)</label>
                    <button
                      type="button"
                      onClick={() => setEditingTour((prev) => prev ? { ...prev, showPrice: prev.showPrice === false ? true : false } : prev)}
                      className={`px-1.5 py-0.5 text-[9.5px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingTour.showPrice !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Harga di halaman depan"
                    >
                      {editingTour.showPrice !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingTour.showPrice !== false ? '✓' : '✗'}</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    value={editingTour.priceIdr || 0}
                    onChange={(e) => setEditingTour({ ...editingTour, priceIdr: Number(e.target.value) })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#182a24]">Jam Operasional</label>
                    <button
                      type="button"
                      onClick={() => setEditingTour((prev) => prev ? { ...prev, showDuration: prev.showDuration === false ? true : false } : prev)}
                      className={`px-1.5 py-0.5 text-[9.5px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingTour.showDuration !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Jam Operasional di halaman depan"
                    >
                      {editingTour.showDuration !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingTour.showDuration !== false ? '✓' : '✗'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingTour.duration || '08:00 - 17:00 WIB'}
                    onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold block mb-1">Pengawas / Guide</label>
                  <input
                    type="text"
                    value={editingTour.guideType || 'Staff Pengawas Wahana'}
                    onChange={(e) => setEditingTour({ ...editingTour, guideType: e.target.value })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2.5 p-3 bg-[#f2eee3] border border-[#ded7cb]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-semibold text-[#182a24] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#967d58]" />
                    <span>Foto Wahana / Wisata &amp; Detail</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTourDetailPreviewActivePhoto(0);
                        setIsTourDetailEditorOpen(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-[#182a24] text-[#182a24] hover:text-[#fae7b3] border border-[#182a24] text-[10.5px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      title="Edit Detail Wahana, 3 Foto Galeri, Jam Keberangkatan, Inclusions & Perlengkapan"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Detail (3 Foto &amp; Preview)</span>
                    </button>
                    <label className="px-3 py-1 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[10.5px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all">
                      {isModalUploading ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-[#d4af37]" />
                      ) : (
                        <Upload className="w-3 h-3 text-[#d4af37]" />
                      )}
                      <span>{isModalUploading ? 'Mengunggah...' : 'Upload Foto dari Perangkat'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isModalUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleModalTourImageUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {editingTour.image && (
                    <div className="w-16 h-12 rounded border border-[#ded7cb] overflow-hidden bg-stone-200 shrink-0">
                      <img
                        src={editingTour.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={editingTour.image || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingTour((prev) => {
                        if (!prev) return prev;
                        const base1 = prev.gallery?.[1] ?? '';
                        const base2 = prev.gallery?.[2] ?? '';
                        return { ...prev, image: val, gallery: [val, base1, base2] };
                      });
                    }}
                    placeholder="/src/assets/images/... atau https://..."
                    className="flex-1 border border-[#ded7cb] px-3 py-2 bg-white font-mono text-[11px]"
                  />
                </div>
                <p className="text-[10px] text-[#73837b]">
                  Klik &quot;Edit Detail (3 Foto &amp; Preview)&quot; untuk mengatur foto galeri, tingkat kesulitan, elevasi, jam keberangkatan, fasilitas, &amp; perlengkapan wahana.
                </p>
              </div>

              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#182a24]">Deskripsi Wahana</label>
                  <button
                    type="button"
                    onClick={() => setEditingTour((prev) => prev ? { ...prev, showDescription: prev.showDescription === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingTour.showDescription !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Deskripsi di halaman depan"
                  >
                    {editingTour.showDescription !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingTour.showDescription !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editingTour.description || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
                  placeholder="Deskripsi singkat wahana wisata..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#ded7cb] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTourModalOpen(false)}
                  className="px-4 py-2 border border-[#ded7cb] text-stone-600 hover:text-stone-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#182a24] text-white font-semibold uppercase tracking-wider hover:bg-[#284138]"
                >
                  Simpan Wahana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH KATEGORI */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-lg shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb] mb-4">
              <h4 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#967d58]" />
                <span>
                  {categories.some((c) => c.id === editingCategory.id)
                    ? 'Edit Kategori Kamar'
                    : 'Tambah Kategori Kamar Baru'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} autoComplete="off" className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#182a24] block mb-1">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.label || ''}
                  onChange={(e) => {
                    const label = e.target.value;
                    const autoId = label.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
                    setEditingCategory({
                      ...editingCategory,
                      label,
                      name: label,
                      id: editingCategory.id && !editingCategory.id.startsWith('cat-') ? editingCategory.id : autoId,
                    });
                  }}
                  placeholder="Contoh: Deluxe, FTB, Glamping, Villa, Suites..."
                  className="w-full border border-[#ded7cb] px-3.5 py-2.5 bg-white text-sm font-semibold text-[#182a24] focus:outline-none focus:border-[#967d58]"
                />
                <p className="text-[10px] text-[#73837b] mt-1">Nama kategori yang ditampilkan pada tab filter & form data kamar.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#182a24] block mb-1">
                  Kode / Slug Kategori (Sistem)
                </label>
                <input
                  type="text"
                  value={editingCategory.id || ''}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                    })
                  }
                  placeholder="deluxe, ftb, glamping, villa..."
                  className="w-full border border-[#ded7cb] px-3.5 py-2 bg-white font-mono text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                />
                <p className="text-[9.5px] text-[#73837b] mt-1">Kode unik sistem tanpa spasi (otomatis dihasilkan).</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ded7cb]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-100 text-stone-700 cursor-pointer font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Simpan Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MAP LOCATION (PETA KAWASAN) MODAL */}
      {isMapLocationModalOpen && editingMapLocation && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-xl shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb] mb-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#967d58]" />
                  <span>
                    {editingMapLocation.id && mapLocations.some((l) => String(l.id) === String(editingMapLocation.id))
                      ? 'Edit Titik Kawasan & Media'
                      : 'Tambah Titik Kawasan Baru'}
                  </span>
                </h4>
                <p className="text-[11px] text-[#52645c] mt-0.5">
                  Atur nomor, kategori, foto galeri, serta video YouTube embed untuk titik peta interaktif resor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMapDetailEditorOpen(false);
                  setIsMapLocationModalOpen(false);
                  setEditingMapLocation(null);
                }}
                className="p-1 hover:bg-stone-200 rounded cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleSaveMapLocation} autoComplete="off" className="space-y-4">
              {/* Row 1: Nomor & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                    Nomor / Kode Titik Peta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMapLocation.number || ''}
                    onChange={(e) => setEditingMapLocation({ ...editingMapLocation, number: e.target.value })}
                    placeholder="Contoh: 1, 2, 64, P..."
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white font-mono font-bold text-sm text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                  <p className="text-[10px] text-[#73837b] mt-0.5">Nomor pin yang tampil di legenda & peta SVG.</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                    Kategori Kawasan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingMapLocation.category || 'wahana'}
                    onChange={(e) => setEditingMapLocation({ ...editingMapLocation, category: e.target.value as any })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white font-semibold text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  >
                    <option value="wahana">Wahana & Wisata</option>
                    <option value="villa">Vila & Glamping / Penginapan</option>
                    <option value="kuliner">Restoran & Kuliner</option>
                    <option value="meeting">Meeting & Event / Wedding</option>
                    <option value="fasilitas">Fasilitas Umum & Pelayanan</option>
                  </select>
                  <p className="text-[10px] text-[#73837b] mt-0.5">Menentukan warna pin dan filter kategori pengunjung.</p>
                </div>
              </div>

              {/* Row 2: Nama Kawasan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#182a24]">
                    Nama Kawasan / Titik Lokasi <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingMapLocation((prev) => prev ? { ...prev, showName: prev.showName === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingMapLocation.showName !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Nama Kawasan di halaman depan"
                  >
                    {editingMapLocation.showName !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingMapLocation.showName !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editingMapLocation.name || ''}
                  onChange={(e) => setEditingMapLocation({ ...editingMapLocation, name: e.target.value })}
                  placeholder="Contoh: Green Fountain & Gazebo, Kolam Renang Utama, Vine Restaurant..."
                  className="w-full border border-[#ded7cb] px-3.5 py-2.5 bg-white font-serif text-sm font-bold text-[#182a24] focus:outline-none focus:border-[#967d58]"
                />
              </div>

              {/* Row 3: Jam Operasional & Catatan Tarif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#182a24]">
                      Jam Operasional
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingMapLocation((prev) => prev ? { ...prev, showHours: prev.showHours === false ? true : false } : prev)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingMapLocation.showHours !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Jam Operasional di halaman depan"
                    >
                      {editingMapLocation.showHours !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingMapLocation.showHours !== false ? '✓ Tampil' : '✗ Sembunyi'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingMapLocation.hours || ''}
                    onChange={(e) => setEditingMapLocation({ ...editingMapLocation, hours: e.target.value })}
                    placeholder="Contoh: 08:00 - 17:00 WIB / 24 Jam"
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#182a24]">
                      Catatan Tiket / Fasilitas
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingMapLocation((prev) => prev ? { ...prev, showPrice: prev.showPrice === false ? true : false } : prev)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingMapLocation.showPrice !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Catatan Tiket di halaman depan"
                    >
                      {editingMapLocation.showPrice !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingMapLocation.showPrice !== false ? '✓ Tampil' : '✗ Sembunyi'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingMapLocation.priceNote || ''}
                    onChange={(e) => setEditingMapLocation({ ...editingMapLocation, priceNote: e.target.value })}
                    placeholder="Contoh: Tiket Wahana Rp 25.000 / Gratis Tamu Menginap"
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                </div>
              </div>

              {/* Row 4: Deskripsi Titik Kawasan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#182a24]">
                    Deskripsi Lengkap Titik Kawasan
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingMapLocation((prev) => prev ? { ...prev, showDescription: prev.showDescription === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingMapLocation.showDescription !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Deskripsi di halaman depan"
                  >
                    {editingMapLocation.showDescription !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingMapLocation.showDescription !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editingMapLocation.description || ''}
                  onChange={(e) => setEditingMapLocation({ ...editingMapLocation, description: e.target.value })}
                  placeholder="Ceritakan keistimewaan, suasana alam, atau petunjuk lokasi titik ini di resor..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-white text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                />
              </div>

              {/* Media Section 1: FOTO KAWASAN & EDIT POPUP DETAIL */}
              <div className="p-3.5 bg-[#f2eee3] border border-[#ded7cb] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-[#182a24] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#967d58]" />
                    <span>Foto Galeri &amp; Popup Detail Kawasan</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMapDetailPreviewActivePhoto(0);
                        setIsMapDetailEditorOpen(true);
                      }}
                      className="px-3 py-1 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#b38f22] text-[#182a24] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#8a6d19]" />
                      <span>Edit Popup Detail (3 Foto &amp; Preview)</span>
                    </button>
                    <label className="px-3 py-1 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all">
                      <Upload className="w-3 h-3 text-[#d4af37]" />
                      <span>Upload Foto Utama</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMapLocationImageUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {editingMapLocation.image && (
                    <div className="w-18 h-14 rounded border border-[#ded7cb] overflow-hidden bg-stone-200 shrink-0 shadow-2xs">
                      <img
                        src={editingMapLocation.image}
                        alt="Preview Foto Kawasan"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={editingMapLocation.image || ''}
                    onChange={(e) => updateMapLocationImageSlot(0, e.target.value)}
                    placeholder="/src/assets/images/... atau https://images.unsplash.com/..."
                    className="flex-1 border border-[#ded7cb] px-3 py-2 bg-white font-mono text-[11px] text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#73837b]">
                  <span>
                    Atur 3 foto galeri, tagline, daftar keunggulan, dan pratinjau popup lengkap via <strong>Edit Popup Detail</strong>.
                  </span>
                  <span className="font-mono text-[#182a24] bg-white border border-[#ded7cb] px-2 py-0.5">
                    {(editingMapLocation.images || []).filter(Boolean).length || (editingMapLocation.image ? 1 : 0)} Foto · {(editingMapLocation.features || []).filter((f) => f.trim()).length} Keunggulan
                  </span>
                </div>
              </div>

              {/* Media Section 2: VIDEO EMBED & STREAMING */}
              <div className="p-3.5 bg-[#f2eee3] border border-[#ded7cb] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#182a24] flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>Sematkan Video Embed (YouTube / Direct Video)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#73837b]">YouTube / MP4 / Iframe</span>
                </div>

                <textarea
                  rows={2}
                  value={editingMapLocation.videoEmbed || editingMapLocation.videoUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingMapLocation((prev) => (prev ? { ...prev, videoEmbed: val, videoUrl: val } : prev));
                  }}
                  placeholder="Tempel URL YouTube (https://www.youtube.com/watch?v=... atau https://youtu.be/...) atau kode <iframe> embed..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-white font-mono text-[11px] text-[#182a24] focus:outline-none focus:border-[#967d58]"
                />
                <p className="text-[10px] text-[#73837b]">
                  Pengunjung dapat menonton video langsung saat mengklik titik kawasan pada peta interaktif.
                </p>

                {/* Live Video Preview Box */}
                {(() => {
                  const parsed = parseVideoEmbedSource(editingMapLocation.videoEmbed || editingMapLocation.videoUrl);
                  if (!parsed) return null;
                  return (
                    <div className="mt-2 p-2 bg-white border border-[#ded7cb] shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between pb-1 border-b border-[#ded7cb] text-[10.5px] font-semibold text-[#182a24]">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                          <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          <span>Live Preview Embed Video</span>
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono">
                          {parsed.type === 'iframe' ? 'YouTube / Iframe' : 'HTML5 Video'}
                        </span>
                      </div>
                      <div className="aspect-video w-full rounded overflow-hidden bg-black max-h-48">
                        {parsed.type === 'iframe' ? (
                          <iframe
                            src={parsed.src}
                            title="Live Video Preview"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={parsed.src}
                            controls
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#ded7cb]">
                <button
                  type="button"
                  onClick={() => {
                    setMapDetailPreviewActivePhoto(0);
                    setIsMapDetailEditorOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#f2eee3] hover:bg-[#e6dfd0] border border-[#b38f22] text-[#182a24] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#8a6d19]" />
                  <span>Edit Popup Detail</span>
                </button>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMapDetailEditorOpen(false);
                      setIsMapLocationModalOpen(false);
                      setEditingMapLocation(null);
                    }}
                    className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-100 text-stone-700 cursor-pointer font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Simpan Titik Kawasan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT VENUE (RESTO, MEETING, WEDDING) MODAL */}
      {isVenueModalOpen && editingVenue && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-xl shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb] mb-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-[#967d58]" />
                  <span>
                    {editingVenue.id && venueItems.some((v) => v.id === editingVenue.id)
                      ? 'Edit Resto / Meeting / Wedding'
                      : 'Tambah Venue / Paket Baru'}
                  </span>
                </h4>
                <p className="text-[11px] text-[#52645c] mt-0.5">
                  Atur nama venue, kategori, kapasitas tamu, foto galeri, dan template WhatsApp otomatis ke kontak BDE.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVenueModalOpen(false);
                  setEditingVenue(null);
                }}
                className="p-1 hover:bg-stone-200 rounded cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleSaveVenue} autoComplete="off" className="space-y-4">
              {/* Row 1: Nama & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#182a24]">
                      Nama Venue / Paket <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingVenue((prev) => prev ? { ...prev, showName: prev.showName === false ? true : false } : prev)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingVenue.showName !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Nama Venue di halaman depan"
                    >
                      {editingVenue.showName !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingVenue.showName !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingVenue.name || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                    placeholder="Contoh: Vine Restaurant, Grand Ballroom, Pine Wedding..."
                    className="w-full border border-[#ded7cb] px-3.5 py-2 bg-white font-serif text-sm font-bold text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                    Kategori Menu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingVenue.category || 'resto'}
                    onChange={(e) => setEditingVenue({ ...editingVenue, category: e.target.value as any })}
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white font-semibold text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  >
                    <option value="resto">Resto & Cafe (Kuliner)</option>
                    <option value="meeting">Meeting Room & MICE</option>
                    <option value="wedding">Wedding & Social Events</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#182a24]">
                      Kapasitas Tamu / Kursi
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingVenue((prev) => prev ? { ...prev, showCapacity: prev.showCapacity === false ? true : false } : prev)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingVenue.showCapacity !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Kapasitas di halaman depan"
                    >
                      {editingVenue.showCapacity !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingVenue.showCapacity !== false ? '✓ Tampil' : '✗ Sembunyi'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingVenue.capacity || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, capacity: e.target.value })}
                    placeholder="Contoh: 150 Kursi / 300 - 500 Orang"
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                </div>
              </div>

              {/* Row 2: Jam Operasional & Catatan Tarif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#182a24]">
                      Jam Operasional / Durasi
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingVenue((prev) => prev ? { ...prev, showHours: prev.showHours === false ? true : false } : prev)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingVenue.showHours !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Jam Operasional di halaman depan"
                    >
                      {editingVenue.showHours !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingVenue.showHours !== false ? '✓ Tampil' : '✗ Sembunyi'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingVenue.hours || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, hours: e.target.value })}
                    placeholder="Contoh: 07:00 - 22:00 WIB / Full Day"
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#182a24]">
                      Catatan Tarif / Harga
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingVenue((prev) => prev ? { ...prev, showPrice: prev.showPrice === false ? true : false } : prev)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingVenue.showPrice !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Catatan Harga di halaman depan"
                    >
                      {editingVenue.showPrice !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingVenue.showPrice !== false ? '✓ Tampil' : '✗ Sembunyi'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingVenue.priceNote || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, priceNote: e.target.value })}
                    placeholder="Contoh: Mulai Rp 35.000 / pax atau Rp 28.500.000 / paket"
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-white text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                </div>
              </div>

              {/* Row 3: Deskripsi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#182a24]">
                    Deskripsi Venue & Suasana
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingVenue((prev) => prev ? { ...prev, showDescription: prev.showDescription === false ? true : false } : prev)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      editingVenue.showDescription !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Deskripsi di halaman depan"
                  >
                    {editingVenue.showDescription !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingVenue.showDescription !== false ? '✓ Tampil di Depan' : '✗ Sembunyi'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editingVenue.description || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, description: e.target.value })}
                  placeholder="Jelaskan keistimewaan konsep, view pemandangan, hidangan unggulan, atau fasilitas..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-white text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                />
              </div>

              {/* Row 4: Fitur & Fasilitas (Koma sebagai pemisah) */}
              <div>
                <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                  Fasilitas Unggulan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={editingVenue.features ? editingVenue.features.join(', ') : ''}
                  onChange={(e) => {
                    const feats = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setEditingVenue({ ...editingVenue, features: feats });
                  }}
                  placeholder="Contoh: Indoor & Outdoor, Sound System, Proyektor, Free Wi-Fi"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-white text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                />
                <p className="text-[10px] text-[#73837b] mt-0.5">Tampil sebagai tag centang hijau pada kartu venue.</p>
              </div>

              {/* Media Section: FOTO VENUE */}
              <div className="p-3.5 bg-[#f2eee3] border border-[#ded7cb] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#182a24] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#967d58]" />
                    <span>Foto Venue / Paket (Upload dari Galeri atau URL)</span>
                  </label>
                  <label className="px-3 py-1 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all">
                    <Upload className="w-3 h-3 text-[#d4af37]" />
                    <span>Upload Foto dari Perangkat</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVenueImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {editingVenue.image && (
                    <div className="w-20 h-14 rounded border border-[#ded7cb] overflow-hidden bg-stone-200 shrink-0 shadow-2xs">
                      <img
                        src={editingVenue.image}
                        alt="Preview Foto Venue"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={editingVenue.image || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, image: e.target.value })}
                    placeholder="/src/assets/images/... atau https://images.unsplash.com/..."
                    className="flex-1 border border-[#ded7cb] px-3 py-2 bg-white font-mono text-[11px] text-[#182a24] focus:outline-none focus:border-[#967d58]"
                  />
                </div>
                <p className="text-[10px] text-[#73837b]">
                  Dapat langsung mengunggah file foto dari HP/laptop atau menempel tautan URL gambar.
                </p>
              </div>

              {/* WhatsApp BDE Integration Preview */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-emerald-900 font-semibold text-xs">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                    <span>Integrasi WhatsApp Kontak BDE Langsung</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700">
                    {resortInfo?.bdeName || 'BDE DEFIT'} ({resortInfo?.whatsappFormatted || '+62 859-3454-4901'})
                  </span>
                </div>
                <p className="text-[10.5px] text-emerald-800 leading-relaxed">
                  Setiap kartu venue memiliki tombol hijau <strong>"Chat WA ke BDE"</strong> yang otomatis membuka aplikasi WhatsApp dengan pesan terformat rapi sesuai venue ini.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ded7cb]">
                <button
                  type="button"
                  onClick={() => {
                    setIsVenueModalOpen(false);
                    setEditingVenue(null);
                  }}
                  className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-100 text-stone-700 cursor-pointer font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Simpan Venue / Paket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS KATEGORI */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-sm sm:max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                Yakin akan menghapus data ini
              </h4>
              <p className="text-xs text-[#52645c] leading-relaxed">
                Kategori <strong className="text-[#182a24]">"{categoryToDelete.label}"</strong> akan dihapus dari sistem portal Chevilly Resort & Camp.
              </p>
              {(() => {
                const activeCount = rooms.filter(
                  (r) =>
                    (r.category || '').toLowerCase() === categoryToDelete.id.toLowerCase() ||
                    (r.category || '').toLowerCase() === categoryToDelete.label.toLowerCase()
                ).length;
                if (activeCount > 0) {
                  return (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded text-left">
                      <strong>Info:</strong> Kategori ini saat ini digunakan oleh {activeCount} kamar. Kamar terdaftar tetap tersimpan aman.
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#ded7cb]">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT VIDEO HERO */}
      {isHeroVideoModalOpen && editingHeroVideo && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-xl shadow-2xl p-6 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb] mb-4">
              <h4 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
                <Video className="w-5 h-5 text-[#967d58]" />
                <span>
                  {heroVideos.some((v) => v.id === editingHeroVideo.id)
                    ? 'Edit Video Hero YouTube'
                    : 'Tambah Video Hero YouTube Baru'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsHeroVideoModalOpen(false);
                  setEditingHeroVideo(null);
                }}
                className="p-1 hover:bg-stone-200 cursor-pointer text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHeroVideo} autoComplete="off" className="space-y-4">
              {/* Judul Video with Checklist Button */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#182a24] flex items-center gap-1.5">
                    <span>Judul Video Hero</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingHeroVideo((prev) => prev ? { ...prev, showTitle: prev.showTitle === false ? true : false } : prev)}
                    className={`px-2.5 py-1 text-[10.5px] font-mono font-semibold border flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                      editingHeroVideo.showTitle !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Judul di halaman depan"
                  >
                    {editingHeroVideo.showTitle !== false ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-stone-400" />
                    )}
                    <span>{editingHeroVideo.showTitle !== false ? '✓ Tampil di Halaman Depan' : '✗ Sembunyikan di Depan'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editingHeroVideo.title || ''}
                  onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, title: e.target.value })}
                  placeholder="Contoh: Chevilly Resort & Camp — Full Cinematic Tour 1080p"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24] font-medium"
                />
              </div>

              {/* YouTube Link or Embed Code */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <label className="text-xs font-semibold text-[#182a24] block">
                  Link YouTube / Embed Code / Shorts <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingHeroVideo.youtubeUrl || ''}
                  onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... atau https://www.youtube.com/shorts/..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] font-mono text-[11px] text-[#182a24] focus:outline-none focus:border-[#967d58]"
                />
                <p className="text-[10px] text-[#73837b] font-mono">
                  Mendukung format: URL biasa (watch?v=), Shorts, youtu.be, atau kode embed &lt;iframe&gt;.
                </p>
              </div>

              {/* Live Preview Box */}
              {editingHeroVideo.youtubeUrl && (
                <div className="space-y-1.5 p-3 bg-stone-100 border border-stone-200 rounded">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                      <span>Live Preview Player YouTube</span>
                    </span>
                    <span className="font-mono text-[10px] text-stone-500">Kualitas HD</span>
                  </div>

                  {(() => {
                    const parsed = parseYouTubeVideo(editingHeroVideo.youtubeUrl);
                    if (!parsed) {
                      return (
                        <div className="p-4 bg-amber-50 text-amber-800 text-center text-xs border border-amber-200">
                          URL belum valid. Silakan masukkan link YouTube yang valid.
                        </div>
                      );
                    }
                    return (
                      <div className="relative aspect-video bg-black overflow-hidden border border-stone-300 shadow-inner">
                        {parsed.type === 'video' ? (
                          <video src={parsed.embedUrl} controls className="w-full h-full object-cover" />
                        ) : (
                          <iframe
                            src={parsed.embedUrl.replace('autoplay=1', 'autoplay=0')}
                            title="Preview Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full object-cover border-0"
                          />
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Badge & Duration with Checklist Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#182a24]">
                      Label / Badge Video
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingHeroVideo((prev) => prev ? { ...prev, showBadge: prev.showBadge === false ? true : false } : prev)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingHeroVideo.showBadge !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Badge di halaman depan"
                    >
                      {editingHeroVideo.showBadge !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingHeroVideo.showBadge !== false ? '✓ Tampil' : '✗ Sembunyi'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingHeroVideo.badge || ''}
                    onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, badge: e.target.value })}
                    placeholder="Contoh: Full Tour HD 1080p, Shorts 60s"
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                  />
                </div>

                <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#182a24]">
                      Estimasi Durasi Video
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingHeroVideo((prev) => prev ? { ...prev, showDuration: prev.showDuration === false ? true : false } : prev)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                        editingHeroVideo.showDuration !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title="Checklist tombol untuk menampilkan atau menyembunyikan Durasi di halaman depan"
                    >
                      {editingHeroVideo.showDuration !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingHeroVideo.showDuration !== false ? '✓ Tampil' : '✗ Sembunyi'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingHeroVideo.duration || ''}
                    onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, duration: e.target.value })}
                    placeholder="Contoh: Full Tour, 3 Menit, 60 Detik"
                    className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                  />
                </div>
              </div>

              {/* Deskripsi / Keterangan with Checklist Button */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#182a24]">
                    Deskripsi / Keterangan Singkat
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingHeroVideo((prev) => prev ? { ...prev, showDescription: prev.showDescription === false ? true : false } : prev)}
                    className={`px-2.5 py-1 text-[10.5px] font-mono font-semibold border flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                      editingHeroVideo.showDescription !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Checklist tombol untuk menampilkan atau menyembunyikan Keterangan di halaman depan"
                  >
                    {editingHeroVideo.showDescription !== false ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-stone-400" />
                    )}
                    <span>{editingHeroVideo.showDescription !== false ? '✓ Tampil di Halaman Depan' : '✗ Sembunyikan di Depan'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editingHeroVideo.description || ''}
                  onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, description: e.target.value })}
                  placeholder="Tuliskan gambaran singkat video ini..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Checkbox Status Aktif */}
              <div className="p-3 bg-stone-100 border border-[#ded7cb] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#182a24]">Status Tampil di Beranda</div>
                  <div className="text-[10.5px] text-[#73837b]">
                    Jika diaktifkan, video ini akan masuk dalam rotasi carousel video latar belakang beranda.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editingHeroVideo.isActive !== false}
                  onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#182a24] cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ded7cb]">
                <button
                  type="button"
                  onClick={() => {
                    setIsHeroVideoModalOpen(false);
                    setEditingHeroVideo(null);
                  }}
                  className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-100 text-stone-700 cursor-pointer font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Simpan Video Hero</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS VIDEO HERO */}
      {heroVideoToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-sm sm:max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                Yakin akan menghapus data ini
              </h4>
              <p className="text-xs text-[#52645c] leading-relaxed">
                Video <strong className="text-[#182a24]">"{heroVideoToDelete.title}"</strong> akan dihapus dari sistem carousel hero beranda.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#ded7cb]">
              <button
                type="button"
                onClick={() => setHeroVideoToDelete(null)}
                className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteHeroVideo}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FASILITAS & LAYANAN TAMBAHAN MODAL */}
      {isAddOnModalOpen && editingAddOn && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-lg shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb] mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <h4 className="font-serif text-lg font-bold text-[#182a24]">
                  {addOns.some((a) => a.id === editingAddOn.id)
                    ? 'Edit Layanan Tambahan'
                    : 'Tambah Layanan Tambahan Baru'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddOnModalOpen(false);
                  setEditingAddOn(null);
                }}
                className="p-1 text-stone-500 hover:text-[#182a24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddOn} autoComplete="off" className="space-y-4">
              {/* Status Aktif */}
              <div className="p-3 bg-[#f5f2ea] border border-[#ded7cb] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#182a24]">
                    Status Layanan pada Form Reservasi
                  </div>
                  <div className="text-[10.5px] text-[#63746c]">
                    Jika aktif, tamu dapat memilih layanan ini pada Tahap 2 Pemesanan.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingAddOn((prev) =>
                      prev ? { ...prev, isActive: prev.isActive === false } : prev
                    )
                  }
                  className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider border cursor-pointer flex items-center gap-1.5 ${
                    editingAddOn.isActive !== false
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                      : 'bg-stone-100 text-stone-600 border-stone-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      editingAddOn.isActive !== false ? 'bg-emerald-500' : 'bg-stone-400'
                    }`}
                  />
                  <span>{editingAddOn.isActive !== false ? 'Aktif' : 'Nonaktif'}</span>
                </button>
              </div>

              {/* Nama Layanan */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#182a24]">
                    Nama Fasilitas / Layanan Tambahan *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAddOn((prev) =>
                        prev ? { ...prev, showName: prev.showName === false } : prev
                      )
                    }
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer ${
                      editingAddOn.showName !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                        : 'bg-stone-100 text-stone-500 border-stone-300'
                    }`}
                  >
                    {editingAddOn.showName !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingAddOn.showName !== false ? 'Tampil' : 'Sembunyi'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editingAddOn.name || ''}
                  onChange={(e) => setEditingAddOn({ ...editingAddOn, name: e.target.value })}
                  placeholder="Contoh: Paket BBQ & Api Unggun Privat Lembah Pinus"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Deskripsi */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#182a24]">
                    Deskripsi / Rincian Layanan
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAddOn((prev) =>
                        prev ? { ...prev, showDescription: prev.showDescription === false } : prev
                      )
                    }
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer ${
                      editingAddOn.showDescription !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                        : 'bg-stone-100 text-stone-500 border-stone-300'
                    }`}
                  >
                    {editingAddOn.showDescription !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingAddOn.showDescription !== false ? 'Tampil' : 'Sembunyi'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editingAddOn.description || ''}
                  onChange={(e) => setEditingAddOn({ ...editingAddOn, description: e.target.value })}
                  placeholder="Jelaskan fasilitas yang didapatkan tamu..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Unit / Satuan */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#182a24]">
                    Unit / Satuan Hitung
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAddOn((prev) =>
                        prev ? { ...prev, showUnit: prev.showUnit === false } : prev
                      )
                    }
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer ${
                      editingAddOn.showUnit !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                        : 'bg-stone-100 text-stone-500 border-stone-300'
                    }`}
                  >
                    {editingAddOn.showUnit !== false ? (
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Square className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{editingAddOn.showUnit !== false ? 'Tampil' : 'Sembunyi'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editingAddOn.unit || ''}
                  onChange={(e) => setEditingAddOn({ ...editingAddOn, unit: e.target.value })}
                  placeholder="Contoh: per paket, per malam, per pax / hari"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Harga IDR & USD */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#182a24]">
                    Tarif Layanan (IDR &amp; USD)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[10px] text-[#52645c] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAutoUsdCalc}
                        onChange={(e) => setIsAutoUsdCalc(e.target.checked)}
                        className="accent-[#182a24]"
                      />
                      <span>Auto USD (1:{usdExchangeRate.toLocaleString('id-ID')})</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingAddOn((prev) =>
                          prev ? { ...prev, showPrice: prev.showPrice === false } : prev
                        )
                      }
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold border flex items-center gap-1 cursor-pointer ${
                        editingAddOn.showPrice !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                          : 'bg-stone-100 text-stone-500 border-stone-300'
                      }`}
                    >
                      {editingAddOn.showPrice !== false ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{editingAddOn.showPrice !== false ? 'Tampil' : 'Sembunyi'}</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10.5px] font-mono text-[#73837b] block mb-1">
                      Harga Rupiah (IDR) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={editingAddOn.priceIdr ?? 0}
                      onChange={(e) => {
                        const idr = Number(e.target.value) || 0;
                        setEditingAddOn((prev) =>
                          prev
                            ? {
                                ...prev,
                                priceIdr: idr,
                                priceUsd: isAutoUsdCalc
                                  ? Math.max(1, Math.round(idr / usdExchangeRate))
                                  : prev.priceUsd,
                              }
                            : prev
                        );
                      }}
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] font-mono text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-mono text-[#73837b] block mb-1">
                      Harga Dollar (USD) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      required
                      value={editingAddOn.priceUsd ?? 0}
                      onChange={(e) =>
                        setEditingAddOn({
                          ...editingAddOn,
                          priceUsd: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] font-mono text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ded7cb]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOnModalOpen(false);
                    setEditingAddOn(null);
                  }}
                  className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-100 text-stone-700 cursor-pointer font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Simpan Layanan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS LAYANAN TAMBAHAN */}
      {addOnToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-sm sm:max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                Yakin akan menghapus data ini
              </h4>
              <p className="text-xs text-[#52645c] leading-relaxed">
                Layanan tambahan <strong className="text-[#182a24]">&quot;{addOnToDelete.name}&quot;</strong> akan dihapus permanen dari database &amp; formulir reservasi.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#ded7cb]">
              <button
                type="button"
                onClick={() => setAddOnToDelete(null)}
                className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAddOn}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS RESERVASI */}
      {reservationToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-sm sm:max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                Yakin akan menghapus reservasi ini?
              </h4>
              <p className="text-xs text-[#52645c] leading-relaxed">
                Data reservasi <strong className="font-mono text-[#182a24]">{reservationToDelete.bookingCode}</strong> atas nama <strong className="text-[#182a24]">&quot;{reservationToDelete.guestName}&quot;</strong> akan dihapus permanen dari database.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#ded7cb]">
              <button
                type="button"
                disabled={isDeletingReservation}
                onClick={() => setReservationToDelete(null)}
                className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                Tidak, Batal
              </button>
              <button
                type="button"
                disabled={isDeletingReservation}
                onClick={handleConfirmDeleteReservation}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingReservation ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS KAMAR / VILLA */}
      {roomToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-sm sm:max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                Yakin akan menghapus kamar ini?
              </h4>
              <p className="text-xs text-[#52645c] leading-relaxed">
                Data kamar <strong className="text-[#182a24]">&quot;{roomToDelete.name}&quot;</strong> akan dihapus permanen dari database &amp; halaman utama.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#ded7cb]">
              <button
                type="button"
                disabled={isDeletingRoom}
                onClick={() => setRoomToDelete(null)}
                className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                Tidak, Batal
              </button>
              <button
                type="button"
                disabled={isDeletingRoom}
                onClick={handleConfirmDeleteRoom}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingRoom ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP EDITOR 3 FOTO GALERI & DETAIL PREVIEW KAMAR */}
      {isRoomDetailEditorOpen && editingRoom && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] text-xs overflow-hidden">
            {/* Header */}
            <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
                  Editor Detail &amp; Galeri Kamar
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-white">
                  {editingRoom.name || 'Kamar Baru'} — 3 Foto Galeri &amp; Detail Preview
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsRoomDetailEditorOpen(false)}
                className="p-1.5 text-stone-300 hover:text-white cursor-pointer"
                aria-label="Tutup Editor Detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* 1. LIVE PREVIEW HEADER & 3 FOTO GALLERY */}
              {(() => {
                const slotPhotos = [
                  editingRoom.gallery?.[0] || editingRoom.image || '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
                  editingRoom.gallery?.[1] || '',
                  editingRoom.gallery?.[2] || '',
                ];
                const previewPhotos = slotPhotos.filter(Boolean);
                const activeSrc = previewPhotos[detailPreviewActivePhoto] || previewPhotos[0] || editingRoom.image || '';

                return (
                  <div className="bg-[#f2eee3] border border-[#ded7cb] p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#182a24] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#967d58]" />
                        <span>Live Preview Detail Modal</span>
                      </span>
                      <span className="text-[10px] text-[#52645c] font-mono">
                        Klik thumbnail di bawah untuk pratinjau tampilan detail tamu
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      <div className="lg:col-span-7 space-y-2">
                        <div className="relative aspect-[16/9] bg-[#24332c] border border-[#ded7cb] overflow-hidden">
                          {activeSrc && (
                            <img
                              src={activeSrc}
                              alt={editingRoom.name || 'Preview'}
                              className="w-full h-full object-cover object-center"
                            />
                          )}
                          <div className="absolute bottom-2.5 left-3 bg-black/65 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1">
                            {editingRoom.viewType || 'Panorama Pegunungan Puncak'}
                          </div>
                          <div className="absolute top-2.5 right-2.5 bg-black/65 text-[#fae7b3] text-[10px] font-mono px-2 py-0.5">
                            Foto #{detailPreviewActivePhoto + 1} / {previewPhotos.length || 1}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {previewPhotos.map((src, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setDetailPreviewActivePhoto(idx)}
                              className={`w-20 h-12 overflow-hidden border-2 cursor-pointer transition-all ${
                                detailPreviewActivePhoto === idx
                                  ? 'border-[#182a24] opacity-100'
                                  : 'border-transparent opacity-65 hover:opacity-100'
                              }`}
                            >
                              <img src={src} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="lg:col-span-5 bg-white border border-[#ded7cb] p-3.5 space-y-2.5 text-[11px]">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#967d58]">
                          {editingRoom.kicker || 'Kamar Chevilly'} · {editingRoom.altitude || '2.430 mdpl'}
                        </div>
                        <div className="font-serif text-base font-bold text-[#182a24] leading-snug">
                          {editingRoom.name || 'Nama Kamar'}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#eee9de] text-[10.5px]">
                          <div>
                            <span className="text-stone-400 block">Luas / Kapasitas</span>
                            <strong className="text-[#182a24]">{editingRoom.area || '38 m²'} · {editingRoom.capacity || '2 Dewasa'}</strong>
                          </div>
                          <div>
                            <span className="text-stone-400 block">Rating &amp; Ulasan</span>
                            <strong className="text-[#967d58] font-mono">★ {editingRoom.rating ?? 4.95} ({editingRoom.reviewsCount ?? 50})</strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-stone-400 block">Konfigurasi Ranjang</span>
                            <strong className="text-[#182a24]">{editingRoom.bedType || '1 King Bed'}</strong>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-[#eee9de] text-[10.5px] text-[#52645c]">
                          <span className="font-semibold text-[#182a24] block mb-1">
                            Keunggulan ({(editingRoom.features || []).length}):
                          </span>
                          <ul className="space-y-0.5 list-disc pl-4">
                            {(editingRoom.features || []).slice(0, 3).map((f, idx) => (
                              <li key={idx} className="truncate">{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. EDITOR 3 FOTO GALERI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif text-sm font-bold text-[#182a24] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#967d58]" />
                    <span>Kelola 3 Foto Galeri Kamar &amp; Hover</span>
                  </h5>
                  <span className="text-[10px] font-mono text-[#73837b]">
                    Slot Foto 2 otomatis menjadi Foto Hover pada kartu halaman depan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { index: 0, title: 'Foto 1 (Utama)', hint: 'Tampil default di kartu & detail' },
                    { index: 1, title: 'Foto 2 (Foto Hover)', hint: 'Muncul saat kursor hover di kartu' },
                    { index: 2, title: 'Foto 3 (Detail Galeri)', hint: 'Foto tambahan di popup Detail' },
                  ].map((slot) => {
                    const currentVal =
                      slot.index === 0
                        ? editingRoom.gallery?.[0] ?? editingRoom.image ?? ''
                        : editingRoom.gallery?.[slot.index] ?? '';
                    return (
                      <div key={slot.index} className="bg-white border border-[#ded7cb] p-3 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between gap-1">
                          <div>
                            <div className="font-semibold text-[#182a24] text-xs">{slot.title}</div>
                            <div className="text-[10px] text-[#73837b]">{slot.hint}</div>
                          </div>
                          {currentVal && slot.index > 0 && (
                            <button
                              type="button"
                              onClick={() => updateRoomGallerySlot(slot.index, '')}
                              className="px-1.5 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>

                        <div className="aspect-[16/10] bg-stone-100 border border-[#ded7cb] overflow-hidden flex items-center justify-center">
                          {currentVal ? (
                            <img src={currentVal} alt={slot.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-mono text-stone-400">Belum diisi</span>
                          )}
                        </div>

                        <label className="w-full py-1.5 px-2.5 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[10.5px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                          {uploadingGallerySlot === slot.index ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-[#d4af37]" />
                          ) : (
                            <Upload className="w-3 h-3 text-[#d4af37]" />
                          )}
                          <span>
                            {uploadingGallerySlot === slot.index ? 'Mengunggah...' : `Upload Foto ${slot.index + 1}`}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingGallerySlot === slot.index}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleModalRoomGallerySlotUpload(slot.index, file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => updateRoomGallerySlot(slot.index, e.target.value)}
                          placeholder={`/src/assets/images/... (Foto ${slot.index + 1})`}
                          className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#faf9f5] font-mono text-[10.5px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. EDITOR DETAIL PREVIEW LAINNYA */}
              <div className="space-y-3 pt-2 border-t border-[#ded7cb]">
                <h5 className="font-serif text-sm font-bold text-[#182a24] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#967d58]" />
                  <span>Edit Detail Preview Lainnya</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 border border-[#ded7cb]">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Konfigurasi Ranjang (Bed Type)
                    </label>
                    <input
                      type="text"
                      value={editingRoom.bedType || ''}
                      onChange={(e) => setEditingRoom({ ...editingRoom, bedType: e.target.value })}
                      placeholder="Contoh: 1 Custom Alpine King Bed / Twin Bed"
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Pemandangan / Caption Foto Detail (View Type)
                    </label>
                    <input
                      type="text"
                      value={editingRoom.viewType || ''}
                      onChange={(e) => setEditingRoom({ ...editingRoom, viewType: e.target.value })}
                      placeholder="Contoh: Panorama Puncak Pegunungan & Lembah Kabut"
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Elevasi (Altitude)
                    </label>
                    <input
                      type="text"
                      value={editingRoom.altitude || ''}
                      onChange={(e) => setEditingRoom({ ...editingRoom, altitude: e.target.value })}
                      placeholder="2.430 mdpl"
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Rating Kamar (1.0 - 5.0)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="5"
                      value={editingRoom.rating ?? 4.95}
                      onChange={(e) => setEditingRoom({ ...editingRoom, rating: Number(e.target.value) || 4.95 })}
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Jumlah Ulasan
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingRoom.reviewsCount ?? 50}
                      onChange={(e) => setEditingRoom({ ...editingRoom, reviewsCount: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Maks Dewasa / Anak
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={editingRoom.maxAdults ?? 2}
                        onChange={(e) => setEditingRoom({ ...editingRoom, maxAdults: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full border border-[#ded7cb] px-2 py-1.5 bg-[#fcfbf9] text-xs font-mono"
                        title="Maksimal Dewasa"
                      />
                      <input
                        type="number"
                        min="0"
                        value={editingRoom.maxChildren ?? 1}
                        onChange={(e) => setEditingRoom({ ...editingRoom, maxChildren: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full border border-[#ded7cb] px-2 py-1.5 bg-[#fcfbf9] text-xs font-mono"
                        title="Maksimal Anak"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 border border-[#ded7cb] space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#182a24] block">
                      Fasilitas &amp; Keunggulan Spesial (1 poin per baris)
                    </label>
                    <textarea
                      rows={5}
                      value={(editingRoom.features || []).join('\n')}
                      onChange={(e) =>
                        setEditingRoom({
                          ...editingRoom,
                          features: e.target.value.split('\n'),
                        })
                      }
                      placeholder={'Balkon kayu pribadi dengan panorama pegunungan\nKasur King-size mewah\nKamar mandi marmer dengan rain-shower'}
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs leading-relaxed"
                    />
                  </div>

                  <div className="bg-white p-3.5 border border-[#ded7cb] space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#182a24] block">
                      Layanan Sudah Termasuk / Included Services (1 poin per baris)
                    </label>
                    <textarea
                      rows={5}
                      value={(editingRoom.includedServices || []).join('\n')}
                      onChange={(e) =>
                        setEditingRoom({
                          ...editingRoom,
                          includedServices: e.target.value.split('\n'),
                        })
                      }
                      placeholder={'Sarapan gourmet hangat untuk 2 tamu\nAkses gratis ke kolam renang & taman Chevilly'}
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#f4f0e6] border-t border-[#ded7cb] flex items-center justify-between gap-3">
              <span className="text-[10.5px] text-[#52645c]">
                Klik &quot;Terapkan Detail&quot; lalu tekan <strong>Simpan Kamar</strong> untuk menyimpan ke database.
              </span>
              <button
                type="button"
                onClick={() => setIsRoomDetailEditorOpen(false)}
                className="px-5 py-2 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] font-semibold uppercase tracking-wider text-xs cursor-pointer transition-colors"
              >
                Terapkan Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP EDITOR 3 FOTO GALERI & DETAIL PREVIEW WAHANA */}
      {isTourDetailEditorOpen && editingTour && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] text-xs overflow-hidden">
            {/* Header */}
            <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
                  Editor Detail &amp; Galeri Wahana Wisata
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-white">
                  {editingTour.name || 'Wahana Baru'} — Foto Galeri &amp; Detail Preview
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsTourDetailEditorOpen(false)}
                className="p-1.5 text-stone-300 hover:text-white cursor-pointer"
                aria-label="Tutup Editor Detail Wahana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* 1. LIVE PREVIEW DETAIL MODAL */}
              {(() => {
                const slotPhotos = [
                  editingTour.gallery?.[0] || editingTour.image || '/src/assets/images/waterpark_chevilly_1794289440273.jpg',
                  editingTour.gallery?.[1] || '',
                  editingTour.gallery?.[2] || '',
                ];
                const previewPhotos = slotPhotos.filter(Boolean);
                const activeSrc = previewPhotos[tourDetailPreviewActivePhoto] || previewPhotos[0] || editingTour.image || '';

                return (
                  <div className="bg-[#f2eee3] border border-[#ded7cb] p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#182a24] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#967d58]" />
                        <span>Live Preview Detail Wahana</span>
                      </span>
                      <span className="text-[10px] text-[#52645c] font-mono">
                        Pratinjau tampilan saat pengunjung membuka Detail Wahana
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      <div className="lg:col-span-7 space-y-2">
                        <div className="relative aspect-[16/9] bg-[#24332c] border border-[#ded7cb] overflow-hidden">
                          {activeSrc && (
                            <img
                              src={activeSrc}
                              alt={editingTour.name || 'Preview Wahana'}
                              className="w-full h-full object-cover object-center"
                            />
                          )}
                          <div className="absolute bottom-2.5 left-3 bg-black/65 backdrop-blur-xs text-white text-[11px] font-serif italic px-2.5 py-1">
                            {editingTour.guideType || 'Staff Pengawas Wahana'}
                          </div>
                          <div className="absolute top-2.5 right-2.5 bg-black/65 text-[#fae7b3] text-[10px] font-mono px-2 py-0.5">
                            Foto #{tourDetailPreviewActivePhoto + 1} / {previewPhotos.length || 1}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {previewPhotos.map((src, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setTourDetailPreviewActivePhoto(idx)}
                              className={`w-20 h-12 overflow-hidden border-2 cursor-pointer transition-all ${
                                tourDetailPreviewActivePhoto === idx
                                  ? 'border-[#182a24] opacity-100'
                                  : 'border-transparent opacity-65 hover:opacity-100'
                              }`}
                            >
                              <img src={src} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="lg:col-span-5 bg-white border border-[#ded7cb] p-3.5 space-y-2.5 text-[11px]">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#967d58]">
                          {editingTour.kicker || 'Wahana Chevilly'} · Elevasi {editingTour.altitude || '2.450 mdpl'}
                        </div>
                        <div className="font-serif text-base font-bold text-[#182a24] leading-snug">
                          {editingTour.name || 'Nama Wahana'}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#eee9de] text-[10.5px]">
                          <div>
                            <span className="text-stone-400 block">Tingkat Kesulitan</span>
                            <strong className="text-[#182a24]">{editingTour.difficulty || 'Santai'}</strong>
                          </div>
                          <div>
                            <span className="text-stone-400 block">Rating &amp; Ulasan</span>
                            <strong className="text-[#967d58] font-mono">
                              ★ {editingTour.rating ?? 4.96} ({editingTour.reviewsCount ?? 150})
                            </strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-stone-400 block">Jam Operasional / Durasi</span>
                            <strong className="text-[#182a24]">{editingTour.duration || '08:00 - 17:00 WIB'}</strong>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-[#eee9de] text-[10.5px] text-[#52645c]">
                          <span className="font-semibold text-[#182a24] block mb-1">
                            Fasilitas Termasuk ({(editingTour.inclusions || []).length}):
                          </span>
                          <ul className="space-y-0.5 list-disc pl-4">
                            {(editingTour.inclusions || []).slice(0, 3).map((inc, idx) => (
                              <li key={idx} className="truncate">{inc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. EDITOR 3 FOTO GALERI WAHANA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif text-sm font-bold text-[#182a24] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#967d58]" />
                    <span>Kelola 3 Foto Galeri Wahana &amp; Hover</span>
                  </h5>
                  <span className="text-[10px] font-mono text-[#73837b]">
                    Slot Foto 2 otomatis menjadi Foto Hover pada kartu halaman depan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { index: 0, title: 'Foto 1 (Utama)', hint: 'Tampil default di kartu & detail' },
                    { index: 1, title: 'Foto 2 (Foto Hover)', hint: 'Muncul saat kursor hover di kartu' },
                    { index: 2, title: 'Foto 3 (Detail Galeri)', hint: 'Foto tambahan di popup Detail' },
                  ].map((slot) => {
                    const currentVal =
                      slot.index === 0
                        ? editingTour.gallery?.[0] ?? editingTour.image ?? ''
                        : editingTour.gallery?.[slot.index] ?? '';
                    return (
                      <div key={slot.index} className="bg-white border border-[#ded7cb] p-3 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between gap-1">
                          <div>
                            <div className="font-semibold text-[#182a24] text-xs">{slot.title}</div>
                            <div className="text-[10px] text-[#73837b]">{slot.hint}</div>
                          </div>
                          {currentVal && slot.index > 0 && (
                            <button
                              type="button"
                              onClick={() => updateTourGallerySlot(slot.index, '')}
                              className="px-1.5 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>

                        <div className="aspect-[16/10] bg-stone-100 border border-[#ded7cb] overflow-hidden flex items-center justify-center">
                          {currentVal ? (
                            <img src={currentVal} alt={slot.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-mono text-stone-400">Belum diisi</span>
                          )}
                        </div>

                        <label className="w-full py-1.5 px-2.5 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-[10.5px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                          {uploadingTourGallerySlot === slot.index ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-[#d4af37]" />
                          ) : (
                            <Upload className="w-3 h-3 text-[#d4af37]" />
                          )}
                          <span>
                            {uploadingTourGallerySlot === slot.index ? 'Mengunggah...' : `Upload Foto ${slot.index + 1}`}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingTourGallerySlot === slot.index}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleModalTourGallerySlotUpload(slot.index, file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => updateTourGallerySlot(slot.index, e.target.value)}
                          placeholder={`/src/assets/images/... (Foto ${slot.index + 1})`}
                          className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#faf9f5] font-mono text-[10.5px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. EDITOR DETAIL PREVIEW WAHANA */}
              <div className="space-y-3 pt-2 border-t border-[#ded7cb]">
                <h5 className="font-serif text-sm font-bold text-[#182a24] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#967d58]" />
                  <span>Edit Detail Wahana Wisata Lainnya</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 border border-[#ded7cb]">
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={editingTour.difficulty || 'Santai'}
                      onChange={(e) =>
                        setEditingTour({
                          ...editingTour,
                          difficulty: e.target.value as TourExperience['difficulty'],
                        })
                      }
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs"
                    >
                      <option value="Santai">Santai</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Tantangan Puncak">Tantangan Puncak</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Elevasi / Ketinggian
                    </label>
                    <input
                      type="text"
                      value={editingTour.altitude || ''}
                      onChange={(e) => setEditingTour({ ...editingTour, altitude: e.target.value })}
                      placeholder="2.450 mdpl"
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Rating Wahana (1.0 - 5.0)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="5"
                      value={editingTour.rating ?? 4.96}
                      onChange={(e) => setEditingTour({ ...editingTour, rating: Number(e.target.value) || 4.96 })}
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Jumlah Ulasan Pelancong
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingTour.reviewsCount ?? 150}
                      onChange={(e) =>
                        setEditingTour({
                          ...editingTour,
                          reviewsCount: Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Catatan Standar Keselamatan &amp; Pemandu
                    </label>
                    <input
                      type="text"
                      value={editingTour.safetyNote || ''}
                      onChange={(e) => setEditingTour({ ...editingTour, safetyNote: e.target.value })}
                      placeholder="Setiap pemandu dilengkapi sistem komunikasi standar resort, P3K, dan pengawasan area wahana yang terverifikasi."
                      className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 border border-[#ded7cb] space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#182a24] block">
                      Pilihan Jam Keberangkatan / Sesi (1 per baris)
                    </label>
                    <textarea
                      rows={5}
                      value={(editingTour.departureTimes || []).join('\n')}
                      onChange={(e) =>
                        setEditingTour({
                          ...editingTour,
                          departureTimes: e.target.value.split('\n'),
                        })
                      }
                      placeholder={'08:00 - 12:00 WIB\n13:00 - 17:00 WIB'}
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs font-mono leading-relaxed"
                    />
                  </div>

                  <div className="bg-white p-3.5 border border-[#ded7cb] space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#182a24] block">
                      Fasilitas &amp; Layanan Termasuk (1 poin per baris)
                    </label>
                    <textarea
                      rows={5}
                      value={(editingTour.inclusions || []).join('\n')}
                      onChange={(e) =>
                        setEditingTour({
                          ...editingTour,
                          inclusions: e.target.value.split('\n'),
                        })
                      }
                      placeholder={'Akses seluruh area wahana\nFasilitas keselamatan standar\nAsuransi pengunjung kawasan'}
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs leading-relaxed"
                    />
                  </div>

                  <div className="bg-white p-3.5 border border-[#ded7cb] space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#182a24] block">
                      Perlengkapan Disediakan (1 poin per baris)
                    </label>
                    <textarea
                      rows={5}
                      value={(editingTour.equipmentProvided || []).join('\n')}
                      onChange={(e) =>
                        setEditingTour({
                          ...editingTour,
                          equipmentProvided: e.target.value.split('\n'),
                        })
                      }
                      placeholder={'Helm & pelindung keselamatan\nLoker & ruang bilas bersih'}
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#f4f0e6] border-t border-[#ded7cb] flex items-center justify-between gap-3">
              <span className="text-[10.5px] text-[#52645c]">
                Klik &quot;Terapkan Detail&quot; lalu tekan <strong>Simpan Wahana</strong> untuk menyimpan ke database.
              </span>
              <button
                type="button"
                onClick={() => setIsTourDetailEditorOpen(false)}
                className="px-5 py-2 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] font-semibold uppercase tracking-wider text-xs cursor-pointer transition-colors"
              >
                Terapkan Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP INVOICE RESERVASI */}
      <InvoiceModal
        isOpen={Boolean(invoiceReservation)}
        onClose={() => setInvoiceReservation(null)}
        reservation={invoiceReservation}
        currency={invoiceReservation?.currency || currency}
        autoPrint={false}
      />

      {/* MODAL POPUP VIEW BUKTI TRANSFER */}
      {proofReservation && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setProofReservation(null)}
        >
          <div
            className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-xl shadow-2xl overflow-hidden text-[#182a24] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40 shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                <div>
                  <div className="font-serif text-base font-semibold">Bukti Transfer Pembayaran</div>
                  <div className="text-[10px] font-mono text-[#eed492]">
                    {proofReservation.bookingCode} · {proofReservation.guestName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProofReservation(null)}
                className="text-[#eed492] hover:text-white cursor-pointer"
                aria-label="Tutup Bukti Transfer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-[#f2eee3] border border-[#ded7cb] grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] uppercase text-[#73837b]">Nama Tamu</div>
                  <div className="font-semibold text-[#182a24] mt-0.5 truncate">{proofReservation.guestName}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#73837b]">Total Tagihan</div>
                  <div className="font-mono font-bold text-[#182a24] mt-0.5">
                    {formatPrice(proofReservation.totalPriceIdr, proofReservation.totalPriceUsd, proofReservation.currency || currency)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#73837b]">Metode Pembayaran</div>
                  <div className="font-medium text-[#182a24] mt-0.5 truncate">
                    {proofReservation.paymentMethod || 'Transfer Bank'}
                  </div>
                </div>
              </div>

              {proofReservation.paymentProofUrl ? (
                <>
                  <div className="bg-white border border-[#ded7cb] p-3 flex items-center justify-center">
                    <img
                      src={proofReservation.paymentProofUrl}
                      alt={`Bukti Transfer ${proofReservation.bookingCode}`}
                      className="max-h-[52vh] w-auto object-contain"
                    />
                  </div>
                  {(proofReservation.paymentProofNote || proofReservation.paymentProofUploadedAt) && (
                    <div className="p-3 bg-white border border-[#ded7cb] space-y-1">
                      {proofReservation.paymentProofNote && (
                        <div>
                          <span className="text-[#73837b]">Catatan Tamu: </span>
                          <span className="font-medium text-[#182a24]">{proofReservation.paymentProofNote}</span>
                        </div>
                      )}
                      {proofReservation.paymentProofUploadedAt && (
                        <div className="text-[11px] text-[#73837b]">
                          Diunggah pada:{' '}
                          <span className="font-mono text-[#182a24]">
                            {new Date(proofReservation.paymentProofUploadedAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 bg-white border border-dashed border-[#d4cdc0] text-center space-y-2 text-[#73837b]">
                  <ImageIcon className="w-8 h-8 mx-auto text-[#b8ae9c]" />
                  <div className="font-semibold text-[#182a24]">Belum Ada Bukti Transfer</div>
                  <p className="text-[11px]">
                    Tamu belum mengunggah bukti transfer untuk kode reservasi <span className="font-mono font-bold">{proofReservation.bookingCode}</span>.
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-[#f4f0e6] border-t border-[#e2dcd0] flex items-center justify-between gap-2 shrink-0">
              <div>
                {proofReservation.paymentProofUrl &&
                  proofReservation.status !== 'Lunas' &&
                  proofReservation.status !== 'Selesai' && (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleUpdateReservationStatus(proofReservation.id, 'Lunas');
                        setProofReservation({ ...proofReservation, status: 'Lunas' });
                      }}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verifikasi &amp; Set Lunas</span>
                    </button>
                  )}
              </div>
              <button
                type="button"
                onClick={() => setProofReservation(null)}
                className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] text-xs font-semibold cursor-pointer shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ULASAN TAMU KEHORMATAN MODAL */}
      {isReviewModalOpen && editingReview && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-lg shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb] mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" />
                <h4 className="font-serif text-lg font-bold text-[#182a24]">
                  {reviews.some((r) => r.id === editingReview.id)
                    ? 'Edit Ulasan Tamu Kehormatan'
                    : 'Tambah Ulasan Tamu Baru'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setEditingReview(null);
                }}
                className="p-1 text-stone-500 hover:text-[#182a24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} autoComplete="off" className="space-y-4">
              {/* Status Tampil */}
              <div className="p-3 bg-[#f5f2ea] border border-[#ded7cb] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#182a24]">
                    Tampilkan di Halaman Beranda
                  </div>
                  <div className="text-[10.5px] text-[#63746c]">
                    Jika aktif, ulasan akan muncul di section Ulasan Para Penjelajah &amp; Tamu Kehormatan.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingReview((prev) =>
                      prev ? { ...prev, isActive: prev.isActive === false } : prev
                    )
                  }
                  className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider border cursor-pointer flex items-center gap-1.5 ${
                    editingReview.isActive !== false
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                      : 'bg-stone-100 text-stone-600 border-stone-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      editingReview.isActive !== false ? 'bg-emerald-500' : 'bg-stone-400'
                    }`}
                  />
                  <span>{editingReview.isActive !== false ? 'Tampil' : 'Sembunyi'}</span>
                </button>
              </div>

              {/* Nama Tamu */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5">
                <label className="text-xs font-semibold text-[#182a24] block">
                  Nama Tamu / Penjelajah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingReview.authorName || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, authorName: e.target.value })}
                  placeholder="Contoh: Dr. Nadia Wiratama"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Profesi & Kota */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5">
                <label className="text-xs font-semibold text-[#182a24] block">
                  Profesi / Keterangan &amp; Asal Kota
                </label>
                <input
                  type="text"
                  value={editingReview.authorRole || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, authorRole: e.target.value })}
                  placeholder="Contoh: Spesialis Bedah & Penggemar Alam · Jakarta"
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Rating Bintang */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-2">
                <label className="text-xs font-semibold text-[#182a24] block">
                  Rating Kepuasan (1 - 5 Bintang)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const active = (editingReview.rating ?? 5) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setEditingReview({ ...editingReview, rating: starVal })}
                        className={`px-2.5 py-1.5 border text-sm cursor-pointer transition-colors ${
                          active
                            ? 'bg-amber-50 border-amber-400 text-[#c59b27]'
                            : 'bg-[#faf9f5] border-[#ded7cb] text-stone-300 hover:text-amber-400'
                        }`}
                        title={`${starVal} Bintang`}
                      >
                        ★
                      </button>
                    );
                  })}
                  <span className="ml-1 font-mono text-[11px] font-semibold text-[#52645c]">
                    {editingReview.rating ?? 5}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* Isi Ulasan */}
              <div className="p-3 bg-white border border-[#ded7cb] space-y-1.5">
                <label className="text-xs font-semibold text-[#182a24] block">
                  Isi Ulasan / Testimoni <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingReview.quote || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  placeholder="Tuliskan pengalaman menginap atau berwisata tamu di Chevilly Resort & Camp..."
                  className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] leading-relaxed focus:outline-none focus:border-[#182a24]"
                />
              </div>

              {/* Live Card Preview */}
              <div className="p-4 bg-[#101b17] border border-[#263e34] text-[#ded8cc] space-y-2">
                <div className="text-[9.5px] font-mono uppercase tracking-widest text-[#c5a880]">
                  Pratinjau Tampilan di Beranda
                </div>
                <div className="text-[#d4af37] text-[11px] tracking-widest">
                  {'★'.repeat(Math.min(5, Math.max(1, Number(editingReview.rating) || 5)))}
                  {'☆'.repeat(5 - Math.min(5, Math.max(1, Number(editingReview.rating) || 5)))}
                </div>
                <p className="italic text-[11.5px] text-[#e2ded6] leading-relaxed">
                  &quot;{editingReview.quote || 'Isi testimoni tamu akan tampil di sini...'}&quot;
                </p>
                <div className="pt-1">
                  <div className="font-semibold text-white text-xs">
                    {editingReview.authorName || 'Nama Tamu Kehormatan'}
                  </div>
                  <div className="text-[10.5px] text-[#869990]">
                    {editingReview.authorRole || 'Profesi · Kota Asal'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ded7cb]">
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-100 text-stone-700 cursor-pointer font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#182a24] text-[#f7f5ef] hover:bg-[#284138] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Simpan Ulasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS ULASAN TAMU */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-sm sm:max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                Yakin akan menghapus ulasan ini?
              </h4>
              <p className="text-xs text-[#52645c] leading-relaxed">
                Ulasan dari <strong className="text-[#182a24]">&quot;{reviewToDelete.authorName}&quot;</strong> akan dihapus permanen dari database &amp; halaman beranda.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#ded7cb]">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="px-4 py-2 border border-[#ded7cb] hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReview}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP EDITOR DETAIL TITIK KAWASAN (3 FOTO, TAGLINE, KEUNGGULAN & LIVE PREVIEW) */}
      {isMapDetailEditorOpen && editingMapLocation && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] text-xs overflow-hidden">
            {/* Header */}
            <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
                  Editor Popup Detail &amp; Galeri Titik Kawasan
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-white">
                  Titik #{editingMapLocation.number || '-'} · {editingMapLocation.name || 'Titik Kawasan Baru'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsMapDetailEditorOpen(false)}
                className="p-1.5 text-stone-300 hover:text-white cursor-pointer"
                aria-label="Tutup Editor Popup Detail Kawasan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* 1. LIVE PREVIEW POPUP DETAIL KAWASAN */}
              {(() => {
                const slotPhotos = [
                  editingMapLocation.images?.[0] || editingMapLocation.image || '',
                  editingMapLocation.images?.[1] || '',
                  editingMapLocation.images?.[2] || '',
                ];
                const previewPhotos = slotPhotos.filter(Boolean);
                const safeIdx = Math.min(mapDetailPreviewActivePhoto, Math.max(0, previewPhotos.length - 1));
                const activeSrc = previewPhotos[safeIdx] || editingMapLocation.image || '';
                const previewFeatures = (editingMapLocation.features || []).map((f) => f.trim()).filter(Boolean);

                return (
                  <div className="bg-[#f2eee3] border border-[#ded7cb] p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#182a24] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#967d58]" />
                        <span>Live Preview Popup Detail Kawasan</span>
                      </span>
                      <span className="text-[10px] text-[#52645c] font-mono">
                        Pratinjau popup saat pengunjung mengklik titik peta di halaman depan
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      {/* Left: Photo Carousel Preview */}
                      <div className="lg:col-span-7 space-y-2">
                        <div className="relative aspect-[16/9] bg-[#24332c] border border-[#ded7cb] overflow-hidden flex items-center justify-center">
                          {activeSrc ? (
                            <img
                              src={activeSrc}
                              alt={editingMapLocation.name || 'Preview Titik Kawasan'}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="text-stone-400 text-xs flex flex-col items-center gap-1.5">
                              <ImageIcon className="w-7 h-7 opacity-50" />
                              <span>Belum ada foto galeri</span>
                            </div>
                          )}
                          <div className="absolute top-2.5 left-2.5 bg-[#182a24]/85 text-[#fae7b3] text-[10px] font-mono font-bold px-2.5 py-0.5 border border-[#d4af37]/50">
                            PIN #{editingMapLocation.number || '-'}
                          </div>
                          <div className="absolute top-2.5 right-2.5 bg-black/65 text-[#fae7b3] text-[10px] font-mono px-2 py-0.5">
                            Foto #{safeIdx + 1} / {previewPhotos.length || 1}
                          </div>
                          {editingMapLocation.tagline && (
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[11px] font-serif px-2.5 py-1 truncate">
                              {editingMapLocation.tagline}
                            </div>
                          )}
                        </div>

                        {previewPhotos.length > 0 && (
                          <div className="flex items-center gap-2">
                            {previewPhotos.map((src, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setMapDetailPreviewActivePhoto(idx)}
                                className={`w-20 h-12 overflow-hidden border-2 cursor-pointer transition-all ${
                                  safeIdx === idx
                                    ? 'border-[#182a24] opacity-100'
                                    : 'border-transparent opacity-65 hover:opacity-100'
                                }`}
                              >
                                <img src={src} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Popup Details Summary Preview */}
                      <div className="lg:col-span-5 bg-white border border-[#ded7cb] p-3.5 space-y-2.5 text-[11px]">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#967d58] font-bold">
                          Daya Tarik &amp; Deskripsi Lengkap
                        </div>
                        <div className="font-serif text-sm font-bold text-[#182a24] leading-snug">
                          {editingMapLocation.tagline || editingMapLocation.name || 'Tagline Titik Kawasan'}
                        </div>
                        {editingMapLocation.description && (
                          <p className="text-[10.5px] text-[#52645c] leading-relaxed line-clamp-3">
                            {editingMapLocation.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#eee9de] text-[10.5px]">
                          <div>
                            <span className="text-stone-400 block">Jam Operasional</span>
                            <strong className="text-[#182a24]">{editingMapLocation.hours || '08:00 - 17:00 WIB'}</strong>
                          </div>
                          <div>
                            <span className="text-stone-400 block">Catatan Tiket</span>
                            <strong className="text-[#967d58]">{editingMapLocation.priceNote || 'Gratis / Reservasi'}</strong>
                          </div>
                        </div>

                        {previewFeatures.length > 0 && (
                          <div className="pt-2 border-t border-[#eee9de] space-y-1">
                            <div className="text-[10px] font-bold text-[#182a24] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#d4af37]" />
                              <span>Fasilitas &amp; Keunggulan ({previewFeatures.length})</span>
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {previewFeatures.slice(0, 4).map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-[10px] text-[#354840]">
                                  <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{feat}</span>
                                </div>
                              ))}
                              {previewFeatures.length > 4 && (
                                <div className="text-[9.5px] font-mono text-stone-400">
                                  +{previewFeatures.length - 4} poin keunggulan lainnya
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. KELOLA 3 FOTO GALERI POPUP DETAIL */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="font-serif text-sm font-bold text-[#182a24] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#967d58]" />
                    <span>Kelola 3 Foto Galeri Popup Detail</span>
                  </h5>
                  <span className="text-[10.5px] text-[#52645c]">
                    Foto #1 otomatis menjadi Foto Utama kartu peta; Foto #2 &amp; #3 tampil di carousel popup detail.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0, 1, 2].map((slotIdx) => {
                    const slotLabels = [
                      'Foto #1 (Utama & Peta)',
                      'Foto #2 (Sudut Lain)',
                      'Foto #3 (Suasana / Panorama)',
                    ];
                    const currentUrl =
                      editingMapLocation.images?.[slotIdx] ??
                      (slotIdx === 0 ? editingMapLocation.image || '' : '');
                    const isUploadingSlot = uploadingMapGallerySlot === slotIdx;

                    return (
                      <div key={slotIdx} className="bg-white border border-[#ded7cb] p-3 space-y-2.5 flex flex-col">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10.5px] font-bold text-[#182a24]">{slotLabels[slotIdx]}</span>
                          {slotIdx > 0 && currentUrl && (
                            <button
                              type="button"
                              onClick={() => updateMapLocationImageSlot(slotIdx, '')}
                              className="text-[10px] text-red-600 hover:underline cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>

                        <div className="aspect-[16/10] bg-[#f2eee3] border border-[#ded7cb] overflow-hidden flex items-center justify-center">
                          {currentUrl ? (
                            <img
                              src={currentUrl}
                              alt={slotLabels[slotIdx]}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-stone-400 p-2">
                              <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                              <span className="text-[10px]">Slot Kosong</span>
                            </div>
                          )}
                        </div>

                        <label
                          className={`w-full py-1.5 px-2.5 text-center font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                            isUploadingSlot
                              ? 'bg-stone-300 text-stone-600 cursor-wait'
                              : 'bg-[#182a24] hover:bg-[#284138] text-[#fae7b3]'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{isUploadingSlot ? 'Mengunggah...' : 'Upload Foto'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingSlot}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMapLocationGallerySlotUpload(slotIdx, file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        <input
                          type="text"
                          value={currentUrl}
                          onChange={(e) => updateMapLocationImageSlot(slotIdx, e.target.value)}
                          placeholder="Atau tempel URL foto..."
                          className="w-full border border-[#ded7cb] px-2.5 py-1.5 bg-[#fcfbf9] font-mono text-[10px] text-[#182a24] focus:outline-none focus:border-[#967d58]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. EDIT INFORMASI POPUP DETAIL */}
              <div className="bg-white border border-[#ded7cb] p-4 space-y-4">
                <h5 className="font-serif text-sm font-bold text-[#182a24] border-b border-[#eee9de] pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>Informasi &amp; Konten Popup Detail</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Tagline / Judul Daya Tarik Utama
                    </label>
                    <input
                      type="text"
                      value={editingMapLocation.tagline || ''}
                      onChange={(e) =>
                        setEditingMapLocation({ ...editingMapLocation, tagline: e.target.value })
                      }
                      placeholder="Contoh: Petualangan & Spot Ikonik Chevilly Resort & Camp"
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Jam Operasional (Popup)
                    </label>
                    <input
                      type="text"
                      value={editingMapLocation.hours || ''}
                      onChange={(e) =>
                        setEditingMapLocation({ ...editingMapLocation, hours: e.target.value })
                      }
                      placeholder="Contoh: 08:00 - 17:00 WIB / 24 Jam"
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Catatan Tiket / Harga (Kartu Concierge Popup)
                    </label>
                    <input
                      type="text"
                      value={editingMapLocation.priceNote || ''}
                      onChange={(e) =>
                        setEditingMapLocation({ ...editingMapLocation, priceNote: e.target.value })
                      }
                      placeholder="Contoh: Gratis Tamu Menginap / Tiket Wahana Rp 25.000"
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs text-[#182a24] focus:outline-none focus:border-[#967d58]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      URL Video Poster / Thumbnail Video (Opsional)
                    </label>
                    <input
                      type="text"
                      value={editingMapLocation.videoPoster || ''}
                      onChange={(e) =>
                        setEditingMapLocation({ ...editingMapLocation, videoPoster: e.target.value })
                      }
                      placeholder="https://... atau /src/assets/images/... (Kosongkan untuk memakai Foto Utama)"
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] font-mono text-[11px] text-[#182a24] focus:outline-none focus:border-[#967d58]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Deskripsi Lengkap Popup Detail
                    </label>
                    <textarea
                      rows={3}
                      value={editingMapLocation.description || ''}
                      onChange={(e) =>
                        setEditingMapLocation({ ...editingMapLocation, description: e.target.value })
                      }
                      placeholder="Tuliskan penjelasan lengkap tentang daya tarik, suasana, dan fasilitas di titik kawasan ini..."
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs leading-relaxed text-[#182a24] focus:outline-none focus:border-[#967d58]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-[#182a24] block mb-1">
                      Daftar Fasilitas &amp; Keunggulan Titik Ini (1 poin per baris)
                    </label>
                    <textarea
                      rows={4}
                      value={(editingMapLocation.features || []).join('\n')}
                      onChange={(e) =>
                        setEditingMapLocation({
                          ...editingMapLocation,
                          features: e.target.value.split('\n'),
                        })
                      }
                      placeholder={
                        'Spot foto ikonik dengan latar pegunungan\nAkses mudah & jalur ramah keluarga\nArea teduh dengan bangku santai\nPengawasan tim keamanan & concierge 24 jam'
                      }
                      className="w-full border border-[#ded7cb] px-3 py-2 bg-[#fcfbf9] text-xs leading-relaxed text-[#182a24] focus:outline-none focus:border-[#967d58]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#f4f0e6] border-t border-[#ded7cb] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10.5px] text-[#52645c]">
                Klik &quot;Terapkan Detail&quot; lalu tekan <strong>Simpan Titik Kawasan</strong> agar tersimpan ke halaman depan.
              </span>
              <button
                type="button"
                onClick={() => setIsMapDetailEditorOpen(false)}
                className="px-5 py-2 bg-[#182a24] hover:bg-[#284138] text-[#fae7b3] font-semibold uppercase tracking-wider text-xs cursor-pointer transition-colors"
              >
                Terapkan Detail
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
