"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
  editing: boolean;

  nama_kelas: string;
  setNamaKelas: (v: string) => void;
  deskripsi: string;
  setDeskripsi: (v: string) => void;

  id_Fakultas: string;
  id_Mentor: string;
  setIdFakultas: (v: string) => void;
  setIdMentor: (v: string) => void;

  fakultas: any[];
  mentor: any[];
}

export default function KelasModal(props: Props) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fadeIn">

        <h2 className="text-lg font-semibold text-[#002D5B] mb-4">
          {props.editing ? "Edit Kelas" : "Buat Kelas"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 font-medium">Nama Kelas</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              value={props.nama_kelas}
              onChange={(e) => props.setNamaKelas(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Deskripsi</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm h-20"
              value={props.deskripsi}
              onChange={(e) => props.setDeskripsi(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Fakultas</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white"
              value={props.id_Fakultas}
              onChange={(e) => props.setIdFakultas(e.target.value)}
            >
              <option value="">Pilih Fakultas</option>
              {props.fakultas.map((f: any) => (
                <option key={f.id_Fakultas} value={f.id_Fakultas}>
                  {f.nama_fakultas}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Mentor</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white"
              value={props.id_Mentor}
              onChange={(e) => props.setIdMentor(e.target.value)}
            >
              <option value="">Pilih Mentor</option>
              {props.mentor.map((m: any) => (
                <option key={m.id_Mentor} value={m.id_Mentor}>
                  {m.nama_mentor}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 text-sm rounded-full border"
            onClick={props.onClose}
          >
            Batal
          </button>

          <button
            className="px-5 py-2 text-sm rounded-full bg-[#002D5B] text-white disabled:opacity-50"
            disabled={props.loading}
            onClick={props.onSave}
          >
            {props.loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
