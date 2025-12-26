// components/FeaturesSection.tsx (Data Geniuz, Layout Geniuz)

import Image from "next/image";
import Link from "next/link";
import React from "react";

// --- DEFINISI TIPE DATA ---
interface FeatureItem {
    id: number;
    title: string;
    desc: string;
    imagePath: string; // Path ke gambar ilustrasi
    bgColorClass: string; // Kelas Tailwind untuk warna latar belakang
}

// --- DATA GENIUZ (Sesuai dengan Gambar Desain) ---
const geniuzFeatures: FeatureItem[] = [
    {
        id: 1,
        title: "Sistem Terpadu: Efisiensi Maksimal",
        desc: "Didesain sebagai LMS komprehensif untuk menyatukan materi, penugasan, dan penilaian. Kelola seluruh investasi belajar Anda dalam satu platform yang terstruktur.",
        imagePath: '/Fitur 1.png', // Ganti dengan path gambarmu
        bgColorClass: 'bg-indigo-900', // Warna biru tua
    },
    {
        id: 2,
        title: "Fleksibilitas Tanpa Batas Ruang & Waktu",
        desc: "Tingkatkan produktivitas dengan model pembelajaran online dan hybrid. Solusi ini mengatasi kendala ruang dan waktu, memastikan kontinuitas belajar Anda.",
        imagePath: '/Fitur 2.png', // Ganti dengan path gambarmu
        bgColorClass: 'bg-gray-800', // Warna abu-abu gelap
    },
    {
        id: 3,
        title: "Transparansi Progres dan Gamifikasi",
        desc: "Pantau perkembangan belajar secara transparan dan detail melalui dashboard. Dapatkan poin (XP) dan badge digital untuk meningkatkan motivasi belajar.",
        imagePath: '/Fitur 3.png', // Ganti dengan path gambarmu
        bgColorClass: 'bg-purple-900', // Warna ungu tua
    },
];

// --- KOMPONEN KARTU FITUR ---
const FeatureCard: React.FC<{ item: FeatureItem }> = ({ item }) => {
    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col transform transition duration-500 hover:scale-[1.02]">
            <div className={`w-full h-56 ${item.bgColorClass} relative flex items-center justify-center`}>
                <Image
                    src={item.imagePath} 
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority={true}
                />
            </div>

            {/* Area Konten */}
            <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                
                <h3 className="text-2xl font-bold mb-3 text-gray-900 leading-snug">
                    {item.title}
                </h3>
                
                <p className="text-gray-600 mb-6 flex-grow text-base">
                    {item.desc}
                </p>

                {/* Tombol Selengkapnya (Warna kuning sesuai desain Geniuz) */}
                <Link
                    href={`/features/${item.title.toLowerCase().replace(/\s/g, '-')}`}
                    className="inline-block self-start py-2 px-6 text-sm font-semibold text-gray-900 bg-[#FFF000] rounded-full hover:bg-[#fce600] transition duration-300 shadow-md"
                >
                    Selengkapnya
                </Link>
            </div>
        </div>
    );
};
// -------------------------------------------------------------------------

export default function FeatureSection() {
    return (
        // Menggunakan background abu-abu muda mirip Geniuz: bg-[#EFF2F6] atau bg-gray-50
        <section className=" mt-0 mb-10 py-16 md:py-24 min-h-[100vh]"> 
            
            {/* Container Utama */}
            <div className="mx-auto px-6 max-w-7xl">
                
                {/* Judul & Subtitle Geniuz */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-3">
                        Kenapa harus Geniuz?
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Temukan keunggulan yang bikin pengalaman belajarmu lebih efektif dan menyenangkan.
                    </p>
                </div>

                {/* Grid Kartu Fitur */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {geniuzFeatures.map((item) => (
                        <FeatureCard 
                            key={item.id} 
                            item={item}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}