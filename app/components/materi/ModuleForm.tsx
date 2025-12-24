"use client";

import { useState } from "react";

export default function ModuleForm({
  kelasId,
  onCreate,
  onCancel,
}: {
  kelasId?: string | null;
  onCreate: (m: any) => void;
  onCancel: () => void;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urutan, setUrutan] = useState<string | number>("");

  const submit = async () => {
    if (!kelasId) return alert("Pilih kelas terlebih dahulu");
    if (!title) return alert("Judul modul diperlukan");

    const payload = {
      id_Kelas: Number(kelasId),
      judul_materi: title,
      deskripsi: description || null,
      urutan: urutan ? Number(urutan) : null,
    };

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    const res = await fetch(`${backendUrl}/api/admin/materi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error);

    onCreate(json.data || json);
    setTitle("");
    setDescription("");
    setUrutan("");
  };

  return (
    <div className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <h4 className="text-lg font-semibold mb-4">Buat Modul Baru</h4>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul Modul"
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <input
          value={urutan as any}
          onChange={(e) => setUrutan(e.target.value)}
          placeholder="Urutan (angka)"
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi (opsional)"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 h-28"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-3 rounded-xl border border-gray-300"
          >
            Batal
          </button>

          <button onClick={submit} className="bg-[#0A2A43] text-white px-5 py-3 rounded-xl hover:bg-[#0F3B66] transition">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}