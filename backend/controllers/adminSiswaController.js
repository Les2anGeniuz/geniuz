import { supabaseAdmin } from '../services/supabase.js'

export const listAdminSiswa = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1))
    const limit = Math.max(1, Number(req.query.limit || 10))
    const offset = (page - 1) * limit
    const search = (req.query.search || '').toString().trim()

    let q = supabaseAdmin
      .from('User')
      .select('id_User, nama_lengkap, email, created_at', { count: 'exact' })
      .order('id_User', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      const safe = search.replace(/[%()]/g, '')
      q = q.or(`nama_lengkap.ilike.%${safe}%,email.ilike.%${safe}%`)
    }

    const { data, error, count } = await q
    if (error) return res.status(500).json({ error: error.message })

    return res.json({
      data: data || [],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPage: Math.ceil(((count || 0) || 1) / limit)
      }
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getAdminSiswaById = async (req, res) => {
  try {
    const { id } = req.params
    const include = (req.query.include || '').toString()

    const { data: user, error } = await supabaseAdmin
      .from('User')
      .select('id_User, nama_lengkap, email, created_at')
      .eq('id_User', id)
      .single()

    if (error) return res.status(404).json({ error: 'Siswa tidak ditemukan' })

    if (!include) return res.json({ data: user })

    const wantPendaftaran = include.split(',').map(s => s.trim()).includes('pendaftaran')
    const wantPembayaran = include.split(',').map(s => s.trim()).includes('pembayaran')

    let pendaftaran = null
    let pembayaran = null

    if (wantPendaftaran || wantPembayaran) {
      const { data: daftarRows, error: daftarError } = await supabaseAdmin
        .from('Pendaftaran')
        .select('id_Pendaftaran, id_User, tanggal_pendaftaran, status_pendaftaran, Domisili, Tanggal_Lahir, Jurusan, Semester, Instansi, Nama_Lengkap, Email, id_Fakultas')
        .eq('id_User', id)
        .order('tanggal_pendaftaran', { ascending: false })

      if (daftarError) return res.status(500).json({ error: daftarError.message })
      pendaftaran = daftarRows || []

      if (wantPembayaran) {
        const daftarIds = (daftarRows || []).map(d => d.id_Pendaftaran).filter(Boolean)
        if (daftarIds.length) {
          const { data: bayarRows, error: bayarError } = await supabaseAdmin
            .from('Pembayaran')
            .select('id_Pembayaran, id_Pendaftaran, jumlah_bayar, metode_pembayaran, tanggal_bayar, status_pembayaran')
            .in('id_Pendaftaran', daftarIds)
            .order('tanggal_bayar', { ascending: false })

          if (bayarError) return res.status(500).json({ error: bayarError.message })
          pembayaran = bayarRows || []
        } else {
          pembayaran = []
        }
      }
    }

    return res.json({
      data: {
        ...user,
        ...(wantPendaftaran ? { pendaftaran } : {}),
        ...(wantPembayaran ? { pembayaran } : {})
      }
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const updateAdminSiswa = async (req, res) => {
  try {
    const { id } = req.params
    const { nama_lengkap, email, password } = req.body || {}

    const patch = {}
    if (nama_lengkap !== undefined) patch.nama_lengkap = nama_lengkap
    if (email !== undefined) patch.email = email
    if (password !== undefined) patch.password = password

    if (!Object.keys(patch).length) {
      return res.status(400).json({ error: 'Tidak ada field untuk diupdate' })
    }

    const { data, error } = await supabaseAdmin
      .from('User')
      .update(patch)
      .eq('id_User', id)
      .select('id_User, nama_lengkap, email, created_at')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ data })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const deleteAdminSiswa = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('User')
      .delete()
      .eq('id_User', id)

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}
