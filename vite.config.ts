import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@lib': resolve(__dirname, './src/lib'),
      '@store': resolve(__dirname, './src/store'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@components': resolve(__dirname, './src/components'),
      '@modules': resolve(__dirname, './src/modules'),
      '@types': resolve(__dirname, './src/types'),
      '@pages': resolve(__dirname, './src/pages'),
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
})
