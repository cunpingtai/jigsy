import type { NextConfig } from "next";

import downloadStaticResource from "./download-static-resource.mjs";
import { RemotePattern } from "next/dist/shared/lib/image-config";
// 去除域名的协议
const removeProtocol = (url?: string) => {
  if (url) {
    try {
      const newUrl = new URL(url);
      return newUrl.hostname;
    } catch {}
  }
  return;
};

export default async function start() {
  await downloadStaticResource().catch(() => {});
  const hostname = removeProtocol(process.env.NEXT_PUBLIC_STATIC_DOMAIN);
  let hostnames: RemotePattern[] = [
    {
      protocol: "https",
      hostname: "placehold.co",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    {
      protocol: "https",
      hostname: "cdn.mos.cms.futurecdn.net",
    },
    {
      protocol: "https",
      hostname: "picsum.photos",
    },
    {
      protocol: "https",
      hostname: "jigsy.xianyuye.com",
    },
  ];

  if (hostname) {
    hostnames = hostnames.concat({ protocol: "https", hostname });
  }

  const nextConfig: NextConfig = {
    reactStrictMode: false,
    /* config options here */
    async redirects() {
      return [
        {
          source: "/",
          destination: "/en/explore",
          permanent: false,
        },
      ];
    },
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "Content-Security-Policy",
              value: "frame-ancestors 'none'",
            },
          ],
        },
      ];
    },
    images: {
      dangerouslyAllowSVG: true,

      remotePatterns: hostnames,
    },
    compress: true,
    productionBrowserSourceMaps: false,
    trailingSlash: false,
  };

  return nextConfig;
}
