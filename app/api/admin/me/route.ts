import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_id")?.value;

  if (!adminId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Admin")
    .select("id, nama, email")
    .eq("id", adminId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}