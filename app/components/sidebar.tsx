"use client";

import Link from "next/link";
import React from "react";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r flex flex-col justify-between">
      {/* === TOP SECTION === */}
      <div>
        {/* Profil dan info */}
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800 text-sm">Muhammad Althafino</h2>
          <p className="text-xs text-gray-500">UNS - Fakultas Data · Sains Data</p>
        </div>

        {/* Menu Utama */}
        <nav className="mt-3 px-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Menu Utama</p>
          <SidebarLink href="#" label="Beranda" active />
          <SidebarLink href="#" label="Pengaturan" />
          <SidebarLink href="#" label="Call Service" />

          <p className="text-xs font-semibold text-gray-400 uppercase mt-5 mb-2">My Kelas Gua</p>
          {["DABD", "TCBA", "KBR", "ADT", "ROSBD", "ML", "BI"].map((kelas) => (
            <SidebarLink key={kelas} href="#" label={kelas} />
          ))}
        </nav>
      </div>

      {/* === LOGOUT === */}
      <div className="p-4 border-t">
        <Link href="#" className="block text-sm text-red-500 font-medium hover:bg-gray-100 px-3 py-2 rounded-lg">
          Logout
        </Link>
      </div>
    </aside>
  );
}

type SidebarLinkProps = {
  href: string;
  label: string;
  active?: boolean;
};

function SidebarLink({ href, label, active }: SidebarLinkProps) {
  return (
    <Link href={href} className={`block px-3 py-2 rounded-lg text-sm font-medium ${active ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"}`}>
      {label}
    </Link>
  );
}
