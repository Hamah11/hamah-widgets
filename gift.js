/*! أهدِ من تحب — جمعية هامة (hamh.sa) — gift.js */
(function () {
  'use strict';
  if (window.__hmGift) return;
  window.__hmGift = 1;

  /* ======================= الإعدادات ======================= */

  var API = 'https://script.google.com/macros/s/AKfycbzhRIwPgUiUCsJ8GKARvrwhZsgpiL1jJTQjaSmbvhXpAegqRCA94CjUycXZci1uI61c/exec';
  var SITE = 'https://hamh.sa';
  var ORG = 'جمعية هامة';
  var ORG_FULL = 'جمعية هامة لخدمة الحجاج والمعتمرين';
  var FIELD = 'بمكة المكرمة';
  var INVITE = 'شارك في خدمة ضيوف الرحمن';
  var C1 = '#126762', C2 = '#c9aa77', C2D = '#A8864A', SEL = '#DFF3E6', GOLD_D = '#F2D58A', GOLD_L = '#8A6D0B';
  var FONT = 'Almarai,Tajawal,Tahoma,Arial,sans-serif';
  var KEEP_MS = 48 * 3600 * 1000;
  var ORD_MS = 7 * 24 * 3600 * 1000;
  var DONE_MS = 90 * 24 * 3600 * 1000;

  // الرابط المختصر ← الاسم على البطاقة (نفس القائمة في السكربت)
  var PROJECTS = {
    'umrah': 'كفالة معتمر',
    'mushaf': 'ورّث مصحفاً',
    'umrah-badal-share': 'عمرة البدل',
    'iftar-haram': 'فطّر صائماً بالحرم',
    'three-goods': 'ثلاثية الإحسان',
    'water-pilgrims': 'اسقِ ضيوف الرحمن',
    'water-cooler': 'برّادة الجمعة',
    'wheelchair': 'توفير عربة'
  };

  // حقول زد الإجبارية في بعض الفرص: تُملأ من النافذة قبل الإضافة للسلة
  var EXTRA = {
    'umrah-badal-share': {
      title: 'بيانات عمرة البدل',
      name: {field: 'اسم المعتمر عنه', label: 'اسم المعتمر عنه', ph: 'مثال: محمد'},
      sex: {field: 'الجنس', label: 'الجنس', m: 'ذكر', f: 'أنثى'}
    }
  };

  var GROUPS = ['أفراح', 'مواسم', 'دعاء وصدقة'];

  // التصاميم — نفس الترتيب في السكربت
  var DS = [
    {k: 'general', l: 'عام'}, {k: 'boy', l: 'مولود'}, {k: 'wedding', l: 'زواج'}, {k: 'grad', l: 'تخرّج'},
    {k: 'home', l: 'منزل'}, {k: 'quran', l: 'مصحف'}, {k: 'ramadan', l: 'رمضان'}, {k: 'eid', l: 'عيد'},
    {k: 'hajj', l: 'حج'}, {k: 'calm', l: 'هادئ'}, {k: 'heal', l: 'شفاء'}, {k: 'girl', l: 'مولودة'},
    {k: 'thanks', l: 'شكر'}, {k: 'parents', l: 'والدان'}
  ];

  // المناسبات — نفس الترتيب في السكربت. الجديد يُضاف في الآخر فقط.
  var OCC = [
    {g: 0, e: '🎁', l: 'إهداء عام', d: 0,
      m: 'جعله الله في ميزان حسناتك', f: 'جعله الله في ميزان حسناتكِ',
      w: 'من قلبي أهديك صدقة في خدمة ضيوف الرحمن.. عسى فرحتها توصلك اليوم، وأجرها يدوم لك كل يوم.'},
    {g: 0, e: '👶', l: 'مولود جديد', d: 1,
      m: 'بارك الله لكم في ما وهبكم، وجعله قرة عين لكم',
      w: 'يا مرحبا باللي زادكم فرح.. حبّينا نشارككم فرحة قدومه بصدقة في خدمة ضيوف الرحمن بمكة. جعله الله قرّة عين لكم.'},
    {g: 0, e: '💍', l: 'زواج', d: 2,
      m: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير',
      w: 'يا عسى عمركم كله أفراح.. ومع أول أيامكم سوا، حبّينا نشارككم الفرحة بصدقة عنكم في خدمة ضيوف الرحمن.'},
    {g: 0, e: '🎓', l: 'تخرّج', d: 3,
      m: 'مبارك تخرّجك، وجعل الله علمك نافعاً', f: 'مبارك تخرّجكِ، وجعل الله علمكِ نافعاً',
      w: 'تعب السنين صار فرحة تخرّج.. ومن فرحتي فيك اخترت لك هدية يبقى أجرها، صدقة عنك في خدمة ضيوف الرحمن بمكة.'},
    {g: 0, e: '⭐', l: 'نجاح وتفوّق', d: 3,
      m: 'مبارك نجاحك، وزادك الله توفيقاً', f: 'مبارك نجاحكِ، وزادكِ الله توفيقاً',
      w: 'فرحت لك من قلبي يوم سمعت بنجاحك، وحبّيت أبارك لك على تفوّقك بصدقة في خدمة ضيوف الرحمن.'},
    {g: 0, e: '💼', l: 'وظيفة أو ترقية', d: 12,
      m: 'وفّقك الله، وبارك لك في رزقك', f: 'وفّقكِ الله، وبارك لكِ في رزقكِ',
      w: 'مبارك لك هالخطوة، وعسى الله يفتح لك فيها أبواب الرزق. ومن فرحتي بهالبشارة أهديتك صدقة في خدمة ضيوف الرحمن.'},
    {g: 0, e: '🏠', l: 'منزل جديد', d: 4,
      m: 'بارك الله لك في دارك، وجعلها عامرة بذكره', f: 'بارك الله لكِ في داركِ، وجعلها عامرة بذكره',
      w: 'الله يعمّر بيتكم بالأُنس وراحة البال.. ولأنها فرحة دار جديدة، اخترت هديّتكم صدقة في خدمة ضيوف الرحمن بمكة.'},
    {g: 0, e: '📖', l: 'ختم القرآن', d: 5,
      m: 'جعل الله القرآن ربيع قلبك ونور صدرك', f: 'جعل الله القرآن ربيع قلبكِ ونور صدركِ',
      w: 'يا زينها من فرحة يوم ختمت القرآن.. حبّيت أشاركك فرحة الختم بصدقة عنك في خدمة ضيوف الرحمن. جعل الله القرآن نور قلبك.'},
    {g: 0, e: '🌷', l: 'شكر وتقدير', d: 12,
      m: 'جزاك الله خيراً، وشكر لك فضلك', f: 'جزاكِ الله خيراً، وشكر لكِ فضلكِ',
      w: 'لك في قلبي دعوة مع كل ما أذكر جميلك، واليوم ضمّيت لدعائي صدقة عنك في خدمة ضيوف الرحمن.'},
    {g: 1, e: '🌙', l: 'رمضان', d: 6,
      m: 'مبارك عليك الشهر، وتقبّل الله منك الصيام والقيام', f: 'مبارك عليكِ الشهر، وتقبّل الله منكِ الصيام والقيام',
      w: 'مبارك عليك الشهر.. حبّيت أبارك لك بصدقة في خدمة ضيوف الرحمن بمكة.'},
    {g: 1, e: '🎉', l: 'عيد الفطر', d: 7,
      m: 'تقبّل الله منا ومنكم، وعيدكم مبارك',
      w: 'عيدك مبارك.. وعيديّتك هالسنة صدقة في خدمة ضيوف الرحمن بمكة. عسى الله يعيده عليك بالفرح والقبول.'},
    {g: 1, e: '🐑', l: 'عيد الأضحى', d: 7,
      m: 'تقبّل الله منا ومنكم، وكل عام وأنتم بخير',
      w: 'عساك من عوّاده.. ومع تكبيرات العيد، أهديك منّي صدقة في خدمة ضيوف الرحمن. كل عام وأنت بخير.'},
    {g: 1, e: '🕋', l: 'عشر ذي الحجة', d: 8,
      m: 'تقبّل الله منك في خير أيام الدنيا', f: 'تقبّل الله منكِ في خير أيام الدنيا',
      w: 'في هالعشر المباركة وضيوف الرحمن في مكة، حبّيت يكون لك نصيب من صدقتي في خدمتهم. عسى الله يكتب لك أجرها ويتقبّل منّا ومنك.'},
    {g: 1, e: '🕋', l: 'حج أو عمرة', d: 8,
      m: 'تقبّل الله طاعتك، وجعل سعيك مشكوراً وذنبك مغفوراً', f: 'تقبّل الله طاعتكِ، وجعل سعيكِ مشكوراً وذنبكِ مغفوراً',
      w: 'الحمد لله اللي بلّغك بيته وأتمّ لك نُسكك.. وفرحاً بتمامه أهديتك صدقة في خدمة ضيوف الرحمن مثلك. تقبّل الله منك.'},
    {g: 2, e: '🤲', l: 'برّ الوالدين', s: 'لوالديّ', d: 13,
      m: 'برّاً بك، وجزاك الله عني خير الجزاء', f: 'برّاً بكِ، وجزاكِ الله عني خير الجزاء',
      w: 'أبي، منك تعلّمت العطاء، ومن أجمل ما أهديك صدقة عنك في خدمة ضيوف الرحمن. جزاك الله عنّي كل خير.',
      wf: 'أمي، عمري وأنا أفرح بدعواتك، واليوم أهديك مع دعائي صدقة عنك في خدمة ضيوف الرحمن.'},
    {g: 2, e: '🕊️', l: 'صدقة عن متوفى', d: 9, dead: 1,
      m: 'رحمه الله، وجعلها في ميزان حسناته', f: 'رحمها الله، وجعلها في ميزان حسناتها',
      w: 'غاليكم غالٍ علينا.. وهذي صدقة عنه في خدمة ضيوف الرحمن بمكة، الله يرحمه.',
      wf: 'غاليتكم غالية علينا.. وهذي صدقة عنها في خدمة ضيوف الرحمن بمكة، الله يرحمها.'},
    {g: 2, e: '💚', l: 'دعاء لمريض بالشفاء', s: 'دعاء بالشفاء', d: 10,
      m: 'نسأل الله أن يشفيك شفاءً لا يغادر سقماً', f: 'نسأل الله أن يشفيكِ شفاءً لا يغادر سقماً',
      w: 'طهور إن شاء الله.. تصدّقت عنك في خدمة ضيوف الرحمن، وعسى الله يلبسك ثوب العافية ويقرّ عيوننا بشوفتك بخير.'},
    {g: 0, e: '🌿', l: 'الحمد لله على السلامة', d: 10,
      m: 'الحمد لله على سلامتك، وألبسك الله ثوب الصحة والعافية', f: 'الحمد لله على سلامتكِ، وألبسكِ الله ثوب الصحة والعافية',
      w: 'الحمد لله على سلامتك.. يوم تطمّنت عليك تصدّقت عنك شكراً لله في خدمة ضيوف الرحمن. عسى أيامك كلها صحة وعافية.'}
  ];

  var TOP6 = [0, 14, 15, 16, 9, 3];
  var NS = [5.03, 6.18, 7.09];   // حجم الاسم في المعاينة بوحدة cqw (= 44 و54 و62 من 874)

  var ICON = '<svg class="hmg-ic" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
    '<rect x="5" y="14" width="22" height="14" rx="2.2" fill="#c9aa77"/>' +
    '<rect x="3" y="9" width="26" height="6" rx="1.8" fill="#A8864A"/>' +
    '<rect x="14" y="9" width="4" height="19" fill="#126762"/>' +
    '<path d="M16 9C13.6 4.6 8.6 3.4 7.6 5.8 6.6 8.2 10.4 9 16 9ZM16 9C18.4 4.6 23.4 3.4 24.4 5.8 25.4 8.2 21.6 9 16 9Z" fill="none" stroke="#126762" stroke-width="2" stroke-linejoin="round"/>' +
    '</svg>';

  var ERR = {
    not_paid: 'لم يتأكد الدفع بعد. انتظر دقيقة ثم أعد المحاولة.',
    not_found: 'لم نجد التبرع. تأكد من الرابط، أو انتظر دقيقة ثم أعد المحاولة.',
    wrong_project: 'هذا التبرع ليس للمشروع المختار. اختر المشروع الصحيح.',
    max: 'أصدرت بطاقتين لهذا التبرع، وهو الحد الأعلى.',
    busy: 'البطاقة قيد التجهيز. انتظر دقيقة ثم أعد المحاولة.',
    locked: 'محاولات كثيرة. حاول بعد ساعة.',
    review: 'لم نتمكن من إصدار البطاقة بهذا الاسم. اكتب الاسم بطريقة أخرى، أو تواصل مع الجمعية.',
    paused: 'الإهداء متوقف مؤقتاً. حاول لاحقاً.',
    bad_name: 'الأسماء حروف فقط، حتى 25 حرفاً.',
    bad_order: 'رابط التبرع غير صحيح.',
    unavailable: 'هذه البطاقة غير متاحة.',
    bad_code: 'هذه البطاقة غير متاحة.',
    net: 'تعذّر الاتصال. تأكد من الإنترنت ثم أعد المحاولة.',
    other: 'حدث خطأ. أعد المحاولة بعد قليل.'
  };

  var ORDER_LINK_RX = /\/(?:order-completed|orders|o)\/([A-Za-z0-9]{6,24})\/inv(?:oice)?(?:[\/?#]|$)/;
  var THANK_PATH_RX = /^\/(?:order-completed|orders|o)\/([A-Za-z0-9]{6,24})\/inv(?:oice)?\/?$/;
  var FEM_RX = /^(?:أم|ام|الوالدة|والدة|ماما|يمه|والدتي|أمي|امي|زوجتي|أختي|اختي|ابنتي|بنتي|جدتي|خالتي|عمتي)(?: |$)/;

  /* أصل الصور: نفس مجلد gift.js (نفس الـcommit) */
  var IMG = (function () {
    var s = document.currentScript && document.currentScript.src;
    if (!s) {
      var all = document.getElementsByTagName('script');
      for (var i = all.length - 1; i >= 0; i--) {
        if (/gift\.js(\?|$)/.test(all[i].src || '')) { s = all[i].src; break; }
      }
    }
    s = String(s || '').split('?')[0].replace(/gift\.js$/, '');
    return s + 'img/gift/';
  })();

  /* ======================= أدوات صغيرة ======================= */

  function h(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined && txt !== null) e.textContent = txt;
    return e;
  }
  function btn(cls, txt, fn) {
    var b = h('button', cls, txt);
    b.type = 'button';
    if (fn) b.addEventListener('click', fn);
    return b;
  }
  function add(p) { for (var i = 1; i < arguments.length; i++) if (arguments[i]) p.appendChild(arguments[i]); return p; }

  function toEn(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); })
      .replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); });
  }

  // يحذف التشكيل والتطويل وكل ما ليس حروفاً، ويوحّد المسافات، 25 حرفاً
  function cleanName(s) {
    s = String(s || '').replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '');
    s = s.replace(/[^ء-غف-يa-zA-Z ]+/g, ' ').replace(/\s+/g, ' ').replace(/^ /, '');
    return s.substr(0, 25).replace(/ $/, '');
  }
  function autoNs(name) {
    var n = cleanName(name).length;
    return n <= 9 ? 2 : (n <= 16 ? 1 : 0);
  }
  function hasFem(o) { var x = OCC[o]; return !!(x && (x.f || x.wf)); }
  function short(o) { return OCC[o].s || OCC[o].l; }
  function pretty(code) { code = String(code || ''); return code.substr(0, 4) + '-' + code.substr(4); }
  function isMobile() {
    var ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform || ''));
  }
  function norm(s) {
    return String(s || '').replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
  }

  function lsGet(k, maxAge) {
    try {
      var v = JSON.parse(localStorage.getItem(k) || 'null');
      if (!v || typeof v !== 'object') return null;
      if (maxAge && (!v.ts || Date.now() - v.ts > maxAge)) { localStorage.removeItem(k); return null; }
      return v;
    } catch (e) { return null; }
  }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* التخزين ممتلئ أو ممنوع */ } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* لا شيء */ } }

  function dev() {
    var v = '';
    try { v = localStorage.getItem('hm_dev') || ''; } catch (e) { v = ''; }
    if (!/^[a-z0-9]{16}$/.test(v)) {
      v = '';
      var ch = 'abcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 16; i++) v += ch.charAt(Math.floor(Math.random() * ch.length));
      try { localStorage.setItem('hm_dev', v); } catch (e2) { /* لا شيء */ }
    }
    return v;
  }

  // أي اختيار محفوظ خارج حدود القوائم يرجع للافتراضي
  function fixState(s) {
    s = (s && typeof s === 'object') ? s : {};
    var o = {};
    o.p = PROJECTS.hasOwnProperty(s.p) ? s.p : '';
    o.o = (s.o === +s.o && s.o >= 0 && s.o < OCC.length && s.o % 1 === 0) ? s.o : 0;
    o.oSet = !!s.oSet;
    o.d = (s.d === +s.d && s.d >= 0 && s.d < DS.length && s.d % 1 === 0) ? s.d : OCC[o.o].d;
    o.dSet = !!s.dSet;
    o.th = s.th === 1 ? 1 : 0;
    o.femSet = !!s.femSet;
    o.fem = !!s.fem && hasFem(o.o);
    o.anon = !!s.anon;
    o.to = cleanName(s.to);
    o.from = cleanName(s.from);
    o.ns = autoNs(o.to);
    o.amt = (+s.amt > 0) ? Math.floor(+s.amt) : 0;
    o.amtSet = !!s.amtSet;
    o.custom = !!s.custom;
    var ex = (s.ex && typeof s.ex === 'object') ? s.ex : {};
    o.ex = {name: String(ex.name || '').replace(/\s+/g, ' ').substr(0, 40), sex: (ex.sex === 'm' || ex.sex === 'f') ? ex.sex : ''};
    return o;
  }
  function isFull(st) {
    return !!(st && st.p && st.oSet && st.to.length >= 2 && (st.anon || st.from.length >= 2));
  }
  function saveState(st) {
    st.ns = autoNs(st.to);
    var c = fixState(st);
    c.ts = Date.now();
    lsSet('hm_gift', c);
  }
  function loadSaved() {
    var v = lsGet('hm_gift', KEEP_MS);
    return v ? fixState(v) : null;
  }
  function doneFor(order) {
    if (!order) return null;
    var d = lsGet('hm_gift_done', DONE_MS);
    if (!d || d.o !== order || !Array.isArray(d.c)) return null;
    d.t = d.t || {};
    d.x = d.x || {};
    return d;
  }

  /* ======================= الاتصال ======================= */

  // بلا ترويسة Content-Type حتى لا يرسل المتصفح طلب فحص مسبق
  function post(body) {
    var ctl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 60000);
    var opt = {method: 'POST', body: JSON.stringify(body)};
    if (ctl) opt.signal = ctl.signal;
    return fetch(API, opt).then(function (r) { return r.json(); }).then(function (j) {
      clearTimeout(t);
      return (j && typeof j === 'object') ? j : {ok: false, error: 'other'};
    }, function () {
      clearTimeout(t);
      return {ok: false, error: 'net'};
    });
  }

  var evSent = {};
  function ev(e) {
    if (evSent[e]) return;
    evSent[e] = 1;
    try { post({a: 'ev', e: e, dev: dev()}); } catch (x) { /* العدّ ليس ضرورياً */ }
  }

  function errText(e) { return ERR[e] || ERR.other; }

  /* ======================= التنسيق ======================= */

  var cssDone = false;
  function css() {
    if (cssDone) return;
    cssDone = true;
    var I = ' !important';
    var r = [
      // إخفاء إهداء زد الجاهز (قرار الجمعية)
      'a[id^="btnVisibleGiftForm-"],#gift_card_preview_modal{display:none' + I + '}',
      'html.hmg-lock,html.hmg-lock body{overflow:hidden' + I + '}',
      // زر صفحة المشروع
      '.hmg-row{flex-wrap:wrap' + I + ';gap:8px' + I + '}',
      '.hmg-pbtn,.hmg-clink{order:4;display:inline-flex' + I + ';align-items:center' + I + ';justify-content:center' + I + ';gap:6px' + I +
        ';direction:rtl' + I + ';background:#fff' + I + ';color:' + C1 + I + ';border:1.5px solid ' + C1 + I +
        ';padding:4px 16px' + I + ';text-decoration:none' + I + ';font-family:' + FONT + I + ';white-space:nowrap' + I +
        ';box-sizing:border-box' + I + ';cursor:pointer;line-height:1.2' + I + ';margin:0' + I + '}',
      '.hmg-pbtn{animation:hmg-glow 2.6s ease-in-out infinite}',
      '.hmg-pbtn .hmg-ic{width:30px;height:30px;flex:0 0 30px}',
      '.hmg-clink .hmg-ic{width:28px;height:28px;flex:0 0 28px}',
      '.hmg-ic{display:block;transform-origin:50% 80%;animation:hmg-hop 2.6s ease-in-out infinite}',
      '.hmg-clink{display:flex' + I + ';margin:8px auto 0' + I + ';max-width:100%' + I + '}',
      '.hmg-clink:hover,.hmg-clink:focus{box-shadow:0 0 0 4px rgba(18,103,98,.16)' + I + '}',
      '.hmg-pulse4{animation:hmg-pulse .8s ease-in-out 5' + I + '}',
      '@media (max-width:767px){.hmg-pbtn{flex:1 1 100%' + I + ';width:100%' + I + '}}',
      '@keyframes hmg-glow{0%,100%{box-shadow:0 0 0 0 rgba(18,103,98,.0)}50%{box-shadow:0 0 0 4px rgba(18,103,98,.18)}}',
      '@keyframes hmg-pulse{0%,100%{box-shadow:0 0 0 0 rgba(201,170,119,0);transform:none}50%{box-shadow:0 0 0 7px rgba(201,170,119,.45);transform:scale(1.03)}}',
      '@keyframes hmg-hop{0%,58%,100%{transform:none}66%{transform:translateY(-8%) scale(1.14) rotate(-9deg)}74%{transform:translateY(-8%) scale(1.14) rotate(8deg)}82%{transform:translateY(-4%) scale(1.07) rotate(-5deg)}90%{transform:rotate(2deg)}}',
      // النافذة
      '.hmg-ov{position:fixed' + I + ';inset:0' + I + ';z-index:2147483000' + I + ';background:rgba(15,25,24,.5)' + I +
        ';display:flex' + I + ';align-items:flex-end' + I + ';justify-content:center' + I + ';direction:rtl' + I + ';font-family:' + FONT + I + '}',
      '.hmg-ov *{box-sizing:border-box' + I + ';font-family:inherit;letter-spacing:0' + I + '}',
      '.hmg-sheet{background:#fff;width:100%;max-height:92vh;max-height:92dvh;border-radius:22px 22px 0 0;display:flex;flex-direction:column;' +
        'overflow:hidden;box-shadow:0 -10px 40px rgba(0,0,0,.18);animation:hmg-up .24s ease-out;color:#1C2226;text-align:right}',
      '@media (min-width:768px){.hmg-ov{align-items:center' + I + '}.hmg-sheet{width:460px;max-height:88vh;border-radius:18px;animation:hmg-in .2s ease-out}}',
      '@keyframes hmg-up{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}',
      '@keyframes hmg-in{from{transform:scale(.97);opacity:.4}to{transform:none;opacity:1}}',
      '.hmg-head{display:flex;align-items:center;gap:8px;padding:12px 12px 6px;flex:0 0 auto}',
      '.hmg-title{flex:1;text-align:center;font-weight:700;font-size:17px;color:' + C1 + '}',
      '.hmg-ov .hmg-back,.hmg-ov .hmg-x{width:40px' + I + ';height:40px' + I + ';border-radius:12px' + I + ';border:0' + I + ';background:#F2F5F4' + I +
        ';color:#33403D' + I + ';font-size:22px' + I + ';line-height:40px' + I + ';padding:0' + I + ';margin:0' + I + ';cursor:pointer;flex:0 0 40px;text-align:center' + I + '}',
      '.hmg-prog{display:flex;align-items:center;justify-content:center;gap:6px;padding:0 16px 8px;font-size:12px;color:#6B7672;flex:0 0 auto}',
      '.hmg-prog i{display:block;width:26px;height:4px;border-radius:4px;background:#E3E8E6}',
      '.hmg-prog i.on{background:' + C1 + '}',
      '.hmg-prog span{margin-right:6px}',
      '.hmg-body{overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1 1 auto;padding:4px 16px 0;position:relative;overscroll-behavior:contain}',
      '.hmg-q{font-size:20px;font-weight:800;color:#1C2226;margin:6px 0 12px;text-align:center;line-height:1.5}',
      '.hmg-lbl{display:block;font-size:14px;font-weight:700;color:#33403D;margin:12px 0 6px}',
      '.hmg-small{font-size:12.5px;color:#6B7672;line-height:1.7;margin:6px 0}',
      '.hmg-center{text-align:center}',
      '.hmg-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.hmg-ov .hmg-tile{min-height:86px' + I + ';border-radius:12px' + I + ';border:1.5px solid #E1E7E5' + I + ';background:#fff' + I +
        ';color:#1C2226' + I + ';display:flex' + I + ';flex-direction:column' + I + ';align-items:center' + I + ';justify-content:center' + I +
        ';gap:6px' + I + ';padding:10px 6px' + I + ';cursor:pointer;font-size:15px' + I + ';font-weight:700' + I + ';margin:0' + I + ';line-height:1.35' + I + ';text-align:center' + I + '}',
      '.hmg-ov .hmg-tile.on{border-color:' + C1 + I + ';background:' + SEL + I + '}',
      '.hmg-te{font-size:28px;line-height:1}',
      '.hmg-ov .hmg-link{background:none' + I + ';border:0' + I + ';color:' + C1 + I + ';font-size:14.5px' + I + ';font-weight:700' + I +
        ';padding:10px 4px' + I + ';margin:4px auto' + I + ';display:block' + I + ';cursor:pointer;text-decoration:underline' + I + ';text-underline-offset:4px;text-align:center' + I + ';box-shadow:none' + I + ';height:auto' + I + '}',
      '.hmg-ov .hmg-in,.hmg-ov .hmg-sel,.hmg-ov .hmg-ta{width:100%' + I + ';height:50px' + I + ';border-radius:12px' + I + ';border:1.5px solid #D5DDDA' + I +
        ';background:#fff' + I + ';color:#1C2226' + I + ';font-size:16px' + I + ';padding:0 14px' + I + ';margin:0' + I + ';outline:none' + I + ';box-shadow:none' + I + ';direction:rtl;text-align:right}',
      '.hmg-ov .hmg-ta{height:120px' + I + ';padding:10px 14px' + I + ';line-height:1.7' + I + ';resize:vertical}',
      '.hmg-ov .hmg-in:focus,.hmg-ov .hmg-sel:focus,.hmg-ov .hmg-ta:focus{border-color:' + C1 + I + ';box-shadow:0 0 0 3px rgba(18,103,98,.14)' + I + '}',
      '.hmg-ov .hmg-in:disabled{background:#F2F5F4' + I + ';color:#9AA5A1' + I + '}',
      '.hmg-ov .hmg-ltr{direction:ltr' + I + ';text-align:left' + I + '}',
      '.hmg-two{display:flex;gap:10px}',
      '.hmg-ov .hmg-opt{flex:1;height:48px' + I + ';border-radius:12px' + I + ';border:1.5px solid #E1E7E5' + I + ';background:#fff' + I +
        ';color:#1C2226' + I + ';font-size:15px' + I + ';font-weight:700' + I + ';cursor:pointer;margin:0' + I + ';padding:0 8px' + I + '}',
      '.hmg-ov .hmg-opt.on{border-color:' + C1 + I + ';background:' + SEL + I + ';color:' + C1 + I + '}',
      '.hmg-ov .hmg-amt{height:52px' + I + '}',
      '.hmg-amtv{display:block;font-size:12px;font-weight:400;color:#6B7672;margin-top:2px}',
      '.hmg-full{grid-column:1 / -1}',
      '.hmg-chk{display:flex;align-items:center;gap:10px;margin:12px 0 4px;font-size:14.5px;cursor:pointer;color:#33403D}',
      '.hmg-ov .hmg-chk input{width:20px' + I + ';height:20px' + I + ';margin:0' + I + ';accent-color:' + C1 + ';flex:0 0 20px;appearance:auto' + I + ';-webkit-appearance:checkbox' + I + ';opacity:1' + I + ';position:static' + I + '}',
      '.hmg-box{border:1.5px solid ' + C2 + ';background:#FBF6EC;border-radius:12px;padding:4px 12px 12px;margin:14px 0 4px}',
      '.hmg-box .hmg-lbl:first-child{color:' + C2D + '}',
      // الزر الملتصق بالأسفل
      '.hmg-bar{position:sticky;bottom:0;margin:14px -16px 0;padding:18px 16px calc(12px + env(safe-area-inset-bottom));' +
        'background:linear-gradient(to bottom,rgba(255,255,255,0),#fff 18px,#fff)}',
      '.hmg-ov .hmg-pri{width:100%' + I + ';height:54px' + I + ';border-radius:14px' + I + ';border:0' + I + ';background:' + C1 + I +
        ';color:#fff' + I + ';font-size:17px' + I + ';font-weight:800' + I + ';cursor:pointer;margin:0' + I + ';padding:0 12px' + I +
        ';display:flex' + I + ';align-items:center' + I + ';justify-content:center' + I + ';gap:8px' + I + ';text-decoration:none' + I + ';box-shadow:none' + I + ';line-height:1.2' + I + '}',
      '.hmg-ov .hmg-pri:disabled{opacity:.7' + I + ';cursor:default}',
      '.hmg-ov .hmg-wa{background:#1FA855' + I + '}',
      '.hmg-ov .hmg-sec{width:100%' + I + ';height:50px' + I + ';border-radius:14px' + I + ';border:1.5px solid ' + C1 + I + ';background:#fff' + I +
        ';color:' + C1 + I + ';font-size:16px' + I + ';font-weight:700' + I + ';cursor:pointer;margin:8px 0 0' + I + ';padding:0 12px' + I +
        ';display:flex' + I + ';align-items:center' + I + ';justify-content:center' + I + ';text-decoration:none' + I + '}',
      '.hmg-err{color:#B3261E;font-size:14px;font-weight:700;line-height:1.6;text-align:center;min-height:0}',
      '.hmg-err:not(:empty){margin-top:8px}',
      '.hmg-lock-line{font-size:12px;color:#6B7672;text-align:center;margin-top:8px}',
      // المعاينة
      '.hmg-card{position:relative;width:100%;aspect-ratio:1748/1240;container-type:inline-size;border-radius:10px;overflow:hidden;' +
        'background:#0F4F4B center/cover no-repeat;box-shadow:0 4px 18px rgba(0,0,0,.14);--u:calc(100cqw / 874);direction:rtl}',
      '.hmg-card *{position:absolute}',
      '.hmg-card .hmg-t{display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-line;margin:0}',
      '.hmg-pv78{width:78%;margin:0 auto}',
      '.hmg-rib{position:absolute;top:0;left:0;right:0;text-align:center;font-size:2.6cqw;font-weight:700;color:#fff;background:rgba(0,0,0,.38);padding:.8cqw 0;letter-spacing:0;z-index:2}',
      '.hmg-designs{display:flex;gap:8px;overflow-x:auto;padding:8px 2px;-webkit-overflow-scrolling:touch}',
      '.hmg-ov .hmg-dz{flex:0 0 92px;border:2px solid transparent' + I + ';border-radius:10px' + I + ';padding:3px' + I + ';background:#fff' + I +
        ';cursor:pointer;margin:0' + I + ';display:flex' + I + ';flex-direction:column' + I + ';align-items:center' + I + ';gap:3px' + I + ';font-size:12px' + I + ';color:#33403D' + I + ';height:auto' + I + '}',
      '.hmg-ov .hmg-dz.on{border-color:' + C1 + I + ';background:' + SEL + I + '}',
      '.hmg-dz img{width:84px;height:60px;object-fit:cover;border-radius:6px;display:block}',
      '.hmg-sum{background:#F5F8F7;border-radius:12px;padding:10px 14px;margin:12px 0;font-size:15px;line-height:2}',
      '.hmg-sum b{color:' + C1 + '}',
      '.hmg-res-img{display:block;width:100%;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,.14);-webkit-touch-callout:default;user-select:auto}',
      '.hmg-row3{display:flex;gap:8px;margin-top:10px}',
      '.hmg-ov .hmg-mini{flex:1;min-height:64px' + I + ';border-radius:12px' + I + ';border:1.5px solid #E1E7E5' + I + ';background:#fff' + I + ';color:#1C2226' + I +
        ';font-size:13px' + I + ';font-weight:700' + I + ';cursor:pointer;margin:0' + I + ';padding:6px 4px' + I + ';display:flex' + I + ';flex-direction:column' + I +
        ';align-items:center' + I + ';justify-content:center' + I + ';gap:4px' + I + ';line-height:1.3' + I + ';text-decoration:none' + I + '}',
      '.hmg-mini b{font-size:20px;line-height:1}',
      '.hmg-note{background:#FFF7E6;border:1px solid #F0D9A8;color:#6B5310;border-radius:10px;padding:8px 12px;font-size:13px;line-height:1.7;margin-top:10px}',
      '.hmg-foot{font-size:12px;color:#6B7672;text-align:center;line-height:1.8;margin:14px 0 6px}',
      '.hmg-ltrc{direction:ltr;unicode-bidi:embed;display:inline-block}',
      '.hmg-spin{width:34px;height:34px;border-radius:50%;border:3px solid #DCE5E2;border-top-color:' + C1 + ';margin:26px auto 12px;animation:hmg-rot .8s linear infinite}',
      '@keyframes hmg-rot{to{transform:rotate(360deg)}}',
      '.hmg-confirm{display:flex;gap:8px;margin-top:8px}',
      // شريط صفحة الشكر
      '.hmg-tbar{position:fixed' + I + ';left:12px' + I + ';right:12px' + I + ';bottom:12px' + I + ';z-index:2147482999' + I + ';display:flex' + I + ';align-items:center' + I +
        ';gap:8px' + I + ';background:#fff' + I + ';border:1.5px solid ' + C1 + I + ';border-radius:14px' + I + ';padding:6px 6px 6px 8px' + I +
        ';box-shadow:0 8px 28px rgba(0,0,0,.18)' + I + ';direction:rtl' + I + ';font-family:' + FONT + I + ';max-width:520px;margin:0 auto' + I + '}',
      '.hmg-tbar a{flex:1;display:flex;align-items:center;gap:6px;color:' + C1 + I + ';font-weight:800;font-size:15px;text-decoration:none' + I + ';padding:8px 6px}',
      '.hmg-tbar button{width:34px' + I + ';height:34px' + I + ';border:0' + I + ';background:#F2F5F4' + I + ';border-radius:10px' + I + ';color:#33403D' + I + ';font-size:18px' + I + ';padding:0' + I + ';cursor:pointer}',
      '@media (prefers-reduced-motion:reduce){.hmg-pbtn,.hmg-ic,.hmg-pulse4,.hmg-sheet,.hmg-spin{animation:none' + I + '}}'
    ];
    var st = h('style');
    st.id = 'hmg-css';
    st.textContent = r.join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  var fontsDone = false;
  function loadFonts() {
    if (fontsDone) return;
    fontsDone = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Tajawal:wght@700;800&display=swap';
    (document.head || document.documentElement).appendChild(l);
  }

  /* ======================= النافذة ======================= */

  var openOv = null;
  function overlay(title) {
    if (openOv) openOv.close();
    css();
    loadFonts();
    var root = h('div', 'hmg-ov');
    root.setAttribute('dir', 'rtl');
    var sh = h('div', 'hmg-sheet');
    sh.setAttribute('role', 'dialog');
    sh.setAttribute('aria-modal', 'true');
    var head = h('div', 'hmg-head');
    var back = btn('hmg-back', '→');
    back.setAttribute('aria-label', 'رجوع');
    var tt = h('div', 'hmg-title', title);
    var x = btn('hmg-x', '×');
    x.setAttribute('aria-label', 'إغلاق');
    add(head, back, tt, x);
    var prog = h('div', 'hmg-prog');
    var body = h('div', 'hmg-body');
    add(sh, head, prog, body);
    root.appendChild(sh);

    var o = {root: root, body: body, closed: false, onBack: null, onClose: null};
    o.title = function (t) { tt.textContent = t; };
    o.back = function (fn) { o.onBack = fn || null; back.style.visibility = fn ? 'visible' : 'hidden'; };
    o.progress = function (n, total) {
      prog.textContent = '';
      if (!n) { prog.style.display = 'none'; return; }
      prog.style.display = '';
      for (var i = 1; i <= total; i++) prog.appendChild(h('i', i <= n ? 'on' : ''));
      prog.appendChild(h('span', '', 'الخطوة ' + n + ' من ' + total));
    };
    // يفرّغ المحتوى. keep=true يحفظ مكان التمرير لإعادة رسم نفس الشاشة
    o.clear = function (keep) {
      var top = keep ? body.scrollTop : 0;
      body.textContent = '';
      return function () { body.scrollTop = top; };
    };
    function onKey(e) { if (e.key === 'Escape') o.close(); }
    o.close = function () {
      if (o.closed) return;
      o.closed = true;
      clearInterval(timer);
      if (root.parentNode) root.parentNode.removeChild(root);
      document.documentElement.classList.remove('hmg-lock');
      document.removeEventListener('keydown', onKey);
      if (openOv === o) openOv = null;
      if (o.onClose) { try { o.onClose(); } catch (e) { /* لا شيء */ } }
    };
    back.addEventListener('click', function () { if (o.onBack) o.onBack(); });
    x.addEventListener('click', function () { o.close(); });
    root.addEventListener('click', function (e) { if (e.target === root) o.close(); });
    document.addEventListener('keydown', onKey);
    o.back(null);
    o.progress(0);
    document.documentElement.appendChild(root);
    document.documentElement.classList.add('hmg-lock');
    // زد يعيد رسم الصفحة أحياناً فيمسح النافذة: نعيدها ما لم يغلقها الزائر
    var timer = setInterval(function () {
      if (o.closed) return;
      if (!root.parentNode) document.documentElement.appendChild(root);
      document.documentElement.classList.add('hmg-lock');
    }, 400);
    openOv = o;
    return o;
  }

  function stickyBar(button) {
    var bar = h('div', 'hmg-bar');
    var err = h('div', 'hmg-err');
    add(bar, button, err);
    return {bar: bar, err: err, btn: button};
  }

  function waiting(ov, text) {
    ov.clear();
    add(ov.body, h('div', 'hmg-spin'), h('div', 'hmg-small hmg-center', text || 'لحظة…'));
  }

  function laterLink(ov) {
    var w = h('div', 'hmg-center');
    var a = btn('hmg-link', 'أكمل لاحقاً', function () {
      w.textContent = '';
      var lt = h('div', 'hmg-small', 'يمكنك إكمال الهدية لاحقاً من الرابط: ');
      lt.appendChild(h('span', 'hmg-ltrc', 'hamh.sa/#hadiya-complete'));
      add(w, lt,
        h('div', 'hmg-small', 'هل تريد الإغلاق الآن؟'));
      var row = h('div', 'hmg-confirm');
      add(row, btn('hmg-sec', 'نعم، أغلق', function () { ov.close(); }), btn('hmg-sec', 'لا', function () { w.textContent = ''; w.appendChild(a); }));
      w.appendChild(row);
    });
    w.appendChild(a);
    return w;
  }

  /* ======================= معاينة البطاقة ======================= */

  // نفس مقاسات السكربت (مقياس عرض 874)
  var L = {
    colX: 188, colW: 498, colTop: 96,
    qrX: 452, qrSize: 100, qrInner: 92, qrBottom: 30, qrR: 10,
    qrTextX: 326, qrTextW: 118, qrTextDy: 18, qrTextFs: 14,
    l1Fs: 18, nameLh: 1.3, nameGap: 12,
    sepTop: 18, sepH: 8, sepBottom: 14, sepLine: 70,
    duaFs: 31, duaLh: 1.5,
    capGap: 24, capFs: 18.5, capPadY: 8, capPadX: 20,
    frGap: 18, frFs: 18.5
  };

  function palette(th, design) {
    var dark = th === 0;
    var p = {
      gold: dark ? GOLD_D : GOLD_L,
      name: dark ? '#FFFFFF' : C1,
      dua: dark ? GOLD_D : '#3A4247',
      sec: dark ? '#F2F4F5' : '#3A4247',
      capFill: dark ? 'rgba(0,0,0,.30)' : C1,
      capLine: dark ? C2 : C1
    };
    if (design === 'calm') p.gold = dark ? '#D5DDDA' : '#6F7C77';
    return p;
  }

  function splitHalf(s) {
    var mid = Math.floor(s.length / 2), best = -1;
    for (var i = 0; i < s.length; i++) {
      if (s.charAt(i) === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
    if (best < 0) return [s];
    return [s.substr(0, best), s.substr(best + 1)];
  }
  function duaLines(t) {
    if (t.length <= 22) return [t];
    var k = t.indexOf('، ');
    if (k > 0) return [t.substr(0, k + 1), t.substr(k + 2)];
    if (t.length > 30) return splitHalf(t);
    return [t];
  }
  function nameLayout(name, nsIdx) {
    var fs = NS[nsIdx] * 8.74;
    var n = name.length;
    if (n * fs * 0.56 > L.colW) {
      fs = NS[0] * 8.74;
      if (n * fs * 0.56 > L.colW) return {fs: fs, lines: splitHalf(name)};
    }
    return {fs: fs, lines: [name]};
  }

  function U(n) { return 'calc(var(--u) * ' + (Math.round(n * 100) / 100) + ')'; }
  function box(el, x, y, w, hh) {
    el.style.left = U(x);
    el.style.top = U(y);
    if (w !== null) el.style.width = U(w);
    if (hh !== null) el.style.height = U(hh);
    return el;
  }
  function textEl(t, x, y, w, hh, fs, fam, w8, color, lh, ltr) {
    var e = h('div', 'hmg-t', t);
    box(e, x, y - 6, w, hh + 12);
    e.style.fontFamily = fam === 'dua' ? 'Amiri,serif' : 'Tajawal,' + FONT;
    e.style.fontWeight = w8;
    e.style.fontSize = U(fs);
    e.style.lineHeight = String(((lh || 100) / 100) * 1.2);
    e.style.color = color;
    e.style.direction = ltr ? 'ltr' : 'rtl';
    return e;
  }

  var cqOk = !!(window.CSS && CSS.supports && CSS.supports('width', '1cqw'));
  function preview(st, ribbon) {
    var card = h('div', 'hmg-card');
    var lay = h('div', '');
    lay.style.cssText = 'position:absolute;inset:0';
    card.appendChild(lay);
    if (ribbon) card.appendChild(h('div', 'hmg-rib', ribbon));
    function fixU() { if (!cqOk && card.offsetWidth) card.style.setProperty('--u', (card.offsetWidth / 874) + 'px'); }
    card.update = function (s) {
      card.style.backgroundImage = 'url("' + IMG + DS[s.d].k + '-' + (s.th === 1 ? 'l' : 'd') + '.jpg")';
      draw(lay, s);
      fixU();
    };
    card.update(st);
    if (!cqOk) {
      setTimeout(fixU, 0);
      window.addEventListener('resize', fixU);
    }
    return card;
  }

  function draw(lay, s) {
    lay.textContent = '';
    var occ = OCC[s.o], dead = !!occ.dead;
    var pal = palette(s.th, DS[s.d].k);
    var to = s.to || (dead ? 'اسم المتوفى' : 'من تحب');
    var nm = nameLayout(to, autoNs(to));
    var dua = duaLines((s.fem && occ.f) ? occ.f : occ.m);
    var hh = {
      l1: L.l1Fs * 1.35, name: nm.lines.length * nm.fs * L.nameLh, sep: L.sepTop + L.sepH + L.sepBottom,
      dua: dua.length * L.duaFs * L.duaLh, cap: L.capFs * 1.3 + 2 * L.capPadY, fr: L.frFs * 1.35
    };
    var total = hh.l1 + L.nameGap + hh.name + hh.sep + hh.dua + L.capGap + hh.cap + L.frGap + hh.fr;
    var qrTop = 620 - L.qrBottom - L.qrSize;
    var y = Math.max(L.colTop, L.colTop + (qrTop - 14 - L.colTop - total) / 2);
    var mid = L.colX + L.colW / 2;
    function line(x1, x2, yy, w, color) {
      var e = h('div');
      box(e, Math.min(x1, x2), yy - w / 2, Math.abs(x2 - x1), w);
      e.style.background = color;
      e.style.opacity = '.85';
      lay.appendChild(e);
    }
    var l1 = dead ? 'صدقة عن' : 'إهداء إلى';
    var l1W = l1.length * L.l1Fs * 0.55;
    lay.appendChild(textEl(l1, L.colX, y, L.colW, hh.l1, L.l1Fs, 'main', 700, pal.gold));
    line(mid - l1W / 2 - 44, mid - l1W / 2 - 10, y + hh.l1 / 2, 1.4, pal.gold);
    line(mid + l1W / 2 + 10, mid + l1W / 2 + 44, y + hh.l1 / 2, 1.4, pal.gold);
    y += hh.l1 + L.nameGap;
    var ne = textEl(nm.lines.join('\n'), L.colX - 20, y, L.colW + 40, hh.name, nm.fs, 'main', 800, pal.name, 100);
    if (!s.to) ne.style.opacity = '.6';
    lay.appendChild(ne);
    y += hh.name + L.sepTop;
    line(mid - 8 - L.sepLine, mid - 8, y + L.sepH / 2, 1.2, pal.gold);
    line(mid + 8, mid + 8 + L.sepLine, y + L.sepH / 2, 1.2, pal.gold);
    var dm = h('div');
    box(dm, mid - L.sepH / 2, y, L.sepH, L.sepH);
    dm.style.background = pal.gold;
    dm.style.clipPath = 'polygon(50% 0,100% 50%,50% 100%,0 50%)';
    lay.appendChild(dm);
    y += L.sepH + L.sepBottom;
    lay.appendChild(textEl(dua.join('\n'), L.colX - 20, y, L.colW + 40, hh.dua, L.duaFs, 'dua', 700, pal.dua, 115));
    y += hh.dua + L.capGap;
    var capText = '«' + (s.p ? PROJECTS[s.p] : 'اسم المشروع') + '» ' + FIELD;
    var capW = Math.min(L.colW, capText.length * L.capFs * 0.52 + 2 * L.capPadX);
    var cap = h('div', 'hmg-t', capText);
    box(cap, mid - capW / 2, y, capW, hh.cap);
    cap.style.cssText += ';border-radius:999px;box-sizing:border-box;white-space:nowrap;font-weight:700;color:#fff;direction:rtl';
    cap.style.background = pal.capFill;
    cap.style.border = U(1.3) + ' solid ' + pal.capLine;
    cap.style.fontFamily = 'Tajawal,' + FONT;
    cap.style.fontSize = U(L.capFs);
    lay.appendChild(cap);
    y += hh.cap + L.frGap;
    var from = s.anon ? 'فاعل خير' : (s.from || 'اسمك');
    lay.appendChild(textEl((dead ? 'من: ' : 'مُهداة من: ') + from, L.colX, y, L.colW, hh.fr, L.frFs, 'main', 700, pal.sec));
    // مكان الباركود (الباركود الحقيقي يُرسم بعد التبرع)
    var q = h('div');
    box(q, L.qrX, qrTop, L.qrSize, L.qrSize);
    q.style.cssText += ';box-sizing:border-box;background:#FBF6EC;border:' + U(1.25) + ' solid ' + C2 + ';border-radius:' + U(L.qrR);
    lay.appendChild(q);
    var qi = h('div');
    var ins = (L.qrSize - L.qrInner) / 2 + 10;
    box(qi, L.qrX + ins, qrTop + ins, L.qrSize - 2 * ins, L.qrSize - 2 * ins);
    qi.style.backgroundImage = 'repeating-linear-gradient(0deg,rgba(28,34,38,.10) 0 ' + U(6) + ',transparent ' + U(6) + ' ' + U(12) + '),' +
      'repeating-linear-gradient(90deg,rgba(28,34,38,.10) 0 ' + U(6) + ',transparent ' + U(6) + ' ' + U(12) + ')';
    lay.appendChild(qi);
    lay.appendChild(textEl('امسح الباركود\nلفتح البطاقة', L.qrTextX, qrTop + L.qrTextDy, L.qrTextW, L.qrTextFs * 2.9, L.qrTextFs, 'main', 700, pal.sec, 100));
    lay.appendChild(textEl('••••-••••', L.qrTextX, qrTop + L.qrTextDy + L.qrTextFs * 2.9, L.qrTextW, L.qrTextFs * 1.45, L.qrTextFs, 'main', 700, pal.gold, 100, true));
  }

  /* ======================= صفحة المشروع ======================= */

  function pageSlug() {
    var m = location.pathname.match(/^\/products\/([^\/?#]+)\/?$/);
    if (!m) return '';
    try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; }
  }
  function productForm() { return document.querySelector('form[id^="product-form-"]'); }

  function readAmounts() {
    var form = productForm();
    var root = form || document;
    var list = [], checked = 0;
    var rs = root.querySelectorAll('input[name="qnty_choose"]');
    for (var i = 0; i < rs.length; i++) {
      var v = parseInt(toEn(rs[i].value), 10);
      if (!(v > 0)) continue;
      var g = rs[i].closest ? rs[i].closest('.form-group') : null;
      var lb = g ? g.querySelector('label') : null;
      var t = lb ? lb.textContent.replace(/\s+/g, ' ').trim() : '';
      list.push({v: v, t: t || (v + ' ريال')});
      if (rs[i].checked) checked = v;
    }
    return {list: list, checked: checked};
  }

  var minCache = null;
  function minAmount() {
    if (minCache) return minCache;
    var form = productForm();
    var idEl = form && form.querySelector('#product-id');
    var id = (idEl && idEl.value) || (form ? form.id.replace(/^product-form-/, '') : '');
    minCache = new Promise(function (res) {
      if (!id) return res(1);
      fetch('/api/v1/products/' + encodeURIComponent(id), {headers: {Accept: 'application/json'}}).then(function (r) { return r.json(); })
        .then(function (j) {
          var p = (j && j.data && j.data.product) || {};
          var pr = p.purchase_restrictions || {};
          var m = parseInt(pr.min_quantity_per_cart || p.min_quantity_per_cart, 10);
          res(m > 0 ? m : 1);
        }, function () { res(1); });
    });
    return minCache;
  }

  function copyLook(from, to, keepWidth) {
    try {
      var cs = getComputedStyle(from);
      to.style.setProperty('border-radius', cs.borderTopLeftRadius, 'important');
      to.style.setProperty('min-height', cs.height, 'important');
      to.style.setProperty('height', cs.height, 'important');
      to.style.setProperty('font-size', cs.fontSize, 'important');
      to.style.setProperty('font-weight', cs.fontWeight, 'important');
      var c = cs.backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
        to.style.setProperty('border-color', c, 'important');
        to.style.setProperty('color', c, 'important');
      }
      if (keepWidth) to.style.setProperty('width', keepWidth + 'px', 'important');
    } catch (e) { /* يبقى الشكل الافتراضي */ }
  }

  function makeBtn(cls, href) {
    var b = document.createElement('a');
    b.className = cls;
    b.href = href;
    b.setAttribute('role', 'button');
    b.appendChild(h('span', '', 'أهدِ من تحب'));
    b.insertAdjacentHTML('afterbegin', ICON);
    return b;
  }

  function productButton() {
    var slug = pageSlug();
    if (!slug || !PROJECTS.hasOwnProperty(slug)) return false;
    var form = productForm();
    var addBtn = form && form.querySelector('a#add');
    if (!addBtn) return false;
    var row = addBtn.parentNode;
    if (row.querySelector('.hmg-pbtn')) return true;
    css();
    var b = makeBtn('hmg-pbtn', '#');
    copyLook(addBtn, b);
    b.addEventListener('click', function (e) {
      e.preventDefault();
      ev('gift_click');
      openWizard(slug);
    });
    if (addBtn.nextSibling) row.insertBefore(b, addBtn.nextSibling); else row.appendChild(b);
    row.classList.add('hmg-row');
    if (location.hash === '#hadiya-open') {
      clearHash();
      setTimeout(function () {
        try { b.scrollIntoView({block: 'center', behavior: 'smooth'}); } catch (e) { b.scrollIntoView(); }
        b.classList.add('hmg-pulse4');
        setTimeout(function () { b.classList.remove('hmg-pulse4'); }, 4000);
      }, 300);
    }
    minAmount();
    return true;
  }

  function cardLinks() {
    var cards = document.querySelectorAll('.product-card-with-gift');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.querySelector('.hmg-clink')) continue;
      var a = c.querySelector('a[href*="/products/"]');
      if (!a) continue;
      var m = (a.getAttribute('href') || '').match(/\/products\/([^\/?#]+)/);
      if (!m) continue;
      var slug = m[1];
      try { slug = decodeURIComponent(slug); } catch (e) { /* كما هو */ }
      if (!PROJECTS.hasOwnProperty(slug)) continue;
      var row = c.querySelector('.checkout-buttons');
      if (!row) continue;
      css();
      var big = null, kids = row.children;
      for (var k = 0; k < kids.length; k++) {
        if (/تبرع/.test(kids[k].textContent || '')) { big = kids[k]; break; }
      }
      var l = makeBtn('hmg-clink', '/products/' + encodeURIComponent(slug) + '#hadiya-open');
      if (big) copyLook(big, l, Math.round(row.getBoundingClientRect().width) || 0);
      l.addEventListener('click', function () { ev('gift_click'); });
      row.parentNode.parentNode.insertBefore(l, row.parentNode.nextSibling);
    }
  }

  function watch(fn) {
    fn();
    if (!window.MutationObserver) return;
    var t = null;
    var mo = new MutationObserver(function () {
      if (t) return;
      t = setTimeout(function () { t = null; fn(); }, 150);
    });
    mo.observe(document.documentElement, {childList: true, subtree: true});
    setTimeout(function () { mo.disconnect(); }, 30000);
  }

  function openWizard(slug) {
    var st = fixState(loadSaved() || {});
    st.p = slug;
    st.amtSet = false;
    st.custom = false;
    var ov = overlay('أهدِ من تحب');
    ev('panel_open');
    wizard(ov, st, {withAmount: true});
  }

  /* ======================= الخطوات ======================= */

  function wizard(ov, st, opts) {
    var step = opts.startStep || 1;
    var more = st.oSet && TOP6.indexOf(st.o) < 0;
    var showDesign = false;
    var total = opts.withAmount ? 3 : 2;
    var amounts = opts.withAmount ? readAmounts() : null;
    var minA = 1;
    if (opts.withAmount) minAmount().then(function (m) { minA = m; });

    function go(n) { step = n; render(false); }
    function render(keep) {
      var restore = ov.clear(keep);
      ov.title(opts.title || 'أهدِ من تحب');
      ov.progress(step, total);
      ov.back(step > 1 ? function () { go(step - 1); } : (opts.onBack || null));
      if (step === 1) s1(); else if (step === 2) s2(); else s3();
      restore();
    }

    function pick(i) {
      st.o = i;
      st.oSet = true;
      if (!st.dSet) st.d = OCC[i].d;
      if (!hasFem(i)) st.fem = false;
      else if (!st.femSet) st.fem = FEM_RX.test(st.to);
    }

    function s1() {
      var w = ov.body;
      var errEl = h('div', 'hmg-err', opts.err || '');
      opts.err = '';
      if (opts.pickProject) {
        w.appendChild(h('label', 'hmg-lbl', 'المشروع الذي تبرعت له'));
        var sel = h('select', 'hmg-sel');
        sel.appendChild(h('option', '', 'اختر المشروع')).value = '';
        for (var k in PROJECTS) {
          if (!PROJECTS.hasOwnProperty(k)) continue;
          var op = h('option', '', PROJECTS[k]);
          op.value = k;
          if (st.p === k) op.selected = true;
          sel.appendChild(op);
        }
        sel.addEventListener('change', function () { st.p = sel.value; errEl.textContent = ''; });
        w.appendChild(sel);
      }
      w.appendChild(h('div', 'hmg-q', 'ما مناسبة الهدية؟'));
      function tile(i) {
        var t = btn('hmg-tile' + (st.oSet && st.o === i ? ' on' : ''), null, function () {
          if (opts.pickProject && !st.p) { errEl.textContent = 'اختر المشروع الذي تبرعت له.'; return; }
          pick(i);
          if (opts.withAmount) saveState(st);
          go(2);
        });
        add(t, h('span', 'hmg-te', OCC[i].e), h('span', '', short(i)));
        return t;
      }
      var g = h('div', 'hmg-grid');
      TOP6.forEach(function (i) { g.appendChild(tile(i)); });
      w.appendChild(g);
      var rest = OCC.length - TOP6.length;
      w.appendChild(btn('hmg-link', more ? 'إخفاء المناسبات الأخرى ▴' : 'مناسبات أخرى (' + rest + ') ▾', function () {
        more = !more;
        render(true);
      }));
      if (more) {
        var g2 = h('div', 'hmg-grid');
        for (var i = 0; i < OCC.length; i++) if (TOP6.indexOf(i) < 0) g2.appendChild(tile(i));
        w.appendChild(g2);
      }
      w.appendChild(errEl);
      w.appendChild(h('div', 'hmg-small', ' '));
    }

    function s2() {
      var w = ov.body;
      var o = OCC[st.o], dead = !!o.dead;
      w.appendChild(h('div', 'hmg-q', dead ? 'عن من الصدقة؟' : 'لمن الهدية؟'));
      var pv = preview(st, 'معاينة');
      var pw = h('div', 'hmg-pv78');
      pw.appendChild(pv);
      w.appendChild(pw);

      w.appendChild(h('label', 'hmg-lbl', dead ? 'اسم المتوفى' : 'اسم من تهديه'));
      var inTo = h('input', 'hmg-in');
      inTo.type = 'text';
      inTo.maxLength = 40;
      inTo.autocomplete = 'off';
      inTo.placeholder = 'مثال: ' + (dead ? 'محمد' : 'أبو تميم');
      inTo.value = st.to;
      w.appendChild(inTo);

      var femBtns = null;
      if (hasFem(st.o)) {
        w.appendChild(h('label', 'hmg-lbl', dead ? 'المتوفى:' : 'المُهدى إليه:'));
        var two = h('div', 'hmg-two');
        var bm = btn('hmg-opt', '👨 رجل', function () { st.fem = false; st.femSet = true; upd(); });
        var bf = btn('hmg-opt', '👩 امرأة', function () { st.fem = true; st.femSet = true; upd(); });
        add(two, bm, bf);
        w.appendChild(two);
        femBtns = [bm, bf];
      } else {
        st.fem = false;
      }

      w.appendChild(h('label', 'hmg-lbl', 'اسمك'));
      var inFrom = h('input', 'hmg-in');
      inFrom.type = 'text';
      inFrom.maxLength = 40;
      inFrom.autocomplete = 'off';
      inFrom.placeholder = 'مثال: عبدالله';
      inFrom.value = st.from;
      inFrom.disabled = st.anon;
      w.appendChild(inFrom);
      var chk = h('label', 'hmg-chk');
      var cb = h('input');
      cb.type = 'checkbox';
      cb.checked = st.anon;
      add(chk, cb, h('span', '', 'لا تُظهر اسمي (يُكتب «فاعل خير»)'));
      w.appendChild(chk);
      w.appendChild(h('div', 'hmg-small', 'الأسماء حروف فقط، حتى 25 حرفاً.'));

      var b = btn('hmg-pri', opts.withAmount ? 'التالي' : (opts.doneText || 'التالي'));
      var sb = stickyBar(b);
      sb.bar.appendChild(h('div', 'hmg-lock-line', '🔒 لا نطلب رقم جوالك. الأسماء تظهر على البطاقة فقط.'));
      w.appendChild(sb.bar);

      function upd() {
        if (femBtns) {
          femBtns[0].className = 'hmg-opt' + (st.fem ? '' : ' on');
          femBtns[1].className = 'hmg-opt' + (st.fem ? ' on' : '');
        }
        pv.update(st);
        if (opts.withAmount) saveState(st);
      }
      inTo.addEventListener('input', function () {
        st.to = cleanName(inTo.value);
        if (hasFem(st.o) && !st.femSet) st.fem = FEM_RX.test(st.to);
        sb.err.textContent = '';
        upd();
      });
      inFrom.addEventListener('input', function () { st.from = cleanName(inFrom.value); sb.err.textContent = ''; upd(); });
      cb.addEventListener('change', function () { st.anon = cb.checked; inFrom.disabled = st.anon; sb.err.textContent = ''; upd(); });
      upd();

      b.addEventListener('click', function () {
        st.to = cleanName(inTo.value);
        st.from = cleanName(inFrom.value);
        var e = checkNames(st);
        if (e) { sb.err.textContent = e; return; }
        st.ns = autoNs(st.to);
        if (opts.withAmount) { saveState(st); go(3); } else opts.onDone(st, sb);
      });
    }

    function s3() {
      var w = ov.body;
      w.appendChild(h('div', 'hmg-q', 'كم تريد أن تتبرع؟'));
      var list = amounts.list;
      if (!st.amtSet) {
        var now = readAmounts().checked;
        st.amt = now || (list.length ? list[0].v : 0);
        st.custom = false;
      }
      var b = btn('hmg-pri', '');
      var amtIn = null;
      function label() {
        b.textContent = 'تبرّع وأهدِ' + (st.amt > 0 ? ' · ' + st.amt + ' ريال' : '');
      }
      if (list.length) {
        var g = h('div', 'hmg-grid');
        list.forEach(function (a) {
          var on = !st.custom && st.amt === a.v;
          var t = btn('hmg-opt hmg-amt' + (on ? ' on' : ''), null, function () {
            st.amt = a.v; st.amtSet = true; st.custom = false; saveState(st); render(true);
          });
          t.appendChild(h('span', '', a.t));
          if (a.t.indexOf(String(a.v)) < 0) t.appendChild(h('span', 'hmg-amtv', a.v + ' ريال'));
          g.appendChild(t);
        });
        var other = btn('hmg-opt hmg-amt hmg-full' + (st.custom ? ' on' : ''), 'مبلغ آخر', function () {
          st.custom = true; st.amtSet = true; st.amt = 0; render(true);
          var x = ov.body.querySelector('.hmg-amtin');
          if (x) x.focus();
        });
        g.appendChild(other);
        w.appendChild(g);
      }
      if (st.custom || !list.length) {
        amtIn = h('input', 'hmg-in hmg-amtin');
        amtIn.type = 'text';
        amtIn.setAttribute('inputmode', 'numeric');
        amtIn.placeholder = 'اكتب المبلغ (' + minA + ' ريال أو أكثر)';
        amtIn.value = st.amt > 0 ? String(st.amt) : '';
        amtIn.style.marginTop = '10px';
        amtIn.addEventListener('input', function () {
          var v = parseInt(toEn(amtIn.value).replace(/[^0-9]/g, ''), 10) || 0;
          st.amt = v; st.amtSet = true;
          label();
        });
        w.appendChild(amtIn);
      }

      var ex = EXTRA[st.p];
      if (ex) w.appendChild(extraBox(ex));

      w.appendChild(h('label', 'hmg-lbl', 'بطاقتك'));
      var pv = preview(st, 'شكل تقريبي، والبطاقة النهائية بعد التبرع');
      w.appendChild(pv);
      w.appendChild(btn('hmg-link', showDesign ? 'إخفاء ▴' : '🎨 غيّر شكل البطاقة (اختياري)', function () {
        showDesign = !showDesign; render(true);
      }));
      if (showDesign) {
        var row = h('div', 'hmg-designs');
        DS.forEach(function (d, i) {
          var z = btn('hmg-dz' + (st.d === i ? ' on' : ''), null, function () {
            st.d = i; st.dSet = true; saveState(st); render(true);
          });
          var im = h('img');
          im.src = IMG + d.k + '-' + (st.th === 1 ? 'l' : 'd') + '.jpg';
          im.alt = '';
          im.loading = 'lazy';
          add(z, im, h('span', '', d.l));
          row.appendChild(z);
        });
        w.appendChild(row);
        var two = h('div', 'hmg-two');
        add(two,
          btn('hmg-opt' + (st.th === 0 ? ' on' : ''), '🌙 غامقة', function () { st.th = 0; saveState(st); render(true); }),
          btn('hmg-opt' + (st.th === 1 ? ' on' : ''), '☀️ فاتحة', function () { st.th = 1; saveState(st); render(true); }));
        w.appendChild(two);
      }
      label();
      var sb = stickyBar(b);
      sb.bar.appendChild(h('div', 'hmg-lock-line', '🔒 لا نطلب رقم جوالك. الأسماء تظهر على البطاقة فقط.'));
      w.appendChild(sb.bar);
      b.addEventListener('click', function () { donate(ov, st, sb, minA); });
    }

    function extraBox(ex) {
      var dead = !!OCC[st.o].dead;
      var pf = pageExtra(ex);
      if (!st.ex.name) st.ex.name = (pf.nameEl && pf.nameEl.value.trim()) || (dead ? st.to : '');
      if (!st.ex.sex) {
        var pv = pf.sexEl ? pf.sexEl.value : '';
        st.ex.sex = pv === ex.sex.m ? 'm' : (pv === ex.sex.f ? 'f' : (dead && st.femSet ? (st.fem ? 'f' : 'm') : ''));
      }
      var bx = h('div', 'hmg-box');
      bx.appendChild(h('label', 'hmg-lbl', ex.title));
      bx.appendChild(h('label', 'hmg-lbl', ex.name.label));
      var inN = h('input', 'hmg-in');
      inN.type = 'text';
      inN.maxLength = 40;
      inN.placeholder = ex.name.ph;
      inN.value = st.ex.name;
      inN.addEventListener('input', function () { st.ex.name = inN.value.replace(/\s+/g, ' ').substr(0, 40); saveState(st); });
      bx.appendChild(inN);
      bx.appendChild(h('label', 'hmg-lbl', ex.sex.label));
      var two = h('div', 'hmg-two');
      var bm = btn('hmg-opt' + (st.ex.sex === 'm' ? ' on' : ''), ex.sex.m, function () { st.ex.sex = 'm'; sync(); });
      var bf = btn('hmg-opt' + (st.ex.sex === 'f' ? ' on' : ''), ex.sex.f, function () { st.ex.sex = 'f'; sync(); });
      function sync() {
        bm.className = 'hmg-opt' + (st.ex.sex === 'm' ? ' on' : '');
        bf.className = 'hmg-opt' + (st.ex.sex === 'f' ? ' on' : '');
        saveState(st);
      }
      add(two, bm, bf);
      bx.appendChild(two);
      return bx;
    }

    render(false);
  }

  function checkNames(st) {
    var dead = !!OCC[st.o].dead;
    if (st.to.length < 2) return dead ? 'اكتب اسم المتوفى.' : 'اكتب اسم من تهديه.';
    if (!st.anon && st.from.length < 2) return 'اكتب اسمك، أو اختر «لا تُظهر اسمي».';
    return '';
  }

  function pageExtra(ex) {
    var form = productForm() || document;
    var out = {nameEl: null, sexEl: null};
    var els = form.querySelectorAll('input,select');
    for (var i = 0; i < els.length; i++) {
      var n = (els[i].getAttribute('name') || '').trim();
      if (n === ex.name.field && els[i].tagName === 'INPUT') out.nameEl = els[i];
      if (n === ex.sex.field && els[i].tagName === 'SELECT') out.sexEl = els[i];
    }
    return out;
  }

  function setVal(el, v) {
    el.value = v;
    try {
      el.dispatchEvent(new Event('input', {bubbles: true}));
      el.dispatchEvent(new Event('change', {bubbles: true}));
    } catch (e) { /* متصفح قديم */ }
  }

  function donate(ov, st, sb, minA) {
    var e = checkNames(st);
    if (!e && !(st.amt >= minA)) e = 'اكتب مبلغاً لا يقل عن ' + minA + ' ريال.';
    var ex = EXTRA[st.p];
    if (!e && ex) {
      if (st.ex.name.trim().length < 2) e = 'اكتب ' + ex.name.label + '.';
      else if (!st.ex.sex) e = 'اختر ' + ex.sex.label + '.';
    }
    if (e) { sb.err.textContent = e; return; }
    st.ns = autoNs(st.to);
    saveState(st);
    ev('add_to_cart');
    sb.btn.disabled = true;
    sb.btn.textContent = 'جارٍ الإضافة للسلة…';
    sb.err.textContent = '';
    var form = productForm();
    if (ex) {
      var pf = pageExtra(ex);
      if (pf.nameEl) setVal(pf.nameEl, st.ex.name.trim());
      if (pf.sexEl) setVal(pf.sexEl, st.ex.sex === 'f' ? ex.sex.f : ex.sex.m);
    }
    var rs = (form || document).querySelectorAll('input[name="qnty_choose"]');
    var match = null, i;
    for (i = 0; i < rs.length; i++) if (parseInt(toEn(rs[i].value), 10) === st.amt) match = rs[i];
    if (match) {
      if (!match.checked) match.click();
      if (!match.checked) { match.checked = true; setVal(match, match.value); }
    } else {
      for (i = 0; i < rs.length; i++) rs[i].checked = false;
      var q = document.querySelector('#product-quantity');
      if (q) setVal(q, String(st.amt));
    }
    setTimeout(function () {
      var addBtn = form && form.querySelector('a#add');
      try {
        if (typeof window.singleProductAddToCartRedirect === 'function' && form && form.id) window.singleProductAddToCartRedirect(form.id);
        else if (addBtn) addBtn.click();
      } catch (x) {
        if (addBtn) addBtn.click();
      }
    }, 120);
    // إن بقي الزائر في الصفحة (رسالة من زد مثلاً) نغلق النافذة حتى تظهر له
    setTimeout(function () { if (!ov.closed) ov.close(); }, 6000);
  }

  /* ======================= صفحة الشكر ======================= */

  function thankPage(code) {
    lsSet('hm_gift_ord', {c: code, ts: Date.now()});
    var saved = loadSaved();
    var redir = lsGet('hm_gift_redir');
    var done = doneFor(code);
    if (saved && isFull(saved) && !(redir && redir.c === code) && !done) {
      var ov = overlay('شكراً لتبرعك 🤍');
      waiting(ov, 'نجهّز بطاقة إهدائك…');
      var t0 = Date.now(), gone = false;
      var go = function () {
        if (gone || ov.closed) return;
        gone = true;
        lsSet('hm_gift_redir', {c: code, ts: Date.now()});
        location.replace('/#hadiya-complete');
      };
      ov.onClose = function () { if (!gone) thankBar(); };
      // ننتظر اكتمال الصفحة ثم ثانية ونصفاً حتى تسجّل أكواد الإعلانات الشراء
      var after = function () { setTimeout(go, Math.max(0, Math.min(1500, 6000 - (Date.now() - t0)))); };
      if (document.readyState === 'complete') after(); else window.addEventListener('load', after);
      setTimeout(go, 6000);
      return;
    }
    thankBar();
  }

  function thankBar() {
    css();
    var bar = h('div', 'hmg-tbar');
    var a = document.createElement('a');
    a.href = '/#hadiya-complete';
    a.appendChild(h('span', '', 'أهدِ أجر تبرعك لمن تحب'));
    a.insertAdjacentHTML('afterbegin', ICON);
    var x = btn('', '×');
    x.setAttribute('aria-label', 'إغلاق');
    var closed = false;
    x.addEventListener('click', function () { closed = true; clearInterval(t); if (bar.parentNode) bar.parentNode.removeChild(bar); });
    add(bar, a, x);
    document.documentElement.appendChild(bar);
    var t = setInterval(function () { if (!closed && !bar.parentNode) document.documentElement.appendChild(bar); }, 400);
  }

  /* ======================= أكمل هديتك ======================= */

  function complete() {
    var ov = overlay('شكراً لتبرعك 🤍');
    ev('complete_view');
    ov.onClose = function () { if (location.hash === '#hadiya-complete') clearHash(); };
    var ord = lsGet('hm_gift_ord', ORD_MS);
    if (!ord || !ord.c) {
      askOrder(ov, function (c) { afterOrder(ov, c); });
      return;
    }
    afterOrder(ov, ord.c);
  }

  function afterOrder(ov, c) {
    var done = doneFor(c);
    if (done && done.c.length) { prevCards(ov, c, done); return; }
    var saved = loadSaved();
    if (saved && isFull(saved)) { confirmScreen(ov, saved, c); return; }
    startPick(ov, c, saved, '');
  }

  function askOrder(ov, cb) {
    ov.clear();
    ov.title('شكراً لتبرعك 🤍');
    ov.progress(0);
    ov.back(null);
    var w = ov.body;
    w.appendChild(h('div', 'hmg-q', 'أكمل هديتك'));
    w.appendChild(h('div', 'hmg-small', 'ألصق رابط صفحة الشكر أو رابط «عرض الفاتورة» الذي وصلك بعد التبرع.'));
    var inp = h('input', 'hmg-in hmg-ltr');
    inp.type = 'url';
    inp.autocomplete = 'off';
    inp.placeholder = 'https://hamh.sa/…';
    w.appendChild(inp);
    var b = btn('hmg-pri', 'متابعة');
    var sb = stickyBar(b);
    w.appendChild(sb.bar);
    w.appendChild(laterLink(ov));
    b.addEventListener('click', function () {
      var m = String(inp.value || '').match(ORDER_LINK_RX);
      if (!m) { sb.err.textContent = 'الرابط غير صحيح. انسخه كما هو من صفحة الشكر أو الفاتورة.'; return; }
      lsSet('hm_gift_ord', {c: m[1], ts: Date.now()});
      cb(m[1]);
    });
  }

  // المتصفح يقرأ الفاتورة ليعرف المشروع فقط، ولا يحفظ منها شيئاً
  function guessProject(c) {
    return fetch('/api/v1/orders/' + encodeURIComponent(c) + '/invoice', {headers: {Accept: 'application/json'}})
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var names = [];
        (function walk(x, depth) {
          if (!x || typeof x !== 'object' || depth > 6) return;
          if (Array.isArray(x.products)) {
            x.products.forEach(function (p) {
              var n = p && p.name;
              if (n && typeof n === 'object') n = n.ar || n.en || '';
              if (n) names.push(norm(n));
            });
          }
          for (var k in x) if (x.hasOwnProperty(k) && x[k] && typeof x[k] === 'object') walk(x[k], depth + 1);
        })(j, 0);
        for (var s in PROJECTS) {
          if (!PROJECTS.hasOwnProperty(s)) continue;
          var want = norm(PROJECTS[s]);
          for (var i = 0; i < names.length; i++) if (names[i].indexOf(want) >= 0) return s;
        }
        return '';
      }, function () { return ''; });
  }

  function startPick(ov, c, base, err) {
    waiting(ov, 'لحظة…');
    guessProject(c).then(function (slug) {
      if (ov.closed) return;
      var st = fixState(base || {});
      if (slug) st.p = slug;
      editWizard(ov, st, c, {pickProject: !slug || !!err, err: err});
    });
  }

  function editWizard(ov, st, c, extra) {
    extra = extra || {};
    wizard(ov, st, {
      withAmount: false,
      title: 'شكراً لتبرعك 🤍',
      pickProject: extra.pickProject || !st.p,
      err: extra.err || '',
      doneText: 'صحيح، اصنع بطاقتي',
      onBack: extra.onBack || null,
      onDone: function (s, sb) { issue(ov, s, c, sb); }
    });
    ov.body.appendChild(laterLink(ov));
  }

  function confirmScreen(ov, st, c) {
    ov.clear();
    ov.title('شكراً لتبرعك 🤍');
    ov.progress(0);
    ov.back(null);
    var w = ov.body;
    var dead = !!OCC[st.o].dead;
    w.appendChild(h('div', 'hmg-q', 'تأكد من الأسماء'));
    w.appendChild(preview(st, 'معاينة'));
    var sum = h('div', 'hmg-sum');
    function row(k, v) { var d = h('div'); add(d, h('b', '', k + ' '), h('span', '', v)); sum.appendChild(d); }
    row('المناسبة:', short(st.o));
    row(dead ? 'عن:' : 'إلى:', st.to);
    row('من:', st.anon ? 'فاعل خير' : st.from);
    w.appendChild(sum);
    var b = btn('hmg-pri', 'صحيح، اصنع بطاقتي');
    var sb = stickyBar(b);
    b.addEventListener('click', function () { issue(ov, st, c, sb); });
    sb.bar.appendChild(btn('hmg-link', 'لا، أريد التعديل', function () {
      editWizard(ov, st, c, {onBack: function () { confirmScreen(ov, st, c); }});
    }));
    var ll = h('div', 'hmg-lock-line', 'إن أغلقت الصفحة، افتح هذا الرابط من نفس الجوال: ');
    ll.appendChild(h('span', 'hmg-ltrc', 'hamh.sa/#hadiya-complete'));
    sb.bar.appendChild(ll);
    w.appendChild(sb.bar);
    w.appendChild(laterLink(ov));
  }

  function prevCards(ov, c, done) {
    ov.clear();
    ov.title('شكراً لتبرعك 🤍');
    ov.progress(0);
    ov.back(null);
    var w = ov.body;
    w.appendChild(h('div', 'hmg-q', 'أصدرت لهذا التبرع:'));
    done.c.forEach(function (code, i) {
      w.appendChild(btn('hmg-sec', 'افتح البطاقة ' + (i + 1), function () { reopen(ov, c, code); }));
    });
    if (done.c.length >= 2) {
      w.appendChild(h('div', 'hmg-small hmg-center', 'الحد بطاقتان لكل تبرع.'));
    } else {
      w.appendChild(h('div', 'hmg-small hmg-center', 'ويمكنك إهداء شخص ثانٍ من نفس التبرع:'));
      w.appendChild(btn('hmg-pri', '🎁 بطاقة ثانية لشخص آخر', function () { second(ov, c, done); }));
    }
    w.appendChild(h('div', 'hmg-foot', ' '));
  }

  function second(ov, c, done) {
    var last = done.last || {};
    var st = fixState({p: done.p, o: last.o, oSet: true, d: last.d, dSet: !!last.dSet, th: last.th, from: last.from, anon: last.anon});
    st.to = '';
    editWizard(ov, st, c, {onBack: function () { prevCards(ov, c, doneFor(c) || done); }});
  }

  function issue(ov, st, c, sb) {
    st.ns = autoNs(st.to);
    var old = sb.btn.textContent;
    sb.btn.disabled = true;
    sb.btn.textContent = 'نصنع بطاقتك…';
    sb.err.textContent = '';
    post({
      a: 'issue', order: c, p: st.p, o: st.o, d: st.d, th: st.th, ns: st.ns, fem: st.fem ? 1 : 0,
      anon: st.anon ? 1 : 0, from: st.anon ? '' : st.from, to: st.to, dev: dev()
    }).then(function (r) {
      if (ov.closed) return;
      if (r && r.ok && r.code && r.img) {
        var code = String(r.code);
        var done = doneFor(c) || {o: c, c: [], t: {}, x: {}, ts: Date.now()};
        if (done.c.indexOf(code) < 0) done.c.push(code);
        done.p = st.p;
        done.last = {o: st.o, d: st.d, dSet: st.dSet, th: st.th, from: st.from, anon: st.anon};
        if (!done.x[code]) done.x[code] = {def: autoMsg(st), sms: smsText(st, code), l: 1, fem: st.fem ? 1 : 0, p: st.p};
        if (!done.t[code]) done.t[code] = done.x[code].def;
        lsSet('hm_gift_done', done);
        lsDel('hm_gift');
        result(ov, c, code, r.img);
        return;
      }
      sb.btn.disabled = false;
      sb.btn.textContent = old;
      var e = r && r.error;
      if (e === 'wrong_project') {
        st.p = '';
        editWizard(ov, st, c, {pickProject: true, err: ERR.wrong_project});
        return;
      }
      sb.err.textContent = errText(e);
    });
  }

  /* ======================= نصوص الرسائل ======================= */

  function autoMsg(st) {
    var o = OCC[st.o];
    if (o.w) return (st.fem && o.wf) ? o.wf : o.w;
    var from = st.anon ? 'فاعل خير' : st.from;
    var p = PROJECTS[st.p] || '';
    if (o.dead) return 'تصدّق ' + from + ' عن ' + st.to + ' بـ«' + p + '» ' + FIELD + '، ' + (st.fem ? 'رحمها' : 'رحمه') + ' الله';
    return st.to + '، ' + (st.fem ? 'أهداكِ ' : 'أهداك ') + from + ' أجر «' + p + '» ' + FIELD + ' 🤍';
  }
  function cardUrl(code) { return SITE + '/#hadiya=' + code; }
  function linkLine(code, fem) { return (fem ? 'بطاقتكِ: ' : 'بطاقتك: ') + cardUrl(code); }
  function smsText(st, code) {
    var from = st.anon ? 'فاعل خير' : st.from;
    if (OCC[st.o].dead) return 'تصدّق ' + from + ' عن ' + st.to + ' عبر ' + ORG + ': ' + cardUrl(code);
    return st.to + '، ' + (st.fem ? 'أهداكِ ' : 'أهداك ') + from + ' أجر «' + (PROJECTS[st.p] || '') + '» عبر ' + ORG + ': ' + cardUrl(code);
  }

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return legacyCopy(t); });
    }
    return Promise.resolve(legacyCopy(t));
  }
  function legacyCopy(t) {
    try {
      var ta = h('textarea');
      ta.value = t;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  function b64File(b64, name) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    try { return new File([arr], name, {type: 'image/png'}); } catch (e) { return null; }
  }

  /* ======================= شاشة الإرسال ======================= */

  function reopen(ov, c, code) {
    waiting(ov, 'لحظة…');
    post({a: 'card', c: code}).then(function (r) {
      if (ov.closed) return;
      if (r && r.ok && r.img) { result(ov, c, code, r.img); return; }
      var done = doneFor(c);
      if (done) prevCards(ov, c, done);
      ov.body.insertBefore(h('div', 'hmg-err', errText(r && r.error === 'bad_code' ? 'unavailable' : (r && r.error))), ov.body.firstChild);
    });
  }

  function result(ov, c, code, img) {
    ov.clear();
    ov.title('أرسل هديتك');
    ov.progress(0);
    ov.back(null);
    var w = ov.body;
    var done = doneFor(c) || {o: c, c: [code], t: {}, x: {}, ts: Date.now()};
    var x = done.x[code] || {def: 'وصلتك هدية خير عبر ' + ORG + ' 🤍', sms: 'وصلتك هدية خير عبر ' + ORG + ': ' + cardUrl(code), l: 1, fem: 0};
    if (!done.x[code]) done.x[code] = x;
    if (typeof done.t[code] !== 'string') done.t[code] = x.def;
    function save() { lsSet('hm_gift_done', done); }
    function body() { return done.t[code]; }
    function withLink() { return x.l !== 0; }
    function full() { return body() + (withLink() ? '\n' + linkLine(code, x.fem) : ''); }
    var name = 'hadiya-' + pretty(code) + '.png';
    var src = 'data:image/png;base64,' + img;

    var im = h('img', 'hmg-res-img');
    im.src = src;
    im.alt = 'بطاقة الإهداء';
    w.appendChild(im);

    var note = h('div', 'hmg-note');
    note.style.display = 'none';
    var mob = isMobile();

    var wa = btn('hmg-pri hmg-wa', 'أرسل في واتساب', function () {
      ev('sent_whatsapp');
      var file = mob ? b64File(img, name) : null;
      if (file && navigator.canShare && navigator.share && navigator.canShare({files: [file]})) {
        var t = full();
        copyText(t);
        navigator.share({files: [file], text: t}).then(function () { /* تم */ }, function () { /* ألغى */ });
        note.textContent = 'نسخنا نص الرسالة لك. إن وصلت الصورة بلا نص في واتساب، ألصقه في المحادثة.';
        note.style.display = '';
        return;
      }
      window.open('https://wa.me/?text=' + encodeURIComponent(body() + '\n' + linkLine(code, x.fem)), '_blank');
    });
    wa.style.marginTop = '14px';
    w.appendChild(wa);

    var row = h('div', 'hmg-row3');
    var cp = btn('hmg-mini', null, function () {
      ev('copy_msg');
      copyText(full()).then(function () {
        cp.lastChild.textContent = 'تم النسخ ✓';
        setTimeout(function () { cp.lastChild.textContent = 'انسخ الرسالة'; }, 2000);
      });
    });
    add(cp, h('b', '', '📋'), h('span', '', 'انسخ الرسالة'));
    var sv = btn('hmg-mini', null, function () {
      ev('save_img');
      var a = document.createElement('a');
      a.href = src;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    add(sv, h('b', '', '⬇️'), h('span', '', 'احفظ الصورة'));
    add(row, cp, sv);
    if (mob) {
      var sm = btn('hmg-mini', null, function () {
        ev('sent_sms');
        location.href = 'sms:?&body=' + encodeURIComponent(x.sms);
      });
      add(sm, h('b', '', '✉️'), h('span', '', 'أرسل برسالة نصية'));
      row.appendChild(sm);
    }
    w.appendChild(row);
    w.appendChild(h('div', 'hmg-small hmg-center', 'أو اضغط مطوّلاً على الصورة ثم احفظها.'));
    w.appendChild(note);

    // تعديل كلام الرسالة
    var edWrap = h('div');
    var edOpen = false;
    var edLink = btn('hmg-link', '✏️ غيّر كلام الرسالة', function () {
      edOpen = !edOpen;
      edLink.textContent = edOpen ? 'إخفاء ▴' : '✏️ غيّر كلام الرسالة';
      drawEd();
    });
    function drawEd() {
      edWrap.textContent = '';
      if (!edOpen) return;
      var ta = h('textarea', 'hmg-ta');
      ta.maxLength = 300;
      ta.value = body();
      var cnt = h('div', 'hmg-small', '');
      cnt.style.textAlign = 'left';
      cnt.style.direction = 'ltr';
      function count() { cnt.textContent = ta.value.length + ' / 300'; }
      ta.addEventListener('input', function () { done.t[code] = ta.value.substr(0, 300); save(); count(); });
      count();
      var rst = btn('hmg-link', 'إرجاع النص المقترح', function () { done.t[code] = x.def; save(); drawEd(); });
      var chk = h('label', 'hmg-chk');
      var cb = h('input');
      cb.type = 'checkbox';
      cb.checked = withLink();
      add(chk, cb, h('span', '', 'أضِف رابط البطاقة في آخر الرسالة (يفتحها بضغطة)'));
      var stl = h('div', 'hmg-small');
      var ll = h('div', 'hmg-small hmg-ltrc', linkLine(code, x.fem));
      function st() {
        stl.textContent = withLink() ? 'سيُضاف في آخر الرسالة رابط يفتح البطاقة.' : 'لن يُضاف الرابط، ويبقى الباركود داخل البطاقة لفتحها.';
        ll.style.display = withLink() ? '' : 'none';
      }
      cb.addEventListener('change', function () { x.l = cb.checked ? 1 : 0; save(); st(); });
      st();
      add(edWrap, ta, cnt, rst, chk, stl, ll);
    }
    w.appendChild(edLink);
    w.appendChild(edWrap);

    if (done.c.length < 2) {
      w.appendChild(btn('hmg-link', '🎁 بطاقة ثانية لشخص آخر (بلا تبرع جديد)', function () { second(ov, c, doneFor(c) || done); }));
    }
    var foot = h('div', 'hmg-foot');
    add(foot, h('span', '', 'تُرسل من واتسابك أنت، لا من رقم الجمعية. رابط البطاقة يعمل 90 يوماً، فاحفظ الصورة. · الرمز '),
      h('span', 'hmg-ltrc', pretty(code)));
    w.appendChild(foot);
    save();
  }

  /* ======================= صفحة المُهدى إليه ======================= */

  function recipient(code) {
    var ov = overlay('وصلتك بطاقة خير');
    ev('recipient_open');
    waiting(ov, 'نفتح البطاقة…');
    post({a: 'card', c: code}).then(function (r) {
      if (ov.closed) return;
      ov.clear();
      var w = ov.body;
      var p = r && r.p && PROJECTS.hasOwnProperty(r.p) ? r.p : '';
      if (!r || !r.ok) {
        w.appendChild(h('div', 'hmg-q', errText(r && r.error === 'bad_code' ? 'unavailable' : (r && r.error))));
        w.appendChild(donateLink(p));
        return;
      }
      if (r.expired) {
        w.appendChild(h('div', 'hmg-q', 'انتهت مدة عرض هذه البطاقة. جزى الله من أهداها خيراً.'));
        w.appendChild(donateLink(p));
        footer(w, code);
        return;
      }
      if (!r.dead) ov.title('وصلتك هدية خير');
      var im = h('img', 'hmg-res-img');
      im.src = 'data:image/png;base64,' + r.img;
      im.alt = 'بطاقة الإهداء';
      w.appendChild(im);
      var from = r.from || '';
      var line = h('div', 'hmg-q', from ? INVITE + ' كما شارك ' + from + '.' : INVITE + '.');
      line.style.fontSize = '17px';
      line.style.marginTop = '14px';
      w.appendChild(line);
      w.appendChild(donateLink(p));
      if (!r.dead && from && p) {
        var th = document.createElement('a');
        th.className = 'hmg-sec';
        th.href = 'https://wa.me/?text=' + encodeURIComponent('جزاك الله خيراً يا ' + from + ' على إهدائي أجر «' + PROJECTS[p] + '» ' + FIELD + ' 💚');
        th.target = '_blank';
        th.rel = 'noopener';
        th.textContent = '💚 اشكر ' + from + ' في واتساب';
        th.addEventListener('click', function () { ev('thank_click'); });
        w.appendChild(th);
      }
      var g = document.createElement('a');
      g.className = 'hmg-link';
      g.href = p ? '/products/' + encodeURIComponent(p) + '#hadiya-open' : '/';
      g.textContent = '🎁 أهدِ أنت أيضاً لمن تحب';
      g.addEventListener('click', function () { ev('recipient_gift'); ov.close(); });
      w.appendChild(g);
      footer(w, code);
    });
  }
  function donateLink(p) {
    var a = document.createElement('a');
    a.className = 'hmg-pri';
    a.href = p ? '/products/' + encodeURIComponent(p) : '/';
    a.textContent = p ? 'تبرّع أنت أيضاً في «' + PROJECTS[p] + '»' : 'تبرّع أنت أيضاً';
    a.style.marginTop = '12px';
    a.addEventListener('click', function () { ev('recipient_donate'); if (openOv) openOv.close(); });
    return a;
  }
  function footer(w, code) {
    var f = h('div', 'hmg-foot');
    add(f, h('span', '', 'بطاقة إهداء، وليست إيصال تبرع · الرمز '), h('span', 'hmg-ltrc', pretty(code)), h('span', '', ' · ' + ORG_FULL));
    w.appendChild(f);
  }

  /* ======================= التوجيه ======================= */

  function clearHash() {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* لا شيء */ }
  }

  function onHash() {
    var hs = location.hash || '';
    var m = hs.match(/^#hadiya=([A-Za-z0-9]{4})-?([A-Za-z0-9]{4})$/);
    if (m) {
      clearHash();
      recipient((m[1] + m[2]).toUpperCase());
      return true;
    }
    if (hs === '#hadiya-complete') { complete(); return true; }
    return false;
  }

  function start() {
    try {
      css();
      var path = location.pathname;
      var tm = path.match(THANK_PATH_RX);
      var handled = onHash();
      if (tm) { if (!handled) thankPage(tm[1]); return; }
      if (pageSlug()) watch(productButton);
      watch(cardLinks);
      window.addEventListener('hashchange', onHash);
    } catch (e) {
      if (window.console) console.warn('hmg', e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
