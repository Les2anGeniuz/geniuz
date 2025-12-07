"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "../../lib/supabaseClient";

const StatisticsChart: React.FC = () => {
  // Hanya 3 Kategori: Tugas, Materi, Kehadiran
  const [chartData, setChartData] = useState([
    { name: 'Tugas', value: 0, color: '#0f172a' },     // Warna Gelap
    { name: 'Materi', value: 0, color: '#3b82f6' },    // Warna Biru Sedang
    { name: 'Kehadiran', value: 0, color: '#93c5fd' }, // Warna Biru Terang
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("statistics")
            .select("tugas, materi, absen") 
            .eq("user_id", user.id)
            .maybeSingle();

          if (data) {
            setChartData([
              { name: 'Tugas', value: data.tugas || 0, color: '#0f172a' },
              { name: 'Materi', value: data.materi || 0, color: '#3b82f6' },
              { name: 'Kehadiran', value: data.absen || 0, color: '#93c5fd' }, 
            ]);
          } else if (error) {
            console.error("Error fetching chart stats:", error);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const emptyData = [
    { name: 'Belum ada data', value: 100, color: '#e5e7eb' },
  ];

  if (loading) return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-[390px] flex items-center justify-center">
       <div className="text-gray-400 animate-pulse">Memuat data...</div>
    </div>
  );

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-black mb-4">Statistik</h2>
      
      <div className="h-[300px] w-full flex justify-center items-center relative">
        
        {totalValue > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, "Jumlah"]} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center relative">
            <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={emptyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={false}
                        >
                            <Cell fill={emptyData[0].color} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="z-10 text-center">
                <span className="text-gray-400 font-semibold text-sm">
                    Belum ada data
                </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StatisticsChart;