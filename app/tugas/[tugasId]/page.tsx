"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import { Upload, X, ChevronLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/app/components/dashboardLayout/sidebar";
import Topbar from "@/app/components/dashboardLayout/topbar";

interface TaskDetail {
  id_Tugas: number;
  judul_tugas: string;
  deskripsi: string;
  tenggat_waktu: string;
  id_Kelas: number;
  Kelas?: {
    nama_kelas: string;
  };
}

interface SubmissionData {
  id_Pengumpulan: number;
  file_pengumpulan: string | null;
  catatan: string | null;
  tanggal_submit: string;
  nilai: number | null;
}

const TOKEN_KEY = "access_token";

export default function TaskDetailPage({ params }: { params: Promise<{ tugasId: string }> }) {
  const { tugasId } = use(params);
  const router = useRouter();
  
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<SubmissionData | null>(null);

  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api", []);

  // Status: Terkunci jika sudah diberi nilai oleh admin
  const isLocked = useMemo(() => existingSubmission?.nilai !== null && existingSubmission?.nilai !== undefined, [existingSubmission]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          router.replace("/login");
          return;
        }

        const profileRes = await fetch(`${API_BASE}/me/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.ok) {
          const user = await profileRes.json();
          setUserData(user);

          // Cek apakah user sudah pernah submit tugas ini
          const { data: subData } = await supabase
            .from("Pengumpulan_Tugas")
            .select("*")
            .eq("id_User", user.id_User)
            .eq("id_Tugas", tugasId)
            .maybeSingle();

          if (subData) {
            setExistingSubmission(subData as SubmissionData);
            setSubmissionText(subData.catatan || "");
          }
        }

        const { data: taskData } = await supabase
          .from("Tugas")
          .select("id_Tugas, judul_tugas, deskripsi, tenggat_waktu, id_Kelas, Kelas(nama_kelas)")
          .eq("id_Tugas", tugasId)
          .single();

        if (taskData) setTask(taskData as TaskDetail);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tugasId, API_BASE, router]);

  const handleSubmit = async () => {
    if (!task || !userData?.id_User || submitting || isLocked) return;

    if (uploadedFiles.length === 0 && !submissionText) {
      alert("Silakan isi catatan atau pilih file.");
      return;
    }

    try {
      setSubmitting(true);
      let filePath = existingSubmission?.file_pengumpulan || null;

      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        const cleanOriginalName = file.name.replace(/\s+/g, '_');
        const cleanClassName = task?.Kelas?.nama_kelas?.replace(/[^a-zA-Z0-9]/g, '_') || 'Kelas';
        
        // Penamaan File: IDUser_NamaKelas_NamaFileAsli
        const fileName = `${userData.id_User}_${cleanClassName}_${cleanOriginalName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pengumpulan_tugas")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from("pengumpulan_tugas").getPublicUrl(fileName);
        filePath = urlData.publicUrl;
      }

      const payload = {
        id_User: userData.id_User,
        id_Kelas: task.id_Kelas,
        id_Tugas: task.id_Tugas,
        file_pengumpulan: filePath,
        catatan: submissionText,
        tanggal_submit: new Date().toISOString(),
      };

      // Simpan data ke tabel Pengumpulan_Tugas
      const { error: dbError } = existingSubmission
        ? await supabase.from("Pengumpulan_Tugas").update(payload).eq("id_Pengumpulan", existingSubmission.id_Pengumpulan)
        : await supabase.from("Pengumpulan_Tugas").insert([payload]);

      if (dbError) throw dbError;

      alert("Tugas berhasil dikirim! 🔥");
      window.location.reload();

    } catch (err: any) {
      console.error("Error detail:", err);
      alert(err.message || "Gagal mengirim jawaban ke database");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-64">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 mt-16">
          <div className="max-w-6xl mx-auto">
            <Link href={`/Kelas/${task?.id_Kelas}`} className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium">
              <ChevronLeft size={16} /> Kembali ke Kelas
            </Link>

            <div className="grid grid-cols-12 gap-8 items-start">
              {/* KIRI: DETAIL TUGAS */}
              <div className="col-span-8">
                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                  <div className="bg-[#1A5CFF] min-h-[200px] flex items-center justify-center px-10 text-center relative overflow-hidden text-white">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight z-10">{task?.judul_tugas}</h1>
                  </div>
                  <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                      {/* STATUS BADGE HIJAU JIKA SUDAH SUBMIT */}
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${existingSubmission ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {existingSubmission && <CheckCircle size={14} />}
                        {existingSubmission ? 'Sudah Dikumpulkan' : 'Belum Submit'}
                      </span>
                      <div className="h-4 w-[1px] bg-gray-200"></div>
                      <p className="text-sm text-gray-400 font-medium">
                        Tenggat: <span className="text-gray-900 font-bold">{task?.tenggat_waktu || "Tidak terbatas"}</span>
                      </p>
                    </div>
                    <div className="border-t border-gray-50 pt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-5">Instruksi Tugas</h3>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
                        {task?.deskripsi || "Tidak ada deskripsi detail."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KANAN: SUBMISSION BOX */}
              <div className="col-span-4 space-y-6">
                {isLocked && (
                  <div className="bg-gradient-to-br from-[#064479] to-[#1A5CFF] rounded-[32px] p-8 text-white shadow-xl shadow-blue-200">
                    <h2 className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-3">Nilai Tugas</h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black">{existingSubmission?.nilai}</span>
                      <span className="text-lg opacity-60 font-bold">/ 100</span>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Submission Saya</h2>
                  
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    disabled={isLocked}
                    placeholder="Tulis catatan di sini..."
                    className={`w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm mb-6 min-h-[140px] outline-none transition-all resize-none font-medium ${isLocked ? 'opacity-50 cursor-not-allowed' : 'focus:ring-4 focus:ring-blue-50'}`}
                  />

                  {!isLocked && (
                    <label className="group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-100 rounded-[24px] cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                      <div className="flex flex-col items-center justify-center px-6 text-center">
                        <Upload className="w-6 h-6 text-blue-600 mb-2" />
                        <p className="text-xs text-gray-900 font-bold uppercase tracking-wider">Pilih File</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Ganti file yang sudah ada</p>
                      </div>
                      <input type="file" className="hidden" onChange={(e) => {
                        if (e.target.files?.[0]) setUploadedFiles([e.target.files[0]]);
                      }} />
                    </label>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl flex justify-between items-center border border-blue-100">
                      <span className="text-[11px] font-black text-blue-700 truncate uppercase tracking-tight">{uploadedFiles[0].name}</span>
                      <button onClick={() => setUploadedFiles([])} className="p-2 hover:bg-red-50 rounded-full group transition-colors">
                        <X size={16} className="text-blue-300 group-hover:text-red-500" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || isLocked}
                    className={`w-full mt-8 py-4 rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                      submitting || isLocked 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#1A5CFF] text-white hover:bg-blue-700 shadow-blue-200'
                    }`}
                  >
                    {submitting ? 'SEDANG MENGIRIM...' : isLocked ? 'TUGAS SELESAI DINILAI' : (existingSubmission ? 'PERBARUI JAWABAN' : 'KIRIM SEKARANG')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}