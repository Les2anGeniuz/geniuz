"use client"

import { useEffect, useMemo, useState } from "react"

type AnalyticsApi = {
  data?: {
    totalRevenue?: number
    activeStudents?: number
    completedClasses?: number
    avgStudyHoursPerDay?: number
    kpiDelta?: {
      revenuePct?: number | null
      activeStudentsPct?: number | null
      completedClassesPct?: number | null
      avgStudyPct?: number | null
    }
  }
  error?: string
}

function backendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(n)
}

function formatNum(n: number) {
  return new Intl.NumberFormat("id-ID").format(n)
}

function formatDelta(v: number | null | undefined, suffix: string) {
  if (v === null || v === undefined || Number.isNaN(v)) return `N/A ${suffix}`
  const sign = v > 0 ? "+" : ""
  return `${sign}${Math.round(v)}% ${suffix}`
}

export default function AnalyticsStats() {
  const [api, setApi] = useState<AnalyticsApi | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null
        const res = await fetch(`${backendUrl()}/api/admin/analytics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
          signal: controller.signal,
        })
        const json = (await res.json()) as AnalyticsApi
        if (!res.ok) throw new Error(json?.error || "Gagal ambil analytics")
        setApi(json)
      } catch {
        setApi(null)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  const stats = useMemo(() => {
    const fallback = [
      { label: "Total Revenue", value: "2,221,200,000", note: "+5% dari bulan lalu" },
      { label: "Siswa yang Sedang Aktif", value: "1,234", note: "+15% dari bulan lalu" },
      { label: "Kelas yang Selesai", value: "456", note: "-2% dari bulan lalu" },
      { label: "Rata-rata Waktu Belajar", value: "4.2j", note: "+7% dari minggu lalu" },
    ]

    const d = api?.data
    if (!d) return fallback

    const revenue = Number(d.totalRevenue ?? 0)
    const active = Number(d.activeStudents ?? 0)
    const completed = Number(d.completedClasses ?? 0)
    const avgStudy = Number(d.avgStudyHoursPerDay ?? 0)

    return [
      {
        label: "Total Revenue",
        value: formatIDR(revenue),
        note: formatDelta(d.kpiDelta?.revenuePct ?? null, "dari bulan lalu"),
      },
      {
        label: "Siswa yang Sedang Aktif",
        value: formatNum(active),
        note: formatDelta(d.kpiDelta?.activeStudentsPct ?? null, "dari bulan lalu"),
      },
      {
        label: "Kelas yang Selesai",
        value: formatNum(completed),
        note: formatDelta(d.kpiDelta?.completedClassesPct ?? null, "dari bulan lalu"),
      },
      {
        label: "Rata-rata Waktu Belajar",
        value: `${avgStudy.toFixed(1)}j`,
        note: formatDelta(d.kpiDelta?.avgStudyPct ?? null, "dari minggu lalu"),
      },
    ]
  }, [api])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">{item.label}</h3>
          <p className="text-2xl font-bold text-gray-800">{item.value}</p>
          <p className="text-xs text-gray-500 mt-1">{item.note}</p>
        </div>
      ))}
    </div>
  )
}