"use client";

export default function ClassHeader({
  kelas,
}: {
  kelas: { id: string; name: string; description?: string } | null;
}) {
  if (!kelas)
    return (
      <div className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-[#002D5B] text-white">
        <p className="text-sm opacity-90">Belum ada kelas yang dipilih</p>
      </div>
    );

  return (
    <div className="bg-[#002D5B] rounded-2xl shadow-md p-6 text-white sticky top-16 z-30">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">{kelas.name}</h2>
          <p className="text-sm opacity-80">ID: {kelas.id}</p>

          {kelas.description && (
            <p className="text-sm opacity-90 leading-relaxed max-w-xl">
              {kelas.description}
            </p>
          )}
        </div>

        <div className="text-right text-sm opacity-90 space-y-1">
          <p>3 modul</p>
          <p>8j durasi total</p>
        </div>
      </div>
    </div>
  );
}