// dashboardcontroller.js
import { supabaseAdmin } from "../services/supabase.js";

/** * HELPER FUNCTIONS 
 */

/** Ambil pendaftaran terakhir user (untuk mendapatkan id_Fakultas) */
const getLatestPendaftaran = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("Pendaftaran")
    .select("id_Fakultas, Instansi, tanggal_pendaftaran")
    .eq("id_User", userId)
    .order("tanggal_pendaftaran", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
};

/** Ambil daftar ID Kelas milik user */
const getUserKelasIds = async (userId) => {
  // 1. Cek dari tabel Progress terlebih dahulu
  const { data: prog, error: progErr } = await supabaseAdmin
    .from("Progress")
    .select("id_Kelas")
    .eq("id_User", userId);

  if (progErr) throw new Error(progErr.message);

  const fromProgress = [...new Set((prog || []).map((r) => r.id_Kelas).filter(Boolean))];
  if (fromProgress.length > 0) return fromProgress;

  // 2. Jika Progress kosong, ambil semua kelas berdasarkan Fakultas pendaftaran terakhir
  const latest = await getLatestPendaftaran(userId);
  if (!latest?.id_Fakultas) return [];

  const { data: kelasRows, error: kelasErr } = await supabaseAdmin
    .from("Kelas")
    .select("id_Kelas")
    .eq("id_Fakultas", latest.id_Fakultas);

  if (kelasErr) throw new Error(kelasErr.message);

  return [...new Set((kelasRows || []).map((k) => k.id_Kelas).filter(Boolean))];
};

const getKelasRowsByIds = async (kelasIds) => {
  if (!kelasIds.length) return [];
  const { data, error } = await supabaseAdmin
    .from("Kelas")
    .select("id_Kelas, id_Fakultas, id_Mentor, nama_kelas, deskripsi")
    .in("id_Kelas", kelasIds);

  if (error) throw new Error(error.message);
  return data || [];
};

/** * DASHBOARD CONTROLLERS 
 */

/** 1. PROFIL DASHBOARD */
export const getDashboardProfile = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { data: userRow, error: userErr } = await supabaseAdmin
      .from("User")
      .select("id_User, nama_lengkap, email")
      .eq("id_User", userId)
      .single();

    if (userErr) return res.status(500).json({ error: userErr.message });

    const latest = await getLatestPendaftaran(userId);

    let nama_fakultas = null;
    if (latest?.id_Fakultas) {
      const { data: fak, error: fakErr } = await supabaseAdmin
        .from("Fakultas")
        .select("nama_fakultas")
        .eq("id_Fakultas", latest.id_Fakultas)
        .single();

      if (!fakErr || fakErr.code === "PGRST116") {
        nama_fakultas = fak?.nama_fakultas ?? null;
      }
    }

    return res.status(200).json({
      nama_lengkap: userRow?.nama_lengkap ?? null,
      email: userRow?.email ?? null,
      nama_fakultas,
      instansi: latest?.Instansi ?? null,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/** 2. OVERVIEW STATS (Total Kelas, Selesai, Progress) */
export const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kelasIds = await getUserKelasIds(userId);
    
    // Hitung Tugas Selesai: Semua yang sudah dikumpulkan
    const { data: pengumpulan, error: pengErr } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("id_Pengumpulan")
      .eq("id_User", userId);

    if (pengErr) throw new Error(pengErr.message);

    const { data: progressRows, error: progErr } = await supabaseAdmin
      .from("Progress")
      .select("Prsentase_Progress")
      .eq("id_User", userId);

    if (progErr) throw new Error(progErr.message);

    let progress = 0;
    if (progressRows?.length > 0) {
      const total = progressRows.reduce((sum, row) => sum + Number(row.Prsentase_Progress || 0), 0);
      progress = Math.round(total / progressRows.length);
    }

    return res.status(200).json({ 
      total_kelas: kelasIds.length, 
      tugas_selesai: pengumpulan?.length || 0, 
      progress 
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/** 3. TUGAS AKTIF (Yang belum dikumpulkan) */
export const getDashboardTugasAktif = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kelasIds = await getUserKelasIds(userId);
    if (!kelasIds.length) return res.status(200).json({ tugas: [] });

    const { data: tugasRows, error: tugasErr } = await supabaseAdmin
      .from("Tugas")
      .select("*")
      .in("id_Kelas", kelasIds)
      .order("tanggal_selesai", { ascending: true });

    if (tugasErr) throw new Error(tugasErr.message);

    const { data: subs, error: subErr } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("id_Tugas")
      .eq("id_User", userId);

    if (subErr) throw new Error(subErr.message);

    const submittedIds = new Set(subs.map(s => s.id_Tugas));
    const activeTasks = tugasRows.filter(t => !submittedIds.has(t.id_Tugas));

    return res.status(200).json({ tugas: activeTasks });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/** 4. AKTIVITAS TERBARU (Materi, Deadline, Submit) */
export const getDashboardActivity = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kelasIds = await getUserKelasIds(userId);
    if (!kelasIds.length) return res.status(200).json({ activity: [] });

    const { data: mRows } = await supabaseAdmin.from("Materi").select("judul_materi, Tanggal_tayang").in("id_Kelas", kelasIds).order("Tanggal_tayang", { ascending: false }).limit(10);
    const { data: tRows } = await supabaseAdmin.from("Tugas").select("judul_tugas, tanggal_selesai").in("id_Kelas", kelasIds).order("tanggal_selesai", { ascending: true }).limit(10);
    const { data: sRows } = await supabaseAdmin.from("Pengumpulan_Tugas").select("tanggal_submit, nilai").eq("id_User", userId).order("tanggal_submit", { ascending: false }).limit(10);

    const mAct = (mRows || []).map(m => ({ type: "materi", title: `Materi Baru: ${m.judul_materi}`, timestamp: m.Tanggal_tayang }));
    const tAct = (tRows || []).map(t => ({ type: "deadline", title: `Deadline: ${t.judul_tugas}`, timestamp: t.tanggal_selesai }));
    const sAct = (sRows || []).map(s => ({ type: "submit", title: s.nilai ? "Feedback Tugas Tersedia" : "Tugas Telah Dikumpulkan", timestamp: s.tanggal_submit }));

    const all = [...mAct, ...tAct, ...sAct]
      .filter(a => a.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Menampilkan 10 item terbaru

    return res.status(200).json({ activity: all });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/** 5. PENCAPAIAN (ACHIEVEMENT) */
export const getDashboardAchievement = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { count } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("*", { count: 'exact', head: true })
      .eq("id_User", userId);

    const build = (target) => ({
      target,
      label: `Selesaikan ${target} Tugas!`,
      progress: Math.min(100, Math.round(((count || 0) / target) * 100))
    });

    return res.status(200).json({
      total_submit: count || 0,
      achievements: [build(50), build(25), build(10)]
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/** 6. STATISTIK DASHBOARD (Chart Data: Tugas, Materi, Kehadiran) */
export const getDashboardStatistik = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 1. Hitung Tugas yang sudah dikerjakan
    const { count: tugasCount } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("*", { count: 'exact', head: true })
      .eq("id_User", userId);

    // 2. Hitung Materi yang sudah dipelajari (dari tabel Progress)
    const { count: materiCount } = await supabaseAdmin
      .from("Progress")
      .select("*", { count: 'exact', head: true })
      .eq("id_User", userId);

    // 3. Hitung Kehadiran (dari tabel Absensi)
    const { count: absenCount } = await supabaseAdmin
      .from("Absensi")
      .select("*", { count: 'exact', head: true })
      .eq("id_User", userId);

    return res.status(200).json({
      tugas: tugasCount || 0,
      materi: materiCount || 0,
      absen: absenCount || 0
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/** 7. DAFTAR KELAS SAYA */
export const getDashboardKelasSaya = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    const kelasIds = await getUserKelasIds(userId);
    
    if (!kelasIds.length) return res.status(200).json({ kelas_saya: [] });

    const { data, error } = await supabaseAdmin
      .from("Kelas")
      .select("id_Kelas, id_Fakultas, nama_kelas, deskripsi")
      .in("id_Kelas", kelasIds);

    if (error) throw error;
    return res.status(200).json({ kelas_saya: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getDashboardKelas = (req, res) => getDashboardKelasSaya(req, res);