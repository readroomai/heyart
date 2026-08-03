import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // The server-only guard throws outside a React server context; unit
      // tests import these modules directly.
      'server-only': resolve(__dirname, './tests/stubs/server-only.ts'),
    },
  },
})
