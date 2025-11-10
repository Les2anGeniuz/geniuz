import React from "react";

const DashboardAktivitasTerbaru = () => {
  const aktivitas = [
    { title: "New student enrolled", desc: "Desain Aplikasi Big Data" },
    { title: "New course created", desc: "Analisis Data Time Series" },
    { title: "Integrasi Data dengan Airflow", desc: "23 students" },
    { title: "Integrasi Data dengan Airflow", desc: "23 students" },
    { title: "Integrasi Data dengan Airflow", desc: "23 students" },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-800">Aktivitas Terbaru</h2>
        <p className="text-sm text-gray-500">Update terbaru dari LMS</p>
      </div>

      <div className="divide-y divide-gray-100">
        {aktivitas.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <p className="text-xs text-gray-400">4 jam lalu</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAktivitasTerbaru;
