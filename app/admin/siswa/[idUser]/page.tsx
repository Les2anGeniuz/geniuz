
import SidebarAdmin from "../../../components/layouts/sidebarAdmin";
import Navbar from "../../../components/layouts/navbarAdmin";
import { cookies } from "next/headers";
import EditBiodataForm from "./EditBiodataForm";

export default async function SiswaDetailPage({ params }: { params: { idUser: string } } | { params: Promise<{ idUser: string }> }) {
  let awaitedParams: { idUser: string };
  if (typeof (params as any).then === "function") {
    awaitedParams = await (params as Promise<{ idUser: string }>);
  } else {
    awaitedParams = params as { idUser: string };
  }
  const idUser = awaitedParams.idUser;
  if (!idUser) {
    return <div className="p-10 text-center text-red-500">ID User tidak ditemukan di URL.</div>;
  }

  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
  const API_URL = API;

  // Fetch all biodata, pendaftaran, pembayaran from admin API
  async function fetchSiswaDetail(idUser: string, admin_token: string) {
    const res = await fetch(`${API}/api/admin/siswa/${idUser}?include=pendaftaran,pembayaran`, {
      headers: { Authorization: `Bearer ${admin_token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  // Fetch fakultas name by id
  async function fetchFakultasName(idFakultas: string) {
    if (!idFakultas) return null;
    const res = await fetch(`${API}/api/fakultas/${idFakultas}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.fakultas?.nama_fakultas || null;
  }

  const cookieStore = await cookies();
  const admin_token = cookieStore.get("admin_token")?.value;
  if (!admin_token) {
    return <div className="p-10 text-center text-red-500">Token admin tidak ditemukan. Silakan login ulang sebagai admin.</div>;
  }
  // Fetch all data from admin siswa API
  const siswaDetail = await fetchSiswaDetail(idUser, admin_token);
  // Ambil pendaftaran terbaru (jika ada)
  const pendaftaranArr = siswaDetail?.pendaftaran || [];
  const pendaftaran = Array.isArray(pendaftaranArr) && pendaftaranArr.length > 0 ? pendaftaranArr[0] : {};
  // Ambil pembayaran (array)
  const pembayaran = siswaDetail?.pembayaran || [];
  // Ambil nama fakultas jika ada id_Fakultas
  const fakultasName = pendaftaran?.id_Fakultas ? await fetchFakultasName(pendaftaran.id_Fakultas) : null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <div className="fixed top-0 left-0 h-screen w-64 z-30">
        <SidebarAdmin />
      </div>
      <div className="flex-1 flex flex-col" style={{ marginLeft: 256 }}>
        <div className="fixed top-0 left-64 right-0 z-20">
          <Navbar />
        </div>
        <main className="p-8 pt-24">
          <a
            href="/admin/siswa"
            className="mb-6 inline-block px-4 py-2 bg-[#002D5B] text-white rounded hover:bg-[#17457b] text-sm"
          >
            ← Kembali ke Daftar Siswa
          </a>
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-4 text-[#002D5B]">Detail Siswa</h1>
            <div className="flex gap-6 items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200" />
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-[#002D5B]">{siswaDetail?.nama_lengkap}</div>
                  {fakultasName && (
                    <span className="inline-block px-4 py-1 rounded-xl bg-blue-100 text-blue-800 font-bold text-sm ml-2">
                      {fakultasName}
                    </span>
                  )}
                </div>
                <div className="text-gray-500 text-sm">{siswaDetail?.email}</div>
                <div className="text-gray-400 text-xs mt-1">ID: {siswaDetail?.id_User || siswaDetail?.id_user}</div>
              </div>
            </div>
            {/* Identitas & Biodata */}
            <div className="mb-8">
              <div className="font-semibold text-[#002D5B] mb-2">Edit Biodata</div>
              {/* Komponen client untuk edit biodata */}
              <EditBiodataForm siswaDetail={siswaDetail} pendaftaran={pendaftaran} />
            </div>
            {/* Pembayaran: Satu Card Full */}
            <div className="mb-8">
              <div className="p-6 rounded-2xl bg-white shadow-md">
                <div className="font-semibold text-[#002D5B] mb-2">Pembayaran</div>
                <div className="flex flex-col gap-3">
                  {Array.isArray(pembayaran) && pembayaran.length > 0 ? (
                    pembayaran.map((p: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-[#002D5B]">{p.metode_pembayaran}</div>
                          <span
                            className={
                              'px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase ' +
                              (p.status_pembayaran === 'lunas'
                                ? 'bg-green-100 text-green-700'
                                : p.status_pembayaran === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-700')
                            }
                          >
                            {p.status_pembayaran}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">Jumlah: <span className="font-bold">{p.jumlah_bayar}</span></div>
                      </div>
                    ))
                  ) : (
                    <span className="inline-block px-4 py-2 rounded-xl bg-gray-100 text-gray-500 font-semibold text-base">Belum ada pembayaran.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
	);
}
