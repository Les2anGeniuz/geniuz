"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface UserData {
  name: string;
  fakultas: string;
}

const Sidebar: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    fakultas: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("User not logged in");
        return;
      }

      const userId = user.id;

      const { data, error } = await supabase
        .from("users")
        .select("nama_lengkap, nama_fakultas")
        .eq("id_User", userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        setUserData({
          name: data.nama_lengkap,
          fakultas: data.nama_fakultas,
        });
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="fixed top-16 left-0 h-full w-64 bg-white shadow-lg z-40">
      <div className="flex flex-col p-4 space-y-6">

        {/* User Info */}
        <div className="mb-4 flex flex-col items-start ml-4">
          <div className="font-bold text-lg text-[#0a4378]">
            {userData.name || "Loading..."}
          </div>
          <span className="text-sm text-gray-500">
            {userData.fakultas || ""}
          </span>
        </div>

        {/* Navigation */}
        <ul className="flex flex-col gap-3 font-medium text-[#0a4378]">
          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-4 transition">
            <Image src="/beranda.svg" alt="Home Icon" width={18} height={18} />
            <Link href="/" className="text-sm">Beranda</Link>
          </li>

          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-4 transition">
            <Image src="/setting.svg" alt="Settings Icon" width={18} height={18} />
            <Link href="/settings" className="text-sm">Pengaturan</Link>
          </li>

          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-4 transition">
            <Image src="/callService.svg" alt="Call Service Icon" width={18} height={18} />
            <Link href="/call-service" className="text-sm">Call Service</Link>
          </li>

          {/* Kelas */}
          <li className="ml-4">
            <div className="font-semibold text-[#064479] text-sm">Kelas Saya</div>
            <ul className="flex flex-col gap-2 mt-2">
              {["DABD", "TCBA", "KBR", "ADT", "ROSBD", "ML", "BI"].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-0 transition"
                >
                  <Image src="/course.svg" alt="Course Icon" width={18} height={18} />
                  <Link href={`/${item.toLowerCase()}`} className="text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>

        {/* Logout */}
        <div className="mt-auto flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-4 transition">
          <Image src="/logout.svg" alt="Logout Icon" width={18} height={18} />
          <Link href="/logout" className="text-sm">Logout</Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;