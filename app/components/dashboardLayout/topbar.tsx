"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

const Topbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-6 py-1">
        
        {/* === LOGO === */}
        <div className="flex items-center gap-2 ml-0">
          <Image
            src="/logo_geniuz.png"
            alt="Logo Les-lesan Geniuz"
            width={120}
            height={40}
            priority
          />
        </div>

        {/* === PROFILE AND NOTIFICATION ICON === */}
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
          
          <Link href="/profile">
            {/* WRAPPER LINGKARAN (Div Pembungkus)
               - w-10 h-10: Ukuran fix
               - rounded-full: Membuat lingkaran
               - overflow-hidden: Memastikan gambar tidak keluar dari lingkaran
               - bg-gray-200: Warna dasar abu-abu (polosan) jika gambar tidak ada
            */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-200 cursor-pointer flex items-center justify-center">
              <Image 
                src="/default-profile.png" 
                alt="Profile"
                className="w-full h-full object-cover"
                width={40}
                height={40}
                // Fungsi ini akan berjalan jika gambar tidak ditemukan (error)
                onError={(e) => {
                  // Menyembunyikan gambar yang rusak agar hanya terlihat background abu-abu (polosan)
                  (e.target as HTMLImageElement).style.display = 'none';
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