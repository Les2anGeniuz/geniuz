'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Pastikan path ini benar
import { Home, Settings, Phone, BookOpen, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [courseItems, setCourseItems] = useState<any[]>([]);
  const [userData, setUserData] = useState({ name: "Pelajar", fakultas: "-" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoading(true);
        // 1. Ambil Sesi Login
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // 2. Ambil Profil User & ID-nya
        const { data: userProfile } = await supabase
          .from("User")
          .select("id_User, nama_lengkap")
          .eq("email", session.user.email)
          .single();

        if (userProfile) {
          setUserData(prev => ({ ...prev, name: userProfile.nama_lengkap }));
          
          // 3. Ambil Pendaftaran Kelas User tsb
          const { data: pendaftaran } = await supabase
            .from("Pendaftaran")
            .select(`
              id_Kelas,
              Kelas (id_Kelas, nama_kelas, id_Fakultas)
            `)
            .eq("id_User", userProfile.id_User);

          if (pendaftaran) {
            const formatted = pendaftaran.map((p: any) => ({
              id: p.Kelas.id_Kelas,
              name: p.Kelas.nama_kelas,
              // Link diarahkan ke struktur folder baru: /Kelas/[idFakultas]/[idKelas]
              href: `/Kelas/${p.Kelas.id_Fakultas}/${p.Kelas.id_Kelas}`
            }));
            setCourseItems(formatted);
          }
        }
      } catch (error) {
        console.error("Sidebar error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuStyle = (href: string) => 
    `flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
      pathname.startsWith(href) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-5 flex flex-col shadow-sm overflow-y-auto z-50">
      <div className="mb-8 font-bold text-xl text-blue-700">Geniuz</div>

      {/* Profil Section */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-blue-700">
          {userData.name[0]}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{userData.name}</h4>
          <span className="text-xs text-gray-500">Mahasiswa</span>
        </div>
      </div>

      <nav className="flex-grow">
        <h5 className="text-gray-400 text-xs font-semibold uppercase mb-3">Menu Utama</h5>
        <ul className="space-y-2 mb-6">
          <li><Link href="/dashboard" className={menuStyle("/dashboard")}><Home size={18}/> Beranda</Link></li>
          <li><Link href="/settings" className={menuStyle("/settings")}><Settings size={18}/> Pengaturan</Link></li>
          <li>
            <Link href="/call-center" className="flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Phone size={18}/> Call Center
            </Link>
          </li>
        </ul>


        <h5 className="text-gray-400 text-xs font-semibold uppercase mb-3">Kelas Saya</h5>
        <ul className="space-y-2">
          {loading ? (
            <li className="text-xs text-gray-400 italic">Memuat kelas...</li>
          ) : courseItems.length > 0 ? (
            courseItems.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={menuStyle(item.href)}>
                  <BookOpen size={18} />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-xs text-gray-400">Belum ada kelas.</li>
          )}
        </ul>
      </nav>

      <button onClick={handleLogout} className="mt-auto flex items-center gap-3 text-red-500 p-2 hover:bg-red-50 rounded-lg">
        <LogOut size={18} /> <span>Keluar</span>
      </button>
    </div>
  );
}