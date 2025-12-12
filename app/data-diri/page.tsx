"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FAKULTAS_OPTIONS = [
  "Fakultas Finance",
  "Fakultas Data",
  "Fakultas IT and Software Dev",
  "Fakultas Business and Marketing",
  "Fakultas Product and Design",
];

const FAKULTAS_TO_KELAS_ID: Record<string, number> = {
  "Fakultas Finance": 1011,
  "Fakultas Data": 1111,
  "Fakultas IT and Software Dev": 1211,
  "Fakultas Business and Marketing": 1311,
  "Fakultas Product and Design": 1411,
};

export default function DataDiriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    domisili: "",
    tanggalLahir: "",
    instansi: "",
    fakultas: "",
    jurusan: "",
    semester: "",
  });

  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.domisili ||
      !formData.tanggalLahir ||
      !formData.instansi ||
      !formData.fakultas ||
      !formData.jurusan ||
      !formData.semester
    ) {
      alert("Semua data wajib diisi!");
      return;
    }

    const idKelas = FAKULTAS_TO_KELAS_ID[formData.fakultas];
    if (!idKelas) {
      alert("Kelas untuk fakultas ini belum diatur. Cek konfigurasi.");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("Sesi login berakhir, silakan login ulang.");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        id_Kelas: idKelas,
        domisili: formData.domisili,
        tanggal_lahir: formData.tanggalLahir,
        instansi: formData.instansi,
        jurusan: formData.jurusan,
        semester: formData.semester,
      };

      const res = await fetch(`${API}/api/pendaftaran`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal menyimpan data pendaftaran");
      }

      if (data?.pendaftaran?.id_Pendaftaran) {
        localStorage.setItem("idPendaftaran", String(data.pendaftaran.id_Pendaftaran));
      }

      router.push("/payment");
    } catch (err: any) {
      alert(err?.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')] bg-cover bg-center">
      <div className="absolute top-9">
        <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={140} height={50} />
      </div>

      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-[800px] text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Isi Data Diri</h1>
        <p className="text-gray-500 mb-8">Isi data di bawah secara lengkap dan jujur</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Domisili</label>
              <input
                type="text"
                placeholder="Contoh: Surakarta"
                value={formData.domisili}
                onChange={(e) =>
                  setFormData({ ...formData, domisili: e.target.value })
                }
                className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-400 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalLahir: e.target.value })
                }
                className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-400 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Nama Instansi Pendidikan</label>
              <input
                type="text"
                placeholder="Contoh: Universitas Sebelas Maret"
                value={formData.instansi}
                onChange={(e) =>
                  setFormData({ ...formData, instansi: e.target.value })
                }
                className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-400 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Fakultas</label>
              <select
                value={formData.fakultas}
                onChange={(e) =>
                  setFormData({ ...formData, fakultas: e.target.value })
                }
                className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-400 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
              >
                <option value="">Pilih Fakultas</option>
                {FAKULTAS_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Jurusan</label>
              <input
                type="text"
                placeholder="Contoh: Informatika"
                value={formData.jurusan}
                onChange={(e) =>
                  setFormData({ ...formData, jurusan: e.target.value })
                }
                className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-400 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Semester</label>
              <input
                type="number"
                min={1}
                max={14}
                placeholder="Contoh: 5"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-400 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Lanjut ke Pembayaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
