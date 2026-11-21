import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Writes data/months/index.json (the list of months that have a board) so the
// student board can open the newest month and only step between real months.
const monthIndex = () => {
  const dir = path.resolve(__dirname, 'public/data/months')
  const list = () =>
    fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).map((f) => f.slice(0, 7)).sort()
      : []
  return {
    name: 'month-index',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split('?')[0].endsWith('/data/months/index.json')) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(list()))
        } else next()
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'data/months/index.json', source: JSON.stringify(list()) })
    }
  }
}

// When built for GitHub Pages, add <base href> so relative data/asset paths work from any page
// (e.g. /digitalenglishboard/editor/), and give the editor its own page.
const pagesExtras = () => {
  const base = process.env.VITE_BASE_URL
  return {
    name: 'pages-extras',
    transformIndexHtml(html) {
      return base ? html.replace('<head>', `<head>\n    <base href="${base}">`) : html
    },
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const index = path.join(dist, 'index.html')
      if (!fs.existsSync(index)) return
      fs.mkdirSync(path.join(dist, 'editor'), { recursive: true })
      fs.copyFileSync(index, path.join(dist, 'editor', 'index.html'))
      fs.copyFileSync(index, path.join(dist, '404.html'))
      fs.writeFileSync(path.join(dist, '.nojekyll'), '')
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), monthIndex(), pagesExtras()],
  base: process.env.VITE_BASE_URL || './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-libs': ['framer-motion', 'react-rnd', 'react-draggable'],
          'utils': ['date-fns', 'lucide-react'],
          'editor-tools': ['jszip']
        }
      }
    }
  }
})
