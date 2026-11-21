export type Currency = 'IDR' | 'USD';

export interface Amenity {
  id: string;
  name: string;
  category: 'comfort' | 'view' | 'dining' | 'wellness' | 'technology';
}

export interface RoomSuite {
  id: string;
  name: string;
  kicker: string;
  category: 'chalet' | 'suite' | 'villa' | 'deluxe' | 'ftb' | 'executive' | 'premiere' | 'president-suite' | 'villas' | 'bunkbed' | 'transit-room' | string;
  priceIdr: number;
  priceUsd: number;
  priceSunThursIdr?: number;
  priceFridayIdr?: number;
  priceSaturdayIdr?: number;
  priceSunThursUsd?: number;
  priceFridayUsd?: number;
  priceSaturdayUsd?: number;
  isAvailable?: boolean;
  totalRooms?: number;
  area: string;
  capacity: string;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  altitude: string;
  rating: number;
  reviewsCount: number;
  image: string;
  gallery: string[];
  features: string[];
  description: string;
  viewType: string;
  includedServices: string[];
  showName?: boolean;
  showKicker?: boolean;
  showDescription?: boolean;
  showPrice?: boolean;
  showArea?: boolean;
  showCapacity?: boolean;
}

export interface TourExperience {
  id: string;
  name: string;
  kicker: string;
  category: 'wahana' | 'spot-foto' | 'adventure' | 'keluarga' | 'trekking' | 'wellness' | 'flight' | 'culinary' | 'safari' | string;
  priceIdr: number;
  priceUsd: number;
  duration: string;
  difficulty: 'Santai' | 'Menengah' | 'Tantangan Puncak';
  altitude: string;
  rating: number;
  reviewsCount: number;
  image: string;
  gallery?: string[];
  departureTimes: string[];
  inclusions: string[];
  equipmentProvided: string[];
  description: string;
  guideType: string;
  safetyNote?: string;
  showName?: boolean;
  showKicker?: boolean;
  showDescription?: boolean;
  showPrice?: boolean;
  showDuration?: boolean;
}

export interface BookingAddOn {
  id: string;
  name: string;
  description: string;
  priceIdr: number;
  priceUsd: number;
  unit: string;
  isActive?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  showPrice?: boolean;
  showUnit?: boolean;
}

export interface Reservation {
  id: string;
  bookingCode: string;
  createdAt: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  
  // Accommodation
  room?: {
    id: string;
    name: string;
    pricePerNight: number;
    nights: number;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  };

  // Tours
  tours?: Array<{
    id: string;
    name: string;
    pricePerPerson: number;
    date: string;
    timeSlot: string;
    participants: number;
  }>;

  // Add-ons
  selectedAddOns: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;

  totalPriceIdr: number;
  totalPriceUsd: number;
  currency: Currency;
  status: 'Konfirmasi' | 'Down Payment' | 'Lunas' | 'Selesai' | 'Booking' | 'Dikonfirmasi' | 'Menunggu Pembayaran';
  paymentMethod: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  paymentProofNote?: string;
}

export interface VisitorUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipTier?: string;
}

export interface NavMenuItem {
  id: string;
  label: string;
  targetId: string;
  isActive: boolean;
}

export interface HeroVideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  badge?: string;
  duration?: string;
  thumbnail?: string;
  isActive: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  showDuration?: boolean;
}

export interface RoomCategoryItem {
  id: string;
  label: string;
  name: string;
  kicker: string;
  desc: string;
  area: string;
  capacity: string;
  bedType: string;
  priceSunThursIdr: number;
  priceFridayIdr: number;
  priceSaturdayIdr: number;
  priceSunThursUsd?: number;
  priceFridayUsd?: number;
  priceSaturdayUsd?: number;
  priceIdr: number;
  priceUsd: number;
}

export interface GuestReview {
  id: string;
  authorName: string;
  authorRole: string;
  quote: string;
  rating?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface FasilitasSaranaItem {
  id: string;
  code: string;
  name: string;
  price: string;
  capacity?: string;
  image: string;
  isActive?: boolean;
}

export interface FasilitasOperatingHour {
  day: string;
  hours: string;
}

export interface ZonaPrabayarItem {
  id: string;
  code: string;
  name: string;
  area: string;
  price: string;
  capacity: string;
  size: string;
  image: string;
  isActive?: boolean;
}

export interface ZonaRentalFacility {
  label: string;
  price: string;
}
