"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="mx-auto mt-10 flex items-center justify-between px-8 py-32 bg-[url('/background.png')] min-h-[100vh]">
            {/* === Container === */}
            <div className="w-[1280px] h-[500px] mx-auto flex items-center justify-between px-8 py-3">
                {/* === Left Side === */}
                <div className="flex-1">
                    <h1 className="text-[70px] leading-[1] font-bold text-white">Halo! <br /> Selamat Datang di Les-lesan <span className="text-[#fff000]">Geniuz!</span></h1>
                    <p className="mt-2 text-lg font-sans text-gray-200">
                        Platform pembelajaran yang berfokus pada peningkatan skill secara berkelanjutan. Dapatkan kurikulum terpadu dan dukungan terarah untuk mencapai tujuan profesional Anda.
                    </p>
                    <Link
                        href="/get-started"
                        className="min-w-[160px] text-center inline-block px-5 py-2 bg-[#fff000] text-black rounded-full mt-9 font-semibold hover:bg-[#fce600] transition"
                    >
                        Get Started
                    </Link>
                </div>
                {/* === Right Side (Image) === */}
                <div className="flex-1 flex justify-end">
                    <Image
                        src="/hero-background.png"
                        alt="Hero Image"
                        width={520}
                        height={500}
                        className="object-contain"
                    />
                </div>
            </div>
        </section>
    );
}