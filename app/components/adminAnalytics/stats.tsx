export default function AnalyticsStats() {
  const stats = [
    { label: "Total Revenue", value: "2,221,200,000", note: "+5% dari bulan lalu" },
    { label: "Siswa yang Sedang Aktif", value: "1,234", note: "+15% dari bulan lalu" },
    { label: "Kelas yang Selesai", value: "456", note: "-2% dari bulan lalu" },
    { label: "Rata-rata Waktu Belajar", value: "4.2j", note: "+7% dari minggu lalu" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">{item.label}</h3>
          <p className="text-2xl font-bold text-gray-800">{item.value}</p>
          <p className="text-xs text-gray-500 mt-1">{item.note}</p>
        </div>
      ))}
    </div>
  );
}