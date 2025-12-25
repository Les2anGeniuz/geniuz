'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link'; 
import { Search, ListFilter, ChevronDown } from 'lucide-react';

import Sidebar from '../../../components/dashboardLayout/sidebar';
import Topbar from '../../../components/dashboardLayout/topbar'; 
import MateriCard from '../../../components/Kelas2/Materi';
import TugasCard from '../../../components/Kelas2/Tugas';
import { supabase as supabaseClient } from '../../../lib/supabaseClient';

export default function HalamanKelasDinamis({ params }: { params: Promise<{ idFakultas: string, idKelas: string }> }) {
  const resolvedParams = use(params);
  const idKelas = resolvedParams.idKelas;
  const idFakultas = resolvedParams.idFakultas;

  const [kelasData, setKelasData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'SEMUA' | 'TELAH' | 'BELUM'>('SEMUA');

  const getYouTubeID = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = Number(idKelas);
        if (isNaN(id)) return;

        // ✅ Menambahkan order berdasarkan kolom 'urutan' agar pertemuan tampil berurutan
        const { data, error } = await supabaseClient
          .from('Kelas')
          .select(`
            id_Kelas, 
            nama_kelas, 
            Materi (*), 
            Tugas (
              *,
              Pengumpulan_Tugas (id_User)
            )
          `)
          .eq('id_Kelas', id)
          .order('urutan', { foreignTable: 'Materi', ascending: true }) 
          .single();

        if (error) {
          console.error("Supabase Error:", error.message);
          return;
        }
        
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

  const filteredMateri = (kelasData.Materi || []).filter((item: any) =>
    item.judul_materi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTugas = (kelasData.Tugas || []).filter((tugas: any) => {
    const isSubmitted = tugas.Pengumpulan_Tugas && tugas.Pengumpulan_Tugas.length > 0;
    const statusTugas = isSubmitted ? 'TELAH' : 'BELUM';
    if (taskFilter === 'SEMUA') return true;
    return statusTugas === taskFilter;
  });

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen text-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        
        <Topbar />

        <main className="p-8 pt-24"> 
          {/* Judul Kelas */}
          <div className="mb-8">
             <h1 className="text-3xl font-bold text-gray-900">
               Kelas <span className="font-normal text-gray-500">{kelasData.nama_kelas}</span>
             </h1>
          </div>

          {/* Bar Pencarian & Filter */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="search" 
                placeholder="Search for Trainings" 
                className="w-full border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
               <button 
                 onClick={() => setIsFilterOpen(!isFilterOpen)}
                 className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm text-gray-600 font-medium"
               >
                 <span>Enrollment Status</span>
                 <ChevronDown size={16} />
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

          <div className="grid grid-cols-12 gap-8 items-start">
            {/* MATERIALS SECTION */}
            <section className="col-span-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Materials</h2>
              <div className="space-y-4">
                {filteredMateri.map((materi: any) => {
                  const ytId = getYouTubeID(materi.link_konten);
                  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : (materi.thumbnail_url || 'https://placehold.co/200x112');
                  
                  // ✅ AMBIL TIPE KONTEN ASLI DARI DATABASE
                  const labelTipe = (materi.tipe_konten || "MATERI").toUpperCase();
                  
                  // ✅ AMBIL NOMOR PERTEMUAN DARI KOLOM 'URUTAN'
                  const nomorPertemuan = materi.urutan || "-";
                  const labelPertemuan = `PERTEMUAN - ${nomorPertemuan}`;

                  return (
                    <Link 
                      key={materi.id_Materi} 
                      href={`/Kelas/${idFakultas}/${idKelas}/${materi.id_Materi}`}
                      className="block transition-transform hover:scale-[1.01]"
                    >
                      <MateriCard 
                        id={String(materi.id_Materi)}
                        title={materi.judul_materi}
                        date={materi.Tanggal_tayang}
                        thumbnailUrl={thumb}
                        // ✅ SEKARANG DINAMIS: Menampilkan Tipe, Nomor Pertemuan, dan Status
                        tags={[labelTipe, labelPertemuan, "TAYANG"]} 
                      />
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* TUGAS SECTION */}
            <aside className="col-span-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tugas</h2>
              <div className="flex flex-col gap-4">
                {filteredTugas.map((tugas: any) => {
                  const isSubmitted = tugas.Pengumpulan_Tugas && tugas.Pengumpulan_Tugas.length > 0;
                  return (
                    <Link 
                      key={tugas.id_Tugas} 
                      href={`/Kelas/${idFakultas}/${idKelas}/tugas/${tugas.id_Tugas}`}
                      className="block transition-transform hover:scale-[1.02]"
                    >
                      <TugasCard 
                        id={String(tugas.id_Tugas)}
                        title={tugas.judul_tugas}
                        dueDate={tugas.tenggat_waktu}
                        status={isSubmitted ? 'TELAH' : 'BELUM'} 
                      />
                    </Link>
                  );
                })}
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