/**
 * Azure Production Build Script — SniperSheet
 * Builds the React frontend and the Express backend,
 * then copies the frontend output alongside the server bundle
 * so Express can serve it as static files.
 *
 * Run: node scripts/build-azure.mjs
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT   = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ADDIN  = path.join(ROOT, "artifacts", "excel-addin");
const SERVER = path.join(ROOT, "artifacts", "api-server");

function run(cmd, cwd = ROOT) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

console.log("=== SniperSheet Azure Build ===\n");

// 1. Install all workspace dependencies
run("pnpm install --frozen-lockfile");

// 2. Build the api-client-react shared library (declarations needed by both)
run("pnpm exec tsc --build", path.join(ROOT, "lib", "api-client-react"));

// 3. Build the React frontend (Excel Add-in)
run("pnpm run build", ADDIN);
const frontendDist = path.join(ADDIN, "dist", "public");

// 4. Copy frontend build into the API server output directory
//    Express will serve from: artifacts/api-server/dist/addon-public
const addonPublic = path.join(SERVER, "dist", "addon-public");
if (fs.existsSync(addonPublic)) {
  fs.rmSync(addonPublic, { recursive: true });
}
fs.cpSync(frontendDist, addonPublic, { recursive: true });
console.log(`\nFrontend copied to ${addonPublic}`);

// 5. Build the Express backend (TypeScript → ESM)
run("node ./build.mjs", SERVER);

console.log("\n=== Build complete — ready for Azure deployment ===");
console.log("Startup command: node artifacts/api-server/dist/index.mjs");
