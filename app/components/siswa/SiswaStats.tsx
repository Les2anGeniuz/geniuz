// components/siswa/SiswaStats.tsx
import React from "react";

interface Stats {
  total: number;
  aktif: number;
  avgProgress: number;
  newRegistrations: number;
}

interface Props {
  stats: Stats;
}

const SiswaStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Siswa */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          Total Siswa
        </p>
        <p className="text-2xl font-bold mt-2">{stats.total.toLocaleString()}</p>
        <p className="text-[11px] text-gray-400 mt-1">+ 12% bulan ini (dummy)</p>
      </div>

      {/* Siswa Aktif */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          Siswa Aktif
        </p>
        <p className="text-2xl font-bold mt-2">
          {stats.aktif.toLocaleString()}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">+ 8% bulan ini (dummy)</p>
      </div>

      {/* Pendaftaran Baru */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase leading-tight">
          Pendaftaran Baru
        </p>
        <p className="text-2xl font-bold mt-2">
          {stats.newRegistrations.toLocaleString()}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">Bulan ini</p>
      </div>
    </div>
  );
};

export default SiswaStats;