import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const pkgPath = join(root, "package.json")
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))

const components = readdirSync(join(root, "src/components")).filter((file) =>
  file.endsWith(".tsx")
)

const entries = []

for (const file of components) {
  const name = file.replace(/\.tsx$/, "")
  const target = {
    types: `./dist/components/${name}.d.ts`,
    import: `./dist/components/${name}.js`,
    default: `./dist/components/${name}.js`,
  }

  entries.push([`./components/${name}`, target])
  entries.push([`./${name}`, target])
}

pkg.exports = {
  "./styles.css": "./dist/styles.css",
  "./globals.css": "./dist/styles.css",
  "./styles/globals.css": "./dist/styles.css",
  "./preset.css": "./dist/preset.css",
  "./styles/*": "./dist/styles/*",
  ...Object.fromEntries(entries),
  "./lib/*": {
    types: "./dist/lib/*.d.ts",
    import: "./dist/lib/*.js",
  },
  "./hooks/*": {
    types: "./dist/hooks/*.d.ts",
    import: "./dist/hooks/*.js",
  },
}

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
