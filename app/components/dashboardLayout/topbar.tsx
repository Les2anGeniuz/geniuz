"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MeProfile = {
  foto_profil?: string | null;
};

const TOKEN_KEY = "access_token";
const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
const clearToken = () =>
  typeof window !== "undefined" && localStorage.removeItem(TOKEN_KEY);

const Topbar: React.FC = () => {
  const [fotoProfil, setFotoProfil] = useState<string>("");
  const [imgError, setImgError] = useState(false);

  const router = useRouter();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchMeProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch(`${API_BASE}/me/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (res.status === 401) {
          clearToken();
          router.replace("/login");
          return;
        }

        if (!res.ok) return;

        const data = (await res.json()) as MeProfile;
        setFotoProfil((data?.foto_profil || "").trim());
        setImgError(false);
      } catch (e: any) {
        if (e?.name !== "AbortError") console.error(e);
      }
    };

    fetchMeProfile();
    return () => controller.abort();
  }, [API_BASE, router]);

  const avatarSrc =
    fotoProfil && !imgError ? fotoProfil : "/placeholder-user.jpg";

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-6 py-1">
        <div className="flex items-center gap-2 ml-0">
          <Image
            src="/logo_geniuz.png"
            alt="Logo Les-lesan Geniuz"
            width={120}
            height={40}
            priority
          />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/notifications">
            <Image
              src="/notification.svg"
              alt="Notification Icon"
              width={24}
              height={24}
              className="cursor-pointer hover:opacity-80 transition"
            />
          </Link>

          <Link href="/settings" className="block">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-200 cursor-pointer relative">
              <Image
                src={avatarSrc}
                alt="Profile"
                fill
                className="object-cover"
                sizes="40px"
                onError={() => setImgError(true)}
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
