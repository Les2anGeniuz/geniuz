import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const supabase = supabaseServer();

  const { data: admin, error } = await supabase
    .from("Admin")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_id", String(admin.id), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return NextResponse.json({ message: "Login success" });
}