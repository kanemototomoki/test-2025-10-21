import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
