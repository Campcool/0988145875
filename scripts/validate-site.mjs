// 潔美淨全站驗證腳本（AI-README 修改守則的自動化版本）
// 檢查項：canonical 絕對路徑、內嵌 JS 語法、JSON-LD 有效性、sitemap 完整性、
// 個資保護防回歸（LINE 承接模式不可逆轉）、品牌承諾文字、服務區事實。
// 使用：node scripts/validate-site.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);
const errors = [];
const warnings = [];

// ── 斷言撰寫規則 ─────────────────────────────────────────────
// 每一項檢查都必須用 scanned() 回報它「實際」掃了什麼、掃了幾個，
// 不得只說「已驗證」。原本的結尾摘要列了 7 個涵蓋領域卻只給一個分母
// （HTML 檔數），讀起來像全都掃過同樣廣度，但其中「品牌承諾」只讀
// index.html 一個檔、「GA4 不送個資」只讀 analytics.js 一個檔。
//
// 這條規則來自 2026-08-16 的三次漏判（詳見 leakdoctor 的同名腳本檔頭）：
// 斷言宣稱「全域」但實際只讀單一檔案，因為分母沒印出來，寫的人與看的人
// 都沒發現。把分母印出來，範圍不符當場就會看出來。
const checks = [];
const scanned = (what, detail) => checks.push('  · ' + what + '：' + detail);
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let jsonLdBlocks = 0;
let inlineJsBlocks = 0;
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const html = fs.readFileSync(file, 'utf8');
  // 所有頁面必須有絕對 canonical，指向正式網域
  if (!/<link\s+rel=["']canonical["'][^>]+href=["']https:\/\/0988145875\.com\.tw\//i.test(html)) {
    errors.push(relative + ': missing absolute canonical to 0988145875.com.tw');
  }
  let match;
  while ((match = scriptRe.exec(html))) {
    const attrs = match[1];
    const body = match[2].trim();
    if (!body || /\bsrc\s*=/.test(attrs)) continue;
    if (/application\/ld\+json/i.test(attrs)) {
      jsonLdBlocks++;
      try { JSON.parse(body); }
      catch (error) { errors.push(relative + ': invalid JSON-LD: ' + error.message); }
      continue;
    }
    inlineJsBlocks++;
    try { new Function(body); }
    catch (error) { errors.push(relative + ': invalid inline JavaScript: ' + error.message); }
  }
}
scanned('canonical', htmlFiles.length + ' 個 HTML 各需絕對 canonical 指向 0988145875.com.tw');
scanned('JSON-LD 有效性', jsonLdBlocks + ' 個 ld+json 區塊解析');
scanned('內嵌 JS 語法', inlineJsBlocks + ' 個 inline script 區塊（有 src 的外部檔不計）');
// sitemap.xml 必須涵蓋全部公開 HTML 頁面與 llms.txt
// index.html 對應根路徑（/）；noindex 轉跳頁（hsinchu.html） intentionally excluded
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'hsinchu.html') {
    // 轉跳頁必須維持 noindex 且不出現在 sitemap
    const html = fs.readFileSync(file, 'utf8');
    if (!/noindex/i.test(html)) errors.push(relative + ': redirect page lost its noindex directive');
    if (sitemap.includes(relative)) errors.push('sitemap.xml must exclude redirect page: ' + relative);
    continue;
  }
  const pathInSitemap = relative === 'index.html' ? 'https://0988145875.com.tw/' : 'https://0988145875.com.tw/' + relative;
  if (!sitemap.includes(pathInSitemap)) errors.push('sitemap.xml missing: ' + pathInSitemap);
}
for (const name of ['llms.txt']) {
  if (!sitemap.includes(name)) errors.push('sitemap.xml missing: ' + name);
}
scanned('sitemap 對應', htmlFiles.length + ' 個 HTML ↔ ' + (sitemap.match(/<loc>/g) || []).length + ' 個 <loc>，轉跳頁 hsinchu.html 另驗 noindex 且不得入 sitemap');
// 個資保護防回歸：詢價流程必須維持「本機整理＋LINE 送出」，不得出現後端收件
let localOnlyScanned = 0;
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'privacy.html' || relative === 'terms.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  localOnlyScanned++;
  for (const forbidden of [
    'action="https://',
    'XMLHttpRequest',
    'navigator.sendBeacon',
  ]) {
    if (html.includes(forbidden)) {
      errors.push(relative + ': inquiry form posts to a backend: ' + forbidden + ' — must stay local-only with LINE handoff');
    }
  }
  // fetch 只允許讀取本地靜態資源（cases.json 等），禁止 POST 或外部來源
  const fetchRe = /fetch\((\s*['"`])([^'"`]*)/g;
  let fMatch;
  while ((fMatch = fetchRe.exec(html))) {
    const url = fMatch[2];
    if (/^https?:\//.test(url) || url.startsWith('//')) {
      errors.push(relative + ': fetch() targets an external URL ("' + url + '") — inquiry flow must stay local-only with LINE handoff');
    }
    if (/method\s*:\s*['"]post['"]/i.test(url)) {
      errors.push(relative + ': fetch() with POST — inquiry flow must stay local-only with LINE handoff');
    }
  }
}
scanned('本機收單防回歸', localOnlyScanned + '/' + htmlFiles.length + ' 個 HTML（privacy/terms 豁免），各檢 3 個後端收件樣式 + fetch 外部/POST');

// GA4 不送個資：分析檔不得出現個資欄位名稱
const analytics = fs.readFileSync(path.join(root, 'analytics.js'), 'utf8');
try { new Function(analytics); }
catch (error) { errors.push('analytics.js invalid JavaScript: ' + error.message); }
const piiFields = [
  'customer_name',
  'customer_phone',
  'user_name',
  'user_phone',
  'lead_form',
  'gtag(\'event\', \'generate_lead\'',
];
for (const forbidden of piiFields) {
  if (analytics.includes(forbidden)) errors.push('analytics.js sends PII-like field to GA4: ' + forbidden);
}
// ⚠️ 只讀 analytics.js 一個檔。若日後把事件散到 inline script，這條就管不到了。
scanned('GA4 不送個資', '僅 analytics.js 1 個檔，' + piiFields.length + ' 個禁用欄位名');

// 品牌承諾文字防回歸（改價格、承諾、統編、地址前必須先向負責人確認）
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const brandPromises = [
  '估多少收多少',
  '絕不現場加價',
  '60214473',
  '0988-145-875',
  '@117adltu',
  '複製',
];
for (const required of brandPromises) {
  if (!homepage.includes(required)) errors.push('index.html missing required text: ' + required);
}
scanned('品牌承諾（存在）', '僅 index.html 1 個檔，' + brandPromises.length + ' 項必要文字。'
  + '刻意不要求其他頁面全部具備——calculator/privacy/terms 本來就不需要完整承諾組；'
  + '跨頁的部分改由下面的「品牌事實（漂移）」負責');

// ── 品牌事實全站防漂移 ────────────────────────────────────────
// 上面那條只讀 index.html。真正的跨頁風險不是「別的頁面沒寫承諾」，
// 而是「別的頁面寫了但寫錯」——改電話只改一半、複製舊頁時帶到別的 LINE ID、
// 統編打錯一碼。這些單看首頁完全抓不到。
// 形狀與 GA4 ID 一致性相同：定義唯一來源，掃全站找不一致。
const BRAND_PHONE = '0988145875';       // 顯示格式 0988-145-875
const BRAND_LINE_OA = '@117adltu';
const BRAND_TAX_ID = '60214473';
// CSS at-rule 與 JSON-LD 保留字長得像 LINE ID（都是 @ 開頭），需排除
const AT_TOKEN_ALLOWLIST = new Set([
  '@context', '@keyframes', '@media', '@supports', '@import', '@charset',
  '@layer', '@container', '@graph', '@property', '@namespace', '@font',
]);
let driftFiles = 0;
let phoneHits = 0;
let lineHits = 0;
let taxHits = 0;
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const raw = fs.readFileSync(file, 'utf8');
  driftFiles++;
  // 表單的示範號碼不算（index.html #bk-phone 用 0912-345-678 當 placeholder）
  const html = raw.replace(/placeholder=["'][^"']*["']/gi, '');

  for (const m of html.matchAll(/09\d{2}-?\d{3}-?\d{3}/g)) {
    phoneHits++;
    if (m[0].replace(/-/g, '') !== BRAND_PHONE) {
      errors.push(relative + ': 出現非官方電話 "' + m[0] + '"（唯一官方號碼為 0988-145-875）');
    }
  }
  for (const m of html.matchAll(/@[0-9a-z]{5,12}\b/gi)) {
    const token = m[0].toLowerCase();
    if (AT_TOKEN_ALLOWLIST.has(token)) continue;
    lineHits++;
    if (token !== BRAND_LINE_OA) {
      errors.push(relative + ': 出現非官方 LINE 帳號 "' + m[0] + '"（唯一官方帳號為 ' + BRAND_LINE_OA + '）');
    }
  }
  for (const m of html.matchAll(/統一?編號[^0-9]{0,10}(\d{8})/g)) {
    taxHits++;
    if (m[1] !== BRAND_TAX_ID) {
      errors.push(relative + ': 統編 "' + m[1] + '" 與官方值 ' + BRAND_TAX_ID + ' 不符');
    }
  }
}
scanned('品牌事實（漂移）', driftFiles + '/' + htmlFiles.length + ' 個 HTML 全掃，命中 '
  + phoneHits + ' 處電話、' + lineHits + ' 處 LINE 帳號、' + taxHits + ' 處統編，各需等於唯一來源'
  + '（form placeholder 已排除）');
// GA4 ID 全站一致性：所有 inline gtag config 的測量 ID 必須等於 analytics.js 的來源 ID
// 防止改動時 inline script 與分析檔漂移成兩個測量 ID
const ga4Source = analytics.match(/GA4_ID:\s*['"](G-[A-Z0-9]+)['"]/);
if (!ga4Source) errors.push('analytics.js GA4_ID constant not found');
else {
  const ga4Id = ga4Source[1];
  let ga4Files = 0;
  let ga4Configs = 0;
  for (const file of htmlFiles) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (relative === 'hsinchu.html') continue;
    const html = fs.readFileSync(file, 'utf8');
    ga4Files++;
    const configRe = /gtag\(['"]config['"],\s*['"](G-[A-Z0-9]+)['"]/g;
    let cMatch;
    while ((cMatch = configRe.exec(html))) {
      ga4Configs++;
      if (cMatch[1] !== ga4Id) {
        errors.push(relative + ': inline GA4 config ID ("' + cMatch[1] + '") differs from analytics.js source ("' + ga4Id + '")');
      }
    }
    // G-XXXXXXXXXX 佔位字串只能留在 analytics.js 註解，正式頁 inline script 出現即錯誤
    if (/gtag\([^)]*G-XXXX/i.test(html)) {
      errors.push(relative + ': placeholder G-XXXXXXXXXX ID in live inline script');
    }
  }
  scanned('GA4 ID 一致性', ga4Files + ' 個 HTML 內共 ' + ga4Configs + ' 處 gtag config，來源 ID = ' + ga4Id + '（取自 analytics.js 的 GA4_ID 常數）');
}
// 每個公開頁必須至少有一個有效承接管道（LINE 官方帳號入口或官方電話），訪客不會無處可去
const ctaLineRe = /https?:\/\/line\.me\/R\/[a-z]+\/@117adltu|@117adltu/i;
const ctaTelRe = /href=["']tel:0988145875["']/i;
let ctaScanned = 0;
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'hsinchu.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  ctaScanned++;
  if (!ctaLineRe.test(html) && !ctaTelRe.test(html)) {
    errors.push(relative + ': page has no LINE or phone CTA — every public page must offer a contact path');
  }
}
scanned('承接管道覆蓋', ctaScanned + '/' + htmlFiles.length + ' 個 HTML 各需至少 1 個 LINE 或電話 CTA（hsinchu.html 轉跳頁豁免）');
// calculator 試算閉環：結果區塊必須同時具備「回帶估算結果」與「電話直撥」兩個 CTA
const calcHtml = htmlFiles
  .filter((file) => path.relative(root, file).replaceAll('\\', '/') === 'calculator.html')
  .map((file) => fs.readFileSync(file, 'utf8'))[0];
if (calcHtml) {
  const loopMarkers = ['estimate-booking-link', 'qcta-tel', 'tel:0988145875', 'quick-cta'];
  for (const required of loopMarkers) {
    if (!calcHtml.includes(required)) errors.push('calculator.html missing booking-loop CTA: ' + required);
  }
  scanned('試算閉環', '僅 calculator.html 1 個檔，' + loopMarkers.length + ' 個必要標記');
} else {
  scanned('試算閉環', '⚠️ 找不到 calculator.html，本項未執行');
}
// 服務區事實：只能出現經確認的五個服務區（基隆、台北、新北、桃園、宜蘭）
// 新竹服務已取消（見 hsinchu.html），出現「新竹」服務文案即視為回歸
const publicHtml = htmlFiles
  .filter((file) => {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    return relative !== 'hsinchu.html';
  })
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
// 允許誠實宣告（如「新竹目前未列入服務區」），禁止的是提供服務的文案
const honestRe = /(新竹|hsinchu)[^<>]{0,30}(未列入|不提供|已取消|可洽詢|請改|建議)/i;
const offerRe = /(新竹|hsinchu)[^<>]{0,60}(清潔|服務|區)[^<>]{0,30}/i;
if (offerRe.test(publicHtml) && !honestRe.test(publicHtml)) {
  errors.push('public HTML still offers Hsinchu service copy — Hsinchu service was cancelled');
}
scanned('服務區事實', (htmlFiles.length - 1) + ' 個公開 HTML 合併後比對（hsinchu.html 排除），禁止新竹「提供服務」文案');

if (errors.length) {
  console.error(errors.join('\n'));
  console.error('\n❌ ' + errors.length + ' 項失敗。本次各項檢查的實際掃描範圍：\n' + checks.join('\n'));
  process.exitCode = 1;
} else {
  console.log('✅ 全部通過。各項檢查的實際掃描範圍：\n' + checks.join('\n'));
  if (warnings.length) console.log('\nWARNINGS:\n' + warnings.join('\n'));
}
