import { defineConfig, loadEnv } from 'vite'
import angular from '@analogjs/vite-plugin-angular'

// Export a factory to access Vite's mode and load .env files
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Allow overriding HMR via environment for reverse-proxy setups.
  // If no env provided, use Vite defaults for local dev.
  const hmrConfig = env.HMR_HOST
    ? {
        host: env.HMR_HOST,
        protocol: env.HMR_PROTOCOL || 'ws',
        clientPort: env.HMR_CLIENT_PORT ? Number(env.HMR_CLIENT_PORT) : undefined,
      }
    : undefined

  return {
    plugins: [angular()],
    build: {
      target: 'es2020',
      // Use index.html as the entry (default) to produce an SPA HTML shell
    },
    server: {
      // Bind to localhost so the dev server is only reachable via Nginx
      host: '127.0.0.1',
      port: 4200,
      strictPort: true,
      allowedHosts: ['localhost', '194.164.92.46', 'ivyarc.pro', 'www.ivyarc.pro'],
      hmr: hmrConfig,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
