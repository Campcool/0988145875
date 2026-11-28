# 潔美淨訪客需求審視與設計比較

日期：2026-11-28（Asia/Taipei）。產品基準d4034002a6e66cd66dc8a66dafac9f968114c1d3；中央AI-skill基準6dd7137aaeaa4bcb4f677cfe3caffaa2ccaea14a。已讀中央status／README、最新交接、UIUX與Uiverse指引；起工無open PR，main/push run46032086498部署成功。使用者沿用先完整檢查、發布、延後實際連線，且要求本案不急於收斂。

## 審視範圍與判斷

先實看正式首頁、三獨立服務頁、收費分類與服務手風琴，並讀全部公開頁入口、試算／政策、產物及原瀏覽器回歸。以下區分已觀察問題與設計機會，不以總分代替任務完成或成效。

|位置／程度|訪客影響與證據|本輪處置與驗收|
|---|---|---|
|獨立頁→收費／明顯困難|正式#pricing的H2 top38px，固定header bottom72px，標題被蓋住|root fragment加實際header高度補償；驗外部載入、reload及history座標|
|獨立頁→整理／明顯困難|三頁均連/#booking-form，原service名稱未接續|用既有service預填帶公開服務名；標籤前清掉query，不預選計價或填個資|
|獨立頁→完整費用／明顯困難|裝潢與退租頁都連通用#pricing，預設居家分類|連既有psec-reno／other等網址，揭露正確分類；重載／返回仍一致|
|首頁服務比較／設計機會|原三橫列情境標籤display:none，名稱／說明／行動跨欄；已有功能不等於設計充分|目前版＋兩品牌化候選實際渲染；採情境／原價／說明／可見行動分層|
|三獨立頁／設計機會|費用段在scope之後，無本頁導航；與首頁令牌／行動層次不連續|首段費用摘要、服務互切、閱讀錨點、費用相鄰詢問及準備資料側欄|
|三頁照片／小問題|home圖真480×640、move圖真960×1280，原HTML均宣告1280×960|資料源記真尺寸，照片contain全幅；瀏覽器驗natural ratio與attrs|
|SPA快速切換／程式風險|showPage留下220ms延遲focus，可能在下一個操作後抵達；不冒稱已重現每種搶焦點|同步focus，新增正常動效下快速切到表單及第一筆輸入回歸|
|已預約／完工後／導引機會|改期與驗收只有terms的規則，主要詢價入口未提供接續說明|原生details連原LINE、電話與terms；只重述既有規則，不新增保障／正式收件|
|鍵盤／小問題|首頁缺main與skip入口|增加唯一main與可見focus的skip link，原鍵盤／手風琴及複製備援門禁保留|

## 資料庫與候選的實際使用

此環境無原UIUX個人安裝。從上列固定中央commit取回search/core/design_system/reasoning及products／ux-guidelines資料，在隔離目錄執行局部查詢；不是宣稱完整工具或hooks已安裝。查詢`home cleaning local service trust --domain product -n 2`得到Home Services、Hyperlocal Services，為一般服務型建議，不能冒稱清潔專業研究。查詢`navigation sticky header focus deep link touch target --domain ux -n 5`命中Touch Target Size、Sticky Navigation、Deep Linking、Smooth Scroll、Keyboard Navigation。沿用品牌與繁中，觸控按本站48px，reduced-motion仍優先，不機械套用平滑捲動或新色票。本次是局部升級，未跑整體design-system或宣稱Lighthouse／60fps。

兩候選讀取固定原碼與MIT，使用同三服務、原價格／說明和既有實拍；目前版保持原文案，候選新增同一組實拍，不拿照片數量當品質分數。未加評論、認證或示範價格。

|對照|來源／實際呈現|取捨|
|---|---|---|
|目前版|產品基準三橫列|精簡、垂直距離短；保留其原事實與handler，不把存在功能當保留結論|
|A|[C1 adamgiebl/new-bird-34](https://github.com/uiverse-io/galaxy/blob/adbd2adde0a299a3956ea288fb444ec01891ca41/Buttons/adamgiebl_new-bird-34.html)的分區CTA，品牌化為實拍橫列／文字標記；移除蓋文字的hover擴張與箭頭|桌機每列約229px，三案末端約897px；手機說明受側欄擠壓。僅隔離比較，未匯入正式產品|
|B|[C2 andrew-demchenk0/hungry-cobra-76](https://github.com/uiverse-io/galaxy/blob/adbd2adde0a299a3956ea288fb444ec01891ca41/Cards/andrew-demchenk0_hungry-cobra-76.html)內容wrapper＋底部action，桌機三卡各320×約466px|三服務可同列比較；移除固定高寬、hover隱藏CTA、位移與投影。手機直排大圖仍增加找入口的捲動，故再修|
|採用版|C2片段改作：桌機維持三卡；窄畫面小圖／標題並排，說明及52px按鈕整列|一般375 iframe實際可用360px時每卡約263px；原文字不截斷，320 iframe亦完整可讀。保留原showService及七服務入口。來源完整通知納公開產物|

已在雲端Chromium實看目前版／A／B桌機與A／B窄版，再看採用版375／320 iframe、桌機裝潢頁；實際鍵盤Enter可進服務細項。桌機iframe標稱1280、實際可用1265px；手機375／320實際可用360／305px，這些不是頂層精確尺寸或真機。原版及兩候選CSS在隔離鏡像固定，沒有比較到被新CSS改掉的假基準；開關及候選HTML不進產品倉庫／正式白名單。沒有另存客戶畫面檔到外部服務。

## 實作邊界與目前驗證

產品仍是原生HTML/CSS/JS；三服務頁仍由service-pages.json單一資料源生成，CI新增重生後git diff必須為空，防止手改產物漂移。保留12個可索引HTML／13 sitemap（含llms）及新竹noindex退出；原身份、價格、承諾、電話／LINE、GA4／Ads、案例前後與私有LINE契約不變。analytics.js與calculator.html未改，不加storage／外部API／送單。

本機基準及修改後validator通過13 HTML／24 JSON-LD；JS語法、diff通過。本機實際prepare-pages-artifact因無rsync而exit127，不能稱本機打包通過；由CI原有實際產物門禁驗。隔離鏡像移除標籤載入，正式追蹤原碼不變。手動裝潢頁→整理已驗服務名、query清空、表單top74.3px大於header56px；裝潢頁→費用已驗選中reno、panel top87.6px大於header72px，無水平溢位。

完整CI新增service context、價格分類／reload／history、四閱讀錨點、真尺寸／contain、入口常見三寬及320／390／840／1280、焦點與正常動效快速接續、字體200%、無JS；原13HTML結構／三引擎12公開頁／七服務／11案例／試算／隱私／剪貼簿延遲與失敗門禁均保留。此處是測試範圍，最終是否通過以本輪PR／Actions為準。

發布必須核對新merge SHA的main/push check與deploy；PR deploy skipped不表示發布。成功後等至少180秒，再正式GET正文、metadata、sitemap／robots、站內連結與主要資產，並比對4HTML、2CSS及發現檔來源。最終證據記本輪PR交付欄，避免補文件另觸發部署。回退採本輪commit revert再走完整門禁。

真機、LINE webview、客服正式收件、GSC／GA4／Ads帳戶及營運成效未驗；整理需求／點擊／部署不等於預約、Google收錄、排名或AI引用增加。本輪未發LINE、寫正式訂單、改DNS／Crawler或處理下一個品牌。
