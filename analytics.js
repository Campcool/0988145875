/* ============================================================
   潔美淨清潔社 — 統一追蹤設定 (Google Analytics 4 + Google Ads)
   ------------------------------------------------------------
   ★ 上線前：只要把下面 5 個 ID 換成你的真實 ID，其餘都不用改。
   ★ 取得方式：
       GA4_ID     → analytics.google.com → 管理 → 資料串流 → 「G-」開頭那串
       ADS_ID     → ads.google.com → 工具與設定 → 轉換 → 「AW-」開頭那串
       CONV_PHONE → 「電話點擊」轉換動作的「AW-xxxx/標籤」字串
       CONV_LINE  → 「LINE 點擊」轉換動作的「AW-xxxx/標籤」字串
       CONV_FORM  → 「表單送出」轉換動作的「AW-xxxx/標籤」字串
   ★ ID 還沒填（含 XXXX）時，不會載入任何追蹤，網站照常運作、不會報錯。
   ★ 電話與 LINE 連結的點擊「自動」被追蹤，不必逐一修改頁面連結。
   ============================================================ */
(function () {
  var CFG = {
    GA4_ID:     'G-XXXXXXXXXX',
    ADS_ID:     'AW-XXXXXXXXXX',
    CONV_PHONE: 'AW-XXXXXXXXXX/PhoneLabel',
    CONV_LINE:  'AW-XXXXXXXXXX/LineLabel',
    CONV_FORM:  'AW-XXXXXXXXXX/FormLabel'
  };

  function isSet(v) { return !!v && v.indexOf('XXXX') === -1; }
  var gaOn  = isSet(CFG.GA4_ID);
  var adsOn = isSet(CFG.ADS_ID);

  // gtag 基礎：即使遠端未載入，呼叫也不會出錯
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };

  if (gaOn || adsOn) {
    var primaryId = gaOn ? CFG.GA4_ID : CFG.ADS_ID;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + primaryId;
    document.head.appendChild(s);
    gtag('js', new Date());
    if (gaOn)  gtag('config', CFG.GA4_ID);
    if (adsOn) gtag('config', CFG.ADS_ID);
  } else {
    console.info('[潔美淨追蹤] 尚未設定 GA4／Ads ID，追蹤暫未啟用。在 analytics.js 填入 ID 即可生效。');
  }

  // 送出事件：GA4 自訂事件 +（若已設定）Google Ads 轉換
  function track(eventName, convId, label) {
    gtag('event', eventName, { event_category: 'contact', event_label: label || '' });
    if (adsOn && isSet(convId)) {
      gtag('event', 'conversion', { send_to: convId });
    }
  }

  // 對外開放：供預約表單、計算機等主動呼叫
  window.jmjTrack = {
    phone: function () { track('phone_click', CFG.CONV_PHONE, 'tel'); },
    line:  function () { track('line_click',  CFG.CONV_LINE,  'line'); },
    form:  function () { track('form_submit', CFG.CONV_FORM,  'booking'); },
    calc:  function () { gtag('event', 'calculator_used', { event_category: 'engagement' }); }
  };

  // 事件委派：自動為所有電話／LINE 連結掛上轉換，毋須逐一修改連結
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      window.jmjTrack.phone();
    } else if (href.indexOf('line.me') !== -1 || href.indexOf('line://') === 0) {
      window.jmjTrack.line();
    }
  }, true);
})();
