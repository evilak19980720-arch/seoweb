import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
const rootPath = resolve(__dirname)
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    resolve: {
      alias: {
        '@': resolve(rootPath, './src')
      }
    },
    plugins: [
      vue({
        script: {
          defineModel: true
        }
      }),
      vueJsx(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core']
        // resolvers: [ ElementPlusResolver({importStyle: 'sass'}) ]
      }),
      Components({
        dirs: ['src/components/', 'src/layout/'],
        extensions: ['vue'],
        // directoryAsNamespace: true,
        deep: true,
        dts: true,
        include: [/\.vue$/, /\.vue\?vue/],
        exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/, 'src/components/catchForm/']
        // resolvers: [ ElementPlusResolver({ importStyle: 'sass'}) ]
      }),
      Icons({
        compiler: 'vue3',
        autoInstall: true
      })
    ],
    publicDir: './public',
    define: {
      BASE_URL: env.BASE_URL
    },
    // 确保 element-plus 被完整预构建，供 remote-sfc 运行时动态导入使用
    optimizeDeps: {
      include: ['element-plus']
    },
    server: {
      hmr: true,
      host: '127.0.0.1',
      port: 10086,
      open: true, // 自动打开浏览器
      cors: true, // 允许跨域
      strictPort: true, // 端口占用直接退出
      // watch: {},
      proxy: {
        '/api': {
          target: env.VITE_BASE_URL, // 后端接口地址
          changeOrigin: true, // 修改请求头中的 origin 为目标地址
          rewrite: (path) => path.replace(/^\/api/, '') // 可选：移除请求路径中的 /api 前缀
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 2000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          pure_funcs: ['console.log', 'console.info'],
          drop_debugger: true
        }
      },
      outDir: '../public/admin',
      assetsDir: 'assets',
      rollupOptions: {
        input: './index.html',
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus'],
            'echarts': ['echarts', 'vue-echarts'],
            'form-create': ['@form-create/element-ui'],
            'editor': ['@tinymce/tinymce-vue', 'codemirror'],
            'utils': ['@vueuse/core', 'moment', 'axios']
          }
        }
      }
    }
  }
})
