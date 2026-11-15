import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

// netlify.toml's response headers, read rather than copied so `vite preview`
// (and the CSP e2e that runs against it) serves the production CSP. Only the
// first [[headers]] block (`/*`) is read; a path-specific one would apply to all.
function netlifyHeaders(): Record<string, string> {
  const toml = readFileSync(new URL("netlify.toml", import.meta.url), "utf8");
  const values = (toml.split("[headers.values]")[1] ?? "").split(/^\s*\[/m)[0];
  const headers = Object.fromEntries(
    [...values.matchAll(/^\s*([\w-]+) = "(.*)"$/gm)].map((m) => [m[1], m[2]]),
  );
  if (!headers["Content-Security-Policy"]) {
    throw new Error("No Content-Security-Policy found in netlify.toml");
  }
  return headers;
}

export default defineConfig({
  base: "./",
  server: {
    port: 3040,
  },
  // Not the dev server: Vite's HMR client injects inline scripts the CSP blocks.
  preview: {
    port: 3041,
    strictPort: true,
    headers: netlifyHeaders(),
  },
});
