/**
 * Configuration ESLint (format « flat config », recommandé depuis ESLint 9).
 * eslint-config-expo apporte les règles React, React Hooks, TypeScript et
 * Expo adaptées au SDK installé. Lancer : `npm run lint`.
 */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
]);
