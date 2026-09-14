import esbuild from "esbuild";
import { spawn } from "node:child_process";

// 1. Bundle tests using esbuild with Obsidian API mocked
await esbuild.build({
  entryPoints: [
    "tests/tokenUtils.test.ts",
    "tests/noteManager.test.ts",
  ],
  bundle: true,
  outdir: "dist-test",
  platform: "node",
  format: "esm",
  target: "es2022",
  alias: {
    "obsidian": "./tests/mocks/obsidian.ts",
  },
  outExtension: {
    ".js": ".mjs",
  },
  sourcemap: "inline",
});

console.log("Tests compiled successfully into dist-test/.");

// 2. Execute tests using Node's native test runner
const child = spawn(
  process.execPath,
  ["--test", "dist-test/tokenUtils.test.mjs", "dist-test/noteManager.test.mjs"],
  { stdio: "inherit" }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
