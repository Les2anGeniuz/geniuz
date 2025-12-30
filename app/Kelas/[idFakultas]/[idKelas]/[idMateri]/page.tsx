'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, PlayCircle, CheckCircle, X } from 'lucide-react';
import YouTube from 'react-youtube';

import Sidebar from '../../../../components/dashboardLayout/sidebar';
import Topbar from '../../../../components/dashboardLayout/topbar'; 
import { supabase as supabaseClient } from '../../../../../lib/supabaseClient';

export default function DetailMateriPage({ params }: { params: Promise<{ idFakultas: string, idKelas: string, idMateri: string }> }) {
  const resolvedParams = use(params);
  const { idFakultas, idKelas, idMateri } = resolvedParams;

  const [materi, setMateri] = useState<any>(null);
  const [allMateri, setAllMateri] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number>(19); 
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
        const { data: currentMateri } = await supabaseClient
          .from('Materi')
          .select('*')
          .eq('id_Materi', idMateri)
          .single();
        
        if (currentMateri) setMateri(currentMateri);

        const { data: listMateri } = await supabaseClient
          .from('Materi')
          .select('*')
          .eq('id_Kelas', idKelas);

        if (listMateri) setAllMateri(listMateri);

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

  const handleProgress = async () => {
    if (!userId || isCompleted) return;

    try {
      const { error: logError } = await supabaseClient
        .from('Progress_Materi')
        .upsert({ 
          id_User: userId, 
          id_Materi: idMateri, 
          sudah_tonton: true 
        }, { onConflict: 'id_User, id_Materi' });

      if (logError) throw logError;

      const { data: listSelesai, error: countError } = await supabaseClient
        .from('Progress_Materi')
        .select('id_Materi, Materi!inner(id_Kelas)')
        .eq('id_User', userId)
        .eq('Materi.id_Kelas', idKelas);

      if (countError) throw countError;
      const jumlahSelesai = listSelesai?.length || 0;

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
      setShowSuccessPopup(true); 
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
      {/* 1. SIDEBAR Tetap di Kiri */}
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        
        {/* 2. TOPBAR (Kita asumsikan dia fixed secara internal) */}
        <Topbar />

        {/* 3. SPACER & NAVIGASI (Dikasih margin-top besar agar tidak tertutup Topbar) */}
        <div className="mt-[70px] w-full bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center relative z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Link 
              href={`/Kelas/${idFakultas}/${idKelas}`} 
              className="flex items-center gap-2 text-[#064479] hover:underline font-bold text-sm transition-all"
            >
              <ArrowLeft size={20} />
              <span>Kembali ke Materi</span>
            </Link>
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600 text-[11px] font-bold uppercase bg-green-50 px-3 py-1 rounded-full">
              <CheckCircle size={14} /> Selesai
            </div>
          )}
        </div>

        {/* 4. ISI MATERI */}
        <main className="p-8">
          <div className="grid grid-cols-12 gap-8 items-start">
            <section className="col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                
                {isVideo ? (
                  <div className="aspect-video bg-black shadow-inner">
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
                  <div className="h-64 bg-gradient-to-br from-[#064479] to-[#0a66b5] flex flex-col items-center justify-center p-8 text-white text-center">
                     {tipe === 'TEKS CATATAN' ? <BookOpen size={48} className="mb-4 opacity-80" /> : <FileText size={48} className="mb-4 opacity-80" />}
                     <h2 className="text-2xl font-bold uppercase tracking-wider">{tipe}</h2>
                     {!isCompleted && (
                        <button 
                          onClick={handleProgress}
                          className="mt-6 bg-white text-[#064479] px-8 py-2.5 rounded-xl text-sm font-bold shadow-xl"
                        >
                          Tandai Selesai
                        </button>
                     )}
                  </div>
                )}
                
                <div className="p-10">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">{materi.judul_materi}</h2>
                  <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                      {materi.deskripsi || "Isi materi belum tersedia."}
                  </div>
                </div>
              </div>
            </section>

            {/* DAFTAR MATERI SEBELAH KANAN */}
            <aside className="col-span-4 space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Materi Kelas</h3>
              <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
                {allMateri.map((item) => {
                  const ytId = getYouTubeID(item.link_konten);
                  const thumb = (item.tipe_konten?.toUpperCase() === 'VIDEO' && ytId)
                      ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` 
                      : `https://placehold.co/300x168/064479/white?text=${item.tipe_konten}`;
                  
                  return (
                    <Link 
                      key={item.id_Materi} 
                      href={`/Kelas/${idFakultas}/${idKelas}/${item.id_Materi}`}
                      className={`group bg-white rounded-xl border p-3 shadow-sm transition-all ${item.id_Materi.toString() === idMateri ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100'}`}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                        <Image src={thumb} alt="thumb" fill unoptimized className="object-cover" />
                      </div>
                      <h4 className="text-[12px] font-bold text-gray-800 line-clamp-2">{item.judul_materi}</h4>
                    </Link>
                  );
                })}
              </div>
            </aside>
          </div>
        </main>

        {showSuccessPopup && (
          <div className="fixed bottom-10 right-10 z-[150] animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="bg-[#064479] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <CheckCircle size={24} className="text-green-400" />
              <div>
                <p className="font-bold text-sm">Progres Disimpan!</p>
                <p className="text-[11px] opacity-80">Materi ini sudah selesai dipelajari.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}