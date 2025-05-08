/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"], // 🚀 Tambahkan localhost sebagai domain yang diperbolehkan
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000", // Pastikan sesuai dengan port backend
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
