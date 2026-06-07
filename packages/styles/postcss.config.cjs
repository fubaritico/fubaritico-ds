/**
 * PostCSS pipeline for the portable native skin.
 * - postcss-import: inline the per-component partials referenced by the barrel
 * - postcss-nested: unwrap nested selectors (BEM `&` modifiers authored nested)
 * - autoprefixer: vendor prefixes
 * - postcss-minify: ship a compact bundle
 */
module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('autoprefixer'),
    require('postcss-minify'),
  ],
}
