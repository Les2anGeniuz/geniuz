import { supabaseAdmin } from '../services/supabase.js'

export const createPendaftaran = async (req, res) => {
  const userId = req.user.id_User
  const {
    id_Fakultas,
    domisili,
    tanggal_lahir,
    jurusan,
    semester,
    instansi,
    nama_lengkap,
    email
  } = req.body

  if (!id_Fakultas) {
    return res.status(400).json({ error: 'id_Fakultas wajib diisi' })
  }

  const { data, error } = await supabaseAdmin
    .from('Pendaftaran')
    .insert([
      {
        id_User: userId,
        id_Fakultas: id_Fakultas,
        Domisili: domisili,
        Tanggal_Lahir: tanggal_lahir,
        Jurusan: jurusan,
        Semester: semester,
        Instansi: instansi,
        Nama_Lengkap: nama_lengkap,
        Email: email,
        status_pendaftaran: 'pending'
      }
    ])
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  return res.status(201).json({ pendaftaran: data })
}

export const getMyPendaftarans = async (req, res) => {
  const userId = req.user.id_User

  const { data, error } = await supabaseAdmin
    .from('Pendaftaran')
    .select('*')
    .eq('id_User', userId)

  if (error) return res.status(400).json({ error: error.message })
  return res.status(200).json({ pendaftaran: data })
}
