"use client";

import { useState } from "react";

type Module = {
  id: string;
  title: string;
  description?: string;
  items?: number;
  duration?: string;
};

export default function ClassStructure({
  modules,
}: {
  modules: Module[];
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-16 font-bold mb-4">Struktur Kelas</h3>
      <div className="space-y-3">
        {modules.map((m, idx) => (
          <div
            key={m.id}
            className="border border-gray-100 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 text-sm text-gray-400">{idx + 1}</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{m.title}</div>
                {m.description && (
                  <div className="text-xs text-gray-500">{m.description}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-green-600">
              <div className="px-3 py-1 bg-green-100 rounded-full">Published</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
