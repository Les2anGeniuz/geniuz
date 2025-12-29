"use client";
import { useState } from "react";

export default function EditBiodataForm({ siswaDetail, pendaftaran }: { siswaDetail: any, pendaftaran: any }) {
  const [form, setForm] = useState({
    nama_lengkap: siswaDetail?.nama_lengkap || "",
    email: siswaDetail?.email || "",
    Domisili: pendaftaran?.Domisili || "",
    Jurusan: pendaftaran?.Jurusan || "",
    Semester: pendaftaran?.Semester || "",
    Instansi: pendaftaran?.Instansi || "",
    Tanggal_Lahir: pendaftaran?.Tanggal_Lahir || "",
    status_pendaftaran: pendaftaran?.status_pendaftaran || "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit() {
    setEditing(true);
    setSuccess(false);
  }
  function handleCancel() {
    setEditing(false);
    setForm({
      nama_lengkap: siswaDetail?.nama_lengkap || "",
      email: siswaDetail?.email || "",
      Domisili: pendaftaran?.Domisili || "",
      Jurusan: pendaftaran?.Jurusan || "",
      Semester: pendaftaran?.Semester || "",
      Instansi: pendaftaran?.Instansi || "",
      Tanggal_Lahir: pendaftaran?.Tanggal_Lahir || "",
      status_pendaftaran: pendaftaran?.status_pendaftaran || "",
    });
  }
  function getAdminToken() {
    // Coba dari cookie
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/);
      if (match) return decodeURIComponent(match[1]);
    }
    // Fallback ke localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token") || "";
    }
    return "";
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const token = getAdminToken();
      if (!token) throw new Error("Token admin tidak ditemukan. Silakan login ulang.");

      // Cek perubahan User
      const userChanged = form.nama_lengkap !== siswaDetail?.nama_lengkap || form.email !== siswaDetail?.email;
      // Cek perubahan Pendaftaran
      const pendaftaranChanged =
        form.Domisili !== pendaftaran?.Domisili ||
        form.Jurusan !== pendaftaran?.Jurusan ||
        form.Semester !== pendaftaran?.Semester ||
        form.Instansi !== pendaftaran?.Instansi ||
        form.Tanggal_Lahir !== pendaftaran?.Tanggal_Lahir ||
        form.status_pendaftaran !== pendaftaran?.status_pendaftaran;

      let updated = false;
      // Update User jika ada perubahan
      if (userChanged) {
        const resUser = await fetch(`/api/admin/siswa/${siswaDetail.id_User || siswaDetail.id_user}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nama_lengkap: form.nama_lengkap,
            email: form.email,
          }),
        });
        if (!resUser.ok) throw new Error("Gagal update data user");
        updated = true;
      }
      // Update Pendaftaran jika ada perubahan
      if (pendaftaranChanged && pendaftaran?.id_Pendaftaran) {
        const resPendaftaran = await fetch(`/api/pendaftaran/${pendaftaran.id_Pendaftaran}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Domisili: form.Domisili,
            Jurusan: form.Jurusan,
            Semester: form.Semester,
            Instansi: form.Instansi,
            Tanggal_Lahir: form.Tanggal_Lahir,
            status_pendaftaran: form.status_pendaftaran,
          }),
        });
        if (!resPendaftaran.ok) throw new Error("Gagal update data pendaftaran");
        updated = true;
      }
      if (!userChanged && !pendaftaranChanged) {
        throw new Error("Tidak ada perubahan data.");
      }
      setSuccess(true);
      setEditing(false);
    } catch (err: any) {
      alert(err.message || "Gagal update biodata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid grid-cols-2 gap-4 text-sm" onSubmit={handleSubmit}>
      {/* Data User */}
      <div className="col-span-2 font-semibold text-[#002D5B]">Data User</div>
      <div>
        <label className="block mb-1 font-medium">Nama Lengkap (User)</label>
        <input name="nama_lengkap" className="w-full border rounded px-2 py-1" value={form.nama_lengkap} onChange={handleChange} disabled={!editing} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Email (User)</label>
        <input name="email" className="w-full border rounded px-2 py-1" value={form.email} onChange={handleChange} disabled={!editing} />
      </div>
      {/* Data Pendaftaran */}
      <div className="col-span-2 font-semibold text-[#002D5B] mt-4">Data Pendaftaran</div>
      <div>
        <label className="block mb-1 font-medium">Domisili</label>
        <input name="Domisili" className="w-full border rounded px-2 py-1" value={form.Domisili} onChange={handleChange} disabled={!editing} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Jurusan</label>
        <input name="Jurusan" className="w-full border rounded px-2 py-1" value={form.Jurusan} onChange={handleChange} disabled={!editing} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Semester</label>
        <input name="Semester" className="w-full border rounded px-2 py-1" value={form.Semester} onChange={handleChange} disabled={!editing} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Instansi</label>
        <input name="Instansi" className="w-full border rounded px-2 py-1" value={form.Instansi} onChange={handleChange} disabled={!editing} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Tanggal Lahir</label>
        <input name="Tanggal_Lahir" className="w-full border rounded px-2 py-1" value={form.Tanggal_Lahir} onChange={handleChange} disabled={!editing} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Status</label>
        <input name="status_pendaftaran" className="w-full border rounded px-2 py-1" value={form.status_pendaftaran} onChange={handleChange} disabled={!editing} />
      </div>
      <div className="col-span-2 flex flex-col gap-2 mt-4">
        {!editing ? (
          <button type="button" className="w-full px-4 py-2 bg-[#002D5B] text-white rounded-lg hover:bg-[#17457b] text-base font-semibold transition" onClick={handleEdit}>Edit</button>
        ) : (
          <div className="flex gap-2 w-full">
            <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-base font-semibold transition" disabled={loading}>{loading ? "Updating..." : "Update"}</button>
            <button type="button" className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-base font-semibold transition" onClick={handleCancel} disabled={loading}>Cancel</button>
          </div>
        )}
        {success && (
          <span className="w-full text-center mt-2 px-3 py-2 rounded-lg bg-green-100 text-green-700 font-bold tracking-widest text-xs uppercase">
            BERHASIL DIUPDATE!
          </span>
        )}
      </div>
    </form>
  );
}