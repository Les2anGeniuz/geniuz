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
  nama_kelas?: string;
  deskripsi?: string;
};

type DashKelasSayaRes = {
  kelas_saya?: KelasRow[];
};

type UserData = {
  name: string;
  fakultas: string;
  classes: Array<{ label: string; slug: string }>;
};

const TOKEN_KEY = "access_token";
const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
const clearToken = () => typeof window !== "undefined" && localStorage.removeItem(TOKEN_KEY);

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

const Sidebar: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({ name: "", fakultas: "", classes: [] });
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

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

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request gagal ${res.status}: ${text}`);
      }

      return (await res.json()) as T;
    };

    (async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const [profile, kelasSaya] = await Promise.all([
          apiGet<DashProfile>("/dashboard/profile", token),
          apiGet<DashKelasSayaRes>("/dashboard/kelas-saya", token),
        ]);

        const name = profile?.nama_lengkap?.trim() || "User";
        const fakultas = profile?.nama_fakultas?.trim() || "-";

        const kelasRows = Array.isArray(kelasSaya?.kelas_saya) ? kelasSaya.kelas_saya : [];
        const classes = kelasRows
          .map((k) => {
            const label = (k?.nama_kelas || "").trim();
            if (!label) return null;
            return { label, slug: slugify(label) };
          })
          .filter(Boolean) as Array<{ label: string; slug: string }>;

        setUserData({ name, fakultas, classes });
      } catch (e) {
        console.error("[Sidebar] Error:", e);
        setUserData({ name: "User", fakultas: "-", classes: [] });
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API_BASE, router]);

  const handleLogout = () => {
    clearToken();
    router.replace("/login");
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(path + "/");
    const base =
      "flex items-center gap-3 p-2 rounded-md ml-4 transition-all duration-200 text-sm font-medium w-full cursor-pointer";
    return isActive
      ? `${base} bg-[#064479] text-white shadow-md`
      : `${base} text-[#0a4378] hover:bg-gray-100`;
  };

  return (
    <div className="fixed top-16 left-0 h-full w-64 bg-white shadow-xl z-40 border-r border-gray-100 flex flex-col">
      {/* CSS untuk menyembunyikan scrollbar di seluruh browser */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* 1. SECTION PROFIL (STATIS) */}
      <div className="p-4 pt-6 space-y-6">
        <div className="mb-2 flex flex-col items-start ml-4 mt-2">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="font-bold text-lg text-[#0a4378] capitalize truncate w-48" title={userData.name}>
                {userData.name}
              </div>
              <span className="text-xs text-gray-500 font-medium mt-1">{userData.fakultas}</span>
            </>
          )}
        </div>

        {/* 2. SECTION MENU UTAMA (STATIS) */}
        <div>
          <div className="ml-4 mb-3 font-bold text-[#064479] text-xs uppercase tracking-wider opacity-80">Menu Utama</div>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                <Image src="/home.svg" alt="Home" width={20} height={20} className={pathname === "/dashboard" ? "brightness-0 invert" : ""} />
                <span>Beranda</span>
              </Link>
            </li>
            <li>
              <Link href="/settings" className={getLinkClass("/settings")}>
                <Image src="/setting.svg" alt="Settings" width={20} height={20} className={pathname === "/settings" ? "brightness-0 invert" : ""} />
                <span>Pengaturan</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. SECTION KELAS SAYA (Hanya bagian ini yang scroll & scrollbar sembunyi) */}
      <div className="flex-grow overflow-hidden flex flex-col min-h-0">
        <div className="ml-8 mb-3 font-bold text-[#064479] text-xs uppercase tracking-wider opacity-80">Kelas Saya</div>
        <div className="flex-grow overflow-y-auto no-scrollbar px-4 pb-4">
          <ul className="flex flex-col gap-2">
            {userData.classes.length > 0 ? (
              userData.classes.map((c, idx) => (
                <li key={`${c.slug}-${idx}`}>
                  <Link href={`/kelas/${c.slug}`} className={getLinkClass(`/kelas/${c.slug}`)}>
                    <Image src="/course.svg" alt="Course" width={20} height={20} />
                    <span className="truncate">{c.label}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-xs text-gray-400 italic ml-4">Belum ada kelas aktif.</li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. SECTION LOGOUT (STATIS DI BAWAH) */}
      <div className="p-4 border-t border-gray-100 mb-16 bg-white">
        <button onClick={handleLogout} className="flex items-center gap-3 p-2 rounded-md ml-4 transition text-sm font-medium w-full text-[#0a4378] hover:bg-gray-100">
          <Image src="/logout.svg" alt="Logout" width={20} height={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;