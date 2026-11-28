import { assert } from './browser-harness.mjs'

export async function checkVisitorJourney(page, base, width, output, browser) {
  const definitions = [
    ['home-cleaning','居家清潔','home','4 小時 $2,500 起'],
    ['post-renovation-cleaning','裝潢後清潔','reno','最低 $6,000 起'],
    ['move-in-out-cleaning','退租入住清潔','other','依坪數、髒污與點交需求估價'],
  ]
  const clearOfHeader = async selector => assert(await page.locator(selector).evaluate(el =>
    el.getBoundingClientRect().top >= document.querySelector('.top-bar').getBoundingClientRect().bottom - 1
  ), `${browser}/${width}/${selector}: fixed header overlap`)

  for (const [slug, service, category, price] of definitions) {
    await page.goto(`${base}/${slug}.html`)
    assert((await page.locator('.price-lead').innerText()).includes(price))
    assert.equal(await page.locator('.service-switch [aria-current="page"]').count(),1)
    assert((await page.locator('.service-switch [aria-current="page"]').innerText()).includes(service))
    assert(await page.locator('.hero').evaluate(el => el.querySelector('.price-lead').getBoundingClientRect().bottom <= el.querySelector('.actions').getBoundingClientRect().top))
    assert(await page.locator('.hero figure img').evaluate(img => img.complete && img.naturalWidth > 0 && getComputedStyle(img).objectFit === 'contain' && Math.abs(Number(img.getAttribute('width')) / Number(img.getAttribute('height')) - img.naturalWidth / img.naturalHeight) < .001))
    for (const target of ['service-scope','service-price','service-prepare','service-faq']) {
      await page.locator(`.page-jumps a[href="#${target}"]`).focus()
      await page.keyboard.press('Enter')
      assert.equal(new URL(page.url()).hash,'#'+target)
      assert(await page.locator('#'+target).isVisible())
    }
    await page.locator('#service-faq summary').first().focus(); await page.keyboard.press('Enter')
    assert.equal(await page.locator('#service-faq details').first().getAttribute('open'),'')
    await page.locator('.hero .prepare-link').click()
    await page.locator('#booking-form-details[open]').waitFor()
    assert.equal(await page.locator('#bk-service').inputValue(),service)
    assert.equal(await page.locator('#bk-name').inputValue(),'')
    assert.equal(await page.locator('#bk-note').inputValue(),'')
    assert.equal(new URL(page.url()).searchParams.has('service'),false,'remove prefill before analytics')
    assert.equal(await page.locator('#bk-confirm').isVisible(),false,'preparing is not sending')
    await clearOfHeader('#booking-form')
    // The full-price link must reveal the matching category on arrival, reload and history.
    await page.goto(`${base}/${slug}.html`)
    await page.getByRole('link',{name:'查看完整收費說明',exact:true}).click()
    await page.locator(`#psec-${category}:not([hidden])`).waitFor()
    assert.equal(new URL(page.url()).hash,'#psec-'+category)
    assert.equal(await page.locator('#ptab-'+category).getAttribute('aria-selected'),'true')
    await clearOfHeader('#psec-'+category)
    await page.reload()
    await page.locator(`#psec-${category}:not([hidden])`).waitFor()
    await clearOfHeader('#psec-'+category)
    await page.goBack(); await page.locator('.service-switch').waitFor()
    await page.goForward(); await page.locator(`#psec-${category}:not([hidden])`).waitFor()
    await page.goto(`${base}/${slug}.html`)
    await page.screenshot({path:`${output}/${browser}-${width}-${slug}-visitor.png`})
  }

  for (const route of ['services','pricing','cases','about']) {
    await page.goto(`${base}/?qa=visitor-${route}#${route}`)
    await page.locator(`#page-${route}.active`).waitFor()
    await clearOfHeader(`#${route} h2`)
  }
  await page.goto(base+'/?qa=followup#booking-followup')
  assert.equal(await page.locator('#booking-followup').getAttribute('open'),'')
  await clearOfHeader('#booking-followup')
  assert.match(await page.locator('#booking-followup').innerText(),/原 LINE 對話/)
  assert.equal(await page.locator('#booking-followup a[data-line-context]').getAttribute('href'),'https://line.me/R/ti/p/@117adltu')

  // Evaluate true viewport widths independently of the manual iframe comparison.
  const widths = width === 375 ? [320,390,840,1280] : [width]
  for (const size of widths) {
    await page.setViewportSize({width:size,height:size === 1280 ? 720 : 844})
    await page.goto(base+'/?qa=cards#home')
    const cards=page.locator('.service-choice-card')
    assert.equal(await cards.count(),3)
    for(let i=0;i<3;i++) {
      const card=cards.nth(i)
      await card.scrollIntoViewIfNeeded()
      await page.waitForFunction(i => document.querySelectorAll('.service-card-photo')[i].naturalWidth > 0,i)
      const facts=await card.evaluate(el=>({
        imageFit:getComputedStyle(el.querySelector('img')).objectFit,
        textSize:parseFloat(getComputedStyle(el.querySelector('.service-card-description')).fontSize),
        buttonHeight:el.querySelector('button').getBoundingClientRect().height,
        clipped:el.querySelector('.service-card-description').scrollHeight > el.querySelector('.service-card-description').clientHeight + 1,
      }))
      assert.equal(facts.imageFit,'contain'); assert(facts.textSize>=16); assert(facts.buttonHeight>=48); assert.equal(facts.clipped,false)
      await card.locator('button').focus()
      assert(await card.locator('button').evaluate(el=>parseFloat(getComputedStyle(el).outlineWidth)>=3))
      if(i===0) {
        await page.keyboard.press('Enter')
        await page.locator('#service-home[aria-expanded="true"]').waitFor()
        await page.goBack(); await page.locator('#page-home.active').waitFor()
      }
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
    const cols=await page.locator('.service-choice-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)
    assert.equal(cols,size>=840?3:1)
    await cards.first().scrollIntoViewIfNeeded()
    await page.screenshot({path:`${output}/${browser}-${size}-visitor-cards-viewport.png`})
  }
  await page.setViewportSize({width,height:900})
  // Rapid navigation with normal motion must not leave a delayed heading focus.
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.goto(base+'/?qa=rapid')
  const nav=page.locator(width>=840?'.desktop-nav':'.bottom-nav')
  await nav.locator('[data-page="services"]').click()
  await page.locator('#service-home .service-actions a[href="#booking-form"]').click()
  await page.locator('#bk-name').pressSequentially('隔離名字')
  await page.waitForTimeout(350)
  assert.equal(await page.locator('#bk-name').inputValue(),'隔離名字')
  assert.equal(await page.evaluate(()=>document.activeElement.id),'bk-name')
  await page.emulateMedia({reducedMotion:'reduce'})

  if(width===375) {
    await page.setViewportSize({width:320,height:844})
    await page.goto(base+'/post-renovation-cleaning.html')
    await page.addStyleTag({content:'html{font-size:200%}'})
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'service page at enlarged font')
    await page.setViewportSize({width,height:900})
    const plainContext=await page.context().browser().newContext({javaScriptEnabled:false,viewport:{width:375,height:844}})
    await plainContext.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort())
    const plain=await plainContext.newPage()
    for(const [slug] of definitions) {
      await plain.goto(`${base}/${slug}.html`)
      assert(await plain.locator('.hero .primary').isVisible())
      assert.equal(await plain.locator('.prepare-link').first().isVisible(),false)
      await plain.locator('#service-faq summary').first().click()
      assert.equal(await plain.locator('#service-faq details').first().getAttribute('open'),'')
      await plain.locator('.page-jumps a[href="#service-price"]').click()
      assert.equal(new URL(plain.url()).hash,'#service-price')
    }
    await plainContext.close()
  }
  console.log(`${browser}/${width}: visitor cards, service context, price routes, header clearance and reading paths passed`)
}
