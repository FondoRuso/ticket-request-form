import { readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { lookup } from 'node:dns/promises'
import puppeteer from 'puppeteer'

const DIST_DIR = join(import.meta.dirname, 'dist/spa')
const PORT = 4173

// Simple static file server for the built SPA
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }

  const server = createServer(async (req, res) => {
    let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url)

    try {
      const data = await readFile(filePath)
      const ext = filePath.slice(filePath.lastIndexOf('.'))
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
      res.end(data)
    } catch {
      // SPA fallback
      const html = await readFile(join(DIST_DIR, 'index.html'))
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    }
  })

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server))
  })
}

async function prerender() {
  console.log('Starting prerender...')

  const server = await startServer()
  console.log(`Static server running on port ${PORT}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: process.getuid?.() === 0 || process.env.CI ? ['--no-sandbox'] : [],
  })
  const page = await browser.newPage()

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' })

  // Remove any scripts that re-fetch data or cause hydration flicker
  // Keep all scripts — Vue will hydrate over the prerendered HTML
  const html = await page.content()

  await browser.close()
  server.close()

  // Write prerendered HTML
  const indexPath = join(DIST_DIR, 'index.html')
  await writeFile(indexPath, html, 'utf-8')

  console.log('Prerender complete! dist/spa/index.html now contains prerendered HTML.')
}

prerender().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
