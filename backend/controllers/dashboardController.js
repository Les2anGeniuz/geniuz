import { supabaseAdmin } from '../services/supabase.js'

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: userRow, error: userError } = await supabaseAdmin
      .from('User')
      .select('id_User, nama_lengkap, email, created_at')
      .eq('id_User', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      return res.status(500).json({ error: userError.message })
    }

    const { data: pendaftarans, error: daftarError } = await supabaseAdmin
      .from('Pendaftaran')
      .select('id_Pendaftaran, id_Kelas, status_pendaftaran, Instansi, tanggal_pendaftaran')
      .eq('id_User', userId)
      .order('tanggal_pendaftaran', { ascending: false })

    if (daftarError) {
      return res.status(500).json({ error: daftarError.message })
    }

    const totalClasses = pendaftarans?.length || 0
    const pendaftaranAktif = pendaftarans && pendaftarans.length ? pendaftarans[0] : null

    const { data: pengumpulan, error: pengumpulanError } = await supabaseAdmin
      .from('Pengumpulan_Tugas')
      .select('id_Pengumpulan, nilai')
      .eq('id_User', userId)

    if (pengumpulanError) {
      return res.status(500).json({ error: pengumpulanError.message })
    }

    const completedTasks = (pengumpulan || []).filter(p => p.nilai !== null && p.nilai !== undefined).length

    const { data: progressRows, error: progressError } = await supabaseAdmin
      .from('Progress')
      .select('Prsentase_Progress')
      .eq('id_User', userId)

    if (progressError) {
      return res.status(500).json({ error: progressError.message })
    }

    let progress = 0
    if (progressRows && progressRows.length) {
      const total = progressRows.reduce((sum, row) => sum + Number(row.Prsentase_Progress || 0), 0)
      progress = Math.round(total / progressRows.length)
    }

    const user = {
      id_User: userRow?.id_User || userId,
      nama_lengkap: userRow?.nama_lengkap || req.user?.nama_lengkap || null,
      email: userRow?.email || req.user?.email || null,
      instansi: pendaftaranAktif?.Instansi || null
    }

    const summary = {
      totalClasses,
      completedTasks,
      progress
    }

    return res.status(200).json({
      user,
      summary,
      pendaftaran: pendaftaranAktif
    })
  } catch (e) {
    console.error('[DASHBOARD SUMMARY ERROR]', e)
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}
