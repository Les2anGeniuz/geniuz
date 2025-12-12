import { supabaseAdmin } from '../services/supabase.js'

export const getDashboardProfile = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: userRow, error: userError } = await supabaseAdmin
      .from('User')
      .select('id_User, nama_lengkap, email')
      .eq('id_User', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      return res.status(500).json({ error: userError.message })
    }

    const { data: pendaftarans, error: daftarError } = await supabaseAdmin
      .from('Pendaftaran')
      .select('id_Pendaftaran, id_Kelas, Instansi, tanggal_pendaftaran')
      .eq('id_User', userId)
      .order('tanggal_pendaftaran', { ascending: false })

    if (daftarError) {
      return res.status(500).json({ error: daftarError.message })
    }

    const latest = pendaftarans && pendaftarans.length ? pendaftarans[0] : null

    let fakultasNama = null

    if (latest?.id_Kelas) {
      const { data: kelasRow, error: kelasError } = await supabaseAdmin
        .from('Kelas')
        .select('id_Kelas, id_Fakultas')
        .eq('id_Kelas', latest.id_Kelas)
        .single()

      if (kelasError && kelasError.code !== 'PGRST116') {
        return res.status(500).json({ error: kelasError.message })
      }

      if (kelasRow?.id_Fakultas) {
        const { data: fakultasRow, error: fakultasError } = await supabaseAdmin
          .from('Fakultas')
          .select('id_Fakultas, nama_fakultas')
          .eq('id_Fakultas', kelasRow.id_Fakultas)
          .single()

        if (fakultasError && fakultasError.code !== 'PGRST116') {
          return res.status(500).json({ error: fakultasError.message })
        }

        fakultasNama = fakultasRow?.nama_fakultas || null
      }
    }

    return res.status(200).json({
      nama: userRow?.nama_lengkap || null,
      universitas: latest?.Instansi || null,
      fakultas: fakultasNama
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: pendaftarans, error: daftarError } = await supabaseAdmin
      .from('Pendaftaran')
      .select('id_Pendaftaran, id_Kelas, status_pendaftaran')
      .eq('id_User', userId)

    if (daftarError) return res.status(500).json({ error: daftarError.message })

    const kelasIds = [...new Set((pendaftarans || []).map(p => p.id_Kelas).filter(Boolean))]
    const total_kelas = kelasIds.length

    const { data: pengumpulan, error: pengumpulanError } = await supabaseAdmin
      .from('Pengumpulan_Tugas')
      .select('id_Pengumpulan, nilai')
      .eq('id_User', userId)

    if (pengumpulanError) return res.status(500).json({ error: pengumpulanError.message })

    const tugas_selesai = (pengumpulan || []).filter(p => p.nilai !== null && p.nilai !== undefined).length

    const { data: progressRows, error: progressError } = await supabaseAdmin
      .from('Progress')
      .select('Prsentase_Progress')
      .eq('id_User', userId)

    if (progressError) return res.status(500).json({ error: progressError.message })

    let progress = 0
    if (progressRows && progressRows.length) {
      const total = progressRows.reduce((sum, row) => sum + Number(row.Prsentase_Progress || 0), 0)
      progress = Math.round(total / progressRows.length)
    }

    return res.status(200).json({
      total_kelas,
      tugas_selesai,
      progress
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getDashboardTugasAktif = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: pendaftarans, error: daftarError } = await supabaseAdmin
      .from('Pendaftaran')
      .select('id_Kelas, status_pendaftaran')
      .eq('id_User', userId)

    if (daftarError) return res.status(500).json({ error: daftarError.message })

    const kelasIds = [...new Set((pendaftarans || []).map(p => p.id_Kelas).filter(Boolean))]
    if (!kelasIds.length) return res.status(200).json({ tugas: null })

    const { data: tugasRows, error: tugasError } = await supabaseAdmin
      .from('Tugas')
      .select('id_Tugas, id_Kelas, judul_tugas, deskripsi, tanggal_mulai, tanggal_selesai, tenggat_waktu, status')
      .in('id_Kelas', kelasIds)
      .order('tanggal_selesai', { ascending: true })
      .limit(25)

    if (tugasError) return res.status(500).json({ error: tugasError.message })

    if (!tugasRows || !tugasRows.length) return res.status(200).json({ tugas: null })

    const tugasIds = tugasRows.map(t => t.id_Tugas)

    const { data: subs, error: subError } = await supabaseAdmin
      .from('Pengumpulan_Tugas')
      .select('id_Tugas, id_User')
      .eq('id_User', userId)
      .in('id_Tugas', tugasIds)

    if (subError) return res.status(500).json({ error: subError.message })

    const submitted = new Set((subs || []).map(s => s.id_Tugas))

    const active = tugasRows.find(t => !submitted.has(t.id_Tugas)) || null
    if (!active) return res.status(200).json({ tugas: null })

    const { data: kelasRow, error: kelasError } = await supabaseAdmin
      .from('Kelas')
      .select('id_Kelas, nama_kelas, id_Fakultas, id_Mentor')
      .eq('id_Kelas', active.id_Kelas)
      .single()

    if (kelasError && kelasError.code !== 'PGRST116') {
      return res.status(500).json({ error: kelasError.message })
    }

    return res.status(200).json({
      tugas: {
        ...active,
        kelas: kelasRow || null
      }
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getDashboardActivity = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: pendaftarans, error: daftarError } = await supabaseAdmin
      .from('Pendaftaran')
      .select('id_Kelas')
      .eq('id_User', userId)

    if (daftarError) return res.status(500).json({ error: daftarError.message })

    const kelasIds = [...new Set((pendaftarans || []).map(p => p.id_Kelas).filter(Boolean))]
    if (!kelasIds.length) return res.status(200).json({ activity: [] })

    const { data: materiRows, error: materiError } = await supabaseAdmin
      .from('Materi')
      .select('id_Materi, id_Kelas, judul_materi, Tanggal_tayang')
      .in('id_Kelas', kelasIds)
      .order('Tanggal_tayang', { ascending: false })
      .limit(10)

    if (materiError) return res.status(500).json({ error: materiError.message })

    const { data: tugasRows, error: tugasError } = await supabaseAdmin
      .from('Tugas')
      .select('id_Tugas, id_Kelas, judul_tugas, tanggal_selesai, tenggat_waktu')
      .in('id_Kelas', kelasIds)
      .order('tanggal_selesai', { ascending: true })
      .limit(10)

    if (tugasError) return res.status(500).json({ error: tugasError.message })

    const { data: submitRows, error: submitError } = await supabaseAdmin
      .from('Pengumpulan_Tugas')
      .select('id_Pengumpulan, id_Tugas, id_Kelas, tanggal_submit, nilai')
      .eq('id_User', userId)
      .order('tanggal_submit', { ascending: false })
      .limit(10)

    if (submitError) return res.status(500).json({ error: submitError.message })

    const materiActivities = (materiRows || [])
      .filter(m => m.Tanggal_tayang)
      .map(m => ({
        type: 'materi',
        title: `Materi Baru ${m.judul_materi || ''}`.trim(),
        timestamp: m.Tanggal_tayang,
        meta: { id_Materi: m.id_Materi, id_Kelas: m.id_Kelas }
      }))

    const tugasActivities = (tugasRows || [])
      .filter(t => t.tanggal_selesai || t.tenggat_waktu)
      .map(t => ({
        type: 'deadline',
        title: `Reminder Deadline ${t.judul_tugas || ''}`.trim(),
        timestamp: t.tanggal_selesai || null,
        meta: { id_Tugas: t.id_Tugas, id_Kelas: t.id_Kelas, tenggat_waktu: t.tenggat_waktu || null }
      }))

    const submitActivities = (submitRows || [])
      .filter(s => s.tanggal_submit)
      .map(s => ({
        type: 'submit',
        title: s.nilai !== null && s.nilai !== undefined ? 'Feedback Tugas' : 'Selesai! Tugas telah dikumpulkan',
        timestamp: s.tanggal_submit,
        meta: { id_Pengumpulan: s.id_Pengumpulan, id_Tugas: s.id_Tugas, id_Kelas: s.id_Kelas, nilai: s.nilai ?? null }
      }))

    const all = [...materiActivities, ...tugasActivities, ...submitActivities]
      .filter(a => a.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6)

    return res.status(200).json({ activity: all })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getDashboardAchievement = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: submissions, error } = await supabaseAdmin
      .from('Pengumpulan_Tugas')
      .select('id_Pengumpulan')
      .eq('id_User', userId)

    if (error) return res.status(500).json({ error: error.message })

    const totalSubmit = (submissions || []).length

    const build = (target) => {
      const progress = target === 0 ? 0 : Math.min(100, Math.round((totalSubmit / target) * 100))
      return { target, label: `Selesaikan ${target} Tugas!`, progress }
    }

    return res.status(200).json({
      total_submit: totalSubmit,
      achievements: [build(50), build(25), build(10)]
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getDashboardStatistik = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: pendaftarans, error: daftarError } = await supabaseAdmin
      .from('Pendaftaran')
      .select('id_Kelas')
      .eq('id_User', userId)

    if (daftarError) return res.status(500).json({ error: daftarError.message })

    const kelasIds = [...new Set((pendaftarans || []).map(p => p.id_Kelas).filter(Boolean))]
    if (!kelasIds.length) {
      return res.status(200).json({
        total_tugas: 0,
        tugas_selesai: 0,
        tugas_belum: 0
      })
    }

    const { data: tugasRows, error: tugasError } = await supabaseAdmin
      .from('Tugas')
      .select('id_Tugas')
      .in('id_Kelas', kelasIds)

    if (tugasError) return res.status(500).json({ error: tugasError.message })

    const totalTugas = (tugasRows || []).length

    if (!totalTugas) {
      return res.status(200).json({
        total_tugas: 0,
        tugas_selesai: 0,
        tugas_belum: 0
      })
    }

    const tugasIds = tugasRows.map(t => t.id_Tugas)

    const { data: subs, error: subError } = await supabaseAdmin
      .from('Pengumpulan_Tugas')
      .select('id_Tugas')
      .eq('id_User', userId)
      .in('id_Tugas', tugasIds)

    if (subError) return res.status(500).json({ error: subError.message })

    const selesaiSet = new Set((subs || []).map(s => s.id_Tugas))
    const tugasSelesai = selesaiSet.size
    const tugasBelum = Math.max(0, totalTugas - tugasSelesai)

    return res.status(200).json({
      total_tugas: totalTugas,
      tugas_selesai: tugasSelesai,
      tugas_belum: tugasBelum
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getDashboardKelasSaya = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: pendaftarans, error: daftarError } = await supabaseAdmin
      .from('Pendaftaran')
      .select('id_Pendaftaran, id_Kelas, status_pendaftaran, tanggal_pendaftaran')
      .eq('id_User', userId)
      .order('tanggal_pendaftaran', { ascending: false })

    if (daftarError) return res.status(500).json({ error: daftarError.message })

    const kelasIds = [...new Set((pendaftarans || []).map(p => p.id_Kelas).filter(Boolean))]
    if (!kelasIds.length) return res.status(200).json({ kelas_saya: [] })

    const { data: kelasRows, error: kelasError } = await supabaseAdmin
      .from('Kelas')
      .select('id_Kelas, id_Fakultas, id_Mentor, nama_kelas, deskripsi')
      .in('id_Kelas', kelasIds)

    if (kelasError) return res.status(500).json({ error: kelasError.message })

    const fakultasIds = [...new Set((kelasRows || []).map(k => k.id_Fakultas).filter(Boolean))]
    const mentorIds = [...new Set((kelasRows || []).map(k => k.id_Mentor).filter(Boolean))]

    const { data: fakultasRows, error: fakultasError } = await supabaseAdmin
      .from('Fakultas')
      .select('id_Fakultas, nama_fakultas')
      .in('id_Fakultas', fakultasIds)

    if (fakultasError) return res.status(500).json({ error: fakultasError.message })

    const { data: mentorRows, error: mentorError } = await supabaseAdmin
      .from('Mentor')
      .select('id_Mentor, nama_mentor, status')
      .in('id_Mentor', mentorIds)

    if (mentorError) return res.status(500).json({ error: mentorError.message })

    const kelasMap = new Map()
    ;(kelasRows || []).forEach(k => kelasMap.set(k.id_Kelas, k))

    const fakultasMap = new Map()
    ;(fakultasRows || []).forEach(f => fakultasMap.set(f.id_Fakultas, f))

    const mentorMap = new Map()
    ;(mentorRows || []).forEach(m => mentorMap.set(m.id_Mentor, m))

    const result = (pendaftarans || [])
      .filter(p => p.id_Kelas)
      .map(p => {
        const kelas = kelasMap.get(p.id_Kelas) || null
        const fakultas = kelas?.id_Fakultas ? fakultasMap.get(kelas.id_Fakultas) || null : null
        const mentor = kelas?.id_Mentor ? mentorMap.get(kelas.id_Mentor) || null : null
        return {
          id_Pendaftaran: p.id_Pendaftaran,
          status_pendaftaran: p.status_pendaftaran,
          tanggal_pendaftaran: p.tanggal_pendaftaran,
          kelas,
          fakultas,
          mentor
        }
      })

    return res.status(200).json({ kelas_saya: result })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getDashboardKelas = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: pendaftarans, error: daftarError } = await supabaseAdmin
      .from('Pendaftaran')
      .select('id_Pendaftaran, id_Kelas, status_pendaftaran, tanggal_pendaftaran')
      .eq('id_User', userId)
      .order('tanggal_pendaftaran', { ascending: false })

    if (daftarError) return res.status(500).json({ error: daftarError.message })

    const kelasIds = [...new Set((pendaftarans || []).map(p => p.id_Kelas).filter(Boolean))]
    if (!kelasIds.length) return res.status(200).json({ kelas: [] })

    const { data: kelasRows, error: kelasError } = await supabaseAdmin
      .from('Kelas')
      .select('id_Kelas, id_Fakultas, id_Mentor, nama_kelas, deskripsi')
      .in('id_Kelas', kelasIds)

    if (kelasError) return res.status(500).json({ error: kelasError.message })

    const kelasMap = new Map()
    ;(kelasRows || []).forEach(k => kelasMap.set(k.id_Kelas, k))

    const result = (pendaftarans || [])
      .filter(p => p.id_Kelas)
      .map(p => ({
        id_Pendaftaran: p.id_Pendaftaran,
        status_pendaftaran: p.status_pendaftaran,
        tanggal_pendaftaran: p.tanggal_pendaftaran,
        kelas: kelasMap.get(p.id_Kelas) || null
      }))

    return res.status(200).json({ kelas: result })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}
