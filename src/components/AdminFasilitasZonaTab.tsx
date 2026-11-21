import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, X, Save, Upload, Clock, MapPin, Compass, Sparkles, Check,
} from 'lucide-react';
import {
  FasilitasSaranaItem,
  FasilitasOperatingHour,
  ZonaPrabayarItem,
  ZonaRentalFacility,
} from '../types';
import {
  createFasilitasSarana,
  updateFasilitasSarana,
  deleteFasilitasSarana,
  updateFasilitasOperatingHours,
  createZonaPrabayar,
  updateZonaPrabayar,
  deleteZonaPrabayar,
  updateZonaRentalFacilities,
  uploadImage,
} from '../services/api';

interface AdminFasilitasTabProps {
  items: FasilitasSaranaItem[];
  operatingHours: FasilitasOperatingHour[];
  adminToken: string;
  onRefresh: () => Promise<void>;
  onDataChanged: () => void;
  onFeedback: (message: string, type?: 'success' | 'error') => void;
  onAuthExpired: () => void;
}

interface AdminZonaTabProps {
  items: ZonaPrabayarItem[];
  rentalFacilities: ZonaRentalFacility[];
  adminToken: string;
  onRefresh: () => Promise<void>;
  onDataChanged: () => void;
  onFeedback: (message: string, type?: 'success' | 'error') => void;
  onAuthExpired: () => void;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });

export const AdminFasilitasTab: React.FC<AdminFasilitasTabProps> = ({
  items,
  operatingHours,
  adminToken,
  onRefresh,
  onDataChanged,
  onFeedback,
  onAuthExpired,
}) => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<FasilitasSaranaItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempUploadedUrl, setTempUploadedUrl] = useState<string | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<FasilitasSaranaItem | null>(null);

  const [hoursDraft, setHoursDraft] = useState<FasilitasOperatingHour[]>(operatingHours);
  const [savingHours, setSavingHours] = useState(false);

  useEffect(() => {
    setHoursDraft(operatingHours);
  }, [operatingHours]);

  const filtered = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.price.toLowerCase().includes(q) ||
      (item.capacity || '').toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    const nextNum = String(items.length + 1).padStart(2, '0');
    setTempUploadedUrl(undefined);
    setEditing({
      code: `Fasilitas ${nextNum}`,
      name: '',
      price: '',
      capacity: '',
      image: '/assets/fasilitas/motor-listrik.jpg',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FasilitasSaranaItem) => {
    setTempUploadedUrl(undefined);
    setEditing({ ...item });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadImage(dataUrl, `fasilitas_${file.name.replace(/\.[^.]+$/, '')}`, tempUploadedUrl);
      if (res.success && res.url) {
        setTempUploadedUrl(res.url.startsWith('/uploads/') ? res.url : undefined);
        setEditing((prev) => (prev ? { ...prev, image: res.url } : prev));
        onFeedback('Foto fasilitas berhasil diunggah');
      } else {
        onFeedback(res.message || 'Gagal mengunggah foto fasilitas', 'error');
      }
    } catch {
      onFeedback('Gagal memproses file foto', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name?.trim() || !editing.price?.trim()) {
      onFeedback('Nama fasilitas dan harga sewa wajib diisi', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = Boolean(editing.id && items.some((i) => i.id === editing.id));
      const result = isEdit
        ? await updateFasilitasSarana(editing.id!, editing, adminToken)
        : await createFasilitasSarana(editing, adminToken);

      if (result.unauthorized) {
        onAuthExpired();
        return;
      }
      if (!result.ok) {
        onFeedback(result.message || 'Gagal menyimpan data fasilitas', 'error');
        return;
      }

      setIsModalOpen(false);
      setEditing(null);
      setTempUploadedUrl(undefined);
      await onRefresh();
      onDataChanged();
      onFeedback(isEdit ? 'Data fasilitas berhasil diperbarui' : 'Fasilitas baru berhasil ditambahkan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: FasilitasSaranaItem) => {
    const nextActive = item.isActive === false;
    const result = await updateFasilitasSarana(item.id, { isActive: nextActive }, adminToken);
    if (result.unauthorized) {
      onAuthExpired();
      return;
    }
    if (!result.ok) {
      onFeedback(result.message || 'Gagal mengubah status tampil fasilitas', 'error');
      return;
    }
    await onRefresh();
    onDataChanged();
    onFeedback(nextActive ? `${item.name} ditampilkan di beranda` : `${item.name} disembunyikan dari beranda`);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setItemToDelete(null);
    const result = await deleteFasilitasSarana(target.id, adminToken);
    if (result.unauthorized) {
      onAuthExpired();
      return;
    }
    if (!result.ok) {
      onFeedback(result.message || 'Gagal menghapus fasilitas', 'error');
      return;
    }
    await onRefresh();
    onDataChanged();
    onFeedback(`Fasilitas "${target.name}" berhasil dihapus`);
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      const cleaned = hoursDraft.filter((h) => h.day.trim() && h.hours.trim());
      const result = await updateFasilitasOperatingHours(cleaned, adminToken);
      if (result.unauthorized) {
        onAuthExpired();
        return;
      }
      if (!result.ok) {
        onFeedback(result.message || 'Gagal menyimpan jam operasional', 'error');
        return;
      }
      await onRefresh();
      onDataChanged();
      onFeedback('Jam operasional fasilitas berhasil disimpan');
    } finally {
      setSavingHours(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#967d58]" />
            <span>Manajemen Fasilitas &amp; Sarana (Carousel Cek Ketersediaan)</span>
          </h3>
          <p className="text-xs text-[#52645c]">
            Tambah, ubah foto, tarif sewa, kapasitas, dan jam operasional yang tampil pada tombol <strong>Fasilitas</strong> di halaman utama.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" />
          <span>Tambah Fasilitas</span>
        </button>
      </div>

      {/* Jam Operasional Inline Editor */}
      <div className="bg-white border border-[#ded7cb] p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ece6da]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#182a24]">
            <Clock className="w-4 h-4 text-[#967d58]" />
            <span>Jam Operasional Fasilitas &amp; Sarana</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHoursDraft((prev) => [...prev, { day: '', hours: '' }])}
              className="px-2.5 py-1 text-[11px] font-semibold border border-[#ded7cb] text-[#182a24] hover:bg-[#f4f0e6] inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Baris</span>
            </button>
            <button
              type="button"
              disabled={savingHours}
              onClick={handleSaveHours}
              className="px-3 py-1 bg-[#182a24] hover:bg-[#284138] disabled:opacity-50 text-white text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3 h-3 text-[#d4af37]" />
              <span>{savingHours ? 'Menyimpan...' : 'Simpan Jadwal'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {hoursDraft.map((row, idx) => (
            <div key={idx} className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e4ded2] p-2">
              <input
                type="text"
                value={row.day}
                onChange={(e) =>
                  setHoursDraft((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, day: e.target.value } : item))
                  )
                }
                placeholder="Hari (mis. Senin – Jumat)"
                className="w-1/2 px-2 py-1 text-xs border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
              />
              <input
                type="text"
                value={row.hours}
                onChange={(e) =>
                  setHoursDraft((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, hours: e.target.value } : item))
                  )
                }
                placeholder="08.00 – 19.00"
                className="w-1/2 px-2 py-1 text-xs font-mono border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
              />
              <button
                type="button"
                onClick={() => setHoursDraft((prev) => prev.filter((_, i) => i !== idx))}
                aria-label="Hapus baris jadwal"
                className="p-1 text-stone-500 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Summary Bar */}
      <div className="bg-white border border-[#ded7cb] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#73837b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama fasilitas, kode, kapasitas, atau harga..."
            className="w-full pl-8 pr-3 py-1.5 border border-[#ded7cb] text-xs bg-[#faf9f5] text-[#182a24] focus:outline-none focus:border-[#182a24]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 bg-[#f4f0e6] border border-[#ded7cb] text-[#182a24]">
            Total: <strong>{items.length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800">
            Tampil: <strong>{items.filter((i) => i.isActive !== false).length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-600">
            Disembunyikan: <strong>{items.filter((i) => i.isActive === false).length}</strong>
          </span>
        </div>
      </div>

      {/* Table of Fasilitas */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center bg-white border border-dashed border-[#ded7cb] space-y-2">
          <Compass className="w-8 h-8 text-[#967d58] mx-auto" />
          <div className="font-serif text-base font-semibold text-[#182a24]">
            Tidak ada fasilitas yang cocok
          </div>
          <p className="text-xs text-[#63746c]">
            Klik &quot;Tambah Fasilitas&quot; untuk menambahkan item baru atau ubah kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
              <tr>
                <th className="p-3 w-28">Foto</th>
                <th className="p-3">Kode &amp; Nama Fasilitas</th>
                <th className="p-3">Harga Sewa</th>
                <th className="p-3">Kapasitas</th>
                <th className="p-3 whitespace-nowrap">Status</th>
                <th className="p-3 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded7cb]">
              {filtered.map((item) => {
                const isActive = item.isActive !== false;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#faf9f5] align-middle ${isActive ? '' : 'opacity-65 bg-stone-50'}`}
                  >
                    <td className="p-2.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-14 object-cover border border-[#ded7cb] bg-[#182a24]"
                      />
                    </td>
                    <td className="p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#967d58]">
                        {item.code}
                      </div>
                      <div className="font-serif text-sm font-bold text-[#182a24]">{item.name}</div>
                    </td>
                    <td className="p-3 font-mono font-semibold text-[#182a24]">{item.price}</td>
                    <td className="p-3 text-[#52645c]">{item.capacity || '-'}</td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border cursor-pointer inline-flex items-center gap-1 transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                        <span>{isActive ? 'Tampil' : 'Sembunyi'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-emerald-800 border border-[#ded7cb] hover:border-emerald-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
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

      {/* Create / Edit Modal */}
      {isModalOpen && editing && (
        <div className="fixed inset-0 z-[70] bg-black/75 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-lg shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb]">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                {editing.id ? 'Edit Fasilitas & Sarana' : 'Tambah Fasilitas Baru'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditing(null);
                }}
                className="p-1 text-stone-600 hover:text-[#182a24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview + Upload */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c]">
                Foto Fasilitas
              </label>
              <div className="aspect-[16/10] w-full bg-[#182a24] border border-[#ded7cb] overflow-hidden">
                {editing.image && (
                  <img
                    src={editing.image}
                    alt={editing.name || 'Preview'}
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#182a24] hover:bg-[#284138] text-white font-semibold uppercase tracking-wider cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{isUploading ? 'Mengunggah...' : 'Unggah Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={editing.image || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, image: e.target.value } : prev))}
                  placeholder="/assets/fasilitas/... atau https://..."
                  className="flex-1 px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] font-mono text-[11px] focus:outline-none focus:border-[#182a24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Kode / Label Badge
                </label>
                <input
                  type="text"
                  value={editing.code || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, code: e.target.value } : prev))}
                  placeholder="Fasilitas 12"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Nama Fasilitas *
                </label>
                <input
                  type="text"
                  required
                  value={editing.name || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  placeholder="Mis. Motor Listrik"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Harga Sewa *
                </label>
                <input
                  type="text"
                  required
                  value={editing.price || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, price: e.target.value } : prev))}
                  placeholder="Rp 25.000 / 30 Menit"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] font-mono focus:outline-none focus:border-[#182a24]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Kapasitas (Opsional)
                </label>
                <input
                  type="text"
                  value={editing.capacity || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, capacity: e.target.value } : prev))}
                  placeholder="Mis. 2 orang / 6 Kursi"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editing.isActive !== false}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, isActive: e.target.checked } : prev))}
                className="w-4 h-4 accent-[#182a24]"
              />
              <span className="text-[#182a24] font-medium">Tampilkan pada carousel Fasilitas di beranda</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ded7cb]">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditing(null);
                }}
                className="px-4 py-2 border border-[#ded7cb] bg-white text-stone-700 hover:bg-stone-100 uppercase tracking-wider font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-5 py-2 bg-[#182a24] hover:bg-[#284138] disabled:opacity-50 text-white uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#d4af37]" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Fasilitas'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[70] bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <h4 className="font-serif text-lg font-bold text-[#182a24]">Hapus Fasilitas?</h4>
            <p className="text-[#52645c] leading-relaxed">
              Anda yakin ingin menghapus <strong>{itemToDelete.name}</strong> ({itemToDelete.code})? Item ini akan langsung hilang dari carousel beranda.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-[#ded7cb] bg-white text-stone-700 hover:bg-stone-100 font-semibold uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold uppercase tracking-wider cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminZonaTab: React.FC<AdminZonaTabProps> = ({
  items,
  rentalFacilities,
  adminToken,
  onRefresh,
  onDataChanged,
  onFeedback,
  onAuthExpired,
}) => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<ZonaPrabayarItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempUploadedUrl, setTempUploadedUrl] = useState<string | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<ZonaPrabayarItem | null>(null);

  const [rentalsDraft, setRentalsDraft] = useState<ZonaRentalFacility[]>(rentalFacilities);
  const [savingRentals, setSavingRentals] = useState(false);

  useEffect(() => {
    setRentalsDraft(rentalFacilities);
  }, [rentalFacilities]);

  const filtered = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.area.toLowerCase().includes(q) ||
      item.price.toLowerCase().includes(q) ||
      item.capacity.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    const nextNum = String(items.length + 1).padStart(2, '0');
    setTempUploadedUrl(undefined);
    setEditing({
      code: `Zona ${nextNum}`,
      name: `Zona ${nextNum} `,
      area: '',
      price: 'Rp 250.000 / sesi',
      capacity: '',
      size: '',
      image: '/assets/zona/zona-01-nuri.jpg',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ZonaPrabayarItem) => {
    setTempUploadedUrl(undefined);
    setEditing({ ...item });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadImage(dataUrl, `zona_${file.name.replace(/\.[^.]+$/, '')}`, tempUploadedUrl);
      if (res.success && res.url) {
        setTempUploadedUrl(res.url.startsWith('/uploads/') ? res.url : undefined);
        setEditing((prev) => (prev ? { ...prev, image: res.url } : prev));
        onFeedback('Foto zona berhasil diunggah');
      } else {
        onFeedback(res.message || 'Gagal mengunggah foto zona', 'error');
      }
    } catch {
      onFeedback('Gagal memproses file foto', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name?.trim() || !editing.price?.trim()) {
      onFeedback('Nama zona dan harga sewa wajib diisi', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = Boolean(editing.id && items.some((i) => i.id === editing.id));
      const result = isEdit
        ? await updateZonaPrabayar(editing.id!, editing, adminToken)
        : await createZonaPrabayar(editing, adminToken);

      if (result.unauthorized) {
        onAuthExpired();
        return;
      }
      if (!result.ok) {
        onFeedback(result.message || 'Gagal menyimpan data zona', 'error');
        return;
      }

      setIsModalOpen(false);
      setEditing(null);
      setTempUploadedUrl(undefined);
      await onRefresh();
      onDataChanged();
      onFeedback(isEdit ? 'Data zona berhasil diperbarui' : 'Zona prabayar baru berhasil ditambahkan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: ZonaPrabayarItem) => {
    const nextActive = item.isActive === false;
    const result = await updateZonaPrabayar(item.id, { isActive: nextActive }, adminToken);
    if (result.unauthorized) {
      onAuthExpired();
      return;
    }
    if (!result.ok) {
      onFeedback(result.message || 'Gagal mengubah status tampil zona', 'error');
      return;
    }
    await onRefresh();
    onDataChanged();
    onFeedback(nextActive ? `${item.name} ditampilkan di beranda` : `${item.name} disembunyikan dari beranda`);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setItemToDelete(null);
    const result = await deleteZonaPrabayar(target.id, adminToken);
    if (result.unauthorized) {
      onAuthExpired();
      return;
    }
    if (!result.ok) {
      onFeedback(result.message || 'Gagal menghapus zona', 'error');
      return;
    }
    await onRefresh();
    onDataChanged();
    onFeedback(`Zona "${target.name}" berhasil dihapus`);
  };

  const handleSaveRentals = async () => {
    setSavingRentals(true);
    try {
      const cleaned = rentalsDraft.filter((r) => r.label.trim() && r.price.trim());
      const result = await updateZonaRentalFacilities(cleaned, adminToken);
      if (result.unauthorized) {
        onAuthExpired();
        return;
      }
      if (!result.ok) {
        onFeedback(result.message || 'Gagal menyimpan tarif fasilitas tambahan', 'error');
        return;
      }
      await onRefresh();
      onDataChanged();
      onFeedback('Harga sewa fasilitas tambahan berhasil disimpan');
    } finally {
      setSavingRentals(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ded7cb]">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#182a24] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#967d58]" />
            <span>Manajemen Explore Zona Prabayar (Carousel Cek Ketersediaan)</span>
          </h3>
          <p className="text-xs text-[#52645c]">
            Kelola 22+ zona prabayar, foto area, harga sewa, kapasitas, luas, serta daftar harga sewa fasilitas tambahan.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#182a24] hover:bg-[#284138] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" />
          <span>Tambah Zona</span>
        </button>
      </div>

      {/* Harga Sewa Fasilitas Tambahan Inline Editor */}
      <div className="bg-white border border-[#ded7cb] p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ece6da]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#182a24]">
            <Sparkles className="w-4 h-4 text-[#967d58]" />
            <span>Harga Sewa Fasilitas Tambahan Zona</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRentalsDraft((prev) => [...prev, { label: '', price: '' }])}
              className="px-2.5 py-1 text-[11px] font-semibold border border-[#ded7cb] text-[#182a24] hover:bg-[#f4f0e6] inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Item</span>
            </button>
            <button
              type="button"
              disabled={savingRentals}
              onClick={handleSaveRentals}
              className="px-3 py-1 bg-[#182a24] hover:bg-[#284138] disabled:opacity-50 text-white text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3 h-3 text-[#d4af37]" />
              <span>{savingRentals ? 'Menyimpan...' : 'Simpan Tarif Tambahan'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {rentalsDraft.map((row, idx) => (
            <div key={idx} className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#e4ded2] p-2">
              <input
                type="text"
                value={row.label}
                onChange={(e) =>
                  setRentalsDraft((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, label: e.target.value } : item))
                  )
                }
                placeholder="Nama item (mis. Kursi)"
                className="w-1/2 px-2 py-1 text-xs border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
              />
              <input
                type="text"
                value={row.price}
                onChange={(e) =>
                  setRentalsDraft((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, price: e.target.value } : item))
                  )
                }
                placeholder="Rp 7.000"
                className="w-1/2 px-2 py-1 text-xs font-mono border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
              />
              <button
                type="button"
                onClick={() => setRentalsDraft((prev) => prev.filter((_, i) => i !== idx))}
                aria-label="Hapus item sewa tambahan"
                className="p-1 text-stone-500 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Summary Bar */}
      <div className="bg-white border border-[#ded7cb] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#73837b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama zona, lokasi area, kapasitas, atau harga..."
            className="w-full pl-8 pr-3 py-1.5 border border-[#ded7cb] text-xs bg-[#faf9f5] text-[#182a24] focus:outline-none focus:border-[#182a24]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 bg-[#f4f0e6] border border-[#ded7cb] text-[#182a24]">
            Total: <strong>{items.length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800">
            Tampil: <strong>{items.filter((i) => i.isActive !== false).length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-600">
            Disembunyikan: <strong>{items.filter((i) => i.isActive === false).length}</strong>
          </span>
        </div>
      </div>

      {/* Table of Zona */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center bg-white border border-dashed border-[#ded7cb] space-y-2">
          <MapPin className="w-8 h-8 text-[#967d58] mx-auto" />
          <div className="font-serif text-base font-semibold text-[#182a24]">
            Tidak ada zona yang cocok
          </div>
          <p className="text-xs text-[#63746c]">
            Klik &quot;Tambah Zona&quot; untuk menambahkan zona baru atau ubah kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-[#ded7cb] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2eee3] text-[10px] uppercase tracking-wider text-[#52645c] border-b border-[#ded7cb]">
              <tr>
                <th className="p-3 w-28">Foto</th>
                <th className="p-3">Zona &amp; Area Lokasi</th>
                <th className="p-3">Harga Sewa</th>
                <th className="p-3">Kapasitas &amp; Luas</th>
                <th className="p-3 whitespace-nowrap">Status</th>
                <th className="p-3 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded7cb]">
              {filtered.map((item) => {
                const isActive = item.isActive !== false;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#faf9f5] align-middle ${isActive ? '' : 'opacity-65 bg-stone-50'}`}
                  >
                    <td className="p-2.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-14 object-cover border border-[#ded7cb] bg-[#182a24]"
                      />
                    </td>
                    <td className="p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#967d58]">
                        {item.code}
                      </div>
                      <div className="font-serif text-sm font-bold text-[#182a24]">{item.name}</div>
                      <div className="text-[11px] text-[#63746c] mt-0.5">{item.area}</div>
                    </td>
                    <td className="p-3 font-mono font-semibold text-[#182a24] whitespace-nowrap">{item.price}</td>
                    <td className="p-3">
                      <div className="text-[#182a24] font-medium">{item.capacity}</div>
                      <div className="text-[10px] font-mono text-[#63746c] mt-0.5">{item.size}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border cursor-pointer inline-flex items-center gap-1 transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                        <span>{isActive ? 'Tampil' : 'Sembunyi'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-emerald-800 border border-[#ded7cb] hover:border-emerald-600 bg-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
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

      {/* Create / Edit Modal */}
      {isModalOpen && editing && (
        <div className="fixed inset-0 z-[70] bg-black/75 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-lg shadow-2xl p-6 text-xs max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7cb]">
              <h4 className="font-serif text-lg font-bold text-[#182a24]">
                {editing.id ? 'Edit Data Zona Prabayar' : 'Tambah Zona Prabayar Baru'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditing(null);
                }}
                className="p-1 text-stone-600 hover:text-[#182a24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview + Upload */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c]">
                Foto Zona
              </label>
              <div className="aspect-[16/10] w-full bg-[#182a24] border border-[#ded7cb] overflow-hidden">
                {editing.image && (
                  <img
                    src={editing.image}
                    alt={editing.name || 'Preview'}
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#182a24] hover:bg-[#284138] text-white font-semibold uppercase tracking-wider cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{isUploading ? 'Mengunggah...' : 'Unggah Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={editing.image || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, image: e.target.value } : prev))}
                  placeholder="/assets/zona/... atau https://..."
                  className="flex-1 px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] font-mono text-[11px] focus:outline-none focus:border-[#182a24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Kode Zona
                </label>
                <input
                  type="text"
                  value={editing.code || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, code: e.target.value } : prev))}
                  placeholder="Zona 23"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Nama Zona *
                </label>
                <input
                  type="text"
                  required
                  value={editing.name || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  placeholder="Mis. Zona 23 Flamingo"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                Area / Lokasi *
              </label>
              <input
                type="text"
                required
                value={editing.area || ''}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, area: e.target.value } : prev))}
                placeholder="Mis. Area Lapang Rumput Bawah Resto"
                className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Harga Sewa *
                </label>
                <input
                  type="text"
                  required
                  value={editing.price || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, price: e.target.value } : prev))}
                  placeholder="Rp 250.000 / sesi"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] font-mono focus:outline-none focus:border-[#182a24]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Kapasitas
                </label>
                <input
                  type="text"
                  value={editing.capacity || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, capacity: e.target.value } : prev))}
                  placeholder="100 orang"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] focus:outline-none focus:border-[#182a24]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52645c] mb-1">
                  Luas Area
                </label>
                <input
                  type="text"
                  value={editing.size || ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, size: e.target.value } : prev))}
                  placeholder="120 m² (12 × 10 m)"
                  className="w-full px-3 py-2 border border-[#ded7cb] bg-white text-[#182a24] font-mono focus:outline-none focus:border-[#182a24]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editing.isActive !== false}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, isActive: e.target.checked } : prev))}
                className="w-4 h-4 accent-[#182a24]"
              />
              <span className="text-[#182a24] font-medium">Tampilkan pada carousel Explore Zona di beranda</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ded7cb]">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditing(null);
                }}
                className="px-4 py-2 border border-[#ded7cb] bg-white text-stone-700 hover:bg-stone-100 uppercase tracking-wider font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-5 py-2 bg-[#182a24] hover:bg-[#284138] disabled:opacity-50 text-white uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#d4af37]" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Zona'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[70] bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border-2 border-[#182a24] w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <h4 className="font-serif text-lg font-bold text-[#182a24]">Hapus Zona Prabayar?</h4>
            <p className="text-[#52645c] leading-relaxed">
              Anda yakin ingin menghapus <strong>{itemToDelete.name}</strong> ({itemToDelete.area})? Zona ini akan langsung hilang dari carousel Explore Zona.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-[#ded7cb] bg-white text-stone-700 hover:bg-stone-100 font-semibold uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold uppercase tracking-wider cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
