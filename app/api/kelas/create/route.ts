import { supabaseServer } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_id")?.value;
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseServer();
  const body = await req.json();

  const { data, error } = await supabase.from("Kelas").insert([body]);

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json(data);
}
