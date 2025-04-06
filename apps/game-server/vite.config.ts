import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve('./src/index.ts'),
      name: 'GameServer',
      fileName: 'game-server'
    },
    outDir: 'dist',
    sourcemap: true
  }
}) 