"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      className="w-full min-h-[100vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/BackgroundPolos.svg')" }}
    >
      <div className="flex justify-center items-center flex-col">
        {/* === LOGO === */}
        <Image
          src="/logo_putih.svg"  // Pastikan logo ada di dalam folder public
          alt="Logo Les-lesan Geniuz"
          width={240}
          height={120}
          priority
        />

        {/* === Form Login === */}
        <div className="w-[700px] p-10 bg-white rounded-lg shadow-lg mt-5 mb-5">
          {/* Form Heading */}
          <h1 className="text-[60px] leading-[1] font-extrabold text-center text-black">
            Masuk
          </h1>
          <p className="mt-2 text-xl text-center font-sans text-black mb-3xl">
            Masukkan email dan password
          </p>

          <form>
            {/* Email Input */}
            <div className="mt-10 mb-6">
              <input
                type="email"
                id="email"
                required
                className="text-lg w-full p-4 bg-[#EFF2F6] border border-[#EFF2F6] rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Email"
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
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="text-lg mb-2 w-full py-3 px-4 bg-[#FFF000] font-bold text-black rounded-full hover:bg-yellow-500 focus:outline-none transition"
            >
              Login
            </button>
          </form>

          {/* "Atau" dengan garis di bawah */}
          <div className="flex items-center justify-center mt-3 mb-2">
            <hr className="w-lg border-t border-black mr-2" /> {/* Lebar garis di kiri */}
            <span className="text-lg text-black font-bold">atau</span>
            <hr className="w-lg border-t border-black ml-2" /> {/* Lebar garis di kanan */}
          </div>

          {/* Login as Admin Button */}
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-lg w-full py-3 px-4 bg-transparent font-bold text-black border-2 border-black rounded-full hover:bg-[#064479] hover:text-white transition"
            >
              Login sebagai Admin
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-4">
            <p className="text-base">
              Belum punya akun?{" "}
              <a href="/register" className="text-[#064479] hover:text-[#FFF000]">
                Daftar sekarang!
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
