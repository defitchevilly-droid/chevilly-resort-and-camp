import React, { useState, useRef, useEffect } from 'react';
import { Currency } from '../types';
import {
  ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw,
  Search, Compass, Sparkles,
  Phone, X, Eye, Play, Pause, Volume2, VolumeX,
  Camera, Video, Image as ImageIcon, CheckCircle2,
  ChevronLeft, ChevronRight, MapPin, Clock, Tag, ExternalLink,
  Share2
} from 'lucide-react';
import { FacilitiesData } from '../services/api';

interface WellnessAndDiningProps {
  currency: Currency;
  onBookSpa: () => void;
  onBookDining: () => void;
  onBookMeeting?: () => void;
  facilities?: FacilitiesData | null;
}

export interface MapLocation {
  id: number | string;
  number: string;
  name: string;
  category: 'wahana' | 'villa' | 'kuliner' | 'meeting' | 'fasilitas';
  categoryLabel: string;
  description: string;
  highlight?: string;
  image?: string;
  images?: string[];
  videoUrl?: string;
  videoEmbed?: string;
  videoPoster?: string;
  tagline?: string;
  hours?: string;
  priceNote?: string;
  features?: string[];
  showName?: boolean;
  showDescription?: boolean;
  showHours?: boolean;
  showPrice?: boolean;
}

export const getStoredMapLocations = (): MapLocation[] => {
  try {
    const saved = localStorage.getItem('chevilly_map_locations');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to load map locations from localStorage', err);
  }
  return MAP_LOCATIONS;
};

export const saveStoredMapLocations = (locations: MapLocation[]) => {
  try {
    localStorage.setItem('chevilly_map_locations', JSON.stringify(locations));
    window.dispatchEvent(new CustomEvent('chevilly-map-updated', { detail: locations }));
  } catch (err) {
    console.error('Failed to save map locations to localStorage', err);
  }
};

const MAP_IMAGE_SRC = '/assets/aistudio/BROSUR_CHEVILLY_LENGKAP_JULI_2026___PETA__s__page-0011_5a0ea07e.jpg';
const PANORAMIC_MAP_SRC = '/assets/aistudio/petakawasan_0091dabd.jpg';

export const MAP_LOCATIONS: MapLocation[] = [
  { id: 'P', number: 'P', name: 'Area Parkir Kendaraan', category: 'fasilitas', categoryLabel: 'Fasilitas Umum', description: 'Kantung parkir luas di pintu masuk, area minishop, dan titik tengah kawasan.' },
  { id: 1, number: '1', name: 'Front Office & Lobby', category: 'fasilitas', categoryLabel: 'Fasilitas Umum', description: 'Pusat layanan registrasi check-in, informasi tamu, dan concierge 24 jam.' },
  { id: 2, number: '2', name: 'Villa Hortensia', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila eksklusif dengan taman asri dan balkon menghadap panorama pegunungan.' },
  { id: 3, number: '3', name: 'Villa Rafflesia', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Unit akomodasi privat dengan desain arsitektur hangat dan interior kayu.' },
  { id: 4, number: '4', name: 'Villa Jasmine', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Kenyamanan istirahat tenang di dekat gerbang depan dan taman bunga.' },
  { id: 5, number: '5', name: 'Rumah Hobbit', category: 'wahana', categoryLabel: 'Wahana & Spot Foto', description: 'Spot foto tematik unik bergaya dongeng di lereng bukit hijau.' },
  { id: 6, number: '6', name: 'Villa Marigold', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila nyaman bernuansa alam untuk keluarga kecil.' },
  { id: 7, number: '7', name: 'Villa Willow', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Kamar elegan di bawah naungan pepohonan rindang dan udara sejuk.' },
  { id: 8, number: '8', name: 'Villa Aster', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Chalet nyaman menghadap taman bunga Aster yang berwarna-warni.' },
  { id: 9, number: '9', name: 'Villa Asoka', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Penginapan favorit tamu keluarga dengan akses cepat ke jalur utama.' },
  { id: 10, number: '10', name: 'Chinatown', category: 'wahana', categoryLabel: 'Wahana & Spot Foto', description: 'Kawasan bertema oriental dengan lentera merah, jembatan naga, dan spot foto spektakuler.' },
  { id: 11, number: '11', name: 'Villa Orchid', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila anggrek berhawa dingin dengan pemandangan lembah segar.' },
  { id: 12, number: '12', name: 'Mushola Utama 1', category: 'fasilitas', categoryLabel: 'Fasilitas Umum', description: 'Tempat ibadah bersih, nyaman, dan sejuk dengan tempat wudhu lengkap.' },
  { id: 13, number: '13', name: 'Pujasera 1', category: 'kuliner', categoryLabel: 'Restoran & Kuliner', description: 'Pusat kuliner nusantara dan jajanan hangat pegunungan.' },
  { id: 14, number: '14', name: 'Minishop & Toko Mainan', category: 'fasilitas', categoryLabel: 'Fasilitas Umum', description: 'Toko perlengkapan wisata, cenderamata, mainan anak, dan camilan.' },
  { id: 15, number: '15', name: 'Kolam Renang Anak (Kids Pool)', category: 'wahana', categoryLabel: 'Wahana Air & Wisata', description: 'Kolam renang dangkal aman khusus balita dan anak-anak dengan seluncuran air.' },
  { id: 16, number: '16', name: 'Villa Chrysantemum', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Suaka kamar privat dekat kolam renang dengan panorama indah.' },
  { id: 17, number: '17', name: 'Villa Clover', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Akomodasi tenang dengan dekorasi bunga keberuntungan.' },
  { id: 18, number: '18', name: 'Villa Bougenville', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila keluarga dengan halaman bunga Bougenville yang bermekaran.' },
  { id: 19, number: '19', name: 'Villa Rose', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Kamar romantis bernuansa mawar, cocok untuk pasangan berlibur.' },
  { id: 20, number: '20', name: 'Loket Tiket Fasilitas', category: 'fasilitas', categoryLabel: 'Fasilitas Umum', description: 'Pusat pembelian tiket wahana, waterpark, dan paket outbound.' },
  { id: 21, number: '21', name: 'Aula, Ballroom, King Protea, Flora, Fauna', category: 'meeting', categoryLabel: 'Meeting & Ballroom', description: 'Ruang serbaguna megah untuk gathering kantor, rapat formal, konferensi, dan resepsi megah.' },
  { id: 22, number: '22', name: 'Licorice & Ruang Karaoke', category: 'meeting', categoryLabel: 'Hiburan & Meeting', description: 'Fasilitas hiburan musik privat untuk kebersamaan keluarga dan rekan kerja.' },
  { id: 23, number: '23', name: 'Villa Cattleya', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila premium anggrek Cattleya dengan furnitur elegan.' },
  { id: 24, number: '24', name: 'Lavender (Bunk Bed)', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Kamar berkonsep tempat tidur tingkat (bunk bed), ideal untuk rombongan teman dan komunitas.' },
  { id: 25, number: '25', name: 'Villa Gladious', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Akomodasi tenang di perbatasan lereng pinus.' },
  { id: 26, number: '26', name: 'Tulip & Sunflower', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Kompleks vila kembar bertema bunga ceria dengan udara segar.' },
  { id: 27, number: '27', name: 'Villa Magnolia', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Penginapan mewah dengan pencahayaan hangat alami.' },
  { id: 28, number: '28', name: 'Violet 1 & 2', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Unit vila berkapasitas fleksibel dekat area resto utama.' },
  { id: 29, number: '29', name: 'Vine Restaurant (Estetik Restaurant)', category: 'kuliner', categoryLabel: 'Restoran & Kuliner', description: 'Restoran estetik berpanorama alam terbuka dengan udara sejuk untuk melepas penat dan menikmati sajian lezat.' },
  { id: 30, number: '30', name: 'Kolam Renang Dewasa (Adult Pool)', category: 'wahana', categoryLabel: 'Wahana Air & Wisata', description: 'Kolam renang luas dengan air pegunungan segar dan dek santai kursi berjemur.' },
  { id: 31, number: '31', name: 'Wedding Deck (Dek Pernikahan Alam)', category: 'meeting', categoryLabel: 'Wedding & Event', description: 'Panggung ikrar suci pernikahan outdoor berlatar belakang bukit hijau dan kabut romantis.' },
  { id: 32, number: '32', name: 'Lapangan Outbond 1', category: 'wahana', categoryLabel: 'Aktivitas & Outbound', description: 'Area rumput terbuka luas untuk team building, fun games kelompok, dan gathering.' },
  { id: 33, number: '33', name: 'Labirin (Kids Zona Labirin)', category: 'wahana', categoryLabel: 'Wahana & Petualangan', description: 'Labirin tanaman hijau seru untuk menguji kecekatan dan petualangan anak-anak.' },
  { id: 34, number: '34', name: 'Pujasera 3', category: 'kuliner', categoryLabel: 'Restoran & Kuliner', description: 'Area bersantap santai menyajikan minuman hangat, kopi, dan makanan ringan.' },
  { id: 35, number: '35', name: 'Kolam Renang Pemancingan & Jembatan', category: 'wahana', categoryLabel: 'Wahana Air & Rekreasi', description: 'Danau rekreasi memancing dengan jembatan kayu indah berpanorama pohon rindang.' },
  { id: 36, number: '36', name: 'Green House (Laffyette Room)', category: 'meeting', categoryLabel: 'Meeting & Event Room', description: 'Ruang kaca pertemuan bernuansa botani tanaman hias segar, sangat fotogenik.' },
  { id: 37, number: '37', name: 'Cherry Blossom (Thematic Lumbung)', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Rumah kayu khas Lumbung bernuansa Jepang modern dengan atap melengkung estetik.' },
  { id: 38, number: '38', name: 'Hazel (Rumah Polygon)', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila geometris unik polygon dengan kaca panorama menghadap lembah.' },
  { id: 39, number: '39', name: 'Pujasera 2 / Pusat Oleh-Oleh', category: 'kuliner', categoryLabel: 'Belanja & Kuliner', description: 'Pusat belanja buah tangan khas Puncak, cenderamata Chevilly, dan jajanan.' },
  { id: 40, number: '40', name: 'Villa Edelweiss & Davinci', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Kamar klasik Eropa berpadu sejuknya hawa pegunungan.' },
  { id: 41, number: '41', name: 'Villa Dandelions', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Suaka nyaman di jalur tengah perbukitan Chevilly.' },
  { id: 42, number: '42', name: 'Peony (Glamping Camp)', category: 'villa', categoryLabel: 'Glamping & Camp', description: 'Tenda glamping mewah mewah dengan ranjang hotel empuk dan sensasi berkemah bintang lima.' },
  { id: 43, number: '43', name: 'Jogging Track Lembah Pinus', category: 'wahana', categoryLabel: 'Aktivitas Sehat', description: 'Lintasan lari pagi berkelok melintasi pepohonan cemara berudara murni.' },
  { id: 44, number: '44', name: 'Villa Azalea', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Chalet tenang di dekat jalur atraksi petualangan.' },
  { id: 45, number: '45', name: 'Le Ciel Cafe & Resto', category: 'kuliner', categoryLabel: 'Cafe & Kuliner', description: 'Cafe estetik "Langit Biru" dengan balkon pandang terbuka, kopi pilihan, dan pemandangan pegunungan segar.' },
  { id: 46, number: '46', name: 'Aviary (Taman Burung Eksotis)', category: 'wahana', categoryLabel: 'Wahana & Edukasi', description: 'Kubah sangkar raksasa tempat burung warna-warni terbang bebas dan dapat diberi makan langsung.' },
  { id: 47, number: '47', name: 'Istana Boneka', category: 'wahana', categoryLabel: 'Wahana & Spot Foto', description: 'Dunia fantasi boneka lucu yang sangat disukai anak-anak dan keluarga.' },
  { id: 48, number: '48', name: 'Chevilly Waterpark', category: 'wahana', categoryLabel: 'Wahana Air & Wisata', description: 'Wahana rekreasi air terlengkap dengan kolam ombak santai, ember tumpah, dan seluncuran spiral.' },
  { id: 49, number: '49', name: 'The Cove Bar & Resto', category: 'kuliner', categoryLabel: 'Restoran & Cafe', description: 'Lounge semi-outdoor untuk menikmati camilan sore, mocktail segar, dan panorama sunset.' },
  { id: 50, number: '50', name: 'Track UTV & ATV Adventure', category: 'wahana', categoryLabel: 'Wahana Petualangan', description: 'Sirkuit off-road menantang menembus tanah bergelombang dan rimbunnya hutan.' },
  { id: 51, number: '51', name: 'Mini Golf Greens', category: 'wahana', categoryLabel: 'Wahana & Olahraga', description: 'Lapangan golf mini berliku untuk melatih ketepatan putter bersama keluarga.' },
  { id: 52, number: '52', name: 'Playground & Kidspot', category: 'wahana', categoryLabel: 'Taman Bermain Anak', description: 'Wahana ayunan, perosotan, jungkat-jungkit aman beralas rumput empuk.' },
  { id: 53, number: '53', name: 'Lapangan Outbond 2', category: 'wahana', categoryLabel: 'Aktivitas & Outbound', description: 'Area outdoor kedua untuk kapasitas kelompok lebih besar hingga ratusan peserta.' },
  { id: 54, number: '54', name: 'Villa Lotus', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila tenang bernuansa teratai air di lereng barat.' },
  { id: 55, number: '55', name: 'Zona Prabayar & Tiket', category: 'fasilitas', categoryLabel: 'Fasilitas Layanan', description: 'Pusat loket isi ulang kartu wahana dan informasi tiket elektronik.' },
  { id: 56, number: '56', name: 'Kebun Sayuran Organik (Hydroponic)', category: 'wahana', categoryLabel: 'Wisata Edukasi Tani', description: 'Kebun sayur segar organik ramah lingkungan tempat memetik sayur bersama petani resor.' },
  { id: 57, number: '57', name: 'Hotel Tanah Baru Chevilly', category: 'villa', categoryLabel: 'Hotel & Kamar', description: 'Gedung hotel bertingkat dengan kamar modern berfasilitas lengkap.' },
  { id: 58, number: '58', name: 'Rainbow Slide Pelangi', category: 'wahana', categoryLabel: 'Wahana Petualangan', description: 'Seluncuran warna-warni panjang menuruni bukit dengan ban luncur seru berkecepatan tinggi.' },
  { id: 59, number: '59', name: 'Danau Rekreasi Chevilly', category: 'wahana', categoryLabel: 'Wahana Air Alami', description: 'Danau tenang dengan perahu kayuh dan pemandangan pegunungan yang menyejukkan.' },
  { id: 60, number: '60', name: 'Villa Typha Blok A', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila privat eksklusif di tepi danau yang tenang.' },
  { id: 61, number: '61', name: 'Colosseum Amphitheater', category: 'wahana', categoryLabel: 'Atraksi Arsitektur', description: 'Replika arena megah bergaya Romawi kuno untuk pertunjukan seni, konser mini, dan spot foto spektakuler.' },
  { id: 62, number: '62', name: 'Fresh Market Chevilly', category: 'kuliner', categoryLabel: 'Pasar Buah & Sayur', description: 'Gerai buah-buahan segar, madu hutan, dan hasil kebun pegunungan Puncak.' },
  { id: 63, number: '63', name: 'Villa Typha Blok B', category: 'villa', categoryLabel: 'Vila & Penginapan', description: 'Vila tepi danau dengan teras pandang santai menikmati semilir angin.' },
  { id: 64, number: '64', name: 'Masjid Raya Chevilly', category: 'fasilitas', categoryLabel: 'Fasilitas Ibadah', description: 'Masjid megah berkubah anggun untuk salat berjamaah tamu resor dan pengunjung.' },
];

export interface LocationDetailData {
  images: string[];
  videoUrl: string;
  videoEmbed?: string;
  videoPoster: string;
  tagline: string;
  hours: string;
  priceNote: string;
  features: string[];
}

export const getLocationDetails = (loc: MapLocation): LocationDetailData => {
  const num = parseInt(loc.number, 10);

  // Default images for Villa / Stay
  let images = [
    '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
    '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
    '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
  ];
  let videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-mountain-forest-resort-aerial-view-42891-large.mp4';
  let videoPoster = '/src/assets/images/suite_alpine_villa_1794216168656.jpg';
  let tagline = 'Kenyamanan peristirahatan eksklusif di tengah sejuknya alam pegunungan Chevilly.';
  let hours = 'Check-in: 14:00 WIB · Check-out: 12:00 WIB';
  let priceNote = 'Hubungi BDE Defit untuk ketersediaan kamar, paket weekday & promo grup.';
  let features = [
    'Balkon pribadi dengan panorama lembah & pepohonan hijau',
    'Kamar mandi marmer mewah dilengkapi pemanas air (hot water)',
    'Akses internet WiFi cepat di dalam kamar',
    'Smart TV, tea/coffee maker, dan mineral water harian',
    'Layanan resepsionis & concierge resor 24 jam',
    'Akses mudah ke restoran utama dan wahana rekreasi'
  ];

  if (loc.category === 'wahana') {
    if (num === 48 || loc.name.toLowerCase().includes('waterpark')) {
      images = [
        '/src/assets/images/waterpark_chevilly_1794289440273.jpg',
        '/src/assets/images/wellness_thermal_spa_1794216168378.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
      ];
      videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-water-flowing-in-a-forest-stream-43187-large.mp4';
      videoPoster = '/src/assets/images/waterpark_chevilly_1794289440273.jpg';
      tagline = 'Wahana rekreasi air terlengkap dengan kolam ombak santai, seluncuran spiral, dan suasana pegunungan sejuk.';
      hours = '08:00 - 17:00 WIB Setiap Hari';
      priceNote = 'Tiket masuk Rp 25.000 - Rp 35.000 / orang (termasuk wahana anak)';
      features = [
        'Kolam renang ombak & ember tumpah seru untuk anak',
        'Seluncuran spiral air dengan pengamanan ketat',
        'Kamar bilas & ruang ganti bersih terawat',
        'Penyewaan ban luncur & pelampung renang',
        'Penjaga kolam (lifeguard) bersertifikat siaga penuh'
      ];
    } else if (num === 46 || loc.name.toLowerCase().includes('aviary')) {
      images = [
        '/src/assets/images/aviary_chevilly_1794289455105.jpg',
        '/src/assets/images/labirin_chevilly_1794289535305.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
      ];
      videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4';
      videoPoster = '/src/assets/images/aviary_chevilly_1794289455105.jpg';
      tagline = 'Kubah sangkar raksasa tempat burung eksotis warna-warni terbang bebas di alam terbuka.';
      hours = '08:00 - 17:00 WIB';
      priceNote = 'Tiket Rp 20.000 / orang (termasuk paket pakan burung)';
      features = [
        'Interaksi & memberi makan burung jinak langsung di tangan',
        'Puluhan spesies burung tropis eksotis yang anggun',
        'Jalur pejalan kaki ramah anak-anak dan lansia',
        'Spot foto instagrammable di dalam kubah raksasa',
        'Pemandu edukasi satwa untuk keluarga'
      ];
    } else if (num === 10 || loc.name.toLowerCase().includes('chinatown')) {
      images = [
        '/src/assets/images/chinatown_chevilly_1794289471017.jpg',
        '/src/assets/images/colosseum_chevilly_1794289493620.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
      ];
      videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-with-swimming-pools-41865-large.mp4';
      videoPoster = '/src/assets/images/chinatown_chevilly_1794289471017.jpg';
      tagline = 'Kawasan oriental khas dengan jembatan naga merah, lampion tradisional, dan pagoda megah.';
      hours = '08:00 - 20:00 WIB';
      priceNote = 'Termasuk dalam tiket masuk reguler kawasan resor';
      features = [
        'Penyewaan pakaian tradisional Hanfu & Cheongsam',
        'Jembatan naga merah berlatar bukit pinus megah',
        'Ratusan lampion merah menyala dramatis saat senja/malam',
        'Gerai kudapan dan minuman oriental hangat',
        'Spot foto paling favorit wisatawan keluarga'
      ];
    } else if (num === 61 || loc.name.toLowerCase().includes('colosseum')) {
      images = [
        '/src/assets/images/colosseum_chevilly_1794289493620.jpg',
        '/src/assets/images/chinatown_chevilly_1794289471017.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
      ];
      videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-with-swimming-pools-41865-large.mp4';
      videoPoster = '/src/assets/images/colosseum_chevilly_1794289493620.jpg';
      tagline = 'Kemegahan arsitektur Romawi kuno melingkar di tengah panorama hijau alam pegunungan Puncak.';
      hours = '08:00 - 21:00 WIB';
      priceNote = 'Spot foto ikonik terbuka untuk seluruh pengunjung';
      features = [
        'Pilar-pilar batu megah bergaya amfiteater klasik Romawi',
        'Pencahayaan tematik sorot lampu saat senja dan malam hari',
        'Panggung seni dan pertunjukan musik akustik berkala',
        'Latar foto prewedding dan foto kelompok favorit',
        'Kapasitas area lapang hingga ratusan orang'
      ];
    } else if (num === 50 || loc.name.toLowerCase().includes('atv')) {
      images = [
        '/src/assets/images/utv_atv_chevilly_1794289555220.jpg',
        '/src/assets/images/zip_coaster_chevilly_1794289515116.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
      ];
      videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4';
      videoPoster = '/src/assets/images/utv_atv_chevilly_1794289555220.jpg';
      tagline = 'Pacu adrenalin menembus rute tanah bergelombang di sirkuit off-road lereng hutan Chevilly.';
      hours = '08:30 - 16:30 WIB';
      priceNote = 'Mulai Rp 75.000 / putaran jalur tantangan';
      features = [
        'Kendaraan UTV & ATV 4x4 transmisi otomatis mudah dikemudikan',
        'Perlengkapan keselamatan lengkap (helm pelindung SNI & rompi)',
        'Instruktur pemandu berpengalaman di sepanjang rute',
        'Tantangan tikungan berlumpur dan tanjakan seru',
        'Dokumentasi aksi off-road di titik strategis'
      ];
    } else if (num === 33 || loc.name.toLowerCase().includes('labirin')) {
      images = [
        '/src/assets/images/labirin_chevilly_1794289535305.jpg',
        '/src/assets/images/zip_coaster_chevilly_1794289515116.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
      ];
      videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-mountain-forest-resort-aerial-view-42891-large.mp4';
      videoPoster = '/src/assets/images/labirin_chevilly_1794289535305.jpg';
      tagline = 'Petualangan mencari jalan keluar di antara dinding tanaman hijau asri yang menantang dan asyik.';
      hours = '08:00 - 17:30 WIB';
      priceNote = 'Tiket terjangkau untuk anak-anak dan keluarga';
      features = [
        'Dinding tanaman pangkas hijau alami yang rapi dan segar',
        'Menara pantau di tengah labirin untuk melihat pemandangan luas',
        'Aman dan mengasah ketangkasan logika arah anak-anak',
        'Spot foto estetik dari atas dek pengawas',
        'Terhubung langsung dengan area taman bermain keluarga'
      ];
    } else {
      images = [
        '/src/assets/images/zip_coaster_chevilly_1794289515116.jpg',
        '/src/assets/images/waterpark_chevilly_1794289440273.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
      ];
      videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-mountain-forest-resort-aerial-view-42891-large.mp4';
      videoPoster = '/src/assets/images/zip_coaster_chevilly_1794289515116.jpg';
      tagline = 'Atraksi petualangan seru untuk melengkapi momen liburan berkesan di resor 14 hektar.';
      hours = '08:00 - 17:00 WIB';
      priceNote = 'Tiket wahana harian / paket bundling hemat';
      features = [
        'Standar keselamatan bersertifikat nasional',
        'Didampingi staf operator ramah dan sigap',
        'Suasana alam terbuka nan sejuk dan asri',
        'Cocok untuk dokumentasi foto dan video media sosial'
      ];
    }
  } else if (loc.category === 'kuliner') {
    images = [
      '/src/assets/images/dining_summit_bistro_1794216168611.jpg',
      '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
      '/src/assets/images/deluxe_room_resort_1794221424197.jpg'
    ];
    videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-a-mountain-valley-42861-large.mp4';
    videoPoster = '/src/assets/images/dining_summit_bistro_1794216168611.jpg';
    tagline = 'Sensasi bersantap di ketinggian dengan panorama lembah terbuka dan angin segar pegunungan.';
    hours = '07:00 - 22:00 WIB (Buka Setiap Hari)';
    priceNote = 'Tersedia menu à la carte, paket keluarga, dan coffee bar';
    features = [
      'Pemandangan alam terbuka 360 derajat ke arah lembah hijau',
      'Pilihan menu masakan Nusantara otentik, Western & Asian fusion',
      'Bar kopi kekinian dengan racikan barista handal',
      'Suasana estetik dengan pencahayaan hangat saat senja',
      'Kapasitas tempat duduk luas untuk rombongan keluarga & komunitas'
    ];
  } else if (loc.category === 'meeting') {
    images = [
      '/src/assets/images/resort_meeting_room_1794221120880.jpg',
      '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
      '/src/assets/images/hero_mountain_resort_1794216168533.jpg'
    ];
    videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-with-swimming-pools-41865-large.mp4';
    videoPoster = '/src/assets/images/resort_meeting_room_1794221120880.jpg';
    tagline = 'Venue eksklusif untuk rapat kerja, konferensi profesional, gathering perusahaan, dan pesta pernikahan megah.';
    hours = 'Reservasi Khusus Sesuai Jadwal Event';
    priceNote = 'Pilihan Checklist Paket: Fullboard Single, Twin, Triple & Bunkbed';
    features = [
      'Sistem tata suara (sound system) profesional & mic nirkabel',
      'Videotron LED resolusi tinggi & proyektor widescreen',
      'Koneksi internet serat optik kecepatan tinggi hingga 1 Gbps',
      'Layanan coffee break & catering prasmanan istimewa',
      'Area parkir luas dengan akses drop-off VIP langsung'
    ];
  } else if (loc.category === 'fasilitas') {
    images = [
      '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
      '/src/assets/images/wellness_thermal_spa_1794216168378.jpg',
      '/src/assets/images/suite_alpine_villa_1794216168656.jpg'
    ];
    videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-with-swimming-pools-41865-large.mp4';
    videoPoster = '/src/assets/images/hero_mountain_resort_1794216168533.jpg';
    tagline = 'Sarana penunjang berstandar prima untuk kenyamanan, ibadah, dan keamanan seluruh pengunjung.';
    hours = 'Layanan Aktif 24 Jam';
    priceNote = 'Fasilitas umum kawasan Chevilly Resort 14 Hektar';
    features = [
      'Kebersihan dan kenyamanan area yang senantiasa terjaga',
      'Akses lokasi strategis di sepanjang jalur utama kawasan',
      'Staf keamanan dan resepsionis siaga melayani 24 jam',
      'Fasilitas wudhu dan toilet bersih terawat'
    ];
  }

  return {
    images: loc.images && loc.images.length > 0 ? loc.images : loc.image ? [loc.image, ...images.slice(1)] : images,
    videoUrl: loc.videoUrl || videoUrl,
    videoEmbed: loc.videoEmbed || undefined,
    videoPoster: loc.videoPoster || (loc.image || videoPoster),
    tagline: loc.tagline || tagline,
    hours: loc.hours || hours,
    priceNote: loc.priceNote || priceNote,
    features: loc.features && loc.features.length > 0 ? loc.features : features,
  };
};

export const WellnessAndDining: React.FC<WellnessAndDiningProps> = ({
  currency: _currency,
  onBookSpa,
  onBookDining,
  onBookMeeting,
  facilities,
}) => {
  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Interactive Panoramic Area Map (Zoom & Hover Left-Right Pan) state
  const [areaMapZoom, setAreaMapZoom] = useState<number>(1);
  const [isAreaMapHovering, setIsAreaMapHovering] = useState<boolean>(false);
  const [areaMapOrigin, setAreaMapOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isAreaMapFullscreen, setIsAreaMapFullscreen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLocation, setActiveLocation] = useState<MapLocation | null>(null);
  const [locations, setLocations] = useState<MapLocation[]>(getStoredMapLocations);

  // Sync locations with storage and custom event from admin portal
  useEffect(() => {
    const handleMapUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setLocations(e.detail);
      } else {
        setLocations(getStoredMapLocations());
      }
    };
    window.addEventListener('chevilly-map-updated', handleMapUpdate);
    window.addEventListener('storage', handleMapUpdate);
    return () => {
      window.removeEventListener('chevilly-map-updated', handleMapUpdate);
      window.removeEventListener('storage', handleMapUpdate);
    };
  }, []);

  // Listen for custom event from Resto & Cafe dropdown
  useEffect(() => {
    const handleSelectDiningEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const term = customEvent.detail;
      if (term) {
        setSelectedCategory('kuliner');
        setSearchQuery(term);
        const match = locations.find((l) =>
          l.name.toLowerCase().includes(term.toLowerCase()) ||
          l.description.toLowerCase().includes(term.toLowerCase())
        );
        if (match) {
          setActiveLocation(match);
        }
      }
    };
    window.addEventListener('chevilly-select-dining', handleSelectDiningEvent);
    return () => window.removeEventListener('chevilly-select-dining', handleSelectDiningEvent);
  }, [locations]);

  // Detail Modal (Photo & Video) state
  const [detailModalLocation, setDetailModalLocation] = useState<MapLocation | null>(null);
  const [mediaTab, setMediaTab] = useState<'photo' | 'video'>('photo');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsVideoMuted(videoRef.current.muted);
    }
  };

  const handlePrevLocation = () => {
    if (!detailModalLocation) return;
    const currentIndex = locations.findIndex((l) => l.id === detailModalLocation.id);
    const prevIndex = (currentIndex - 1 + locations.length) % locations.length;
    const prevLoc = locations[prevIndex];
    setDetailModalLocation(prevLoc);
    setActiveLocation(prevLoc);
    setSelectedImageIndex(0);
  };

  const handleNextLocation = () => {
    if (!detailModalLocation) return;
    const currentIndex = locations.findIndex((l) => l.id === detailModalLocation.id);
    const nextIndex = (currentIndex + 1) % locations.length;
    const nextLoc = locations[nextIndex];
    setDetailModalLocation(nextLoc);
    setActiveLocation(nextLoc);
    setSelectedImageIndex(0);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.35, 0.85));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Panoramic Area Map zoom & hover left-right pan handlers
  const effectiveAreaScale = areaMapZoom > 1 ? areaMapZoom : isAreaMapHovering ? 1.85 : 1;

  const handleAreaMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const rawX = (e.clientX - rect.left) / rect.width;
    const rawY = (e.clientY - rect.top) / rect.height;
    const normX = Math.max(0, Math.min(100, ((rawX - 0.06) / 0.88) * 100));
    const normY = Math.max(0, Math.min(100, ((rawY - 0.08) / 0.84) * 100));
    setAreaMapOrigin({ x: normX, y: normY });
  };

  const handleAreaMapTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const rawX = (touch.clientX - rect.left) / rect.width;
    const rawY = (touch.clientY - rect.top) / rect.height;
    const normX = Math.max(0, Math.min(100, ((rawX - 0.06) / 0.88) * 100));
    const normY = Math.max(0, Math.min(100, ((rawY - 0.08) / 0.84) * 100));
    setAreaMapOrigin({ x: normX, y: normY });
    if (areaMapZoom === 1) setAreaMapZoom(1.85);
  };

  const handleAreaZoomIn = () => {
    setAreaMapZoom((prev) => Math.min(Number((prev + 0.5).toFixed(2)), 3.5));
  };

  const handleAreaZoomOut = () => {
    setAreaMapZoom((prev) => Math.max(Number((prev - 0.5).toFixed(2)), 1));
  };

  const handleAreaZoomReset = () => {
    setAreaMapZoom(1);
    setAreaMapOrigin({ x: 50, y: 50 });
  };

  const handleAreaPanStep = (deltaX: number) => {
    if (areaMapZoom <= 1) setAreaMapZoom(2);
    setAreaMapOrigin((prev) => ({
      x: Math.max(0, Math.min(100, prev.x + deltaX)),
      y: prev.y,
    }));
  };

  const handleAreaMapClickCycleZoom = () => {
    setAreaMapZoom((prev) => {
      if (prev < 1.8) return 2;
      if (prev < 2.8) return 3;
      return 1;
    });
  };

  // Filter locations
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && loc.category === selectedCategory;
  });

  return (
    <section id="map" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* 1. Header Section: Masterplan Kawasan 14 Hektar */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#967d58] text-[11px] font-mono uppercase tracking-widest font-semibold">
          <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>03. Masterplan Kawasan Wisata 14 Hektar</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#182a24] font-bold tracking-tight [text-wrap:balance]">
          Peta Lengkap Kawasan Chevilly Resort & Camp
        </h2>
        <p className="text-xs sm:text-sm text-[#52645c] leading-relaxed [text-wrap:balance]">
          {facilities?.dining?.description ||
            'Menawarkan daya tarik utama berupa udara yang sejuk, panorama alam terbuka, serta suasana yang tenang untuk melepas penat dalam kawasan terpadu seluas 14 hektar dengan 64 titik wahana, vila, resto, dan rekreasi.'}
        </p>
      </div>

      {/* 3. DIREKTORI 64 TITIK LOKASI PETA DENGAN PENCARIAN & FILTER */}
      <div id="dining" className="bg-[#fcfbf9] border border-[#ded7cb] p-6 sm:p-8 space-y-6 shadow-sm relative scroll-mt-24">
        <span id="wellness" className="absolute -top-24" />
        <span id="meeting" className="absolute -top-24" />

        {/* FOTO PETA KAWASAN INTERAKTIF (ZOOM & HOVER KIRI-KANAN) */}
        <div className="bg-white border border-[#ded7cb] shadow-md overflow-hidden">
          {/* Toolbar Kontrol Zoom & Geser Kiri-Kanan */}
          <div className="bg-[#182a24] text-[#f7f5ef] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#d4af37]/30">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span className="font-serif text-sm font-bold text-white tracking-wide">
                Peta Ilustrasi Kawasan (Titik 1 – 64)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleAreaPanStep(-22)}
                className="px-2 py-1 bg-[#253d34] hover:bg-[#345347] border border-[#d4af37]/30 text-[#fae7b3] flex items-center gap-1 transition-colors cursor-pointer"
                title="Geser ke Kiri (Area 45 - 64)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kiri</span>
              </button>

              <button
                type="button"
                onClick={() => handleAreaPanStep(22)}
                className="px-2 py-1 bg-[#253d34] hover:bg-[#345347] border border-[#d4af37]/30 text-[#fae7b3] flex items-center gap-1 transition-colors cursor-pointer"
                title="Geser ke Kanan (Area 1 - 25)"
              >
                <span className="hidden sm:inline">Kanan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <span className="w-px h-4 bg-[#d4af37]/30 mx-0.5 hidden sm:inline-block" />

              <button
                type="button"
                onClick={handleAreaZoomOut}
                className="px-2 py-1 bg-[#253d34] hover:bg-[#345347] border border-[#d4af37]/30 text-[#fae7b3] flex items-center gap-1 transition-colors cursor-pointer"
                title="Perkecil (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleAreaZoomReset}
                className="px-2.5 py-1 bg-[#253d34] hover:bg-[#345347] border border-[#d4af37]/30 text-[#eed492] font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset Zoom & Posisi"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{Math.round(effectiveAreaScale * 100)}%</span>
              </button>

              <button
                type="button"
                onClick={handleAreaZoomIn}
                className="px-2 py-1 bg-[#253d34] hover:bg-[#345347] border border-[#d4af37]/30 text-[#fae7b3] flex items-center gap-1 transition-colors cursor-pointer"
                title="Perbesar (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsAreaMapFullscreen(true)}
                className="ml-0.5 px-2.5 py-1 bg-[#d4af37] hover:bg-[#fae7b3] text-[#0d1613] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Buka Peta Layar Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Layar Penuh</span>
              </button>
            </div>
          </div>

          {/* Interactive Zoom & Hover Left-Right Viewport */}
          <div
            onMouseEnter={() => setIsAreaMapHovering(true)}
            onMouseLeave={() => {
              setIsAreaMapHovering(false);
              if (areaMapZoom === 1) setAreaMapOrigin({ x: 50, y: 50 });
            }}
            onMouseMove={handleAreaMapMouseMove}
            onTouchMove={handleAreaMapTouchMove}
            onClick={handleAreaMapClickCycleZoom}
            className="relative w-full bg-white overflow-hidden select-none cursor-zoom-in group"
            style={{ touchAction: 'pan-y' }}
          >
            <div
              className={`w-full will-change-transform ${
                isAreaMapHovering ? 'transition-transform duration-150 ease-out' : 'transition-transform duration-300 ease-out'
              }`}
              style={{
                transformOrigin: `${areaMapOrigin.x}% ${areaMapOrigin.y}%`,
                transform: `scale(${effectiveAreaScale})`,
              }}
            >
              <img
                src={PANORAMIC_MAP_SRC}
                alt="Peta Ilustrasi Kawasan Chevilly Resort & Camp Titik 1 sampai 64"
                draggable={false}
                className="w-full h-auto max-h-[480px] object-contain mx-auto block px-2 py-4 sm:px-6 sm:py-6"
              />
            </div>

            {/* Subtle Left/Right Edge Pan Buttons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAreaPanStep(-25);
              }}
              aria-label="Geser Peta ke Kiri"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#182a24]/75 hover:bg-[#182a24] text-[#fae7b3] border border-[#d4af37]/40 flex items-center justify-center shadow-md opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAreaPanStep(25);
              }}
              aria-label="Geser Peta ke Kanan"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#182a24]/75 hover:bg-[#182a24] text-[#fae7b3] border border-[#d4af37]/40 flex items-center justify-center shadow-md opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom Guide Ribbon */}
            <div className="bg-[#f5f1e8] border-t border-[#ded7cb] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#52645c]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#967d58] shrink-0" />
                <span>Arahkan kursor kiri–kanan untuk zoom &amp; menjelajah titik 1–64, atau klik peta untuk memperbesar.</span>
              </span>
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#73837b]">
                <span>Kiri (64)</span>
                <div className="w-20 h-1.5 bg-[#ded7cb] relative overflow-hidden">
                  <div
                    className="h-full bg-[#182a24] transition-all duration-100"
                    style={{ width: '28%', marginLeft: `${Math.min(72, Math.max(0, areaMapOrigin.x * 0.72))}%` }}
                  />
                </div>
                <span>Kanan (1)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#ded7cb]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#967d58] font-semibold mb-1">
              Direktori Lokasi Interaktif
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#182a24]">
              Daftar 64 Titik Lokasi Kawasan Chevilly
            </h3>
            <p className="text-xs text-[#73837b] mt-0.5">
              Klik salah satu nomor untuk melihat detail wahana, fasilitas, atau penginapan.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari titik (misal: Waterpark, Vine, Peony)..."
              className="w-full bg-white border border-[#ded7cb] pl-9 pr-8 py-2 text-xs text-[#182a24] placeholder-stone-400 focus:outline-none focus:border-[#d4af37]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'all', label: `Semua (${locations.length})` },
            { id: 'wahana', label: `Wahana & Wisata (${locations.filter((l) => l.category === 'wahana').length})` },
            { id: 'villa', label: `Vila & Glamping (${locations.filter((l) => l.category === 'villa').length})` },
            { id: 'kuliner', label: `Resto & Kuliner (${locations.filter((l) => l.category === 'kuliner').length})` },
            { id: 'meeting', label: `Meeting & Wedding (${locations.filter((l) => l.category === 'meeting').length})` },
            { id: 'fasilitas', label: `Fasilitas Umum (${locations.filter((l) => l.category === 'fasilitas').length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#182a24] text-[#fae7b3] border-[#182a24] shadow-sm font-semibold'
                  : 'bg-white text-[#52645c] border-[#ded7cb] hover:border-[#b89562] hover:text-[#182a24]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Selected Item Detail Callout */}
        {activeLocation && (
          <div className="p-4 bg-[#182a24] text-white border-2 border-[#d4af37] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d4af37] text-[#0d1613] font-bold font-mono text-base flex items-center justify-center shrink-0 shadow-md">
                {activeLocation.number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {activeLocation.showName !== false && (
                    <h4 className="font-serif text-lg font-bold text-white">{activeLocation.name}</h4>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#d4af37]/25 text-[#eed492] border border-[#d4af37]/40 uppercase">
                    {activeLocation.categoryLabel}
                  </span>
                </div>
                {activeLocation.showDescription !== false && (
                  <p className="text-xs text-[#cad5cf] mt-1">{activeLocation.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => {
                  setDetailModalLocation(activeLocation);
                  setMediaTab('photo');
                  setSelectedImageIndex(0);
                }}
                className="px-3.5 py-1.5 bg-[#d4af37] hover:bg-[#fae7b3] text-[#0d1613] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Buka Popup Galeri Foto & Video Titik Ini"
              >
                <Video className="w-3.5 h-3.5 text-[#0d1613]" />
                <span>Lihat Foto & Video</span>
              </button>
              <a
                href={`https://wa.me/6285934544901?text=${encodeURIComponent(`Halo BDE Defit, saya ingin menanyakan informasi mengenai Titik No. ${activeLocation.number} (${activeLocation.name}) di Chevilly Resort.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Tanya via WA</span>
              </a>
              <button
                onClick={() => setActiveLocation(null)}
                className="p-1.5 text-stone-300 hover:text-white cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Grid of 64 Numbered Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredLocations.map((loc) => {
            const isSelected = activeLocation?.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  setActiveLocation(loc);
                  setDetailModalLocation(loc);
                  setMediaTab('photo');
                  setSelectedImageIndex(0);
                }}
                className={`p-2.5 text-left border transition-all cursor-pointer flex items-center justify-between gap-2.5 group relative ${
                  isSelected
                    ? 'bg-[#182a24] text-white border-[#d4af37] shadow-sm ring-1 ring-[#d4af37]'
                    : 'bg-white hover:bg-[#fbf9f5] border-[#e2dcd0] hover:border-[#b89562] text-[#182a24]'
                }`}
                title={`Klik untuk melihat detail foto, video & info ${loc.name}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#d4af37] text-[#0d1613]'
                        : 'bg-[#f0ece1] text-[#182a24] border border-[#d8d0c2] group-hover:bg-[#d4af37] group-hover:text-[#0d1613]'
                    }`}
                  >
                    {loc.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-semibold truncate ${isSelected ? 'text-[#fae7b3]' : 'text-[#182a24]'}`}>
                      {loc.name}
                    </div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-[#cad5cf]' : 'text-[#73837b]'}`}>
                      {loc.categoryLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="p-1 rounded bg-[#f2eee3] group-hover:bg-[#fae7b3] text-[#73837b] group-hover:text-[#182a24] text-[10px] flex items-center gap-0.5">
                    <Camera className="w-3 h-3 text-[#967d58]" />
                    <Video className="w-3 h-3 text-emerald-700" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-8 text-xs text-[#73837b]">
            Tidak ditemukan titik lokasi dengan kata kunci "{searchQuery}".
          </div>
        )}
      </div>

      {/* 4. DETAIL POPUP MODAL (FOTO, VIDEO & DETAIL LENGKAP) */}
      {detailModalLocation && (() => {
        const details = getLocationDetails(detailModalLocation);
        return (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-[#fcfbf9] border-2 border-[#182a24] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#182a24]">
              
              {/* Modal Top Header Bar */}
              <div className="bg-[#182a24] text-[#f7f5ef] px-5 py-3.5 flex items-center justify-between border-b border-[#d4af37]/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#d4af37] text-[#0d1613] flex items-center justify-center font-bold font-mono text-base shadow-sm shrink-0">
                    {detailModalLocation.number}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-white truncate">
                        {detailModalLocation.name}
                      </h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#d4af37]/20 text-[#eed492] border border-[#d4af37]/40">
                        {detailModalLocation.categoryLabel}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#cad5cf] truncate">
                      Chevilly Resort & Camp · Titik Lokasi Peta No. {detailModalLocation.number}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://wa.me/6285934544901?text=${encodeURIComponent(`Halo BDE Defit, saya tertarik dengan informasi Titik No. ${detailModalLocation.number} (${detailModalLocation.name}) di Chevilly Resort. Mohon info ketersediaan & paketnya.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Tanya BDE Defit</span>
                  </a>
                  <button
                    onClick={() => setDetailModalLocation(null)}
                    className="p-1.5 text-[#eed492] hover:text-white transition-colors cursor-pointer"
                    aria-label="Tutup Detail"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body Container */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6 bg-[#faf9f5]">
                
                {/* Media Segmented Control & Player */}
                <div className="bg-white border border-[#ded7cb] shadow-sm overflow-hidden">
                  
                  {/* Tab Selector Header */}
                  <div className="bg-[#f0ece1] px-4 py-2.5 border-b border-[#ded7cb] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMediaTab('photo')}
                        className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          mediaTab === 'photo'
                            ? 'bg-[#182a24] text-[#fae7b3] shadow-xs'
                            : 'bg-white text-[#52645c] hover:text-[#182a24] border border-[#ded7cb]'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Foto Galeri ({details.images.length})</span>
                      </button>

                      <button
                        onClick={() => setMediaTab('video')}
                        className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          mediaTab === 'video'
                            ? 'bg-[#182a24] text-[#fae7b3] shadow-xs'
                            : 'bg-white text-[#52645c] hover:text-[#182a24] border border-[#ded7cb]'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Video Tour Kawasan</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#73837b] hidden sm:block font-mono">
                      {mediaTab === 'photo' ? 'Resolusi HD Asli' : 'Format 1080p Cinematic'}
                    </div>
                  </div>

                  {/* Media Content Display */}
                  {mediaTab === 'photo' ? (
                    <div>
                      {/* Main Featured Photo */}
                      <div className="relative aspect-[16/9] w-full bg-stone-900 overflow-hidden group">
                        <img
                          src={details.images[selectedImageIndex] || details.images[0]}
                          alt={`${detailModalLocation.name} - Sudut ${selectedImageIndex + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                        
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                          <div>
                            <div className="font-semibold text-[#fae7b3]">{detailModalLocation.name}</div>
                            <div className="text-[11px] text-stone-300">
                              Foto Sudut {selectedImageIndex + 1} dari {details.images.length}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-black/60 border border-white/20">
                            14 Hektar Chevilly Ridge
                          </span>
                        </div>

                        {/* Arrows */}
                        {details.images.length > 1 && (
                          <>
                            <button
                              onClick={() => setSelectedImageIndex((prev) => (prev - 1 + details.images.length) % details.images.length)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer rounded-full"
                              aria-label="Foto Sebelumnya"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedImageIndex((prev) => (prev + 1) % details.images.length)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer rounded-full"
                              aria-label="Foto Selanjutnya"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Thumbnails Picker */}
                      {details.images.length > 1 && (
                        <div className="p-3 bg-[#f7f5ef] border-t border-[#ded7cb] flex items-center gap-2.5 overflow-x-auto">
                          {details.images.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`relative w-20 h-14 rounded-xs overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                selectedImageIndex === idx
                                  ? 'border-[#182a24] ring-2 ring-[#d4af37]'
                                  : 'border-[#ded7cb] opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-mono px-1">
                                #{idx + 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Video Tour Player / Embed */
                    <div className="relative aspect-[16/9] w-full bg-black overflow-hidden flex items-center justify-center">
                      {details.videoEmbed ? (
                        details.videoEmbed.includes('<iframe') ? (
                          <div
                            className="w-full h-full flex items-center justify-center [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
                            dangerouslySetInnerHTML={{ __html: details.videoEmbed }}
                          />
                        ) : (
                          <iframe
                            src={
                              details.videoEmbed.includes('watch?v=')
                                ? details.videoEmbed.replace('watch?v=', 'embed/').split('&')[0]
                                : details.videoEmbed.includes('youtu.be/')
                                ? `https://www.youtube.com/embed/${details.videoEmbed.split('youtu.be/')[1].split('?')[0]}`
                                : details.videoEmbed
                            }
                            title={detailModalLocation.name}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )
                      ) : (
                        <>
                          <video
                            ref={videoRef}
                            src={details.videoUrl}
                            poster={details.videoPoster}
                            playsInline
                            autoPlay
                            loop
                            muted={isVideoMuted}
                            className="w-full h-full object-cover"
                          />

                          {/* Video Gradient Overlay & Controls */}
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={toggleVideoPlay}
                                className="p-2 bg-[#d4af37] hover:bg-[#fae7b3] text-[#0d1613] rounded-full transition-all cursor-pointer shadow-md"
                                title={isVideoPlaying ? 'Jeda Video' : 'Putar Video'}
                              >
                                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                              </button>

                              <button
                                onClick={toggleVideoMute}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all cursor-pointer backdrop-blur-sm"
                                title={isVideoMuted ? 'Nyalakan Audio' : 'Bisukan Audio'}
                              >
                                {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </button>

                              <div className="text-xs font-semibold ml-2 text-[#fae7b3]">
                                Tur Video Kawasan: {detailModalLocation.name}
                              </div>
                            </div>

                            <span className="text-[10px] font-mono px-2 py-1 bg-black/60 border border-white/20 text-emerald-300">
                              HD 1080p
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>

                {/* Information & Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Description & Highlights (2 Cols) */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#967d58] font-bold">
                        Daya Tarik & Deskripsi Lengkap
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-[#182a24] mt-0.5">
                        {details.tagline}
                      </h4>
                    </div>

                    {detailModalLocation.showDescription !== false && (
                      <p className="text-xs sm:text-sm text-[#52645c] leading-relaxed">
                        {detailModalLocation.description
                          ? detailModalLocation.description
                          : 'Lokasi ini merupakan bagian terintegrasi dari masterplan kawasan Chevilly Resort and Camp seluas 14 hektar di Puncak Lembah Pinus, Bogor, menghadirkan pengalaman liburan berkelas bagi keluarga maupun rombongan corporate.'}
                      </p>
                    )}

                    {/* Highlights Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {detailModalLocation.showHours !== false && (
                        <div className="p-3 bg-white border border-[#ded7cb] flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-[#967d58] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[11px] font-bold text-[#182a24]">Jam Operasional / Waktu</div>
                            <div className="text-[11px] text-[#52645c] mt-0.5">{details.hours}</div>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-white border border-[#ded7cb] flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#967d58] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[11px] font-bold text-[#182a24]">Titik Peta Kawasan</div>
                          <div className="text-[11px] text-[#52645c] mt-0.5">Nomor {detailModalLocation.number} (14 Hektar)</div>
                        </div>
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <div className="bg-white p-4 border border-[#ded7cb] space-y-2.5">
                      <div className="text-xs font-bold text-[#182a24] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Fasilitas & Keunggulan Titik Ini</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#354840]">
                        {details.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-[11px]">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Direct Contact & Action Card (1 Col) */}
                  <div className="space-y-4">
                    <div className="bg-[#182a24] text-white p-5 border border-[#d4af37]/50 shadow-md space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#eed492] uppercase tracking-wider block">
                          Informasi & Pemesanan
                        </span>
                        <h5 className="font-serif font-bold text-base text-white">
                          BDE : DEFIT
                        </h5>
                        <p className="text-[11px] text-[#cad5cf]">
                          Concierge resmi Chevilly siap membantu reservasi, survey lokasi, dan paket rombongan.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#d4af37]/30 space-y-2">
                        <div className="text-[11px] text-[#eed492]">
                          Nomor WhatsApp Resmi:
                        </div>
                        <div className="font-mono text-sm font-bold text-white tracking-wider">
                          +62 859-3454-4901
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/6285934544901?text=${encodeURIComponent(`Halo BDE Defit, saya tertarik dengan informasi Titik No. ${detailModalLocation.number} (${detailModalLocation.name}) di Chevilly Resort. Mohon info ketersediaan & paketnya.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all text-center"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Chat WhatsApp Sekarang</span>
                      </a>

                      {detailModalLocation.showPrice !== false && (
                        <div className="text-[10px] text-[#cad5cf] text-center">
                          {details.priceNote}
                        </div>
                      )}
                    </div>

                    {/* Quick navigation hint */}
                    <div className="p-3 bg-white border border-[#ded7cb] text-center text-xs text-[#73837b]">
                      Gunakan tombol panah di bawah untuk menjelajah 64 titik lokasi lainnya.
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="bg-[#f0ece1] px-5 py-3 border-t border-[#ded7cb] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevLocation}
                    className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-[#ded7cb] text-[#182a24] font-medium flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Titik Sebelumnya</span>
                  </button>

                  <button
                    onClick={handleNextLocation}
                    className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-[#ded7cb] text-[#182a24] font-medium flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Titik Selanjutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setDetailModalLocation(null)}
                  className="px-4 py-1.5 bg-[#182a24] hover:bg-[#284138] text-[#f7f5ef] font-semibold uppercase tracking-wider text-xs cursor-pointer transition-all"
                >
                  Tutup & Kembali ke Peta
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 5. FULLSCREEN HIGH DEFINITION LIGHTBOX MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-2 sm:p-6 animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#101b17] border-b border-[#d4af37]/40 text-white">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-[#d4af37]" />
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Peta Kawasan Lengkap Chevilly Resort & Camp (14 Hektar)
                </h3>
                <span className="text-[11px] text-[#eed492] font-mono">
                  Mode Layar Penuh HD · Gunakan kontrol perbesar atau scroll untuk memperjelas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomIn}
                className="p-2 bg-[#182a24] hover:bg-[#284138] border border-[#d4af37]/40 text-[#fae7b3] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Perbesar (+)"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="hidden sm:inline">Perbesar</span>
              </button>

              <button
                onClick={handleZoomOut}
                className="p-2 bg-[#182a24] hover:bg-[#284138] border border-[#d4af37]/40 text-[#fae7b3] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Perkecil (-)"
              >
                <ZoomOut className="w-4 h-4" />
                <span className="hidden sm:inline">Perkecil</span>
              </button>

              <button
                onClick={handleResetZoom}
                className="px-2.5 py-1.5 bg-[#182a24] border border-[#d4af37]/40 text-[#eed492] text-xs font-mono cursor-pointer"
                title="Reset Ukuran"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 transition-colors cursor-pointer ml-2"
                title="Tutup Layar Penuh (Esc)"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fullscreen Pan/Scroll Image Viewport */}
          <div className="flex-1 overflow-auto bg-stone-950/90 flex items-center justify-center p-4">
            <div
              className="transition-transform duration-200 ease-out inline-block origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={MAP_IMAGE_SRC}
                alt="Peta Kawasan Chevilly Resort Fullscreen"
                className="max-w-none w-auto max-h-[85vh] sm:max-h-[90vh] object-contain select-none contrast-[1.08] saturate-[1.08] filter drop-shadow-[0_15px_50px_rgba(0,0,0,0.8)]"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-[#101b17] border-t border-[#d4af37]/30 px-4 py-2 text-center text-xs text-[#a8b8b0] flex items-center justify-between">
            <span className="text-[11px] font-mono">Brosur Peta Resmi Chevilly Resort & Camp</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-[#eed492] hover:text-white font-medium underline text-xs cursor-pointer"
            >
              Kembali ke Halaman Web
            </button>
          </div>
        </div>
      )}

      {/* 6. FULLSCREEN PANORAMIC AREA MAP MODAL (ZOOM & HOVER KIRI-KANAN) */}
      {isAreaMapFullscreen && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex flex-col p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#101b17] border-b border-[#d4af37]/40 text-white">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#d4af37]" />
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Peta Ilustrasi Kawasan Chevilly (Titik 1 – 64)
                </h3>
                <span className="text-[11px] text-[#eed492] font-mono">
                  Arahkan kursor kiri–kanan untuk menelusuri kawasan · Klik peta atau tombol +/- untuk zoom
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAreaPanStep(-22)}
                className="p-2 bg-[#182a24] hover:bg-[#284138] border border-[#d4af37]/40 text-[#fae7b3] cursor-pointer"
                title="Geser Kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleAreaPanStep(22)}
                className="p-2 bg-[#182a24] hover:bg-[#284138] border border-[#d4af37]/40 text-[#fae7b3] cursor-pointer"
                title="Geser Kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleAreaZoomOut}
                className="p-2 bg-[#182a24] hover:bg-[#284138] border border-[#d4af37]/40 text-[#fae7b3] cursor-pointer"
                title="Perkecil (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleAreaZoomReset}
                className="px-2.5 py-2 bg-[#182a24] border border-[#d4af37]/40 text-[#eed492] text-xs font-mono cursor-pointer"
                title="Reset Zoom"
              >
                {Math.round(effectiveAreaScale * 100)}%
              </button>
              <button
                type="button"
                onClick={handleAreaZoomIn}
                className="p-2 bg-[#182a24] hover:bg-[#284138] border border-[#d4af37]/40 text-[#fae7b3] cursor-pointer"
                title="Perbesar (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAreaMapFullscreen(false)}
                className="p-2 bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 transition-colors cursor-pointer ml-1.5"
                title="Tutup Layar Penuh"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            onMouseEnter={() => setIsAreaMapHovering(true)}
            onMouseLeave={() => {
              setIsAreaMapHovering(false);
              if (areaMapZoom === 1) setAreaMapOrigin({ x: 50, y: 50 });
            }}
            onMouseMove={handleAreaMapMouseMove}
            onTouchMove={handleAreaMapTouchMove}
            onClick={handleAreaMapClickCycleZoom}
            className="flex-1 bg-white overflow-hidden flex items-center justify-center relative select-none cursor-zoom-in"
          >
            <div
              className={`w-full h-full flex items-center justify-center will-change-transform ${
                isAreaMapHovering ? 'transition-transform duration-150 ease-out' : 'transition-transform duration-300 ease-out'
              }`}
              style={{
                transformOrigin: `${areaMapOrigin.x}% ${areaMapOrigin.y}%`,
                transform: `scale(${effectiveAreaScale})`,
              }}
            >
              <img
                src={PANORAMIC_MAP_SRC}
                alt="Peta Ilustrasi Kawasan Chevilly Layar Penuh"
                draggable={false}
                className="w-full h-full max-h-[82vh] object-contain p-4"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
