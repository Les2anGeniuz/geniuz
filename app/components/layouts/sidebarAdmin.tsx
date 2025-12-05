"use client";

<<<<<<< HEAD
import { usePathname } from "next/navigation";
import Link from "next/link";
=======
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
import {
  Home2Linear,
  ChartSquareLinear,
  BookLinear,
  DocumentTextLinear,
  UserLinear,
<<<<<<< HEAD
} from "solar-icon-set";
import Image from "next/image";

const Sidebar = () => {
  const pathname = usePathname();
=======
  Logout3Linear,
} from "solar-icon-set";

interface UserData {
  name: string;
  email: string;
}

const SidebarAdmin = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const result = await res.json();

      if (res.ok) {
        setUser({
          name: result.nama,
          email: result.email,
        });
      } else {
        console.error("Gagal ambil data admin:", result.error);
      }
    };

    fetchUser();
  }, []);
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd

  const menuOverview = [
    { name: "Dashboard", icon: Home2Linear, href: "/admin/dashboard" },
    { name: "Analytics", icon: ChartSquareLinear, href: "/admin/analytics" },
  ];

  const menuManagement = [
    { name: "Kelas", icon: BookLinear, href: "/admin/kelas" },
    { name: "Materi", icon: DocumentTextLinear, href: "/admin/materi" },
    { name: "Siswa", icon: UserLinear, href: "/admin/siswa" },
  ];

  const isActive = (path: string) =>
    pathname === path
      ? "bg-[#002D5B] text-white"
      : "text-gray-700 hover:bg-gray-100";

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#F8FAFC] border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
<<<<<<< HEAD
      <div className="p-6 border-b border-gray-200">
        <Image
            src="/logo_geniuz.png"
            alt="Logo Les-lesan Geniuz"
            width={100}
            height={20}
            priority
=======
      <div className="p-6 border-b border-gray-200 flex items-center justify-center">
        <Image
          src="/logo_geniuz.png"
          alt="Logo Les-lesan Geniuz"
          width={110}
          height={30}
          priority
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
        />
      </div>

      {/* Admin Info */}
      <div className="px-6 py-4 border-b border-gray-200">
<<<<<<< HEAD
        <p className="text-sm font-semibold text-gray-900">John Doe</p>
        <p className="text-xs text-gray-500">Administrator</p>
=======
        <p className="text-sm font-semibold text-gray-900">
          {user?.name || "Loading..."}
        </p>
        <p className="text-xs text-gray-500">{user?.email || "—"}</p>
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
<<<<<<< HEAD
        {/* Overview */}
=======
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
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

<<<<<<< HEAD
        {/* Management */}
=======
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
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
=======

      {/* Logout */}
      <div className="px-6 py-4 border-t border-gray-200">
        <Link
          href="/logout"
          className="flex items-center space-x-2 text-[#0A4378] hover:text-red-500 transition-colors"
        >
          <Logout3Linear size={18} />
          <span className="font-medium">Logout</span>
        </Link>
      </div>
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
    </aside>
  );
};

<<<<<<< HEAD
export default Sidebar;
=======
export default SidebarAdmin;
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
