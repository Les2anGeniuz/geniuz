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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urutan, setUrutan] = useState<string | number>("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!kelasId) return alert("Pilih kelas terlebih dahulu");
    if (!title) return alert("Judul modul diperlukan");

    setLoading(true);
    try {
      const payload = {
        id_Kelas: kelasId,
        judul_materi: title,
        deskripsi: description || null,
        urutan: urutan ? Number(urutan) : null,
      };

      const res = await fetch("/api/materi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal membuat modul");

      onCreate(json.data || json);
      setTitle("");
      setDescription("");
      setUrutan("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold mb-3">Buat Modul Baru</h4>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul Modul"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />

        <input
          value={urutan as any}
          onChange={(e) => setUrutan(e.target.value)}
          placeholder="Urutan (angka)"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi (opsional)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 h-24"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded-md border">Batal</button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-[#002D5B] text-white px-4 py-2 rounded-md disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
