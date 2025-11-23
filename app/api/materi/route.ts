// GET /api/materi?kelas=1

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const kelasId = url.searchParams.get("kelas");

  if (!kelasId)
    return NextResponse.json({ error: "kelas required" }, { status: 400 });

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Materi")
    .select(`id_Materi,id_Kelas,urutan,judul_materi,deskripsi`)
    .eq("id_Kelas", kelasId)
    .order("urutan", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id_Kelas, judul_materi, deskripsi = null, urutan = null } = body;

    if (!id_Kelas || !judul_materi)
      return NextResponse.json({ error: "id_Kelas & judul_materi required" }, { status: 400 });

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("Materi")
      .insert([{ id_Kelas, judul_materi, deskripsi, urutan }])
      .select()
      .single();

    if (error) {
      console.error("POST /api/materi error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/materi unexpected:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
