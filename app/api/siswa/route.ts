import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

// Schema update: Pendaftaran no longer relates to Kelas.
// We derive student activity/status from Progress and enrich with User/Kelas data.
// Query Progress without nested User relation
const SELECT_PROGRESS = `
  id_Progress,
  id_User,
  id_Kelas,
  Last_update,
  Prsentase_Progress
`;

type ProgressRow = {
  id_Progress: number;
  id_User: number;
  id_Kelas: number | null;
  Last_update: string | null;
  Prsentase_Progress: number | null;
  User: {
    id_User: number;
    nama_lengkap: string;
    email: string;
  } | null;
};

type KelasRow = {
  id_Kelas: number;
  nama_kelas: string | null;
};

type UserRow = {
  id_User: number;
  nama_lengkap: string;
  email: string | null;
  created_at: string | null;
};

function getStatus(lastUpdate: string | null | undefined): "aktif" | "tidak_aktif" {
  if (!lastUpdate) return "tidak_aktif";
  const last = new Date(lastUpdate).getTime();
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return last >= cutoff ? "aktif" : "tidak_aktif";
}

export async function GET(req: Request) {
  const adminId = (await cookies()).get("admin_id")?.value;

  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const supabase = supabaseServer();

    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Number(url.searchParams.get("limit") || "15");
    const offset = (page - 1) * limit;

    const search = url.searchParams.get("search")?.trim() || "";
    const statusFilter = url.searchParams.get("status"); // aktif | tidak_aktif | null

    // 1) Ambil Progress rows (as source of activity per user-kelas)
    // We will enrich with User and Kelas in separate queries to avoid invalid relations.
    let query = supabase
      .from("Progress")
      .select(SELECT_PROGRESS, { count: "exact" })
      .order("Last_update", { ascending: false });

    if (search) {
      // fetch a bounded superset to search within (trade-off: not ideal for huge datasets)
      query = query.range(0, 9999);
    } else {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("GET /api/siswa error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rawRows: ProgressRow[] = (data as unknown as ProgressRow[]) ?? [];

    // Jika belum ada Progress sama sekali, tampilkan daftar User dasar sebagai fallback
    if (!rawRows.length) {
      const userQuery = supabase
        .from("User")
        .select("id_User,nama_lengkap,email,created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: users, error: userErr, count: userCount } = await userQuery;
      if (userErr) {
        console.error("GET /api/siswa fallback users error:", userErr);
        return NextResponse.json({ error: userErr.message }, { status: 500 });
      }

      const rows = (users as UserRow[]).map((u) => ({
        id_user: u.id_User,
        nama_lengkap: u.nama_lengkap,
        email: u.email ?? "",
        id_kelas: null,
        nama_kelas: null,
        tanggal_masuk: u.created_at,
        terakhir_aktif: null,
        progress: 0,
        status: "tidak_aktif" as const,
      }));

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const newRegistrations = rows.filter((r) => {
        if (!r.tanggal_masuk) return false;
        return new Date(r.tanggal_masuk) >= monthStart;
      }).length;

      return NextResponse.json({
        data: rows,
        meta: {
          total: userCount ?? rows.length,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil((userCount ?? rows.length) / limit)),
        },
        stats: {
          total: userCount ?? rows.length,
          aktif: 0,
          avgProgress: 0,
          newRegistrations,
        },
      });
    }

    // 2) Ambil Kelas data
    const kelasIds = Array.from(
      new Set(
        rawRows
          .map((r) => r.id_Kelas)
          .filter((v): v is number => typeof v === "number")
      )
    );

    // 3) Ambil Progress untuk semua user/kelas yang muncul
    const userIds = Array.from(
      new Set(
        rawRows
          .map((r) => r.User?.id_User)
          .filter((v): v is number => typeof v === "number")
      )
    );

    const userMap = new Map<number, UserRow>();
    const kelasMap = new Map<number, KelasRow>();

    if (userIds.length) {
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("id_User,nama_lengkap,email,created_at")
        .in("id_User", userIds);

      if (userError) {
        console.error("GET /api/siswa user error:", userError);
      } else {
        (userData as UserRow[]).forEach((u) => {
          userMap.set(u.id_User, u);
        });
      }
    }

    if (kelasIds.length) {
      const { data: kelasData, error: kelasError } = await supabase
        .from("Kelas")
        .select("id_Kelas,nama_kelas")
        .in("id_Kelas", kelasIds);

      if (kelasError) {
        console.error("GET /api/siswa kelas error:", kelasError);
      } else {
        (kelasData as KelasRow[]).forEach((k) => {
          kelasMap.set(k.id_Kelas, k);
        });
      }
    }

    // 4) Normalisasi rows + merge progress
    let rows = rawRows.map((row) => {
      const idUser = row.User?.id_User ?? null;
      const idKelas = row.id_Kelas ?? null;
      const lastUpdate = row.Last_update ?? null;
      const progressVal = row.Prsentase_Progress ?? 0;
      const status = getStatus(lastUpdate);

      const user = idUser ? userMap.get(idUser) : undefined;
      const kelas = idKelas ? kelasMap.get(idKelas) : undefined;

      return {
        id_user: idUser,
        nama_lengkap: user?.nama_lengkap ?? "",
        email: user?.email ?? "",
        id_kelas: idKelas,
        nama_kelas: kelas?.nama_kelas ?? null,
        tanggal_masuk: user?.created_at ?? null,
        terakhir_aktif: lastUpdate,
        progress: progressVal,
        status,
      };
    });

    // 5) Filter search di JS (nama, email, nama_kelas)
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        r.nama_lengkap.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        (r.nama_kelas ?? "").toLowerCase().includes(s)
      );
    }

    // 6) Filter status di JS
    if (statusFilter === "aktif") {
      rows = rows.filter((r) => r.status === "aktif");
    } else if (statusFilter === "tidak_aktif") {
      rows = rows.filter((r) => r.status === "tidak_aktif");
    }

    // 7) Hitung statistik dari rows yang sudah difilter
    // When search is used we filtered client-side; use the filtered length as total.
    const total = search ? rows.length : count ?? rows.length;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const aktifCount = rows.filter((r) => r.status === "aktif").length;

    const avgProgress =
      rows.length > 0
        ? rows.reduce((sum, r) => sum + (r.progress || 0), 0) / rows.length
        : 0;

    const newRegistrations = rows.filter((r) => {
      if (!r.tanggal_masuk) return false;
      return new Date(r.tanggal_masuk) >= monthStart;
    }).length;

    return NextResponse.json({
      data: rows,
      meta: {
        total,
        page: search ? 1 : page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      stats: {
        total,
        aktif: aktifCount,
        avgProgress,
        newRegistrations,
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("GET /api/siswa unexpected:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}