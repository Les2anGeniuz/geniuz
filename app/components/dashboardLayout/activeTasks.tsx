"use client";

import React, { useEffect, useState } from "react";

interface TaskItem {
  id_Tugas: number;
  nama_tugas: string;
  tenggat_waktu: string;
  status: string;
}

const ActiveTasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/dashboard/tugas-aktif");
        const data = await response.json();

        console.log("Data tugas aktif:", data);

        if (response.ok) {
          const fetchedTasks = data.data;

          // Map data tugas untuk ditampilkan
          const formattedTasks = fetchedTasks.map((item: any) => ({
            id_Tugas: item.id_Tugas,
            nama_tugas: item.nama_tugas,
            tenggat_waktu: item.tenggat_waktu,
            status: item.status,
          }));

          setTasks(formattedTasks);
        } else {
          console.error("Error fetching tasks:", data.message);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-[390px]"> {/* Menambahkan h-[390px] */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1e293b]">Tugas Aktif</h2>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-4">Memuat tugas...</p>
        ) : tasks.length > 0 ? (
          tasks.map((task, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-3 h-3 rounded-full mb-1 ${task.status === 'TELAH' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase text-center leading-tight">
                  {new Date(task.tenggat_waktu).toLocaleDateString()} <br/> {new Date(task.tenggat_waktu).toLocaleTimeString()}
                </span>
              </div>
              <div className="h-10 w-[1px] bg-gray-200"></div>
              <h3 className="font-bold text-[#1e293b] text-sm md:text-base truncate">
                {task.nama_tugas}
              </h3>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">Belum ada tugas aktif.</p>
        )}
      </div>
    </div>
  );
};

export default ActiveTasks;
