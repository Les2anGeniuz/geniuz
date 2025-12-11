// Lokasi file ini: app/kelas/[idKelas]/page.tsx

// 1. Ambil "cetakan" dari file komponenmu
import Sidebar from '../../components/Kelas2/sidebar';
import MateriCard from '../../components/Kelas2/Materi';
import TugasCard from  '../../components/Kelas2/Tugas';
import { Search, Bell, ChevronDown } from 'lucide-react';
import Image from 'next/image';

// Perbaikan Import:
// Karena file sumber mengekspor objek Supabase yang sudah jadi (dengan nama 'supabase'), 
// kita harus menggunakannya secara langsung.
// Menggunakan alias 'supabaseClient' agar jelas ini adalah objek client, bukan fungsi.
import { supabase as supabaseClient } from '../../lib/supabaseClient';

// 3. Impor "Kontrak" Data
import { MateriCardProps } from '../../components/Kelas2/Materi';
import { TugasCardProps } from '../../components/Kelas2/Tugas';

import { notFound } from 'next/navigation'; // Diperlukan untuk validasi

interface HalamanKelasDinamisProps {
  params: {
    idKelas: string;
  };
}

interface MateriItem {
  id_Materi: number;
  judul_materi: string;
  deskripsi?: string;
  tipe_konten?: string;
  link_konten?: string;
  Tanggal_tayang: string;
  thumbnail_url?: string;
  urutan?: number;
}

interface TugasItem {
  id_Tugas: number;
  judul_tugas: string;
  tenggat_waktu: string;
  status: string;
}

interface KelasData {
  id_Kelas: number;
  nama_kelas: string;
  Materi: MateriItem[];
  Tugas: TugasItem[];
}

// 4. Ini adalah Halaman Dinamis kamu
export default async function HalamanKelasDinamis(props: HalamanKelasDinamisProps) {
  const { idKelas } = props.params;
  const id = Number(idKelas); 

  // --- 1. VALIDASI ID ---
  if (isNaN(id)) {
    // Menggunakan notFound() dari Next.js untuk ID yang tidak valid
    notFound();
  }
  
  // --- 2. PANGGIL SUPABASE & AMBIL DATA (FINAL FIX) ---
  // const supabase = await createSupabaseServerClient(); <-- BARIS INI DIHAPUS

  // 💡 PERBAIKAN: Langsung gunakan objek 'supabaseClient' yang diimpor
  //               (alias dari 'supabase') untuk query.
const { data: kelasArray, error } = await supabaseClient 
    .from('Kelas') // Gunakan nama alias 'supabaseClient'
    .select('id_Kelas, nama_kelas, Materi(id_Materi, judul_materi, deskripsi, tipe_konten, link_konten, Tanggal_tayang, thumbnail_url, urutan), Tugas(id_Tugas, judul_tugas, tenggat_waktu, status)')
    .eq('id_Kelas', id);

  if (error) {
  console.error("Supabase error:", error.message);
  return (
    <div className="flex h-screen items-center justify-center">
      <h1>Terjadi error Supabase: Cek konsol server Anda.</h1>
    </div>
  );
}

// Handle jika array kosong (Kelas tidak ditemukan)
if (!kelasArray || kelasArray.length === 0) {
  // Menggunakan notFound() dari Next.js untuk data tidak ditemukan
  notFound();
}

// Ambil data objek tunggal dari elemen pertama array
const kelasData = kelasArray[0] as KelasData;

  // --- 4. "GLUE" CODE: UBAH DATA DB MENJADI PROPS KOMPONEN ---

  const materiData: MateriCardProps[] = kelasData.Materi.map((item: MateriItem) => {
    const dynamicTags: string[] = [];

    if (item.tipe_konten) {
      dynamicTags.push(item.tipe_konten.toUpperCase());
    }

    if (item.urutan) {
      dynamicTags.push(`PERTEMUAN - ${item.urutan}`);
    }

    try {
      const tanggalTayang = new Date(item.Tanggal_tayang);
      const hariIni = new Date();
      if (tanggalTayang <= hariIni) {
        dynamicTags.push("TAYANG");
      }
    } catch (error) {
      console.error("Format tanggal salah:", item.Tanggal_tayang, error);
    }

    return {
      id: String(item.id_Materi),
      title: item.judul_materi,
      date: item.Tanggal_tayang,
      thumbnailUrl: item.thumbnail_url || 'https://placehold.co/200x112/E0E0E0/B0B0B0',
      tags: dynamicTags
    };
  });

  const tugasData: TugasCardProps[] = kelasData.Tugas.map((item: TugasItem) => ({
    id: String(item.id_Tugas),
    title: item.judul_tugas,
    dueDate: item.tenggat_waktu,
    status: (item.status === 'TELAH' ? 'TELAH' : 'BELUM') as 'TELAH' | 'BELUM'
  }));


  // --- 5. RENDER KOMPONEN (JSX) ---
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Tambahkan prop 'activeLink' di sini jika Sidebar membutuhkan penanda aktif */}
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
                className="border rounded-full py-2 px-4 pl-10 text-sm w-72" 
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 border rounded-full py-2 px-4 hover:bg-gray-100">
              Enrollment Status
              <ChevronDown size={16} />
            </button>
            <button className="text-gray-500 hover:text-gray-800">
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

        {/* Area Isi Konten (Materials & Tugas) */}
        <div className="flex p-6 gap-6">
          <section className="flex-grow">
            <h2 className="text-2xl font-semibold mb-5">Materials</h2>
            <div className="space-y-5">
              {materiData.map((materi) => (
                <MateriCard 
                  key={materi.id} 
                  {...materi}
                />
              ))}
            </div>
          </section>
          
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <h2 className="text-2xl font-semibold mb-5">Tugas</h2>
              <div>
                {tugasData.map((tugas) => (
                  <TugasCard 
                    key={tugas.id}
                    {...tugas}
                  />
                ))}
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