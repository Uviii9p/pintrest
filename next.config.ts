import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Use unoptimized for external images to avoid hostname issues
    unoptimized: true,

    // Allow all external domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow ALL HTTPS domains
      },
      {
        protocol: 'http',
        hostname: '**', // Allow ALL HTTP domains
      }
    ],

    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
