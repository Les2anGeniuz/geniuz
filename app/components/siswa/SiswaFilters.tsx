// components/siswa/SiswaFilters.tsx
import React from "react";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  status: "all" | "aktif" | "tidak_aktif";
  setStatus: (val: "all" | "aktif" | "tidak_aktif") => void;
}

const SiswaFilters: React.FC<Props> = ({
  search,
  setSearch,
  status,
  setStatus,
}) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#002D5B]">Filters</p>

      <div className="flex gap-3">
        {/* search */}
        <div className="flex-1 bg-[#E5E7EB] rounded-full px-5 py-2 flex items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses or instructors"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {/* status */}
        <div className="w-40">
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "all" | "aktif" | "tidak_aktif")
            }
            className="w-full bg-[#E5E7EB] text-xs rounded-full px-3 py-2 outline-none text-gray-600"
          >
            <option value="all">All status</option>
            <option value="aktif">Aktif</option>
            <option value="tidak_aktif">Tidak aktif</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SiswaFilters;