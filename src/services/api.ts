import { RoomSuite, TourExperience, Reservation, BookingAddOn, RoomCategoryItem, GuestReview } from '../types';

export interface ResortInfoData {
  name: string;
  tagline: string;
  location: string;
  coordinates: string;
  elevation: string;
  phone: string;
  whatsapp: string;
  whatsappFormatted: string;
  bdeName: string;
  conciergeEmail: string;
  checkInTime: string;
  checkOutTime: string;
}

export interface FacilityData {
  chapter: string;
  title: string;
  description: string;
  highlight: string;
  subHighlight: string;
}

export interface FacilitiesData {
  wellness: FacilityData;
  dining: FacilityData;
  meeting: FacilityData;
}

// Helper: always fetch fresh data directly from backend DB (never serve cached GET responses)
async function noCacheGet(url: string): Promise<Response> {
  const sep = url.includes('?') ? '&' : '?';
  return fetch(`${url}${sep}_t=${Date.now()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}

// 1. Resort Info
export async function fetchResortInfo(): Promise<ResortInfoData | null> {
  try {
    const res = await noCacheGet('/api/resort-info');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch resort info:', err);
    return null;
  }
}

export async function updateResortInfo(data: Partial<ResortInfoData>): Promise<boolean> {
  try {
    const res = await fetch('/api/resort-info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update resort info:', err);
    return false;
  }
}

// 2. Facilities (Wellness, Dining, Meeting)
export async function fetchFacilities(): Promise<FacilitiesData | null> {
  try {
    const res = await noCacheGet('/api/facilities');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch facilities:', err);
    return null;
  }
}

export async function updateFacility(key: 'wellness' | 'dining' | 'meeting', data: Partial<FacilityData>): Promise<boolean> {
  try {
    const res = await fetch(`/api/facilities/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error(`Failed to update facility ${key}:`, err);
    return false;
  }
}

// 3. Rooms & Villas (CRUD)
export async function fetchRooms(): Promise<RoomSuite[] | null> {
  try {
    const res = await noCacheGet('/api/rooms');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch rooms:', err);
    return null;
  }
}

export async function createRoom(room: Partial<RoomSuite>): Promise<RoomSuite | null> {
  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to create room:', err);
    return null;
  }
}

export async function updateRoom(id: string, room: Partial<RoomSuite>): Promise<boolean> {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update room:', err);
    return false;
  }
}

export async function deleteRoom(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete room:', err);
    return false;
  }
}

// 3b. Room Categories (Fetch & Sync)
export async function fetchCategories(): Promise<RoomCategoryItem[] | null> {
  try {
    const res = await noCacheGet('/api/categories');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return null;
  }
}

export async function syncCategoriesToServer(categories: RoomCategoryItem[]): Promise<boolean> {
  try {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to sync categories:', err);
    return false;
  }
}

// 4. Explore Wisata & Wahana (CRUD)
export async function fetchTours(): Promise<TourExperience[] | null> {
  try {
    const res = await noCacheGet('/api/tours');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch tours:', err);
    return null;
  }
}

export async function createTour(tour: Partial<TourExperience>): Promise<TourExperience | null> {
  try {
    const res = await fetch('/api/tours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tour),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to create tour:', err);
    return null;
  }
}

export async function updateTour(id: string, tour: Partial<TourExperience>): Promise<boolean> {
  try {
    const res = await fetch(`/api/tours/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tour),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update tour:', err);
    return false;
  }
}

export async function deleteTour(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/tours/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete tour:', err);
    return false;
  }
}

// 5. Reservations (CRUD)
export async function fetchReservations(): Promise<Reservation[] | null> {
  try {
    const res = await noCacheGet('/api/reservations');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch reservations:', err);
    return null;
  }
}

export async function createReservation(reservation: Partial<Reservation>): Promise<Reservation | null> {
  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to create reservation:', err);
    return null;
  }
}

export async function updateReservation(id: string, data: Partial<Reservation>): Promise<boolean> {
  try {
    const res = await fetch(`/api/reservations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update reservation:', err);
    return false;
  }
}

export async function deleteReservation(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reservations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete reservation:', err);
    return false;
  }
}

// 5b. Booking Add-ons / Layanan Tambahan (CRUD)
export async function fetchAddOns(): Promise<BookingAddOn[] | null> {
  try {
    const res = await noCacheGet('/api/addons');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch add-ons:', err);
    return null;
  }
}

export async function createAddOn(addon: Partial<BookingAddOn>): Promise<BookingAddOn | null> {
  try {
    const res = await fetch('/api/addons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addon),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to create add-on:', err);
    return null;
  }
}

export async function updateAddOn(id: string, addon: Partial<BookingAddOn>): Promise<boolean> {
  try {
    const res = await fetch(`/api/addons/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addon),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update add-on:', err);
    return false;
  }
}

export async function deleteAddOn(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/addons/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete add-on:', err);
    return false;
  }
}

// 5c. Guest Reviews / Ulasan Tamu Kehormatan (CRUD)
export async function fetchReviews(): Promise<GuestReview[] | null> {
  try {
    const res = await noCacheGet('/api/reviews');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch reviews:', err);
    return null;
  }
}

export async function createReview(review: Partial<GuestReview>): Promise<GuestReview | null> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to create review:', err);
    return null;
  }
}

export async function updateReview(id: string, review: Partial<GuestReview>): Promise<boolean> {
  try {
    const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update review:', err);
    return false;
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete review:', err);
    return false;
  }
}

// 5d. Hero Videos (Persisted in Backend Database)
export async function fetchHeroVideos<T = any>(): Promise<T[] | null> {
  try {
    const res = await noCacheGet('/api/hero-videos');
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : null;
  } catch (err) {
    console.error('Failed to fetch hero videos:', err);
    return null;
  }
}

export async function saveHeroVideosToServer<T = any>(videos: T[]): Promise<boolean> {
  try {
    const res = await fetch('/api/hero-videos', {
      method: 'PUT',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videos),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save hero videos:', err);
    return false;
  }
}

// 5e. Map Locations / 64 Titik Kawasan & Popup Detail (Persisted in Backend Database)
export async function fetchMapLocations<T = any>(): Promise<T[] | null> {
  try {
    const res = await noCacheGet('/api/map-locations');
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : null;
  } catch (err) {
    console.error('Failed to fetch map locations:', err);
    return null;
  }
}

export async function saveMapLocationsToServer<T = any>(locations: T[]): Promise<boolean> {
  try {
    const res = await fetch('/api/map-locations', {
      method: 'PUT',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locations),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save map locations:', err);
    return false;
  }
}

// 5f. Resto, Meeting & Wedding Venues (Persisted in Backend Database)
export async function fetchVenues<T = any>(): Promise<T[] | null> {
  try {
    const res = await noCacheGet('/api/venues');
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : null;
  } catch (err) {
    console.error('Failed to fetch venues:', err);
    return null;
  }
}

export async function saveVenuesToServer<T = any>(venues: T[]): Promise<boolean> {
  try {
    const res = await fetch('/api/venues', {
      method: 'PUT',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venues),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save venues:', err);
    return false;
  }
}

// 6. Reset Database
export async function resetDatabaseToDefaults(): Promise<boolean> {
  try {
    const res = await fetch('/api/reset-defaults', { method: 'POST', cache: 'no-store' });
    return res.ok;
  } catch (err) {
    console.error('Failed to reset database:', err);
    return false;
  }
}

// 7. Admin Authentication & Security
export interface AdminUser {
  username: string;
  email: string;
  name: string;
  role: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: AdminUser;
}

export async function loginAdmin(username: string, password: string): Promise<AdminLoginResponse> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to login admin:', err);
    return { success: false, message: 'Koneksi ke server gagal. Pastikan dev server berjalan.' };
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to change password:', err);
    return { success: false, message: 'Gagal memperbarui kata sandi' };
  }
}

export async function getAdminProfile(): Promise<{ success: boolean; data?: AdminUser }> {
  try {
    const res = await fetch('/api/admin/profile');
    if (!res.ok) return { success: false };
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch admin profile:', err);
    return { success: false };
  }
}

export async function uploadImage(
  imageDataUrl: string,
  filename?: string,
  previousTempUrl?: string
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, filename, previousTempUrl }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, message: errJson.message || 'Gagal mengunggah gambar' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Failed to upload image:', err);
    // If backend is unavailable or offline, fallback directly to the data URL itself!
    return { success: true, url: imageDataUrl, message: 'Gambar dimuat secara lokal' };
  }
}

export async function fetchLiveUsdRate(
  forceRefresh = false
): Promise<{ rate: number; updatedAt?: string; source?: string } | null> {
  try {
    const res = await fetch(`/api/exchange-rate${forceRefresh ? '?refresh=1' : ''}`);
    if (!res.ok) return null;
    const json = await res.json();
    const rate = Number(json?.rate);
    if (Number.isFinite(rate) && rate >= 1000) {
      return { rate: Math.round(rate), updatedAt: json.updatedAt, source: json.source };
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch live USD exchange rate:', err);
    return null;
  }
}
