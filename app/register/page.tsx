"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  // state sederhana buat simpan input user
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });

  // handler submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validasi sederhana
    if (!formData.nama || !formData.email || !formData.password) {
      alert("Semua kolom harus diisi!");
      return;
    }

    // nanti di sini bisa ditambah POST ke backend API
    // contoh: await fetch('/api/register', { method: 'POST', body: JSON.stringify(formData) })

    // setelah register berhasil → pindah ke form data diri
    router.push("/data-diri");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')] bg-cover bg-center">
      {/* Logo */}
      <div className="absolute top-9">
        <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={140} height={50} />
      </div>

      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-[520px] text-center">
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-gray-900 mb-2">Daftar</h1>
        <p className="text-gray-500 mb-8">Mendaftar sekarang!</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />

          {/* Button Register */}
          <button
            type="submit"
            className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition"
          >
            Register
          </button>
        </form>

        {/* Redirect ke login */}
        <p className="text-sm text-gray-600 mt-6">
          Sudah punya akun?{" "}
          <a href="/login" className="font-semibold text-[#064479] hover:underline">
            Masuk sekarang!
          </a>
        </p>
      </div>
    </div>
  );
}
