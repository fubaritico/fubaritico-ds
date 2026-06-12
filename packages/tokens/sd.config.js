import StyleDictionary from 'style-dictionary'

/**
 * Joins a token path into a strictly kebab-case custom-property name.
 *
 * Splits camelCase humps (`lineHeight` → `line-height`, `letterSpacing` → `letter-spacing`) while
 * leaving numeric segments intact (`2xl`, `3xl`, `0.5` stay verbatim — the built-in `name/kebab`
 * transform would mangle them to `2-xl` / `0-5`, which is why these formats join the path manually).
 * This enforces the kebab-case naming rule for EVERY token, present and future.
 *
 * @param {string[]} path - The token's path segments.
 * @returns {string} The kebab-case custom-property name (without the leading `--`).
 */
const toKebabName = (path) =>
  path
    .map((segment) =>
      segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    )
    .join('-')

/**
 * Custom format for Tailwind CSS v4 @theme directive
 */
StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: ({ dictionary }) => {
    const lines = ['@theme {']

    dictionary.allTokens.forEach((token) => {
      const name = toKebabName(token.path)
      const value = token.$value ?? token.value

      lines.push(`  --${name}: ${value};`)
    })

    lines.push('}')
    lines.push('')

    return lines.join('\n')
  },
})

/**
 * Custom format for CSS custom properties (flat)
 */
StyleDictionary.registerFormat({
  name: 'css/variables-flat',
  format: ({ dictionary, options }) => {
    const selector = options.selector || ':root'
    const lines = [`${selector} {`]

    dictionary.allTokens.forEach((token) => {
      const name = toKebabName(token.path)
      const value = token.$value ?? token.value

      lines.push(`  --${name}: ${value};`)
    })

    lines.push('}')
    lines.push('')

    return lines.join('\n')
  },
})

/**
 * Custom format for TypeScript tokens export
 */
StyleDictionary.registerFormat({
  name: 'typescript/tokens',
  format: ({ dictionary }) => {
    const tokens = {}

    dictionary.allTokens.forEach((token) => {
      let current = tokens
      const path = token.path

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {}
        }
        current = current[path[i]]
      }

      current[path[path.length - 1]] = token.$value ?? token.value
    })

    return `export const tokens = ${JSON.stringify(tokens, null, 2)} as const

export type Tokens = typeof tokens
`
  },
})

export default {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables-flat',
          options: {
            selector: ':root',
          },
        },
      ],
    },
    tailwind: {
      transformGroup: 'css',
      buildPath: 'dist/tailwind/',
      files: [
        {
          destination: 'theme.css',
          format: 'css/tailwind-theme',
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
      ],
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/ts/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'typescript/tokens',
        },
      ],
    },
  },
  usesDtcg: true,
}
