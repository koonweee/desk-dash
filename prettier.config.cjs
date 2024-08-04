/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cn'],
  printWidth: 120,
  arrowParens: 'always',
  trailingComma: 'all',
  singleQuote: true,
  semi: true,
}

module.exports = config
