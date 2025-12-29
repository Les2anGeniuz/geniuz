"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useRouter } from "next/navigation";

type ChartItem = {
  name: string;
  value: number;
  color: string;
};

const TOKEN_KEY = "access_token";
const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

const StatisticsChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/dashboard/statistik`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          // Sinkronisasi warna sesuai palet brand
          setChartData([
            { 
              name: "Pengerjaan Tugas", 
              value: data.tugas ?? 0, 
              color: "#064479" // Main Color
            },
            { 
              name: "Materi Ditonton", 
              value: data.materi ?? 0, 
              color: "#00D9FF" // Accent Cyan
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching chart stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE, router]);

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-[390px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064479]" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-[390px] flex flex-col">
      <h2 className="text-[28px] font-extrabold text-[#0f172a] mb-4">Statistik</h2>

      <div className="flex-1 w-full flex justify-center items-center relative">
        {totalValue > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={0} // FIX: Set ke 0 untuk menghilangkan celah
                dataKey="value"
                stroke="none" // FIX: Hilangkan garis tepi agar segmen terlihat menyatu
                startAngle={90} // Mengatur agar posisi mulai dari atas
                endAngle={450}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [value, "Jumlah"]} 
              />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                iconType="circle" 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-xs font-bold text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full border-[12px] border-gray-100 mx-auto mb-4" />
            <span className="text-gray-400 font-medium">Belum ada data aktivitas</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsChart;