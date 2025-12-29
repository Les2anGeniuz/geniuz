'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Bell, BookOpen, FileText, PlayCircle, CheckCircle, X } from 'lucide-react';
import YouTube from 'react-youtube';

import Sidebar from '../../../../components/dashboardLayout/sidebar';
import { supabase as supabaseClient } from '../../../../../lib/supabaseClient';

export default function DetailMateriPage({ params }: { params: Promise<{ idFakultas: string, idKelas: string, idMateri: string }> }) {
  const resolvedParams = use(params);
  const { idFakultas, idKelas, idMateri } = resolvedParams;

  const [materi, setMateri] = useState<any>(null);
  const [allMateri, setAllMateri] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number>(19); // Sesuaikan dengan ID user login
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Helper untuk mendapatkan ID YouTube dari URL
  const getYouTubeID = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Ambil Detail Materi
        const { data: currentMateri } = await supabaseClient
          .from('Materi')
          .select('*')
          .eq('id_Materi', idMateri)
          .single();
        
        if (currentMateri) setMateri(currentMateri);

        // 2. Ambil Semua Materi dalam Kelas yang sama
        const { data: listMateri } = await supabaseClient
          .from('Materi')
          .select('*')
          .eq('id_Kelas', idKelas);

        if (listMateri) setAllMateri(listMateri);

        // 3. Cek apakah materi ini sudah pernah diselesaikan
        const { data: logProgress } = await supabaseClient
          .from('Progress_Materi')
          .select('*')
          .eq('id_User', userId)
          .eq('id_Materi', idMateri)
          .maybeSingle();
        
        if (logProgress) setIsCompleted(true);

      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idMateri, idKelas, userId]);

  // FUNGSI UTAMA: Update Progress & Munculkan Pop-up
  const handleProgress = async () => {
    if (!userId || isCompleted) return;

    try {
      console.log("Menyimpan progres...");

      // A. Simpan ke Progress_Materi
      const { error: logError } = await supabaseClient
        .from('Progress_Materi')
        .upsert({ 
          id_User: userId, 
          id_Materi: idMateri, 
          sudah_tonton: true 
        }, { onConflict: 'id_User, id_Materi' });

      if (logError) throw logError;

      // B. Hitung jumlah materi selesai di kelas ini
      const { data: listSelesai, error: countError } = await supabaseClient
        .from('Progress_Materi')
        .select('id_Materi, Materi!inner(id_Kelas)')
        .eq('id_User', userId)
        .eq('Materi.id_Kelas', idKelas);

      if (countError) throw countError;
      const jumlahSelesai = listSelesai?.length || 0;

      // C. Update tabel rekap Progress
      const { data: progRow, error: fetchError } = await supabaseClient
        .from('Progress')
        .select('Total_tugas')
        .eq('id_User', userId)
        .eq('id_Kelas', idKelas)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (progRow) {
        const total = progRow.Total_tugas || 1;
        const persen = (jumlahSelesai / total) * 100;

        await supabaseClient
          .from('Progress')
          .update({
            "Tugas_Selesai": jumlahSelesai,
            "Prsentase_Progress": Math.min(Math.round(persen), 100),
            "Last_update": new Date().toISOString()
          })
          .eq('id_User', userId)
          .eq('id_Kelas', idKelas);
      }

      setIsCompleted(true);
      setShowSuccessPopup(true); // Munculkan pop-up sukses
      
      // Sembunyikan otomatis setelah 4 detik
      setTimeout(() => setShowSuccessPopup(false), 4000);

    } catch (err: any) {
      console.error("Gagal update progres:", err.message);
    }
  };

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat materi...</div>;
  if (!materi) return notFound();

  const tipe = (materi.tipe_konten || '').toUpperCase();
  const isVideo = tipe === 'VIDEO';
  const ytID = getYouTubeID(materi.link_konten);

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen text-gray-900 font-sans relative">
      <Sidebar />
      <div className="flex-1 ml-64">
        
        {/* HEADER */}
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Link href={`/Kelas/${idFakultas}/${idKelas}`} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">
              Materi: <span className="font-normal text-gray-500">{materi.judul_materi}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isCompleted && (
              <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-wider">
                <CheckCircle size={14} /> Selesai Dipelajari
              </div>
            )}
            <Bell size={22} className="text-gray-400 cursor-pointer" />
          </div>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-12 gap-8 items-start">
            
            <section className="col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {isVideo ? (
                  <div className="aspect-video bg-black">
                    {ytID ? (
                      <YouTube
                        videoId={ytID}
                        onEnd={handleProgress}
                        opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0, rel: 0 } }}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white italic">Video tidak ditemukan</div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-[#064479] to-[#0a66b5] flex flex-col items-center justify-center p-8 text-white">
                     {tipe === 'TEKS CATATAN' ? <BookOpen size={48} className="mb-4 opacity-80" /> : <FileText size={48} className="mb-4 opacity-80" />}
                     <h2 className="text-2xl font-bold uppercase tracking-wider">
                        {tipe === 'TEKS CATATAN' ? 'Catatan Belajar' : 'Rangkuman Materi'}
                     </h2>
                     {!isCompleted && (
                        <button 
                          onClick={handleProgress}
                          className="mt-6 bg-white text-[#064479] hover:bg-gray-100 px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
                        >
                          Selesai Membaca
                        </button>
                     )}
                  </div>
                )}
                
                <div className="p-8">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest mb-4 inline-block ${isVideo ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {tipe || "UMUM"}
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{materi.judul_materi}</h2>
                  <hr className="mb-6 border-gray-100" />
                  <div className="prose prose-blue max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
                      {materi.deskripsi || "Isi materi belum tersedia."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="col-span-4 space-y-4 sticky top-28">
              <h3 className="text-lg font-bold text-gray-800">Daftar Materi</h3>
              <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
                {allMateri.map((item) => {
                  const ytId = getYouTubeID(item.link_konten);
                  const itemTipe = (item.tipe_konten || '').toUpperCase();
                  const isItemVideo = itemTipe === 'VIDEO';
                  
                  const thumb = (isItemVideo && ytId)
                      ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` 
                      : `https://placehold.co/300x168/064479/white?text=${itemTipe}`;
                  
                  return (
                    <Link 
                      key={item.id_Materi} 
                      href={`/Kelas/${idFakultas}/${idKelas}/${item.id_Materi}`}
                      className={`group bg-white rounded-xl border p-3 shadow-sm hover:border-blue-300 transition-all ${item.id_Materi.toString() === idMateri ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/30' : 'border-gray-100'}`}
                    >
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                        <Image src={thumb} alt="thumb" fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        {isItemVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <PlayCircle className="text-white opacity-80" size={30} />
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{item.judul_materi}</h4>
                    </Link>
                  );
                })}
              </div>
            </aside>
          </div>
        </main>

        {/* POP-UP NOTIFIKASI SUKSES */}
        {showSuccessPopup && (
          <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="bg-[#064479] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400/30 min-w-[300px]">
              <div className="bg-green-400 p-2 rounded-full shadow-inner">
                <CheckCircle size={24} className="text-[#064479]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Wah, keren banget!</p>
                <p className="text-[11px] opacity-80">Materi ini sudah selesai kamu pelajari. +1 Progres!</p>
              </div>
              <button 
                onClick={() => setShowSuccessPopup(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} className="opacity-50 hover:opacity-100" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}