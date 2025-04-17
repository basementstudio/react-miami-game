import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PeerjsReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['react', 'peerjs', 'eventemitter3'],
      output: {
        globals: {
          react: 'React',
          peerjs: 'Peer',
          eventemitter3: 'EventEmitter'
        }
      }
    },
    sourcemap: true,
    minify: false
  }
}); 