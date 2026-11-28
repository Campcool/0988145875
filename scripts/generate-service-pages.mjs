import { readFile, writeFile } from 'node:fs/promises';
const services = JSON.parse(await readFile('scripts/service-pages.json', 'utf8'));
const e = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
for (const service of services) {
  const url = `https://0988145875.com.tw/${service.slug}.html`;
  const line = `https://line.me/R/oaMessage/@117adltu/?${encodeURIComponent(`您好，我想詢問${service.name}，我會補上現場照片、服務地區與希望日期，請協助確認範圍與費用。`)}`;
  const booking = `/?service=${encodeURIComponent(service.name)}#booking-form`;
  const pricing = `/#psec-${service.priceTab}`;
  const contact = `<div class="actions"><a class="primary" href="${line}" data-line-context="service_detail">LINE 傳照片詢問</a><a href="tel:0988145875">0988-145-875</a><a class="prepare-link" href="${booking}">先整理需求</a></div>`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', '@id': `${url}#service`, name: service.name, url, description: service.description,
      provider: { '@type': 'LocalBusiness', '@id': 'https://0988145875.com.tw/#business', name: '潔美淨清潔社', url: 'https://0988145875.com.tw/', telephone: '+886988145875' },
      areaServed: ['基隆市', '台北市', '新北市', '桃園市', '宜蘭縣'], termsOfService: service.price },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '潔美淨清潔社', item: 'https://0988145875.com.tw/' }, { '@type': 'ListItem', position: 2, name: service.name, item: url }] },
  ] };
  const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(service.title)}</title><meta name="description" content="${e(service.description)}"><link rel="canonical" href="${url}">
<meta name="campcool-release" content="2026-11-28-jmj-service-journey"><link rel="icon" href="/logo.png"><link rel="stylesheet" href="/service-pages.css?v=20261128">
<meta property="og:type" content="website"><meta property="og:locale" content="zh_TW"><meta property="og:url" content="${url}"><meta property="og:title" content="${e(service.title)}"><meta property="og:description" content="${e(service.description)}"><meta property="og:image" content="https://0988145875.com.tw/${service.image}"><meta property="og:image:alt" content="${e(service.alt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(service.title)}"><meta name="twitter:description" content="${e(service.description)}"><meta name="twitter:image" content="https://0988145875.com.tw/${service.image}">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script><script defer src="/analytics.js"></script><noscript><style>.prepare-link{display:none}</style></noscript></head>
<body><a class="skip" href="#main-content">跳到主要內容</a><header class="site-header"><a href="/"><img src="/logo.png" width="40" height="40" alt="">潔美淨清潔社</a><a href="tel:0988145875">來電詢問</a></header>
<main id="main-content"><nav class="breadcrumbs" aria-label="麵包屑"><a href="/">首頁</a> ／ <span aria-current="page">${service.name}</span></nav>
<nav class="service-switch" aria-label="選擇清潔服務">${services.map(x => `<a href="/${x.slug}.html"${x.slug === service.slug ? ' aria-current="page"' : ''}>${x.name}</a>`).join('')}</nav>
<header class="hero"><div class="hero-copy"><p class="eyebrow">基隆・台北・新北・桃園・宜蘭</p><h1>${service.name}</h1><p>${service.intro}</p><p class="price-lead">${e(service.priceSummary)}</p><p class="price-note">先看參考方式，正式範圍與費用再確認。</p>${contact}</div><figure><img src="/${service.image}" alt="${service.alt}" width="${service.imageWidth}" height="${service.imageHeight}" decoding="async"><figcaption>清潔案場實拍；各屋況與處理範圍不同。</figcaption><a href="/#cases">看更多清潔案例</a></figure></header>
<nav class="page-jumps" aria-label="本頁閱讀導航"><a href="#service-scope">服務範圍</a><a href="#service-price">費用與估價</a><a href="#service-prepare">詢問前準備</a><a href="#service-faq">常見問題</a></nav>
<div class="columns"><div><section id="service-scope"><h2>服務範圍先確認</h2><ul>${service.scope.map(x => `<li>${x}</li>`).join('')}</ul></section><section id="service-price"><h2>費用與估價方式</h2><p>${service.price}</p><p><a href="${pricing}">查看完整收費說明</a> ／ <a href="/calculator.html">清潔費用試算</a></p><a class="price-inquiry" href="${line}" data-line-context="service_detail">詢問${service.name}費用</a><p class="price-note">開啟 LINE 後補照片與需求，確認傳送。</p></section></div><aside><section id="service-prepare"><p class="eyebrow">不用先懂清潔規格</p><h2>詢問前準備資料</h2><ul>${service.prepare.map(x => `<li>${x}</li>`).join('')}</ul><p>費用試算僅供參考，正式清潔細項與總價會在施工前確認。估多少收多少，絕不現場加價。</p><p>不確定坪數或範圍，可以先描述現況；姓名、電話與完整地址可到 LINE 再補充。</p><a class="prepare-link" href="${booking}">先整理${service.name}需求</a></section></aside></div>
<section id="service-faq"><h2>常見問題</h2>${service.faq.map(([q,a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
<section><h2>確認地區與時間，再安排到府</h2><p>服務基隆、台北、新北、桃園與宜蘭。傳送照片、服務行政區與希望日期，先確認是否可安排。開啟 LINE 後，仍需由您確認傳送需求。</p>${contact}</section>
<nav class="related" aria-label="相關清潔服務"><h2>其他清潔需求</h2>${services.filter(x => x.slug !== service.slug).map(x => `<a href="/${x.slug}.html">${x.name}</a>`).join('')}<a href="/keelung.html">基隆清潔</a><a href="/taipei.html">台北清潔</a><a href="/new-taipei.html">新北清潔</a></nav></main>
<footer><p>潔美淨清潔社｜統編 61475587</p><p>基隆市中正區義一路87號8樓之2</p><a href="/#booking-followup">已預約或完工後聯絡</a><a href="/privacy.html">隱私權政策</a><a href="/terms.html">服務條款</a></footer></body></html>
`;
  await writeFile(`${service.slug}.html`, html);
}
console.log(`Generated ${services.length} public service pages`);
