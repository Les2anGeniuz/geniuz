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
  const [namaBaru, setNamaBaru] = useState(''); // Hanya ini yang bisa diedit
  const [tempFotoUrl, setTempFotoUrl] = useState<string | null>(null); 
  const [uploading, setUploading] = useState(false); 
  const [saving, setSaving] = useState(false);      
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api", []);

  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

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

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setTempFotoUrl(data.foto_profil); 
          setNamaBaru(data.nama_lengkap || ''); // Set nilai awal untuk input nama
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      }
    };
    fetchProfile();
  }, [API_BASE, router]);

  const handleUploadPreview = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !userData?.id_User) return;
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const safeFileName = `avatar-${userData.id_User}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(safeFileName, file, { upsert: true });

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(safeFileName);
      setTempFotoUrl(data.publicUrl);
      setStatusMsg({ type: 'success', text: 'Wih, fotonya keren! Jangan lupa simpan ya ✨' });
    } catch (error: any) {
      setStatusMsg({ type: 'error', text: 'Gagal memproses foto' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}/me/update`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          nama_lengkap: namaBaru, 
          foto_profil: tempFotoUrl 
        })
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Yess! Profil kamu sudah resmi diperbarui 🔥' });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setStatusMsg({ type: 'error', text: 'Gagal menyimpan data' });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setSaving(false);
    }
  };

  if (!userData) return <div className="p-10 text-center italic text-gray-500">Memuat data diri...</div>;

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />
        <main className="p-8 pt-24 max-w-6xl mx-auto relative">
          
          {statusMsg.text && (
            <div className={`fixed top-24 right-8 px-6 py-3 rounded-2xl shadow-xl text-sm font-bold z-[100] transition-all ${
              statusMsg.type === 'success' ? 'bg-[#064479] text-white' : 'bg-red-500 text-white'
            }`}>
              {statusMsg.text}
            </div>
          )}

          <div className="grid grid-cols-12 gap-8">
            {/* KIRI: AREA FOTO */}
            <div className="col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div 
                className="w-44 h-44 rounded-full p-1.5 bg-gradient-to-tr from-[#064479] via-[#236ba8] to-[#064479] shadow-xl cursor-pointer relative mb-6 group transition-all duration-300 hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-full bg-white p-[3px] overflow-hidden relative border-2 border-white">
                    <Image src={tempFotoUrl || '/placeholder-user.jpg'} alt="Avatar" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-[#064479]/20 backdrop-blur-[2px]">
                   <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-[#064479] shadow-md uppercase">Ganti</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleUploadPreview} className="hidden" accept="image/*" />
              <h2 className="font-bold text-xl text-[#064479] text-center">{userData.nama_lengkap}</h2>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-wider">{userData.nama_universitas}</p>
            </div>

            {/* KANAN: FORM DATA */}
            <div className="col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                
                {/* ID Mahasiswa - LOCKED */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Mahasiswa</label>
                  <input type="text" value={userData.id_User || ''} disabled className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-400 cursor-not-allowed font-medium" />
                </div>

                {/* Nama Lengkap - EDITABLE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-[#064479]">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={namaBaru} 
                    onChange={(e) => setNamaBaru(e.target.value)} 
                    className="w-full bg-white border border-gray-200 p-3 rounded-xl text-[#064479] font-semibold outline-none focus:ring-2 focus:ring-[#064479] transition-all" 
                  />
                </div>

                {/* Email - LOCKED */}
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Email</label>
                  <input type="email" value={userData.email || ''} disabled className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-400 cursor-not-allowed font-medium" />
                </div>

                {/* Jurusan - LOCKED */}
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jurusan</label>
                  <input type="text" value={userData.nama_fakultas || ''} disabled className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-400 cursor-not-allowed font-medium" />
                </div>

                <button 
                  onClick={handleSaveChanges}
                  disabled={uploading || saving}
                  className="col-span-2 mt-4 bg-[#064479] text-white font-bold py-3 rounded-xl hover:bg-[#05355d] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}