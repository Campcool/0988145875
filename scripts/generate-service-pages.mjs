import { readFile, writeFile } from 'node:fs/promises';
const services = JSON.parse(await readFile('scripts/service-pages.json', 'utf8'));
const e = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
for (const service of services) {
  const url = `https://0988145875.com.tw/${service.slug}.html`;
  const line = `https://line.me/R/oaMessage/@117adltu/?${encodeURIComponent(`您好，我想詢問${service.name}，我會補上現場照片、服務地區與希望日期，請協助確認範圍與費用。`)}`;
  const contact = `<div class="actions"><a class="primary" href="${line}" data-line-context="service_detail">LINE 傳照片詢問</a><a href="tel:0988145875">0988-145-875</a><a href="/#booking-form">先整理需求</a></div>`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', '@id': `${url}#service`, name: service.name, url, description: service.description,
      provider: { '@type': 'LocalBusiness', '@id': 'https://0988145875.com.tw/#business', name: '潔美淨清潔社', url: 'https://0988145875.com.tw/', telephone: '+886988145875' },
      areaServed: ['基隆市', '台北市', '新北市', '桃園市', '宜蘭縣'], termsOfService: service.price },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '潔美淨清潔社', item: 'https://0988145875.com.tw/' }, { '@type': 'ListItem', position: 2, name: service.name, item: url }] },
  ] };
  const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(service.title)}</title><meta name="description" content="${e(service.description)}"><link rel="canonical" href="${url}">
<link rel="icon" href="/logo.png"><link rel="stylesheet" href="/service-pages.css">
<meta property="og:type" content="website"><meta property="og:locale" content="zh_TW"><meta property="og:url" content="${url}"><meta property="og:title" content="${e(service.title)}"><meta property="og:description" content="${e(service.description)}"><meta property="og:image" content="https://0988145875.com.tw/${service.image}"><meta property="og:image:alt" content="${e(service.alt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(service.title)}"><meta name="twitter:description" content="${e(service.description)}"><meta name="twitter:image" content="https://0988145875.com.tw/${service.image}">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script><script defer src="/analytics.js"></script></head>
<body><a class="skip" href="#main-content">跳到主要內容</a><header class="site-header"><a href="/"><img src="/logo.png" width="40" height="40" alt="">潔美淨清潔社</a><a href="tel:0988145875">來電詢問</a></header>
<main id="main-content"><nav aria-label="麵包屑"><a href="/">首頁</a> ／ <span aria-current="page">${service.name}</span></nav>
<header class="hero"><p>基隆・台北・新北・桃園・宜蘭</p><h1>${service.name}</h1><p>${service.intro}</p>${contact}</header>
<div class="columns"><div><section><h2>服務範圍先確認</h2><ul>${service.scope.map(x => `<li>${x}</li>`).join('')}</ul></section><section><h2>費用與估價方式</h2><p>${service.price}</p><p><a href="/#pricing">查看完整收費說明</a> ／ <a href="/calculator.html">清潔費用試算</a></p></section><section><h2>詢問前準備資料</h2><ul>${service.prepare.map(x => `<li>${x}</li>`).join('')}</ul><p>費用試算僅供參考，正式清潔細項與總價會在施工前確認。估多少收多少，絕不現場加價。</p></section></div><figure><img src="/${service.image}" alt="${service.alt}" width="1280" height="960"><figcaption>清潔案場實拍；各屋況與處理範圍不同。</figcaption><a href="/#cases">看更多清潔案例</a></figure></div>
<section><h2>常見問題</h2>${service.faq.map(([q,a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
<section><h2>確認地區與時間，再安排到府</h2><p>服務基隆、台北、新北、桃園與宜蘭。傳送照片、服務行政區與希望日期，先確認是否可安排。開啟 LINE 後，仍需由您確認傳送需求。</p>${contact}</section>
<nav class="related" aria-label="相關清潔服務"><h2>其他清潔需求</h2>${services.filter(x => x.slug !== service.slug).map(x => `<a href="/${x.slug}.html">${x.name}</a>`).join('')}<a href="/keelung.html">基隆清潔</a><a href="/taipei.html">台北清潔</a><a href="/new-taipei.html">新北清潔</a></nav></main>
<footer><p>潔美淨清潔社｜統編 61475587</p><p>基隆市中正區義一路87號8樓之2</p><a href="/privacy.html">隱私權政策</a> ／ <a href="/terms.html">服務條款</a></footer></body></html>
`;
  await writeFile(`${service.slug}.html`, html);
}
console.log(`Generated ${services.length} public service pages`);
