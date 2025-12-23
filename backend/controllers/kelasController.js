import { supabaseAdmin } from '../services/supabase.js'

export const getAllKelas = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('Kelas')
      .select('id_Kelas, id_Fakultas, id_Mentor, nama_kelas, deskripsi')
      .order('id_Kelas', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ data: data || [] }) // Menggunakan key 'data' agar konsisten
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

export const getKelasByFakultas = async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('Fakultas')
      .select(`
        id_Fakultas,
        nama_fakultas,
        Kelas (
          id_Kelas,
          nama_kelas,
          Materi (
            id_Materi, 
            judul_materi, 
            Tanggal_tayang, 
            tipe_konten, 
            thumbnail_url
          ),
          Tugas (
            id_Tugas, 
            judul_tugas, 
            status, 
            tenggat_waktu
          )
        )
      `)
      .eq('id_Fakultas', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Kelas not found' })
      }
      return res.status(500).json({ error: error.message })
    }

    // Mengirim data dalam objek 'data' agar sesuai dengan fetch di Next.js
    return res.status(200).json({ data: data })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}