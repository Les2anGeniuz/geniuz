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
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Cari Kelas
      </label>
      <div className="flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari berdasarkan nama atau id kelas"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#002D5B]"
        />
        <button
          onClick={() => {
            if (filtered[0]) onSelect(filtered[0]);
          }}
          className="bg-[#002D5B] text-white px-4 py-2 rounded-lg"
        >
          Pilih
        </button>
      </div>

      {q && (
        <ul className="mt-2 max-h-44 overflow-auto border border-gray-100 rounded-md">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                onSelect(c);
                setQ("");
              }}
            >
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">ID: {c.id}</div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-2 text-sm text-gray-500">Tidak ada hasil</li>
          )}
        </ul>
      )}
    </div>
  );
}
