import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

//
// FIX: Supabase JOIN proper LEFT JOIN style
//
const SELECT_RELS = `
  id_Kelas,
  id_Fakultas,
  id_Mentor,
  nama_kelas,
  deskripsi,
  Fakultas: id_Fakultas (
    id_Fakultas,
    nama_fakultas
  ),
  Mentor: id_Mentor (
    id_Mentor,
    nama_mentor
  ),
  Pengumpulan_Tugas(id_Pengumpulan)
`;

//
// FIX: Normalizer untuk object, bukan array
//
function normalizeRow(row: any) {
  return {
    id_Kelas: row.id_Kelas,

    id_Fakultas: row.id_Fakultas,
    nama_fakultas: row.Fakultas?.nama_fakultas ?? null,

    id_Mentor: row.id_Mentor,
    nama_mentor: row.Mentor?.nama_mentor ?? null,

    nama_kelas: row.nama_kelas ?? "",
    deskripsi: row.deskripsi ?? "",

    jumlah_siswa: Array.isArray(row.Pendaftaran)
      ? row.Pendaftaran.length
      : 0,
  };
}

export async function GET(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;

  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Number(url.searchParams.get("limit") || "15");
    const offset = (page - 1) * limit;

    const search = url.searchParams.get("search")?.trim() || "";
    const fakultas = url.searchParams.get("fakultas") || null;
    const mentor = url.searchParams.get("mentor") || null;

    const supabase = supabaseServer();

    let query = supabase
      .from("Kelas")
      .select(SELECT_RELS, { count: "exact" })
      .order("id_Kelas", { ascending: false })
      .range(offset, offset + limit - 1);

    //
    // FIX: Only table columns in OR search
    //
    if (search) {
      const safe = search.replace(/[%()]/g, "");
      query = query.or(
        `nama_kelas.ilike.%${safe}%,deskripsi.ilike.%${safe}%`
      );
    }

    if (fakultas) query = query.eq("id_Fakultas", fakultas);
    if (mentor) query = query.eq("id_Mentor", mentor);

    const { data, error, count } = await query;

    if (error) {
      console.error("GET /api/kelas error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let rows = (data ?? []).map(normalizeRow);

    //
    // FIX: Additional search for Fakultas / Mentor
    //
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        r.nama_kelas?.toLowerCase().includes(s) ||
        r.deskripsi?.toLowerCase().includes(s) ||
        r.nama_fakultas?.toLowerCase().includes(s) ||
        r.nama_mentor?.toLowerCase().includes(s)
      );
    }

    return NextResponse.json({
      data: rows,
      meta: {
        page,
        total: count ?? rows.length,
        limit,
        totalPages: Math.max(1, Math.ceil((count ?? rows.length) / limit)),
      },
    });
  } catch (err: any) {
    console.error("GET /api/kelas unexpected:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;

  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { nama_kelas, id_Fakultas, id_Mentor = null, deskripsi = null } =
      body;

    if (!nama_kelas || !id_Fakultas)
      return NextResponse.json(
        { error: "nama_kelas & id_Fakultas required" },
        { status: 400 }
      );

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("Kelas")
      .insert([{ nama_kelas, id_Fakultas, id_Mentor, deskripsi }])
      .select(SELECT_RELS)
      .single();

    if (error) {
      console.error("POST /api/kelas error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: normalizeRow(data) }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/kelas unexpected:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
