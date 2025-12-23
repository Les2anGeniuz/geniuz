"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home2Linear,
  ChartSquareLinear,
  BookLinear,
  DocumentTextLinear,
  UserLinear,
  Logout3Linear,
} from "solar-icon-set";
<<<<<<< HEAD
// Pastikan path ini sesuai dengan struktur project Anda, biasanya @/lib/... atau ../../lib/...
import { supabase } from "@/lib/supabaseClient"; 
=======
>>>>>>> e731e2d87323f2ba431c863fec1f451ddd157e41

interface UserData {
  name: string;
  email: string;
}

const SidebarAdmin = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

<<<<<<< HEAD
  // Menu untuk Admin
=======
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

        if (!token) {
          setUser(null);
          return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        const res = await fetch(`${backendUrl}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser({ name: data.nama ?? "Admin", email: data.email ?? "" });
      } catch (err) {
        console.error("Error fetching admin profile", err);
      }
    };

    fetchUser();
  }, []);

>>>>>>> e731e2d87323f2ba431c863fec1f451ddd157e41
  const menuOverview = [
    { name: "Dashboard", icon: Home2Linear, href: "/admin/dashboard" },
    { name: "Analytics", icon: ChartSquareLinear, href: "/admin/analytics" },
  ];

  const menuManagement = [
    { name: "Kelas", icon: BookLinear, href: "/admin/kelas" },
    { name: "Materi", icon: DocumentTextLinear, href: "/admin/materi" },
    { name: "Siswa", icon: UserLinear, href: "/admin/siswa" },
  ];

  // Fetch Data User (Admin)
  useEffect(() => {
    const fetchUser = async () => {
      // Mengambil session user yang sedang login
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Session error", sessionError);
        return;
      }

      // Opsional: Ambil detail tambahan dari tabel User jika perlu
      const { data, error } = await supabase
        .from("User")
        .select("nama_lengkap, email")
        .eq("email", session.user.email) // Pastikan mencocokkan user yang benar
        .single();

      if (!error && data) {
        setUser({ name: data.nama_lengkap, email: data.email });
      } else {
        // Fallback ke data session jika data tabel gagal diambil
        setUser({ 
            name: session.user.user_metadata.full_name || "Admin", 
            email: session.user.email || "" 
        });
      }
    };

    fetchUser();
  }, []);

  // Fungsi Logout (Diambil dari logika HEAD agar berfungsi)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token"); // Hapus token jika Anda menyimpannya manual
    router.push("/login"); // Redirect ke login
  };

  const isActive = (path: string) =>
    pathname === path
      ? "bg-[#002D5B] text-white"
      : "text-gray-700 hover:bg-gray-100";

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#F8FAFC] border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-center">
        <Image
          src="/logo_geniuz.png"
          alt="Logo Les-lesan Geniuz"
          width={110}
          height={30}
          priority
        />
      </div>

      {/* Admin Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">
          {user?.name || "Loading..."}
        </p>
        <p className="text-xs text-gray-500">{user?.email || "—"}</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {/* Overview */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
            Overview
          </p>
          <ul className="space-y-1">
            {menuOverview.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(
                      item.href
                    )}`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Management */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
            Management
          </p>
          <ul className="space-y-1">
            {menuManagement.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(
                      item.href
                    )}`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
<<<<<<< HEAD

      {/* Logout */}
      <div className="px-6 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-2 text-[#0A4378] hover:text-red-500 transition-colors"
        >
          <Logout3Linear size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
=======
>>>>>>> e731e2d87323f2ba431c863fec1f451ddd157e41
    </aside>
  );
};

export default SidebarAdmin;