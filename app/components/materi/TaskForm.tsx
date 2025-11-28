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
        id_Kelas: kelasId,
        judul_tugas: title,
        id_Materi: moduleId || null,
        tanggal_mulai: startDate || null,
        tanggal_selesai: endDate || null,
      };

      const res = await fetch("/api/tugas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal menambah tugas");

      onAdd(json.data || json);
      setTitle("");
      setModuleId("");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold mb-3">Tambah Tugas Baru</h4>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />

        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">Pilih Module</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 w-1/2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 w-1/2"
          />
        </div>

        <div className="border border-dashed border-gray-200 rounded-md h-24 flex items-center justify-center text-gray-400">
          Tambahkan Lampiran Berkas
        </div>

        <div className="flex justify-end">
          <button
            onClick={submit}
            disabled={loading}
            className="bg-[#002D5B] text-white px-4 py-2 rounded-md disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}
