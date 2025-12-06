"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

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
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return;
      }

      // Tampilkan nama sementara dari email/metadata biar tidak "Memuat..."
      const tempName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";

      setUserData(prev => ({
        ...prev,
        name: prev.name || tempName,
        fakultas: prev.fakultas || "...",
      }));

      try {
        const { data: userProfile } = await supabase
          .from("User")
          .select("nama_lengkap, fakultas")
          .eq("email", user.email)
          .single();

        if (userProfile) {
          setUserData({
            name: userProfile.nama_lengkap || tempName,
            fakultas: userProfile.fakultas || "-",
            classes: [],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Logic style: Aktif = Biru, Tidak Aktif = Biasa (Hover Abu)
  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
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
          {isLoading && !userData.name ? (
            <div className="animate-pulse space-y-2">
               <div className="h-5 w-32 bg-gray-200 rounded"></div>
               <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="font-bold text-lg text-[#0a4378] capitalize">
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
              userData.classes.map((item, idx) => {
                const path = `/kelas/${item.toLowerCase().replace(/\s+/g, '-')}`;
                return (
                  <li key={idx}>
                    <Link href={path} className={getLinkClass(path)}>
                      <Image 
                        src="/course.svg" 
                        alt="Course" 
                        width={20} 
                        height={20} 
                        className={pathname === path ? "brightness-0 invert" : ""}
                      />
                      <span>{item}</span>
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