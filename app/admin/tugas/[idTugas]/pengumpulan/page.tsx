"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "@/app/components/layouts/sidebarAdmin";
import Navbar from "@/app/components/layouts/navbarAdmin";

import { use } from 'react';

export default function PengumpulanTugasPage({ params }: { params: Promise<{ idTugas: string }> }) {
  const { idTugas } = use(params);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nilaiInput, setNilaiInput] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
    // Handler untuk perubahan input nilai
    const handleNilaiChange = (idPengumpulan: string, value: string) => {
      setNilaiInput((prev) => ({ ...prev, [idPengumpulan]: value }));
    };

    // Handler untuk submit nilai
    const handleSubmitNilai = async (idPengumpulan: string) => {
      setSaving((prev) => ({ ...prev, [idPengumpulan]: true }));
      try {
        const res = await fetch(`/api/admin/tugas/${idTugas}/pengumpulan/${idPengumpulan}/nilai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("admin_token") : ""}`,
          },
          body: JSON.stringify({ nilai: nilaiInput[idPengumpulan] }),
        });
        if (res.ok) {
          // Update nilai pada submissions
          setSubmissions((prev) => prev.map((item) =>
            item.id_Pengumpulan === idPengumpulan
              ? { ...item, nilai: nilaiInput[idPengumpulan] }
              : item
          ));
        } else {
          alert("Gagal menyimpan nilai.");
        }
      } catch {
        alert("Terjadi kesalahan saat menyimpan nilai.");
      } finally {
        setSaving((prev) => ({ ...prev, [idPengumpulan]: false }));
      }
    };
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/tugas/${idTugas}/pengumpulan`, {
          headers: { Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("admin_token") : ""}` },
        });
        const json = await res.json();
        if (res.ok) setSubmissions(json);
        else setSubmissions([]);
      } catch {
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idTugas]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sticky Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 z-30">
        <SidebarAdmin />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: 256 }}>
        {/* Sticky Navbar */}
        <div className="fixed top-0 left-64 right-0 z-20">
          <Navbar />
        </div>
        {/* Content below navbar */}
        <main className="p-8 pt-24" style={{ minHeight: '100vh' }}>
          <button
            className="mb-6 px-4 py-2 bg-[#002D5B] text-white rounded hover:bg-[#17457b] text-sm"
            onClick={() => router.back()}
          >
            ← Kembali ke Tugas/Materi
          </button>
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-6 text-[#002D5B]">Pengumpulan Tugas</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F4F7FC] text-[#002D5B]">
                    <th className="py-2 px-4 text-left">Nama Siswa</th>
                    <th className="py-2 px-4 text-left">File</th>
                    <th className="py-2 px-4 text-left">Tanggal Submit</th>
                    <th className="py-2 px-4 text-left">Nilai</th>
                    <th className="py-2 px-4 text-left">Beri Penilaian</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-4 text-gray-500">Memuat data...</td></tr>
                  ) : submissions.length > 0 ? (
                    submissions.map((item: any) => (
                      <tr key={item.id_Pengumpulan} className="border-b">
                        <td className="py-2 px-4">{item.User?.nama_lengkap || "-"}</td>
                        <td className="py-2 px-4">
                          {item.file_pengumpulan ? (
                            <a href={item.file_pengumpulan} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat File</a>
                          ) : "-"}
                        </td>
                        <td className="py-2 px-4">{item.tanggal_submit ? new Date(item.tanggal_submit).toLocaleString() : "-"}</td>
                        <td className="py-2 px-4">{item.nilai ?? "-"}</td>
                        <td className="py-2 px-4">
                          <form
                            onSubmit={e => {
                              e.preventDefault();
                              handleSubmitNilai(item.id_Pengumpulan);
                            }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="number"
                              min={0}
                              max={100}
                              className="border rounded px-2 py-1 w-20"
                              value={
                                nilaiInput[item.id_Pengumpulan] !== undefined
                                  ? nilaiInput[item.id_Pengumpulan]
                                  : (item.nilai ?? "")
                              }
                              onChange={e => handleNilaiChange(item.id_Pengumpulan, e.target.value)}
                              placeholder="Nilai"
                            />
                            <button
                              type="submit"
                              className="bg-[#002D5B] text-white px-2 py-1 rounded text-xs hover:bg-[#17457b] disabled:opacity-60"
                              disabled={saving[item.id_Pengumpulan]}
                            >
                              {saving[item.id_Pengumpulan] ? "Menyimpan..." : "Simpan"}
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">Belum ada pengumpulan tugas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
