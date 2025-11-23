"use client";

import { useState } from "react";

export default function TaskList({ tasks }: { tasks: any[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  if (!tasks) tasks = [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-16 font-bold mb-3">Tugas</h4>
      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="text-sm text-gray-500">Belum ada tugas</div>
        )}
        {tasks.map((t) => {
          const id = (t.id_Tugas ?? t.id ?? t.id_tugas ?? Math.random()).toString();
          const title = t.judul_tugas ?? t.title ?? t.judul ?? "Untitled";
          const start = t.tanggal_mulai ?? t.startDate ?? "-";
          const end = t.tanggal_selesai ?? t.endDate ?? "-";

          return (
            <div key={id} className="border border-gray-100 rounded-md">
              <button
                onClick={() => setOpen((s) => ({ ...s, [id]: !s[id] }))}
                className="w-full flex items-center justify-between px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800">{title}</div>
                </div>
                <div className="text-sm text-gray-400">{open[id] ? "Tutup ▴" : "Detail ▾"}</div>
              </button>

              {open[id] && (
                <div className="px-3 pb-3 text-sm text-gray-700 border-t border-gray-100">
                  <div><strong>Mulai:</strong> {start}</div>
                  <div><strong>Selesai:</strong> {end}</div>
                  {t.deskripsi && <div className="mt-2"><strong>Deskripsi:</strong> {t.deskripsi}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
