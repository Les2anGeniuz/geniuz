// backend/controllers/adminPengumpulanTugasController.js
import { supabaseAdmin } from "../services/supabase.js";

// GET /admin/tugas/:idTugas/pengumpulan
async function getPengumpulanTugas(req, res) {
  const { idTugas } = req.params;
  if (!idTugas) return res.status(400).json({ error: "idTugas is required" });

  // Query Pengumpulan_Tugas joined with User and Tugas
  const { data, error } = await supabaseAdmin
    .from("Pengumpulan_Tugas")
    .select(`*, User(*), Tugas(judul_tugas)`) // join User and Tugas
    .eq("id_Tugas", idTugas)
    .order("tanggal_submit", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export { getPengumpulanTugas };
