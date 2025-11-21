import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',  // 监听所有网络接口
    port: 5173,       // 指定端口
    open: false,      // 不自动打开浏览器
    proxy: {
      // 代理所有 /api 开头的请求
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://115.190.53.97:8081',  // 开发环境后端地址，可通过环境变量配置
        changeOrigin: true,               // 改变请求头中的origin
        rewrite: (path) => path.replace(/^\/api/, '')  // 重写路径，去掉 /api 前缀
      }
    }
  }
})
