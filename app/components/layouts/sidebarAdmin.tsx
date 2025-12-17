"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
  name: string;
  fakultas: string;
  classes: string[];
}

const SidebarAdmin: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    fakultas: "",
    classes: [],
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth session error", error);
        }

        const session = data.session;
        const token = session?.access_token;

        if (!token) return;

        const res = await fetch(`/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("/api/me returned", res.status);
          return;
        }

        const body = await res.json();

        setUserData({
          name: body.nama_lengkap || "",
          fakultas: body.nama_fakultas || "",
          classes: body.classes || [],
        });
      } catch (err) {
        console.error("fetchUserData error", err);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40">
      <div className="flex flex-col p-4 space-y-6 h-full">
        <div className="mb-4 flex flex-col items-start ml-2">
          <div className="font-bold text-lg text-[#0a4378]">{userData.name || "Loading..."}</div>
          <span className="text-sm text-gray-500">{userData.fakultas || ""}</span>
        </div>

        <div className="ml-2 mb-3 font-semibold text-[#064479] text-sm">Menu Utama</div>

        <ul className="flex flex-col gap-3 font-medium text-[#0a4378]">
          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-2 transition">
            <Image src="/beranda.svg" alt="Home Icon" width={18} height={18} />
            <Link href="/" className="text-sm">Beranda</Link>
          </li>

          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-2 transition">
            <Image src="/setting.svg" alt="Settings Icon" width={18} height={18} />
            <Link href="/settings" className="text-sm">Pengaturan</Link>
          </li>

          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-2 transition">
            <Image src="/callService.svg" alt="Call Service Icon" width={18} height={18} />
            <Link href="/call-service" className="text-sm">Call Service</Link>
          </li>

          <li className="ml-2">
            <div className="font-semibold text-[#064479] text-sm">Kelas Saya</div>
            <ul className="flex flex-col gap-2 mt-2">
              {userData.classes.length > 0 ? (
                userData.classes.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-0 transition">
                    <Image src="/course.svg" alt="Course Icon" width={18} height={18} />
                    <Link href={`/kelas/${encodeURIComponent(item)}`} className="text-sm">
                      {item}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">Tidak ada kelas yang diambil.</li>
              )}
            </ul>
          </li>
        </ul>

        <div className="mt-auto flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-2 transition cursor-pointer" onClick={handleLogout}>
          <Image src="/logout.svg" alt="Logout Icon" width={18} height={18} />
          <span className="text-sm">Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
