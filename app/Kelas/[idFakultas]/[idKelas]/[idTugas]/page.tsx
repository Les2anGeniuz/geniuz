'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, CheckCircle2, Bell, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Menggunakan Sidebar asli dari project kamu
import Sidebar from '../../../../components/Kelas2/sidebar'
import { supabase as supabaseClient } from '../../../../../lib/supabaseClient';

export default function DetailTugasPage({ params }: { params: Promise<{ idFakultas: string, idKelas: string, idTugas: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [tugas, setTugas] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null); // State untuk data pengumpulan (termasuk nilai)
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil Detail Tugas
      const { data: tugasData } = await supabaseClient
        .from('Tugas')
        .select('*')
        .eq('id_Tugas', resolvedParams.idTugas)
        .single();
      
      if (tugasData) setTugas(tugasData);

      // 2. Ambil data Pengumpulan (untuk cek nilai & file yang sudah ada)
      // id_User dihardcode 1 untuk sementara
      const { data: submitData } = await supabaseClient
        .from('Pengumpulan')
        .select('*')
        .eq('id_Tugas', resolvedParams.idTugas)
        .eq('id_User', 1) 
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
      // Update status tugas
      await supabaseClient.from('Tugas').update({ status: 'TELAH' }).eq('id_Tugas', resolvedParams.idTugas);
      
      // Simpan data pengumpulan
      const { error } = await supabaseClient.from('Pengumpulan').upsert({
        id_Tugas: Number(resolvedParams.idTugas),
        id_User: 1, 
        file_pengumpulan: selectedFile?.name || submission?.file_pengumpulan
      });

      if (error) throw error;

      alert("Tugas berhasil dikirim!");
      router.refresh();
      // Reset file setelah kirim
      setSelectedFile(null);
      // Fetch ulang data agar UI terupdate
      router.push(`/Kelas/${resolvedParams.idFakultas}/${resolvedParams.idKelas}`);
    } catch (err) {
      alert("Gagal mengirim tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center italic text-gray-500">Menyusun detail tugas...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar Komponen Asli */}
      <Sidebar />

      <div className="flex-1 ml-64">
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <Link href={`/Kelas/${resolvedParams.idFakultas}/${resolvedParams.idKelas}`} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-gray-800">Kelas <span className="font-normal text-gray-500">{tugas?.nama_kelas || "Desain Aplikasi Big Data"}</span></h1>
           </div>
           <div className="flex items-center gap-4">
              <Bell size={22} className="text-gray-400 cursor-pointer" />
              <Image src="https://placehold.co/32x32/orange/white?text=MA" alt="User" width={32} height={32} className="rounded-full border" />
           </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Kolom Kiri */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="aspect-video bg-gray-900 relative">
                  <Image src="https://placehold.co/800x450/1a202c/ffffff?text=Materi+Video" alt="Banner" fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                       <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{tugas?.judul_tugas}</h2>
                    <div className="text-right">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tenggat Waktu</p>
                       <p className="text-sm font-semibold text-gray-700">{tugas?.tenggat_waktu || '15 Okt 2025, 23.59'}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed py-6 border-t border-gray-100">
                    {tugas?.deskripsi_tugas || "Deskripsi tugas belum tersedia."}
                  </p>
                </div>
              </div>

              {/* Status File Dinamis */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Berkas Terlampir</h3>
                
                {/* File yang Baru Dipilih atau Sudah Ada di DB */}
                {(selectedFile || submission?.file_pengumpulan) ? (
                  <div className="flex items-center justify-between p-4 bg-white border border-blue-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-500 text-white p-2 rounded-lg"><FileText size={20} /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{selectedFile?.name || submission?.file_pengumpulan}</p>
                        <p className="text-xs text-blue-500 font-medium">{selectedFile ? "Siap dikirim" : "Sudah terunggah"}</p>
                      </div>
                    </div>
                    {!submission && (
                      <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500 p-1"><X size={18} /></button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                    <p className="text-xs text-gray-400 italic">Belum ada berkas yang dipilih.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Box Nilai Dinamis */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Nilai Akhir</p>
                <p className={`text-[72px] font-black leading-none ${submission?.nilai ? 'text-gray-900' : 'text-gray-200'}`}>
                  {submission?.nilai || '0'}
                </p>
                <div className="h-px bg-gray-100 my-6"></div>
                <div className="text-left space-y-4">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Komentar Mentor</p>
                   <p className="text-xs text-gray-600 italic">
                     {submission?.komentar || "Belum ada feedback dari mentor."}
                   </p>
                </div>
              </div>

              {/* Box Form Upload */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-4">Pengiriman</label>
                
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  tugas?.status === 'TELAH' ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-blue-100 bg-blue-50/30 hover:bg-blue-50 cursor-pointer'
                }`}>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="file-input" 
                    disabled={tugas?.status === 'TELAH'} 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <p className="text-xs font-bold text-blue-600">
                      {selectedFile ? "File Terpilih" : "Ganti Berkas"}
                    </p>
                  </label>
                </div>

                <button 
                  onClick={handleSubmitTugas}
                  disabled={isSubmitting || tugas?.status === 'TELAH'}
                  className={`w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    tugas?.status === 'TELAH' ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                  }`}
                >
                  {isSubmitting ? 'Mengirim...' : tugas?.status === 'TELAH' ? 'Sudah Terkirim' : 'Kirim Sekarang'}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}