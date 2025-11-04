"use client";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')]">
        {/* Logo */}
        <div className="top-9 fixed justify-center">
          <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={140} height={50} />
        </div>
      <div className="bg-white/95 items-center justify-center backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-[520px] text-center">

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Masuk</h1>
        <p className="text-gray-500 mb-8">Masukkan email dan password</p>

        {/* Form */}
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-100 text-gray-700 rounded-full px-4 py-3 border border-gray-500 focus:ring-2 focus:ring-[#FFF000] focus:outline-none"
          />

          {/* Button Login User */}
          <button
            type="submit"
            className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition"
          >
            Login
          </button>

          {/* Separator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 my-2">
            <div className="flex-1 border-t border-gray-300" />
            <span>atau</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Button Login Admin */}
          <a
            href="/login/admin"
            className="block w-full border border-gray-700 text-gray-900 font-bold py-3 rounded-full hover:bg-gray-900 hover:text-white transition"
          >
            Login sebagai Admin
          </a>
        </form>

        {/* Register */}
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
