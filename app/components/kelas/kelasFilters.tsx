"use client";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  setPageTo1: () => void;
}

export default function KelasFilters({ search, setSearch, setPageTo1 }: Props) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <input
        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm 
        focus:ring-2 focus:ring-[#002D5B]/20 focus:border-[#002D5B]"
        placeholder="Cari kelas"
        value={search}
        onChange={(e) => {
          setPageTo1();
          setSearch(e.target.value);
        }}
      />
    </div>
  );
}