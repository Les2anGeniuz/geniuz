'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '../components/dashboardLayout/sidebar';
import Topbar from '../components/dashboardLayout/topbar';

const TOKEN_KEY = "access_token";
const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));

export default function PengaturanPage() {
  const [userData, setUserData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api", []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(`${API_BASE}/me/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      }
    };

    fetchProfile();
  }, [API_BASE, router]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      
      // Validasi agar tidak error 400 karena data belum siap
      if (!file || !userData?.id_User) return;

      // 1. Bersihkan nama file dari spasi/karakter aneh agar aman bagi server
      const fileExt = file.name.split('.').pop();
      const safeFileName = `avatar-${userData.id_User}-${Date.now()}.${fileExt}`;

      // 2. Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(safeFileName, file, {
          cacheControl: '3600',
          upsert: true // PENTING: Mengizinkan timpa file agar tidak error 400
        });

      if (uploadError) throw uploadError;

      // 3. Ambil Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(safeFileName);
      const publicUrl = data.publicUrl;

      // 4. Update URL ke database lewat API backend
      const res = await fetch(`${API_BASE}/me/update`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ foto_profil: publicUrl })
      });

      if (res.ok) {
        setUserData({ ...userData, foto_profil: publicUrl });
        alert("Foto profil berhasil diperbarui!");
      } else {
        throw new Error("Gagal mengupdate database backend");
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      alert(`Gagal mengunggah: ${error.message || "Pastikan Policy Storage sudah benar"}`);
    } finally {
      setUploading(false);
    }
  };

  if (!userData) return <div className="p-10 text-center italic text-gray-500">Memuat data diri...</div>;

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />

        <main className="p-8 pt-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            
            {/* KIRI: AREA FOTO PROFIL */}
            <div className="col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div 
                className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden cursor-pointer relative mb-6 border-4 border-white shadow-md group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image 
                  src={userData.foto_profil || '/placeholder-user.jpg'} 
                  alt="Avatar" fill className="object-cover"
                  onError={(e: any) => { e.currentTarget.src = '/placeholder-user.jpg' }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[10px] font-bold uppercase text-center p-2">
                  {uploading ? 'Memproses...' : 'Klik untuk Ganti Foto'}
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
              
              <h2 className="font-bold text-xl text-[#064479] text-center">{userData.nama_lengkap}</h2>
              <div className="text-center mt-1">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{userData.nama_universitas}</p>
                <p className="text-sm text-gray-400 font-medium">{userData.nama_fakultas}</p>
              </div>
            </div>

            {/* KANAN: FORM DATA DIRI */}
            <div className="col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Mahasiswa</label>
                  <input type="text" value={userData.id_User || ''} disabled className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-400 cursor-not-allowed font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                  <input type="text" value={userData.nama_lengkap || ''} disabled className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-400 cursor-not-allowed font-medium" />
                </div>

                {/* Email - Sekarang Gabisa Diganti (Disabled) */}
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Email</label>
                  <input 
                    type="email" 
                    value={userData.email || ''} 
                    disabled 
                    className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-400 cursor-not-allowed font-medium outline-none" 
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jurusan</label>
                  <input type="text" value={userData.nama_fakultas || ''} disabled className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-400 cursor-not-allowed font-medium" />
                </div>

                <button 
                  disabled={uploading}
                  className="col-span-2 mt-4 bg-[#064479] text-white font-bold py-3 rounded-xl hover:bg-[#05355d] transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {uploading ? 'Sedang Mengunggah...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}