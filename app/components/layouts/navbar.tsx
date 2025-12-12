"use client";

import Image from "next/image";
import Link from "next/link";
import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">
        
        {/* === LOGO === */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo_geniuz.png"
            alt="Logo Les-lesan Geniuz"
            width={120}
            height={40}
            priority
          />
        </div>

        {/* === NAV LINKS === */}
        <ul className="hidden md:flex gap-10 font-semibold text-[#0a4378]">
          <li>
            <Link href="/" className="hover:text-[#064479] transition">
              Home
            </Link>
          </li>
          <li>
            {/* DIGANTI: Menunjuk ke ID 'promo-section' */}
            <Link href="#promo-section" className="hover:text-[#064479] transition">
              Discount
            </Link>
          </li>
          <li>
            {/* DIGANTI: Menunjuk ke ID 'event-section' */}
            <Link href="#event-section" className="hover:text-[#064479] transition">
              Event
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-[#064479] transition">
              About Us
            </Link>
          </li>
        </ul>

        {/* === ACTION BUTTONS === */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-1.5 min-w-[100px] text-center bg-[#064479] text-white rounded-full text-sm font-medium hover:opacity-90 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-5 py-1.5 border min-w-[100px] text-center border-[#064479] text-[#064479] rounded-full text-sm font-medium hover:bg-[#064479] hover:text-white transition"
          >
            Register
          </Link>
        </div>
      </div>

    </nav>
  );
}