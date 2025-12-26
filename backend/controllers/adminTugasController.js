import { supabaseAdmin } from '../services/supabase.js'

const SELECT_TUGAS = `
  id_Tugas,
  id_Kelas,
  judul_tugas,
  deskripsi,
  tanggal_mulai,
  tanggal_selesai,
  tenggat_waktu,
  lampiran,
  status,
  Kelas (
    id_Kelas,
    nama_kelas
  )
`

export const listAdminTugas = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1))
    const limit = Math.max(1, Number(req.query.limit || 10))
    const offset = (page - 1) * limit
    const id_Kelas = req.query.id_Kelas || null
    const status = req.query.status || null
    const search = (req.query.search || '').toString().trim()

    let q = supabaseAdmin
      .from('Tugas')
      .select(SELECT_TUGAS, { count: 'exact' })
      .order('tanggal_selesai', { ascending: false })
      .range(offset, offset + limit - 1)

    if (id_Kelas) {
      const idNum = Number(id_Kelas)
      const idStr = String(id_Kelas)
      q = q.or(`id_Kelas.eq.${idNum},id_Kelas.eq.${idStr}`)
    }
    if (status) q = q.eq('status', status)

    if (search) {
      const safe = search.replace(/[%()]/g, '')
      q = q.or(`judul_tugas.ilike.%${safe}%,deskripsi.ilike.%${safe}%`)
    }

    const { data, error, count } = await q
    if (error) return res.status(500).json({ error: error.message })

    const idNum = id_Kelas ? Number(id_Kelas) : null
    const idStr = id_Kelas ? String(id_Kelas) : null
    const filtered = id_Kelas
      ? (data || []).filter(t => Number(t.id_Kelas) === idNum || String(t.id_Kelas) === idStr)
      : data

    return res.json({
      data: filtered,
      meta: {
        page,
        limit,
        total: count,
        totalPage: Math.ceil((count || 0) / limit)
      }
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getAdminTugasById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('Tugas')
      .select(SELECT_TUGAS)
      .eq('id_Tugas', id)
      .single()

    if (error) return res.status(404).json({ error: 'Tugas tidak ditemukan' })
    return res.json({ data })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const createAdminTugas = async (req, res) => {
  try {
    const {
      id_Kelas,
      judul_tugas,
      deskripsi,
      tanggal_mulai,
      tanggal_selesai,
      tenggat_waktu,
      lampiran,
      status
    } = req.body || {}

    if (!id_Kelas || !judul_tugas) {
      return res.status(400).json({ error: 'id_Kelas dan judul_tugas wajib' })
    }

    const payload = {
      id_Kelas,
      judul_tugas,
      deskripsi: deskripsi ?? null,
      tanggal_mulai: tanggal_mulai ?? null,
      tanggal_selesai: tanggal_selesai ?? null,
      tenggat_waktu: tenggat_waktu ?? null,
      lampiran: lampiran ?? null,
      status: status ?? null
    }

    const { data, error } = await supabaseAdmin
      .from('Tugas')
      .insert([payload])
      .select(SELECT_TUGAS)
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.status(201).json({ data })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const updateAdminTugas = async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}

    const patch = {}
    if (body.id_Kelas !== undefined) patch.id_Kelas = body.id_Kelas
    if (body.judul_tugas !== undefined) patch.judul_tugas = body.judul_tugas
    if (body.deskripsi !== undefined) patch.deskripsi = body.deskripsi
    if (body.tanggal_mulai !== undefined) patch.tanggal_mulai = body.tanggal_mulai
    if (body.tanggal_selesai !== undefined) patch.tanggal_selesai = body.tanggal_selesai
    if (body.tenggat_waktu !== undefined) patch.tenggat_waktu = body.tenggat_waktu
    if (body.lampiran !== undefined) patch.lampiran = body.lampiran
    if (body.status !== undefined) patch.status = body.status

    if (!Object.keys(patch).length) {
      return res.status(400).json({ error: 'Tidak ada field untuk diupdate' })
    }

    const { data, error } = await supabaseAdmin
      .from('Tugas')
      .update(patch)
      .eq('id_Tugas', id)
      .select(SELECT_TUGAS)
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const deleteAdminTugas = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('Tugas')
      .delete()
      .eq('id_Tugas', id)

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}
