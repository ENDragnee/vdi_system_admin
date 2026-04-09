import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["vds-host.local:3000", "localhost:3000"],
};

export default nextConfig;
