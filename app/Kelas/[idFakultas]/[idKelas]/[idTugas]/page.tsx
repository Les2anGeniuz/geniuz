'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, CheckCircle2, Bell, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Import Sidebar asli dari project kamu
import Sidebar from '../../../../components/Kelas2/sidebar';
import { supabase as supabaseClient } from '../../../../../lib/supabaseClient';

export default function DetailTugasPage({ params }: { params: Promise<{ idFakultas: string, idKelas: string, idTugas: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [tugas, setTugas] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fungsi memformat tanggal agar dinamis dari database
  const formatTanggal = (dateString: string) => {
    if (!dateString) return '15 Okt 2025, 23.59'; // Fallback sesuai wireframe
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil Detail Tugas
      const { data: tugasData } = await supabaseClient
        .from('Tugas')
        .select('*')
        .eq('id_Tugas', resolvedParams.idTugas)
        .single();
      
      if (tugasData) setTugas(tugasData);

      // 2. Ambil data Pengumpulan (cek nilai & komentar mentor)
      const { data: submitData } = await supabaseClient
        .from('Pengumpulan')
        .select('*')
        .eq('id_Tugas', resolvedParams.idTugas)
        .eq('id_User', 1) // id_User sementara dihardcode 1
        .single();
      
      if (submitData) setSubmission(submitData);
      setLoading(false);
    };
    fetchData();
  }, [resolvedParams.idTugas]);

  const handleSubmitTugas = async () => {
    if (!selectedFile && !submission) return alert("Pilih file terlebih dahulu!");
    setIsSubmitting(true);
    try {
      // Update status di tabel Tugas menjadi TELAH
      await supabaseClient.from('Tugas').update({ status: 'TELAH' }).eq('id_Tugas', resolvedParams.idTugas);
      
      // Simpan/Upsert data pengumpulan ke database
      const { error } = await supabaseClient.from('Pengumpulan').upsert({
        id_Tugas: Number(resolvedParams.idTugas),
        id_User: 1, 
        file_pengumpulan: selectedFile?.name || submission?.file_pengumpulan
      });

      if (error) throw error;

      alert("Tugas berhasil dikumpulkan!");
      router.push(`/Kelas/${resolvedParams.idFakultas}/${resolvedParams.idKelas}`);
      router.refresh(); 
    } catch (err) {
      alert("Gagal mengirim tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat detail tugas...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Header Dinamis */}
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <Link href={`/Kelas/${resolvedParams.idFakultas}/${resolvedParams.idKelas}`} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Kelas <span className="font-normal text-gray-400">Desain Aplikasi Big Data</span>
              </h1>
           </div>
           <div className="flex items-center gap-4">
              <Bell size={22} className="text-gray-400 cursor-pointer" />
              <Image src="https://placehold.co/32x32/E0E0E0/B0B0B0?text=MA" alt="User" width={32} height={32} className="rounded-full border" />
           </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Kolom Kiri: Detail Tugas & Berkas */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="aspect-video bg-gray-900 relative">
                  <Image src="https://placehold.co/800x450/1e293b/ffffff?text=Video+Materi" alt="Banner" fill className="object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                       <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">{tugas?.judul_tugas}</h2>
                      <p className="text-sm font-bold text-gray-800">John Smith</p>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Graded</p>
                    </div>
                    <p className="text-sm text-gray-500">Tenggat: <span className="font-semibold text-gray-700">{formatTanggal(tugas?.tenggat_waktu)}</span></p>
                  </div>
                  
                  <div className="text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-6 italic">
                    {tugas?.deskripsi_tugas || "Buatlah Dokumen Rancangan Teknis yang merinci arsitektur aplikasi Big Data Anda..."}
                  </div>
                </div>
              </div>

              {/* Daftar Berkas Terlampir (Dinamis) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Berkas Terlampir</h3>
                {(selectedFile || submission?.file_pengumpulan) ? (
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold">PDF</div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{selectedFile?.name || submission?.file_pengumpulan}</p>
                        <p className="text-[10px] text-gray-400">4.5 MB • {selectedFile ? "Ready to upload" : "Submitted"}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="text-xs text-gray-400 font-medium hover:text-red-500">Cancel</button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic px-1">Belum ada file yang dipilih.</p>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Nilai & Form Upload */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Box Nilai (Dinamis dari Tabel Pengumpulan) */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                <p className="text-[64px] font-black text-gray-900 leading-none">
                  {submission?.nilai || '0'}
                </p>
                <div className="h-px bg-gray-100 my-6"></div>
                <div className="text-left space-y-4">
                   <div>
                      <p className="text-[10px] font-bold text-gray-800 uppercase">John Smith</p>
                      <p className="text-[10px] text-gray-500 italic">"Keren banget lee"</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-gray-800 uppercase">Saya</p>
                      <p className="text-[10px] text-gray-500 italic">"Terimakasih, anda mentor terbaik!"</p>
                   </div>
                </div>
              </div>

              {/* Form Upload */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Judul</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded p-2 text-xs focus:ring-1 focus:ring-blue-500" 
                    placeholder="Masukkan judul..." 
                  />
                </div>
                
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Lampirkan Berkas</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="file-input" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                      {selectedFile ? selectedFile.name : "Drop Files Here"}
                    </p>
                  </label>
                </div>

                <button 
                  onClick={handleSubmitTugas}
                  disabled={isSubmitting || tugas?.status === 'TELAH'}
                  className={`w-full mt-6 py-3 rounded-lg text-xs font-bold transition-all ${
                    tugas?.status === 'TELAH' ? 'bg-green-500 text-white cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Mengirim...' : tugas?.status === 'TELAH' ? 'SUDAH TERKIRIM' : 'SUBMIT TUGAS'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}