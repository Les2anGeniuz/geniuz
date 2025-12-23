<<<<<<< HEAD
'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Search, Bell, ChevronDown, CheckCircle, Clock, ListFilter } from 'lucide-react';

import Sidebar from '../../../components/Kelas2/sidebar';
import MateriCard from '../../../components/Kelas2/Materi';
import TugasCard from '../../../components/Kelas2/Tugas';
import { supabase as supabaseClient } from '../../../lib/supabaseClient';

export default function HalamanKelasDinamis({ params }: { params: Promise<{ idKelas: string }> }) {
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

        // Tips: Pastikan kolom status di DB memang isinya 'TELAH' atau 'BELUM'
        // Jika menggunakan tabel relasi 'Pengumpulan', logic fetch-nya perlu join ke sana
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idKelas]);

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat data kelas...</div>;
  if (!kelasData) return notFound();

  // FILTER LOGIC
  const filteredMateri = (kelasData.Materi || []).filter((item: any) =>
    item.judul_materi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTugas = (kelasData.Tugas || []).filter((tugas: any) => {
    // Memastikan case-insensitive atau sesuaikan dengan value di Supabase
    const statusTugas = (tugas.status || 'BELUM').toUpperCase();
    if (taskFilter === 'SEMUA') return true;
    return statusTugas === taskFilter;
  });

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* HEADER - Disesuaikan dengan Wireframe */}
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Kelas <span className="font-normal text-gray-500">{kelasData.nama_kelas}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="search" 
                placeholder="Search for Trainings" 
                className="border border-gray-200 rounded-lg py-2 pl-11 pr-4 text-sm w-80 focus:ring-1 focus:ring-blue-500 outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* DROPDOWN FILTER */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2 bg-white hover:bg-gray-50"
              >
                <span>Enrollment Status</span>
                <ChevronDown size={16} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  {['SEMUA', 'TELAH', 'BELUM'].map((f) => (
                    <button 
                      key={f}
                      onClick={() => { setTaskFilter(f as any); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-gray-700 capitalize"
                    >
                      {f === 'SEMUA' ? 'Semua Status' : f === 'TELAH' ? 'Selesai' : 'Belum Selesai'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Bell size={20} className="text-gray-400 cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-red-500 overflow-hidden border border-gray-200">
                <Image src="https://placehold.co/32x32/orange/white?text=User" alt="User" width={32} height={32} />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT - Grid Layout sesuai Wireframe */}
        <main className="p-8">
          <div className="grid grid-cols-12 gap-8">
            
            {/* SECTION MATERIALS (Kiri - Lebih Lebar) */}
            <section className="col-span-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Materials</h2>
              <div className="grid grid-cols-1 gap-4">
                {filteredMateri.map((materi: any) => (
                  <MateriCard 
                    key={materi.id_Materi}
                    id={String(materi.id_Materi)}
                    title={materi.judul_materi}
                    date={materi.Tanggal_tayang}
                    thumbnailUrl={materi.thumbnail_url}
                    tags={["MATERI", "TAYANG"]}
                  />
                ))}
              </div>
            </section>

            {/* SECTION TUGAS (Kanan) */}
            <aside className="col-span-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tugas</h2>
              <div className="space-y-4">
                {filteredTugas.length > 0 ? (
                  filteredTugas.map((tugas: any) => (
                    <TugasCard 
                      key={tugas.id_Tugas}
                      id={String(tugas.id_Tugas)}
                      title={tugas.judul_tugas}
                      dueDate={tugas.tenggat_waktu}
                      status={tugas.status} 
                    />
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    Tidak ada tugas ditemukan
                  </div>
                )}
              </div>
            </aside>

          </div>
        </main>
        
        <footer className="p-8 text-center text-gray-400 text-sm border-t border-gray-100 mt-10">
          © Copyright 2025, Geniuz. All Rights Reserved
=======
import { notFound } from "next/navigation";
import Image from "next/image";
import { Search, Bell, ChevronDown } from "lucide-react";

import Sidebar from "../../../components/Kelas2/sidebar";
import MateriCard, { MateriCardProps } from "../../../components/Kelas2/Materi";
import TugasCard, { TugasCardProps } from "../../../components/Kelas2/Tugas";

import { supabase as supabaseClient } from "../../../../lib/supabaseClient";

interface HalamanKelasDinamisProps {
  params: Promise<{
    idFakultas: string;
    idKelas: string;
  }>;
}

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
  Materi: MateriItemDB[];
  Tugas: TugasItemDB[];
}

export default async function HalamanKelasDinamis({
  params,
}: HalamanKelasDinamisProps) {
  // ✅ FIX UTAMA (WAJIB di Next.js 15)
  const { idFakultas, idKelas } = await params;

  const id = Number(idKelas);
  if (Number.isNaN(id)) notFound();

  const { data: kelasArray, error } = await supabaseClient
    .from("Kelas")
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
    .eq("id_Kelas", id);

  if (error) {
    console.error("Supabase error:", error.message);
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        <h1>Terjadi error saat mengambil data. Silakan cek konsol.</h1>
      </div>
    );
  }

  if (!kelasArray || kelasArray.length === 0) notFound();

  const kelasData = kelasArray[0] as KelasDataDB;

  const materiData: MateriCardProps[] = (kelasData.Materi || []).map((item) => {
    const dynamicTags: string[] = [];

    if (item.tipe_konten) dynamicTags.push(item.tipe_konten.toUpperCase());
    if (item.urutan) dynamicTags.push(`PERTEMUAN - ${item.urutan}`);

    try {
      const tanggalTayang = new Date(item.Tanggal_tayang);
      if (tanggalTayang <= new Date()) dynamicTags.push("TAYANG");
    } catch {
      console.error("Format tanggal salah:", item.Tanggal_tayang);
    }

    return {
      id: String(item.id_Materi),
      title: item.judul_materi,
      date: item.Tanggal_tayang,
      thumbnailUrl:
        item.thumbnail_url ||
        "https://placehold.co/200x112/E0E0E0/B0B0B0",
      tags: dynamicTags,
    };
  });

  const tugasData: TugasCardProps[] = (kelasData.Tugas || []).map((item) => ({
    id: String(item.id_Tugas),
    title: item.judul_tugas,
    dueDate: item.tenggat_waktu,
    status: (item.status === "TELAH" ? "TELAH" : "BELUM") as
      | "TELAH"
      | "BELUM",
  }));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
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
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
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

        <div className="flex p-6 gap-6 items-start">
          <section className="flex-grow w-full min-w-0">
            <h2 className="text-2xl font-semibold mb-5">Materials</h2>
            <div className="space-y-5">
              {materiData.length > 0 ? (
                materiData.map((materi) => (
                  <MateriCard key={materi.id} {...materi} />
                ))
              ) : (
                <p className="text-gray-500">
                  Belum ada materi untuk kelas ini.
                </p>
              )}
            </div>
          </section>

          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <h2 className="text-2xl font-semibold mb-5">Tugas</h2>
              <div className="flex flex-col gap-4">
                {tugasData.length > 0 ? (
                  tugasData.map((tugas) => (
                    <TugasCard key={tugas.id} {...tugas} />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Tidak ada tugas aktif.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>

        <footer className="text-center p-6 border-t border-gray-200 mt-10">
          <p className="text-sm text-gray-500">
            © Copyright 2025, Geniuz. All Rights Reserved
          </p>
>>>>>>> 9cb69517625a7a3dd8d52d7a4e46047a5a8eb4a7
        </footer>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 9cb69517625a7a3dd8d52d7a4e46047a5a8eb4a7
