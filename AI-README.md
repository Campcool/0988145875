# 潔美淨網站 AI 維護說明

## 2026-09-03 轉換路徑與閱讀節奏優化（Codex，已完成／待合併部署）

- 分支：`codex/conversion-ui-20260903`，從遠端 `main` 的 `fe4f37c` 開出；尚未合併或部署。
- 首頁主要路徑改為「辨識需求與起價 → 真實成果與評論 → 三步服務流程 → LINE 傳照片估價」，避免七張服務卡、評論、流程、SEO 說明與表單全部以同等重量連續堆疊。
- 三個高意圖服務直接顯示起價／報價方式；其他四項維持精簡入口。點擊後會切到服務頁、展開對應項目並定位，不再只回到服務頁頂端。
- 首頁真實前後照與一則既有 Google 評論合併為成果證據區；完整案例頁仍保留全部 `cases.json` 內容。
- 店家／地區／報價補充、完整需求表與 FAQ 改為漸進展開。主要 LINE 傳照片入口保持直接可見；`#booking-form` 仍可直接開啟完整表單。
- 桌機服務、案例、價格表與關於頁主要內容從手機寬度擴展至 860–1000px，案例改為雙欄，居家計時方案改為四欄；手機仍維持單欄或雙欄的可讀配置。
- 使用者已選定第五張 E 版老闆夫妻形象照；首頁 `hero-photo.jpg`／`hero-photo.webp` 已替換為「創辦人兼資深清潔顧問」構圖，以工作識別、檢查板與清潔工具避免被誤認為一般客戶。網站使用 960×870 適配裁切，原始生成圖仍保留在 Codex 產圖資料夾。
- 未改價格、電話、LINE、服務區、GA4、案例照片、評分、戶數、統編、地址或營運承諾。
- 實際視覺覆核尺寸：320×700、390×844、840×900、1280×720、1720×900；已檢查首頁、服務精準定位、預約深連結、價格頁籤、案例雙欄與關於頁，瀏覽器 console 無 error／warning。程式門禁以 `node scripts/validate-site.mjs`、`node --check analytics.js`、`git diff --check` 為準。
- 本輪依 `D:\AI-Skill\ai-skills\SKILL.md` 路由使用兩項主技能：`uiux-design` 用於先審計後實作、轉換層級、漸進展開、響應式與無障礙覆核；`media-production-video-image` 用於 E 版人物圖用途構圖、機械裁切、JPEG／WebP 壓縮與輸出檢查。

### 2026-09-03 服務圖示視覺補強（Codex）

- 新增七張透明背景服務插圖，只替換服務手風琴內原本的 emoji：居家、社區、裝潢細清、店面辦公室、收納、退租入住與大掃除。
- 圖片統一輸出 192×192 PNG／WebP；HTML 優先載入 WebP、PNG 作備援，並使用 lazy loading。導覽、電話、LINE 與價格頁籤等功能性圖示保持不變，避免裝飾干擾操作辨識。
- `scripts/prepare-pages-artifact.sh` 已將 `service-icons/` 納入公開白名單，並把七組 PNG／WebP 共 14 個檔案全部列為必要部署檔，避免 CI 通過但正式站缺圖。

## 2026-08-25 GitHub Actions Node 24 runtime（Codex）

依 GitHub 官方各 Action 的 `action.yml` 實際 runtime，將 workflow 升至 `checkout@v7`、
`setup-node@v7`、`configure-pages@v6`、`upload-pages-artifact@v5`、`deploy-pages@v5`。
網站執行用 Node 版本仍為 22；本輪未改價格、電話、LINE、服務區、GA4、案例、照片或網站內容。

## 2026-08-24 Pages artifact 公開範圍收斂（Codex）

實測 `https://0988145875.com.tw/AI-README.md` 為 HTTP 200。新增
`scripts/prepare-pages-artifact.sh`，PR check 與 deploy 都以明確公開白名單建立 `_site`；
未列入白名單的維護文件與廣告投放資料預設不發佈。本 PR 只改 Actions artifact 內容；
本站 Pages `build_type` 目前仍為 `legacy`，因此合併後線上發佈內容不會改變，必須另外把
Pages Source 切到 GitHub Actions 才會生效。本輪未改價格、電話、LINE、服務區、GA4 或網站內容。

覆審補正：`cases.json` 是首頁執行期資料，所引用的 `cases/*.jpg` 必須一併公開。
artifact 腳本現在逐一核對 before/after 路徑，CI 會刻意移走一張案例圖，確認缺檔時門禁確實失敗。
本次只修打包與門禁，未修改案例文字或照片。

## 2026-08-24 UI/UX 窄螢幕優化（Codex，待審查）

- 分支：`codex/ui-polish-cleaning-2026-08-24`，從遠端 `main` 的 `3c20b61` 開出；不得未經使用者同意合併。
- `max-width: 380px` 時，預約表單的 `.bk-grid` 從雙欄改為單欄，處理 125% 縮放下有效 312px viewport 的欄位擠壓。
- 首頁流程標題與 FAQ 問題由 13／13.5px 提升到 16px，恢復標題層級與繁中可讀性。
- 未改價格、電話、LINE、服務區、GA4、案例或照片。
- 驗證：`node scripts/validate-site.mjs`、`node --check analytics.js`、`git diff --check` 全綠；327x675（有效內容寬 312px）實際渲染為單欄、無水平溢位，console 無 error/warning。

## 2026-08-21 Pages 部署門禁更新（Codex）

依 `Campcool/AI-skill` 的跨倉庫優化專案 P0-1，將 `.github/workflows/site-check.yml`
從純 Site check 升級為 `Validate and deploy to GitHub Pages`。

- PR 仍只跑既有 `analytics.js` 語法檢查、`validate-site.mjs` 與 GA4 防假綠。
- main push 時必須先通過同一組檢查，才執行 `actions/deploy-pages`。
- 2026-08-17 曾記錄「本站 CI 不是門禁」為當時接受的取捨；本次是使用者依跨倉庫 P0 專案重新啟動的部署門禁調整，等於用新決策覆蓋舊取捨。
- 此變更需搭配 GitHub Pages 設定從 legacy branch deploy 改為 GitHub Actions workflow；合併後再切換 Pages source。

本輪只改部署 workflow 與交接文件，未改價格、電話、LINE、服務區、GA4 或網站內容。

## 專案定位

- 品牌：潔美淨清潔社
- 正式網域：https://0988145875.com.tw/
- 電話：0988-145-875
- LINE 官方帳號：`@117adltu`
- 服務核心：居家清潔、裝潢後細清、大掃除、退租入住、社區、店面辦公室與收納整理
- 主要服務區：基隆、台北、新北；桃園與宜蘭可預約
- 核心承諾：報價前確認清潔細項，談好的內容不任意現場加價

以上資料均來自現有網站內容。修改價格、服務區、評分、戶數、統編、地址或營運承諾前，必須先向專案負責人確認。

## 技術架構

- 純靜態 HTML、CSS、JavaScript，無建置步驟
- `index.html` 同時承載首頁、服務、案例、價格與關於頁籤
- `calculator.html` 提供費用試算，結果可帶回首頁詢價表單
- `cases.json` 與 `cases/` 管理清潔前後案例
- `analytics.js` 管理 GA4 與 Google Ads 事件
- GitHub Pages 透過 `CNAME` 綁定正式網域

## 詢價與個資流程

首頁表單沒有送到 Worker、資料庫或網站後端。它只在瀏覽器內把欄位整理成文字，複製後開啟 LINE，由客戶自行確認並傳送。

必須維持以下保護：

- 不把姓名、電話、地區文字、偏好時間、備註或完整 LINE 訊息送進 GA4／Google Ads。
- LINE 深層連結的完整查詢字串不得寫入分析事件。
- 從試算器帶回首頁的欄位完成預填後，要從網址移除。
- 若未來改成後端收件，必須同步更新首頁提示與 `privacy.html`，並先確認保存期限、權限與刪除方式。

## 2026-07-30 UI／UX 第一輪

- 首屏改以「LINE 傳照片估價」為主要行動，「先試算費用」為次要行動。
- 將主訴求聚焦為「先報價，做到驗收」，保留既有價格與服務承諾。
- 新增 840px 以上桌機版雙欄首屏、四欄服務網格、雙欄評論／流程／FAQ。
- 手機版移除重複浮動按鈕，保留頂部聯絡入口與底部導覽。
- 表單改名為「整理需求，再到 LINE 確認傳送」，明確說明本站不儲存欄位內容。
- 補齊表單標籤、鍵盤操作、焦點狀態、外部連結安全屬性與減少動態偏好。
- 分析事件改成只送出是否完成欄位，不送客戶實際輸入內容。

## 2026-08-05 UI／UX 第二輪

- 全站主要藍色改為 `#0369A1`、主要綠色改為 `#047A36`，修正白字按鈕與次要文字的 WCAG AA 對比問題；亮綠保留給 LINE 圖示辨識。
- 首頁、價格表、頁尾、地區卡片與試算器不再使用 10–12px 的資訊小字，一般輔助文字提高到至少 13px。
- 頂部操作、表單欄位、價格頁籤、試算加減鍵與主要 CTA 提高到至少 44px 點擊範圍。
- 價格分類與裝潢類型補上標準 tab 語意、選取狀態與左右方向鍵操作。
- 手機底部導覽補上 `aria-current`；切換內頁後會把鍵盤焦點移到新頁標題，前往預約時會移到表單標題。
- 補齊桌機首頁／服務／收費／案例／關於主選單，手機底部新增收費入口，修正舊版收費與關於內容難以進入的導覽缺口。
- 案例前後對照改為可聚焦的 slider，支援滑鼠、觸控、Home／End 與方向鍵；案例圖片補上固有尺寸以降低版面跳動。
- 費用試算器服務與加項按鈕補上 `aria-pressed`，坪數控制補上名稱與描述關聯，試算結果會以 live region 回報。
- 移除 `transition: all`，並讓 JavaScript 平滑捲動遵守 `prefers-reduced-motion`。
- 同步套用至基隆、台北、新北、桃園、宜蘭、隱私權與服務條款頁面的色彩、焦點與點擊尺寸。

### 桌機導覽辨識度補強

- 桌機首頁、服務、收費、案例、關於改為 15–17px 純文字、五欄等寬的水平分頁列；移除造成擁擠的圖示與小卡片外框，以細分隔線、選取底色、懸停回饋與底線標記所在頁面。

### LINE 品牌圖示修正

- 舊版使用自行繪製的空白對話泡泡，無法明確辨識為 LINE。浮動入口與聯絡卡已改用 LINE 官方下載的 `LINE_Brand_icon.png`，並移除套在品牌標誌上的放大閃爍效果。
- 小型文字按鈕不再放置仿製泡泡，以清楚的「LINE」文字標示服務；官方圖檔來源與使用規範：`https://www.line.me/en/logo`。
- 浮動按鈕列以共同中心軸排列，讓 56px LINE 點擊區與 48px 電話、地圖按鈕保持視覺置中，不再因右對齊造成 LINE 圖示左偏。

## 修改與驗證守則

1. 先在獨立分支修改，不直接改正式站。
2. `node --check analytics.js` 必須通過。
3. 檢查 `git diff --check`。
4. 至少驗證 390×844 手機版與 1280×720 桌機版。
5. 測試首頁、服務頁籤、案例頁籤、試算器帶回表單、LINE 連結與電話連結。
6. 確認沒有水平溢位、固定導覽遮擋內容或瀏覽器主控台錯誤。
7. 只有合併到 `main` 並確認 GitHub Pages 完成後，才能說正式站已部署。

## 2026-08-05 全站 UI／UX 回歸補強

- 重新盤點首頁五個 SPA 頁籤、費用試算器、五個服務地區頁、隱私權與服務條款，並以手機、切換點及桌機尺寸檢查溢位、字級、點擊區、標題結構與固定元件。
- LINE 官方圖示改為保留 1001×1000 固有比例，浮動按鈕列固定 60px 共同中心軸，避免不同尺寸按鈕看似左右偏移。
- 首頁手機統計標籤最低提高至 13px，案例入口補足 44px 高；基隆與宜蘭頁尾短連結補足 44×44px 點擊範圍。
- 價格承諾、聯絡方式、品牌承諾與地區頁案例／承諾標題改用 H3，移除 H2 直接跳 H4 的語意斷層，並同步提高案例卡標題可讀性。
- 往後單點 UI 回報必須視為全站共用元件的回歸警訊，不能只修截圖中的單一實例。

## 2026-08-05 手機預約錨點修正

- 手機底部「預約」與主要 LINE 詢價入口統一落在 `#booking-section` 行動區頂部，第一眼先看到「直接傳照片估價」，避免跳過轉換率較高的快速入口。
- 詢價行動順序調整為「直接傳照片估價（最快）」→「先試算費用」→「或填寫完整需求」；表單仍保留獨立 `#booking-form` 錨點與「填寫預約需求」標題。
- 手機預留 72px、桌機預留 88px 固定導覽間距；行動區落點聚焦於區塊標題，直接表單落點才聚焦表單容器，兩者都不會自動叫出手機鍵盤。
- 預約流程切換回首頁時不再同時觸發「捲到頁首」與「捲到表單」兩段平滑動畫，避免不同手機因捲動競爭而停在 LINE 詢價卡或不一致的高度。

## 2026-08-16 AI-readme 更新（Manus 多倉庫優化迭代）

### 現況

本次更新前的狀態：純靜態站 10 個 HTML 頁面、index.html 有 6 個 JSON-LD blocks（LocalBusiness、FAQPage、WebSite 等）、全部頁面 canonical 齊備、llms.txt 與 sitemap.xml 完整、analytics.js 符合「GA4 不送個資」原則、hsinchu.html 是「新竹服務區已取消」的 noindex 轉跳頁且正確排除於 sitemap 之外。AI-README 已有七條修改守則，但**缺少自動化驗證腳本與 GitHub Actions 工作流**，安全網完全依賴人工，是三個靜態站中最弱的一個。

### 修改方向（2026-08-16 迭代）

以 campcool 的 scripts/validate-site.mjs 為範本，建立本站的自動化防回歸系統：把人工守則（canonical、JSON-LD 語法、個資保護模式、品牌承諾文字、服務區事實）寫成可執行的檢查腳本，並掛上 GitHub Actions 讓每次 push 與 PR 自動跑。新竹處置經辯證後確認正確（noindex＋轉跳＋排除 sitemap），不修改；「新竹目前未列入服務區」的誠實宣告文案予以保留並納入檢查的正向模式。

### 修改進度（2026-08-16 已完成並驗證）

| 項目 | 狀態 | 驗證方式 |
|---|---|---|
| `scripts/validate-site.mjs` | 已建立，10 個 HTML 檔全檢查通過 | node 執行 exit 0；防假綠測試通過（故意改「絕不現場加價」後正確報錯） |
| `.github/workflows/site-check.yml` | 已建立，push 與 PR 觸發 | node --check analytics.js ＋ validate-site.mjs |
| hsinchu.html 檢查 | 已納入（維持 noindex＋排除 sitemap） | 轉跳頁檢查通過 |
| 品牌承諾防回歸 | 「估多少收多少」「絕不現場加價」、統編、電話、LINE、複製流程 | 防假綠測試通過 |
| 個資保護防回歸 | 禁止 fetch 外部 POST、XMLHttpRequest、sendBeacon；fetch 只允許本地靜態資源（cases.json） | 已驗證 |

## 2026-08-17 交叉複驗（Claude）

跨 5 個 Campcool 站的橫向盤點，本站的部分。

### 發現

**先講對的部分**：Manus 第二輪的 GA4 ID 一致性斷言**寫法是正確的**，
而且是同一套 validate 模板在 5 個 repo 裡處理得最好的一份——
`sitemap ↔ noindex` 的雙向規則（第 47–52 行明確要求轉跳頁必須 noindex
且必須不在 sitemap）在 leakdoctor 的同一支腳本裡是漏掉的。

> 附帶紀錄一個複驗時的誤判，避免下一個人重蹈：第一次測 GA4 斷言時我用
> 寬鬆的 `/G-[A-Z0-9]+/` 去破壞 analytics.js，validate 沒反應，一度誤判
> 斷言失效。實際原因是**檔案第 5 行的註解裡有 `G-XXXXXXXXXX` 佔位字串
> 排在真 ID 前面**，被改到的是那個。破壞點必須鎖定 `GA4_ID:` 常數本身。

**找到的兩個問題**：

1. **`site-check.yml` 有兩個零斷言步驟**，會顯示綠勾但不檢查任何東西：
   - Whitespace check 結尾是 `|| true`，永遠通過
   - Mobile viewport check 整步只有一行 `echo`，印出「請人工驗證」

   效果是讓 workflow 看起來涵蓋得比實際多。

2. **`validate-site.mjs` 的結尾摘要宣稱範圍大於實際**。原本是一行
   `Validated N HTML files, inline scripts, JSON-LD, canonicals, sitemap,
   local-only booking, and brand-promise markers.`——列了 7 個涵蓋領域卻只給
   一個分母（HTML 檔數），讀起來像每項都掃過同樣廣度。實際上「品牌承諾」
   只讀 index.html、「GA4 不送個資」只讀 analytics.js，各只有 1 個檔。

### 變更

| 項目 | 內容 |
|---|---|
| 移除零斷言步驟 | 刪掉上述兩個假動作，改補一個真的防假綠步驟（破壞 `GA4_ID` 常數 → 確認 validate exit 1 → 還原重跑） |
| 逐項回報掃描範圍 | 每項檢查改用 `scanned()` 回報實際分母，結尾逐條印出（見下方輸出樣本） |
| 品牌事實全站漂移偵測 | **新增**。原本只驗首頁有沒有那 6 項承諾；新增全站掃描電話／LINE 帳號／統編，任何一處不等於唯一來源即報錯 |

**品牌承諾的擴大方式刻意不是「要求 10 頁都有那 6 項」**——那是錯的方向。
`calculator.html` 不需要「絕不現場加價」、`privacy`／`terms` 不需要完整承諾組，
硬性要求只會逼人塞無意義文字。真正的跨頁風險是「有寫但寫錯」：改電話只改一半、
複製舊頁帶到別的 LINE ID、統編打錯一碼。所以新增的是漂移偵測，形狀與 Manus
先前寫對的 GA4 ID 一致性相同——定義唯一來源，掃全站找不一致。

實測命中：177 處電話、9 處 LINE 帳號、5 處統編，全站 10/10 個 HTML。

兩個誤報來源已處理：`index.html` 的 `#bk-phone` 用 `0912-345-678` 當
placeholder 示範（已排除 placeholder 屬性）；`@context`／`@keyframes` 等
CSS at-rule 與 JSON-LD 保留字長得像 LINE ID（已列 allowlist）。

防假綠實測四種情境：塞入 `0987-654-321` → exit 1、塞入 `@999zzzzz` → exit 1、
統編改 `60214470` → exit 1、placeholder 塞假號碼 → exit 0（正確不誤報）。

現在 validate 通過時的輸出：

```
✅ 全部通過。各項檢查的實際掃描範圍：
  · canonical：10 個 HTML
  · JSON-LD 有效性：21 個 ld+json 區塊
  · 內嵌 JS 語法：12 個 inline script 區塊
  · sitemap 對應：10 個 HTML ↔ 14 個 <loc>
  · 本機收單防回歸：8/10 個 HTML（privacy/terms 豁免）
  · GA4 不送個資：僅 analytics.js 1 個檔，6 個禁用欄位名
  · 品牌承諾（存在）：僅 index.html 1 個檔，6 項必要文字
  · 品牌事實（漂移）：10/10 個 HTML 全掃，命中 177 處電話、9 處 LINE、5 處統編
  · GA4 ID 一致性：9 個 HTML 內共 9 處 gtag config
  · 承接管道覆蓋：9/10 個 HTML
  · 試算閉環：僅 calculator.html 1 個檔，4 個必要標記
  · 服務區事實：9 個公開 HTML 合併後比對
```

### 後續接手注意事項（本輪新增）

9. **斷言的 `ok()`／`scanned()` 訊息必須寫出實際掃描範圍與分母**，不得只寫
   「完成」或「全域」。有取樣上限就寫出上限。這條規則同時套用在 campcool /
   leakdoctor / TITAN-STAR，2026-08-17 光靠印分母就在四個 repo 各找出一個
   隱形的覆蓋落差。新增檢查時請沿用 `scanned()`。
10. **兩條窄斷言的邊界已標註但未擴大**（原始碼有 ⚠️ 註解）：
    - 「品牌承諾」只讀 `index.html`——其他頁若出現矛盾的價格或承諾抓不到
    - 「GA4 不送個資」只讀 `analytics.js`——事件若散到 inline script 就管不到

    這是**已知範圍**不是疏漏。要擴大是另一個決定，動手前先確認需求。
11. **CI 步驟不可以只有 `echo` 或結尾掛 `|| true`**。那種步驟會顯示綠勾卻不
    斷言任何事，比沒有更糟——它讓 workflow 看起來涵蓋得比實際多。
    需要人工驗證的項目請寫進本檔守則，不要偽裝成 CI 步驟。
12. **本站的 CI 不是門禁**。`site-check.yml` 是 `on: push`，與 GitHub Pages
    的分支部署**並行**跑，擋不住壞版本上線，只是事後多一個紅叉。
    這是刻意接受的取捨（2026-08-17 業主決定，理由是變動頻率低、
    改成 Actions 部署反而多一層可能壞掉的東西），**不是待修項目**。
    若要改成真門禁，做法見 `campcool/.github/workflows/deploy.yml`。

## 2026-08-16 滿分制迭代（Manus 第二輪）

### 現況

第一輪已建立 validate-site.mjs 與 site-check.yml，基礎安全網到位。滿分制盤點後發現三處可追回：GA4 測量 ID 為雙來源（analytics.js 的 CFG 與 9 個 HTML 頁的 inline gtag config）但無漂移檢查；無承接管道（CTA）強制規則；試算閉環未斷言。

### 修改進度（已完成並驗證）

| 項目 | 狀態 | 驗證方式 |
|---|---|---|
| GA4 ID 全站一致性 | 已加進 validate：inline config ID 必須等於 analytics.js 來源 ID | 防假綠通過（改 CFG 常數後 9 頁全報錯） |
| G-XXXXXXXXXX 佔位字串 | 只允許留 analytics.js 註解，正式頁 inline script 出現即報錯 | 已驗證 |
| 每頁 CTA 強制規則 | 所有公開頁至少一個承接管道（@117adltu 或 tel:0988145875） | 10 頁通過（hsinchu 轉跳頁豁免） |
| calculator 試算閉環 | 結果區塊必須同時含「回帶估算結果」與「電話直撥」雙 CTA | 4 個元素斷言全過 |

### 後續接手注意事項（本輪新增）

6. **GA4 ID 只有一個真源**：analytics.js 的 CFG.GA4_ID 是唯一來源；改 ID 時必須同步改全部 HTML 頁 inline gtag config，validate 會自動抓住漂移。佔位字串 G-XXXXXXXXXX 永遠只能留註解，不可進正式頁。
7. **CTA 不可消失**：每頁至少保留 LINE 官方帳號或電話承接管道之一；若策略改為單一管道，必須同步更新 validate 的 CTA 規則，不可單刪頁面連結。
8. **試算閉環是轉化核心**：calculator 的「傳送估算結果給師傅確認」回帶與電話直撥缺任一側 validate 即報錯。

### 後續接手注意事項

1. **改動任何 HTML／analytics.js 前先跑 `node scripts/validate-site.mjs`**，PR 的 workflow 檢查必須全綠才能合併；CI 通過不等於 UI 沒壞，390×844 與 1280×720 的人工目檢仍是必要步驟（AI-README 守則第 4 條）。
2. **新增品牌承諾文字時同步加進 validate-site.mjs 的 required 清單**，讓檢查腳本跟隨品牌演進；刪除承諾文字前必須先向負責人確認。
3. **新增 HTML 頁面時**：必須加絕對 canonical、進 sitemap（除非是 noindex 轉跳頁）、通過 new Function() 語法檢查；轉跳頁不得進 sitemap。
4. **服務區**：若負責人未來決定重新開放新竹服務，必須同步更新 validate-site.mjs 的誠實宣告模式（honestRe）與此條目，不能只改頁面文案。
5. **fetch 白名單**：目前只允許本地相對路徑讀取；若未來需要呼叫外部 API（例如匯款驗證），必須先與負責人確認並更新此檢查規則——個資保護防回歸規則不可單方面放鬆。
