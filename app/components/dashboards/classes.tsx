import React from "react";

const DashboardKelasTerbaru = () => {
  const kelas = [
    "Integrasi Data dengan Airflow",
    "Integrasi Data dengan Airflow",
    "Integrasi Data dengan Airflow",
    "Integrasi Data dengan Airflow",
    "Integrasi Data dengan Airflow",
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Kelas Terbaru</h2>
          <p className="text-sm text-gray-500">Overview dari kelas terbaru</p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {kelas.map((nama, i) => (
          <div key={i} className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{nama}</p>
              <p className="text-xs text-gray-500">23 students</p>
            </div>
            <button className="bg-[#002D5B] text-white text-xs px-4 py-1.5 rounded-full">
              Active
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardKelasTerbaru;
