import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // `script/` holds Node build helpers, not shipped source: they run outside the browser lint
  // profile this config describes.
  { ignores: ['dist/**', 'script/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  }
)
