import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

function toISODate(d) {
  return new Date(d).toISOString()
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function diffDays(start, end) {
  const a = new Date(start)
  const b = new Date(end)
  const ms = b.getTime() - a.getTime()
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

function calcDeltaPct(current, previous) {
  if (!previous || previous === 0) return null
  return ((current - previous) / previous) * 100
}

function isCompletedProgress(p) {
  const total = Number(p.Total_tugas ?? 0)
  const done = Number(p.Tugas_Selesai ?? 0)
  const pct =
    p.Prsentase_Progress === null || p.Prsentase_Progress === undefined
      ? null
      : Number(p.Prsentase_Progress)

  if (total > 0) return done >= total
  if (pct !== null) return pct >= 100
  return false
}

function progressValuePct(p) {
  const total = Number(p.Total_tugas ?? 0)
  const done = Number(p.Tugas_Selesai ?? 0)
  const pct =
    p.Prsentase_Progress === null || p.Prsentase_Progress === undefined
      ? null
      : Number(p.Prsentase_Progress)

  if (total > 0) return Math.max(0, Math.min(100, (done / total) * 100))
  if (pct !== null) return Math.max(0, Math.min(100, pct))
  return 0
}

export async function getAdminAnalytics(req, res) {
  try {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : addDays(new Date(), -30)
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : new Date()

    const startISO = toISODate(startDate)
    const endISO = toISODate(endDate)

    const rangeDays = diffDays(startDate, endDate)
    const prevEnd = startDate
    const prevStart = addDays(prevEnd, -rangeDays)

    const prevStartISO = toISODate(prevStart)
    const prevEndISO = toISODate(prevEnd)

    const [
      revenueNow,
      revenuePrev,
      progressNow,
      progressPrev,
      submissionsNow,
      submissionsPrev,
      enrollNow,
      enrollPrev,
      kelasRows
    ] = await Promise.all([
      supabase
        .from('Pembayaran')
        .select('jumlah_bayar,tanggal_bayar,status_pembayaran')
        .eq('status_pembayaran', 'berhasil')
        .gte('tanggal_bayar', startISO)
        .lt('tanggal_bayar', endISO),

      supabase
        .from('Pembayaran')
        .select('jumlah_bayar,tanggal_bayar,status_pembayaran')
        .eq('status_pembayaran', 'berhasil')
        .gte('tanggal_bayar', prevStartISO)
        .lt('tanggal_bayar', prevEndISO),

      supabase
        .from('Progress')
        .select('id_User,id_Kelas,Total_tugas,Tugas_Selesai,Prsentase_Progress,Last_update')
        .gte('Last_update', startISO)
        .lt('Last_update', endISO),

      supabase
        .from('Progress')
        .select('id_User,id_Kelas,Total_tugas,Tugas_Selesai,Prsentase_Progress,Last_update')
        .gte('Last_update', prevStartISO)
        .lt('Last_update', prevEndISO),

      supabase
        .from('Pengumpulan_Tugas')
        .select('id_User,id_Kelas,tanggal_submit,nilai')
        .gte('tanggal_submit', startISO)
        .lt('tanggal_submit', endISO),

      supabase
        .from('Pengumpulan_Tugas')
        .select('id_User,id_Kelas,tanggal_submit,nilai')
        .gte('tanggal_submit', prevStartISO)
        .lt('tanggal_submit', prevEndISO),

      supabase
        .from('Pendaftaran')
        .select('id_Pendaftaran,tanggal_pendaftaran')
        .gte('tanggal_pendaftaran', startISO)
        .lt('tanggal_pendaftaran', endISO),

      supabase
        .from('Pendaftaran')
        .select('id_Pendaftaran,tanggal_pendaftaran')
        .gte('tanggal_pendaftaran', prevStartISO)
        .lt('tanggal_pendaftaran', prevEndISO),

      supabase
        .from('Kelas')
        .select('id_Kelas,nama_kelas,id_Fakultas,id_Mentor')
    ])

    if (revenueNow.error) throw revenueNow.error
    if (revenuePrev.error) throw revenuePrev.error
    if (progressNow.error) throw progressNow.error
    if (progressPrev.error) throw progressPrev.error
    if (submissionsNow.error) throw submissionsNow.error
    if (submissionsPrev.error) throw submissionsPrev.error
    if (enrollNow.error) throw enrollNow.error
    if (enrollPrev.error) throw enrollPrev.error
    if (kelasRows.error) throw kelasRows.error

    const sumRevenue = (rows) => rows.reduce((acc, r) => acc + Number(r.jumlah_bayar ?? 0), 0)

    const totalRevenue = sumRevenue(revenueNow.data)
    const totalRevenuePrev = sumRevenue(revenuePrev.data)

    const activeSetNow = new Set()
    for (const p of progressNow.data) if (p.id_User != null) activeSetNow.add(p.id_User)
    for (const s of submissionsNow.data) if (s.id_User != null) activeSetNow.add(s.id_User)
    const activeStudents = activeSetNow.size

    const activeSetPrev = new Set()
    for (const p of progressPrev.data) if (p.id_User != null) activeSetPrev.add(p.id_User)
    for (const s of submissionsPrev.data) if (s.id_User != null) activeSetPrev.add(s.id_User)
    const activeStudentsPrev = activeSetPrev.size

    const completedKeyNow = new Set()
    for (const p of progressNow.data) {
      if (p.id_User == null || p.id_Kelas == null) continue
      if (isCompletedProgress(p)) completedKeyNow.add(`${p.id_User}:${p.id_Kelas}`)
    }
    const completedClasses = completedKeyNow.size

    const completedKeyPrev = new Set()
    for (const p of progressPrev.data) {
      if (p.id_User == null || p.id_Kelas == null) continue
      if (isCompletedProgress(p)) completedKeyPrev.add(`${p.id_User}:${p.id_Kelas}`)
    }
    const completedClassesPrev = completedKeyPrev.size

    const progressByUserNow = new Map()
    for (const p of progressNow.data) {
      if (p.id_User == null) continue
      const v = progressValuePct(p)
      const prev = progressByUserNow.get(p.id_User)
      if (prev === undefined || v > prev) progressByUserNow.set(p.id_User, v)
    }
    const avgProgressPct = progressByUserNow.size
      ? Array.from(progressByUserNow.values()).reduce((a, b) => a + b, 0) / progressByUserNow.size
      : 0

    const progressByUserPrev = new Map()
    for (const p of progressPrev.data) {
      if (p.id_User == null) continue
      const v = progressValuePct(p)
      const prev = progressByUserPrev.get(p.id_User)
      if (prev === undefined || v > prev) progressByUserPrev.set(p.id_User, v)
    }
    const avgProgressPctPrev = progressByUserPrev.size
      ? Array.from(progressByUserPrev.values()).reduce((a, b) => a + b, 0) / progressByUserPrev.size
      : 0

    const kpiDelta = {
      revenuePct: calcDeltaPct(totalRevenue, totalRevenuePrev),
      activeStudentsPct: calcDeltaPct(activeStudents, activeStudentsPrev),
      completedClassesPct: calcDeltaPct(completedClasses, completedClassesPrev),
      avgStudyPct: calcDeltaPct(avgProgressPct, avgProgressPctPrev)
    }

    const payload = {
      range: { startDate: startISO, endDate: endISO },
      kpis: {
        totalRevenue,
        activeStudents,
        completedClasses,
        avgStudyHoursPerDay: avgProgressPct,
        kpiDelta
      },
      enrollmentVsCompletion: [],
      classPopularity: [],
      weeklyProgress: [],
      topPerformers: [],
      classPerformance: [],
      meta: { totalClasses: Array.isArray(kelasRows.data) ? kelasRows.data.length : 0 }
    }

    res.json(payload)
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}