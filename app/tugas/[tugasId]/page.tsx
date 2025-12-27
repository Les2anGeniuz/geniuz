"use client";

import React, { useState, useEffect, use } from "react";
import { Upload, X, ChevronLeft } from "lucide-react";
import Link from "next/link";
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
  tanggal_submit: string;
  nilai: number | null;
}

export default function TaskDetailPage({ params }: { params: Promise<{ tugasId: string }> }) {
  const { tugasId } = use(params); // Next.js 14+ style
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<SubmissionData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.email) {
          const { data: userData } = await supabase
            .from("User")
            .select("id_User")
            .eq("email", session.user.email)
            .single();

          if (userData) {
            setUserId(userData.id_User);

            // Fetch existing submission
            const { data: submissionData } = await supabase
              .from("Pengumpulan_Tugas")
              .select("id_Pengumpulan, file_pengumpulan, tanggal_submit, nilai")
              .eq("id_User", userData.id_User)
              .eq("id_Tugas", tugasId)
              .single();

            if (submissionData) setExistingSubmission(submissionData as SubmissionData);
          }
        }

        const { data, error } = await supabase
          .from("Tugas")
          .select(`
            id_Tugas,
            judul_tugas,
            deskripsi,
            tenggat_waktu,
            id_Kelas,
            Kelas(nama_kelas)
          `)
          .eq("id_Tugas", tugasId)
          .single();

        if (!error && data) setTask(data as TaskDetail);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tugasId]);

  const handleSubmit = async () => {
    if (!task || !userId || submitting) return;

    if (!uploadedFiles.length && !submissionText) {
      alert("Silakan upload file atau tulis catatan terlebih dahulu");
      return;
    }

    try {
      setSubmitting(true);

      let filePath: string | null = null;

      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pengumpulan_tugas")
          .upload(`${userId}/${task.id_Tugas}/${fileName}`, file);

        if (uploadError) {
          alert("Gagal upload file: " + uploadError.message);
          return;
        }

        filePath = uploadData?.path ?? null;
      }

      if (existingSubmission) {
        const { error: updateError } = await supabase
          .from("Pengumpulan_Tugas")
          .update({
            file_pengumpulan: filePath || existingSubmission.file_pengumpulan,
            tanggal_submit: new Date().toISOString(),
          })
          .eq("id_Pengumpulan", existingSubmission.id_Pengumpulan);

        if (updateError) {
          alert("Gagal update submission: " + updateError.message);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("Pengumpulan_Tugas")
          .insert([
            {
              id_User: userId,
              id_Kelas: task.id_Kelas,
              id_Tugas: task.id_Tugas,
              file_pengumpulan: filePath,
              tanggal_submit: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          alert("Gagal menyimpan submission: " + insertError.message);
          return;
        }
      }

      alert("Submission berhasil dikirim!");
      setUploadedFiles([]);
      setSubmissionText("");

      const { data: submissionData } = await supabase
        .from("Pengumpulan_Tugas")
        .select("id_Pengumpulan, file_pengumpulan, tanggal_submit, nilai")
        .eq("id_User", userId)
        .eq("id_Tugas", task.id_Tugas)
        .single();

      if (submissionData) setExistingSubmission(submissionData as SubmissionData);

    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat mengirim submission");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 mt-16 ml-64 sm:ml-64">
          <div className="max-w-6xl mx-auto w-full">

            <Link href={`/Kelas/${task?.id_Kelas}`} className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
              <ChevronLeft size={16} /> Kembali ke Kelas
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

              <div className="lg:col-span-8 w-full">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-[#1A5CFF] min-h-[160px] md:h-52 flex items-center justify-center px-6 md:px-10 text-center">
                    <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                      {task?.judul_tugas}
                    </h1>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="bg-[#FEF9C3] text-[#854D0E] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Pending</span>
                      <div className="hidden sm:block h-4 w-[1px] bg-gray-200"></div>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">Tenggat:</span> {task?.tenggat_waktu || "Tidak ada tenggat"}
                      </p>
                    </div>
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Deskripsi Tugas</h3>
                      <div className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {task?.deskripsi || "Belum ada deskripsi untuk tugas ini."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 w-full space-y-6">
                {existingSubmission?.nilai !== null && existingSubmission?.nilai !== undefined && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5 md:p-6 shadow-sm">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-3">
                      Nilai dari Admin
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-bold text-blue-600">{existingSubmission?.nilai ?? "-"}</span>
                      <span className="text-sm text-gray-600">/100</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Disubmit pada: {existingSubmission?.tanggal_submit ? new Date(existingSubmission.tanggal_submit).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'}) : "-"}
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">SUBMISSION SAYA</h2>

                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Tulis catatan di sini..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all mb-4 min-h-[110px] resize-none"
                  />

                  <label className="group flex flex-col items-center justify-center w-full h-36 md:h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <div className="flex flex-col items-center justify-center px-4 text-center">
                      <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors mb-2" />
                      <p className="text-sm text-gray-700 font-medium">Drop Files Here</p>
                      <p className="text-xs text-gray-400 mt-1">atau klik untuk memilih</p>
                    </div>
                    <input type="file" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) setUploadedFiles([...uploadedFiles, e.target.files[0]]);
                    }} />
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="text-xs text-blue-700 truncate max-w-[180px] font-medium">{file.name}</span>
                          <button onClick={() => setUploadedFiles([])} className="text-blue-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`w-full mt-6 font-bold py-3.5 rounded-xl transition-all shadow-lg ${submitting ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-[#1A5CFF] cursor-pointer hover:bg-blue-700 active:scale-[0.98] shadow-blue-500/20"} text-white`}
                  >
                    {submitting ? "Mengirim..." : "Kirim Jawaban"}
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
