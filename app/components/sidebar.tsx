"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { supabase } from "../lib/supabaseClient";
=======
import { supabase } from "../../lib/supabaseClient";
<<<<<<< HEAD
import { useRouter } from "next/navigation"; // Import useRouter untuk redirect
=======
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
>>>>>>> a3e1874b20491355104a67577e48094d4ea3c6ea

interface UserData {
  name: string;
  fakultas: string;
  classes: string[]; // Menyimpan kelas yang diambil oleh user
}

const Sidebar: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    fakultas: "",
    classes: [],
  });
  const router = useRouter(); // Untuk redirect ke halaman login setelah logout

  useEffect(() => {
    const fetchUserData = async () => {
<<<<<<< HEAD
      // Mendapatkan user yang sedang login menggunakan Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
=======
<<<<<<< HEAD
      const userId = "YOUR_USER_ID"; // Replace with valid user ID
      const { data, error } = await supabase
        .from("users")
        .select("nama_lengkap, fakultas:nama_fakultas") 
        .eq("id_User", userId) 
        .single(); 
=======
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
>>>>>>> a3e1874b20491355104a67577e48094d4ea3c6ea

      if (userError || !user) {
        console.log("User not logged in");
        return;
      }

      const userId = user.id;

<<<<<<< HEAD
      // Mengambil data profil dari API backend menggunakan `/me`
      const res = await fetch(`/api/me`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
=======
      const { data, error } = await supabase
        .from("users")
        .select("nama_lengkap, nama_fakultas")
        .eq("id_User", userId)
        .single();
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
>>>>>>> a3e1874b20491355104a67577e48094d4ea3c6ea

      const result = await res.json();

      if (res.ok) {
        // Mengupdate state dengan data user
        setUserData({
<<<<<<< HEAD
          name: result.nama_lengkap || "Nama Tidak Ditemukan", // Fallback jika nama tidak ditemukan
          fakultas: result.nama_fakultas || "Fakultas Tidak Ditemukan", // Fallback jika fakultas tidak ditemukan
          classes: result.classes || [], // Menyimpan kelas yang diambil user
=======
          name: data.nama_lengkap,
<<<<<<< HEAD
          fakultas: data.fakultas,
=======
          fakultas: data.nama_fakultas,
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
>>>>>>> a3e1874b20491355104a67577e48094d4ea3c6ea
        });
      } else {
        console.error("Gagal ambil data user:", result.error);
      }
    };

    fetchUserData();
  }, []);

  // Fungsi untuk menangani logout
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Logout dari Supabase
    localStorage.removeItem("token"); // Menghapus token dari localStorage (jika digunakan)
    router.push("/login"); // Redirect ke halaman login setelah logout
  };

  return (
<<<<<<< HEAD
    <div className="fixed top-16 left-0 h-full w-64 bg-white shadow-lg z-40"> {/* Sidebar starts below navbar */}
      <div className="flex flex-col p-4 space-y-6">
        {/* User Info */}
        <div className="mb-4 flex flex-col items-start ml-4">
          <div className="font-bold text-lg text-[#0a4378]">{userData.name}</div>
          <span className="text-sm text-gray-500">{userData.fakultas}</span>
        </div>

        {/* Navigation Menu */}
        <ul className="flex flex-col gap-3 font-medium text-[#0a4378]">
          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-4 transition">
            <Image src="/home.svg" alt="Home Icon" width={18} height={18} />
            <Link href="/" className="text-sm">Beranda</Link>
          </li>
=======
    <div className="fixed top-16 left-0 h-full w-64 bg-white shadow-lg z-40">
      <div className="flex flex-col p-4 space-y-6">
        {/* User Info */}
        <div className="mb-4 flex flex-col items-start ml-4">
          <div className="font-bold text-lg text-[#0a4378]">{userData.name || "Loading..."}</div>
          <span className="text-sm text-gray-500">{userData.fakultas || ""}</span>
        </div>

        {/* Menu Utama */}
        <div className="ml-4 mb-3 font-semibold text-[#064479] text-sm">Menu Utama</div>

        {/* Navigation */}
        <ul className="flex flex-col gap-3 font-medium text-[#0a4378]">
          <li className="flex items-center gap-3 hover:bg-gray-300 hover:text-white p-2 rounded-md ml-4 transition">
            <Image src="/beranda.svg" alt="Home Icon" width={18} height={18} />
            <Link href="/" className="text-sm">Beranda</Link>
          </li>

<<<<<<< HEAD
          <li className="flex items-center gap-3 hover:bg-gray-300 hover:text-white p-2 rounded-md ml-4 transition">
=======
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-4 transition">
>>>>>>> a3e1874b20491355104a67577e48094d4ea3c6ea
            <Image src="/setting.svg" alt="Settings Icon" width={18} height={18} />
            <Link href="/settings" className="text-sm">Pengaturan</Link>
          </li>
<<<<<<< HEAD
=======

<<<<<<< HEAD
          <li className="flex items-center gap-3 hover:bg-gray-300 hover:text-white p-2 rounded-md ml-4 transition">
=======
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
          <li className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-4 transition">
>>>>>>> a3e1874b20491355104a67577e48094d4ea3c6ea
            <Image src="/callService.svg" alt="Call Service Icon" width={18} height={18} />
            <Link href="/call-service" className="text-sm">Call Service</Link>
          </li>

<<<<<<< HEAD
          {/* Kelas Saya - Menampilkan kelas yang diambil oleh user */}
          <li className="ml-4">
            <div className="font-semibold text-[#064479] text-sm">Kelas Saya</div>
            <ul className="flex flex-col gap-2 mt-2">
              {userData.classes.length > 0 ? (
                userData.classes.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 hover:bg-gray-300 hover:text-white p-2 rounded-md ml-0 transition">
                    <Image src="/course.svg" alt="Course Icon" width={18} height={18} />
                    <Link href={`/kelas/${item.toLowerCase()}`} className="text-sm">
                      {item}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">Tidak ada kelas yang diambil.</li>
              )}
=======
<<<<<<< HEAD
          {/* My Kelas Gua Section */}
=======
          {/* Kelas */}
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
          <li className="ml-4">
            <div className="font-semibold text-[#064479] text-sm">Kelas Saya</div>
            <ul className="flex flex-col gap-2 mt-2">
              {["DABD", "TCBA", "KBR", "ADT", "ROSBD", "ML", "BI"].map((item, idx) => (
<<<<<<< HEAD
                <li key={idx} className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-0 transition">
                  <Image src="/courseIcons.svg" alt="Course Icon" width={18} height={18} />
                  <Link href={`/${item.toLowerCase()}`} className="text-sm">{item}</Link>
=======
                <li
                  key={idx}
                  className="flex items-center gap-3 hover:bg-[#064479] hover:text-white p-2 rounded-md ml-0 transition"
                >
                  <Image src="/course.svg" alt="Course Icon" width={18} height={18} />
                  <Link href={`/${item.toLowerCase()}`} className="text-sm">
                    {item}
                  </Link>
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
                </li>
              ))}
>>>>>>> a3e1874b20491355104a67577e48094d4ea3c6ea
            </ul>
          </li>
        </ul>

        {/* Logout */}
        <div className="mt-auto flex items-center gap-3 hover:bg-gray-300 hover:text-white p-2 rounded-md ml-4 transition cursor-pointer" onClick={handleLogout}>
          <Image src="/logout.svg" alt="Logout Icon" width={18} height={18} />
          <span className="text-sm">Logout</span>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Sidebar;
=======
<<<<<<< HEAD
export default Sidebar;
=======
export default Sidebar;
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
>>>>>>> a3e1874b20491355104a67577e48094d4ea3c6ea
