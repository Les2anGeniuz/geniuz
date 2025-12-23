<<<<<<< HEAD:app/Kelas/[idKelas]/page.tsx
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
>>>>>>> 9cb69517625a7a3dd8d52d7a4e46047a5a8eb4a7:app/Kelas/[idFakultas]/[idKelas]/page.tsx
    };

<<<<<<< HEAD:app/Kelas/[idKelas]/page.tsx
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat data kelas...</div>;
  if (!kelasData) return <div className="p-10 text-center">Kelas tidak ditemukan.</div>;
=======
  const tugasData: TugasCardProps[] = (kelasData.Tugas || []).map((item) => ({
    id: String(item.id_Tugas),
    title: item.judul_tugas,
    dueDate: item.tenggat_waktu,
    status: (item.status === "TELAH" ? "TELAH" : "BELUM") as
      | "TELAH"
      | "BELUM",
  }));
>>>>>>> 9cb69517625a7a3dd8d52d7a4e46047a5a8eb4a7:app/Kelas/[idFakultas]/[idKelas]/page.tsx

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
<<<<<<< HEAD:app/Kelas/[idKelas]/page.tsx
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
=======

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
>>>>>>> 9cb69517625a7a3dd8d52d7a4e46047a5a8eb4a7:app/Kelas/[idFakultas]/[idKelas]/page.tsx
              />
            </div>
<<<<<<< HEAD:app/Kelas/[idKelas]/page.tsx
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
=======

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
        </footer>
>>>>>>> 9cb69517625a7a3dd8d52d7a4e46047a5a8eb4a7:app/Kelas/[idFakultas]/[idKelas]/page.tsx
      </div>
    </div>
  );
}
