import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

const SELECT_RELS = `
  id_Kelas,
  id_Fakultas,
  id_Mentor,
  nama_kelas,
  deskripsi,
  Fakultas(id_Fakultas,nama_fakultas),
  Mentor(id_Mentor,nama_mentor),
  Pendaftaran(id_Pendaftaran)
`;

function normalize(row: any) {
  return {
    id_Kelas: row.id_Kelas,
    id_Fakultas: row.id_Fakultas,
    nama_fakultas: row.Fakultas?.[0]?.nama_fakultas ?? null,

    id_Mentor: row.id_Mentor,
    nama_mentor: row.Mentor?.[0]?.nama_mentor ?? null,

    nama_kelas: row.nama_kelas ?? null,
    deskripsi: row.deskripsi ?? null,

    jumlah_siswa: Array.isArray(row.Pendaftaran)
      ? row.Pendaftaran.length
      : 0,
  };
}

function getId(req: Request) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Kelas")
    .select("*")
    .eq("id_Kelas", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // jika data tidak ditemukan
  if (!data) {
    return NextResponse.json(
      { error: `Kelas dengan ID ${id} tidak ditemukan` },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = getId(req);
    const body = await req.json();

    const updates: any = {};
    if (body.nama_kelas) updates.nama_kelas = body.nama_kelas;
    if (body.id_Fakultas) updates.id_Fakultas = body.id_Fakultas;
    if ("id_Mentor" in body) updates.id_Mentor = body.id_Mentor ?? null;
    if ("deskripsi" in body) updates.deskripsi = body.deskripsi;

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("Kelas")
      .update(updates)
      .eq("id_Kelas", id)
      .select(SELECT_RELS)
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: normalize(data) });
  } catch (err: any) {
    console.error("PUT /api/kelas/[id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = getId(req);
    const supabase = supabaseServer();
    const { error } = await supabase
      .from("Kelas")
      .delete()
      .eq("id_Kelas", id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/kelas/[id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}