"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HeroSection() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // URL backend (pastikan sudah ada .env.local → NEXT_PUBLIC_API_BASE)
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login gagal");

      // Simpan token untuk auth selanjutnya
      localStorage.setItem("token", data.access_token);
      alert("Login berhasil!");

      // Arahkan ke halaman utama
      window.location.href = "/home";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="w-full min-h-[100vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/BackgroundPolos.svg')" }}
    >
      <div className="flex justify-center items-center flex-col">
        {/* === LOGO === */}
        <Image
          src="/logo_putih.svg"
          alt="Logo Les-lesan Geniuz"
          width={240}
          height={120}
          priority
        />

        {/* === Form Login === */}
        <div className="w-[700px] p-10 bg-white rounded-lg shadow-lg mt-5 mb-5">
          <h1 className="text-[60px] leading-[1] font-extrabold text-center text-black">
            Masuk
          </h1>
          <p className="mt-2 text-xl text-center font-sans text-black mb-3xl">
            Masukkan email dan password
          </p>

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="mt-10 mb-6">
              <input
                type="email"
                id="email"
                required
                className="text-lg w-full p-4 bg-[#EFF2F6] border border-[#EFF2F6] rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <input
                type="password"
                id="password"
                required
                className="text-lg w-full p-4 bg-[#EFF2F6] border border-[#EFF2F6] rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Error message */}
            {error && <p className="text-red-600 text-center mb-3">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="text-lg mb-2 w-full py-3 px-4 bg-[#FFF000] font-bold text-black rounded-full hover:bg-yellow-500 focus:outline-none transition"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          {/* Atau */}
          <div className="flex items-center justify-center mt-3 mb-2">
            <hr className="w-lg border-t border-black mr-2" />
            <span className="text-lg text-black font-bold">atau</span>
            <hr className="w-lg border-t border-black ml-2" />
          </div>

          {/* Login as Admin */}
          <div className="text-center mt-4">
            <Link href="/admin">
              <button
                type="button"
                className="text-lg w-full py-3 px-4 bg-transparent font-bold text-black border-2 border-black rounded-full hover:bg-[#064479] hover:text-white transition"
              >
                Login sebagai Admin
              </button>
            </Link>
          </div>

          {/* Register Link */}
          <div className="text-center mt-4">
            <p className="text-base">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-[#064479] hover:text-[#FFF000]"
              >
                Daftar sekarang!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
