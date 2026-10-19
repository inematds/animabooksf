import type { NextConfig } from "next";

// Site estático (GitHub Pages). O prefixo vem de NEXT_PUBLIC_BASE_PATH no build
// (ex.: /animabooksf); vazio em desenvolvimento local.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
