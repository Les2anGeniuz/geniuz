"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DashProfile = {
  nama_lengkap?: string | null;
  nama_fakultas?: string | null;
};

type DashOverview = {
  total_kelas?: number;
  tugas_selesai?: number;
  progress?: number;
};

const TOKEN_KEY = "access_token";
const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
const clearToken = () => typeof window !== "undefined" && localStorage.removeItem(TOKEN_KEY);

const Overview: React.FC = () => {
  const [profile, setProfile] = useState<DashProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    completedTasks: 0,
    progress: 0,
  });

  const router = useRouter();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    const apiGet = async <T,>(path: string, token: string): Promise<T> => {
      const url = `${API_BASE}${path}`;
      console.log("[Overview] FETCH:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (res.status === 401) {
        clearToken();
        router.replace("/login");
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request gagal ${res.status}: ${text}`);
      }

      return (await res.json()) as T;
    };

    (async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const [prof, ov] = await Promise.all([
          apiGet<DashProfile>("/dashboard/profile", token),
          apiGet<DashOverview>("/dashboard/overview", token),
        ]);

        setProfile(prof);

        setStatistics({
          totalClasses: Number(ov?.total_kelas ?? 0),
          completedTasks: Number(ov?.tugas_selesai ?? 0),
          progress: Number(ov?.progress ?? 0),
        });
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("[Overview] Error:", e);
        setErrorMsg(e?.message || "Terjadi kesalahan sistem.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API_BASE, router]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-500">Memuat data belajar...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-black mb-3">Overview</h1>
        <div className="w-[600px] bg-white border border-red-200 rounded-xl p-6 shadow-sm">
          <p className="text-red-600 font-semibold">Gagal memuat data</p>
          <p className="text-gray-600 mt-1">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const fullName = profile?.nama_lengkap || "Siswa";
  const initial = fullName.charAt(0).toUpperCase();
  const faculty = profile?.nama_fakultas || "Fakultas Belum Terdaftar";

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-black mb-3">Overview</h1>

      <div className="w-[600px] bg-white border border-gray-200 rounded-xl p-6 mb-6 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden">
            <span className="text-4xl font-bold text-gray-400">{initial}</span>
          </div>
        </div>

        <div className="flex-grow text-center md:text-left">
          <h2 className="text-3xl font-bold text-[#09090b] mb-1 leading-tight">
            Semangat Belajar, <br className="hidden md:block" />
            {fullName}!
          </h2>
          <p className="text-blue-500 font-bold text-base">{faculty}</p>
        </div>
      </div>

      <div className="flex justify-between w-[600px] gap-6">
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <span className="text-gray-500 font-medium text-sm">Kelas Diikuti</span>
          <span className="text-2xl font-bold text-[#09090b]">{statistics.totalClasses}</span>
        </div>

        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <span className="text-gray-500 font-medium text-sm">Tugas Selesai</span>
          <span className="text-2xl font-bold text-[#09090b]">{statistics.completedTasks}</span>
        </div>

        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <span className="text-gray-500 font-medium text-sm">Progress Belajar</span>
          <span className="text-2xl font-bold text-[#09090b]">{statistics.progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default Overview;
