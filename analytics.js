/* ============================================================
   JMJ tracking config: GA4 + Google Ads conversions

   Fill these IDs when ready:
   - GA4_ID: Google Analytics 4 Measurement ID, e.g. G-XXXXXXXXXX
   - ADS_ID: Google Ads tag ID, e.g. AW-XXXXXXXXXX
   - CONV_*: Google Ads conversion send_to values, e.g. AW-xxxx/label
   - ENHANCED_CONVERSIONS: Set true after Google Ads enhanced conversions
     are enabled and a hashed data implementation is added.

   Until IDs are replaced, this file still records events in dataLayer
   and prints them in the console for QA. No external tracking script loads.
   ============================================================ */
(function () {
  var CFG = {
    GA4_ID: 'G-B9402ZZ7EB',
    ADS_ID: 'AW-XXXXXXXXXX',
    CONV_PHONE: 'AW-XXXXXXXXXX/PhoneLabel',
    CONV_LINE: 'AW-XXXXXXXXXX/LineLabel',
    CONV_FORM: 'AW-XXXXXXXXXX/FormLabel',
    CONV_CALCULATOR: 'AW-XXXXXXXXXX/CalculatorLabel',
    ENHANCED_CONVERSIONS: false
  };

  function isSet(value) {
    return !!value && value.indexOf('XXXX') === -1;
  }

  function cleanText(value) {
    return (value || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  function pageType() {
    var path = location.pathname || '/';
    if (path === '/' || path.endsWith('/index.html')) return 'home';
    if (path.indexOf('calculator') !== -1) return 'calculator';
    if (path.indexOf('taipei') !== -1) return 'area_taipei';
    if (path.indexOf('new-taipei') !== -1) return 'area_new_taipei';
    if (path.indexOf('taoyuan') !== -1) return 'area_taoyuan';
    if (path.indexOf('keelung') !== -1) return 'area_keelung';
    if (path.indexOf('yilan') !== -1) return 'area_yilan';
    return 'content';
  }

  function campaignParams() {
    var keys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'gclid',
      'gbraid',
      'wbraid'
    ];
    var search = new URLSearchParams(location.search || '');
    var stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem('jmj_campaign') || '{}');
    } catch (err) {
      stored = {};
    }
    var current = {};
    keys.forEach(function(key) {
      var value = search.get(key);
      if (value) current[key] = value.slice(0, 160);
    });
    if (Object.keys(current).length) {
      stored = Object.assign({}, stored, current);
      try {
        sessionStorage.setItem('jmj_campaign', JSON.stringify(stored));
      } catch (err) {}
    }
    return stored;
  }

  function baseParams(extra) {
    var params = {
      page_type: pageType(),
      page_path: location.pathname || '/',
      page_title: document.title || '',
      location_area: (location.pathname || '/').replace('/', '').replace('.html', '') || 'home'
    };
    Object.assign(params, campaignParams());
    extra = extra || {};
    Object.keys(extra).forEach(function (key) {
      if (extra[key] !== undefined && extra[key] !== null && extra[key] !== '') {
        params[key] = extra[key];
      }
    });
    return params;
  }

  var gaOn = isSet(CFG.GA4_ID);
  var adsOn = isSet(CFG.ADS_ID);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  if (gaOn || adsOn) {
    var primaryId = gaOn ? CFG.GA4_ID : CFG.ADS_ID;
    var hasGtagScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (!hasGtagScript) {
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(primaryId);
      document.head.appendChild(script);
    }

    if (!window.__JMJ_GTAG_STARTED) {
      gtag('js', new Date());
      window.__JMJ_GTAG_STARTED = true;
    }
    if (gaOn && !window.__JMJ_GA4_CONFIGURED) {
      gtag('config', CFG.GA4_ID, {
        page_title: document.title,
        page_path: location.pathname + location.search
      });
      window.__JMJ_GA4_CONFIGURED = true;
    }
    if (adsOn) {
      gtag('config', CFG.ADS_ID);
    }
  } else {
    console.info('[JMJ tracking] GA4/Ads IDs are not set. Events are kept in dataLayer only.');
  }

  function sendAdsConversion(sendTo, params) {
    if (!adsOn || !isSet(sendTo)) return;
    gtag('event', 'conversion', Object.assign({ send_to: sendTo }, params || {}));
  }

  function track(eventName, params, conversionId) {
    var payload = baseParams(params);
    gtag('event', eventName, payload);
    window.dataLayer.push({
      event: 'jmj_' + eventName,
      jmj_event: eventName,
      jmj_params: payload
    });
    sendAdsConversion(conversionId, payload);
    if (!gaOn && !adsOn) {
      console.info('[JMJ tracking event]', eventName, payload);
    }
  }

  window.jmjTrack = {
    phone: function (params) {
      track('phone_click', Object.assign({ contact_method: 'phone' }, params || {}), CFG.CONV_PHONE);
    },
    line: function (params) {
      track('line_click', Object.assign({ contact_method: 'line' }, params || {}), CFG.CONV_LINE);
    },
    form: function (params) {
      track('booking_form_submit', Object.assign({ contact_method: 'line' }, params || {}), CFG.CONV_FORM);
    },
    calc: function (params) {
      track('calculator_used', Object.assign({ engagement_type: 'pricing_calculator' }, params || {}), CFG.CONV_CALCULATOR);
    },
    event: function (eventName, params) {
      track(eventName, params || {});
    }
  };

  document.addEventListener('click', function (event) {
    var anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor) return;

    var href = anchor.getAttribute('href') || '';
    var params = {
      link_text: cleanText(anchor.textContent),
      link_url: href,
      cta_class: anchor.className ? String(anchor.className).slice(0, 80) : ''
    };

    if (href.indexOf('tel:') === 0) {
      window.jmjTrack.phone(params);
    } else if (href.indexOf('line.me') !== -1 || href.indexOf('line://') === 0) {
      window.jmjTrack.line(params);
    } else if (href.indexOf('maps.app.goo.gl') !== -1 || href.indexOf('google.com/maps') !== -1) {
      window.jmjTrack.event('map_click', params);
    } else if (href.indexOf('facebook.com') !== -1) {
      window.jmjTrack.event('facebook_click', params);
    }
  }, true);
})();
