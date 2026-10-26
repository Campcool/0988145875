import assert from 'node:assert/strict'

const state = page => page.locator('#bk-next-note').getAttribute('data-state')
const waitState = (page, value) => page.waitForFunction(value => document.getElementById('bk-next-note').dataset.state === value, value)
const contrast = (page, selector) => page.locator(selector).evaluate(el => {
  const css = getComputedStyle(el)
  const luminance = color => {
    const rgb = color.match(/[\d.]+/g).slice(0,3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]
  }
  const a = luminance(css.color), b = luminance(css.backgroundColor)
  return (Math.max(a,b) + .05) / (Math.min(a,b) + .05)
})
const deferredClipboard = page => page.evaluate(() => {
  window.__p03Copies = []
  navigator.clipboard.writeText = text => new Promise((resolve,reject) => window.__p03Copies.push({text,resolve,reject}))
})

export async function checkP03(page, base, width, output, browser) {
  let scenario = 0
  const openForm = async () => {
    // A same-URL goto is a hash navigation and retains the previous preview.
    // Distinct public fixture queries ensure a fresh document for each scenario.
    await page.goto(base + '/?p03-check=' + (++scenario) + '#booking-form')
    await page.locator('#booking-form').waitFor()
  }
  const sizes = [{width,height:900}]
  if (width === 375) sizes.push({width:320,height:900}, {width:390,height:844})
  if (width === 1440) sizes.push({width:1280,height:720})
  for (const size of sizes) {
    await page.setViewportSize(size)
    await openForm()
    const note = page.locator('#bk-next-note'), copy = page.locator('#bk-copy-btn')
    const fixture = '隔離P03長文字 ' + '浴室水垢與廚房油污先詢問，未知坪數稍後補充。'.repeat(12) + 'X'.repeat(160)
    await page.locator('#bk-note').fill(fixture)
    await page.locator('.bk-submit').focus()
    assert(await page.locator('.bk-submit').evaluate(el => getComputedStyle(el).outlineWidth === '3px'))
    await page.keyboard.press('Enter')
    assert.equal(await state(page), 'ready')
    assert.equal(await page.locator('#bk-phone').inputValue(), '')
    assert.equal(await page.locator('#bk-name').inputValue(), '')
    for (const selector of ['#bk-copy-btn','.bk-line-btn','.bk-call-btn']) {
      const el = page.locator(selector)
      assert((await el.boundingBox()).height >= 48, `${browser}/${size.width}: ${selector} touch height`)
      await el.focus()
      assert(await el.evaluate(el => getComputedStyle(el).outlineWidth === '3px'), 'Visible keyboard focus')
    }
    assert(await contrast(page, '#bk-next-note') >= 4.5, 'Ready note text contrast')
    assert(await contrast(page, '#bk-copy-btn') >= 4.5, 'Copy button contrast')
    // Keyboard :active differs across engines. Verify pointer feedback with a
    // real pointer hold; exercise Space activation separately in the retry flow.
    await deferredClipboard(page)
    await copy.scrollIntoViewIfNeeded()
    const bounds = await copy.boundingBox()
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await page.mouse.down()
    assert(await copy.evaluate(el => el.matches(':active')), 'Native pointer pressed state')
    assert(await copy.evaluate(el => getComputedStyle(el).backgroundColor === getComputedStyle(document.documentElement).getPropertyValue('--warm').trim() || getComputedStyle(el).backgroundColor === 'rgb(239, 237, 228)'))
    await page.mouse.up()
    await waitState(page, 'pending')
    assert(await copy.isDisabled())
    assert.equal(await copy.getAttribute('aria-busy'), 'true')
    assert.match(await note.textContent(), /尚未送出/)
    await page.evaluate(() => { copyBookingMsg() })
    assert.equal(await page.evaluate(() => window.__p03Copies.length), 1, 'Repeat activation must not recopy while pending')
    await page.screenshot({path:`${output}/${browser}-${size.width}-p03-copy-pending.png`})
    await page.evaluate(() => window.__p03Copies[0].resolve())
    await waitState(page, 'copied')
    assert.equal(await copy.isDisabled(), false)
    assert.equal(await copy.getAttribute('aria-busy'), 'false')
    assert.match(await copy.textContent(), /已複製/)
    assert.match(await note.textContent(), /尚未送出/)
    assert.equal(await page.evaluate(() => document.activeElement.id), 'bk-copy-btn')
    assert(await contrast(page, '#bk-next-note') >= 4.5, 'Copied note contrast')
    await page.screenshot({path:`${output}/${browser}-${size.width}-p03-copy-success.png`})
    // Refused Clipboard and refused legacy copy expose selectable text and retry.
    await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Isolated denied clipboard') }; document.execCommand = () => false })
    await copy.focus()
    await page.keyboard.press('Space')
    await waitState(page, 'manual')
    assert.match(await copy.textContent(), /重試/)
    assert.equal(await copy.isDisabled(), false)
    assert.equal(await page.evaluate(() => document.activeElement.id), 'bk-msg-text')
    assert((await page.evaluate(() => getSelection().toString())).includes(fixture))
    assert(await contrast(page, '#bk-next-note') >= 4.5, 'Manual note contrast')
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Long text must not overflow page')
    await page.screenshot({path:`${output}/${browser}-${size.width}-p03-copy-manual.png`})
    // The existing legacy fallback still reports success only on an actual true result.
    await page.evaluate(() => { document.execCommand = () => true })
    await copy.click()
    await waitState(page, 'copied')
    assert.equal(await page.evaluate(() => document.activeElement.id), 'bk-copy-btn')
    await page.evaluate(() => { navigator.clipboard.writeText = async text => { window.__p03LastCopied = text } })
    await copy.click()
    await waitState(page, 'copied')
    assert((await page.evaluate(() => window.__p03LastCopied)).includes(fixture))
    const log = await page.evaluate(() => Array.from(window.dataLayer || []).filter(x => x[0] === 'event').map(x => ({name:x[1],params:x[2]})))
    assert.equal(log.filter(x => x.name === 'quote_prepared').length, 1)
    assert.equal(log.filter(x => /line_click|conversion|generate_lead|booking_form_submit/.test(x.name)).length, 0)
    assert(!JSON.stringify(log).includes('隔離P03'))
    assert(!(await page.locator('a[href]').evaluateAll(els => els.map(el => el.href).join('\n'))).includes('隔離P03'))
    console.log(`${browser} P03 ${size.width}x${size.height}: clipboard states, focus, contrast, long text passed`)
  }
  await page.setViewportSize({width,height:900})
  // Both a late success and late rejection must leave a newer pending copy intact.
  for (const outcome of ['resolve','reject']) {
    await openForm()
    await page.locator('#bk-note').fill('隔離P03第一版')
    await page.locator('.bk-submit').click()
    await deferredClipboard(page)
    await page.locator('#bk-copy-btn').click()
    await waitState(page, 'pending')
    await page.getByText('重新填寫', {exact:true}).click()
    assert.equal(await page.locator('#bk-note').inputValue(), '隔離P03第一版')
    await page.locator('#bk-note').fill('隔離P03第二版')
    await page.locator('.bk-submit').click()
    assert.equal(await state(page), 'ready')
    assert.equal(await page.locator('#bk-copy-btn').isDisabled(), false)
    await page.locator('#bk-copy-btn').click()
    await waitState(page, 'pending')
    // Keep the user at a different action while an old operation settles.
    await page.locator('.bk-line-btn').focus()
    await page.evaluate(outcome => window.__p03Copies[0][outcome](), outcome)
    await page.evaluate(() => Promise.resolve())
    assert.equal(await state(page), 'pending')
    assert.equal(await page.locator('#bk-copy-btn').getAttribute('aria-busy'), 'true')
    assert.equal(await page.evaluate(() => document.activeElement.className), 'bk-line-btn')
    assert.match(await page.locator('#bk-msg-text').textContent(), /第二版/)
    await page.evaluate(() => window.__p03Copies[1].resolve())
    await waitState(page, 'copied')
    assert((await page.evaluate(() => window.__p03Copies[1].text)).includes('第二版'))
    assert.equal(await page.evaluate(() => document.activeElement.className), 'bk-line-btn', 'Current success also preserves a moved focus')
  }
  // A late result while editing cannot take focus or show stale confirmation.
  await openForm()
  await page.locator('#bk-note').fill('隔離P03編輯保留')
  await page.locator('.bk-submit').click()
  await deferredClipboard(page)
  await page.locator('#bk-copy-btn').click()
  await page.getByText('重新填寫', {exact:true}).click()
  await page.locator('#bk-note').fill('隔離P03正在修改')
  await page.evaluate(() => window.__p03Copies[0].resolve())
  await page.evaluate(() => Promise.resolve())
  assert.equal(await page.locator('#bk-confirm').isVisible(), false)
  assert.equal(await page.evaluate(() => document.activeElement.id), 'bk-note')
  assert.equal(await page.locator('#bk-note').inputValue(), '隔離P03正在修改')
  console.log(`${browser} P03 ${width}: stale success/rejection and edit focus passed`)
}
