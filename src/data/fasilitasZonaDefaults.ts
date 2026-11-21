import {
  FasilitasSaranaItem,
  FasilitasOperatingHour,
  ZonaPrabayarItem,
  ZonaRentalFacility,
} from '../types';

export const DEFAULT_FASILITAS_ITEMS: FasilitasSaranaItem[] = [
  { id: 'fas-01', code: 'Fasilitas 01', name: 'Motor Listrik', capacity: '2 orang', price: 'Rp 25.000 / 30 Menit', image: '/assets/fasilitas/motor-listrik.jpg', isActive: true },
  { id: 'fas-02', code: 'Fasilitas 02', name: 'Skuter Listrik', capacity: '1 orang', price: 'Rp 20.000 / 20 Menit', image: '/assets/fasilitas/skuter-listrik.jpg', isActive: true },
  { id: 'fas-03', code: 'Fasilitas 03', name: 'Mobil UTV', capacity: '2 orang', price: 'Rp 100.000 / 25 Menit', image: '/assets/fasilitas/mobil-utv.jpg', isActive: true },
  { id: 'fas-04', code: 'Fasilitas 04', name: 'Sepeda', capacity: '1 orang', price: 'Rp 10.000 / 60 Menit', image: '/assets/fasilitas/sepeda.jpg', isActive: true },
  { id: 'fas-05', code: 'Fasilitas 05', name: 'Mobil Buggy', capacity: '6 Kursi', price: 'Rp 10.000 / orang / putaran', image: '/assets/fasilitas/mobil-buggy.jpg', isActive: true },
  { id: 'fas-06', code: 'Fasilitas 06', name: 'Motor ATV Besar', capacity: '2 orang', price: 'Rp 60.000 / 25 Menit', image: '/assets/fasilitas/motor-atv-besar.jpg', isActive: true },
  { id: 'fas-07', code: 'Fasilitas 07', name: 'Sepeda Listrik', capacity: '1 orang', price: 'Rp 25.000 / 30 Menit', image: '/assets/fasilitas/sepeda-listrik.jpg', isActive: true },
  { id: 'fas-08', code: 'Fasilitas 08', name: 'Becak', capacity: '2 orang', price: 'Rp 25.000 / 20 Menit', image: '/assets/fasilitas/becak.jpg', isActive: true },
  { id: 'fas-09', code: 'Fasilitas 09', name: 'Motor ATV Kecil', capacity: '1 orang', price: 'Rp 50.000 / 25 Menit', image: '/assets/fasilitas/motor-atv-kecil.jpg', isActive: true },
  { id: 'fas-10', code: 'Fasilitas 10', name: 'Wisata Kereta', price: 'Rp 10.000 / orang / putaran', image: '/assets/fasilitas/wisata-kereta.jpg', isActive: true },
  { id: 'fas-11', code: 'Fasilitas 11', name: 'Drone', price: 'Rp 25.000 / 10 Menit', image: '/assets/fasilitas/drone.jpg', isActive: true },
];

export const DEFAULT_FASILITAS_OPERATING_HOURS: FasilitasOperatingHour[] = [
  { day: 'Senin – Jumat', hours: '08.00 – 19.00' },
  { day: 'Sabtu', hours: '08.00 – 21.00' },
  { day: 'Minggu', hours: '07.00 – 19.00' },
];

export const DEFAULT_ZONA_ITEMS: ZonaPrabayarItem[] = [
  { id: 'zona-01', code: 'Zona 01', name: 'Zona 01 Nuri', area: 'Area Fasilitas Atas', price: 'Rp 250.000 / sesi', capacity: '150 orang', size: '1.511 m² (93,30 × 16,20 m)', image: '/assets/zona/zona-01-nuri.jpg', isActive: true },
  { id: 'zona-02', code: 'Zona 02', name: 'Zona 02 Gelatik', area: 'Area Lapang Rumput Bawah Resto', price: 'Rp 250.000 / sesi', capacity: '167 orang', size: '357,7 m² (25 × 14,30 m)', image: '/assets/zona/zona-02-gelatik.jpg', isActive: true },
  { id: 'zona-03', code: 'Zona 03', name: 'Zona 03 Kenari', area: 'Area Teras Pujasera 2 Lantai 1', price: 'Rp 250.000 / sesi', capacity: '41 orang', size: '48,38 m² (4,1 × 11,8 m)', image: '/assets/zona/zona-03-kenari.jpg', isActive: true },
  { id: 'zona-04', code: 'Zona 04', name: 'Zona 04 Pipit', area: 'Area Teras Pujasera 2 Lantai 2', price: 'Rp 350.000 / 4 jam', capacity: '61 orang', size: '72,88 m² (5,95 × 12,25 m)', image: '/assets/zona/zona-04-pipit.jpg', isActive: true },
  { id: 'zona-05', code: 'Zona 05', name: 'Zona 05 Kacer', area: 'Area Ex Kidspot', price: 'Rp 350.000 / 4 jam', capacity: '70 orang', size: '161,5 m² (14,40 × 10,90 m)', image: '/assets/zona/zona-05-kacer.jpg', isActive: true },
  { id: 'zona-06', code: 'Zona 06', name: 'Zona 06 Wedding Deck', area: 'Area Vine Resto', price: 'Rp 350.000 / 4 jam', capacity: '150 orang', size: '492,96 m² (31,2 × 15,8 m)', image: '/assets/zona/zona-06-wedding-deck.jpg', isActive: true },
  { id: 'zona-07', code: 'Zona 07', name: 'Zona 07 Murai', area: 'Area Magnolia Lantai 2', price: 'Rp 350.000 / 4 jam', capacity: '126 orang', size: '263,5 m² (9,75 × 27 m)', image: '/assets/zona/zona-07-murai.jpg', isActive: true },
  { id: 'zona-08', code: 'Zona 08', name: 'Zona 08 Merpati', area: 'Area Bintang Camp', price: 'Rp 250.000 / sesi', capacity: '50 orang', size: '89,50 m² (8,60 × 10,40 m)', image: '/assets/zona/zona-08-merpati.jpg', isActive: true },
  { id: 'zona-09', code: 'Zona 09', name: 'Zona 09 Jalak', area: 'Area Gazebo Bawah Bintang', price: 'Rp 250.000 / sesi', capacity: '40 orang', size: '42,50 m² (7,86 × 5,38 m)', image: '/assets/zona/zona-09-jalak.jpg', isActive: true },
  { id: 'zona-10', code: 'Zona 10', name: 'Zona 10 Walet', area: 'Area Gazebo Bawah Bintang', price: 'Rp 250.000 / sesi', capacity: '54 orang', size: '64,5 m² (15 × 4,3 m)', image: '/assets/zona/zona-10-walet.jpg', isActive: true },
  { id: 'zona-11', code: 'Zona 11', name: 'Zona 11 Kutilang', area: 'Area Gazebo Bawah Bintang', price: 'Rp 250.000 / sesi', capacity: '54 orang', size: '64,5 m² (15 × 4,3 m)', image: '/assets/zona/zona-11-kutilang.jpg', isActive: true },
  { id: 'zona-12', code: 'Zona 12', name: 'Zona 12 Merak', area: 'Area Lapang Rumput Lotus', price: 'Rp 500.000 / sesi', capacity: '711 orang', size: '1.619 m² (47,90 × 33,80 m)', image: '/assets/zona/zona-12-merak.jpg', isActive: true },
  { id: 'zona-13', code: 'Zona 13', name: 'Zona 13 Elang', area: 'Area Kotak Playground', price: 'Rp 250.000 / 4 jam', capacity: '100 orang', size: '222,50 m² (16,50 × 13,50 m)', image: '/assets/zona/zona-13-elang.jpg', isActive: true },
  { id: 'zona-14', code: 'Zona 14', name: 'Zona 14 Kakatua', area: 'Area Playground Depan', price: 'Rp 350.000 / 4 jam', capacity: '65 orang', size: '200,50 m² (16,70 × 12 m)', image: '/assets/zona/zona-14-kakatua.jpg', isActive: true },
  { id: 'zona-15', code: 'Zona 15', name: 'Zona 15 Beo', area: 'Area Playground Belakang', price: 'Rp 250.000 / 4 jam', capacity: '66 orang', size: '176,50 m² (14,90 × 11,85 m)', image: '/assets/zona/zona-15-beo.jpg', isActive: true },
  { id: 'zona-16', code: 'Zona 16', name: 'Zona 16 Camar', area: 'Area Bundar Belakang', price: 'Rp 250.000 / sesi', capacity: '66 orang', size: '152,10 m² (13,90 × 11 m)', image: '/assets/zona/zona-16-camar.jpg', isActive: true },
  { id: 'zona-17', code: 'Zona 17', name: 'Zona 17 Kasturi', area: 'Area Bundar Belakang', price: 'Rp 250.000 / sesi', capacity: '68 orang', size: '193,5 m² (14 × 13,80 m)', image: '/assets/zona/zona-17-kasturi.jpg', isActive: true },
  { id: 'zona-18', code: 'Zona 18', name: 'Zona 18 Cendrawasih', area: 'Area Depan Aviary', price: 'Rp 30.000 / sesi', capacity: '43 orang', size: '51,45 m² (4,90 × 10,50 m)', image: '/assets/zona/zona-18-cendrawasih.jpg', isActive: true },
  { id: 'zona-19', code: 'Zona 19', name: 'Zona 19 Bangau', area: 'Area Samping Aviary', price: 'Rp 25.000 / sesi', capacity: '25 orang', size: '48,38 m² (5,80 × 5,20 m)', image: '/assets/zona/zona-19-bangau.jpg', isActive: true },
  { id: 'zona-20', code: 'Zona 20', name: 'Zona 20 Perkutut', area: 'Area Samping Aviary', price: 'Rp 25.000 / sesi', capacity: '25 orang', size: '48,38 m² (5,80 × 5,20 m)', image: '/assets/zona/zona-20-perkutut.jpg', isActive: true },
  { id: 'zona-21', code: 'Zona 21', name: 'Zona 21 Parkit', area: 'Area Samping Aviary', price: 'Rp 25.000 / sesi', capacity: '25 orang', size: '48,38 m² (5,80 × 5,20 m)', image: '/assets/zona/zona-21-parkit.jpg', isActive: true },
  { id: 'zona-22', code: 'Zona 22', name: 'Zona 22 Lovebird', area: 'Area Samping Aviary', price: 'Rp 25.000 / sesi', capacity: '25 orang', size: '48,38 m² (5,80 × 5,20 m)', image: '/assets/zona/zona-22-lovebird.jpg', isActive: true },
];

export const DEFAULT_ZONA_RENTAL_FACILITIES: ZonaRentalFacility[] = [
  { label: 'Kursi', price: 'Rp 7.000' },
  { label: 'Meja', price: 'Rp 20.000' },
  { label: 'Sound System Standart', price: 'Rp 150.000 / 2 jam' },
  { label: 'Sound System Outdoor 15"', price: 'Rp 750.000 / sesi' },
  { label: 'Sound System Outdoor 17"', price: 'Rp 1.000.000 / sesi' },
  { label: 'Tikar Lipat (4×3 m)', price: 'Rp 25.000 / sesi' },
];
