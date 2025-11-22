import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000, // Увеличиваем лимит до 1000kb, чтобы убрать предупреждения
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'http-vendor': ['axios']
        }
      }
    }
  }
})
