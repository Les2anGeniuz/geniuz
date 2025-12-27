"use client"

import { useEffect, useMemo, useState, use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"

import Sidebar from "../../../../components/dashboardLayout/sidebar"
import Topbar from "../../../../components/dashboardLayout/topbar"
import MateriCard from "../../../../components/Kelas2/Materi"

type MateriRow = {
  id_Materi: number
  id_Kelas: number
  judul_materi: string
  deskripsi?: string | null
  tipe_konten?: string | null
  link_konten?: string | null
  urutan?: number | null
  Tanggal_tayang?: string | null
  thumbnail_url?: string | null
}

type KelasRow = {
  id_Kelas: number
  nama_kelas: string
}

function backendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
}

function pickData(payload: any) {
  if (!payload) return null
  if (payload.data !== undefined) return payload.data
  if (payload.materi !== undefined) return payload.materi
  if (payload.kelas !== undefined) return payload.kelas
  return payload
}

async function fetchJson(url: string, signal: AbortSignal) {
  const res = await fetch(url, { cache: "no-store", signal })
  const json = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, json }
}

async function fetchKelasSmart(idKelas: number, signal: AbortSignal) {
  const base = backendUrl()
  const candidates = [
    `${base}/api/kelas/${idKelas}`,
    `${base}/api/kelas?id=${idKelas}`,
    `${base}/api/kelas?id_Kelas=${idKelas}`,
  ]

  for (const u of candidates) {
    const r = await fetchJson(u, signal)
    if (r.ok) {
      const raw = pickData(r.json)
      if (raw) {
        const nama = raw.nama_kelas ?? raw.name ?? raw.nama ?? ""
        if (nama) return { id_Kelas: idKelas, nama_kelas: String(nama) }
        return { id_Kelas: idKelas, nama_kelas: "" }
      }
      return { id_Kelas: idKelas, nama_kelas: "" }
    }
    if (r.status !== 404) break
  }

  return null
}

function getYouTubeID(url: string) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2] && match[2].length === 11 ? match[2] : null
}

function toYouTubeEmbed(url: string) {
  const id = getYouTubeID(url)
  if (!id) return url
  return `https://www.youtube.com/embed/${id}`
}

function safeThumb(m: MateriRow) {
  const yt = m.link_konten ? getYouTubeID(m.link_konten) : null
  if (yt) return `https://img.youtube.com/vi/${yt}/mqdefault.jpg`
  return m.thumbnail_url || "https://placehold.co/200x112"
}

export default function MateriPage({
  params,
}: {
  params: Promise<{ idFakultas: string; idKelas: string; idMateri: string }>
}) {
  const p = use(params)
  const idFakultas = p.idFakultas
  const idKelas = p.idKelas
  const idMateri = p.idMateri

  const kelasIdNum = useMemo(() => Number(idKelas), [idKelas])
  const materiIdNum = useMemo(() => Number(idMateri), [idMateri])

  const [kelas, setKelas] = useState<KelasRow | null>(null)
  const [materi, setMateri] = useState<MateriRow | null>(null)
  const [materiKelas, setMateriKelas] = useState<MateriRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fatal, setFatal] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        setLoading(true)
        setFatal(null)

        if (!Number.isFinite(kelasIdNum) || !Number.isFinite(materiIdNum)) {
          setFatal("Param tidak valid")
          return
        }

        const base = backendUrl()

        const [kelasMaybe, listRes, detailRes] = await Promise.all([
          fetchKelasSmart(kelasIdNum, controller.signal),
          fetchJson(`${base}/api/materi?id_Kelas=${kelasIdNum}`, controller.signal),
          fetchJson(`${base}/api/materi?id_Materi=${materiIdNum}`, controller.signal),
        ])

        if (!listRes.ok) {
          const msg = listRes.json?.error || `Gagal ambil list materi (${listRes.status})`
          setFatal(String(msg))
          return
        }

        if (!detailRes.ok) {
          const msg = detailRes.json?.error || `Gagal ambil detail materi (${detailRes.status})`
          setFatal(String(msg))
          return
        }

        const listData = pickData(listRes.json)
        const detailData = pickData(detailRes.json)

        const listRows = Array.isArray(listData) ? (listData as MateriRow[]) : []
        const detailRow = detailData && !Array.isArray(detailData) ? (detailData as MateriRow) : null

        setMateriKelas(listRows)
        setMateri(detailRow)

        if (kelasMaybe) {
          setKelas(kelasMaybe)
        } else {
          setKelas({ id_Kelas: kelasIdNum, nama_kelas: "" })
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [kelasIdNum, materiIdNum])

  const nextItems = useMemo(() => {
    if (!materiKelas.length || !materi) return []
    const sorted = [...materiKelas].sort((a, b) => {
      const au = a.urutan ?? 0
      const bu = b.urutan ?? 0
      if (au !== bu) return au - bu
      return a.id_Materi - b.id_Materi
    })
    const idx = sorted.findIndex((x) => x.id_Materi === materi.id_Materi)
    const after = idx >= 0 ? sorted.slice(idx + 1) : sorted
    return after.slice(0, 2)
  }, [materiKelas, materi])

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat materi...</div>

  if (fatal) {
    return (
      <div className="p-10 text-center text-sm text-gray-600">
        <div className="font-semibold text-gray-900">Gagal memuat</div>
        <div className="mt-2">{fatal}</div>
        <div className="mt-4">
          <Link className="text-blue-700 font-semibold hover:underline" href={`/Kelas/${idFakultas}/${idKelas}`}>
            Kembali ke daftar materi
          </Link>
        </div>
      </div>
    )
  }

  if (!materi) return notFound()

  const embedSrc = materi.link_konten ? toYouTubeEmbed(materi.link_konten) : ""
  const labelTipe = (materi.tipe_konten || "MATERI").toUpperCase()
  const kelasNama = kelas?.nama_kelas ? kelas.nama_kelas : ""

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen text-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />

        <main className="p-8 pt-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Kelas <span className="font-normal text-gray-500">{kelasNama}</span>
            </h1>
          </div>

          <div className="grid grid-cols-12 gap-8 items-start">
            <section className="col-span-8">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="w-full aspect-video bg-black">
                  {embedSrc ? (
                    <iframe
                      className="w-full h-full"
                      src={embedSrc}
                      title={materi.judul_materi}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm">
                      Konten belum tersedia
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-3xl font-bold text-gray-900">{materi.judul_materi}</h2>

                  <div className="mt-3 inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {labelTipe}
                  </div>

                  {materi.deskripsi ? (
                    <p className="mt-4 text-gray-600 leading-relaxed">{materi.deskripsi}</p>
                  ) : null}

                  <div className="mt-6">
                    <Link
                      href={`/Kelas/${idFakultas}/${idKelas}`}
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      Kembali ke daftar materi
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <aside className="col-span-4">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Selanjutnya</h3>

                <div className="flex flex-col gap-4">
                  {nextItems.length === 0 ? (
                    <div className="text-sm text-gray-500">Belum ada materi berikutnya</div>
                  ) : (
                    nextItems.map((m) => (
                      <Link
                        key={m.id_Materi}
                        href={`/Kelas/${idFakultas}/${idKelas}/${m.id_Materi}`}
                        className="block transition-transform hover:scale-[1.01]"
                      >
                        <MateriCard
                          id={String(m.id_Materi)}
                          title={m.judul_materi}
                          date={m.Tanggal_tayang as any}
                          thumbnailUrl={safeThumb(m)}
                          tags={[(m.tipe_konten || "MATERI").toUpperCase()]}
                        />
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="p-8 text-center text-gray-500 text-sm border-t border-gray-100 mt-12 bg-white">
          © Copyright 2025, Geniuz. All Rights Reserved
        </footer>
      </div>
    </div>
  )
}