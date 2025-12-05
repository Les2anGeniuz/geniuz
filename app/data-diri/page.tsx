"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DataDiriPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    domisili: "",
    tanggalLahir: "",
    instansi: "",
    fakultas: "",
    jurusan: "",
    semester: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validasi sederhana
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

    // nanti di sini bisa dihubungkan ke backend
    // contoh: await fetch('/api/data-diri', { method: 'POST', body: JSON.stringify(formData) })

    router.push("/payment"); // arahkan ke halaman selanjutnya
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')] bg-cover bg-center">
      {/* Logo */}
      <div className="absolute top-9">
        <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={140} height={50} />
      </div>

      {/* Form Container */}
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-[800px] text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Isi Data Diri</h1>
        <p className="text-gray-500 mb-8">
          Isi data di bawah secara lengkap dan jujur
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Kiri */}
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
              <label className="text-sm font-semibold">
                Nama Instansi Pendidikan
              </label>
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

          {/* Kanan */}
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
                <option value="Finance">Finance</option>
                <option value="Data">Data</option>
                <option value="IT and Software Developer">
                  IT and Software Developer
                </option>
                <option value="Business and Marketing">
                  Business and Marketing
                </option>
                <option value="Product and Design">Product and Design</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Jurusan</label>
              <input
                type="text"
                placeholder="Contoh: Sains Data"
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
                min="1"
                placeholder="Contoh: 5"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-400 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
              />
            </div>
          </div>

          {/* Tombol Continue */}
          <div className="col-span-1 md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
