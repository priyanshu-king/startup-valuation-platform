import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, 'VITE_')
  const apiProxyTarget = process.env.VITE_API_PROXY_TARGET
    || env.VITE_API_PROXY_TARGET
    || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],

    resolve: {
      alias: {
        // '@/' maps to 'src/' — clean absolute imports
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 5173,
      // Proxy /api calls to FastAPI backend during development
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          configure(proxy) {
            proxy.on('error', (_error, _request, response) => {
              if (!response || response.headersSent || response.writableEnded || !('req' in response)) return
              response.writeHead(502, { 'Content-Type': 'application/json' })
              response.end(JSON.stringify({ detail: 'The configured backend is unavailable.' }))
            })
          },
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          // manualChunks must be a function in Rollup v4
          manualChunks(id) {
            if (id.includes('node_modules/three/')) {
              return 'three'
            }
            if (id.includes('node_modules/@react-three/fiber/')) {
              return 'three-renderer'
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react'
            }
            if (id.includes('node_modules/react-router-dom')) {
              return 'router'
            }
            if (id.includes('node_modules/recharts')) {
              return 'charts'
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'motion'
            }
          },
        },
      },
    },
  }
})
