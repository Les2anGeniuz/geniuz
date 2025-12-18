"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface TaskData {
  nama_tugas: string;
  nama_matakuliah: string;
  deadline_tanggal: string;
  deadline_jam: string;
  status: string;
}

const ActiveTasks: React.FC = () => {
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveTask = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // 1. Ambil ID User
        const { data: userData } = await supabase
          .from("User")
          .select("id_User")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          // 2. Fetch Tugas dari tabel Tugas yang berelasi dengan kelas di Progress
          // Asumsi: Tabel 'Tugas' memiliki id_Kelas dan status 'Belum Dikerjakan'
          const { data: taskData, error } = await supabase
            .from("Tugas")
            .select(`
              nama_tugas,
              deadline_tanggal,
              deadline_jam,
              status,
              Kelas ( nama_kelas )
            `)
            .eq("status", "Belum Dikerjakan")
            .order("deadline_tanggal", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (taskData) {
            setTask({
              nama_tugas: taskData.nama_tugas,
              nama_matakuliah: (taskData.Kelas as any)?.nama_kelas || "Mata Kuliah",
              deadline_tanggal: taskData.deadline_tanggal,
              deadline_jam: taskData.deadline_jam,
              status: taskData.status,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTask();
  }, []);

  if (loading) return <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse h-64"></div>;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#1e293b] mb-6">Tugas Aktif</h2>
      
      {task ? (
        <div className="bg-[#f3f4f6] border border-gray-100 rounded-2xl p-8 relative overflow-hidden">
          <div className="flex flex-col gap-2">
            <span className="text-xl text-gray-500 font-medium italic">
              {task.nama_matakuliah}
            </span>
            
            <h3 className="text-4xl font-black text-[#09090b] leading-tight tracking-tight">
              {task.nama_tugas}
            </h3>
            
            <div className="mt-8">
              <p className="text-gray-900 font-bold text-xl">
                {task.deadline_tanggal}
              </p>
              <p className="text-gray-500 font-medium text-lg">
                {task.deadline_jam}
              </p>
            </div>
          </div>

          <div className="absolute bottom-10 right-10">
            <div className="w-8 h-8 rounded-full bg-[#ef4444] shadow-sm"></div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 italic font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          Tidak ada tugas aktif saat ini.
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
        <span className="text-sm font-semibold text-gray-500 italic">
          Belum Dikerjakan
        </span>
      </div>
    </div>
  );
};

export default ActiveTasks;