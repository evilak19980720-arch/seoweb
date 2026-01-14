import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
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
      watch: {},
      proxy: {
        '/api': {
          target: env.VITE_BASE_URL, // 后端接口地址
          changeOrigin: true, // 修改请求头中的 origin 为目标地址
          rewrite: path => path.replace(/^\/api/, '') // 可选：移除请求路径中的 /api 前缀
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
        onwarn(warning, warn) {
          // 抑制动态导入与静态导入冲突的警告
          if (warning.message?.includes('dynamic import will not move module into another chunk')) {
            return
          }
          warn(warning)
        },
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          // 将大型依赖拆分成独立 chunk，提升首屏加载和缓存效率
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Element Plus 单独分包
              if (id.includes('element-plus') || id.includes('@element-plus')) {
                return 'element-plus'
              }
              // 图表库单独分包
              if (id.includes('echarts') || id.includes('zrender')) {
                return 'echarts'
              }
              // 代码编辑器单独分包
              if (id.includes('codemirror') || id.includes('@codemirror')) {
                return 'codemirror'
              }
              // 表单创建器单独分包
              if (id.includes('form-create')) {
                return 'form-create'
              }
              // Vue 核心（精确匹配避免误匹配其他 vue-xxx 包）
              if (id.includes('/vue/') || id.includes('/vue@') ||
                  id.includes('/pinia/') || id.includes('/vue-router/')) {
                return 'vue-core'
              }
              // VueUse 单独分包
              if (id.includes('@vueuse')) {
                return 'vueuse'
              }
              // 其他 Vue 生态
              if (id.includes('vue-')) {
                return 'vue-plugins'
              }
              // TinyMCE 编辑器单独分包
              if (id.includes('tinymce')) {
                return 'tinymce'
              }
              // Highlight.js 代码高亮
              if (id.includes('highlight')) {
                return 'highlight'
              }
              // Lodash 工具库
              if (id.includes('lodash')) {
                return 'lodash'
              }
              // Moment 日期库
              if (id.includes('moment')) {
                return 'moment'
              }
              // 其他第三方库（包含云存储 SDK，避免循环依赖）
              return 'vendor'
            }
          }
        }
      }
    }
  }
})
