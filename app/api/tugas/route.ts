// GET /api/tugas?kelas=1
// POST /api/tugas

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const kelasId = url.searchParams.get("kelas");

  const supabase = supabaseServer();

  let query = supabase
    .from("Tugas")
    .select(`id_Tugas,id_Kelas,judul_tugas,tanggal_mulai,tanggal_selesai`)
    .order("tanggal_selesai", { ascending: true });

  if (kelasId) query = query.eq("id_Kelas", kelasId);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Tugas")
    .insert([body])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}
