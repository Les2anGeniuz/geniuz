"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type DashProfile = {
  nama_lengkap?: string | null;
  nama_fakultas?: string | null;
  email?: string | null;
};

type KelasRow = {
  id_Kelas?: string | number;
  id_Fakultas?: string | number;
  nama_kelas?: string;
};

type DashKelasSayaRes = {
  kelas_saya?: KelasRow[];
};

type UserData = {
  name: string;
  fakultas: string;
  classes: Array<{ label: string; idKelas: string | number; idFakultas: string | number }>;
};

const TOKEN_KEY = "access_token";
const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
const clearToken = () => typeof window !== "undefined" && localStorage.removeItem(TOKEN_KEY);

const Sidebar: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({ name: "", fakultas: "", classes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api", []);

  const handleLogout = () => {
    clearToken();
    router.replace("/login");
  };

  useEffect(() => {
    const controller = new AbortController();
    const apiGet = async <T,>(path: string, token: string): Promise<T> => {
      const url = `${API_BASE}${path}`;
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
      return (await res.json()) as T;
    };

    (async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        if (!token) return;

        const [profile, kelasSaya] = await Promise.all([
          apiGet<DashProfile>("/dashboard/profile", token),
          apiGet<DashKelasSayaRes>("/dashboard/kelas-saya", token),
        ]);

        const kelasRows = Array.isArray(kelasSaya?.kelas_saya) ? kelasSaya.kelas_saya : [];
        const classes = kelasRows.map((k) => ({
          label: (k?.nama_kelas || "").trim(),
          idKelas: k.id_Kelas ?? "",
          idFakultas: k.id_Fakultas ?? "11"
        })).filter(c => c.label !== "");

        setUserData({ 
          name: profile?.nama_lengkap?.trim() || "User", 
          fakultas: profile?.nama_fakultas?.trim() || "-", 
          classes 
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [API_BASE, router]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(path + "/");
    const base = "flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200 text-sm font-medium w-full cursor-pointer";
    return isActive
      ? `${base} bg-[#064479] text-white shadow-md`
      : `${base} text-[#0a4378] hover:bg-gray-100`;
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-sm z-50 border-r border-gray-100 flex flex-col">
      {/* CSS untuk menyembunyikan scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* 1. PROFIL - Disesuaikan agar pas di bawah Topbar */}
      <div className="p-6 pt-24"> {/* pt-24 memberikan ruang agar profil tidak tertutup Topbar */}
        <div className="font-bold text-lg text-[#0a4378] truncate w-full" title={userData.name}>
          {userData.name}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{userData.fakultas}</div>
      </div>

      {/* 2. MENU UTAMA */}
      <div className="px-4 mb-4">
        <div className="mb-2 font-bold text-[#064479] text-[10px] uppercase tracking-widest opacity-50 px-2">Menu Utama</div>
        <ul className="space-y-1">
          <li>
            <Link href="/dashboard" className={getLinkClass("/dashboard")}>
              <Image src="/home.svg" alt="Home" width={18} height={18} className={pathname === "/dashboard" ? "brightness-0 invert" : ""} />
              <span>Beranda</span>
            </Link>
          </li>
          <li>
            <Link href="/settings" className={getLinkClass("/settings")}>
              <Image src="/setting.svg" alt="Settings" width={18} height={18} className={pathname === "/settings" ? "brightness-0 invert" : ""} />
              <span>Pengaturan</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* 3. KELAS SAYA */}
      <div className="flex-grow flex flex-col min-h-0 px-4">
        <div className="mb-2 font-bold text-[#064479] text-[10px] uppercase tracking-widest opacity-50 px-2">Kelas Saya</div>
        <div className="flex-grow overflow-y-auto no-scrollbar pb-6">
          <ul className="space-y-1">
            {userData.classes.map((c, idx) => {
              const classPath = `/Kelas/${c.idFakultas}/${c.idKelas}`;
              return (
                <li key={`${c.idKelas}-${idx}`}>
                  <Link href={classPath} className={getLinkClass(classPath)}>
                    <Image src="/course.svg" alt="Course" width={18} height={18} className={pathname.startsWith(classPath) ? "brightness-0 invert" : ""} />
                    <span className="truncate block flex-1">{c.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* 4. LOGOUT - Warna Gelap */}
      <div className="p-4 border-t border-gray-50 mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 py-2 px-4 rounded-lg transition-all text-sm font-semibold w-full text-gray-800 hover:bg-gray-100">
          <Image src="/logout.svg" alt="Logout" width={18} height={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;