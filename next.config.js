/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Suppress "critical dependency" warning for dynamic require in afipValidator
      config.module.exprContextCritical = false;
    }
    return config;
  },
};

module.exports = nextConfig;
