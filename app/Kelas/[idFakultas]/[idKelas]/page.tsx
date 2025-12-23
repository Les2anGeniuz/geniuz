//path file ini : geniuz/app/Kelas/[idFakultas]/[idKelas]/page.tsx

'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Search, Bell, ChevronDown, CheckCircle, Clock, ListFilter } from 'lucide-react';

import Sidebar from '../../../components/dashboardLayout/sidebar';
import MateriCard, { MateriCardProps } from '../../../components/Kelas2/Materi';
import TugasCard, { TugasCardProps } from '../../../components/Kelas2/Tugas';
import { supabase as supabaseClient } from '../../../lib/supabaseClient';

export default function HalamanKelasDinamis({ params }: { params: Promise<{ idKelas: string }> }) {
  const resolvedParams = use(params);
  const idKelas = resolvedParams.idKelas;

  const [kelasData, setKelasData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- STATE UNTUK FILTER TUGAS ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'SEMUA' | 'TELAH' | 'BELUM'>('SEMUA');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = Number(idKelas);
        if (isNaN(id)) return;
        const { data, error } = await supabaseClient
          .from('Kelas')
          .select(`id_Kelas, nama_kelas, Materi (*), Tugas (*)`)
          .eq('id_Kelas', id);
        if (data && data.length > 0) setKelasData(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idKelas]);

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat data kelas...</div>;
  if (!kelasData) return notFound();

  // --- LOGIKA FILTER MATERI ---
  const filteredMateri = (kelasData.Materi || []).filter((item: any) =>
    item.judul_materi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOGIKA FILTER TUGAS ---
  const filteredTugas = (kelasData.Tugas || []).filter((tugas: any) => {
  // 1. Kita paksa status yang null/undefined menjadi string 'BELUM'
  // 2. Gunakan .toUpperCase() agar pembandingan tidak error karena perbedaan huruf besar/kecil
  const statusTugas = (tugas.status || 'BELUM').toUpperCase();

  // Jika filter adalah 'SEMUA', tampilkan semuanya
  if (taskFilter === 'SEMUA') return true;
  
  // Cocokkan status yang sudah diproses tadi dengan state filter
  return statusTugas === taskFilter;
});

  const tugasCards: TugasCardProps[] = filteredTugas.map((item: any) => ({
    id: String(item.id_Tugas),
    title: item.judul_tugas,
    dueDate: item.tenggat_waktu,
    status: item.status as 'TELAH' | 'BELUM'
  }));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{kelasData.nama_kelas}</h1>
            <p className="text-xs text-gray-500 font-medium">Semester Genap 2024/2025</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="search" 
                placeholder="Cari materi..." 
                className="border border-gray-200 rounded-full py-2 px-4 pl-10 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            {/* FILTER TUGAS (Enrollment Status yang sudah diperbaiki) */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 text-sm font-semibold border rounded-full py-2 px-4 transition-all duration-200 ${
                  taskFilter === 'SEMUA' ? 'bg-white text-gray-700 border-gray-200' :
                  taskFilter === 'TELAH' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                <ListFilter size={16} />
                <span>
                  {taskFilter === 'SEMUA' && 'Semua Tugas'}
                  {taskFilter === 'TELAH' && 'Telah Selesai'}
                  {taskFilter === 'BELUM' && 'Belum Selesai'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter Status Tugas</div>
                    
                    <button 
                      onClick={() => { setTaskFilter('SEMUA'); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between group"
                    >
                      <span className={taskFilter === 'SEMUA' ? 'text-blue-600 font-bold' : 'text-gray-600'}>Tampilkan Semua</span>
                      {taskFilter === 'SEMUA' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>

                    <button 
                      onClick={() => { setTaskFilter('TELAH'); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle size={14} />
                        <span className={taskFilter === 'TELAH' ? 'font-bold' : ''}>Telah Selesai</span>
                      </div>
                      {taskFilter === 'TELAH' && <div className="w-1.5 h-1.5 rounded-full bg-green-600" />}
                    </button>

                    <button 
                      onClick={() => { setTaskFilter('BELUM'); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 text-red-700">
                        <Clock size={14} />
                        <span className={taskFilter === 'BELUM' ? 'font-bold' : ''}>Belum Selesai</span>
                      </div>
                      {taskFilter === 'BELUM' && <div className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <button className="text-gray-500 hover:text-gray-800 transition"><Bell size={22} /></button>
            <Image src="https://placehold.co/32x32/E0E0E0/B0B0B0?text=MA" alt="Avatar" width={32} height={32} className="rounded-full border border-gray-200" />
          </div>
        </header>

        <main className="flex p-6 gap-8 items-start">
          <section className="flex-grow min-w-0">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
               Materi Pembelajaran
               <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{filteredMateri.length}</span>
            </h2>
            <div className="space-y-5">
              {filteredMateri.length > 0 ? (
                filteredMateri.map((materi: any) => (
                  <MateriCard 
                    key={materi.id_Materi}
                    id={String(materi.id_Materi)}
                    title={materi.judul_materi}
                    date={materi.Tanggal_tayang}
                    thumbnailUrl={materi.thumbnail_url || 'https://placehold.co/200x112'}
                    tags={[materi.tipe_konten?.toUpperCase(), "TAYANG"]}
                  />
                ))
              ) : (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center">
                   <p className="text-gray-400 text-sm">Materi "{searchTerm}" tidak ditemukan.</p>
                </div>
              )}
            </div>
          </section>
          
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-28">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Tugas
                <span className={`text-xs px-2 py-1 rounded-full ${
                  taskFilter === 'TELAH' ? 'bg-green-100 text-green-600' : 
                  taskFilter === 'BELUM' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tugasCards.length}
                </span>
              </h2>
              <div className="flex flex-col gap-4">
                {tugasCards.length > 0 ? (
                  tugasCards.map((tugas) => <TugasCard key={tugas.id} {...tugas} />)
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 text-xs italic">
                      Tidak ada tugas dengan status ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}