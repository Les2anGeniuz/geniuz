import { supabaseAdmin } from "../services/supabase.js";

/** Ambil pendaftaran terakhir user (buat dapet id_Fakultas) */
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

/** Ambil kelasIds user:
 *  1) kalau ada Progress -> pakai Progress.id_Kelas
 *  2) kalau kosong -> pakai semua Kelas pada fakultas dari pendaftaran terakhir
 */
const getUserKelasIds = async (userId) => {
  const { data: prog, error: progErr } = await supabaseAdmin
    .from("Progress")
    .select("id_Kelas")
    .eq("id_User", userId);

  if (progErr) throw new Error(progErr.message);

  const fromProgress = [...new Set((prog || []).map((r) => r.id_Kelas).filter(Boolean))];
  if (fromProgress.length) return fromProgress;

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

      if (fakErr && fakErr.code !== "PGRST116") {
        return res.status(500).json({ error: fakErr.message });
      }

      nama_fakultas = fak?.nama_fakultas ?? null;
    }

    return res.status(200).json({
      nama_lengkap: userRow?.nama_lengkap ?? null,
      email: userRow?.email ?? null,
      nama_fakultas,
      instansi: latest?.Instansi ?? null,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Internal server error" });
  }
};

export const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kelasIds = await getUserKelasIds(userId);
    const total_kelas = kelasIds.length;

    const { data: pengumpulan, error: pengErr } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("nilai")
      .eq("id_User", userId);

    if (pengErr) return res.status(500).json({ error: pengErr.message });

    const tugas_selesai = (pengumpulan || []).filter(
      (p) => p.nilai !== null && p.nilai !== undefined
    ).length;

    const { data: progressRows, error: progErr } = await supabaseAdmin
      .from("Progress")
      .select("Prsentase_Progress")
      .eq("id_User", userId);

    if (progErr) return res.status(500).json({ error: progErr.message });

    let progress = 0;
    if (progressRows?.length) {
      const total = progressRows.reduce(
        (sum, row) => sum + Number(row.Prsentase_Progress || 0),
        0
      );
      progress = Math.round(total / progressRows.length);
    }

    return res.status(200).json({ total_kelas, tugas_selesai, progress });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Internal server error" });
  }
};

export const getDashboardTugasAktif = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kelasIds = await getUserKelasIds(userId);
    if (!kelasIds.length) return res.status(200).json({ tugas: null });

    const { data: tugasRows, error: tugasErr } = await supabaseAdmin
      .from("Tugas")
      .select("id_Tugas, id_Kelas, judul_tugas, deskripsi, tanggal_mulai, tanggal_selesai, tenggat_waktu, status")
      .in("id_Kelas", kelasIds)
      .order("tanggal_selesai", { ascending: true })
      .limit(25);

    if (tugasErr) return res.status(500).json({ error: tugasErr.message });
    if (!tugasRows?.length) return res.status(200).json({ tugas: null });

    const tugasIds = tugasRows.map((t) => t.id_Tugas);

    const { data: subs, error: subErr } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("id_Tugas")
      .eq("id_User", userId)
      .in("id_Tugas", tugasIds);

    if (subErr) return res.status(500).json({ error: subErr.message });

    const submitted = new Set((subs || []).map((s) => s.id_Tugas));
    const active = tugasRows.find((t) => !submitted.has(t.id_Tugas)) || null;

    return res.status(200).json({ tugas: active });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Internal server error" });
  }
};

export const getDashboardActivity = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kelasIds = await getUserKelasIds(userId);
    if (!kelasIds.length) return res.status(200).json({ activity: [] });

    const { data: materiRows, error: materiErr } = await supabaseAdmin
      .from("Materi")
      .select("id_Materi, id_Kelas, judul_materi, Tanggal_tayang")
      .in("id_Kelas", kelasIds)
      .order("Tanggal_tayang", { ascending: false })
      .limit(10);

    if (materiErr) return res.status(500).json({ error: materiErr.message });

    const { data: tugasRows, error: tugasErr } = await supabaseAdmin
      .from("Tugas")
      .select("id_Tugas, id_Kelas, judul_tugas, tanggal_selesai, tenggat_waktu")
      .in("id_Kelas", kelasIds)
      .order("tanggal_selesai", { ascending: true })
      .limit(10);

    if (tugasErr) return res.status(500).json({ error: tugasErr.message });

    const { data: submitRows, error: submitErr } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("id_Pengumpulan, id_Tugas, id_Kelas, tanggal_submit, nilai")
      .eq("id_User", userId)
      .order("tanggal_submit", { ascending: false })
      .limit(10);

    if (submitErr) return res.status(500).json({ error: submitErr.message });

    const materiActivities = (materiRows || [])
      .filter((m) => m.Tanggal_tayang)
      .map((m) => ({
        type: "materi",
        title: `Materi Baru ${m.judul_materi || ""}`.trim(),
        timestamp: m.Tanggal_tayang,
      }));

    const tugasActivities = (tugasRows || [])
      .filter((t) => t.tanggal_selesai || t.tenggat_waktu)
      .map((t) => ({
        type: "deadline",
        title: `Reminder Deadline ${t.judul_tugas || ""}`.trim(),
        timestamp: t.tanggal_selesai || null,
      }));

    const submitActivities = (submitRows || [])
      .filter((s) => s.tanggal_submit)
      .map((s) => ({
        type: "submit",
        title: s.nilai !== null && s.nilai !== undefined ? "Feedback Tugas" : "Selesai! Tugas telah dikumpulkan",
        timestamp: s.tanggal_submit,
      }));

    const all = [...materiActivities, ...tugasActivities, ...submitActivities]
      .filter((a) => a.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    return res.status(200).json({ activity: all });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Internal server error" });
  }
};

export const getDashboardAchievement = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { data: submissions, error } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("id_Pengumpulan")
      .eq("id_User", userId);

    if (error) return res.status(500).json({ error: error.message });

    const totalSubmit = (submissions || []).length;

    const build = (target) => {
      const progress = target === 0 ? 0 : Math.min(100, Math.round((totalSubmit / target) * 100));
      return { target, label: `Selesaikan ${target} Tugas!`, progress };
    };

    return res.status(200).json({
      total_submit: totalSubmit,
      achievements: [build(50), build(25), build(10)],
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Internal server error" });
  }
};

export const getDashboardStatistik = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kelasIds = await getUserKelasIds(userId);
    if (!kelasIds.length) return res.status(200).json({ total_tugas: 0, tugas_selesai: 0, tugas_belum: 0 });

    const { data: tugasRows, error: tugasErr } = await supabaseAdmin
      .from("Tugas")
      .select("id_Tugas")
      .in("id_Kelas", kelasIds);

    if (tugasErr) return res.status(500).json({ error: tugasErr.message });

    const totalTugas = (tugasRows || []).length;
    if (!totalTugas) return res.status(200).json({ total_tugas: 0, tugas_selesai: 0, tugas_belum: 0 });

    const tugasIds = tugasRows.map((t) => t.id_Tugas);

    const { data: subs, error: subErr } = await supabaseAdmin
      .from("Pengumpulan_Tugas")
      .select("id_Tugas")
      .eq("id_User", userId)
      .in("id_Tugas", tugasIds);

    if (subErr) return res.status(500).json({ error: subErr.message });

    const selesaiSet = new Set((subs || []).map((s) => s.id_Tugas));
    const tugasSelesai = selesaiSet.size;
    const tugasBelum = Math.max(0, totalTugas - tugasSelesai);

    return res.status(200).json({ total_tugas: totalTugas, tugas_selesai: tugasSelesai, tugas_belum: tugasBelum });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Internal server error" });
  }
};

export const getDashboardKelasSaya = async (req, res) => {
  try {
    const userId = req.user?.id_User;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kelasIds = await getUserKelasIds(userId);
    const kelasRows = await getKelasRowsByIds(kelasIds);

    return res.status(200).json({ kelas_saya: kelasRows });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Internal server error" });
  }
};

export const getDashboardKelas = async (req, res) => {
  // endpoint ini sama aja fungsinya di project lo, jadi gue samain
  return getDashboardKelasSaya(req, res);
};
