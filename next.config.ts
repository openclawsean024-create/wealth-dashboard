import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force unique deployment ID to bust browser caches between deployments
  generateBuildId: async () => `deploy-${Date.now()}`,
};

export default nextConfig;
