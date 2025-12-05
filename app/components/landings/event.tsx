// components/EventsSection.tsx (Data Geniuz, Layout Geniuz)

import Image from "next/image";
import Link from "next/link";
import React from "react";

// --- DEFINISI TIPE DATA ---
interface EventItem {
    id: number;
    title: string;
    desc: string;
    imagePath: string; // Path ke gambar ilustrasi
    bgColorClass: string; // Kelas Tailwind untuk warna latar belakang
}

// --- DATA GENIUZ (Sesuai dengan Gambar Desain) ---
const geniuzEvents: EventItem[] = [
    {
        id: 1,
        title: "Workshop: Fundamental Apache Airflow untuk Data Engineering",
        desc: "Menguasai dasar Airflow dari instalasi hingga pembuatan DAGs (Directed Acyclic Graphs).",
        imagePath: '/Event 1.png', // Ganti dengan path gambarmu
        bgColorClass: 'bg-indigo-900', // Warna biru tua
    },
    {
        id: 2,
        title: "Seminar: Data Streaming Real-Time menggunakan Kafka dan Azure Event Hubs",
        desc: "Fokus pada data streaming. Pelajari Kafka dan Azure Event Hubs untuk pemrosesan data real-time guna monitoring dan alerting.",
        imagePath: '/Event 2.png', // Ganti dengan path gambarmu
        bgColorClass: 'bg-gray-800', // Warna abu-abu gelap
    },
    {
        id: 3,
        title: "Pelatihan: Menerapkan Deep Learning untuk Computer Vision",
        desc: "Aplikasi Deep Learning menggunakan TensorFlow/PyTorch. Fokus pada pembangunan dan pelatihan CNN untuk Computer Vision (pengenalan objek).",
        imagePath: '/Event 3.png', // Ganti dengan path gambarmu
        bgColorClass: 'bg-purple-900', // Warna ungu tua
    },
];

// --- KOMPONEN KARTU FITUR ---
const EventCard: React.FC<{ item: EventItem }> = ({ item }) => {
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
                    href={`/Events/${item.title.toLowerCase().replace(/\s/g, '-')}`}
                    className="inline-block self-start py-2 px-6 text-sm font-semibold text-gray-900 bg-[#FFF000] rounded-full hover:bg-[#fce600] transition duration-300 shadow-md"
                >
                    Selengkapnya
                </Link>
            </div>
        </div>
    );
};
// -------------------------------------------------------------------------

export default function EventSection() {
    return (
        // Menggunakan background abu-abu muda mirip Geniuz: bg-[#EFF2F6] atau bg-gray-50
        <section id="event-section" className="bg-[#EFF2F6] mt-0 mb-10 py-16 md:py-24 min-h-[100vh]"> 
            
            {/* Container Utama */}
            <div className="mx-auto px-6 max-w-7xl">
                
                {/* Judul & Subtitle Geniuz */}
                <div className="flex-1 flex justify-between gap-5 text-center mb-12 md:mb-16">
                    <h2 className="text-left text-3xl md:text-4xl font-extrabold text-black mb-3">
                        Ikuti Kegiatan Menarik dalam setiap Langkahnya!
                    </h2>
                    <p className="text-left text-lg text-gray-500 max-w-2xl mx-auto">
                        Les-lesan Geniuz selalu berkolaborasi dengan organisasi-organisasi besar dan terpercaya di seluruh Indonesia untuk membantu memajukan kualitas pendidikan di Indonesia.
                    </p>
                </div>

                {/* Grid Kartu Fitur */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {geniuzEvents.map((item) => (
                        <EventCard 
                            key={item.id} 
                            item={item}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}