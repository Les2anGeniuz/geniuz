"use client";

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import SidebarAdmin from "../../../../components/layouts/sidebarAdmin";
import Navbar from "../../../../components/layouts/navbarAdmin";

import { use } from 'react';

export default function AdminKelasDetail({ params }: { params: Promise<{ idFakultas: string, idKelas: string }> }) {
  const { idFakultas, idKelas } = use(params);
  // Only declare router once
  const router = useRouter();
  const [kelasData, setKelasData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'SEMUA' | 'TELAH' | 'BELUM'>('SEMUA');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        if (!token) return;
        const res = await fetch(`/api/admin/kelas/${idKelas}` , {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok && json.data) setKelasData(json.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idKelas]);

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat data kelas...</div>;

  if (!kelasData) return notFound();

  // Debug: show raw data if materi/tugas is empty
  const isEmpty = (!kelasData.Materi || kelasData.Materi.length === 0) && (!kelasData.Tugas || kelasData.Tugas.length === 0);
  if (isEmpty) {
    return (
      <div className="p-10 text-center text-sm">
        <div className="mb-4">Tidak ada data materi atau tugas untuk kelas ini.</div>
        <pre className="bg-gray-100 rounded p-4 text-left overflow-x-auto text-xs max-w-2xl mx-auto">{JSON.stringify(kelasData, null, 2)}</pre>
      </div>
    );
  }

  const filteredMateri = (kelasData.Materi || []).filter((item: any) =>
    item.judul_materi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTugas = (kelasData.Tugas || []).filter((tugas: any) => {
    const isSubmitted = tugas.Pengumpulan_Tugas && tugas.Pengumpulan_Tugas.length > 0;
    const statusTugas = isSubmitted ? 'TELAH' : 'BELUM';
    if (taskFilter === 'SEMUA') return true;
    return statusTugas === taskFilter;
  });

  // Helper untuk ambil ID YouTube
  function getYouTubeID(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen text-gray-900">
      <SidebarAdmin />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />
        <main className="p-8 pt-24">
          <button
            className="mb-6 px-4 py-2 bg-[#002D5B] text-white rounded hover:bg-[#17457b] text-sm"
            onClick={() => router.back()}
          >
            ← Kembali ke Manajemen Kelas
          </button>
          {/* Judul Kelas */}
          <div className="mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#002D5B]">{kelasData.nama_kelas}</h1>
          </div>
          {/* Info Kelas */}
          <div className="mb-8">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:gap-8">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-2">{kelasData.deskripsi || "Tidak ada deskripsi"}</div>
                <div className="flex flex-wrap gap-4 text-sm mt-2">
                  <span className="bg-[#F4F7FC] px-3 py-1 rounded-full text-[#002D5B] font-semibold">Fakultas: {kelasData.Fakultas?.nama_fakultas || "-"}</span>
                  <span className="bg-[#F4F7FC] px-3 py-1 rounded-full text-[#002D5B] font-semibold">Mentor: {kelasData.Mentor?.nama_mentor || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Filter & Search */}
          <div className="flex items-center gap-4 mb-6">
            <input
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#002D5B]/20 focus:border-[#002D5B]"
              placeholder="Cari materi"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm text-gray-600 font-medium"
              >
                <span>Filter Tugas</span>
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-2">
                  {['SEMUA', 'TELAH', 'BELUM'].map((val) => (
                    <button
                      key={val}
                      onClick={() => { setTaskFilter(val as any); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      {val === 'SEMUA' ? 'Semua' : val === 'TELAH' ? 'Selesai' : 'Belum Selesai'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Materi & Tugas */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Materi */}
            <section className="md:col-span-8">
              <h2 className="text-xl font-bold text-[#002D5B] mb-4">Daftar Materi</h2>
              <div className="space-y-3">
                {filteredMateri.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm border rounded-xl bg-white">Tidak ada materi</div>
                ) : filteredMateri.map((materi: any) => {
                  const ytId = getYouTubeID(materi.link_konten);
                  const thumb = ytId
                    ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                    : (materi.thumbnail_url || 'https://placehold.co/200x112');
                  return (
                    <div key={materi.id_Materi} className="flex gap-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                      <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {thumb ? (
                          <img src={thumb} alt={materi.judul_materi} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-base text-[#002D5B]">{materi.judul_materi}</div>
                          <div className="text-xs text-gray-500 mb-1">{materi.tipe_konten?.toUpperCase() || 'MATERI'} | Pertemuan {materi.urutan || '-'}</div>
                          <div className="text-xs text-gray-400">{materi.Tanggal_tayang ? `Tayang: ${materi.Tanggal_tayang}` : ''}</div>
                          {ytId && (
                            <a href={`https://youtube.com/watch?v=${ytId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs mt-1 inline-block">Lihat Video YouTube</a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            {/* Tugas */}
            <aside className="md:col-span-4">
              <h2 className="text-xl font-bold text-[#002D5B] mb-4">Daftar Tugas</h2>
              <div className="space-y-3">
                {filteredTugas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm border rounded-xl bg-white">Tidak ada tugas</div>
                ) : filteredTugas.map((tugas: any) => (
                  <div key={tugas.id_Tugas} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <div className="font-bold text-[#002D5B]">{tugas.judul_tugas}</div>
                    <div className="text-xs text-gray-500 mb-1">Tenggat: {tugas.tenggat_waktu || '-'}</div>
                    <div className="text-xs text-gray-400 mb-2">Status: {(tugas.Pengumpulan_Tugas && tugas.Pengumpulan_Tugas.length > 0) ? 'Sudah Dikumpulkan' : 'Belum'}</div>
                    <button
                      className="mt-2 px-3 py-1 bg-[#002D5B] text-white rounded text-xs hover:bg-[#17457b]"
                      onClick={() => router.push(`/admin/tugas/${tugas.id_Tugas}/pengumpulan`)}
                    >
                      Lihat Pengumpulan
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
        <footer className="p-8 text-center text-gray-500 text-sm border-t border-gray-100 mt-12 bg-white">
          © Copyright 2025, Geniuz. All Rights Reserved
        </footer>
      </div>
    </div>
  );
}
