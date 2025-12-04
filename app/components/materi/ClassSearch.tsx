"use client";

import { useState } from "react";

type ClassItem = {
  id: string;
  name: string;
  description?: string;
};

export default function ClassSearch({
  classes,
  onSelect,
}: {
  classes: ClassItem[];
  onSelect: (c: ClassItem) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = classes.filter((c) => {
    const name = (c.name || "").toString();
    const id = (c.id || "").toString();
    return name.toLowerCase().includes(q.toLowerCase()) || id.includes(q);
  });

  return (
    <div className="mb-5">

      <div className="flex items-center gap-4 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama atau ID kelas..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#002D5B]/20 focus:border-[#002D5B]"
        />
      </div>

      {q && (
        <ul className="mt-3 max-h-48 overflow-auto border border-gray-200/70 rounded-xl bg-white shadow-sm">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                onSelect(c);
                setQ("");
              }}
            >
              <div className="text-sm font-medium text-gray-800">{c.name}</div>
              <div className="text-xs text-gray-500">ID: {c.id}</div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">Tidak ada hasil</li>
          )}
        </ul>
      )}
    </div>
  );
}