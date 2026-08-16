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
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
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
      try { JSON.parse(body); }
      catch (error) { errors.push(relative + ': invalid JSON-LD: ' + error.message); }
      continue;
    }
    try { new Function(body); }
    catch (error) { errors.push(relative + ': invalid inline JavaScript: ' + error.message); }
  }
}
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
// 個資保護防回歸：詢價流程必須維持「本機整理＋LINE 送出」，不得出現後端收件
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'privacy.html' || relative === 'terms.html') continue;
  const html = fs.readFileSync(file, 'utf8');
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
// GA4 不送個資：分析檔不得出現個資欄位名稱
const analytics = fs.readFileSync(path.join(root, 'analytics.js'), 'utf8');
try { new Function(analytics); }
catch (error) { errors.push('analytics.js invalid JavaScript: ' + error.message); }
for (const forbidden of [
  'customer_name',
  'customer_phone',
  'user_name',
  'user_phone',
  'lead_form',
  'gtag(\'event\', \'generate_lead\'',
]) {
  if (analytics.includes(forbidden)) errors.push('analytics.js sends PII-like field to GA4: ' + forbidden);
}
// 品牌承諾文字防回歸（改價格、承諾、統編、地址前必須先向負責人確認）
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const required of [
  '估多少收多少',
  '絕不現場加價',
  '60214473',
  '0988-145-875',
  '@117adltu',
  '複製',
]) {
  if (!homepage.includes(required)) errors.push('index.html missing required text: ' + required);
}
// GA4 ID 全站一致性：所有 inline gtag config 的測量 ID 必須等於 analytics.js 的來源 ID
// 防止改動時 inline script 與分析檔漂移成兩個測量 ID
const ga4Source = analytics.match(/GA4_ID:\s*['"](G-[A-Z0-9]+)['"]/);
if (!ga4Source) errors.push('analytics.js GA4_ID constant not found');
else {
  const ga4Id = ga4Source[1];
  for (const file of htmlFiles) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (relative === 'hsinchu.html') continue;
    const html = fs.readFileSync(file, 'utf8');
    const configRe = /gtag\(['"]config['"],\s*['"](G-[A-Z0-9]+)['"]/g;
    let cMatch;
    while ((cMatch = configRe.exec(html))) {
      if (cMatch[1] !== ga4Id) {
        errors.push(relative + ': inline GA4 config ID ("' + cMatch[1] + '") differs from analytics.js source ("' + ga4Id + '")');
      }
    }
    // G-XXXXXXXXXX 佔位字串只能留在 analytics.js 註解，正式頁 inline script 出現即錯誤
    if (/gtag\([^)]*G-XXXX/i.test(html)) {
      errors.push(relative + ': placeholder G-XXXXXXXXXX ID in live inline script');
    }
  }
}
// 每個公開頁必須至少有一個有效承接管道（LINE 官方帳號入口或官方電話），訪客不會無處可去
const ctaLineRe = /https?:\/\/line\.me\/R\/[a-z]+\/@117adltu|@117adltu/i;
const ctaTelRe = /href=["']tel:0988145875["']/i;
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'hsinchu.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  if (!ctaLineRe.test(html) && !ctaTelRe.test(html)) {
    errors.push(relative + ': page has no LINE or phone CTA — every public page must offer a contact path');
  }
}
// calculator 試算閉環：結果區塊必須同時具備「回帶估算結果」與「電話直撥」兩個 CTA
const calcHtml = htmlFiles
  .filter((file) => path.relative(root, file).replaceAll('\\', '/') === 'calculator.html')
  .map((file) => fs.readFileSync(file, 'utf8'))[0];
if (calcHtml) {
  for (const required of ['estimate-booking-link', 'qcta-tel', 'tel:0988145875', 'quick-cta']) {
    if (!calcHtml.includes(required)) errors.push('calculator.html missing booking-loop CTA: ' + required);
  }
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
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const msg = 'Validated ' + htmlFiles.length + ' HTML files, inline scripts, JSON-LD, canonicals, sitemap, local-only booking, and brand-promise markers.';
  console.log(msg + (warnings.length ? '\nWARNINGS:\n' + warnings.join('\n') : ''));
}
