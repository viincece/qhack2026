import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large file uploads for tender PDFs
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Exclude pdf-parse from the webpack bundle (it uses fs)
  serverExternalPackages: ["pdf-parse", "docx"],
};

export default nextConfig;
