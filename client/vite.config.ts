import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFile, mkdir, cp } from 'fs/promises'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-assets',
      apply: 'build',
      closeBundle: async () => {
        // 创建目录
        await mkdir('dist/_locales/zh_CN', { recursive: true })
        await mkdir('dist/_locales/en', { recursive: true })
        await mkdir('dist/icons', { recursive: true })

        // 复制文件
        await copyFile('manifest.json', 'dist/manifest.json')
        await copyFile('_locales/zh_CN/messages.json', 'dist/_locales/zh_CN/messages.json')
        await copyFile('_locales/en/messages.json', 'dist/_locales/en/messages.json')

        // 复制图标
        await cp('icons', 'dist/icons', { recursive: true })

        // 复制 content.css 到根目录
        const contentCss = path.resolve(__dirname, 'dist/assets/content-hXzoWJHr.css')
        await copyFile(contentCss, 'dist/content.css')
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'popup.html'),
        index: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background/background.ts'),
        content: path.resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js'
          }
          if (chunkInfo.name === 'content') {
            return 'content.js'
          }
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // CSS 文件放到根目录
          if (assetInfo.name === 'content' && assetInfo.type === 'asset') {
            return '[name].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})
