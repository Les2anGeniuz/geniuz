'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Settings, 
  Phone,
  LayoutGrid,
  ClipboardList,
  BarChart3,
  BrainCircuit,
  Database,
  Briefcase // Ikon baru dari screenshot
} from 'lucide-react';

// Data menu statis
const mainMenuItems = [
  { name: 'Beranda', href: '/dashboard', icon: Home },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
  { name: 'Call Service', href: '/support', icon: Phone },
];

// DATA KELAS (ASUMSI ID DARI DATABASE)
// Nanti, data ini juga bisa kamu ambil dari database
const courseItems = [
  // ASUMSI: id_Kelas DABD = 1, TCBA = 2, dst.
  // Sesuaikan ID ini dengan data di tabel 'Kelas' kamu
  { id: '1', name: 'DABD', href: '/kelas/1', icon: Database },
  { id: '2', name: 'TCBA', href: '/kelas/2', icon: BarChart3 },
  { id: '3', name: 'KSB', href: '/kelas/3', icon: LayoutGrid },
  { id: '4', name: 'ADT', href: '/kelas/4', icon: ClipboardList },
  { id: '5', name: 'ROSBD', href: '/kelas/5', icon: BrainCircuit }, // Kamu tulis ROSBD di screenshot
  { id: '6', name: 'ML', href: '/kelas/6', icon: BrainCircuit },
  { id: '7', name: 'BI', href: '/kelas/7', icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-5 flex flex-col shadow-sm">
      {/* 1. Logo */}
      <div className="mb-8 pl-2">
        <Image 
          src="https://placehold.co/120x40/000000/FFF?text=Geniuz" 
          alt="Geniuz Logo" 
          width={120} 
          height={40} 
          // Ganti 'src' dengan logo aslimu di '/logo-geniuz.png'
        />
      </div>

      {/* 2. Profil Pengguna (Pindah ke atas) */}
      <div className="text-left mb-8 flex items-center gap-3">
        <Image 
          src="https://placehold.co/40x40/E0E0E0/B0B0B0?text=MA" 
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h4 className="font-semibold text-gray-900 leading-snug">Muhammad Althafino</h4>
          <span className="text-xs text-gray-500">Univ - Faculty - Major</span>
        </div>
      </div>

      {/* 3. Menu Utama */}
      <nav className="flex-grow">
        <h5 className="text-gray-400 text-xs font-semibold uppercase mb-3 px-2">Menu Utama</h5>
        <ul className="space-y-1">
          {mainMenuItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href} 
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 4. Menu Kelas (Diperbarui) */}
        <h5 className="text-gray-400 text-xs font-semibold uppercase mt-6 mb-3 px-2">My Kelas Gun</h5>
        <ul className="space-y-1">
          {courseItems.map((item) => (
            <li key={item.id}>
              <Link 
                href={item.href} 
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                  // .startsWith() agar tetap aktif saat di /kelas/1/materi/5
                  pathname.startsWith(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}