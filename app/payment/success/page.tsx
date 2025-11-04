"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/login"); // nanti bisa diarahkan ke halaman utama user
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/background.png')] text-white font-sans">
      {/* Logo */}
      <div className="mb-8">
        <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={160} height={50} />
      </div>

      {/* Card */}
      <div className="bg-white text-gray-900 rounded-3xl shadow-xl p-10 w-full max-w-[480px] text-center">
        <div className="flex justify-center mb-6">
          <span className="text-6xl font-bold text-[#064479]">✔</span>
        </div>

        <h1 className="text-5xl font-extrabold text-[#000] mb-2">Pembayaran Berhasil!</h1>
        <p className="text-gray-600 mb-8">
          Terima kasih telah melakukan pembayaran. Akun kamu sudah aktif dan siap digunakan.
        </p>

        <button
          onClick={handleContinue}
          className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition"
        >
          Kembali ke Halaman Login
        </button>
      </div>

      <p className="text-sm mt-8 opacity-70">
        © {new Date().getFullYear()} Les-lesan Geniuz. All Rights Reserved.
      </p>
    </div>
  );
}
