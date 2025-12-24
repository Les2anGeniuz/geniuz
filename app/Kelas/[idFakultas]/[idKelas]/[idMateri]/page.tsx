"use client"

import { useEffect, useMemo, useState, use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"

import Sidebar from "../../../../components/dashboardLayout/sidebar"
import Topbar from "../../../../components/dashboardLayout/topbar"
import MateriCard from "../../../../components/Kelas2/Materi"
import { supabase as supabaseClient } from "../../../../lib/supabaseClient"

type MateriRow = {
  id_Materi: number
  id_Kelas: number
  judul_materi: string
  deskripsi?: string | null
  tipe_konten?: string | null
  link_konten?: string | null
  urutan?: number | null
  thumbnail_url?: string | null
  Tanggal_tayang?: string | null
}

type KelasRow = {
  id_Kelas: number
  nama_kelas: string
  Materi: MateriRow[]
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

export default function HalamanMateriDinamis({
  params,
}: {
  params: Promise<{ idFakultas: string; idKelas: string; idMateri: string }>
}) {
  const resolvedParams = use(params)
  const idKelas = resolvedParams.idKelas
  const idFakultas = resolvedParams.idFakultas
  const idMateri = resolvedParams.idMateri

  const kelasIdNum = useMemo(() => Number(idKelas), [idKelas])
  const materiIdNum = useMemo(() => Number(idMateri), [idMateri])

  const [kelasData, setKelasData] = useState<KelasRow | null>(null)
  const [materi, setMateri] = useState<MateriRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const kId = Number(kelasIdNum)
        const mId = Number(materiIdNum)
        if (Number.isNaN(kId) || Number.isNaN(mId)) return

        const { data, error } = await supabaseClient
          .from("Kelas")
          .select(`id_Kelas,nama_kelas,Materi (*)`)
          .eq("id_Kelas", kId)
          .single()

        if (error) return

        const list = (data?.Materi || []) as MateriRow[]
        const current = list.find((x) => x.id_Materi === mId) || null

        setKelasData(data as any)
        setMateri(current)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [kelasIdNum, materiIdNum])

  const nextItems = useMemo(() => {
    if (!kelasData?.Materi?.length || !materi) return []
    const sorted = [...kelasData.Materi].sort((a, b) => {
      const au = a.urutan ?? 0
      const bu = b.urutan ?? 0
      if (au !== bu) return au - bu
      return a.id_Materi - b.id_Materi
    })
    const idx = sorted.findIndex((x) => x.id_Materi === materi.id_Materi)
    const after = idx >= 0 ? sorted.slice(idx + 1) : sorted
    const filtered = after.filter((x) => x.id_Materi !== materi.id_Materi)
    return filtered.slice(0, 2)
  }, [kelasData, materi])

  if (loading) return <div className="p-10 text-center italic text-gray-500">Memuat materi...</div>
  if (!kelasData) return notFound()
  if (!materi) return notFound()

  const embedSrc = materi.link_konten ? toYouTubeEmbed(materi.link_konten) : ""
  const labelTipe = (materi.tipe_konten || "MATERI").toUpperCase()

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen text-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />

        <main className="p-8 pt-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Kelas <span className="font-normal text-gray-500">{kelasData.nama_kelas}</span>
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