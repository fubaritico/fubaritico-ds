import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import svgToJsx from 'svg-to-jsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get the assets directory path
 */
function getAssetsDir() {
  return path.join(__dirname, '../src/assets')
}

/**
 * Read all files from a directory
 */
function readDirectory(dirPath) {
  try {
    return fs.readdirSync(dirPath)
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message)
    process.exit(1)
  }
}

/**
 * Filter files by extension
 */
function filterByExtension(files, extension) {
  return files.filter((file) => file.endsWith(extension))
}

/**
 * Read file content
 */
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
    return null
  }
}

/**
 * Clean SVG content
 */
function cleanSvg(svgContent) {
  let cleaned = svgContent
    // Remove XML declaration
    .replace(/<\?xml[^?]*\?>/g, '')
    // Remove DOCTYPE
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove whitespace/newlines before the first tag
    .replace(/^\s+/, '')
    // Remove unnecessary whitespace between elements
    .replace(/\n\s+/g, '\n')
    .trim()

  // Extract only the SVG element and its content
  const svgMatch = cleaned.match(/<svg[\s\S]*<\/svg>/i)
  if (svgMatch) {
    cleaned = svgMatch[0]
  }

  return cleaned
}

/**
 * Convert SVG to JSX
 */
async function convertSvgToJsx(svgContent) {
  const cleanedSvg = cleanSvg(svgContent)

  try {
    return await svgToJsx(cleanedSvg)
  } catch (error) {
    console.error('Error converting SVG to JSX:', error.message)
    return null
  }
}

/**
 * Convert filename to PascalCase
 */
function toPascalCase(filename) {
  return filename
    .replace(/\.svg$/, '') // Remove .svg extension
    .split(/[-_]/) // Split on dash or underscore
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Create TSX component from JSX
 */
function createTsxComponent(jsxContent, componentName) {
  return `import type { FC } from 'react'

const ${componentName}: FC = () => (
  ${jsxContent}
)

export default ${componentName}
`
}

/**
 * Write component to file in temporary directory
 */
function writeComponentFile(componentName, tsxContent) {
  const tempDir = path.join(__dirname, '../src/.temp-svg')

  // Create src/.temp-svg directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  const filePath = path.join(tempDir, `${componentName}.tsx`)

  try {
    fs.writeFileSync(filePath, tsxContent, 'utf-8')
    console.log(`✅ Created: ${filePath}`)
    return true
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message)
    return false
  }
}

/**
 * Create index.ts file that exports all SVG components in temporary directory
 */
function createIndexFile(componentNames) {
  const tempDir = path.join(__dirname, '../src/.temp-svg')

  const exports = componentNames
    .map((name) => `export { default as ${name} } from './${name}.js'`)
    .join('\n')

  const indexContent = `${exports}\n`

  const indexPath = path.join(tempDir, 'index.ts')

  try {
    fs.writeFileSync(indexPath, indexContent, 'utf-8')
    console.log(`✅ Created: ${indexPath}`)
    return true
  } catch (error) {
    console.error(`Error writing index file ${indexPath}:`, error.message)
    return false
  }
}

/**
 * Generate SVG components with JSX conversion
 */
async function generateSvgComponents(svgs, assetsDir) {
  if (svgs.length === 0) {
    console.warn('No SVG files found')
    return
  }

  console.log(`Found ${svgs.length} SVG file(s):\n`)

  const componentNames = []

  for (const svg of svgs) {
    const filePath = path.join(assetsDir, svg)
    const content = readFileContent(filePath)
    const componentName = toPascalCase(svg)

    console.log(`📄 ${svg} → ${componentName}`)

    if (content) {
      const jsx = await convertSvgToJsx(content)
      if (jsx) {
        const tsxContent = createTsxComponent(jsx, componentName)
        writeComponentFile(componentName, tsxContent)
        componentNames.push(componentName)
      }
    }

    console.log('')
  }

  // Create index.ts file after all components are created
  if (componentNames.length > 0) {
    createIndexFile(componentNames)
  }
}

/**
 * Main function
 */
async function main() {
  const assetsDir = getAssetsDir()
  const files = readDirectory(assetsDir)
  const svgs = filterByExtension(files, '.svg')

  await generateSvgComponents(svgs, assetsDir)
}

try {
  await main()
  console.log('✅ All SVG components generated successfully')
} catch(error) {
  console.error('Error in main function:', error)
}

