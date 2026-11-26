/* ============================================================
   HM-RECEIPT v2 (سريع) — «تحميل الإيصال» + صفحة التحقق (جمعية هامة) — 2026-11-25
   يعمل في صفحات: /o/<رمز>/inv و /order-completed/<رمز>/invoice و /orders/<رمز>/invoice
   وأي صفحة + #receipt=XXXX-XXXX (صفحة التحقق) و /account-orders («طلباتي وإيصالاتي»)
   السكربت: «إيصالات هامة» (يتأكد من الدفع ويعطي البيانات فقط). الرسم هنا في المتصفح بالتصميم المعتمد (148b).
   الإيقاف السريع: RECEIPT_ON=0 في شيت «إيصالات هامة».
   ============================================================ */
(function () {
  'use strict';
  if (window.HMReceipt) return;
  var API = 'https://script.google.com/macros/s/AKfycbwPBld_gaHZoPlezPNpukCHNVzN3EfR9wyFwwmL2WJ1hL3cFBgDiE8ceWeZOsAmQZYe-g/exec';
  var NAVY = '#126762', INK2 = '#5b6b80', LINE = '#E3ECE7', GOLD = '#A8864A';
  var ME = (document.currentScript && document.currentScript.src) || '';
  if (!ME) { var sc = document.querySelector('script[src*="receipt.js"]'); ME = sc ? sc.src : ''; }
  var BASE = ME.replace(/[^\/]*$/, '');
  var ORG = 'جمعية هامة لخدمة الحجاج والمعتمرين';
  var LIC = 'مسجلة لدى المركز الوطني لتنمية القطاع غير الربحي برقم 1000688400';
  var PHONE = '0555 06 7720';
  var ICON_D = 'M81.6 86.4 81.0 86.4 80.2 87.0 74.0 89.5 74.0 97.4 76.9 96.5 81.8 94.2 81.9 86.6ZM116.9 86.2 116.9 94.2 117.2 94.6 124.0 91.8 125.4 91.6 147.0 101.1 152.0 103.6 152.6 103.8 153.1 103.4 153.2 95.5 151.4 94.0 125.1 82.4 124.2 82.5 122.1 83.6 118.4 85.0ZM95.5 80.2 90.6 82.2 88.5 83.5 88.5 90.5 88.8 91.0 90.0 90.9 95.6 88.2 95.8 80.5ZM74.0 104.5 74.0 154.4 74.6 154.4 75.0 154.9 95.8 154.9 96.2 153.6 96.2 140.2 96.8 139.5 101.4 139.4 102.1 140.1 102.1 153.4 103.1 154.9 181.0 154.9 181.1 154.5 181.9 154.2 181.9 107.1 169.2 101.8 168.1 101.0 159.8 97.6 159.0 98.1 159.0 114.2 158.6 114.6 158.0 114.6 157.1 114.0 147.2 109.8 145.4 109.4 145.0 110.0 145.0 145.5 144.6 146.0 111.4 146.1 110.9 145.6 110.8 140.4 111.5 139.4 138.1 139.5 138.9 139.1 139.1 138.6 139.1 104.4 137.2 103.1 125.1 97.9 124.1 98.0 123.2 98.6 121.8 99.0 117.1 101.1 116.6 102.6 116.8 130.4 116.2 131.0 111.4 131.0 110.8 130.4 110.9 74.6 110.2 73.6 107.9 74.0 102.5 76.1 102.1 77.4 102.2 130.4 101.8 130.9 96.8 131.0 96.2 130.5 96.2 96.0 95.8 95.2 95.1 95.2 90.0 97.8 86.5 99.0ZM153.8 122.0 157.2 123.1 158.4 123.8 159.0 124.5 159.0 145.5 158.2 146.2 153.8 146.0 153.2 145.2 153.2 122.6ZM167.6 110.4 168.5 110.4 172.4 112.0 173.4 113.1 173.4 145.5 172.5 146.1 168.2 146.1 167.4 145.4 167.4 110.6ZM87.5 107.9 88.1 108.6 88.1 145.2 87.4 146.1 82.8 146.0 82.2 145.4 82.2 110.5 83.5 109.5ZM125.2 107.4 130.1 109.4 130.8 110.2 130.8 130.5 130.4 131.0 125.8 131.1 124.9 130.4 124.9 108.5ZM117.4 71.0 117.1 77.8 117.4 78.8 118.2 78.6 119.6 77.8 123.9 76.0 125.0 75.9 137.5 81.4 139.0 81.8 144.6 84.5 148.2 85.8 149.5 86.6 155.0 88.8 158.6 90.6 162.2 91.9 167.6 94.5 173.5 96.8 174.9 97.6 179.6 99.6 180.9 99.8 181.4 99.2 181.2 92.6 180.4 91.8 174.9 89.2 161.9 83.9 159.1 82.4 152.9 80.0 150.1 78.5 143.6 76.0 140.2 74.2 136.8 73.0 126.0 68.1 124.4 67.8 118.4 70.2ZM74.0 73.8 74.0 82.5 74.5 82.5 81.2 79.9 82.1 79.2 90.5 75.9 91.6 75.1 97.1 73.0 100.8 71.1 106.9 68.8 109.6 67.2 113.2 66.0 124.0 61.1 125.2 61.1 132.4 64.1 133.6 65.0 139.2 67.1 142.6 68.9 164.8 78.2 167.9 79.9 174.0 82.2 179.8 85.0 181.9 85.2 181.9 76.8 155.2 65.0 153.8 64.6 148.4 62.0 144.9 60.8 141.2 58.9 135.8 56.8 132.4 55.0 126.4 52.6 126.0 52.0 123.4 52.0 123.0 52.6 114.6 56.0 111.2 57.8 107.8 59.0 102.2 61.6 98.8 62.9 97.4 63.8 96.5 63.9 95.1 64.8 89.5 66.9 88.1 67.8Z';   // أيقونة شعار هامة بلا كتابة (إحداثيات الشعار 256)، x 74.25–181.4، y 52.5–154.1
  var ICON_BOX = {x: 74.25, y: 52.5, w: 107.15, h: 101.6};
  var ERR = {
    not_paid: 'لم يكتمل الدفع لهذا التبرع بعد.', bad_order: 'رابط التبرع غير صحيح.', locked: 'محاولات كثيرة. حاول بعد ساعة.',
    paused: 'الإيصالات متوقفة مؤقتاً. حاول لاحقاً.', net: 'تعذّر الاتصال. تأكد من الإنترنت ثم أعد المحاولة.', server: 'حدث خطأ. أعد المحاولة بعد قليل.'
  };

  /* ---------- أدوات ---------- */
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function post(body) {
    return fetch(API, {method: 'POST', body: JSON.stringify(body)}).then(function (r) { return r.json(); });
  }
  function orderFromPath(p) {
    var m = String(p || '').match(/\/(?:o\/([A-Za-z0-9]{6,24})\/inv|(?:order-completed|orders)\/([A-Za-z0-9]{6,24})\/invoice)/);
    return m ? (m[1] || m[2]) : '';
  }
  function fmtAmt(a) { a = Number(a) || 0; return (Math.round(a * 100) % 100) ? a.toFixed(2) : String(Math.round(a)); }

  /* التاريخ: من created_at (UTC) إلى توقيت الرياض */
  var MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  function riyadh(iso) {
    var m = String(iso || '').match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) + 3 * 3600e3); // نقرأ بـ getUTC*
  }
  function gregText(d) {
    var h = d.getUTCHours(), mi = d.getUTCMinutes(), ap = h < 12 ? 'ص' : 'م', h12 = h % 12 || 12;
    return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' – ' + h12 + ':' + (mi < 10 ? '0' : '') + mi + ' ' + ap;
  }
  function hijriText(d) {
    try {
      var f = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
      var s = f.format(d).replace(/\s*هـ$/, '').trim();
      return /\d{4}/.test(s) ? s + 'هـ' : '';
    } catch (e) { return ''; }
  }
  function dateParts(r) {
    var d = riyadh(r.iso);
    if (d) return {g: gregText(d), h: hijriText(d)};
    return {g: String(r.date || '').replace('|', '–'), h: ''};
  }

  /* المبلغ كتابةً (ريالات صحيحة حتى 999,999 + هللات) */
  var ONES = ['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة','أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'];
  var TENS = ['','','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'];
  var HUND = ['','مئة','مئتان','ثلاثمئة','أربعمئة','خمسمئة','ستمئة','سبعمئة','ثمانمئة','تسعمئة'];
  function below1000(n) {
    var h = Math.floor(n / 100), r = n % 100, p = [];
    if (h) p.push(HUND[h]);
    if (r) {
      if (r < 20) p.push(ONES[r]);
      else { var o = r % 10, t = Math.floor(r / 10); p.push(o ? ONES[o] + ' و' + TENS[t] : TENS[t]); }
    }
    return p.join(' و');
  }
  function riyalWord(n) {           // تمييز العدد
    var r = n % 100;
    if (n === 1) return 'ريال سعودي';
    if (n === 2) return 'ريالان سعوديان';
    if (r >= 3 && r <= 10) return 'ريالات سعودية';
    return 'ريال سعودي';
  }
  function words(a) {
    a = Math.round((Number(a) || 0) * 100);
    var n = Math.floor(a / 100), hl = a % 100, s = '';
    if (n === 0) s = 'صفر';
    else if (n === 1) s = '';
    else if (n === 2) s = '';
    else {
      var th = Math.floor(n / 1000), rest = n % 1000, p = [];
      if (th) {
        if (th === 1) p.push('ألف');
        else if (th === 2) p.push('ألفان');
        else if (th >= 3 && th <= 10) p.push(below1000(th) + ' آلاف');
        else p.push(below1000(th) + ' ألف');
      }
      if (rest) p.push(below1000(rest));
      s = p.join(' و');
    }
    var out = (n === 1 ? 'ريال سعودي واحد' : n === 2 ? 'ريالان سعوديان' : s + ' ' + riyalWord(n));
    if (hl) out += ' و' + below1000(hl) + ' ' + (hl >= 3 && hl <= 10 ? 'هللات' : 'هللة');
    return out + ' فقط';
  }

  /* ---------- الخطوط والصور ---------- */
  var assets = null;
  function loadAssets() {
    if (assets) return assets;
    var fonts = [
      ['HMRT', 'fonts/Tajawal-Regular.ttf', '400'], ['HMRT', 'fonts/Tajawal-Bold.ttf', '700'],
      ['HMRT', 'fonts/Tajawal-ExtraBold.ttf', '800'], ['HMRA', 'fonts/Amiri-Bold-dua.ttf', '700']
    ].map(function (f) {
      var ff = new FontFace(f[0], 'url(' + BASE + f[1] + ')', {weight: f[2]});
      return ff.load().then(function (x) { document.fonts.add(x); });
    });
    var logo = new Promise(function (ok, no) { var i = new Image(); i.crossOrigin = 'anonymous'; i.onload = function () { ok(i); }; i.onerror = no; i.src = BASE + 'img/receipt/logo.png'; });
    var qrLib = window.qrcode ? Promise.resolve() : new Promise(function (ok, no) { var s = document.createElement('script'); s.src = BASE + 'receipt-qr.js'; s.charset = 'utf-8'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    assets = Promise.all([Promise.all(fonts), logo, qrLib]).then(function (r) { return {logo: r[1]}; });
    assets.catch(function () { assets = null; });
    return assets;
  }

  /* ---------- رمز QR ---------- */
  function qrCanvas(text, size) {
    var q = qrcode(0, 'M'); q.addData(text); q.make();
    var n = q.getModuleCount(), quiet = 0, cv = document.createElement('canvas'), cell = size / (n + quiet * 2);
    cv.width = cv.height = size; var c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, size, size); c.fillStyle = NAVY;
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) c.fillRect(Math.floor((k + quiet) * cell), Math.floor((r + quiet) * cell), Math.ceil(cell), Math.ceil(cell));
    return cv;
  }

  /* ---------- الرسم ---------- */
  // يرسم الإيصال بالتخطيط المعتمد. kind: 'sq' (1080×1080) أو 'a5' (1080×1532)
  function draw(kind, d, A, scale) {
    var S = kind === 'sq' ? {
      W:1080, H:1080, pad:48, h1:44, org:30, lgW:170, amtTop:4, amtL:32, amtN:92, amtU:42, wTop:2, wSize:30, barT:20, barB:16,
      rowPad:14, lab:28, val:36, sub:28, duaM:20, dua:34, ln:28, ct:30, ctT:8, ln2T:6, qr:0, hg:44, wm:640
    } : {
      W:1080, H:1532, pad:88, h1:52, org:30, lgW:200, amtTop:24, amtL:36, amtN:160, amtU:56, wTop:10, wSize:34, barT:28, barB:28,
      rowPad:18, lab:30, val:40, sub:30, duaM:28, dua:40, ln:28, ct:30, ctT:12, ln2T:12, qr:152, hg:66, wm:760
    };
    d.proj = String(d.proj || '').split('|')[0].trim();
    scale = scale || 1;
    var cv = document.createElement('canvas'); cv.width = S.W * scale; cv.height = S.H * scale;
    var c = cv.getContext('2d'); c.scale(scale, scale);
    c.fillStyle = '#fff'; c.fillRect(0, 0, S.W, S.H);
    c.direction = 'rtl'; c.textBaseline = 'alphabetic';

    function font(sz, w, fam) { c.font = (w || 400) + ' ' + sz + 'px ' + (fam || 'HMRT') + ', Tahoma, sans-serif'; }
    function asc(sz) { var m = c.measureText('إيصال'); return {a: m.fontBoundingBoxAscent || sz * 0.95, d: m.fontBoundingBoxDescent || sz * 0.35}; }
    // يكتب سطراً داخل صندوق ارتفاعه lh*sz ويرجع الارتفاع
    function line(txt, x, top, sz, w, color, lh, align, fam) {
      font(sz, w, fam); c.fillStyle = color; c.textAlign = align || 'right';
      var m = asc(sz), boxH = sz * lh, y = top + (boxH - (m.a + m.d)) / 2 + m.a;
      c.fillText(txt, x, y); return boxH;
    }
    function width(txt, sz, w, fam) { font(sz, w, fam); return c.measureText(txt).width; }

    /* الخلفية: أيقونة شعار هامة بلا كتابة، خط رفيع رمادي، في منتصف الإيصال تماماً */
    try {
      var k = S.wm / ICON_BOX.w;
      c.save();
      c.translate(S.W / 2, S.H / 2); c.scale(k, k);
      c.translate(-(ICON_BOX.x + ICON_BOX.w / 2), -(ICON_BOX.y + ICON_BOX.h / 2));
      c.strokeStyle = 'rgba(120,124,128,0.11)'; c.lineWidth = 2 / k; c.lineJoin = 'round';
      c.stroke(new Path2D(ICON_D));
      c.restore();
    } catch (e) {}

    var P = S.pad, W = S.W, y = P;

    /* الرأس: الشعار يميناً، QR يساراً، والعنوان في الوسط */
    var lw = S.lgW, lh = Math.round(A.logo.naturalHeight * lw / A.logo.naturalWidth);
    c.drawImage(A.logo, W - P - lw, y, lw, lh);
    var labW = width('امسح للتحقق', 28, 700), qs = S.qr || Math.round(labW), labSz = S.qr ? 28 * qs / labW : 28;
    var qcv = qrCanvas('https://hamh.sa/#receipt=' + d.v.slice(0, 4) + '-' + d.v.slice(4), qs * 2);
    c.drawImage(qcv, P, y, qs, qs);
    var qrBlockH = qs + 8 + line('امسح للتحقق', P + qs / 2, y + qs + 8, labSz, 700, NAVY, 1.2, 'center');
    var hdH = Math.max(lh, qrBlockH), HG = S.hg;  // HG: أقل فراغ بين العنوان وبين الشعار ورمز QR
    var midL = P + qs + HG, midR = W - P - lw - HG, midC = (midL + midR) / 2, midW = midR - midL;
    var t1 = S.h1, t2 = S.org;                     // نصغّر العنوان قليلاً إن لم يتسع (بحد أدنى)
    while (t1 > 34 && width('إيصال تبرع إلكتروني', t1, 800) > midW) t1 -= 2;
    while (t2 > 26 && width(ORG, t2, 700) > midW) t2 -= 1;
    var midH = t1 * 1.2 + 6 + t2 * 1.35, my = y + (lh - midH) / 2;   // في منتصف ارتفاع الشعار
    my += line('إيصال تبرع إلكتروني', midC, my, t1, 800, NAVY, 1.2, 'center') + 6;
    line(ORG, midC, my, t2, 700, INK2, 1.35, 'center');
    y += hdH + S.amtTop;

    /* المبلغ */
    var nTxt = fmtAmt(d.amt), gap = 18;
    var wl = width('المبلغ', S.amtL, 700), wn = width(nTxt, S.amtN, 800), wu = width('ريال', S.amtU, 800);
    var tot = wl + wn + wu + gap * 2, xr = W / 2 + tot / 2;
    font(S.amtN, 800); var mN = asc(S.amtN), base = y + (S.amtN - (mN.a + mN.d)) / 2 + mN.a;
    c.textAlign = 'right';
    font(S.amtL, 700); c.fillStyle = INK2; c.fillText('المبلغ', xr, base);
    font(S.amtN, 800); c.fillStyle = NAVY; c.direction = 'ltr'; c.textAlign = 'right'; c.fillText(nTxt, xr - wl - gap, base); c.direction = 'rtl';
    font(S.amtU, 800); c.textAlign = 'right'; c.fillText('ريال', xr - wl - gap - wn - gap, base);
    y += S.amtN + S.wTop;
    y += line(words(d.amt), W / 2, y, S.wSize, 700, NAVY, 1.25, 'center');

    /* خط الزخرفة (زخرفة فقط، بلا نص) */
    y += S.barT; c.fillStyle = GOLD; roundRect(c, W / 2 - 70, y, 140, 5, 2.5); c.fill(); y += 5 + S.barB;

    /* الصفوف */
    var dp = dateParts(d), colW = (W - 2 * P - 40) / 2, xR = W - P, xL = P + colW;
    var gift = d.gift && d.gift.to ? d.gift : null;
    var rows = kind === 'sq' ? [
      [['رقم الإيصال', d.n], ['الرقم المرجعي للعملية', d.ref || '—']],
      [['التاريخ والوقت', dp.g, dp.h], ['طريقة الدفع', d.pay || '—']],
      [['اسم المتبرع', d.name], ['المشروع', d.proj]]
    ] : [
      [['رقم الإيصال', d.n], ['الرقم المرجعي للعملية', d.ref || '—']],
      [['التاريخ والوقت', dp.g, dp.h]],
      [['اسم المتبرع', d.name], ['المشروع', d.proj]],
      gift ? [['طريقة الدفع', d.pay || '—'], [gift.mourn ? 'صدقة عن' : 'إهداء إلى', gift.to]] : [['طريقة الدفع', d.pay || '—']]
    ];
    rows.forEach(function (row) {
      var top = y + S.rowPad, hMax = 0, one = row.length === 1;
      row.forEach(function (cell, i) {
        var x = one ? W / 2 : (i === 0 ? xR : P), al = one ? "center" : (i === 0 ? "right" : "left"), h = 0;
        h += line(cell[0], x, top + h, S.lab, 400, INK2, 1.2, al);
        h += 9; h += line(fit(cell[1], S.val, 800, one ? W - 2 * P : colW), x, top + h, S.val, 800, NAVY, 1.25, al);
        if (cell[2]) { h += 5; h += line(cell[2], x, top + h, S.sub, 400, INK2, 1.25, al); }
        hMax = Math.max(hMax, h);
      });
      y = top + hMax + S.rowPad;
      c.fillStyle = LINE; c.fillRect(P, y, W - 2 * P, 2); y += 2;
    });
    function fit(t, sz, w, maxW) {   // يختصر النص الطويل حتى لا يتجاوز العمود
      t = String(t == null ? '' : t); if (width(t, sz, w) <= maxW) return t;
      while (t.length > 1 && width(t + '…', sz, w) > maxW) t = t.slice(0, -1);
      return t + '…';
    }

    /* الدعاء */
    y += S.duaM;
    line('تقبّل الله منك، وجعله في ميزان حسناتك.', W / 2, y, S.dua, 700, NAVY, 1.4, 'center', 'HMRA');

    /* التذييل مثبت في الأسفل — نفسه في المقاسين (قرار عبدالله: البيانات الكاملة في كل المقاسات) */
    var foot = [[LIC, S.ln, 400, INK2, 0], [PHONE + ' · hamh.sa · info@hamh.org.sa', S.ct, 800, NAVY, S.ctT, 1], ['إيصال إلكتروني لا يحتاج توقيعاً ولا ختماً', S.ln, 400, INK2, S.ln2T]];
    var fh = foot.reduce(function (s, f) { return s + f[4] + f[1] * 1.3; }, 0), fy = S.H - P - fh;
    foot.forEach(function (f) { fy += f[4]; if (f[5]) c.direction = 'ltr'; fy += line(f[0], W / 2, fy, f[1], f[2], f[3], 1.3, 'center'); c.direction = 'rtl'; });
    return cv;
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  /* ---------- PDF بصفحة A5 فيها صورة الإيصال ---------- */
  function pdfFromJpeg(jpeg, pxW, pxH) {
    var W = 419.53, H = 595.28, enc = new TextEncoder(), parts = [], off = 0, xref = [];
    function add(x) { var b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); off += b.length; }
    function obj(n, body) { xref[n] = off; add(n + ' 0 obj\n'); body(); add('\nendobj\n'); }
    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, function () { add('<< /Type /Catalog /Pages 2 0 R >>'); });
    obj(2, function () { add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'); });
    obj(3, function () { add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>'); });
    var cs = 'q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im0 Do Q';
    obj(4, function () { add('<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream'); });
    obj(5, function () { add('<< /Type /XObject /Subtype /Image /Width ' + pxW + ' /Height ' + pxH + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n'); add(jpeg); add('\nendstream'); });
    var xo = off, s = 'xref\n0 6\n0000000000 65535 f \n';
    for (var i = 1; i <= 5; i++) s += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
    add(s + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xo + '\n%%EOF');
    return new Blob(parts, {type: 'application/pdf'});
  }
  function toBlob(cv, type, q) { return new Promise(function (ok) { cv.toBlob(ok, type, q); }); }
  function save(blob, name) {
    var u = URL.createObjectURL(blob), a = el('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 4000);
  }

  /* ---------- الواجهة ---------- */
  var css = false;
  function style() {
    if (css) return; css = true;
    var s = el('style'); s.textContent = [
      '.hmr-card{direction:rtl;text-align:center;background:#fff;border:1px solid ' + LINE + ';border-radius:16px;padding:16px;margin:14px 0;font-family:inherit}',
      '.hmr-card p{margin:0 0 12px;font-size:16px;color:' + INK2 + '}',
      '.hmr-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:48px;border:0;border-radius:12px;background:' + NAVY + ';color:#fff!important;font:inherit;font-size:17px;font-weight:700;cursor:pointer}',
      '.hmr-btn[disabled]{opacity:.65;cursor:wait}',
      '.hmr-btn2{background:#fff;color:' + NAVY + '!important;border:2px solid ' + NAVY + '}',
      '.hmr-lnk{display:inline-block;margin-top:12px;font-size:15px;font-weight:700;color:' + NAVY + '!important;text-decoration:none!important;background:none;border:0;cursor:pointer;font-family:inherit}',
      '.hmr-ov{position:fixed;inset:0;z-index:2147483100;background:rgba(18,103,98,.55);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl}',
      '.hmr-sh{background:#fff;border-radius:20px;padding:14px;width:100%;max-width:440px;max-height:calc(100vh - 28px);overflow:auto;font-family:inherit;text-align:center}',
      '.hmr-x{width:34px;height:34px;border-radius:50%;border:0;background:#F2F5F4;color:' + INK2 + ';font-size:18px;line-height:1;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;margin:0 auto 10px 0}',
      '.hmr-sh img{display:block;width:100%;border-radius:12px;border:1px solid ' + LINE + '}',
      '.hmr-row{display:flex;gap:10px;margin-top:12px}.hmr-row .hmr-btn{height:46px;font-size:16px}',
      '.hmr-note{margin:10px 0 0;font-size:14px;color:' + INK2 + '}',
      '.hmr-msg{padding:22px 8px;font-size:16px;color:' + INK2 + '}',
      '.hmr-ok{font-size:22px;font-weight:800;color:' + NAVY + ';margin:6px 0 14px}',
      '.hmr-kv{display:flex;justify-content:space-between;gap:12px;padding:10px 4px;border-bottom:1px solid ' + LINE + ';font-size:16px}',
      '.hmr-kv b{color:' + NAVY + '}.hmr-kv span{color:' + INK2 + '}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function overlay() {
    style();
    var ov = el('div', 'hmr-ov'), sh = el('div', 'hmr-sh'), x = el('button', 'hmr-x');
    x.type = 'button'; x.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="display:block"><path d="M2 2L12 12M12 2L2 12" stroke="' + INK2 + '" stroke-width="2" stroke-linecap="round"/></svg>'; x.setAttribute('aria-label', 'إغلاق'); sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
    sh.appendChild(x); ov.appendChild(sh); document.body.appendChild(ov);
    function close() { ov.remove(); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }
    x.onclick = close; ov.onclick = function (e) { if (e.target === ov) close(); }; document.addEventListener('keydown', esc);
    setTimeout(function () { x.focus(); }, 30);
    return {sh: sh, close: close};
  }
  function icon() {
    var s = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/></svg>';
    var w = el('span'); w.innerHTML = s; return w.firstChild;
  }

  var cache = {};
  function getReceipt(order) {
    if (!cache[order]) {
      cache[order] = post({a: 'receipt', o: order});
      cache[order].catch(function () { delete cache[order]; });
    }
    return cache[order];
  }

  // يفتح نافذة الإيصال لطلب معيّن (تُستعمل أيضاً من نافذة الإهداء)
  function open(order) {
    var o = overlay(), wait = el('div', 'hmr-msg', 'نجهّز إيصالك…'); o.sh.appendChild(wait);
    Promise.all([getReceipt(order), loadAssets()]).then(function (r) {
      var d = r[0], A = r[1];
      if (!d || !d.ok) { wait.textContent = ERR[d && d.error] || ERR.server; return; }
      var sq = draw('sq', d, A, 1);
      wait.remove();
      var im = el('img'); im.alt = 'إيصال التبرع رقم ' + d.n; im.src = sq.toDataURL('image/png'); o.sh.appendChild(im);
      var row = el('div', 'hmr-row'), b1 = el('button', 'hmr-btn', 'حفظ الصورة'), b2 = el('button', 'hmr-btn hmr-btn2', 'ملف PDF');
      b1.type = b2.type = 'button'; row.appendChild(b1); row.appendChild(b2); o.sh.appendChild(row);
      if (d.gift && d.gift.to) o.sh.appendChild(el('p', 'hmr-note', 'الإيصال لك أنت وفيه المبلغ. البطاقة هي التي تُرسل.'));
      b1.onclick = function () { toBlob(sq, 'image/png').then(function (b) { save(b, 'إيصال-تبرع-' + d.n + '.png'); }); };
      b2.onclick = function () {
        b2.disabled = true;
        var a5 = draw('a5', d, A, 2);
        toBlob(a5, 'image/jpeg', 0.92).then(function (b) { return b.arrayBuffer(); }).then(function (buf) {
          save(pdfFromJpeg(new Uint8Array(buf), a5.width, a5.height), 'إيصال-تبرع-' + d.n + '.pdf');
        }).finally(function () { b2.disabled = false; });
      };
    }).catch(function () { wait.textContent = ERR.net; });
  }

  // صفحة التحقق: #receipt=XXXX-XXXX
  function verifyPage(code) {
    var o = overlay(), wait = el('div', 'hmr-msg', 'نتحقق من الإيصال…'); o.sh.appendChild(wait);
    post({a: 'verify', v: code}).then(function (r) {
      wait.remove();
      if (!r || !r.ok) { o.sh.appendChild(el('div', 'hmr-msg', ERR[r && r.error] || ERR.server)); return; }
      if (!r.valid) {
        o.sh.appendChild(el('div', 'hmr-ok', 'لم نجد هذا الإيصال'));
        o.sh.appendChild(el('p', 'hmr-note', 'تأكد من الرمز، أو تواصل مع الجمعية على ' + PHONE + '.'));
        return;
      }
      o.sh.appendChild(el('div', 'hmr-ok', '✅ إيصال صحيح'));
      o.sh.appendChild(el('p', 'hmr-note', 'صادر من ' + ORG));
      [['رقم الإيصال', r.n], ['المبلغ', fmtAmt(r.amt) + ' ريال'], ['المشروع', String(r.proj || '').split('|')[0].trim()], ['التاريخ', String(r.date || '').replace('|', '–')]]
        .forEach(function (kv) { var w = el('div', 'hmr-kv'); w.appendChild(el('span', '', kv[0])); w.appendChild(el('b', '', String(kv[1]))); o.sh.appendChild(w); });
    }).catch(function () { wait.textContent = ERR.net; });
  }

  // بطاقة «إيصال تبرعك جاهز» في صفحة الفاتورة/الشكر
  function card(order) {
    var tries = 0, thank = /^\/order-completed\//.test(location.pathname);
    var gR = getReceipt(order);                         /* نبدأ نداء قوقل فوراً، والبطاقة لا تنتظره */
    var zP = thank ? null : fetch('/api/v1/orders/' + order + '/invoice', {headers: {Accept: 'application/json'}})
      .then(function (r) { return r.json(); })
      .then(function (j) { var od = j && (j.order || (j.data && j.data.order)); return !!od && String(od.payment_status || '').toLowerCase() === 'paid'; })
      .catch(function () { return false; });
    function build(title) {
      if (document.querySelector('.hmr-card')) return null;
      style();
      var cd = el('div', 'hmr-card'), b = el('button', 'hmr-btn');
      cd.appendChild(el('p', '', 'إيصال تبرعك جاهز'));
      b.type = 'button'; b.appendChild(icon()); b.appendChild(document.createTextNode('تحميل الإيصال'));
      b.onclick = function () { open(order); }; cd.appendChild(b);
      title.parentNode.insertBefore(cd, title.nextSibling);
      return cd;
    }
    function extras(cd, d) {                             /* روابط تحتاج ردّ قوقل: التحقق والإهداء */
      var l = el('button', 'hmr-lnk hmr-x2', 'تحقق من الإيصال'); l.type = 'button';
      l.onclick = function () { verifyPage(d.v); }; cd.appendChild(l);
      if (d.gift && d.gift.to && window.HMGift) {
        var gl = el('button', 'hmr-lnk hmr-x2', d.gift.mourn ? 'أرسل البطاقة' : 'أكمل إرسال هديتك'); gl.type = 'button';
        gl.style.marginInlineStart = '16px'; gl.onclick = function () { window.HMGift.complete(order); }; cd.appendChild(gl);
      }
    }
    (function place() {
      var title = document.querySelector('main.content-container .page-title') || document.querySelector('.z-order-invoice-view .page-title');
      if (!title) { var h1 = document.querySelector('.order-completed-content h1'); if (h1) title = h1.closest('.d-flex') || h1; }   /* صفحة الشكر بعد الدفع */
      if (!title) { if (++tries < 40) setTimeout(place, 250); return; }
      if (document.querySelector('.hmr-card')) return;
      if (thank) {                                       /* صفحة الشكر الأولى: كما كانت (تنتظر قوقل) */
        gR.then(function (d) { if (!d || !d.ok) return; var cd = build(title); if (cd) { extras(cd, d); loadAssets(); } }).catch(function () {});
        return;
      }
      zP.then(function (paid) {
        if (!paid) return;                               /* غير مدفوع حسب زد: لا شيء */
        var cd = build(title); if (!cd) return;
        loadAssets();
        gR.then(function (d) { if (d && d.ok && cd.isConnected) extras(cd, d); }).catch(function () {});
      });
    })();
  }

  window.HMReceipt = {open: open, verify: verifyPage};

  function route() {
    var h = location.hash || '', m = h.match(/^#receipt=([A-Za-z0-9]{4}-?[A-Za-z0-9]{4})$/);
    if (m) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} verifyPage(m[1].replace('-', '').toUpperCase()); return; }
    if (location.pathname === '/account-orders') { ordersPage(); return; }
    var ord = orderFromPath(location.pathname);
    if (ord) card(ord);
  }

  /* «طلباتي وإيصالاتي»: زر «الإيصال» بجانب «مشاهدة» + بطاقات الجوال + «بانتظار الدفع» (148c، معتمد 2026-11-25) */
  function ordersPage() {
    if (!document.getElementById('hmr-orders-css')) {
      var s = el('style'); s.id = 'hmr-orders-css';
      s.textContent = 'table.order-table td.order-action{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}' +
        'table.order-table td.order-action a.btn,table.order-table td.order-action .hmr-rbtn{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;gap:6px;width:120px;height:40px!important;margin:6px 0 0!important;padding:0 10px!important;border-radius:10px!important;font-size:15px!important;font-weight:700!important;text-decoration:none!important;line-height:1!important;cursor:pointer}' +
        'table.order-table td.order-action a.btn{background:#fff!important;color:' + NAVY + '!important;border:2px solid ' + NAVY + '!important}' +
        'table.order-table td.order-action .hmr-rbtn{background:' + NAVY + '!important;color:#fff!important;border:2px solid ' + NAVY + '!important;font-family:inherit}' +
        'table.order-table td.order-action .hmr-wait{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;width:120px;height:40px;margin:6px 0 0;padding:2px 10px 0;border-radius:10px;background:#F1F3F5;color:' + INK2 + ';font-size:15px;font-weight:700;line-height:1;cursor:default;font-family:inherit}' +
        '@media (max-width:767px){' +
        'table.order-table,table.order-table tbody{display:block!important;width:100%!important;border:0!important}' +
        'table.order-table tbody tr{display:grid!important;grid-template-columns:1fr auto;grid-template-areas:"num st" "dt tot" "act act";gap:8px 10px;align-items:center;background:#fff;border:1px solid ' + LINE + '!important;border-radius:14px;padding:14px!important;margin:0 0 12px!important;box-shadow:0 1px 3px rgba(18,103,98,.06)}' +
        'table.order-table tbody tr td{display:block!important;width:auto!important;padding:0!important;border:0!important;text-align:right!important}' +
        'table.order-table td.order-status::before,table.order-table td.order-date::before,table.order-table td.order-total::before,table.order-table td.order-action::before,table.order-table td.order-date::after,table.order-table td.order-total::after{display:none!important;content:none!important}' +
        'table.order-table td.order-number{grid-area:num;display:flex!important;direction:rtl!important;align-items:center!important;gap:6px;justify-content:flex-start;font-size:16px;font-weight:700}' +
        'table.order-table td.order-number::before{content:"رقم التبرع"!important;font-weight:400;font-size:13px;color:' + INK2 + ';width:auto!important;min-width:0!important;max-width:none!important;padding:0!important;margin:0!important;text-align:right!important;flex:none!important;position:relative!important;top:-1px!important;line-height:1.2!important;display:block!important}' +
        'table.order-table td.order-number a{direction:ltr;position:relative;top:1px}' +
        'table.order-table td.order-status{grid-area:st;justify-self:end;width:max-content!important;min-width:0!important;max-width:none!important;height:26px;display:flex!important;align-items:center;justify-content:center;line-height:1!important;box-sizing:border-box;padding:0 12px 1px!important;font-size:13px!important;font-weight:700;border-radius:999px;text-align:center!important}' +
        'table.order-table td.hmr-st-ok{background:#DFF3E6;color:' + NAVY + '}table.order-table td.hmr-st-wait{background:#F1F3F5;color:' + INK2 + '}' +
        'table.order-table td.order-date{grid-area:dt;font-size:13px;color:' + INK2 + '}' +
        'table.order-table td.order-total{grid-area:tot;justify-self:end;font-size:17px;font-weight:800;color:' + NAVY + '}' +
        'table.order-table td.order-action{grid-area:act;display:flex!important;gap:8px;flex-wrap:nowrap!important;padding-top:4px!important}' +
        'table.order-table td.order-action a.btn,table.order-table td.order-action .hmr-rbtn,table.order-table td.order-action .hmr-wait{flex:1 1 0;width:auto!important;margin:0!important;height:42px!important}' +
        'table.order-table td.order-action a.btn{padding:3px 10px 0!important}' +
        '}';
      document.head.appendChild(s);
    }
    var fill = function () {
      document.documentElement.classList.add('hm-ord-ok');   /* يُظهر الجدول المخفي مبكراً في «كود Css الخاص» */
      var h1 = document.querySelector('h1');
      if (h1 && (h1.textContent || '').trim() === 'طلباتي') h1.textContent = 'طلباتي وإيصالاتي';
      document.querySelectorAll('table.order-table tbody tr').forEach(function (tr) {
        var st = tr.querySelector('td.order-status');
        if (st && (st.textContent || '').trim() === 'تم التوصيل') st.textContent = 'تم التبرع';
        if (st) { st.classList.remove('hmr-st-ok', 'hmr-st-wait'); st.classList.add((st.textContent || '').trim() === 'تم التبرع' ? 'hmr-st-ok' : 'hmr-st-wait'); }
        if (tr.querySelector('.hmr-rbtn,.hmr-wait')) return;
        var a = null, as = tr.querySelectorAll('a');
        for (var i = 0; i < as.length; i++) if (/\/invoice/.test(as[i].getAttribute('href') || '')) { a = as[i]; break; }
        var o = a && orderFromPath(a.getAttribute('href'));
        if (!o) return;
        var b = el('button', 'hmr-rbtn'); b.type = 'button';
        b.appendChild(icon()); b.appendChild(document.createTextNode('الإيصال'));
        b.querySelector('svg').setAttribute('width', '16'); b.querySelector('svg').setAttribute('height', '16');
        b.onclick = function () { open(o); };
        a.parentNode.appendChild(b);
        /* غير المدفوع: «بانتظار الدفع» بدل الزر (قرار عبدالله 2026-11-25 13:47) */
        fetch('/api/v1/orders/' + o + '/invoice', {headers: {Accept: 'application/json'}})
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var od = j && (j.order || (j.data && j.data.order));
            if (od && String(od.payment_status || '').toLowerCase() !== 'paid' && b.isConnected) {
              var w = el('span', 'hmr-wait', 'بانتظار الدفع'); b.replaceWith(w);
            }
          }).catch(function () {});   // عند الخطأ يبقى الزر
      });
    };
    fill(); setTimeout(fill, 800); setTimeout(fill, 2500); setTimeout(fill, 6000);
    var tm = 0; try { new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(fill, 150); }).observe(document.body, {childList: true, subtree: true}); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route); else route();
  window.addEventListener('hashchange', route);
})();
