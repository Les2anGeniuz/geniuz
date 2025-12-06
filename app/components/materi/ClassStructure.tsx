"use client";

type Module = {
  id: string;
  title: string;
  description?: string;
  items?: number;
  duration?: string;
};

export default function ClassStructure({ modules }: { modules: Module[] }) {
  return (
    <div className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <h3 className="text-[15px] font-bold text-[#002D5B] mb-4">Struktur Kelas</h3>

      <div className="space-y-4">
        {modules.map((m, idx) => (
          <div
            key={m.id}
            className="border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-7 text-[13px] text-gray-400 font-semibold">
                {idx + 1}
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#002D5B] leading-snug">
                  {m.title}
                </div>
                {m.description && (
                  <div className="text-[10px] text-gray-500 mt-1 leading-snug">
                    {m.description}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[12px] font-medium text-green-600 border border-green-200 px-3 py-1 rounded-full">
              Terbit
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}