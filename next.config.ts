import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * Keep these out of the bundled server chunk and require them from
   * node_modules at runtime instead.
   *
   * firebase-admin pulls in google-gax, protobufjs and grpc, which resolve
   * parts of themselves with computed require() calls. Bundling defeats that:
   * it works locally, where the real node_modules is still on disk, and
   * throws on Vercel, where only traced files ship — so the route module
   * failed to import and every request came back as Vercel's HTML 500 page
   * rather than this route's JSON.
   *
   * nodemailer is loaded with a dynamic import() and the tracer missed it
   * completely — 0 files in route.js.nft.json — so sending would have failed
   * even once the import crash was fixed.
   */
  serverExternalPackages: ["firebase-admin", "nodemailer"],
};

export default nextConfig;
