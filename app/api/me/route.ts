import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const match = authHeader.match(/^Bearer (.+)$/i);
    const token = match ? match[1] : null;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const supabase = supabaseServer();

    // Validate token and get user
    const { data: userData, error: authError } = await supabase.auth.getUser(token as string);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = userData.user;

    // Fetch profile and stats using service role key
    const [{ data: profile }, { data: stats }] = await Promise.all([
      supabase.from("User").select("nama_lengkap, profile_picture, university, faculty_id, class_id").eq("email", user.email).maybeSingle(),
      supabase.from("statistics").select("total_classes, completed_tasks, progress").eq("user_id", user.id).maybeSingle(),
    ] as any);

    return NextResponse.json({ user: { id: user.id, email: user.email }, profile, stats });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || String(e) }, { status: 500 });
  }
}
