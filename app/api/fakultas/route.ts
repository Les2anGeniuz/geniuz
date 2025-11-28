import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("Fakultas")
    .select("id_Fakultas,nama_fakultas")
    .order("nama_fakultas");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.nama_fakultas)
    return NextResponse.json(
      { error: "nama_fakultas required" },
      { status: 400 }
    );

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("Fakultas")
    .insert([{ nama_fakultas: body.nama_fakultas }])
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}