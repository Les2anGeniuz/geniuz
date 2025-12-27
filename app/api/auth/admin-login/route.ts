import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

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

  // Generate JWT token
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: "admin",
      nama: admin.nama || admin.nama_lengkap || "Admin"
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set cookie (optional, for legacy)
  const cookieStore = await cookies();
  cookieStore.set("admin_id", String(admin.id), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return NextResponse.json({ token });
}