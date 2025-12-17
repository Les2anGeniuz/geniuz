import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

const SELECT_RELS = `
  id_Pendaftaran,
  tanggal_pendaftaran,
  status_pendaftaran,
  id_Kelas,
  id_User,

  User: id_User (
    id_User,
    nama_lengkap,
    email
  )
`;

type RawRow = {
  id_Pendaftaran: number;
  tanggal_pendaftaran: string | null;
  status_pendaftaran: string | null;
  id_Kelas: number | null;
  id_User: number | null;
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

type ProgressRow = {
  id_Progress: number;
  id_User: number;
  id_Kelas: number | null;
  Last_update: string | null;
  Prsentase_Progress: number | null;
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

    // 1) Ambil Pendaftaran + relasi User & Kelas
    // If a search query exists, fetch a larger bounded set and filter in JS
    // (avoids constructing fragile PostgREST relation filters client-side).
    let query = supabase
      .from("Pendaftaran")
      .select(SELECT_RELS, { count: "exact" })
      .order("tanggal_pendaftaran", { ascending: false });

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

    const rawRows: RawRow[] = (data as unknown as RawRow[]) ?? [];

    if (!rawRows.length) {
      return NextResponse.json({
        data: [],
        meta: {
          total: count ?? 0,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
        },
        stats: {
          total: 0,
          aktif: 0,
          avgProgress: 0,
          newRegistrations: 0,
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

    const kelasMap = new Map<number, KelasRow>();
    if (kelasIds.length) {
      const { data: kelasData } = await supabase
        .from("Kelas")
        .select("id_Kelas, nama_kelas")
        .in("id_Kelas", kelasIds);

      if (kelasData) {
        (kelasData as KelasRow[]).forEach((k) => {
          kelasMap.set(k.id_Kelas, k);
        });
      }
    }

    // 3) Ambil Progress untuk semua user/kelas yang muncul
    const userIds = Array.from(
      new Set(
        rawRows
          .map((r) => r.User?.id_User)
          .filter((v): v is number => typeof v === "number")
      )
    );

    const progressMap = new Map<string, ProgressRow>();

    if (userIds.length && kelasIds.length) {
      const { data: progressData, error: progressError } = await supabase
        .from("Progress")
        .select("id_Progress,id_User,id_Kelas,Last_update,Prsentase_Progress")
        .in("id_User", userIds)
        .in("id_Kelas", kelasIds);

      if (progressError) {
        console.error("GET /api/siswa progress error:", progressError);
      } else {
        (progressData as ProgressRow[]).forEach((p) => {
          const key = `${p.id_User}-${p.id_Kelas ?? "null"}`;
          progressMap.set(key, p);
        });
      }
    }

    // 4) Normalisasi rows + merge progress
    let rows = rawRows.map((row) => {
      const idUser = row.User?.id_User ?? null;
      const idKelas = row.id_Kelas ?? null;
      const key = `${idUser}-${idKelas ?? "null"}`;
      const prog = idUser ? progressMap.get(key) : undefined;

      const lastUpdate = prog?.Last_update ?? null;
      const progressVal = prog?.Prsentase_Progress ?? 0;
      const status = getStatus(lastUpdate);

      const kelasData = idKelas ? kelasMap.get(idKelas) : null;

      return {
        id_user: idUser,
        nama_lengkap: row.User?.nama_lengkap ?? "",
        email: row.User?.email ?? "",
        id_kelas: idKelas,
        nama_kelas: kelasData?.nama_kelas ?? null,
        tanggal_masuk: row.tanggal_pendaftaran ?? null,
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