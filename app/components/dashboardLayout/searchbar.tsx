"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type KelasRow = {
  id_Kelas?: string | number;
  id_Fakultas?: string | number;
  nama_kelas?: string;
};

type DashKelasSayaRes = {
  kelas_saya?: KelasRow[];
  data?: KelasRow[]; // fallback kalau API kamu pakai data
};

type SearchResult = {
  id: string | number;
  title: string;
  href: string;
};

const TOKEN_KEY = "access_token";
const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
const clearToken = () =>
  typeof window !== "undefined" && localStorage.removeItem(TOKEN_KEY);

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<SearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

  // ✅ ambil data kelas saya untuk jadi sumber search
  useEffect(() => {
    const controller = new AbortController();

    const fetchKelasSaya = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch(`${API_BASE}/dashboard/kelas-saya`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (res.status === 401) {
          clearToken();
          return;
        }

        const json = (await res.json()) as DashKelasSayaRes;

        const rows =
          (Array.isArray(json?.kelas_saya) && json.kelas_saya) ||
          (Array.isArray(json?.data) && json.data) ||
          [];

        const mapped: SearchResult[] = rows
          .map((k) => {
            const idKelas = k.id_Kelas ?? "";
            const idFakultas = k.id_Fakultas ?? "11";
            const title = (k.nama_kelas || "").trim();
            if (!title || !idKelas) return null;

            return {
              id: idKelas,
              title,
              href: `/Kelas/${idFakultas}/${idKelas}`,
            } as SearchResult;
          })
          .filter(Boolean) as SearchResult[];

        setClasses(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") console.error(e);
      }
    };

    fetchKelasSaya();
    return () => controller.abort();
  }, [API_BASE]);

  // ✅ filter hasil berdasarkan input
  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return classes
      .filter((it) => it.title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [classes, searchQuery]);

  // ✅ close dropdown kalau klik di luar
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setOpen(true);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Enter = buka dropdown hasil (kalau ada)
    setOpen(true);
  };

  return (
    <div ref={containerRef}>
      <form
        onSubmit={handleSearchSubmit}
        className="flex position-sticky top-20px items-center w-[250px] border border-[#41475E] rounded-md p-2 shadow-md absolute top-24 right-10 bg-white"
      >
        <Image
          src="/searchIcon.svg"
          alt="Search Icon"
          width={20}
          height={20}
          className="mr-3"
        />

        <input
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setOpen(true)}
          placeholder="Search for Trainings"
          className="w-full p-1 text-sm border-none outline-none"
        />
      </form>

      {/* Dropdown hasil */}
      {open && searchQuery.trim() !== "" && (
        <div className="absolute top-[calc(6rem+52px)] right-10 w-[350px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
          {results.length > 0 ? (
            <div className="py-1">
              {results.map((it) => (
                <Link
                  key={String(it.id)}
                  href={it.href}
                  className="block px-4 py-3 hover:bg-gray-50"
                  onClick={() => {
                    setSearchQuery("");
                    setOpen(false);
                  }}
                >
                  <div className="text-sm font-semibold text-[#0f172a] truncate">
                    {it.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    Klik untuk masuk kelas
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              Tidak ada hasil untuk “{searchQuery}”
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
