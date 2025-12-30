const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // optional: handle error biar rapih
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  // kalau response kosong
  if (res.status === 204) return null;

  return res.json();
}
