import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sesvblqrcbdmnkfvugtk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // Menambahkan Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Menambahkan Unsplash sebagai domain yang valid
      },
    ],
  },
};

export default nextConfig;
