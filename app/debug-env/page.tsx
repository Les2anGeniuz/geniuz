"use client";

import { useEffect } from "react";

export default function DebugENVPage() {
  useEffect(() => {
    console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SUPABASE KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Debug ENV</h1>
      <p>Cek console (F12 → Console)</p>
    </div>
  );
}
