import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Admin")
    .select("id, nama, email")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Admin tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}