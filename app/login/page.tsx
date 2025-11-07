// login_page_fix.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Tambahkan kembali Image jika diperlukan

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email dan password harus diisi!");
      return;
    }

    setLoading(true);

    try {
      // Panggil endpoint API kustom Anda
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Tangani error dari backend kustom Anda (misalnya status 401)
        alert("Login gagal: " + (data.error || "Terjadi kesalahan pada server."));
        return;
      }

      // Login sukses
      // Anda mungkin perlu menyimpan access_token (data.access_token) di sini
      // Misalnya di Local Storage atau Context/Redux untuk digunakan pada request selanjutnya.
      console.log("Login berhasil. Token:", data.access_token);
      alert("Login berhasil! Selamat datang 👋");
      router.push("/userPage"); // arahkan ke halaman utama user
    } catch (error) {
      console.error("Error saat memanggil API login:", error);
      alert("Login gagal: Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  // ... (sisanya sama)
  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')] bg-cover bg-center">
      {/* Logo */}
      <div className="absolute top-9">
        <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={140} height={50} />
      </div>

      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-[520px] text-center">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Masuk</h1>
        <p className="text-gray-500 mb-8">Masukkan email dan password</p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          {/* Separator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 my-2">
            <div className="flex-1 border-t border-gray-300" />
            <span>atau</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Button Login Admin */}
          <button
            type="button"
            onClick={() => router.push("/login/admin")}
            className="w-full border border-gray-700 text-gray-900 font-bold py-3 rounded-full hover:bg-gray-900 hover:text-white transition"
          >
            Login sebagai Admin
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          Belum punya akun?{" "}
          <a href="/register" className="font-semibold text-[#064479] hover:underline">
            Daftar sekarang!
          </a>
        </p>
      </div>
    </div>
  );
}
