"use client";

import { useState } from "react";

export default function TaskList({ tasks }: { tasks: any[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <h4 className="text-[15px] font-bold text-[#002D5B] mb-4">Tugas</h4>

      <div className="space-y-4">
        {(!tasks || tasks.length === 0) && (
          <div className="text-sm text-gray-500">Belum ada tugas</div>
        )}

        {tasks.map((t) => {
          const id =
            (t.id_Tugas ?? t.id ?? t.id_tugas ?? Math.random()).toString();
          const title = t.judul_tugas ?? t.title ?? "Untitled";
          const start = t.tanggal_mulai ?? "-";
          const end = t.tanggal_selesai ?? "-";

          return (
            <div
              key={id}
              className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <button
                onClick={() => setOpen((s) => ({ ...s, [id]: !s[id] }))}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="text-[15px] text-[#002D5B] leading-snug">
                  {title}
                </div>
                <div className="text-[12px] text-[#002D5B]">
                  {open[id] ? "Tutup ▴" : "Detail ▾"}
                </div>
              </button>

              {open[id] && (
                <div className="px-4 pb-4 text-[13px] text-gray-700 border-t border-gray-200">
                  <div className="text-[12px]">
                    <span className="font-semibold text-[#002D5B]">Mulai:</span>{" "}
                    <span className="text-gray-700">{start}</span>
                  </div>
                  <div className="text-[12px]">
                    <span className="font-semibold text-[#002D5B]">Selesai:</span>{" "}
                    <span className="text-gray-700">{end}</span>
                  </div>
                  {t.deskripsi && (
                    <div className="mt-2 text-[12px]">
                      <span className="font-semibold text-[#002D5B]">Deskripsi:</span>{" "}
                      <span className="text-gray-700">{t.deskripsi}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}