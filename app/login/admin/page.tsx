"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginAdminPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("../dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')]">
        {/* Logo */}
        <div className="top-9 fixed justify-center">
          <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={140} height={50} />
        </div>
      <div className="bg-white/95 items-center justify-center backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-[520px] text-center">

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Masuk <br/> sebagai Admin</h1>
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

          {/* Button Login Admin */}
        <Link rel="stylesheet" href="/dashboard"> 
          <button
            type="submit"
            className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition"
            >
            Login
          </button>
        </Link>
        </form>
      </div>
    </div>
  );
}
