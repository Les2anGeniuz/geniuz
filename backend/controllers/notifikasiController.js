import { supabaseAdmin } from '../services/supabase.js'

// Ambil semua notifikasi user
export const getMyNotifikasi = async (req, res) => {
  try {
    const userId = req.user?.id_User
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { data, error } = await supabaseAdmin
      .from('Notifikasi')
      .select('*')
      .eq('id_User', userId)
      .order('tanggal', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ notifications: data })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

// Tandai notifikasi sebagai sudah dibaca
export const markAsRead = async (req, res) => {
  try {
    const { id_Notif } = req.params
    const { error } = await supabaseAdmin
      .from('Notifikasi')
      .update({ status_baca: true })
      .eq('id_Notif', id_Notif)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ message: 'Notifikasi diperbarui' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}