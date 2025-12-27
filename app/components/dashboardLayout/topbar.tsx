"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";

const TOKEN_KEY = "access_token";
const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));

const Topbar: React.FC = () => {
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);

  // Mengambil Base URL dari env
  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api", []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE}/me/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Ambil URL foto dari data user
          setFotoProfil(data.foto_profil);
        }
      } catch (error) {
        console.error("Gagal memuat foto topbar:", error);
      }
    };

    fetchProfile();
  }, [API_BASE]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-6 py-1">
        <div className="flex items-center gap-2 ml-0">
          <Image
            src="/logo_geniuz.png"
            alt="Logo Les-lesan Geniuz"
            width={120}
            height={40}
            priority
          />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/notifications">
            <Image
              src="/notification.svg"
              alt="Notification Icon"
              width={24}
              height={24}
              className="cursor-pointer hover:opacity-80 transition"
            />
          </Link>
          
          <Link href="/settings"> {/* Biasanya profile icon arahnya ke settings */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-200 cursor-pointer flex items-center justify-center">
              <Image
                // Tampilkan fotoProfil jika ada, jika tidak pakai default
                src={fotoProfil || "/default-profile.png"} 
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Jika link gambar rusak, balikkan ke default
                  (e.target as HTMLImageElement).src = '/default-profile.png';
                }}
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
