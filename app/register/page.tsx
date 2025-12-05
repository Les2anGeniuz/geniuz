"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // URL backend dari env (fallback ke localhost:5000)
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // validasi sederhana
    if (!formData.nama || !formData.email || !formData.password) {
      setErr("Semua kolom wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // backend mengharapkan: nama_lengkap, email, password, id_Fakultas (opsional)
      const payload: any = {
        nama_lengkap: formData.nama.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Registrasi gagal");
      }

      // simpan token (opsional, bila ingin langsung login)
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      // arahkan ke form data diri
      router.push("/data-diri");
    } catch (e: any) {
      setErr(e?.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  }

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
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
            required
          />
          
          {/* Error */}
          {err && <p className="text-red-600 text-sm">{err}</p>}

          {/* Button Register */}
          <button
            type="submit"
            className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Register"}
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
