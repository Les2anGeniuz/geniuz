"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/layouts/sidebarAdmin";
import Navbar from "../../components/layouts/navbarAdmin";

import SiswaStats from "../../components/siswa/SiswaStats";
import SiswaFilters from "../../components/siswa/SiswaFilters";
import SiswaTable from "../../components/siswa/SiswaTable";

export interface StudentRow {
  id_user: string;
  nama_lengkap: string;
  email: string;
  fakultas: string | null;
  tanggal_pendaftaran: string | null;
  status: string | null;
}

interface Meta {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

interface Stats {
  total: number;
  aktif: number;
  avgProgress: number;
  newRegistrations: number;
}

export default function SiswaPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const authHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const [data, setData] = useState<StudentRow[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 15,
  });


  const [stats, setStats] = useState<Stats>({
    total: 0,
    aktif: 0,
    avgProgress: 0,
    newRegistrations: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "aktif" | "pending" | "ditolak">("all");
  const page = meta.page;

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(meta.limit),
      });

      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);

      const res = await fetch(`${backendUrl}/api/admin/siswa?${params.toString()}`, {
        headers: { ...authHeaders() },
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch (e) {
        console.error("Failed to parse JSON", e);
      }

      if (res.ok) {
        const incomingMeta = json.meta || {};
        setData(json.data || []);
        setMeta({
          total: incomingMeta.total ?? 0,
          page: incomingMeta.page ?? 1,
          totalPages: incomingMeta.totalPages ?? incomingMeta.totalPage ?? 1,
          limit: incomingMeta.limit ?? meta.limit,
        });

        const safeStats = json.stats || {
          total: incomingMeta.total ?? 0,
          aktif: incomingMeta.total ?? 0,
          avgProgress: 0,
          newRegistrations: 0,
        };
        setStats(safeStats);
      } else {
        console.error({ status: res.status, statusText: res.statusText, body: json });
      }
    } catch (err) {
      console.error("fetch siswa failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [backendUrl, search, status, page]);

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <SidebarAdmin />

      {/* CONTENT */}
      <div className="flex-1 ml-64 flex flex-col">

        {/* NAVBAR */}
        <div className="sticky top-0 bg-white h-16 shadow-sm z-50 flex items-center px-4">
          <Navbar />
        </div>

        {/* PAGE HEADER + STATS */}
        <div className="sticky top-16 z-40 bg-[#F4F6F9] px-10 pt-5 pb-4 backdrop-blur">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#002D5B]">Manajemen Siswa</h1>
              <p className="text-sm text-gray-500 mt-1">
                Lacak progres siswa dan kelola pendaftaran
              </p>
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 px-10 pb-10 pt-4 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* CARD UTAMA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* FILTERS */}
              <SiswaFilters
                search={search}
                setSearch={(value) => {
                  setSearch(value);
                  setMeta((m) => ({ ...m, page: 1 }));
                }}
                status={status}
                setStatus={(value) => {
                  setStatus(value);
                  setMeta((m) => ({ ...m, page: 1 }));
                }}
              />

              {/* TABEL */}
              <div className="max-h-[420px] overflow-y-auto pr-2 mt-4">
                <SiswaTable data={data} />
              </div>

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <span>
                  Hal {meta.page} / {meta.totalPages} — Total {meta.total}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={meta.page <= 1}
                    onClick={() =>
                      setMeta((m) => ({ ...m, page: m.page - 1 }))
                    }
                    className="px-3 py-1.5 rounded-full border disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() =>
                      setMeta((m) => ({ ...m, page: m.page + 1 }))
                    }
                    className="px-3 py-1.5 rounded-full border disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
