// Lokasi file ini: app/kelas/[idKelas]/page.tsx

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Search, Bell, ChevronDown } from 'lucide-react';

// 1. Import Komponen UI
import Sidebar from '../../../components/Kelas2/sidebar';
import MateriCard, { MateriCardProps } from '../../../components/Kelas2/Materi';
import TugasCard, { TugasCardProps } from '../../../components/Kelas2/Tugas';

// 2. Import Supabase Client
// Menggunakan alias 'supabaseClient' sesuai permintaan Anda
import { supabase as supabaseClient } from '../../../lib/supabaseClient';

// --- DEFINISI TIPE DATA ---

interface HalamanKelasDinamisProps {
  params: {
    idKelas: string;
  };
}

// Tipe data mentah dari Database (Supabase)
interface MateriItemDB {
  id_Materi: number;
  judul_materi: string;
  deskripsi?: string;
  tipe_konten?: string;
  link_konten?: string;
  Tanggal_tayang: string;
  thumbnail_url?: string;
  urutan?: number;
}

interface TugasItemDB {
  id_Tugas: number;
  judul_tugas: string;
  tenggat_waktu: string;
  status: string;
}

interface KelasDataDB {
  id_Kelas: number;
  nama_kelas: string;
  Materi: MateriItemDB[]; // Relasi
  Tugas: TugasItemDB[];   // Relasi
}

// --- KOMPONEN UTAMA ---

export default async function HalamanKelasDinamis({ params }: HalamanKelasDinamisProps) {
  // 1. Ambil ID dari params
  const { idKelas } = params;
  const id = Number(idKelas);

  // Validasi: Jika ID bukan angka, return 404
  if (isNaN(id)) {
    notFound();
  }

  // 2. Query ke Supabase
  // Pastikan relasi 'Materi' dan 'Tugas' (Foreign Keys) sudah benar di database
  const { data: kelasArray, error } = await supabaseClient
    .from('Kelas')
    .select(`
      id_Kelas, 
      nama_kelas, 
      Materi (
        id_Materi, 
        judul_materi, 
        deskripsi, 
        tipe_konten, 
        link_konten, 
        Tanggal_tayang, 
        thumbnail_url, 
        urutan
      ), 
      Tugas (
        id_Tugas, 
        judul_tugas, 
        tenggat_waktu, 
        status
      )
    `)
    .eq('id_Kelas', id);

  // 3. Error Handling
  if (error) {
    console.error("Supabase error:", error.message);
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        <h1>Terjadi error saat mengambil data. Silakan cek konsol.</h1>
      </div>
    );
  }

  // 4. Cek apakah data ditemukan
  if (!kelasArray || kelasArray.length === 0) {
    notFound();
  }

  // Ambil item pertama karena .eq('id_Kelas', id) seharusnya unik
  const kelasData = kelasArray[0] as unknown as KelasDataDB;

  // 5. Mapping Data (Database -> UI Props)

  // Mapping Materi
  const materiData: MateriCardProps[] = (kelasData.Materi || []).map((item) => {
    const dynamicTags: string[] = [];

    if (item.tipe_konten) dynamicTags.push(item.tipe_konten.toUpperCase());
    if (item.urutan) dynamicTags.push(`PERTEMUAN - ${item.urutan}`);

    // Logika Tanggal Tayang
    try {
      const tanggalTayang = new Date(item.Tanggal_tayang);
      const hariIni = new Date();
      if (tanggalTayang <= hariIni) {
        dynamicTags.push("TAYANG");
      }
    } catch (err) {
      console.error("Format tanggal salah:", item.Tanggal_tayang);
    }

    return {
      id: String(item.id_Materi),
      title: item.judul_materi,
      date: item.Tanggal_tayang, // Pastikan format string tanggal sesuai keinginan UI
      thumbnailUrl: item.thumbnail_url || 'https://placehold.co/200x112/E0E0E0/B0B0B0',
      tags: dynamicTags
    };
  });

  // Mapping Tugas
  const tugasData: TugasCardProps[] = (kelasData.Tugas || []).map((item) => ({
    id: String(item.id_Tugas),
    title: item.judul_tugas,
    dueDate: item.tenggat_waktu,
    status: (item.status === 'TELAH' ? 'TELAH' : 'BELUM') as 'TELAH' | 'BELUM'
  }));

  // 6. Render UI
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-semibold text-gray-900">
            {kelasData.nama_kelas}
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="search" 
                placeholder="Search for Trainings" 
                className="border rounded-full py-2 px-4 pl-10 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 border rounded-full py-2 px-4 hover:bg-gray-100 transition">
              Enrollment Status
              <ChevronDown size={16} />
            </button>
            
            <button className="text-gray-500 hover:text-gray-800 transition">
              <Bell size={22} />
            </button>
            
            <button>
              <Image 
                src="https://placehold.co/32x32/E0E0E0/B0B0B0?text=MA" 
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            </button>
          </div>
        </header>

        {/* Konten Utama */}
        <div className="flex p-6 gap-6 items-start">
          
          {/* Kolom Kiri: Materials List */}
          <section className="flex-grow w-full min-w-0">
            <h2 className="text-2xl font-semibold mb-5">Materials</h2>
            
            {/* List Materi */}
            <div className="space-y-5">
              {materiData.length > 0 ? (
                materiData.map((materi) => (
                  <MateriCard 
                    key={materi.id} 
                    {...materi}
                  />
                ))
              ) : (
                <p className="text-gray-500">Belum ada materi untuk kelas ini.</p>
              )}
            </div>
          </section>
          
          {/* Kolom Kanan: Tugas List (Sticky) */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <h2 className="text-2xl font-semibold mb-5">Tugas</h2>
              <div className="flex flex-col gap-4">
                {tugasData.length > 0 ? (
                  tugasData.map((tugas) => (
                    <TugasCard 
                      key={tugas.id}
                      {...tugas}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Tidak ada tugas aktif.</p>
                )}
              </div>
            </div>
          </aside>

        </div>

        {/* Footer */}
        <footer className="text-center p-6 border-t border-gray-200 mt-10">
          <p className="text-sm text-gray-500">
            © Copyright 2025, Geniuz. All Rights Reserved
          </p>
        </footer>

      </div>
    </div>
  );
}