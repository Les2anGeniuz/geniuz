"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type LoginResponse =
  | { token: string } // format paling umum
  | { access_token: string }
  | { data: { token?: string; access_token?: string } }
  | { error?: string; message?: string };

const TOKEN_KEY = "access_token";

export default function LoginPage() {
  const router = useRouter();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api",
    []
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const url = `${API_BASE}/auth/login`;
      console.log("[LOGIN] POST:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }

      console.log("[LOGIN] status:", res.status);
      console.log("[LOGIN] data:", data);

      if (!res.ok) {
        // 401 biasanya karena kredensial salah ATAU payload gak cocok
        const msg =
          data?.error ||
          data?.message ||
          (res.status === 401 ? "Email atau password salah" : `Login gagal (${res.status})`);
        setErrorMsg(msg);
        return;
      }

      // coba ekstrak token dari berbagai kemungkinan format response
      const token =
        data?.token ||
        data?.access_token ||
        data?.data?.token ||
        data?.data?.access_token;

      if (!token || typeof token !== "string") {
        setErrorMsg("Login sukses tapi token tidak ditemukan di response backend.");
        return;
      }

      localStorage.setItem(TOKEN_KEY, token);
      router.replace("/dashboard");
    } catch (err: any) {
      console.error("[LOGIN] error:", err);
      setErrorMsg(err?.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')] bg-cover bg-center">
      <div className="top-9 fixed justify-center">
        <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={140} height={50} />
      </div>

      <div className="bg-white/95 items-center justify-center backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-[520px] text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Masuk</h1>
        <p className="text-gray-500 mb-8">Masukkan email dan password</p>

        {errorMsg ? (
          <div className="mb-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
            {errorMsg}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 my-2">
            <div className="flex-1 border-t border-gray-300" />
            <span>atau</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <a
            href="/login/admin"
            className="block w-full border border-gray-700 text-gray-900 font-bold py-3 rounded-full hover:bg-gray-900 hover:text-white transition"
          >
            Login sebagai Admin
          </a>
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
