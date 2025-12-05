import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

function getId(req: Request) {
  const url = new URL(req.url);
  return url.pathname.split("/").at(-1);
}

export async function GET(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = getId(req);
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Materi")
    .select(`id_Materi,id_Kelas,urutan,judul_materi,deskripsi`)
    .eq("id_Materi", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = getId(req);
  const body = await req.json();

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Materi")
    .update(body)
    .eq("id_Materi", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = getId(req);
  const supabase = supabaseServer();

  const { error } = await supabase
    .from("Materi")
    .delete()
    .eq("id_Materi", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
