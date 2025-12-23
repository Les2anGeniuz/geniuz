'use client';

import { useState, useEffect, use } from 'react';
import Sidebar from '../../components/Kelas2/sidebar';
import MateriCard from '../../components/Kelas2/Materi';
import TugasCard from '../../components/Kelas2/Tugas';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';

export default function HalamanKelasDinamis({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id; 

  const [searchTerm, setSearchTerm] = useState("");
  const [kelasData, setKelasData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // GANTI http://localhost:5000 dengan URL/Port Backend Express kamu
        const response = await fetch(`http://localhost:5000/api/kelas/${id}`);
        
        if (!response.ok) throw new Error("Gagal mengambil data kelas");
        
        const json = await response.json();
        setKelasData(json.data); // json.data berasal dari res.status(200).json({ data })

        // Ambil data User (Sesuaikan endpointnya)
        const userRes = await fetch('http://localhost:5000/api/profile');
        if (userRes.ok) {
          const userJson = await userRes.json();
          setUserData(userJson.data); 
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat data kelas...</div>;
  if (!kelasData) return <div className="p-10 text-center">Kelas tidak ditemukan.</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <p className="text-sm text-gray-500 font-medium">Hai, {userData?.nama || "Pelajar"}!</p>
            <h1 className="text-2xl font-bold text-gray-900">{kelasData.nama_kelas}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="search" 
                placeholder="Cari materi..." 
                className="border rounded-full py-2 px-4 pl-10 text-sm w-72 focus:outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button className="text-gray-500"><Bell size={22} /></button>
            <Image 
              src={userData?.photo_url || "https://placehold.co/32x32"} 
              alt="Avatar" width={32} height={32} className="rounded-full" 
            />
          </div>
        </header>

        <main className="p-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="mb-4 text-gray-600">{kelasData.deskripsi}</p>
            
            <div className="flex gap-8">
              {/* SEKSI MATERI */}
              <div className="flex-1 space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Materials</h3>
                {kelasData.Materi?.filter((m: any) => m.judul_materi.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((materi: any) => (
                    <MateriCard 
                      key={materi.id_Materi}
                      id={String(materi.id_Materi)}
                      title={materi.judul_materi}
                      date={materi.Tanggal_tayang}
                      thumbnailUrl={materi.thumbnail_url || 'https://placehold.co/200x112'}
                      tags={[materi.tipe_konten?.toUpperCase() || 'MATERI']}
                    />
                ))}
              </div>

              {/* SEKSI TUGAS */}
              <div className="w-80 space-y-4 border-l pl-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tugas</h3>
                {kelasData.Tugas?.map((tugas: any) => (
                  <TugasCard 
                    key={tugas.id_Tugas} 
                    id={String(tugas.id_Tugas)}
                    title={tugas.judul_tugas} 
                    dueDate={tugas.tenggat_waktu} 
                    status={tugas.status === 'TELAH' ? 'TELAH' : 'BELUM'} 
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}