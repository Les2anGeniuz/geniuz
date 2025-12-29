import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    return NextResponse.json({
      id,
      nama: "Admin",
      email: "admin@example.com",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data admin" },
      { status: 500 }
    );
  }
}
