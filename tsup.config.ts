import { defineConfig } from "tsup"
import { readdirSync } from "node:fs"
import { join } from "node:path"

const components = readdirSync("src/components")
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => `src/components/${file}`)

export default defineConfig({
  entry: ["src/lib/utils.ts", ...components],
  format: ["esm"],
  dts: {
    resolve: true,
    compilerOptions: {
      incremental: false,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "radix-ui",
    "class-variance-authority",
    "lucide-react",
  ],
  esbuildOptions(options) {
    options.alias = {
      "#lib/utils": join(process.cwd(), "src/lib/utils.ts"),
    }
  },
  onSuccess: async () => {
    const { cp } = await import("node:fs/promises")
    await cp("src/styles", "dist/styles", { recursive: true })
    await cp("src/styles/preset.css", "dist/preset.css")
  },
})
