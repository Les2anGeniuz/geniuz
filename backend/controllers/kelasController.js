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
<<<<<<< HEAD
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
=======
    const idNum = Number(id)
    if (!idNum || Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'id kelas tidak valid' })
    }

    const { data: kelasRow, error: kelasError } = await supabaseAdmin
      .from('Kelas')
      .select('id_Kelas, id_Fakultas, id_Mentor, nama_kelas, deskripsi')
      .eq('id_Kelas', idNum)
      .single()

    if (kelasError) {
      if (kelasError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Kelas not found' })
      }
      return res.status(500).json({ error: kelasError.message })
    }

    // Ambil materi & tugas spesifik kelas ini
    const idStr = String(idNum)
    const [{ data: materiRowsRaw, error: materiError }, { data: tugasRowsRaw, error: tugasError }] = await Promise.all([
      supabaseAdmin
        .from('Materi')
        .select('id_Materi, id_Kelas, judul_materi, Tanggal_tayang, tipe_konten, thumbnail_url')
        .or(`id_Kelas.eq.${idNum},id_Kelas.eq.${idStr}`)
        .order('Tanggal_tayang', { ascending: true }),
      supabaseAdmin
        .from('Tugas')
        .select('id_Tugas, id_Kelas, judul_tugas, deskripsi, tenggat_waktu, status')
        .or(`id_Kelas.eq.${idNum},id_Kelas.eq.${idStr}`)
        .order('tenggat_waktu', { ascending: true })
    ])

    if (materiError) return res.status(500).json({ error: materiError.message })
    if (tugasError) return res.status(500).json({ error: tugasError.message })

    // Safeguard: filter again in case upstream eq doesn't apply
    const materiRowsArr = Array.isArray(materiRowsRaw) ? materiRowsRaw : (materiRowsRaw ? [materiRowsRaw] : [])
    const tugasRowsArr = Array.isArray(tugasRowsRaw) ? tugasRowsRaw : (tugasRowsRaw ? [tugasRowsRaw] : [])
    const materiRows = materiRowsArr.filter(m => Number(m.id_Kelas) === idNum || String(m.id_Kelas) === idStr)
    const tugasRows = tugasRowsArr.filter(t => Number(t.id_Kelas) === idNum || String(t.id_Kelas) === idStr)

    return res.status(200).json({
      data: {
        ...kelasRow,
        Materi: materiRows || [],
        Tugas: tugasRows || [],
      }
    })
>>>>>>> 16409f052b8eda7afb6646baf7d1f930c3baf523
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}