import { supabaseAdmin } from '../services/supabase.js'

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



export const createNotifikasi = async (userId, judul, pesan) => {
  try {

    const { data: existingNotif, error: checkError } = await supabaseAdmin
      .from('Notifikasi')
      .select('id_Notif')
      .eq('id_User', userId)
      .eq('judul', judul)
      .eq('pesan', pesan)
      .maybeSingle();

    if (checkError) {
      console.error('Error saat cek notif:', checkError.message);
    }


    if (existingNotif) {
      console.log(`⏭️ SKIP: Notif untuk User ID ${userId} sudah terkirim sebelumnya.`);
      return { success: true, message: 'Notification already exists, skipping insert.' };
    }

    const { data, error } = await supabaseAdmin
      .from('Notifikasi')
      .insert([
        { 
          id_User: userId, 
          judul: judul, 
          pesan: pesan,
          status_baca: false
          // Tanggal otomatis terisi 'now()' oleh database
        }
      ])
      .select();

    if (error) {
      console.error('❌ Gagal simpan notif ke DB:', error.message);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (e) {
    console.error('❌ Error createNotifikasi:', e.message);
    return { success: false, error: e.message };
  }
};


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