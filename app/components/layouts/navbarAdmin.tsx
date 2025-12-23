"use client";

import { Logout3Linear } from "solar-icon-set";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 z-30">
      <Link
        href="/login"
        className="bg-[#002D5B] text-white px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#003e80] transition"
      >
        <Logout3Linear size={18} />
        Logout
      </Link>
    </nav>
  );
};

export default Navbar;
