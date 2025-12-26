"use client";

import Image from "next/image";
import Link from "next/link";

export default function CTA() {
    return (
        <section className="mx-auto mt-25 mb-25 flex items-center justify-center px-8 py-0 bg-[#EFF2F6] min-h-[50vh]">
            {/* Container */}
            <div className="flex-1 justify-center text-center max-w-[1000px]">
                    <h1 className="text-[60px] leading-[1.2] font-bold text-black"><span className="text-[#fff000] bg-[url('/background.png')] rounded-2xl px-3">Geniuz!</span> adalah pilihan tepat untuk belajar!</h1>
                    <p className="mt-2 text-lg font-sans text-black max-w-[700px] mx-auto">
                        Platform pembelajaran yang berfokus pada peningkatan skill secara berkelanjutan. Tunggu apa lagi? Daftarkan dirimu sekarang!
                    </p>
                    <Link
                        href="/get-started"
                        className="min-w-[160px] text-center inline-block px-5 py-2 bg-[#fff000] text-black rounded-full mt-9 font-semibold hover:bg-[#fce600] transition"
                    >
                        Get Started
                    </Link>
            </div>

        </section>
    );
}