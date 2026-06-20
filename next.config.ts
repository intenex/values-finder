import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // RFC 8414 authorization-server discovery. The issuer carries the /api/auth
    // path, so RFC 8414 clients look for metadata at this path-aware location;
    // forward it to where Better Auth actually serves it. (OIDC clients use the
    // issuer-relative /api/auth/.well-known/openid-configuration directly.)
    return [
      {
        source: "/.well-known/oauth-authorization-server/api/auth",
        destination: "/api/auth/.well-known/oauth-authorization-server",
      },
    ];
  },
};

export default nextConfig;
