"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface Aktivitas {
  title: string;
  desc: string;
  time: string;
}

const DashboardActivities = () => {
  const [activities, setActivities] = useState<Aktivitas[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const [{ data: users }, { data: kelas }] = await Promise.all([
        supabase.from("User").select("nama_lengkap, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("Kelas").select("nama_kelas, id_Kelas").order("id_Kelas", { ascending: false }).limit(3),
      ]);

      const userActivities =
        users?.map((u) => ({
          title: "User baru mendaftar",
          desc: u.nama_lengkap,
          time: new Date(u.created_at).toLocaleDateString("id-ID"),
        })) || [];

      const kelasActivities =
        kelas?.map((k) => ({
          title: "Kelas baru dibuat",
          desc: k.nama_kelas,
          time: "Baru saja",
        })) || [];

      setActivities([...userActivities, ...kelasActivities]);
    };

    fetchActivities();
  }, []);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-800">Aktivitas Terbaru</h2>
        <p className="text-sm text-gray-500">Update terbaru dari sistem</p>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.length > 0 ? (
          activities.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <p className="text-xs text-gray-400">{item.time}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">Belum ada aktivitas</p>
        )}
      </div>
    </div>
  );
};

export default DashboardActivities;
