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
  mentors.find((x) => String(x.id_Mentor ?? "") === String(idMentor ?? "")) || null;

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
    <div className="w-full mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-extrabold text-[#0f172a]">Kelas</h2>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-10 text-center">Memuat kelas...</div>
      ) : kelas.length === 0 ? (
        <div className="text-gray-400 text-sm py-10 text-center">Belum ada kelas.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 auto-rows-fr">
          {kelas.map((k) => {
            const idF = k.id_Fakultas ?? "11";
            const idK = k.id_Kelas ?? "";
            const href = `/Kelas/${idF}/${idK}`;
            const cover = (k.thumbnail_url || "").trim() || "https://placehold.co/600x360";

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
                className="block h-full"
              >
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition h-full flex flex-col cursor-pointer">
                  <div className="relative w-full aspect-[16/9] bg-gray-100 flex-shrink-0">
                    <Image src={cover} alt={k.nama_kelas || "Kelas"} fill className="object-cover" />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-2xl font-extrabold text-[#0f172a] leading-tight line-clamp-2 min-h-[64px]">
                      {k.nama_kelas}
                    </h3>

                    <div className="h-px bg-gray-200 my-4" />

                    <div className="mt-auto flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 relative flex items-center justify-center">
                        {hasFoto ? (
                          <Image src={mentorFoto} alt={mentorNama} fill className="object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-gray-600">{mentorInitial}</span>
                        )}
                      </div>

                      <div className="leading-tight">
                        <div className="text-sm font-bold text-[#0f172a]">{mentorNama}</div>
                        <div className="text-sm text-gray-500">Mentor</div>
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
