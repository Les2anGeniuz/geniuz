"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type KelasRow = {
  id_Kelas?: string | number;
  id_Fakultas?: string | number;
  id_Mentor?: string | number | null;
  nama_kelas?: string;
  thumbnail_url?: string | null;
  mentor_nama?: string | null;
  mentor_foto?: string | null;
};

type DashKelasSayaRes = {
  kelas_saya?: KelasRow[];
  data?: KelasRow[];
};

type MentorRow = {
  id_Mentor?: string | number;
  id_Fakultas?: string | number;
  nama_mentor?: string | null;
  deskripsi?: string | null;
  email?: string | null;
  status?: string | null;
};

type MentorRes = {
  mentor?: MentorRow[];
};

const TOKEN_KEY = "access_token";
const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
const clearToken = () =>
  typeof window !== "undefined" && localStorage.removeItem(TOKEN_KEY);

const toNumberSafe = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const hashString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const pickMentorById = (mentors: MentorRow[], idMentor: any) =>
  mentors.find((x) => String(x.id_Mentor ?? "") === String(idMentor ?? "")) ||
  null;

const pickMentorForClass = (mentors: MentorRow[], idFakultas: any, idKelas: any, idMentor?: any) => {
  if (idMentor != null && String(idMentor) !== "") {
    const m = pickMentorById(mentors, idMentor);
    if (m) return m;
  }
  const list = mentors.filter((m) => String(m.id_Fakultas ?? "") === String(idFakultas ?? ""));
  if (list.length === 0) return null;
  const key = toNumberSafe(idKelas) !== 0 ? toNumberSafe(idKelas) : hashString(String(idKelas ?? ""));
  return list[key % list.length];
};

const ClassCards: React.FC = () => {
  const [kelas, setKelas] = useState<KelasRow[]>([]);
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchAll = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const [kelasRes, mentorRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/kelas-saya`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/mentor`, {
            method: "GET",
            signal: controller.signal,
          }),
        ]);

        if (kelasRes.status === 401) {
          clearToken();
          router.replace("/login");
          return;
        }

        const kelasJson = (await kelasRes.json()) as DashKelasSayaRes;
        const mentorJson = (await mentorRes.json().catch(() => ({}))) as MentorRes;

        const rows =
          (Array.isArray(kelasJson?.kelas_saya) && kelasJson.kelas_saya) ||
          (Array.isArray(kelasJson?.data) && kelasJson.data) ||
          [];

        const normalized = rows
          .map((k) => ({
            id_Kelas: k.id_Kelas ?? "",
            id_Fakultas: k.id_Fakultas ?? "11",
            id_Mentor: (k as any).id_Mentor ?? null,
            nama_kelas: (k.nama_kelas || "").trim(),
            thumbnail_url: k.thumbnail_url ?? null,
            mentor_nama: (k as any).mentor_nama ?? null,
            mentor_foto: (k as any).mentor_foto ?? null,
          }))
          .filter((k) => k.nama_kelas);

        setKelas(normalized);
        setMentors(Array.isArray(mentorJson?.mentor) ? mentorJson.mentor : []);
      } catch (e) {
        console.error(e);
        setKelas([]);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    return () => controller.abort();
  }, [API_BASE, router]);

  return (
    /* Perbaikan utama: Menggunakan lebar maksimal 1224px agar sejajar dengan komponen atas */
    <div className="max-w-[1224px] w-full mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[40px] font-extrabold text-[#0f172a]">Kelas</h2>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-20 text-center">Memuat kelas...</div>
      ) : kelas.length === 0 ? (
        <div className="text-gray-400 text-sm py-20 text-center">Belum ada kelas diikuti.</div>
      ) : (
        /* Gap disesuaikan agar pas menempati seluruh lebar 1224px */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          {kelas.map((k) => {
            const idF = k.id_Fakultas ?? "11";
            const idK = k.id_Kelas ?? "";
            const href = `/Kelas/${idF}/${idK}`;
            const cover = (k.thumbnail_url || "").trim() || "/Frame 2610785.svg";

            let mentorNama = (k.mentor_nama || "").trim();
            let mentorFoto = (k.mentor_foto || "").trim();

            if (!mentorNama) {
              const picked = pickMentorForClass(mentors, idF, idK, k.id_Mentor);
              mentorNama = (picked?.nama_mentor || "Mentor").trim();
            }

            const mentorInitial = mentorNama ? mentorNama.charAt(0).toUpperCase() : "M";
            const hasFoto = mentorFoto !== "";

            return (
              <Link
                key={`${idF}-${idK}-${k.nama_kelas}`}
                href={href}
                className="block h-full group"
              >
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  {/* Thumbnail Area */}
                  <div className="relative w-full aspect-[1.4/1] bg-gray-100 flex-shrink-0">
                    <Image
                      src={cover}
                      alt={k.nama_kelas || "Kelas"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-[22px] font-extrabold text-[#0f172a] leading-tight line-clamp-2 min-h-[56px] mb-4">
                      {k.nama_kelas}
                    </h3>

                    <div className="h-px bg-gray-100 w-full mb-5" />

                    <div className="mt-auto flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 relative flex items-center justify-center border border-gray-50">
                        {hasFoto ? (
                          <Image src={mentorFoto} alt={mentorNama} fill className="object-cover" />
                        ) : (
                          <span className="text-base font-bold text-gray-400">{mentorInitial}</span>
                        )}
                      </div>

                      <div className="leading-tight">
                        <div className="text-sm font-bold text-[#0f172a]">{mentorNama}</div>
                        <div className="text-xs text-gray-500 font-medium">Mentor</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassCards;