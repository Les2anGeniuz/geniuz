//path file ini : geniuz/app/Kelas/[idFakultas]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Sidebar from '../../components/Kelas2/sidebar';
import MateriCard from '../../components/Kelas2/Materi';
import TugasCard from '../../components/Kelas2/Tugas';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';
// import express from 'express';
// import {getKelasByFakultas} from '../controllers/kelasController.js';

// Pastikan tipe params menggunakan id_Fakultas sesuai nama folder
export default function HalamanKelasDinamis({ params }: { params: Promise<{ idFakultas: string }> }) {
  // Unwrap params menggunakan use()
  const resolvedParams = use(params);
  const idFakultas = resolvedParams.idFakultas; 

  const [searchTerm, setSearchTerm] = useState("");
  const [fakultasData, setFakultasData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil data Fakultas & Kelas (Join di Backend)
        const response = await fetch(`/api/kelas/${idFakultas}`);
        if (!response.ok) throw new Error("Gagal mengambil data fakultas");
        const json = await response.json();
        setFakultasData(json.data);

        // 2. Ambil data User secara dinamis
        const userRes = await fetch('/api/profile');
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
    fetchData();
  }, [idFakultas]);

  if (loading) return <div className="p-10 text-center italic text-gray-500">Menyusun materi fakultas...</div>;
  if (!fakultasData) return <div className="p-10 text-center">Data tidak ditemukan.</div>;

  const filteredMateri = fakultasData.Materi?.filter((m: any) =>
      m.judul_materi.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Header Dinamis */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <p className="text-sm text-gray-500 font-medium">Hai, {userData?.nama || "Pelajar"}!</p>
            <h1 className="text-2xl font-bold text-gray-900">{fakultasData.nama_fakultas}</h1>
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

        <main className="p-6 space-y-12">
          {/* Mapping semua Kelas di bawah Fakultas tersebut */}
          {fakultasData.Kelas?.map((kelas: any) => (
            <div key={kelas.id_Kelas} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                {kelas.nama_kelas}
              </h2>

              <div className="flex gap-8">
                <div className="flex-1 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Materials</h3>
                  {kelas.Materi?.filter((m: any) => m.judul_materi.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((materi: any) => (
                      <MateriCard 
                        key={materi.id_Materi}
                        id={String(materi.id_Materi)} // FIX Garis Merah
                        title={materi.judul_materi}
                        date={materi.Tanggal_tayang}
                        thumbnailUrl={materi.thumbnail_url || 'https://placehold.co/200x112'}
                        tags={[materi.tipe_konten?.toUpperCase() || 'MATERI', 'TAYANG']}
                      />
                  ))}
                </div>

                <div className="w-80 space-y-4 border-l pl-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tugas</h3>
                  {kelas.Tugas?.map((tugas: any) => (
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
          ))}
        </main>
      </div>
    </div>
  );
}