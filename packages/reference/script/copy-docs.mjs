/**
 * Copies each component's co-located README into the built package.
 *
 * The docs live next to the source (`src/components/<Name>/README.md`), but `files: ["dist"]` means
 * only `dist` is published — so without this step a consumer, human or AI, installs the components
 * with none of their usage documentation. Components that are not built (Carousel, next/, anything
 * parked) are skipped, so the package never documents something it does not ship.
 */
import { cp, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'src/components'
const OUT = 'dist/components'

const entries = await readdir(SRC)
let copied = 0

for (const name of entries) {
  const readme = join(SRC, name, 'README.md')
  const target = join(OUT, name)

  // Only document what was actually emitted.
  if (!existsSync(readme) || !existsSync(target)) continue

  const info = await stat(join(SRC, name))
  if (!info.isDirectory()) continue

  await cp(readme, join(target, 'README.md'))
  copied += 1
}

console.warn(`[reference] copied ${String(copied)} component READMEs into dist`)
