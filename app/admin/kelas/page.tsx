"use client";

import { useCallback, useEffect, useState } from "react";
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
  id_Fakultas?: number;
  id_Mentor?: number;
  Fakultas?: { nama_fakultas?: string | null };
  Mentor?: { nama_mentor?: string | null };
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
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
  const authHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {} as HeadersInit;
  };

  const ensureToken = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token && typeof window !== "undefined") {
      window.location.href = "/login/admin";
    }
    return token;
  };

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
    const token = ensureToken();
    if (!token) return;

    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);

    try {
      const url = `${API}/api/admin/kelas?${params.toString()}`;
      const res = await fetch(url, {
        headers: { ...authHeaders() },
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch (_) {
        json = {};
      }

      if (res.ok) {
        const normalized = (json.data || []).map((row: Kelas) => ({
          ...row,
          nama_fakultas: row.nama_fakultas ?? row.Fakultas?.nama_fakultas ?? null,
          nama_mentor: row.nama_mentor ?? row.Mentor?.nama_mentor ?? null,
        }));
        setKelas(normalized);
        setMeta(json.meta || { total: 0, page: 1, totalPages: 1, limit: 15 });
      } else {
        console.error("Gagal fetch kelas", {
          status: res.status,
          statusText: res.statusText,
          url,
          body: json,
        });
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("admin_token");
          window.location.href = "/login/admin";
        }
      }
    } catch (err) {
      console.error("Fetch kelas exception", err);
    }
  }, [API, page, search]);

  const loadFakultas = async () => {
    const token = ensureToken();
    if (!token) return;
    const url = `${API}/api/admin/fakultas`;
    const res = await fetch(url, {
      headers: { ...authHeaders() },
    });
    let json: any = {};
    try {
      json = await res.json();
    } catch (_) {
      json = {};
    }

    if (res.ok) setFakultas(json.data || json.fakultas || []);
    else {
      console.error("Gagal fetch fakultas", { status: res.status, statusText: res.statusText, url, body: json });
      alert(json.error || "Gagal memuat fakultas");
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("admin_token");
        window.location.href = "/login/admin";
      }
    }
  };

  const loadMentor = async () => {
    const token = ensureToken();
    if (!token) return;
    const url = `${API}/api/admin/mentor`;
    const res = await fetch(url, {
      headers: { ...authHeaders() },
    });
    let json: any = {};
    try {
      json = await res.json();
    } catch (_) {
      json = {};
    }


    if (res.ok) setMentor(json.data || json.mentor || []);
    else {
      console.error("Gagal fetch mentor", { status: res.status, statusText: res.statusText, url, body: json });
      alert(json.error || "Gagal memuat mentor");
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("admin_token");
        window.location.href = "/login/admin";
      }
    }
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
    setIdFakultas(item.id_Fakultas ? String(item.id_Fakultas) : "");
    setIdMentor(item.id_Mentor ? String(item.id_Mentor) : "");

    loadFakultas();
    loadMentor();
    setModalOpen(true);
  };

  const saveKelas = async () => {
    setLoading(true);

    if (!id_Fakultas) {
      setLoading(false);
      alert("Fakultas wajib dipilih");
      return;
    }

    const body = {
      nama_kelas,
      deskripsi,
      id_Fakultas,
      id_Mentor: id_Mentor || null,
    };

    const token = ensureToken();
    if (!token) {
      setLoading(false);
      return;
    }

    let res;

    if (editing) {
      res = await fetch(`${API}/api/admin/kelas/${editing.id_Kelas}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`${API}/api/admin/kelas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
    }

    setLoading(false);

    if (res.ok) {
      setModalOpen(false);
      fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Gagal menyimpan kelas");
    }
  };

  const deleteKelas = async (item: Kelas) => {
    if (!confirm(`Hapus kelas "${item.nama_kelas}"?`)) return;

    try {
        const token = ensureToken();
        if (!token) return;
      const res = await fetch(`${API}/api/admin/kelas/${item.id_Kelas}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const json = await res.json();

      if (!res.ok) {
            alert(json.error || "Gagal menghapus kelas");
        return;
      }
      fetchData();
    } catch (error) {
      console.error("Gagal connect ke server", error);
      alert("Terjadi kesalahan koneksi");
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