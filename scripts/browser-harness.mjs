import { chromium, firefox, webkit } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import assert from 'node:assert/strict'

export { assert }
export async function run(flow, pages, defaultRoot) {
  const root = resolve(process.env.SITE_ROOT || defaultRoot)
  const server = createServer(async (req, res) => {
    try {
      let file = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname))
      if (!file.startsWith(root + sep) && file !== root) throw new Error('Invalid path')
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html')
      res.setHeader('Content-Type', ({ '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.jpg':'image/jpeg', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml' })[extname(file)] || 'application/octet-stream')
      res.end(await readFile(file))
    } catch { res.writeHead(404); res.end('Not found') }
  })
  await new Promise(done => server.listen(0, '127.0.0.1', done))
  const base = process.env.BASE_URL || `http://127.0.0.1:${server.address().port}`
  const output = resolve(process.env.RESULT_DIR || 'browser-results')
  await mkdir(output, { recursive:true })
  const results = []
  try {
    for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
      if (process.env.BROWSERS && !process.env.BROWSERS.split(',').includes(name)) continue
      const browser = await engine.launch({ headless:true })
      try {
        for (const width of [375, 768, 1440]) {
          const context = await browser.newContext({ viewport:{ width, height:900 }, reducedMotion:'reduce' })
          const page = await context.newPage()
          page.setDefaultTimeout(12000)
          const errors = [], failed = []
          page.on('pageerror', e => errors.push(e.message))
          page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) failed.push(`${r.status()} ${new URL(r.url()).pathname}`) })
          // No analytics, phone calls, LINE messages or real orders are sent.
          await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort())
          await context.addInitScript(() => {
            document.addEventListener('click', e => {
              const a = e.target.closest && e.target.closest('a[href]')
              if (a && /^(https?:|tel:|line:)/.test(a.getAttribute('href')) && !a.href.startsWith(location.origin)) e.preventDefault()
            }, true)
            Object.defineProperty(navigator, 'clipboard', { configurable:true, value:{ writeText:async () => { throw new Error('Clipboard denied by test') } } })
            document.execCommand = () => false
          })
          for (const url of pages) {
            const response = await page.goto(base + url)
            assert.equal(response.status(), 200)
            await page.locator('h1').first().waitFor()
            await page.waitForTimeout(200)
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${width}/${url}: overflow`)
            const invalid = await page.locator('img').evaluateAll(imgs => imgs.filter(i => i.complete && !i.naturalWidth).map(i => i.getAttribute('src')))
            assert.deepEqual(invalid, [], 'Broken loaded images')
            await page.screenshot({ path:resolve(output, `${name}-${width}-${url === '/' ? 'home' : url.replace(/[^a-zA-Z0-9]+/g, '-')}.png`), fullPage:false })
          }
          await flow(page, base, width, output, name)
          assert.deepEqual(errors, [], 'Uncaught browser errors')
          assert.deepEqual(failed, [], 'Failed same-origin resources')
          results.push({ browser:name, version:browser.version(), width, status:'passed', pageErrors:errors, failedResources:failed })
          console.log(`${name} ${width}: passed`)
          await context.close()
        }
      } finally { await browser.close() }
    }
    await writeFile(resolve(output, 'results.json'), JSON.stringify({ base, testedAt:new Date().toISOString(), externalRequests:'blocked', results }, null, 2))
  } finally { server.close() }
}
