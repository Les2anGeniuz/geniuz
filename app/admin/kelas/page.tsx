"use client";

import { useEffect, useState } from "react";
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

  const [fakultas, setFakultas] = useState<any[]>([]);
  const [mentor, setMentor] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const page = meta.page;

  const fetchData = async () => {
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);

    const res = await fetch(`/api/kelas?${params.toString()}`);
    const json = await res.json();

    if (res.ok) {
      setKelas(json.data);
      setMeta(json.meta);
    }
  };

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
  }, [search, page]);

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
      fetchData();
    }
  };

  const deleteKelas = async (item: Kelas) => {
    if (!confirm(`Hapus kelas "${item.nama_kelas}"?`)) return;

    const res = await fetch(`/api/kelas/${item.id_Kelas}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div className="flex min-h-screen bg-[#F3F6FA]">
      <SidebarAdmin />

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 flex flex-col">

        {/* NAVBAR */}
        <div className="sticky top-0 bg-white shadow-sm h-16 flex items-center z-30">
          <Navbar />
        </div>

        {/* PAGE CONTENT AREA */}
        <div className="flex-1 px-10 pb-8">

          {/* PAGE HEADER STICKY */}
          <div className="sticky top-16 bg-[#F3F6FA] pt-6 pb-4 z-20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-[#002D5B]">Manajemen Kelas</h1>
                <p className="text-sm text-gray-500">Buat, edit, dan atur daftar kelas</p>
              </div>

              <button
                onClick={openAdd}
                className="bg-[#002D5B] text-white px-5 py-2 rounded-full shadow text-sm"
              >
                + Buat Kelas
              </button>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-4">

            {/* FILTERS */}
            <KelasFilters
              search={search}
              setSearch={setSearch}
              setPageTo1={() => setMeta((m) => ({ ...m, page: 1 }))}
            />

            {/* TABLE (ONLY THIS PART SCROLLS) */}
            <div className="max-h-[420px] overflow-y-auto pr-2">
              <KelasTable
                data={kelas}
                onEdit={openEdit}
                onDelete={deleteKelas}
              />
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