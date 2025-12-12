"use client";

import { useCallback, useEffect, useState } from "react";
// Pastikan path ini benar
import SidebarAdmin from "../../components/layouts/sidebarAdmin";
import Navbar from "../../components/layouts/navbarAdmin";

import KelasFilters from "../../components/kelas/kelasFilters";
import KelasTable from "../../components/kelas/kelasTable";
import KelasModal from "../../components/kelas/kelasModal";

interface Kelas {
  id_Kelas: number;
  nama_kelas: string;
  deskripsi: string | null;
  nama_fakultas: string | null;
  nama_mentor: string | null;
}

interface Fakultas {
  id_Fakultas: number;
  nama_fakultas: string;
}

interface Mentor {
  id_Mentor: number;
  nama_mentor: string;
}

export default function KelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 15 });
  const [search, setSearch] = useState("");

  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Kelas | null>(null);

  const [nama_kelas, setNamaKelas] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [id_Fakultas, setIdFakultas] = useState("");
  const [id_Mentor, setIdMentor] = useState("");

  const [fakultas, setFakultas] = useState<Fakultas[]>([]);
  const [mentor, setMentor] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);

  const page = meta.page;

  const fetchData = useCallback(async () => {
    // Menambahkan try/catch untuk debugging
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);

      const res = await fetch(`/api/kelas?${params.toString()}`);
      const json = await res.json();

      if (res.ok) {
        setKelas(json.data);
        setMeta(json.meta);
      } else {
        // Log error jika status bukan 2xx
        console.error("Failed to fetch data:", res.status, json.error);
        setKelas([]);
        setMeta({ total: 0, page: 1, totalPages: 1, limit: 15 });
      }
    } catch (err) {
      console.error("Fetch data failed unexpectedly:", err);
      setKelas([]);
      setMeta({ total: 0, page: 1, totalPages: 1, limit: 15 });
    }
  }, [page, search]);

  const loadFakultas = async () => {
    const res = await fetch("/api/fakultas");
    const json = await res.json();
    if (res.ok) setFakultas(json.data);
  };

  const loadMentor = async () => {
    const res = await fetch("/api/mentor");
    const json = await res.json();
    if (res.ok) setMentor(json.data);
  };

  useEffect(() => {
    fetchData();
  }, [search, page, fetchData]);

  const openAdd = () => {
    setEditing(null);
    setNamaKelas("");
    setDeskripsi("");
    setIdFakultas("");
    setIdMentor("");

    loadFakultas();
    loadMentor();
    setModalOpen(true);
  };

  const openEdit = (item: Kelas) => {
    setEditing(item);
    setNamaKelas(item.nama_kelas);
    setDeskripsi(item.deskripsi || "");
    // ID Fakultas/Mentor yang terkait dengan item yang diedit
    // harus dicari dan di-set berdasarkan data yang ada
    // (saat ini, data `item` hanya memiliki `nama_fakultas/mentor`,
    // sehingga input form ID harus di-set setelah list fakultas/mentor
    // dimuat atau perlu penyesuaian di API agar ID-nya ikut terkirim)
    // Untuk saat ini, kita biarkan kosong/default saat edit dibuka
    setIdFakultas(""); 
    setIdMentor("");

    loadFakultas();
    loadMentor();
    setModalOpen(true);
  };

  const saveKelas = async () => {
    setLoading(true);

    const body = {
      nama_kelas,
      deskripsi,
      // Pastikan string kosong diubah menjadi null jika API mengharapkan null
      id_Fakultas: id_Fakultas || null, 
      id_Mentor: id_Mentor || null,
    };

    let res;

    if (editing) {
      res = await fetch(`/api/kelas/${editing.id_Kelas}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`/api/kelas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setLoading(false);

    if (res.ok) {
      setModalOpen(false);
      fetchData(); // Muat ulang data setelah sukses
    } else {
      const errorJson = await res.json();
      console.error("Save failed:", res.status, errorJson.error);
      alert(`Gagal menyimpan kelas: ${errorJson.error || res.statusText}`);
    }
  };

  const deleteKelas = async (item: Kelas) => {
    if (!confirm(`Hapus kelas "${item.nama_kelas}"?`)) return;

    const res = await fetch(`/api/kelas/${item.id_Kelas}`, { method: "DELETE" });
    if (res.ok) {
        fetchData(); // Muat ulang data setelah sukses hapus
    } else {
        const errorJson = await res.json();
        console.error("Delete failed:", res.status, errorJson.error);
        alert(`Gagal menghapus kelas: ${errorJson.error || res.statusText}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <SidebarAdmin />

      {/* CONTENT */}
      <div className="flex-1 ml-64 flex flex-col">

        {/* NAVBAR */}
        <div className="sticky top-0 bg-white h-16 shadow-sm z-50 flex items-center px-4">
          <Navbar />
        </div>

        {/* PAGE HEADER STICKY*/}
        <div className="sticky top-16 z-40 bg-[#F4F6F9] px-10 pt-5 pb-4 backdrop-blur">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#002D5B]">Manajemen Kelas</h1>
              <p className="text-sm text-gray-500 mt-1">Buat, edit, dan atur daftar kelas</p>
            </div>

            <button
              onClick={openAdd}
              className="bg-[#002D5B] text-white px-5 py-2 rounded-full shadow text-sm"
            >
              + Buat Kelas
            </button>
          </div>
        </div>

        {/* MAIN AREA - scrolling area and centered content to avoid sidebar overlap */}
        <div className="flex-1 px-10 pb-10 pt-4 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {/* MAIN CARD */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* FILTERS */}
              <KelasFilters
                search={search}
                setSearch={setSearch}
                setPageTo1={() => setMeta((m) => ({ ...m, page: 1 }))}
              />

              {/* TABLE (ONLY THIS PART SCROLLS) */}
              <div className="max-h-[420px] overflow-y-auto pr-2">
                {/* Tambahkan pesan loading/kosong untuk clarity */}
                {kelas.length === 0 && !loading ? (
                    <div className="text-center py-10 text-gray-500">
                        Tidak ada data kelas yang ditemukan.
                    </div>
                ) : (
                    <KelasTable
                        data={kelas}
                        onEdit={openEdit}
                        onDelete={deleteKelas}
                    />
                )}
              </div>

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <span>
                  Hal {meta.page} / {meta.totalPages} — Total {meta.total}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={meta.page <= 1}
                    onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                    className="px-3 py-1.5 rounded-full border disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                    className="px-3 py-1.5 rounded-full border disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MODAL */}
        <KelasModal
          open={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={saveKelas}
          loading={loading}
          editing={!!editing}
          nama_kelas={nama_kelas}
          setNamaKelas={setNamaKelas}
          deskripsi={deskripsi}
          setDeskripsi={setDeskripsi}
          id_Fakultas={id_Fakultas}
          id_Mentor={id_Mentor}
          setIdFakultas={setIdFakultas}
          setIdMentor={setIdMentor}
          fakultas={fakultas}
          mentor={mentor}
        />
      </div>
    </div>
  );
}