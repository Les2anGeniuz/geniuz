'use client';

import { useState, useEffect } from 'react'; // Tambahkan useState & useEffect
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Settings, Phone, LayoutGrid, 
  ClipboardList, BarChart3, BrainCircuit, 
  Database, Briefcase, BookOpen 
} from 'lucide-react';

const mainMenuItems = [
  { name: 'Beranda', href: '/dashboard', icon: Home },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
  { name: 'Call Service', href: '/support', icon: Phone },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  // 1. STATE UNTUK MENAMPUNG DATA KELAS DARI BACKEND
  const [courseItems, setCourseItems] = useState<any[]>([]);

  // 2. FETCH DATA SAAT KOMPONEN DI-LOAD
  useEffect(() => {
    const fetchDaftarKelas = async () => {
      try {
        // Karena ada 'rewrites' di next.config, cukup panggil ke /api
        const response = await fetch('/api/kelas'); 
        const json = await response.json();
        
        if (json.data) {
          // Mapping data dari DB ke format menu sidebar
          const formattedClasses = json.data.map((kelas: any) => ({
            id: kelas.id_Kelas,
            name: kelas.nama_kelas,
            href: `/Kelas/${kelas.id_Kelas}`,
            icon: BookOpen // Ikon default untuk kelas
          }));
          setCourseItems(formattedClasses);
        }
      } catch (error) {
        console.error("Gagal mengambil daftar kelas:", error);
      }
    };

    fetchDaftarKelas();
  }, []);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-5 flex flex-col shadow-sm overflow-y-auto">
      {/* 1. Logo */}
      <div className="mb-8 pl-2">
        <Image 
          src="https://placehold.co/120x40/000000/FFF?text=Geniuz" 
          alt="Geniuz Logo" 
          width={120} 
          height={40} 
        />
      </div>

      {/* 2. Profil Pengguna */}
      <div className="text-left mb-8 flex items-center gap-3">
        <Image 
          src="https://placehold.co/40x40/E0E0E0/B0B0B0?text=MA" 
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h4 className="font-semibold text-gray-900 leading-snug text-sm">Muhammad Althafino</h4>
          <span className="text-xs text-gray-500">Univ - Faculty - Major</span>
        </div>
      </div>

      {/* 3. Menu Utama */}
      <nav className="flex-grow">
        <h5 className="text-gray-400 text-xs font-semibold uppercase mb-3 px-2">Menu Utama</h5>
        <ul className="space-y-1 mb-6">
          {mainMenuItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href} 
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                  pathname === item.href ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 4. My Kelas Gun (Dinamis dari Database) */}
        <h5 className="text-gray-400 text-xs font-semibold uppercase mb-3 px-2">My Kelas Gun</h5>
        <ul className="space-y-1">
          {courseItems.length > 0 ? (
            courseItems.map((item) => (
              <li key={item.id}>
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                    pathname.startsWith(item.href) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-sm truncate">{item.name}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-3 text-xs text-gray-400 italic">Memuat kelas...</li>
          )}
        </ul>
      </nav>
    </div>
  );
}