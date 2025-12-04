"use client";

export default function ClassHeader({
  kelas,
}: {
  kelas: { id: string; name: string; description?: string } | null;
}) {
  if (!kelas)
    return (
      <div className="bg-[#002D5B] border-gray-200 rounded-2xl shadow-sm p-5">
        <p className="text-sm text-white">Belum ada kelas yang dipilih</p>
      </div>
    );

  return (
    <div className="bg-[#002D5B] border-gray-200 rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{kelas.name}</h2>
          <p className="text-sm text-white mt-1">ID: {kelas.id}</p>
          {kelas.description && (
            <p className="text-sm text-white mt-3">{kelas.description}</p>
          )}
        </div>
        <div className="text-right text-sm text-white">
          <div>3 modul</div>
          <div className="mt-2">8j durasi total</div>
        </div>
      </div>
    </div>
  );
}
