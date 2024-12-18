import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');

  // Validate required environment variables
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID',
  ];

  const missingVars = requiredEnvVars.filter(varName => !env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }

  return {
    plugins: [react(), tsconfigPaths()],
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        'framer-motion'
      ],
    },
    server: {
      port: 3000,
      host: 'localhost',
      open: true,
      cors: true,
      warmup: {
        clientFiles: ['./src/main.tsx'],
      },
      hmr: {
        overlay: false,
      },
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
    },
    build: {
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
      ...requiredEnvVars.reduce((acc, varName) => {
        acc[`import.meta.env.${varName}`] = JSON.stringify(env[varName] || '');
        return acc;
      }, {}),
    },
    esbuild: {
      // TypeScript support
      tsconfigRaw: {
        compilerOptions: {
          target: 'es2020',
          module: 'esnext',
          moduleResolution: 'node',
        },
      },
    },
  };
});
