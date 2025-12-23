"use client";

import { useState } from "react";

export default function TaskForm({
  onAdd,
  kelasId,
  modules,
}: {
  onAdd: (t: any) => void;
  kelasId?: string | null;
  modules: { id: string; title: string }[];
}) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!kelasId) return alert("Pilih kelas terlebih dahulu");
    setLoading(true);
    try {
      const payload = {
        id_Kelas: Number(kelasId),
        judul_tugas: title,
        id_Materi: moduleId ? Number(moduleId) : null,
        tanggal_mulai: startDate || null,
        tanggal_selesai: endDate || null,
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

      const res = await fetch(`${backendUrl}/api/admin/tugas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal menambah tugas");

      onAdd(json.data || json);
      setTitle("");
      setModuleId("");
      setStartDate("");
      setEndDate("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <h4 className="text-[15px] font-bold text-[#002D5B] mb-4">Tambah Tugas Baru</h4>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul tugas"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#002D5B] outline-none text-[15px]"
        />

        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[15px]"
        >
          <option value="">Pilih Modul</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>

        <div className="flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 w-1/2 text-[13px]"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 w-1/2 text-[13px]"
          />
        </div>

        <div className="border border-dashed border-gray-300 rounded-xl h-28 flex items-center justify-center text-gray-400 text-[12px]">
          Tambahkan lampiran berkas
        </div>

        <div className="flex justify-end">
          <button
            onClick={submit}
            disabled={loading}
            className="bg-[#002D5B] text-white px-5 py-3 rounded-xl shadow-sm hover:bg-[#093a68] disabled:opacity-50 transition text-[13px]"
          >
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}