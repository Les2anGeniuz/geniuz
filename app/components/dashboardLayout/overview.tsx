"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "access_token";
const getToken = () => typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

const Overview: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [fotoProfil, setFotoProfil] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({ totalClasses: 0, completedTasks: 0, progress: 0 });

  const router = useRouter();
  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api", []);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) { router.replace("/login"); return; }

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [pRes, mRes, oRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/profile`, { headers }),
          fetch(`${API_BASE}/me/profile`, { headers }),
          fetch(`${API_BASE}/dashboard/overview`, { headers })
        ]);

        const prof = await pRes.json();
        const me = await mRes.json();
        const ov = await oRes.json();

        setProfile(prof);
        setFotoProfil(me?.foto_profil || "");
        setStatistics({
          totalClasses: ov.total_kelas || 0,
          completedTasks: ov.tugas_selesai || 0,
          progress: ov.progress || 0
        });
      } catch (e) {
        console.error("Overview Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE, router]);

  if (loading) return (
    <div className="w-[600px] h-64 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  const fullName = profile?.nama_lengkap || "Siswa";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-black mb-3">Overview</h1>

      {/* Profil Card - Lebar Tetap w-[600px] */}
      <div className="w-[600px] bg-white border border-gray-200 rounded-xl p-6 mb-6 flex items-center gap-6 shadow-sm">
        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden relative flex items-center justify-center">
          {fotoProfil ? (
            <Image src={fotoProfil} alt="Foto Profil" fill className="object-cover" />
          ) : (
            <span className="text-4xl font-bold text-gray-400">{initial}</span>
          )}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#09090b] leading-tight">
            Semangat Belajar, <br /> {fullName}!
          </h2>
          <p className="text-blue-500 font-bold text-base mt-1">{profile?.nama_fakultas || "Fakultas Data"}</p>
        </div>
      </div>

      {/* Statistics Cards - Total Lebar w-[600px] */}
      <div className="flex justify-between w-[600px] gap-6">
        {[
          { label: "Kelas Diikuti", value: statistics.totalClasses, suffix: "" },
          { label: "Tugas Selesai", value: statistics.completedTasks, suffix: "" },
          { label: "Progress Belajar", value: statistics.progress, suffix: "%" }
        ].map((item, idx) => (
          <div key={idx} className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
            <span className="text-gray-500 font-medium text-sm">{item.label}</span>
            <span className="text-2xl font-bold text-[#09090b]">{item.value}{item.suffix}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;