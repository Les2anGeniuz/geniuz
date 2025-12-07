"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

interface UserData {
  name: string;
  fakultas: string;
  classes: string[];
}

const Sidebar: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    fakultas: "",
    classes: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Cek Auth User (Login pakai apa?)
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user || !user.email) {
        return; 
      }

      // Default data sementara
      let currentName = user.email.split('@')[0];
      let currentFakultas = "-";
      let classesList: string[] = [];

      try {
        // 2. Ambil data User dari tabel 'User' berdasarkan Email
        // Kita butuh 'id_User' (angka) untuk query ke tabel Pendaftaran
        const { data: dbUser } = await supabase
          .from("User")
          .select("id_User, nama_lengkap, fakultas") // Pastikan kolom id_User diambil
          .eq("email", user.email)
          .single();

        if (dbUser) {
          currentName = dbUser.nama_lengkap || currentName;
          currentFakultas = dbUser.fakultas || "-";

          // 3. Ambil Kelas dari tabel 'Pendaftaran' menggunakan 'id_User'
          // Kita relasikan ke tabel 'Kelas' untuk ambil namanya
          const { data: pendaftaranData } = await supabase
            .from("Pendaftaran")
            .select(`
              Kelas (
                nama_kelas
              )
            `)
            .eq("id_User", dbUser.id_User); // Pakai id_User dari database, bukan auth user.id

          if (pendaftaranData) {
            // Mapping data agar jadi array string nama kelas saja
            // @ts-ignore (Mengabaikan warning typescript jika struktur join agak kompleks)
            classesList = pendaftaranData
              .map((item: any) => item.Kelas?.nama_kelas)
              .filter((name: string) => name); 
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }

      // 4. Update State
      setUserData({
        name: currentName,
        fakultas: currentFakultas,
        classes: classesList,
      });

      setIsLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(path + "/");
    const base = "flex items-center gap-3 p-2 rounded-md ml-4 transition-all duration-200 text-sm font-medium w-full cursor-pointer";

    if (isActive) {
      return `${base} bg-[#064479] text-white shadow-md`;
    }
    return `${base} text-[#0a4378] hover:bg-gray-100`;
  };

  return (
    <div className="fixed top-16 left-0 h-full w-64 bg-white shadow-xl z-40 border-r border-gray-100">
      <div className="flex flex-col p-4 space-y-6 h-full pb-20 overflow-y-auto">
        
        {/* User Info */}
        <div className="mb-2 flex flex-col items-start ml-4 mt-2">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
               <div className="h-5 w-32 bg-gray-200 rounded"></div>
               <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="font-bold text-lg text-[#0a4378] capitalize truncate w-48">
                {userData.name}
              </div>
              <span className="text-xs text-gray-500 font-medium mt-1">
                {userData.fakultas}
              </span>
            </>
          )}
        </div>

        {/* Menu Utama */}
        <div>
          <div className="ml-4 mb-3 font-bold text-[#064479] text-xs uppercase tracking-wider opacity-80">
            Menu Utama
          </div>

          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                <Image 
                  src="/home.svg" 
                  alt="Home" 
                  width={20} 
                  height={20} 
                  className={pathname === "/dashboard" ? "brightness-0 invert" : ""} 
                />
                <span>Beranda</span>
              </Link>
            </li>

            <li>
              <Link href="/settings" className={getLinkClass("/settings")}>
                <Image 
                  src="/setting.svg" 
                  alt="Settings" 
                  width={20} 
                  height={20} 
                  className={pathname === "/settings" ? "brightness-0 invert" : ""}
                />
                <span>Pengaturan</span>
              </Link>
            </li>

            <li>
              <Link href="/call-service" className={getLinkClass("/call-service")}>
                <Image 
                  src="/callService.svg" 
                  alt="Service" 
                  width={20} 
                  height={20} 
                  className={pathname === "/call-service" ? "brightness-0 invert" : ""}
                />
                <span>Call Service</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Kelas Saya */}
        <div>
          <div className="ml-4 mb-3 font-bold text-[#064479] text-xs uppercase tracking-wider opacity-80">
            Kelas Saya
          </div>
          <ul className="flex flex-col gap-2">
            {userData.classes.length > 0 ? (
              userData.classes.map((className, idx) => {
                const slug = className.toLowerCase().replace(/\s+/g, '-');
                const path = `/kelas/${slug}`;
                
                return (
                  <li key={idx}>
                    <Link href={path} className={getLinkClass(path)}>
                      <Image 
                        src="/course.svg" 
                        alt="Course" 
                        width={20} 
                        height={20} 
                        className={pathname.startsWith(path) ? "brightness-0 invert" : ""}
                      />
                      <span className="truncate">{className}</span>
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className="text-sm text-gray-400 italic ml-4 flex items-center gap-2">
                <span className="text-xs">Belum ada kelas aktif.</span>
              </li>
            )}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded-md ml-4 transition duration-200 text-sm font-medium w-full text-[#0a4378] hover:bg-gray-100"
          >
            <Image src="/logout.svg" alt="Logout" width={20} height={20} />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;