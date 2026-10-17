import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envDirectory = path.resolve(import.meta.dirname, '..')
  const env = loadEnv(mode, envDirectory, '')

  return {
    envDir: envDirectory,
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': env.VITE_API_PROXY_TARGET,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
