"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function PaymentPage() {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      alert("Silakan pilih metode pembayaran terlebih dahulu!");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const idPendaftaran = typeof window !== "undefined" ? localStorage.getItem("idPendaftaran") : null;

    if (!token || !idPendaftaran) {
      alert("Data pendaftaran tidak ditemukan, silakan ulangi proses.");
      router.push("/data-diri");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/pembayaran`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_Pendaftaran: Number(idPendaftaran),
          jumlah_bayar: 5999000,
          metode_pembayaran: selected,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal memproses pembayaran");
      }

      router.push("/payment/success");
    } catch (err: any) {
      alert(err?.message || "Terjadi kesalahan saat pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/background.png')] bg-cover bg-center">
      <div className="absolute top-9">
        <Image src="/logo_putih.svg" alt="Les2an Geniuz" width={150} height={50} />
      </div>

      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-[600px] max-h-[80vh] mt-30 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-2">Pembayaran</h1>
        <p className="text-gray-500 mb-8">Selesaikan pembayaran untuk melanjutkan.</p>

        <div className="bg-[#f9f9f9] border border-gray-300 rounded-2xl py-4 mb-6 text-left px-6">
          <p className="font-semibold text-gray-800 text-lg mb-1">Paket Langganan Geniuz</p>
          <p className="text-gray-500">Berlaku hingga setahun kedepan</p>
          <div className="flex justify-between mt-3">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-[#064479] text-4xl">Rp 5.999.000</span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-5">
          <p className="text-left font-regular text-gray-500 mb-2">Pilih Metode Pembayaran:</p>

          <div className="space-y-3 text-left">
            {["DANA", "Transfer Bank", "Kartu Debit/Kredit"].map((method) => (
              <label
                key={method}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border cursor-pointer transition ${
                  selected === method
                    ? "bg-[#FFF000] border-[#FFF000] text-gray-900 font-semibold"
                    : "bg-gray-50 border-gray-300 hover:border-[#FFF000]"
                }`}
                onClick={() => setSelected(method)}
              >
                <span>{method}</span>
                {selected === method && <span className="text-[#064479] font-bold">✔</span>}
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-[#FFF000] text-gray-900 font-bold py-3 rounded-full hover:bg-[#f7ca00] transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
