import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("index.html", "dist/index.html");
await cp("src", "dist/src", { recursive: true });
await build({ entryPoints: ["src/auth-callback.js"], bundle: true, platform: "browser", format: "esm", outfile: "dist/auth-callback.js" });
