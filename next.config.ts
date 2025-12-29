import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // ✅ backend VPS kamu
        destination: "http://157.230.251.113/api/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sesvblqrcbdmnkfvugtk.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },

      // ✅ (OPSIONAL) kalau image kamu ada yang dari backend VPS (misal /uploads/...)
      {
        protocol: "http",
        hostname: "157.230.251.113",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
