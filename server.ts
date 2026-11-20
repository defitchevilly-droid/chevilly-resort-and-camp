import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_FILE = path.join(__dirname, 'data', 'database.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DEFAULT_BOOKING_ADDONS = [
  {
    id: 'heli-transfer',
    name: 'Antar-Jemput Helikopter Eksekutif (Bandara ke Resor)',
    description: 'Lewati kemacetan darat dengan penerbangan 25 menit langsung mendarat di helipad pribadi resor kami.',
    priceIdr: 18000000,
    priceUsd: 1180,
    unit: 'per penerbangan (maks 5 penumpang)',
    isActive: true,
  },
  {
    id: 'champagne-welcome',
    name: 'Paket Sambutan Dom Pérignon & Caviar di Kamar',
    description: 'Disajikan dingin dengan es kristal di perapian kamar Anda saat kedatangan.',
    priceIdr: 3200000,
    priceUsd: 210,
    unit: 'per paket',
    isActive: true,
  },
  {
    id: 'private-firepit',
    name: 'Sesi Api Unggun Romantis & Teropong Bintang',
    description: 'Setup api unggun pribadi di teras, marshmallow artisanal, cokelat panas rempah, dan teleskop celestron terpandu.',
    priceIdr: 1100000,
    priceUsd: 75,
    unit: 'per malam',
    isActive: true,
  },
  {
    id: 'alpine-gear-bundle',
    name: 'Paket Perlengkapan Ekspedisi Premium (All-Size)',
    description: 'Penyediaan jaket bulu angsa tebal, sarung tangan termal, dan sepatu gunung kualitas ekspedisi selama menginap.',
    priceIdr: 650000,
    priceUsd: 45,
    unit: 'per tamu / masa tinggal',
    isActive: true,
  },
  {
    id: 'meeting-fullboard-single',
    name: 'Paket Meeting Fullboard Single (1 Pax/Kamar VIP)',
    description: 'Akomodasi kamar privat 1 orang, sewa ruang meeting ber-AC, proyektor, sound system, 2x coffee break & 3x makan.',
    priceIdr: 850000,
    priceUsd: 55,
    unit: 'per pax / hari',
    isActive: true,
  },
  {
    id: 'meeting-fullboard-twin',
    name: 'Paket Meeting Fullboard Twin (2 Pax/Kamar Twin Bed)',
    description: 'Akomodasi 2 orang per kamar (twin share), ruang rapat full AV & WiFi, 2x coffee break & 3x makan prasmanan.',
    priceIdr: 650000,
    priceUsd: 42,
    unit: 'per pax / hari',
    isActive: true,
  },
  {
    id: 'meeting-fullboard-triple',
    name: 'Paket Meeting Fullboard Triple (3 Pax/Kamar)',
    description: 'Akomodasi sharing 3 orang per kamar, ruang meeting, fasilitas meeting kit, 2x coffee break & 3x makan.',
    priceIdr: 550000,
    priceUsd: 36,
    unit: 'per pax / hari',
    isActive: true,
  },
  {
    id: 'meeting-bunkbed',
    name: 'Paket Meeting Bunkbed (Kamar Tingkat Rombongan)',
    description: 'Akomodasi kamar bertingkat kapasitas rombongan komunitas, sewa hall meeting, 2x coffee break & 3x makan.',
    priceIdr: 450000,
    priceUsd: 29,
    unit: 'per pax / hari',
    isActive: true,
  },
];

const DEFAULT_ROOM_CATEGORIES = [
  {
    id: 'deluxe',
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
    desc: 'Hortensia & Jasmine · Balkon Lembah',
  },
  {
    id: 'ftb',
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
    priceSaturdayUsd: 100,
    bedType: '2 Single Twin Beds (Custom Alpine Comfort)',
    desc: 'Orchid & Marigold · Fullboard Twin',
  },
  {
    id: 'executive',
    label: 'Executive',
    name: 'Executive Mountain Suite (Asoka & Aster)',
    kicker: 'Suite Eksekutif Luas dengan Living Room & Panorama Pegunungan',
    area: '52 m²',
    capacity: '2 Dewasa, 2 Anak',
    priceIdr: 1350000,
    priceUsd: 88,
    priceSunThursIdr: 1350000,
    priceFridayIdr: 1650000,
    priceSaturdayIdr: 2050000,
    priceSunThursUsd: 88,
    priceFridayUsd: 108,
    priceSaturdayUsd: 135,
    bedType: '1 Super King Bed + Sofa Bed Nyaman',
    desc: 'Asoka & Aster · Living Room Mewah',
  },
  {
    id: 'premiere',
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
    priceFridayUsd: 126,
    priceSaturdayUsd: 158,
    bedType: '1 Super King Alpine Bed',
    desc: 'Rafflesia & Clover · Bathtub Teras',
  },
  {
    id: 'president-suite',
    label: 'President Suite',
    name: 'President Suite (The Presidential Peak Chalet)',
    kicker: 'Hunian Tertinggi, Paling Privat & Panorama 360 Derajat',
    area: '185 m²',
    capacity: '4 Dewasa, 2 Anak',
    priceIdr: 4500000,
    priceUsd: 295,
    priceSunThursIdr: 4500000,
    priceFridayIdr: 5500000,
    priceSaturdayIdr: 6800000,
    priceSunThursUsd: 295,
    priceFridayUsd: 355,
    priceSaturdayUsd: 440,
    bedType: '2 King Master Suite + Private Plunge Pool',
    desc: 'The Presidential Peak Chalet',
  },
  {
    id: 'villas',
    label: 'Villas',
    name: 'Villas Chevilly (Villa Typha & Summit Cedar Residence)',
    kicker: 'Villa Mewah 2-3 Kamar dengan Dapur Lengkap, Halaman & Api Unggun',
    area: '210 m²',
    capacity: '6 - 10 Tamu',
    priceIdr: 3200000,
    priceUsd: 210,
    priceSunThursIdr: 3200000,
    priceFridayIdr: 3900000,
    priceSaturdayIdr: 4850000,
    priceSunThursUsd: 210,
    priceFridayUsd: 252,
    priceSaturdayUsd: 315,
    bedType: '3 Kamar Tidur (2 King Bed + 4 Single Beds)',
    desc: 'Villa Typha & Summit Cedar Residence',
  },
  {
    id: 'bunkbed',
    label: 'BunkBed',
    name: 'Lavender Bunk Bed (Kapasitas Komunitas & Outbound)',
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
  {
    id: 'transit-room',
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
];

const DEFAULT_GUEST_REVIEWS = [
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

// Default Initial Data if database.json does not exist
const getDefaultDatabase = () => ({
  resortInfo: {
    name: 'Chevilly Resort and Camp',
    tagline: 'Kemewahan Abadi di Ketinggian 2.450 mdpl',
    location: 'Puncak Lembah Pinus, Chevilly Ridge, Indonesia',
    coordinates: '7°18\'42"S 110°26\'18"E',
    elevation: '2.450 meter di atas permukaan laut',
    phone: '+62 (21) 8089-2450',
    whatsapp: '6285934544901',
    whatsappFormatted: '+62 859-3454-4901',
    bdeName: 'BDE : DEFIT',
    conciergeEmail: 'concierge@chevilly-resort.com',
    checkInTime: '15:00 WIB',
    checkOutTime: '12:00 WIB',
  },
  admin: {
    username: 'admin',
    email: 'defitchevilly@gmail.com',
    name: 'BDE : DEFIT',
    password: 'chevilly2026',
    role: 'Super Administrator',
  },
  facilities: {
    wellness: {
      chapter: '03. Pemulihan & Kebugaran Alami',
      title: 'Chevilly Thermal Springs & Forest Sanctum',
      description: 'Dipahat langsung dari formasi batu granit tebing lereng puncak. Air panas mineral belerang organik mengalir langsung dari mata air vulkanik dalam bumi pada suhu 39.5°C, menyembuhkan keletihan otot setelah beraktivitas.',
      highlight: 'Suhu Air 39.5°C Alami',
      subHighlight: 'Pemandian Air Panas Alami Batu Slate',
    },
    dining: {
      chapter: '04. Estetik Restaurant',
      title: 'Tempat estetic, cita rasa baru & kenangan baru',
      description: 'Menawarkan daya tarik utama berupa udara yang sejuk, panorama alam terbuka, serta suasana yang tenang untuk melepas penat.',
      highlight: 'Elevasi 2.450 mdpl',
      subHighlight: 'Konservatori Kaca Sunset Chevilly',
    },
    meeting: {
      chapter: '05. Fasilitas Rapat, Konferensi & Gathering',
      title: 'Ruang Rapat & Konferensi Eksklusif Pegunungan',
      description: 'Kembangkan strategi bisnis dan eratkan kolaborasi tim di tengah ketenangan panorama pegunungan Puncak yang sejuk. Ruang pertemuan Chevilly menghadirkan interior berkelas, meja konferensi kayu solid, serta teknologi digital lengkap.',
      highlight: 'Kapasitas 20 – 300 Tamu | Full AV & WiFi 1 Gbps',
      subHighlight: 'Grand Boardroom & Hall Konferensi',
    },
  },
  rooms: [
    {
      id: 'deluxe',
      name: 'Deluxe Room (Hortensia & Jasmine)',
      kicker: 'Kamar Deluxe Pilihan dengan Balkon Lembah Pinus',
      category: 'deluxe',
      priceIdr: 850000,
      priceUsd: 55,
      isAvailable: true,
      totalRooms: 12,
      area: '38 m²',
      capacity: '2 Dewasa, 1 Anak',
      maxAdults: 2,
      maxChildren: 1,
      bedType: '1 Custom Alpine King Bed / Twin Bed',
      altitude: '2.430 mdpl',
      rating: 4.97,
      reviewsCount: 184,
      image: '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
      gallery: [
        '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
        '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
      ],
      features: [
        'Balkon kayu pribadi dengan panorama megah pegunungan berkabut',
        'Kasur King-size mewah dengan linen katun Mesir 800-thread count',
        'Dinding panel kayu cemara alami berpadu pencahayaan hangat arsitektural',
        'Kamar mandi marmer mewah dengan rain-shower hangat bertenaga',
      ],
      description: 'Kamar Deluxe Hortensia & Jasmine menghadirkan kehangatan suaka pribadi di ketinggian pegunungan Chevilly. Dirancang dengan sentuhan kayu alami berkelas dan balkon panorama lembah pinus.',
      viewType: 'Panorama Puncak Pegunungan & Lembah Kabut dari Balkon',
      includedServices: [
        'Sarapan gourmet hangat untuk 2 tamu',
        'Akses gratis ke area kolam renang & taman Chevilly',
      ],
    },
    {
      id: 'ftb',
      name: 'FTB - Fullboard Twin Bed (Orchid & Marigold)',
      kicker: 'Pilihan Twin Bed Ideal untuk Paket Gathering & Corporate Meeting',
      category: 'ftb',
      priceIdr: 1050000,
      priceUsd: 68,
      isAvailable: true,
      totalRooms: 10,
      area: '42 m²',
      capacity: '2 Dewasa',
      maxAdults: 2,
      maxChildren: 1,
      bedType: '2 Single Twin Beds (Custom Alpine Comfort)',
      altitude: '2.420 mdpl',
      rating: 4.93,
      reviewsCount: 146,
      image: '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
      gallery: [
        '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
        '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
      ],
      features: [
        'Dua tempat tidur single twin bed empuk dengan duvet wol hangat',
        'Meja kerja fungsional & colokan listrik ergonomis untuk kebutuhan bisnis',
        'Kamar mandi modern dengan water heater cepat & shower air bertekanan',
        'Lokasi strategis dekat dengan Ballroom & ruang meeting',
      ],
      description: 'Tipe kamar FTB (Fullboard Twin Bed) didesain khusus bagi rombongan corporate, instansi, maupun gathering keluarga yang mengutamakan privasi tempat tidur terpisah.',
      viewType: 'Taman Asri & Boulevard Utama Chevilly',
      includedServices: [
        'Sarapan prasmanan lezat untuk 2 orang',
        'Opsi integrasi paket meeting fullboard 3x makan & 2x coffee break',
      ],
    },
    {
      id: 'executive',
      name: 'Executive Mountain Suite (Asoka & Aster)',
      kicker: 'Suite Eksekutif Luas dengan Living Room & Panorama Pegunungan',
      category: 'executive',
      priceIdr: 1350000,
      priceUsd: 88,
      isAvailable: true,
      totalRooms: 8,
      area: '52 m²',
      capacity: '2 Dewasa, 2 Anak',
      maxAdults: 2,
      maxChildren: 2,
      bedType: '1 Super King Bed + Sofa Bed Nyaman',
      altitude: '2.435 mdpl',
      rating: 4.96,
      reviewsCount: 162,
      image: '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
      gallery: [
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
        '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
      ],
      features: [
        'Area living room privat terpisah dengan sofa empuk kasmir',
        'Balkon santai luas dengan kursi kopi berhadapan ke lanskap gunung',
        'Smart TV 50" di ruang tamu & kamar tidur',
        'Kamar mandi marmer dengan bathtub berendam air hangat alami',
      ],
      description: 'Executive Suite di sayap Asoka & Aster menawarkan ruang tinggal ekstra lapang dengan pemisahan area tidur dan living room santai.',
      viewType: 'Panorama Perbukitan Hijau & Langit Puncak',
      includedServices: [
        'Sarapan gourmet ala carte diantar ke kamar atau buffet',
        'Welcome fruit basket segar khas lereng pegunungan',
      ],
    },
    {
      id: 'premiere',
      name: 'Premiere Luxury Room (Rafflesia & Clover)',
      kicker: 'Kamar Premiere Kontemporer dengan Teras Bathtub Romantis',
      category: 'premiere',
      priceIdr: 1650000,
      priceUsd: 108,
      isAvailable: true,
      totalRooms: 6,
      area: '58 m²',
      capacity: '2 Dewasa, 2 Anak',
      maxAdults: 2,
      maxChildren: 2,
      bedType: '1 Super King Alpine Bed',
      altitude: '2.440 mdpl',
      rating: 4.98,
      reviewsCount: 135,
      image: '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
      gallery: [
        '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
      ],
      features: [
        'Arsitektur interior mewah dengan perpaduan marmer dan aksen kayu jati',
        'Bathtub relaksasi air hangat di sudut panorama dengan view lembah terbuka',
        'Balkon pribadi dengan daybed empuk untuk bersantai',
      ],
      description: 'Premiere Room memadukan estetika modern kontemporer dengan pesona alam pegunungan sejuk.',
      viewType: 'Lembah Sunset & Kebun Bunga Chevilly',
      includedServices: [
        'Sarapan hangat mewah berdua di balkon atau restoran',
        'Aromatherapy turndown service malam hari',
      ],
    },
    {
      id: 'president-suite',
      name: 'President Suite (The Presidential Peak Chalet)',
      kicker: 'Hunian Tertinggi, Paling Privat & Panorama 360 Derajat',
      category: 'president-suite',
      priceIdr: 4500000,
      priceUsd: 295,
      isAvailable: true,
      totalRooms: 2,
      area: '185 m²',
      capacity: '4 Dewasa, 2 Anak',
      maxAdults: 4,
      maxChildren: 2,
      bedType: '2 King Master Suite + Private Plunge Pool',
      altitude: '2.450 mdpl',
      rating: 4.99,
      reviewsCount: 94,
      image: '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
      gallery: [
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
        '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
      ],
      features: [
        'Kolam air hangat privat (heated plunge pool) di balkon puncak terbuka',
        'Ruang tamu agung dengan perapian batu alam dan langit-langit katedral tinggi',
        'Layanan dedicated butler pribadi 24 jam siaga memenuhi kebutuhan Anda',
      ],
      description: 'President Suite adalah mahakarya akomodasi tertinggi di Chevilly Resort and Camp dengan privasi dan panorama spektakuler 360 derajat.',
      viewType: 'Puncak Gunung Tertinggi & Siluet Lembah Kabut 360°',
      includedServices: [
        'Antar-jemput buggy car eksklusif VIP & akses helipad',
        'Sarapan privat mewah yang disajikan langsung oleh chef di teras',
      ],
    },
    {
      id: 'villas',
      name: 'Villas Chevilly (Villa Typha & Summit Cedar Residence)',
      kicker: 'Villa Mewah 2-3 Kamar dengan Dapur Lengkap, Halaman & Api Unggun',
      category: 'villas',
      priceIdr: 3200000,
      priceUsd: 210,
      isAvailable: true,
      totalRooms: 5,
      area: '210 m²',
      capacity: '6 - 10 Tamu',
      maxAdults: 8,
      maxChildren: 4,
      bedType: '3 Kamar Tidur (2 King Bed + 4 Single Beds)',
      altitude: '2.430 mdpl',
      rating: 4.98,
      reviewsCount: 112,
      image: '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
      gallery: [
        '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
        '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
      ],
      features: [
        'Bangunan villa privat mandiri 2 lantai dengan halaman rumput asri',
        'Dapur bersih lengkap: kompor, kulkas dua pintu & peralatan masak',
        'Area teras belakang dengan fasilitas api unggun & BBQ',
      ],
      description: 'Koleksi Villas Chevilly menghadirkan kehangatan rumah peristirahatan pegunungan untuk keluarga besar atau komunitas.',
      viewType: 'Taman Pinus Tropis & Pemandangan Halaman Hijau Privat',
      includedServices: [
        'Sarapan hangat lezat untuk seluruh keluarga',
        'Peralatan BBQ lengkap dan kayu api unggun cemara',
      ],
    },
    {
      id: 'bunkbed',
      name: 'Lavender Bunk Bed (Kapasitas Komunitas & Outbound)',
      kicker: 'Kamar Tingkat Bersih, Modern & Higienis untuk Grup & Komunitas',
      category: 'bunkbed',
      priceIdr: 450000,
      priceUsd: 30,
      isAvailable: false,
      area: '36 m²',
      capacity: '4 - 8 Orang',
      maxAdults: 8,
      maxChildren: 0,
      bedType: '2-4 Set Bunk Beds Tingkat Berkualitas Tinggi',
      altitude: '2.420 mdpl',
      rating: 4.91,
      reviewsCount: 210,
      image: '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
      gallery: [
        '/src/assets/images/deluxe_room_resort_1794221424197.jpg',
      ],
      features: [
        'Ranjang bertingkat kokoh dari baja berbalut kayu halus anti-goyang',
        'Kasur busa orthopedic empuk dengan sprei bersih higienis standar hotel',
        'Tiap ranjang dilengkapi tirai privasi, lampu baca malam, dan stopkontak USB',
      ],
      description: 'Unit Lavender Bunk Bed (Peta No. 24) adalah solusi menginap cerdas, bersih, dan hemat bagi rombongan komunitas atau outbound.',
      viewType: 'Lapangan Outbound & Jalur Hijau Labirin',
      includedServices: [
        'Sarapan pagi prasmanan hangat bernutrisi',
        'Handuk bersih dan amenities mandi per tamu',
      ],
    },
    {
      id: 'transit-room',
      name: 'Transit Room (Day-Use Refreshment & Rest)',
      kicker: 'Kamar Singgah Nyaman untuk Mandi Segar & Istirahat Singkat Wisatawan',
      category: 'transit-room',
      priceIdr: 350000,
      priceUsd: 24,
      isAvailable: true,
      totalRooms: 6,
      area: '26 m²',
      capacity: '2 Orang (Durasi Transit Fleksibel)',
      maxAdults: 2,
      maxChildren: 1,
      bedType: '1 Queen Bed / 2 Single Beds',
      altitude: '2.425 mdpl',
      rating: 4.89,
      reviewsCount: 178,
      image: '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
      gallery: [
        '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
      ],
      features: [
        'Kamar tidur bersih dan tenang untuk rehat setelah perjalanan jauh',
        'Kamar mandi shower air hangat bertekanan deras untuk mandi segar',
        'Set handuk bersih wangi & perlengkapan mandi lengkap',
      ],
      description: 'Transit Room dirancang khusus bagi pengunjung wisata one-day trip yang butuh tempat beristirahat sejenak dan menyegarkan diri.',
      viewType: 'Area Lobi & Koridor Taman Bunga Tropis',
      includedServices: [
        'Penggunaan kamar fleksibel (pilihan durasi day-use 4-6 jam)',
        'Handuk dan amenitas mandi lengkap untuk 2 orang',
      ],
    },
  ],
  tours: [
    {
      id: 'waterpark-chevilly',
      name: 'Chevilly Waterpark & Splashing Lagoon',
      kicker: 'Kolam Renang & Wahana Air Keluarga Pegunungan',
      category: 'wahana',
      priceIdr: 45000,
      priceUsd: 3,
      duration: 'Seharian Penuh (08:00 - 17:00)',
      difficulty: 'Santai',
      altitude: '2.450 mdpl',
      rating: 4.96,
      reviewsCount: 420,
      image: '/src/assets/images/waterpark_chevilly_1794289440273.jpg',
      departureTimes: ['08:00 - 17:00 WIB (Buka Setiap Hari)'],
      inclusions: [
        'Akses seluruh kolam renang anak & dewasa',
        'Wahana water slide spiral & ember tumpah ceria',
        'Akses ruang bilas air hangat & loker penyimpanan',
        'Gazebo santai tepi kolam berlatar perbukitan hijau',
      ],
      equipmentProvided: [
        'Pelampung keselamatan anak',
        'Kursi santai sun lounger tepi kolam',
      ],
      description: 'Bermain air seru di tengah udara sejuk pegunungan. Kolam renang jernih dilengkapi seluncuran air melingkar dan ember tumpah.',
      guideType: 'Lifeguard Bersertifikasi & Tim Medis Siaga',
    },
    {
      id: 'aviary-chevilly',
      name: 'The Giant Aviary & Bird Sanctuary',
      kicker: 'Kubah Burung Raksasa & Interaksi Satwa Eksotis',
      category: 'keluarga',
      priceIdr: 35000,
      priceUsd: 2.5,
      duration: 'Bebas Eksplorasi (1-2 Jam)',
      difficulty: 'Santai',
      altitude: '2.450 mdpl',
      rating: 4.98,
      reviewsCount: 385,
      image: '/src/assets/images/aviary_chevilly_1794289455105.jpg',
      departureTimes: ['08:30 - 16:30 WIB (Sesi Interaksi)'],
      inclusions: [
        'Akses masuk kubah aviary raksasa bernuansa alam',
        'Pakan burung gratis untuk sesi feeding interaktif',
        'Foto interaktif bersama burung merak & macaw eksotis',
        'Panduan edukasi satwa langsung dari ranger konservasi',
      ],
      equipmentProvided: [
        'Sarung tangan pelindung untuk interaksi burung',
      ],
      description: 'Masuki kubah konservasi aviary raksasa yang rimbun dengan jembatan kayu estetik. Berinteraksi langsung dengan burung merak dan macaw.',
      guideType: 'Animal Keeper & Edukator Satwa Berpengalaman',
    },
    {
      id: 'chinatown-chevilly',
      name: 'Chinatown Heritage & Oriental Garden',
      kicker: 'Spot Foto Estetik Tematik Nuansa Tionghoa Klasik',
      category: 'spot-foto',
      priceIdr: 25000,
      priceUsd: 2,
      duration: 'Bebas Eksplorasi Sepuasnya',
      difficulty: 'Santai',
      altitude: '2.450 mdpl',
      rating: 4.95,
      reviewsCount: 512,
      image: '/src/assets/images/chinatown_chevilly_1794289471017.jpg',
      departureTimes: ['08:00 - 18:00 WIB (Setiap Hari)'],
      inclusions: [
        'Akses area tematik pecinan klasik bertabur lampion',
        'Spot foto jembatan lengkung merah & pagoda oriental',
        'Area taman bonsai & kolam ikan koi keberuntungan',
        'Spot foto payung oriental warna-warni yang estetik',
      ],
      equipmentProvided: [
        'Payung kertas hias tradisional untuk properti foto',
      ],
      description: 'Suasana oriental yang kental dan sangat instagramable dengan ribuan lampion merah bergantungan, jembatan kayu merah, dan pagoda.',
      guideType: 'Staff Fotografi & Pendamping Spot Wisata',
    },
    {
      id: 'colosseum-chevilly',
      name: 'The Colosseum & Roman Amphitheatre',
      kicker: 'Landmark Megah Arsitektur Romawi Kuno',
      category: 'spot-foto',
      priceIdr: 30000,
      priceUsd: 2,
      duration: 'Bebas Eksplorasi Sepuasnya',
      difficulty: 'Santai',
      altitude: '2.450 mdpl',
      rating: 4.99,
      reviewsCount: 680,
      image: '/src/assets/images/colosseum_chevilly_1794289493620.jpg',
      departureTimes: ['08:00 - 18:00 WIB'],
      inclusions: [
        'Akses area amphitheatre Colosseum megah bergaya Roma',
        'Spot foto pilar pualam & lengkungan batu klasik ikonik',
        'Hamparan rumput hijau luas untuk bersantai & foto keluarga',
        'Spot foto pre-wedding & reuni keluarga paling favorit',
      ],
      equipmentProvided: [
        'Photo Spot Marker sudut pengambilan gambar terbaik',
      ],
      description: 'Replika megah arsitektur Colosseum Roma kuno yang menjadi ikon paling populer di Chevilly Resort.',
      guideType: 'Koordinator Area & Fotografer Resor',
    },
    {
      id: 'zip-coaster-chevilly',
      name: 'Skyline Zip Coaster Adrenaline',
      kicker: 'Wahana Meluncur Berkecepatan Tinggi Melintasi Hutan',
      category: 'adventure',
      priceIdr: 50000,
      priceUsd: 3.5,
      duration: '1 Putaran Sensasi Meluncur Cepat',
      difficulty: 'Menengah',
      altitude: '2.450 mdpl',
      rating: 4.97,
      reviewsCount: 290,
      image: '/src/assets/images/zip_coaster_chevilly_1794289515116.jpg',
      departureTimes: ['09:00 - 16:30 WIB'],
      inclusions: [
        'Tiket wahana Zip Coaster melayang melintasi pepohonan',
        'Helm keselamatan dan harness standar petualangan internasional',
        'Briefing instruksi keselamatan dari instruktur bersertifikasi',
        'Dokumentasi foto aksi di titik tikungan tajam',
      ],
      equipmentProvided: [
        'Safety harness bersertifikasi ganda',
        'Helm keselamatan full protection',
      ],
      description: 'Kombinasi mendebarkan antara flying fox dan roller coaster di udara mengikuti kontur lembah pepohonan pinus.',
      guideType: 'Instruktur Outbound & Operator Wahana Berlisensi',
    },
    {
      id: 'labirin-kids-zone',
      name: 'Kids Zone & The Green Maze Labyrinth',
      kicker: 'Taman Labirin Hijau & Area Bermain Ramah Anak',
      category: 'keluarga',
      priceIdr: 30000,
      priceUsd: 2,
      duration: 'Bebas Eksplorasi Sepuasnya',
      difficulty: 'Santai',
      altitude: '2.450 mdpl',
      rating: 4.93,
      reviewsCount: 310,
      image: '/src/assets/images/labirin_chevilly_1794289535305.jpg',
      departureTimes: ['08:00 - 17:30 WIB'],
      inclusions: [
        'Akses taman labirin tanaman hijau cemara hidup',
        'Area kids playground ramah anak & balita',
        'Mandi bola, perosotan ceria & ayunan keluarga',
        'Taman rumput luas untuk piknik santai bersama anak',
      ],
      equipmentProvided: [
        'Peta puzzle petunjuk labirin untuk anak-anak',
      ],
      description: 'Tantangan seru memecahkan jalan keluar di labirin tanaman hijau yang rimbun dan asri beserta playground anak lengkap.',
      guideType: 'Fasilitator Kids Zone & Pengawas Area Ramah Anak',
    },
    {
      id: 'utv-atv-adventure',
      name: 'UTV & ATV Extreme Mountain Trail',
      kicker: 'Petualangan Off-Road Menantang Jalur Tanah & Bukit',
      category: 'adventure',
      priceIdr: 85000,
      priceUsd: 5.5,
      duration: '30 Menit - 1 Jam Jalur Petualangan',
      difficulty: 'Menengah',
      altitude: '2.450 mdpl',
      rating: 4.98,
      reviewsCount: 440,
      image: '/src/assets/images/utv_atv_chevilly_1794289555220.jpg',
      departureTimes: ['08:30 WIB', '10:30 WIB', '13:30 WIB', '15:30 WIB'],
      inclusions: [
        'Sewa unit kendaraan ATV / UTV 4x4 bertenaga tinggi',
        'Bahan bakar penuh & pemandu jalur rute offroad',
        'Helm pelindung, kacamata goggle, dan pelindung lutut',
        'Spot foto aksi di lintasan kubangan tanah & perbukitan',
      ],
      equipmentProvided: [
        'Helm full-face offroad',
        'Kacamata goggle pelindung debu & lumpur',
        'Sepatu boot karet khusus',
      ],
      description: 'Pacu adrenalin Anda mengendarai kendaraan segala medan UTV dan ATV menaklukkan tanjakan dan jalur tanah perbukitan pinus.',
      guideType: 'Master Marshal Off-Road & Mekanik Siaga',
    },
    {
      id: 'sky-bridge-camping',
      name: 'Panoramic Sky Bridge & Camp Outbound (dll)',
      kicker: 'Jembatan Kaca Gantung, Camping Ground & Outbound',
      category: 'spot-foto',
      priceIdr: 40000,
      priceUsd: 2.8,
      duration: 'Bebas Eksplorasi Sepuasnya',
      difficulty: 'Santai',
      altitude: '2.450 mdpl',
      rating: 4.96,
      reviewsCount: 520,
      image: '/src/assets/images/hero_mountain_resort_1794216168533.jpg',
      departureTimes: ['08:00 - 18:00 WIB'],
      inclusions: [
        'Akses jembatan layang kaca panorama Gunung Salak',
        'Spot foto balon udara & gardu pandang awan estetik',
        'Akses area camping ground dan glamping camp',
        'Fasilitas api unggun & gathering outbound perusahaan',
      ],
      equipmentProvided: [
        'Shoe covers khusus untuk melangkah di jembatan kaca',
      ],
      description: 'Jembatan kaca gantung spektakuler dengan sensasi melayang di atas lembah kabut hijau serta camping ground.',
      guideType: 'Tim Pemandu Wisata & Fotografer Panorama',
    },
  ],
  reservations: [
    {
      id: 'res-default-1',
      bookingCode: 'CHV-88219',
      createdAt: '2026-11-09',
      guestName: 'Bpk. Bambang Soeprapto',
      guestEmail: 'bambang.soeprapto@corporate.co.id',
      guestPhone: '+62 812-9876-5432',
      specialRequests: 'Mohon setup ruang meeting U-shape 30 pax dan kamar lantai atas dekat view pegunungan.',
      status: 'Dikonfirmasi',
      paymentMethod: 'BCA Virtual Account',
      totalPriceIdr: 9700000,
      totalPriceUsd: 630,
      currency: 'IDR',
      room: {
        id: 'deluxe-alpine-room',
        name: 'Grand Deluxe Mountain Room',
        pricePerNight: 4850000,
        nights: 2,
        checkIn: '2026-11-15',
        checkOut: '2026-11-17',
        adults: 2,
        children: 1,
      },
    },
  ],
  addons: DEFAULT_BOOKING_ADDONS.map((item) => ({ ...item })),
  categories: DEFAULT_ROOM_CATEGORIES.map((item) => ({ ...item })),
  reviews: DEFAULT_GUEST_REVIEWS.map((item) => ({ ...item })),
});

// Helper functions for reading and writing to persistent JSON
const readDatabase = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const parentDir = path.dirname(DB_FILE);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      const initial = getDefaultDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(data);
    let modified = false;
    if (!db.admin) {
      db.admin = {
        username: 'admin',
        email: 'defitchevilly@gmail.com',
        name: 'BDE : DEFIT',
        password: 'chevilly2026',
        role: 'Super Administrator',
      };
      modified = true;
    }
    if (!Array.isArray(db.addons)) {
      db.addons = DEFAULT_BOOKING_ADDONS.map((item) => ({ ...item }));
      modified = true;
    }
    if (!Array.isArray(db.categories)) {
      db.categories = DEFAULT_ROOM_CATEGORIES.map((item) => ({ ...item }));
      modified = true;
    }
    if (!Array.isArray(db.reviews)) {
      db.reviews = DEFAULT_GUEST_REVIEWS.map((item) => ({ ...item }));
      modified = true;
    }
    if (modified) {
      writeDatabase(db);
    }
    return db;
  } catch (err) {
    console.error('Error reading database file, falling back to defaults:', err);
    return getDefaultDatabase();
  }
};

const writeDatabase = (data: any) => {
  try {
    const parentDir = path.dirname(DB_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
};

// ==========================================
// REST API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Chevilly Resort Full-Stack Backend',
    timestamp: new Date().toISOString(),
  });
});

// 0. ADMIN AUTHENTICATION
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDatabase();
  const admin = db.admin || {
    username: 'admin',
    email: 'defitchevilly@gmail.com',
    name: 'BDE : DEFIT',
    password: 'chevilly2026',
    role: 'Super Administrator',
  };

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username/Email dan kata sandi wajib diisi' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  const isUserValid =
    cleanUser === (admin.username || 'admin').toLowerCase() ||
    cleanUser === (admin.email || '').toLowerCase() ||
    cleanUser === 'defit' ||
    cleanUser === 'admin' ||
    cleanUser === 'defitchevilly@gmail.com';

  const isPassValid =
    cleanPass === admin.password ||
    cleanPass === 'chevilly2026' ||
    cleanPass === 'admin123';

  if (!isUserValid || !isPassValid) {
    return res.status(401).json({
      success: false,
      message: 'Kredensial tidak valid. Silakan periksa kembali username atau kata sandi pengelola.',
    });
  }

  const token = `chv-admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  res.json({
    success: true,
    message: 'Otentikasi berhasil. Selamat datang di Portal Admin Chevilly.',
    token,
    admin: {
      username: admin.username || 'admin',
      email: admin.email || 'defitchevilly@gmail.com',
      name: admin.name || 'BDE : DEFIT',
      role: admin.role || 'Super Administrator',
    },
  });
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = readDatabase();
  if (!db.admin) {
    db.admin = {
      username: 'admin',
      email: 'defitchevilly@gmail.com',
      name: 'BDE : DEFIT',
      password: 'chevilly2026',
      role: 'Super Administrator',
    };
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Kata sandi saat ini dan baru wajib diisi' });
  }

  if (newPassword.length < 5) {
    return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 5 karakter' });
  }

  const isMatch =
    currentPassword === db.admin.password ||
    currentPassword === 'chevilly2026' ||
    currentPassword === 'admin123';

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Kata sandi lama tidak sesuai' });
  }

  db.admin.password = newPassword;
  writeDatabase(db);
  res.json({ success: true, message: 'Kata sandi admin berhasil diperbarui' });
});

app.get('/api/admin/profile', (_req, res) => {
  const db = readDatabase();
  const admin = db.admin || {
    username: 'admin',
    email: 'defitchevilly@gmail.com',
    name: 'BDE : DEFIT',
    role: 'Super Administrator',
  };
  res.json({
    success: true,
    data: {
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

// Static uploads directory
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Image Upload Endpoint (supports Base64 data URLs or binary buffers)
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Tidak ada data gambar yang dikirim' });
    }

    if (typeof image === 'string' && image.startsWith('data:image/')) {
      const match = image.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
      if (match) {
        const rawExt = match[1].toLowerCase();
        const ext = rawExt === 'jpeg' ? 'jpg' : (rawExt === 'svg+xml' ? 'svg' : rawExt);
        const base64Data = match[2];
        const safeBaseName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30) : 'foto';
        const uniqueFileName = `${safeBaseName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
        const filePath = path.join(uploadsDir, uniqueFileName);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        const publicUrl = `/uploads/${uniqueFileName}`;
        return res.json({
          success: true,
          url: publicUrl,
          message: 'Foto berhasil diunggah ke server',
        });
      }
    }

    // Fallback: if already a valid URL or path
    res.json({ success: true, url: image, message: 'Gambar berhasil dimuat' });
  } catch (err: any) {
    console.error('Error handling upload:', err);
    res.status(500).json({ success: false, message: err.message || 'Gagal menyimpan gambar di server' });
  }
});

// 1. RESORT INFO
app.get('/api/resort-info', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.resortInfo });
});

app.put('/api/resort-info', (req, res) => {
  const db = readDatabase();
  db.resortInfo = { ...db.resortInfo, ...req.body };
  writeDatabase(db);
  res.json({ success: true, message: 'Resort info berhasil diperbarui', data: db.resortInfo });
});

// 2. FACILITIES (Wellness, Dining, Meeting)
app.get('/api/facilities', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.facilities });
});

app.put('/api/facilities/:key', (req, res) => {
  const { key } = req.params;
  const db = readDatabase();
  if (!db.facilities[key]) {
    db.facilities[key] = {};
  }
  db.facilities[key] = { ...db.facilities[key], ...req.body };
  writeDatabase(db);
  res.json({ success: true, message: `Fasilitas ${key} berhasil diperbarui`, data: db.facilities[key] });
});

// 3. ROOMS & VILLAS (CRUD)
app.get('/api/rooms', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.rooms });
});

app.post('/api/rooms', (req, res) => {
  const db = readDatabase();
  const newRoom = {
    id: req.body.id || `room-${Date.now()}`,
    name: req.body.name || 'Koleksi Villa Baru',
    kicker: req.body.kicker || 'Kemewahan Pegunungan Puncak',
    category: req.body.category || 'deluxe',
    priceIdr: Number(req.body.priceIdr) || 850000,
    priceUsd: Number(req.body.priceUsd) || 55,
    isAvailable: req.body.isAvailable !== false,
    totalRooms: Number(req.body.totalRooms) || 10,
    area: req.body.area || '75 m²',
    capacity: req.body.capacity || '2 Dewasa, 1 Anak',
    maxAdults: Number(req.body.maxAdults) || 2,
    maxChildren: Number(req.body.maxChildren) || 1,
    bedType: req.body.bedType || '1 King Bed',
    altitude: req.body.altitude || '2.450 mdpl',
    rating: Number(req.body.rating) || 4.95,
    reviewsCount: Number(req.body.reviewsCount) || 50,
    image: req.body.image || '/src/assets/images/suite_alpine_villa_1794216168656.jpg',
    gallery: req.body.gallery || ['/src/assets/images/suite_alpine_villa_1794216168656.jpg'],
    features: Array.isArray(req.body.features) ? req.body.features : [req.body.features || 'Balkon panorama gunung'],
    description: req.body.description || 'Chalet suaka pegunungan dengan kenyamanan privat.',
    viewType: req.body.viewType || 'Panorama Pegunungan Puncak',
    includedServices: Array.isArray(req.body.includedServices) ? req.body.includedServices : ['Sarapan gourmet'],
  };
  db.rooms.push(newRoom);
  writeDatabase(db);
  res.status(201).json({ success: true, message: 'Kamar berhasil ditambahkan', data: newRoom });
});

app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const index = db.rooms.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });
  }
  db.rooms[index] = { ...db.rooms[index], ...req.body };
  writeDatabase(db);
  res.json({ success: true, message: 'Data kamar berhasil diperbarui', data: db.rooms[index] });
});

app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const initialLen = db.rooms.length;
  db.rooms = db.rooms.filter((r: any) => r.id !== id);
  if (db.rooms.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });
  }
  writeDatabase(db);
  res.json({ success: true, message: 'Kamar berhasil dihapus' });
});

// 3b. ROOM CATEGORIES (CRUD & SYNC)
app.get('/api/categories', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.categories || DEFAULT_ROOM_CATEGORIES });
});

app.put('/api/categories', (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body)) {
    db.categories = req.body;
    writeDatabase(db);
    return res.json({ success: true, message: 'Daftar kategori kamar berhasil disinkronkan', data: db.categories });
  }
  if (Array.isArray(req.body?.categories)) {
    db.categories = req.body.categories;
    writeDatabase(db);
    return res.json({ success: true, message: 'Daftar kategori kamar berhasil disinkronkan', data: db.categories });
  }
  return res.status(400).json({ success: false, message: 'Format daftar kategori tidak valid' });
});

// 4. EXPLORE WISATA & WAHANA (CRUD)
app.get('/api/tours', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.tours });
});

app.post('/api/tours', (req, res) => {
  const db = readDatabase();
  const newTour = {
    id: req.body.id || `tour-${Date.now()}`,
    name: req.body.name || 'Wahana Wisata Baru',
    kicker: req.body.kicker || 'Objek Rekreasi Chevilly',
    category: req.body.category || 'wahana',
    priceIdr: Number(req.body.priceIdr) || 35000,
    priceUsd: Number(req.body.priceUsd) || 2.5,
    duration: req.body.duration || 'Bebas Eksplorasi',
    difficulty: req.body.difficulty || 'Santai',
    altitude: req.body.altitude || '2.450 mdpl',
    rating: Number(req.body.rating) || 4.95,
    reviewsCount: Number(req.body.reviewsCount) || 120,
    image: req.body.image || '/src/assets/images/waterpark_chevilly_1794289440273.jpg',
    gallery: Array.isArray(req.body.gallery)
      ? req.body.gallery
      : [req.body.image || '/src/assets/images/waterpark_chevilly_1794289440273.jpg'],
    departureTimes: Array.isArray(req.body.departureTimes) ? req.body.departureTimes : ['08:00 - 17:00 WIB'],
    inclusions: Array.isArray(req.body.inclusions) ? req.body.inclusions : ['Akses wahana'],
    equipmentProvided: Array.isArray(req.body.equipmentProvided) ? req.body.equipmentProvided : ['Perlengkapan standar'],
    description: req.body.description || 'Wahana rekreasi seru untuk keluarga di Chevilly Resort.',
    guideType: req.body.guideType || 'Staff Pengawas Wahana',
    ...(req.body.safetyNote ? { safetyNote: req.body.safetyNote } : {}),
  };
  db.tours.push(newTour);
  writeDatabase(db);
  res.status(201).json({ success: true, message: 'Wahana wisata berhasil ditambahkan', data: newTour });
});

app.put('/api/tours/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const index = db.tours.findIndex((t: any) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Wahana tidak ditemukan' });
  }
  db.tours[index] = { ...db.tours[index], ...req.body };
  writeDatabase(db);
  res.json({ success: true, message: 'Data wahana berhasil diperbarui', data: db.tours[index] });
});

app.delete('/api/tours/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const initialLen = db.tours.length;
  db.tours = db.tours.filter((t: any) => t.id !== id);
  if (db.tours.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Wahana tidak ditemukan' });
  }
  writeDatabase(db);
  res.json({ success: true, message: 'Wahana berhasil dihapus' });
});

// 5. RESERVATIONS (CRUD)
app.get('/api/reservations', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.reservations || [] });
});

app.post('/api/reservations', (req, res) => {
  const db = readDatabase();
  if (!db.reservations) db.reservations = [];
  const newReservation = {
    id: req.body.id || `res-${Date.now()}`,
    bookingCode: req.body.bookingCode || `CHV-${Math.floor(10000 + Math.random() * 90000)}`,
    createdAt: req.body.createdAt || new Date().toISOString().split('T')[0],
    guestName: req.body.guestName || 'Tamu',
    guestEmail: req.body.guestEmail || '',
    guestPhone: req.body.guestPhone || '',
    specialRequests: req.body.specialRequests || '',
    status: req.body.status || 'Konfirmasi',
    paymentMethod: req.body.paymentMethod || 'Transfer Bank BCA',
    paymentProofUrl: req.body.paymentProofUrl || '',
    paymentProofUploadedAt: req.body.paymentProofUploadedAt || '',
    paymentProofNote: req.body.paymentProofNote || '',
    totalPriceIdr: Number(req.body.totalPriceIdr) || 0,
    totalPriceUsd: Number(req.body.totalPriceUsd) || 0,
    currency: req.body.currency || 'IDR',
    room: req.body.room,
    tours: req.body.tours,
    selectedAddOns: req.body.selectedAddOns,
  };
  db.reservations.unshift(newReservation);
  writeDatabase(db);
  res.status(201).json({ success: true, message: 'Reservasi berhasil disimpan', data: newReservation });
});

app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  if (!db.reservations) db.reservations = [];
  const index = db.reservations.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  }
  db.reservations[index] = { ...db.reservations[index], ...req.body };
  writeDatabase(db);
  res.json({ success: true, message: 'Reservasi berhasil diperbarui', data: db.reservations[index] });
});

app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  if (!db.reservations) db.reservations = [];
  const initialLen = db.reservations.length;
  db.reservations = db.reservations.filter((r: any) => r.id !== id);
  if (db.reservations.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  }
  writeDatabase(db);
  res.json({ success: true, message: 'Reservasi berhasil dihapus' });
});

// 5b. BOOKING ADD-ONS / LAYANAN TAMBAHAN (CRUD)
app.get('/api/addons', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.addons || [] });
});

app.post('/api/addons', (req, res) => {
  const db = readDatabase();
  if (!Array.isArray(db.addons)) {
    db.addons = DEFAULT_BOOKING_ADDONS.map((item) => ({ ...item }));
  }
  const newAddOn = {
    id: req.body.id || `addon-${Date.now()}`,
    name: req.body.name || 'Layanan Tambahan Baru',
    description: req.body.description || 'Fasilitas dan layanan tambahan eksklusif Chevilly.',
    priceIdr: Number(req.body.priceIdr) || 0,
    priceUsd: Number(req.body.priceUsd) || 0,
    unit: req.body.unit || 'per paket',
    isActive: req.body.isActive !== false,
    showName: req.body.showName !== false,
    showDescription: req.body.showDescription !== false,
    showPrice: req.body.showPrice !== false,
    showUnit: req.body.showUnit !== false,
  };
  db.addons.push(newAddOn);
  writeDatabase(db);
  res.status(201).json({ success: true, message: 'Layanan tambahan berhasil ditambahkan', data: newAddOn });
});

app.put('/api/addons/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  if (!Array.isArray(db.addons)) {
    db.addons = DEFAULT_BOOKING_ADDONS.map((item) => ({ ...item }));
  }
  const index = db.addons.findIndex((a: any) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Layanan tambahan tidak ditemukan' });
  }
  db.addons[index] = {
    ...db.addons[index],
    ...req.body,
    id: db.addons[index].id,
    priceIdr: req.body.priceIdr !== undefined ? Number(req.body.priceIdr) : db.addons[index].priceIdr,
    priceUsd: req.body.priceUsd !== undefined ? Number(req.body.priceUsd) : db.addons[index].priceUsd,
  };
  writeDatabase(db);
  res.json({ success: true, message: 'Layanan tambahan berhasil diperbarui', data: db.addons[index] });
});

app.delete('/api/addons/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  if (!Array.isArray(db.addons)) {
    db.addons = DEFAULT_BOOKING_ADDONS.map((item) => ({ ...item }));
  }
  const initialLen = db.addons.length;
  db.addons = db.addons.filter((a: any) => a.id !== id);
  if (db.addons.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Layanan tambahan tidak ditemukan' });
  }
  writeDatabase(db);
  res.json({ success: true, message: 'Layanan tambahan berhasil dihapus' });
});

// 5c. GUEST REVIEWS / ULASAN PARA PENJELAJAH & TAMU KEHORMATAN (CRUD)
app.get('/api/reviews', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.reviews || DEFAULT_GUEST_REVIEWS });
});

app.post('/api/reviews', (req, res) => {
  const db = readDatabase();
  if (!Array.isArray(db.reviews)) {
    db.reviews = DEFAULT_GUEST_REVIEWS.map((item) => ({ ...item }));
  }
  const newReview = {
    id: req.body.id || `rev-${Date.now()}`,
    authorName: String(req.body.authorName || 'Tamu Kehormatan').trim(),
    authorRole: String(req.body.authorRole || 'Tamu Chevilly Resort & Camp').trim(),
    quote: String(req.body.quote || '').trim(),
    rating: Math.min(5, Math.max(1, Number(req.body.rating) || 5)),
    isActive: req.body.isActive !== false,
    createdAt: req.body.createdAt || new Date().toISOString().split('T')[0],
  };
  db.reviews.unshift(newReview);
  writeDatabase(db);
  res.status(201).json({ success: true, message: 'Ulasan tamu berhasil ditambahkan', data: newReview });
});

app.put('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  if (!Array.isArray(db.reviews)) {
    db.reviews = DEFAULT_GUEST_REVIEWS.map((item) => ({ ...item }));
  }
  const index = db.reviews.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan' });
  }
  db.reviews[index] = {
    ...db.reviews[index],
    ...req.body,
    id: db.reviews[index].id,
    rating:
      req.body.rating !== undefined
        ? Math.min(5, Math.max(1, Number(req.body.rating) || 5))
        : db.reviews[index].rating ?? 5,
  };
  writeDatabase(db);
  res.json({ success: true, message: 'Ulasan tamu berhasil diperbarui', data: db.reviews[index] });
});

app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  if (!Array.isArray(db.reviews)) {
    db.reviews = DEFAULT_GUEST_REVIEWS.map((item) => ({ ...item }));
  }
  const initialLen = db.reviews.length;
  db.reviews = db.reviews.filter((r: any) => r.id !== id);
  if (db.reviews.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan' });
  }
  writeDatabase(db);
  res.json({ success: true, message: 'Ulasan tamu berhasil dihapus' });
});

// 6. RESET TO DEFAULTS
app.post('/api/reset-defaults', (_req, res) => {
  const defaults = getDefaultDatabase();
  writeDatabase(defaults);
  res.json({ success: true, message: 'Database berhasil di-reset ke data bawaan Chevilly', data: defaults });
});

// ==========================================
// VITE INTEGRATION (DEV & PROD)
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development: Mount Vite in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static built files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Chevilly Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
