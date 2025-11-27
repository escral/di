import { defineConfig } from 'vitest/config'
import * as path from 'node:path'

export default defineConfig({
    resolve: {
        extensions: ['.ts'],
        alias: {
            '~': path.resolve(__dirname, './src'),
            '~tests': path.resolve(__dirname, './tests'),
        },
    },
})
