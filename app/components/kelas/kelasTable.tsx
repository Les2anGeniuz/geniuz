"use client";

interface Kelas {
  id_Kelas: number;
  nama_kelas: string;
  deskripsi: string | null;
  nama_fakultas: string | null;
  nama_mentor: string | null;
}

interface Props {
  data: Kelas[];
  onEdit: (item: Kelas) => void;
  onDelete: (item: Kelas) => void;
}

export default function KelasTable({ data, onEdit, onDelete }: Props) {
  return (
    <div className="w-full">

      {/* HEADER */}
      <div
        className="
          grid
          grid-cols-[minmax(280px,1.6fr)_minmax(180px,1fr)_minmax(160px,1fr)_minmax(100px,0.4fr)]
          gap-x-6
          px-6 py-3
          rounded-xl mb-2
          text-[13px] font-bold text-white
          bg-[#002D5B]
          sticky top-0 z-10
        "
      >

        <div>Kelas</div>
        <div>Fakultas</div>
        <div>Mentor</div>
        <div className="text-right">Aksi</div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm border rounded-xl bg-white">
            Tidak ada data
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.id_Kelas}
              className="
                grid grid-cols-[1.5fr_1fr_1.3fr_0.3fr]
                px-5 py-5 rounded-2xl
                bg-white shadow-sm border border-gray-200
                hover:shadow-md hover:bg-gray-50
                transition-all duration-150
              "
            >
              {/* NAMA KELAS */}
              <div className="pr-6">
                <p className="text-[15px] font-bold text-[#002D5B] leading-snug">
                  {item.nama_kelas}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                  {item.deskripsi || "Tidak ada deskripsi"}
                </p>
              </div>

              {/* FAKULTAS */}
              <div className="flex items-center text-[12px] font-semibold text-[#002D5B]">
                {item.nama_fakultas || "-"}
              </div>

              {/* MENTOR */}
              <div className="flex items-center text-[12px] text-gray-700">
                {item.nama_mentor || "-"}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end items-center gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="
                    px-4 py-1.5 rounded-full border
                    text-[12px] font-medium text-gray-600
                    hover:bg-gray-100 transition
                  "
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(item)}
                  className="
                    px-4 py-1.5 rounded-full border border-red-300
                    text-[12px] font-medium text-red-600
                    hover:bg-red-50 transition
                  "
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}