import { supabaseAdmin } from '../services/supabase.js'

export const getMateriByKelas = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('Materi')
      .select('id_Materi, id_Kelas, judul_materi, deskripsi, tipe_konten, link_konten, urutan, Tanggal_tayang, thumbnail_url')
      .eq('id_Kelas', id)
      .order('urutan', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ materi: data || [] })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getMateriById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('Materi')
      .select('id_Materi, id_Kelas, judul_materi, deskripsi, tipe_konten, link_konten, urutan, Tanggal_tayang, thumbnail_url')
      .eq('id_Materi', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Materi not found' })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ materi: data })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}
