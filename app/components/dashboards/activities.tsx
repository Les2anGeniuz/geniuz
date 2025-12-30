"use client";

import { useEffect, useState } from "react";

interface Aktivitas {
  title: string;
  desc: string;
  time: string;
}

const DashboardActivities = () => {
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
  const [activities, setActivities] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        if (!token) {
          setError("Admin token not found. Please login again.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API}/api/admin/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setActivities(json.data || []);
        } else {
          setError(json.message || "Gagal mengambil data aktivitas");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
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
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-3">Loading aktivitas...</p>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-3">{error}</p>
        ) : activities.length > 0 ? (
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
