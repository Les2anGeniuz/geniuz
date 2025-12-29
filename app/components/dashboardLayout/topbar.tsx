"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

const TOKEN_KEY = "access_token";
const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));

const Topbar: React.FC = () => {
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api", []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const response = await fetch(`${API_BASE}/me/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFotoProfil(data.foto_profil);
          setUserId(data.id_User);
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      }
    };
    fetchProfile();
  }, [API_BASE]);

  useEffect(() => {
    if (!userId) return;
    const fetchNotif = async () => {
      const { data, error } = await supabase
        .from('Notifikasi')
        .select('*')
        .eq('id_User', Number(userId)) 
        .order('tanggal', { ascending: false })
        .limit(10);
      if (!error) setNotifs(data || []);
    };
    fetchNotif();

    const channel = supabase
      .channel(`notif-${userId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'Notifikasi', filter: `id_User=eq.${userId}` }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifs((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            fetchNotif();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();

    const timeFormatted = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace('.', ':');

    if (date.toDateString() === now.toDateString()) {
      return `Hari ini, ${timeFormatted}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Kemarin, ${timeFormatted}`;
    }

    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace('.', ':');
  };

  const markAllAsRead = async () => {
    if (!userId || notifs.length === 0) return;
    
    
    const { error } = await supabase
      .from('Notifikasi')
      .update({ status_baca: true })
      .eq('id_User', Number(userId)) 
      .eq('status_baca', false);

    if (!error) {
      setNotifs(prev => prev.map(n => ({ ...n, status_baca: true })));
    } else {
      console.error("Gagal update status_baca:", error.message);
    }
  };

  const unreadCount = notifs.filter(n => !n.status_baca).length;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-6 py-1">
        <div className="flex items-center gap-2">
          <Image src="/logo_geniuz.png" alt="Logo" width={120} height={40} priority />
        </div>

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <div className="relative cursor-pointer p-2 hover:bg-gray-50 rounded-full transition-all" onClick={() => setShowDropdown(!showDropdown)}>
            <Image src="/notification.svg" alt="Notif" width={24} height={24} className="hover:opacity-80 transition" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </div>

          {showDropdown && (
            <div className="absolute top-12 right-0 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-[#064479] text-xs">Pemberitahuan</h3>
                {unreadCount > 0 && (
                   <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                     {unreadCount} Baru
                   </span>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifs.length > 0 ? notifs.map((n) => (
                  <div key={n.id_Notif} className={`p-4 border-b transition-colors hover:bg-gray-50 ${!n.status_baca ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`font-bold text-[#064479] text-[11px] ${!n.status_baca ? 'opacity-100' : 'opacity-60'}`}>{n.judul}</p>
                      {!n.status_baca && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>}
                    </div>
                    <p className="text-gray-600 text-[10px] leading-relaxed line-clamp-2">{n.pesan}</p>
                    <p className="text-[8px] text-gray-400 mt-2 italic font-medium">
                      {n.tanggal ? formatTime(n.tanggal) : ''}
                    </p>
                  </div>
                )) : (
                  <div className="p-8 text-center text-[10px] text-gray-400 italic font-sans">Belum ada kabar terbaru</div>
                )}
              </div>

              {unreadCount > 0 && (
                <div className="p-2 bg-gray-50 text-center border-t hover:bg-gray-100 transition-colors">
                  <button onClick={markAllAsRead} className="text-[9px] font-bold text-[#064479] uppercase tracking-wider w-full py-1">
                    Tandai Semua Dibaca
                  </button>
                </div>
              )}
            </div>
          )}
          
          <Link href="/settings">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-200 cursor-pointer flex items-center justify-center transition hover:scale-105">
              <Image
                src={fotoProfil || "/default-profile.png"} 
                alt="Profile" width={40} height={40} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile.png'; }}
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;