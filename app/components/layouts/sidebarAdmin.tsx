"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home2Linear,
  ChartSquareLinear,
  BookLinear,
  DocumentTextLinear,
  UserLinear,
} from "solar-icon-set";
import Image from "next/image";

const Sidebar = () => {
  const pathname = usePathname();

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
      <div className="p-6 border-b border-gray-200">
        <Image
            src="/logo_geniuz.png"
            alt="Logo Les-lesan Geniuz"
            width={100}
            height={20}
            priority
        />
      </div>

      {/* Admin Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">John Doe</p>
        <p className="text-xs text-gray-500">Administrator</p>
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
    </aside>
  );
};

export default Sidebar;
