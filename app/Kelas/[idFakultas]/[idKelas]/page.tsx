'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Search, Bell, ChevronDown, CheckCircle, Clock, ListFilter } from 'lucide-react';

import Sidebar from '../../../components/Kelas2/sidebar';
import MateriCard from '../../../components/Kelas2/Materi';
import TugasCard from '../../../components/Kelas2/Tugas';
import { supabase as supabaseClient } from '../../../lib/supabaseClient';

export default function HalamanKelasDinamis({ params }: { params: Promise<{ idFakultas: string, idKelas: string }> }) {
  const resolvedParams = use(params);
  const idKelas = resolvedParams.idKelas;

  const [kelasData, setKelasData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'SEMUA' | 'TELAH' | 'BELUM'>('SEMUA');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = Number(idKelas);
        if (isNaN(id)) return;

        const { data, error } = await supabaseClient
          .from('Kelas')
          .select(`
            id_Kelas, 
            nama_kelas, 
            Materi (*), 
            Tugas (*)
          `)
          .eq('id_Kelas', id)
          .single();

        if (data) setKelasData(data);
      } catch (err) {
        console.error("Fetch Error:", err);
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
    const statusTugas = (tugas.status || 'BELUM').toUpperCase();
    if (taskFilter === 'SEMUA') return true;
    return statusTugas === taskFilter;
  });

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        
        {/* HEADER */}
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Kelas <span className="font-normal text-gray-500">{kelasData.nama_kelas}</span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Semester Genap 2024/2025</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="search" 
                placeholder="Cari materi atau tugas..." 
                className="border border-gray-200 rounded-full py-2 pl-11 pr-4 text-sm w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* DROPDOWN FILTER STATUS */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 text-sm font-semibold border rounded-full py-2 px-4 transition-all ${
                  taskFilter === 'SEMUA' ? 'bg-white text-gray-600 border-gray-200' :
                  taskFilter === 'TELAH' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                <ListFilter size={16} />
                <span>
                  {taskFilter === 'SEMUA' && 'Semua Status'}
                  {taskFilter === 'TELAH' && 'Telah Selesai'}
                  {taskFilter === 'BELUM' && 'Belum Selesai'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter Tugas</div>
                    {[
                      { val: 'SEMUA', label: 'Tampilkan Semua', color: 'text-gray-600', icon: null },
                      { val: 'TELAH', label: 'Telah Selesai', color: 'text-green-700', icon: <CheckCircle size={14}/> },
                      { val: 'BELUM', label: 'Belum Selesai', color: 'text-red-700', icon: <Clock size={14}/> }
                    ].map((item) => (
                      <button 
                        key={item.val}
                        onClick={() => { setTaskFilter(item.val as any); setIsFilterOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between group transition-colors"
                      >
                        <div className={`flex items-center gap-2 ${item.color}`}>
                          {item.icon}
                          <span className={taskFilter === item.val ? 'font-bold' : ''}>{item.label}</span>
                        </div>
                        {taskFilter === item.val && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={22} />
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                <Image src="https://placehold.co/36x36/orange/white?text=MA" alt="User" width={36} height={36} />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-8">
          <div className="grid grid-cols-12 gap-8 items-start">
            
            {/* MATERIALS SECTION */}
            <section className="col-span-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Materials</h2>
                <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-bold">
                  {filteredMateri.length} Materi
                </span>
              </div>
              <div className="space-y-4">
                {filteredMateri.length > 0 ? (
                  filteredMateri.map((materi: any) => (
                    <MateriCard 
                      key={materi.id_Materi}
                      id={String(materi.id_Materi)}
                      title={materi.judul_materi}
                      date={materi.Tanggal_tayang}
                      thumbnailUrl={materi.thumbnail_url || 'https://placehold.co/200x112'}
                      tags={[materi.tipe_konten?.toUpperCase() || "MATERI", "TAYANG"]}
                    />
                  ))
                ) : (
                  <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 text-sm">Tidak ada materi yang ditemukan.</p>
                  </div>
                )}
              </div>
            </section>

            {/* TUGAS SECTION */}
            <aside className="col-span-4 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Tugas</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                   taskFilter === 'TELAH' ? 'bg-green-100 text-green-600' : 
                   taskFilter === 'BELUM' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {filteredTugas.length}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {filteredTugas.length > 0 ? (
                  filteredTugas.map((tugas: any) => (
                    <TugasCard 
                      key={tugas.id_Tugas}
                      id={String(tugas.id_Tugas)}
                      title={tugas.judul_tugas}
                      dueDate={tugas.tenggat_waktu}
                      status={tugas.status === 'TELAH' ? 'TELAH' : 'BELUM'} 
                    />
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 text-xs italic">Tidak ada tugas dengan status ini.</p>
                  </div>
                )}
              </div>
            </aside>

          </div>
        </main>
        
        <footer className="p-8 text-center text-gray-400 text-[11px] font-medium tracking-widest uppercase border-t border-gray-100 mt-12 bg-white">
          © Copyright 2025, Geniuz. All Rights Reserved
        </footer>
      </div>
    </div>
  );
}