'use strict';

const PDFDocument   = require('/tmp/pdfgen/node_modules/pdfkit');
const fs            = require('fs');
const ArabicReshaper = require('/tmp/pdfgen/node_modules/arabic-reshaper');
const bidiFactory   = require('/tmp/pdfgen/node_modules/bidi-js');

const bidi = bidiFactory();

// ── دالة معالجة النص العربي ─────────────────────────────────────────────────
// تُشكّل الحروف (reshape) وتعكس الترتيب البصري (BiDi) لعرض سليم في PDFKit
const ar = (text) => {
  if (!text || !text.trim()) return text;
  if (!/[\u0600-\u06FF]/.test(text)) return text; // إنجليزي فقط
  const reshaped = ArabicReshaper.convertArabic(text);
  const levels   = bidi.getEmbeddingLevels(reshaped, 'rtl');
  return bidi.getReorderedString(reshaped, levels);
};

const OUTPUT      = '/home/runner/workspace/SniperSheet_Master_Edition.pdf';
const FONT_CAIRO  = '/tmp/pdfgen/fonts/Cairo.ttf';
const DOMAIN      = '8e832e48-8f9e-4168-9828-29c19ce7accc-00-12f81e1kjeof1.picard.replit.dev';
const MANIFEST_URL = `https://${DOMAIN}/api/addin/manifest.xml`;
const BASE_URL    = `https://${DOMAIN}`;

const C = {
  green:'#107C41', greenDk:'#0B5C30', greenLt:'#E8F5EE',
  white:'#FFFFFF', grey50:'#F8FAFB', grey100:'#EEF2F5',
  grey200:'#DDE3EA', grey400:'#9CA3AF', grey500:'#6B7280',
  grey600:'#4B5563', grey700:'#374151', grey900:'#111827',
  blue:'#1D4ED8', blueLt:'#DBEAFE',
  amber:'#92400E', amberLt:'#FEF3C7',
  purple:'#5B21B6', purpleLt:'#EDE9FE',
  gold:'#B7791F',
};

const doc = new PDFDocument({
  size:'A4', margins:{top:0,bottom:0,left:0,right:0}, bufferPages:true,
  info:{
    Title:'SniperSheet Master Edition — الدليل الثنائي الشامل',
    Author:'Mustafa Alsahlany · مصطفى السهلاني',
    Subject:'Excel Add-in · Arabic + English Complete Reference Guide',
    Creator:'SniperSheet PDF Engine v3.0 — RTL Fixed',
  },
});
doc.pipe(fs.createWriteStream(OUTPUT));
if (fs.existsSync(FONT_CAIRO)) doc.registerFont('Cairo', FONT_CAIRO);

const F  = 'Cairo';
const M  = 'Courier';
const W  = doc.page.width;   // 595.28
const H  = doc.page.height;  // 841.89
const ML = 46, MR = 46;
const CW = W - ML - MR;

// ─── رسوميات أساسية ─────────────────────────────────────────────────────────
const rr = (x,y,w,h,r,fill,stroke) => {
  doc.roundedRect(x,y,w,h,r);
  if (fill&&stroke) doc.fillAndStroke(fill,stroke);
  else if (fill)    doc.fillColor(fill).fill();
  else if (stroke)  doc.strokeColor(stroke).stroke();
};
const ln = (x1,y1,x2,y2,color=C.grey200,lw=0.5) =>
  doc.moveTo(x1,y1).lineTo(x2,y2).strokeColor(color).lineWidth(lw).stroke();

// ─── تذييل الصفحة ──────────────────────────────────────────────────────────
const masterFooter = (pageNum, dark=false) => {
  const fy = H - 30;
  const lc = dark ? 'rgba(255,255,255,0.22)' : C.grey200;
  const tc = dark ? 'rgba(255,255,255,0.75)' : C.grey400;
  doc.moveTo(ML,fy).lineTo(W-MR,fy).strokeColor(lc).lineWidth(0.5).stroke();
  doc.font(F).fontSize(7.5).fillColor(tc);
  doc.text('Developed by: Mustafa Alsahlany', ML, fy+8, {lineBreak:false});
  const cTxt = 'SniperSheet Master Edition · 2026';
  doc.text(cTxt, (W - doc.widthOfString(cTxt))/2, fy+8, {lineBreak:false});
  const rTxt = `Page ${pageNum} of 17`;
  doc.text(rTxt, W-MR-doc.widthOfString(rTxt), fy+8, {lineBreak:false});
};

// ─── رأس صفحة عربية (الشعار يسار، العنوان يمين) ────────────────────────────
const arPageHeader = (sectionAr) => {
  doc.rect(0,0,W,7).fill(C.green);
  rr(ML,16,36,36,7,C.greenLt);
  doc.font(F).fontSize(18).text('🎯', ML+6, 23);
  doc.font(F).fontSize(15).fillColor(C.green)
    .text('SniperSheet', ML+46, 18, {lineBreak:false});
  doc.font(F).fontSize(9).fillColor(C.grey400)
    .text(ar(sectionAr), ML+46, 36, {width:CW-50, align:'right', lineBreak:false});
  ln(ML,62,W-MR,62,C.green,1.5);
};

// رأس صفحة إنجليزية
const enPageHeader = (sectionEn) => {
  doc.rect(0,0,W,7).fill(C.green);
  rr(ML,16,36,36,7,C.greenLt);
  doc.font(F).fontSize(18).text('🎯', ML+6, 23);
  doc.font(F).fontSize(15).fillColor(C.green).text('SniperSheet', ML+46, 18, {lineBreak:false});
  doc.font(F).fontSize(9).fillColor(C.grey400).text(sectionEn, ML+46, 36, {lineBreak:false});
  ln(ML,62,W-MR,62,C.green,1.5);
};

// ─── رأس قسم عربي (أيقونة يسار، نص يمين) ───────────────────────────────────
const arSecHead = (icon, titleAr, subAr, y) => {
  rr(ML,y,36,36,8,C.green);
  doc.font(F).fontSize(18).text(icon, ML+7, y+7);
  doc.font(F).fontSize(15).fillColor(C.grey900)
    .text(ar(titleAr), ML+46, y+2, {width:CW-50, align:'right', lineBreak:false});
  doc.font(F).fontSize(10).fillColor(C.grey600)
    .text(ar(subAr), ML+46, y+21, {width:CW-50, align:'right', lineBreak:false});
  return y+50;
};

// رأس قسم إنجليزي
const enSecHead = (icon, title, sub, y) => {
  rr(ML,y,36,36,8,C.green);
  doc.font(F).fontSize(18).text(icon, ML+7, y+7);
  doc.font(F).fontSize(15).fillColor(C.grey900).text(title, ML+46, y+2, {lineBreak:false});
  doc.font(F).fontSize(10).fillColor(C.grey600).text(sub, ML+46, y+21, {lineBreak:false});
  return y+50;
};

// ─── نقطة قائمة عربية (النقطة على اليمين، النص يمين) ──────────────────────
const arBullet = (txt, x, y, w) => {
  doc.circle(x+w-5, y+6, 2.5).fill(C.green); // نقطة على اليمين
  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text(ar(txt), x, y, {width:w-14, align:'right', lineGap:1});
  return y + doc.currentLineHeight() + 5;
};

// نقطة قائمة إنجليزية (النقطة يسار)
const enBullet = (txt, x, y, w) => {
  doc.circle(x+5, y+6, 2.5).fill(C.green);
  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text(txt, x+14, y, {width:w-14, lineGap:1});
  return y + doc.currentLineHeight() + 5;
};

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 1 — رسالة التقديم التنفيذية (ثنائية اللغة)
// ═══════════════════════════════════════════════════════════════════════════════
{
  doc.rect(0,0,W,H).fill('#0A3D24');
  for (let i=0;i<30;i++) {
    doc.rect(0,H*(i/30),W,H/30).fillOpacity(0.025*i).fill('#107C41');
  }
  doc.fillOpacity(1);
  doc.circle(W+40,-40,280).fillOpacity(0.06).fill(C.white); doc.fillOpacity(1);
  doc.circle(-40,H+40,220).fillOpacity(0.06).fill(C.white); doc.fillOpacity(1);
  doc.moveTo(0,H*0.72).lineTo(W,H*0.58).strokeColor('rgba(255,255,255,0.04)').lineWidth(80).stroke();

  doc.rect(ML,48,4,56).fill(C.gold);
  doc.font(F).fontSize(9).fillColor(C.gold)
    .text('FROM THE DEVELOPER · رسالة المطوّر', ML+20, 52, {lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor('rgba(255,255,255,0.45)')
    .text('EXECUTIVE COVER LETTER · رسالة التقديم الرسمية', ML+20, 66, {lineBreak:false});

  doc.font(F).fontSize(36).fillColor(C.white).text('The Bridge Between', ML, 116, {lineBreak:false});
  doc.font(F).fontSize(36).fillColor(C.gold).text('Engineering & AI', ML, 154, {lineBreak:false});
  doc.font(F).fontSize(15).fillColor('rgba(255,255,255,0.75)')
    .text(ar('الجسر بين الهندسة والذكاء الاصطناعي'), ML, 198, {width:CW, align:'right', lineBreak:false});
  doc.rect(W-MR-50,228,50,2).fill(C.gold); // خط ذهبي يمين

  // ── عمود اليسار: الرسالة الإنجليزية ────────────────────────────────────────
  const colW = (CW-20)/2;
  const enLines = [
    {t:'Dear Reader,', bold:true},
    {t:''},
    {t:'SniperSheet was born from a frustration shared'},
    {t:'by engineers, analysts, and project managers:'},
    {t:'hours lost to formula syntax instead of insight.'},
    {t:''},
    {t:'This add-in connects Excel to Groq AI (Llama'},
    {t:'3.3 70B — 100% free). Describe your calculation'},
    {t:'in plain English or Arabic → get the precise'},
    {t:'formula with explanation and confidence score.'},
    {t:''},
    {t:'Users in Iraq and the Arab world need zero VPN'},
    {t:'— all AI calls route through our US Replit server.'},
    {t:''},
    {t:'Build smarter. Calculate faster.', bold:true, color:C.gold},
  ];
  let ly = 244;
  enLines.forEach(({t,bold,color}) => {
    if (!t) { ly+=7; return; }
    doc.font(F).fontSize(bold?10:9.5).fillColor(color||(bold?C.gold:'rgba(255,255,255,0.83)'))
      .text(t, ML, ly, {lineBreak:false});
    ly += bold?14:12;
  });

  // ── عمود اليمين: الرسالة العربية (RTL) ──────────────────────────────────────
  const arColX = ML+colW+20;
  ln(ML+colW+10, 240, ML+colW+10, ly+20, 'rgba(255,255,255,0.12)', 0.5);
  doc.font(F).fontSize(8).fillColor(C.gold)
    .text(ar('النسخة العربية'), arColX, 244, {width:colW, align:'right', lineBreak:false});

  // الرسالة العربية — كل سطر من خلال ar() ليظهر RTL
  const arLetterData = [
    {t:'عزيزي القارئ،', bold:true},
    {t:''},
    {t:'وُلد SniperSheet من إحساس عميق'},
    {t:'بمعاناة المهندسين والمحللين الذين'},
    {t:'يقضون ساعات في المعادلات بدل'},
    {t:'التركيز على صنع القرار الذكي.'},
    {t:''},
    {t:'توصِّل هذه الإضافة Excel بذكاء'},
    {t:'Groq AI مجاناً — صِف ما تريد'},
    {t:'حسابه بالعربية أو الإنجليزية'},
    {t:'فتحصل على المعادلة الدقيقة فوراً.'},
    {t:''},
    {t:'مستخدمو العراق والعالم العربي'},
    {t:'لا يحتاجون VPN — كل الطلبات'},
    {t:'تمر عبر خادمنا الأمريكي بأمان.'},
    {t:''},
    {t:'ابنِ بذكاء. احسب بسرعة.', bold:true, color:C.gold},
  ];
  let aly = 256;
  arLetterData.forEach(({t,bold,color}) => {
    if (!t) { aly+=7; return; }
    const col = color||(bold?C.gold:'rgba(255,255,255,0.83)');
    doc.font(F).fontSize(bold?10:9.5).fillColor(col)
      .text(ar(t), arColX, aly, {width:colW, align:'right', lineBreak:false});
    aly += bold?14:12;
  });

  // ── التوقيع ──────────────────────────────────────────────────────────────────
  const sigY = Math.max(ly,aly)+20;
  doc.rect(ML,sigY,CW,0.5).fill('rgba(255,255,255,0.15)');
  rr(ML,sigY+12,52,52,6,'rgba(255,255,255,0.1)');
  doc.font(F).fontSize(24).text('👤', ML+8, sigY+18);
  doc.font(F).fontSize(14).fillColor(C.white)
    .text('Mustafa Alsahlany', ML+66, sigY+14, {lineBreak:false});
  doc.font(F).fontSize(11).fillColor(C.gold)
    .text(ar('مصطفى السهلاني'), ML+66, sigY+32, {width:CW-80, align:'right', lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor('rgba(255,255,255,0.55)')
    .text('Developer & Designer · SniperSheet · April 2026', ML+66, sigY+50, {lineBreak:false});

  const edPills = ['🌐 Bilingual','📘 17 Pages','🤖 Groq AI','100% Free','v1.0.0'];
  let epx=ML;
  const epy=sigY+72;
  edPills.forEach(p => {
    const pw=doc.font(F).fontSize(8.5).widthOfString(p)+20;
    doc.roundedRect(epx,epy,pw,20,10).fillOpacity(0.15).fill(C.white); doc.fillOpacity(1);
    doc.font(F).fontSize(8.5).fillColor(C.white).text(p, epx+10, epy+5, {lineBreak:false});
    epx+=pw+8;
  });

  masterFooter(1,true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 2 — غلاف القسم العربي
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  doc.rect(0,0,W,H).fill(C.greenDk);
  for (let i=0;i<20;i++) doc.rect(0,H*(i/20),W,H/20).fillOpacity(0.03*i).fill('#1aab57');
  doc.fillOpacity(1);
  doc.circle(W-60,130,200).fillOpacity(0.05).fill(C.white);
  doc.circle(60,H-100,160).fillOpacity(0.05).fill(C.white);
  doc.fillOpacity(1);

  const labelW=280, labelX=(W-labelW)/2;
  doc.roundedRect(labelX,44,labelW,28,14).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(9.5).fillColor(C.white)
    .text(ar('القسم العربي  ·  الجزء الأول من الدليل الموحّد'),
      labelX, 54, {align:'center', width:labelW, lineBreak:false});

  const lsz=82, lx=(W-lsz)/2;
  doc.roundedRect(lx,88,lsz,lsz,16).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(36).text('🎯', lx, 106, {align:'center', width:lsz});

  doc.font(F).fontSize(48).fillColor(C.white).text('SniperSheet', 0, 186, {align:'center', width:W});
  doc.font(F).fontSize(20).fillColor(C.white).fillOpacity(0.9)
    .text(ar('محرك المعادلات بالذكاء الاصطناعي'), 0, 248, {align:'center', width:W});
  doc.font(F).fontSize(12).fillColor(C.white).fillOpacity(0.7)
    .text(ar('للمهندسين والمحللين الماليين ومديري المشاريع'), 0, 276, {align:'center', width:W});
  doc.fillOpacity(1);

  ln(W/2-30,308,W/2+30,308,C.white,2);

  const arStats=[['35+',ar('نمط معادلة')],['4',ar('أقسام ذكية')],['100%',ar('ذكاء اصطناعي مجاني')],['2',ar('لغتان')]];
  const asw=CW/arStats.length;
  arStats.forEach(([n,l],i) => {
    const sx=ML+i*asw;
    doc.font(F).fontSize(24).fillColor(C.white).text(n, sx, 328, {align:'center', width:asw});
    doc.font(F).fontSize(9).fillColor(C.white).fillOpacity(0.65)
      .text(l, sx, 360, {align:'center', width:asw});
    doc.fillOpacity(1);
  });

  const arPills=[ar('المحرك الذكي'),ar('الأوامر العربية'),ar('أبعاد الخلايا'),ar('الأدوات'),ar('مجاني تماماً')];
  let apx=ML;
  arPills.forEach(p => {
    const pw=doc.font(F).fontSize(9.5).widthOfString(p)+24;
    doc.roundedRect(apx,400,pw,26,13).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
    doc.font(F).fontSize(9.5).fillColor(C.white).text(p, apx+12, 407, {lineBreak:false});
    apx+=pw+8;
  });

  ln(ML,H-62,W-MR,H-62,C.white,0.2);
  doc.font(F).fontSize(10).fillColor(C.white).fillOpacity(0.85)
    .text(ar('مصطفى السهلاني — Mustafa Alsahlany'), ML, H-48, {width:CW, align:'right', lineBreak:false});
  doc.fillOpacity(1);

  masterFooter(2,true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 3 — نظرة عامة على المنتج
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  arPageHeader('نظرة عامة على المنتج — الدليل الموحّد');
  let y=78;
  y=arSecHead('📋', 'ما هو SniperSheet؟', 'نظرة شاملة على الإضافة وأبرز مزاياها', y);

  rr(ML,y,CW,95,9,C.greenLt);
  ln(W-MR,y,W-MR,y+95,C.green,3.5); // خط أخضر على اليمين لـ RTL
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text(ar('SniperSheet إضافة Excel احترافية تعمل بوصفها لوحة مهام داخل Microsoft Excel. تُحوِّل وصفك العربي أو الإنجليزي إلى معادلة Excel دقيقة خلال ثوانٍ. تعتمد على نموذج Llama 3.3 70B المجاني من Groq AI، وتمر جميع الطلبات عبر خادم Replit الأمريكي ليتمكن مستخدمو العراق والعالم العربي من الوصول إليها مباشرةً دون أي VPN.'),
      ML+10, y+10, {width:CW-22, align:'right', lineGap:3.5});
  y+=109;

  const c3w=(CW-20)/3;
  const arCards=[
    ['🤖', 'محرك Groq للذكاء الاصطناعي', 'نموذج Llama 3.3 70B\nمجاني بلا بطاقة ائتمان'],
    ['🌐', 'ثنائي اللغة الكامل',           'عربي وإنجليزي بالكامل\nدعم RTL في جميع الأقسام'],
    ['🔒', 'بنية الوكيل الآمنة',            'خادم أمريكي يُوجِّه طلبات AI\nلا VPN ولا مفاتيح مكشوفة'],
    ['⚡', 'محرك محلي احتياطي',            '35+ نمط فوري\nيعمل بلا إنترنت، صفر تأخير'],
    ['📐', 'تكامل Office.js',              'صلاحية ReadWriteDocument\nقراءة وكتابة في Excel'],
    ['📱', 'تصميم متجاوب',                 'تمرير سلس، عرض 400px\nهوامش داخلية 10px'],
  ];
  for (let i=0;i<2;i++) {
    for (let j=0;j<3;j++) {
      const c=arCards[i*3+j];
      const cx=ML+j*(c3w+10), cy=y+i*96;
      rr(cx,cy,c3w,88,9,C.grey50,C.grey200);
      doc.font(F).fontSize(20).text(c[0], cx+c3w-36, cy+10); // أيقونة يمين
      doc.font(F).fontSize(10.5).fillColor(C.grey900)
        .text(ar(c[1]), cx+6, cy+36, {width:c3w-10, align:'right', lineBreak:false});
      doc.font(F).fontSize(9).fillColor(C.grey600)
        .text(ar(c[2]), cx+6, cy+52, {width:c3w-10, align:'right'});
    }
  }
  y+=2*96+12;

  rr(ML,y,CW,54,8,C.green);
  doc.font(F).fontSize(18).text('💡', W-MR-40, y+16); // أيقونة يمين
  doc.font(F).fontSize(11).fillColor(C.white)
    .text(ar('صِف ما تريد حسابه بالعربية أو الإنجليزية ← SniperSheet يُولِّد المعادلة الدقيقة مع شرح ونسبة ثقة وتلميحات تنسيق'),
      ML+10, y+14, {width:CW-60, align:'right', lineGap:3});

  masterFooter(3);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 4 — المحرك الذكي والأوامر
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  arPageHeader('القسم الأول والثاني — المحرك الذكي والأوامر');
  let y=78;
  y=arSecHead('✨', 'القسم الأول: المحرك الذكي', 'لغة طبيعية ← معادلة Excel عبر Groq AI', y);

  rr(ML,y,CW,148,9,C.white,C.grey200);
  rr(ML,y,CW,36,9,C.greenLt,C.grey200);
  doc.rect(ML,y+24,CW,12).fill(C.greenLt);
  // رأس البطاقة: أيقونة يمين، نص يمين
  rr(W-MR-28,y+8,24,22,5,C.greenLt);
  doc.font(F).fontSize(13).text('✨', W-MR-25, y+12);
  doc.font(F).fontSize(12).fillColor(C.grey900)
    .text(ar('المحرك الذكي — Smart Hub'), ML+10, y+10, {width:CW-46, align:'right', lineBreak:false});
  // شارة AI
  rr(ML+10,y+11,86,14,7,C.greenLt);
  doc.font(F).fontSize(8).fillColor(C.green)
    .text(ar('مدعوم بالذكاء الاصطناعي'), ML+10, y+15, {width:86, align:'center', lineBreak:false});
  ln(ML,y+36,W-MR,y+36,C.grey200,0.5);

  const half=(CW-12)/2;
  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text(ar('القسم الرئيسي في SniperSheet. اكتب وصف العملية الحسابية بالعربية أو الإنجليزية — مثل "احسب مجموع مبيعات الموظفين الذين تجاوزت مبيعاتهم عشرة آلاف" — ثم انقر "تحليل ذكي". يُعالج المحرك طلبك عبر Groq AI ويُعيد المعادلة الدقيقة مع شرح وافٍ ونسبة ثقة ونصائح تنسيق مشروط.'),
      ML+half+12, y+44, {width:half-12, align:'right', lineGap:3});

  const smBullets=[
    'توليد المعادلات بالذكاء الاصطناعي Groq',
    'نسبة ثقة 0-100% لكل معادلة',
    'كشف نوع المعادلة تلقائياً (IF، VLOOKUP)',
    'رادار الكلمات: يكتشف الأخطاء الإملائية',
    'اقتراحات تنسيق: ألوان الخلايا والخط',
    'سجل كامل بالتاريخ والوقت',
    'مكتبة أمثلة عربية وإنجليزية',
    'اختصار Ctrl+Enter للتحليل الفوري',
    'محرك محلي بلا إنترنت',
    'تبديل تلقائي بين 3 نماذج AI',
  ];
  let by=y+44;
  smBullets.forEach(b => { by=arBullet(b, ML+10, by, half-10); });
  y+=162;

  y=arSecHead('⌨️', 'القسم الثاني: الأوامر', 'أسماء الدوال بالعربية لحسابات فورية ودقيقة', y);
  rr(ML,y,CW,128,9,C.white,C.grey200);
  rr(ML,y,CW,36,9,C.blueLt,C.grey200);
  doc.rect(ML,y+24,CW,12).fill(C.blueLt);
  rr(W-MR-28,y+8,24,22,5,C.blueLt);
  doc.font(F).fontSize(13).text('⌨️', W-MR-25, y+12);
  doc.font(F).fontSize(12).fillColor(C.grey900)
    .text(ar('الأوامر — Commands'), ML+10, y+10, {width:CW-46, align:'right', lineBreak:false});
  rr(ML+10,y+11,90,14,7,C.blueLt);
  doc.font(F).fontSize(8).fillColor(C.blue)
    .text(ar('أسماء عربية فورية'), ML+10, y+15, {width:90, align:'center', lineBreak:false});
  ln(ML,y+36,W-MR,y+36,C.grey200,0.5);

  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text(ar('اكتب اسم الدالة بالعربية أو الإنجليزية مع نطاق الخلايا لتحصل على النتيجة فوراً. مثال: "جمع B1:B10" أو "متوسط A1:A20"'),
      ML+half+12, y+44, {width:half-12, align:'right', lineGap:3});

  const cmdBullets=[
    'جمع / SUM — مجموع نطاق الخلايا',
    'ضرب / MULTIPLY — حاصل ضرب القيم',
    'متوسط / AVERAGE — الوسط الحسابي',
    'أكبر / MAX — القيمة القصوى',
    'أصغر / MIN — القيمة الدنيا',
    'عدد / COUNT — عدد الخلايا الرقمية',
    'مكافأة / BONUS — يضيف 15% تلقائياً',
    'ضريبة / TAX — يحسب ضريبة 15%',
    'نسبة / PERCENTAGE — النسبة المئوية',
    'جدول مرجعي قابل للبحث',
  ];
  let cy2=y+44;
  cmdBullets.forEach(b => { cy2=arBullet(b, ML+10, cy2, half-10); });

  masterFooter(4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 5 — أبعاد الخلايا والأدوات المتقدمة
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  arPageHeader('القسم الثالث والرابع — الأبعاد والأدوات');
  let y=78;
  y=arSecHead('📐', 'القسم الثالث: أبعاد الخلايا', 'حساب العرض والارتفاع للنص العربي والإنجليزي', y);

  rr(ML,y,CW,116,9,C.white,C.grey200);
  rr(ML,y,CW,36,9,C.purpleLt,C.grey200);
  doc.rect(ML,y+24,CW,12).fill(C.purpleLt);
  rr(W-MR-28,y+8,24,22,5,C.purpleLt);
  doc.font(F).fontSize(13).text('📐', W-MR-25, y+12);
  doc.font(F).fontSize(12).fillColor(C.grey900)
    .text(ar('أبعاد الخلايا — Cell Dimensions'), ML+10, y+10, {width:CW-46, align:'right', lineBreak:false});
  rr(ML+10,y+11,104,14,7,C.purpleLt);
  doc.font(F).fontSize(8).fillColor(C.purple)
    .text(ar('يدعم العربية والإنجليزية'), ML+10, y+15, {width:104, align:'center', lineBreak:false});
  ln(ML,y+36,W-MR,y+36,C.grey200,0.5);

  const half3=(CW-12)/2;
  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text(ar('يحسب العرض والارتفاع المثاليَّين للخلية استناداً إلى محتواها، مع مراعاة خصائص النص العربي وعرض أحرفه واتجاهه من اليمين لليسار، إضافةً إلى حجم الخط والغامق والمائل وهوامش الحماية.'),
      ML+half3+12, y+44, {width:half3-12, align:'right', lineGap:3});

  const dimBullets=[
    'حساب عرض النص العربي بدقة عالية',
    'مراعاة حجم الخط والغامق والمائل',
    'معالجة خلية واحدة أو دُفعات كاملة',
    'إخراج الأبعاد بالبكسل ووحدات Excel',
    'احتساب هوامش الحماية تلقائياً',
    'نسخ النتائج إلى الحافظة بنقرة واحدة',
  ];
  let dy=y+44;
  dimBullets.forEach(b => { dy=arBullet(b, ML+10, dy, half3-10); });
  y+=130;

  y=arSecHead('🔧', 'القسم الرابع: الأدوات المتقدمة', 'ثلاث أدوات احترافية في قسم واحد متكامل', y);

  const arTools=[
    {icon:'🔍', title:'رادار الخلايا الفارغة', sub:'Empty Field Radar',
     bg:C.amberLt, bdr:'#FDE68A', fg:C.amber,
     desc:'الصقِ بياناتك CSV أو تبويب ثم انقر بحث. تُنتج شبكة ملوَّنة: الخلايا المملوءة خضراء والفارغة حمراء.',
     bullets:['لصق CSV أو بيانات تبويب','شبكة: مملوء=أخضر، فارغ=أحمر','إحداثيات الخلايا الفارغة','كشف صف العناوين','ملخص المملوء والفارغ']},
    {icon:'🖨️', title:'الضبط الذكي للطباعة', sub:'Smart Print-Fit',
     bg:C.blueLt, bdr:'#93C5FD', fg:C.blue,
     desc:'أدخِل الأعمدة والصفوف ونوع الورق (A4/A3) فتُحسَب وحدات العرض وحجم الخط لطباعة احترافية.',
     bullets:['دعم ورق A4 و A3','الوضع الرأسي والأفقي','وحدات عرض أعمدة Excel','حجم خط مُوصى به','جاهز للطباعة في 3 نقرات']},
    {icon:'📄', title:'التقرير الاحترافي', sub:'Professional Report',
     bg:C.greenLt, bdr:'#86EFAC', fg:C.green,
     desc:'الصقِ بياناتك الخام لتتحول إلى جدول HTML منسَّق مع تلوين متناوب للصفوف ثم اطبع بنقرة واحدة.',
     bullets:['جدول HTML من بيانات خام','تلوين متناوب للصفوف','عناوين أعمدة بارزة','كشف العناوين تلقائياً','طباعة مباشرة للمتصفح']},
  ];
  const tw=(CW-16)/3;
  arTools.forEach((tool,i) => {
    const tx=ML+i*(tw+8), ty=y, th=196;
    rr(tx,ty,tw,th,9,C.white,tool.bdr);
    rr(tx,ty,tw,50,9,tool.bg,tool.bdr);
    doc.rect(tx,ty+34,tw,16).fill(tool.bg);
    doc.font(F).fontSize(20).text(tool.icon, tx+tw-36, ty+10); // أيقونة يمين
    doc.font(F).fontSize(10.5).fillColor(C.grey900)
      .text(ar(tool.title), tx+6, ty+34, {width:tw-14, align:'right', lineBreak:false});
    doc.font(F).fontSize(8).fillColor(tool.fg)
      .text(tool.sub, tx+6, ty+50, {lineBreak:false}); // sub English
    ln(tx,ty+50,tx+tw,ty+50,tool.bdr,0.5);
    doc.font(F).fontSize(9).fillColor(C.grey700)
      .text(ar(tool.desc), tx+6, ty+62, {width:tw-10, align:'right', lineGap:1.5});
    let ty2=ty+116;
    tool.bullets.forEach(b => {
      doc.circle(tx+tw-12, ty2+5, 2).fill(tool.fg); // نقطة يمين
      doc.font(F).fontSize(8.5).fillColor(C.grey700)
        .text(ar(b), tx+6, ty2, {width:tw-20, align:'right', lineBreak:false});
      ty2+=14.5;
    });
  });

  masterFooter(5);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 6 — البنية التقنية والذكاء الاصطناعي
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  arPageHeader('البنية التقنية ونماذج الذكاء الاصطناعي');
  let y=78;
  y=arSecHead('🏗️', 'بنية الوكيل الذكي (Proxy)', 'المستخدم لا يحتاج VPN ولا مفاتيح API شخصية', y);

  const arNodes=[
    {icon:'💻', title:ar('متصفحك'),      lines:[ar('إضافة Excel'),ar('Task Pane 400px'),'React + Vite']},
    {icon:'🖥️', title:ar('خادم Replit'),  lines:['Express.js Proxy',ar('Node.js 24 — أمريكا'),ar('مفتاح API محمي')], green:true},
    {icon:'🤖', title:'Groq AI',          lines:['Llama 3.3 70B',ar('30 طلب/دقيقة'),ar('مجاني بلا فاتورة')]},
  ];
  const nw=130, nh=92;
  const ngap=(CW-nw*3)/2;
  arNodes.forEach((n,i) => {
    const nx=ML+i*(nw+ngap), ny=y;
    rr(nx,ny,nw,nh,10,n.green?C.green:C.grey50, n.green?C.green:C.grey200);
    doc.font(F).fontSize(22).text(n.icon, nx, ny+8, {align:'center', width:nw});
    doc.font(F).fontSize(11).fillColor(n.green?C.white:C.grey900)
      .text(n.title, nx, ny+36, {align:'center', width:nw});
    n.lines.forEach((l,li) => {
      doc.font(F).fontSize(8.5).fillColor(n.green?'rgba(255,255,255,0.75)':C.grey600)
        .text(l, nx+6, ny+52+li*12, {width:nw-12, lineBreak:false});
    });
    if (i<2) {
      const ax=nx+nw+6, ay=ny+nh/2;
      ln(ax,ay,ax+ngap-12,ay,C.green,1.5);
      doc.polygon([ax+ngap-12,ay-5],[ax+ngap-12,ay+5],[ax+ngap-4,ay]).fill(C.green);
    }
  });
  y+=nh+14;

  rr(ML,y,CW,40,7,C.blueLt,'#93C5FD');
  doc.font(F).fontSize(18).text('🔒', W-MR-36, y+9); // أيقونة يمين
  doc.font(F).fontSize(10).fillColor(C.blue)
    .text(ar('الأمان: يُخزَّن مفتاح GROQ_API_KEY كسرٍّ في خادم Replit ولا يُكشف للمستخدم أبداً. يتصل الجميع — بمن فيهم مستخدمو العراق — بنقطة HTTPS الخاصة بـ Replit فحسب، دون الحاجة إلى VPN.'),
      ML+10, y+10, {width:CW-54, align:'right', lineGap:2.5});
  y+=54;

  y=arSecHead('🤖', 'سلسلة نماذج الذكاء الاصطناعي', 'ثلاثة نماذج Groq مجانية + محرك محلي احتياطي فوري', y);

  const arModels=[
    {rank:ar('🥇 الأساسي'),   name:'llama-3.3-70b-versatile', p:'70B', rpm:'30', note:ar('أعلى جودة · الأحدث'),       bg:'#F0FDF4',bdr:'#86EFAC',fg:C.green},
    {rank:ar('🥈 الاحتياطي'),name:'llama3-70b-8192',          p:'70B', rpm:'30', note:ar('مستقر · سياق 8192 رمز'),    bg:C.blueLt, bdr:'#93C5FD',fg:C.blue},
    {rank:ar('🥉 الطارئ'),   name:'llama3-8b-8192',           p:'8B',  rpm:'30', note:ar('فائق السرعة · خفيف الوزن'), bg:C.amberLt,bdr:'#FCD34D',fg:C.amber},
    {rank:ar('🔧 بلا إنترنت'),name:ar('المحرك المحلي'),        p:'—',   rpm:'∞',  note:ar('35+ نمط · صفر تأخير'),      bg:C.purpleLt,bdr:'#C4B5FD',fg:C.purple},
  ];
  const mw=(CW-15)/4;
  arModels.forEach((m,i) => {
    const mx=ML+i*(mw+5), my=y;
    rr(mx,my,mw,96,8,m.bg,m.bdr);
    doc.font(F).fontSize(9).fillColor(m.fg)
      .text(m.rank, mx+6, my+10, {width:mw-12, align:'right', lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey900)
      .text(m.name, mx+6, my+26, {width:mw-12});
    doc.font(F).fontSize(8.5).fillColor(C.grey600)
      .text(`${m.p} params`, mx+6, my+60, {lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600)
      .text(`${m.rpm} RPM`, mx+6, my+72, {lineBreak:false});
    doc.font(F).fontSize(8).fillColor(C.grey400)
      .text(m.note, mx+6, my+82, {width:mw-12, align:'right', lineBreak:false});
  });
  y+=110;

  y=arSecHead('⚙️', 'المواصفات التقنية الكاملة', 'تفاصيل إعداد الإضافة ومنظومة التطوير', y);
  const specsL=[
    [ar('نوع الإضافة'),      'Task Pane'],
    [ar('عرض اللوحة'),      '400px'],
    [ar('مستوى الصلاحية'),  'ReadWriteDocument'],
    [ar('اللغة الافتراضية'),'ar-SA'],
    [ar('تبويب Ribbon'),    ar('SniperSheet مخصص')],
  ];
  const specsR=[
    [ar('الواجهة الأمامية'),  'React 18 + Vite + TypeScript'],
    [ar('الواجهة الخلفية'),  'Express.js + Node.js 24'],
    [ar('مكتبة AI'),          'Groq SDK'],
    [ar('مدير الحزم'),       'pnpm Monorepo'],
    [ar('الاستضافة'),        'Replit Autoscale'],
  ];
  const sw2=(CW-12)/2;
  [[specsL,ML],[specsR,ML+sw2+12]].forEach(([specs,sx]) => {
    rr(sx,y,sw2,specs.length*26+16,8,C.grey50,C.grey200);
    specs.forEach(([k,v],i) => {
      const sy2=y+10+i*26;
      doc.font(F).fontSize(8.5).fillColor(C.grey600)
        .text(k, sx+10, sy2, {width:sw2-18, align:'right', lineBreak:false});
      doc.font(F).fontSize(10).fillColor(C.grey900)
        .text(v, sx+10, sy2+13, {lineBreak:false});
      if (i<specs.length-1) ln(sx+8,sy2+24,sx+sw2-8,sy2+24,C.grey200,0.3);
    });
  });

  masterFooter(6);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 7 — أمثلة المعادلات
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  arPageHeader('أمثلة المعادلات وشرح نسبة الثقة');
  let y=78;
  y=arSecHead('📊', 'أمثلة المعادلات الحقيقية', 'معادلات Excel مُولَّدة من أوصاف عربية بالمحرك الذكي', y);

  // جدول: عمود Formula يسار، وصف وسط، نوع يمين
  const tC=[188,210,100];
  doc.rect(ML,y,CW,28).fill(C.green);
  doc.font(F).fontSize(10).fillColor(C.white);
  // رأس الجدول
  doc.text('Formula', ML+6, y+9, {width:tC[0]-10, lineBreak:false});
  doc.text(ar('الوصف بالعربية البسيطة'), ML+tC[0]+6, y+9, {width:tC[1]-10, align:'right', lineBreak:false});
  doc.text(ar('النوع'), ML+tC[0]+tC[1]+6, y+9, {width:tC[2]-8, align:'right', lineBreak:false});

  const arRows=[
    ['=IF(A1>40,(A1-40)*1.5,0)',          'إذا تجاوزت الساعات 40 احسب وقتاً إضافياً بمعدل 1.5', 'شرطية','#D1FAE5','#065F46'],
    ['=IFS(B1>=90,"ممتاز",B1>=75,"جيد")', 'قيّم الطالب: ممتاز فوق 90، جيد فوق 75، مقبول وإلا', 'شرطية','#D1FAE5','#065F46'],
    ['=XLOOKUP(D1,A:A,B:B,"غير موجود")',  'ابحث في عمود A وأعد القيمة المقابلة من عمود B',       'بحث',   '#DBEAFE','#1E40AF'],
    ['=SUMIF(C:C,">1000",D:D)',           'اجمع المبيعات التي تجاوزت الألف دينار فقط',           'إحصاء', '#EDE9FE','#5B21B6'],
    ['=PMT(0.05/12,360,A1)',             'القسط الشهري لقرض بفائدة 5% لمدة 30 سنة',             'مالية', '#FEF3C7','#92400E'],
    ['=DATEDIF(A1,TODAY(),"Y")',         'احسب عمر الشخص بالسنوات من تاريخ ميلاده في A1',        'تاريخ', '#FCE7F3','#9D174D'],
    ['=RANK(A1,A:A,0)',                  'رتِّب الموظف من الأعلى مبيعاً إلى الأدنى',             'إحصاء', '#EDE9FE','#5B21B6'],
    ['=IF(A1>10000,A1*1.15,A1)',         'أضف مكافأة 15% إذا تجاوزت المبيعات عشرة آلاف',        'شرطية', '#D1FAE5','#065F46'],
    ['=COUNTIF(B:B,">=60")',             'عدّ الطلاب الناجحين الذين حصلوا على 60 فأكثر',         'إحصاء', '#EDE9FE','#5B21B6'],
  ];
  arRows.forEach((r,i) => {
    const ry=y+28+i*24;
    doc.rect(ML,ry,CW,24).fill(i%2===0?C.white:C.grey50);
    doc.rect(ML,ry,tC[0],24).fill('#F0FDF4');
    doc.font(M).fontSize(8.5).fillColor(C.greenDk)
      .text(r[0], ML+4, ry+7, {width:tC[0]-8, lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey700)
      .text(ar(r[1]), ML+tC[0]+6, ry+7, {width:tC[1]-10, align:'right', lineBreak:false});
    rr(ML+tC[0]+tC[1]+8,ry+6,tC[2]-14,13,6,r[3]);
    doc.font(F).fontSize(8.5).fillColor(r[4])
      .text(ar(r[2]), ML+tC[0]+tC[1]+8, ry+9, {align:'center', width:tC[2]-14, lineBreak:false});
    ln(ML,ry+24,W-MR,ry+24,C.grey200,0.2);
  });
  y+=28+arRows.length*24+14;

  rr(ML,y,CW,54,8,'#EFF6FF',C.blueLt);
  doc.font(F).fontSize(18).text('💡', W-MR-34, y+16);
  doc.font(F).fontSize(11).fillColor(C.blue)
    .text(ar('نظام نسبة الثقة'), ML+10, y+12, {width:CW-54, align:'right', lineBreak:false});
  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text(ar('أخضر (> 85%) دقة عالية · برتقالي (50-85%) مقبول راجع الوصف · أحمر (< 50%) أعِد صياغة الطلب بتفاصيل أكثر'),
      ML+10, y+28, {width:CW-54, align:'right', lineGap:2.5});
  y+=68;

  const exW=(CW-12)/2;
  rr(ML,y,exW,68,8,C.grey50,C.grey200);
  doc.font(F).fontSize(10).fillColor(C.green)
    .text(ar('مثال وصف عربي:'), ML+6, y+10, {width:exW-12, align:'right', lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey700)
    .text(ar('"احسب مجموع المبيعات إذا تجاوزت ألف دينار وأضف ضريبة 15%"'),
      ML+6, y+26, {width:exW-12, align:'right', lineGap:2});
  doc.font(M).fontSize(9).fillColor(C.greenDk)
    .text('=IF(B2>1000,SUMIF(A:A,B2,C:C)*1.15,"")', ML+6, y+54, {width:exW-12, lineBreak:false});

  rr(ML+exW+12,y,exW,68,8,C.grey50,C.grey200);
  doc.font(F).fontSize(10).fillColor(C.green)
    .text('English input example:', ML+exW+18, y+10, {lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey700)
    .text('"Monthly loan: 30 years, 5% annual interest, principal in A1"',
      ML+exW+18, y+26, {width:exW-22, lineGap:2});
  doc.font(M).fontSize(9).fillColor(C.greenDk)
    .text('=PMT(0.05/12,12*30,A1)', ML+exW+18, y+54, {lineBreak:false});

  masterFooter(7);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 8 — دليل التثبيت ومعلومات المطوّر
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  arPageHeader('دليل التثبيت ومعلومات المطوّر');
  let y=78;
  y=arSecHead('📥', 'دليل التثبيت خطوة بخطوة', 'أربع خطوات بسيطة لتفعيل SniperSheet في Excel', y);

  const arSteps=[
    ['تحميل manifest.xml',  `${MANIFEST_URL.slice(0,55)}...`],
    ['Excel → Insert → Add-ins', ar('انقر Insert ← My Add-ins ← Manage My Add-ins')],
    [ar('رفع ملف manifest.xml'), ar('انقر "Upload My Add-in" ← اختر الملف ← تظهر تبويبة SniperSheet تلقائياً')],
    [ar('انقر "Open Sniper Hub"'), ar('انقر تبويبة SniperSheet ← "Open Sniper Hub" ← تفتح اللوحة على اليمين!')],
  ];
  arSteps.forEach((s,i) => {
    const sy=y+i*56;
    doc.circle(ML+14,sy+22,13).fill(C.green);
    doc.font(F).fontSize(12).fillColor(C.white).text(`${i+1}`, ML+10, sy+16);
    rr(ML+36,sy,CW-36,48,6,C.grey50,C.grey200);
    // العنوان
    doc.font(F).fontSize(11).fillColor(C.grey900)
      .text(ar(s[0]), ML+44, sy+8, {width:CW-52, align:'right', lineBreak:false});
    // الوصف
    doc.font(F).fontSize(9.5).fillColor(C.grey600)
      .text(s[1], ML+44, sy+26, {width:CW-52, lineBreak:false});
  });
  y+=arSteps.length*56+16;

  y=arSecHead('👤', 'معلومات المطوّر', 'صانع الإضافة والتقنيات المستخدمة في بنائها', y);
  rr(ML,y,CW,80,12,C.greenDk);
  doc.font(F).fontSize(18).fillColor(C.white)
    .text(ar('مصطفى السهلاني — Mustafa Alsahlany'), ML+16, y+12, {width:CW-32, align:'right', lineBreak:false});
  doc.font(F).fontSize(11).fillColor(C.white).fillOpacity(0.85)
    .text(ar('مطوّر ومصمم إضافة SniperSheet لـ Microsoft Excel'), ML+16, y+36, {width:CW-32, align:'right', lineBreak:false});
  doc.font(F).fontSize(10).fillColor(C.white).fillOpacity(0.7)
    .text(ar('مبنيّ بـ React و Express.js و TypeScript و Groq AI على Replit'), ML+16, y+54, {width:CW-32, align:'right', lineBreak:false});
  doc.fillOpacity(1);
  y+=94;

  const bw2=(CW-12)/2;
  const arBoxes=[
    {title:ar('🛠 التقنيات المستخدمة'), items:[
      ar('React 18 + Vite (الواجهة الأمامية)'),
      ar('Express.js + Node.js 24 (الخادم)'),
      ar('Groq SDK — Llama 3.3 70B (AI)'),
      ar('Tailwind CSS + shadcn/ui (التصميم)'),
      'TypeScript (Full Stack)',
      ar('pnpm Monorepo (إدارة الحزم)'),
    ]},
    {title:ar('📋 مواصفات الإضافة'), items:[
      'Office.js Manifest 1.1',
      ar('Task Pane — عرض 400px'),
      ar('الصلاحية: ReadWriteDocument'),
      ar('تبويبة Ribbon مخصصة'),
      ar('اللغة الافتراضية: ar-SA'),
      ar('يتطلب HTTPS (Replit يوفِّره)'),
    ]},
  ];
  arBoxes.forEach((box,i) => {
    const bx=ML+i*(bw2+12);
    rr(bx,y,bw2,112,9,C.grey50,C.grey200);
    doc.font(F).fontSize(11).fillColor(C.green)
      .text(box.title, bx+10, y+10, {width:bw2-18, align:'right', lineBreak:false});
    box.items.forEach((it,ii) => {
      doc.circle(bx+bw2-14, y+32+ii*14, 2.5).fill(C.green); // نقطة يمين
      doc.font(F).fontSize(9.5).fillColor(C.grey700)
        .text(it, bx+10, y+26+ii*14, {width:bw2-22, align:'right', lineBreak:false});
    });
  });

  masterFooter(8);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 9 — الصفحة الفاصلة ثنائية اللغة
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  doc.rect(0,0,W,H/2).fill(C.greenDk);
  doc.rect(0,H/2,W,H/2).fill('#0D5C35');
  for (let i=0;i<10;i++)
    doc.rect(0,H*(i/10),W,H/10).fillOpacity(0.02*i).fill('#1db954');
  doc.fillOpacity(1);
  doc.save();
  doc.moveTo(0,H*0.42).lineTo(W,H*0.52).lineTo(W,H*0.58).lineTo(0,H*0.48)
    .closePath().fillOpacity(0.08).fill(C.gold); doc.fillOpacity(1).restore();
  doc.circle(W/2,H/2,200).fillOpacity(0.04).fill(C.white); doc.fillOpacity(1);

  doc.font(F).fontSize(10).fillColor(C.gold)
    .text(ar('القسم العربي مكتمل ✓'), 0, H*0.18, {align:'center', width:W, lineBreak:false});
  doc.font(F).fontSize(26).fillColor(C.white)
    .text(ar('النسخة العربية'), 0, H*0.24, {align:'center', width:W, lineBreak:false});
  doc.font(F).fontSize(13).fillColor('rgba(255,255,255,0.65)')
    .text(ar('Arabic Edition Complete · الدليل العربي الشامل'), 0, H*0.32, {align:'center', width:W, lineBreak:false});

  const sealY=H/2-42;
  doc.circle(W/2,H/2,52).fillOpacity(0.15).fill(C.white); doc.fillOpacity(1);
  doc.roundedRect(W/2-42,sealY,84,84,42).fillOpacity(0.2).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(36).text('🎯', W/2-22, H/2-22);

  ln(80,H/2,W-80,H/2,C.gold,1.5);

  doc.font(F).fontSize(26).fillColor(C.white)
    .text('English Edition', 0, H*0.54, {align:'center', width:W, lineBreak:false});
  doc.font(F).fontSize(13).fillColor('rgba(255,255,255,0.65)')
    .text('Complete English Reference · Official Guide', 0, H*0.62, {align:'center', width:W, lineBreak:false});
  doc.font(F).fontSize(10).fillColor(C.gold)
    .text('English section begins on next page', 0, H*0.68, {align:'center', width:W, lineBreak:false});

  const divPills=['🌐 Bilingual Master Edition','17 Pages Total','Arabic + English'];
  let dpx=(W-360)/2;
  const dpy=H*0.78;
  divPills.forEach(p => {
    const pw=doc.font(F).fontSize(9.5).widthOfString(p)+22;
    doc.roundedRect(dpx,dpy,pw,24,12).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
    doc.font(F).fontSize(9.5).fillColor(C.white).text(p, dpx+11, dpy+6, {lineBreak:false});
    dpx+=pw+10;
  });

  masterFooter(9,true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحات 10–16 — القسم الإنجليزي (LTR)
// ═══════════════════════════════════════════════════════════════════════════════

// ── EN Page 1 (Global 10) — English Section Cover ─────────────────────────────
doc.addPage({size:'A4',margin:0});
{
  doc.rect(0,0,W,H).fill(C.greenDk);
  for (let i=0;i<20;i++) doc.rect(0,H*(i/20),W,H/20).fillOpacity(0.03*i).fill('#1db954');
  doc.fillOpacity(1);
  doc.circle(W-60,140,190).fillOpacity(0.05).fill(C.white);
  doc.circle(70,H-110,150).fillOpacity(0.05).fill(C.white);
  doc.fillOpacity(1);

  const enBw=290, enBx=(W-enBw)/2;
  doc.roundedRect(enBx,50,enBw,28,14).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(9.5).fillColor(C.white)
    .text('⚡  EXCEL ADD-IN  ·  OFFICIAL ENGLISH SECTION',
      enBx, 60, {align:'center', width:enBw, lineBreak:false});

  const lsz2=80, lx2=(W-lsz2)/2;
  doc.roundedRect(lx2,92,lsz2,lsz2,16).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(36).text('🎯', lx2, 110, {align:'center', width:lsz2});

  doc.font(F).fontSize(50).fillColor(C.white).text('SniperSheet', 0, 186, {align:'center', width:W});
  doc.font(F).fontSize(15).fillColor(C.white).fillOpacity(0.8)
    .text('AI-Powered Excel Formula Engine', 0, 248, {align:'center', width:W});
  doc.font(F).fontSize(11).fillColor(C.white).fillOpacity(0.6)
    .text('Natural Language → Precise Excel Formulas in Seconds', 0, 270, {align:'center', width:W});
  doc.fillOpacity(1);
  ln(W/2-28,306,W/2+28,306,C.white,2);

  const enStats=[['35+','Formula Patterns'],['4','Smart Tabs'],['100%','Free AI'],['3','AI Models'],['2','Languages']];
  const ensw=CW/enStats.length;
  enStats.forEach(([n,l],i) => {
    const sx=ML+i*ensw;
    doc.font(F).fontSize(26).fillColor(C.white).text(n, sx, 326, {align:'center', width:ensw});
    doc.font(F).fontSize(8.5).fillColor(C.white).fillOpacity(0.65).text(l, sx, 360, {align:'center', width:ensw});
    doc.fillOpacity(1);
  });

  const enPills=['Smart Hub','Commands','Cell Dimensions','Advanced Tools','Local Fallback','Free Forever'];
  let epx2=ML;
  enPills.forEach(p => {
    const pw=doc.font(F).fontSize(9).widthOfString(p)+22;
    doc.roundedRect(epx2,404,pw,24,12).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
    doc.font(F).fontSize(9).fillColor(C.white).text(p, epx2+11, 411, {lineBreak:false});
    epx2+=pw+8;
  });

  ln(ML,H-62,W-MR,H-62,C.white,0.2);
  doc.font(F).fontSize(11).fillColor(C.white).fillOpacity(0.85)
    .text('👤 Mustafa Alsahlany', ML, H-48, {lineBreak:false});
  doc.fillOpacity(1);
  doc.roundedRect(W-120,H-58,74,22,11).fillOpacity(0.2).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(9).fillColor(C.white).text('v1.0.0 · 2026', W-120, H-52, {align:'center', width:74, lineBreak:false});

  masterFooter(10,true);
}

// ── EN Page 2 (Global 11) — Product Overview ─────────────────────────────────
doc.addPage({size:'A4',margin:0});
{
  enPageHeader('Product Overview — Master Edition');
  let y=78;
  y=enSecHead('📋','What is SniperSheet?','Complete product overview and key capabilities',y);

  rr(ML,y,CW,84,9,C.greenLt);
  ln(ML,y,ML,y+84,C.green,3.5);
  doc.font(F).fontSize(11).fillColor(C.grey700)
    .text('SniperSheet is a professional Microsoft Excel task pane add-in that transforms natural language into precise, ready-to-use Excel formulas. Powered by Groq AI (Llama 3.3 70B — completely free), it supports both English and Arabic input, runs on a US-based Replit server (no VPN needed from anywhere), and falls back to a local formula engine when offline.',
      ML+14, y+12, {width:CW-22, lineGap:3});
  y+=98;

  const enc3w=(CW-20)/3;
  const enCards=[
    ['🤖','Groq AI Engine',       'Llama 3.3 70B model\n100% free — no credit\ncard required ever'],
    ['🌐','Bilingual Support',     'English & Arabic input\nFull RTL layout across\nall features & tabs'],
    ['🔒','Proxy Architecture',    'US Replit server relays\nall AI calls — no VPN\nneeded worldwide'],
    ['⚡','Local Fallback',        '35+ instant patterns\nZero latency offline\nWorks without internet'],
    ['📐','Office.js Integration', 'ReadWriteDocument\npermission level\nExcel Ribbon button'],
    ['📱','Responsive Design',     'Native scroll — 400px\ntask pane optimized\nMobile-friendly UX'],
  ];
  for (let i=0;i<2;i++) for (let j=0;j<3;j++) {
    const c=enCards[i*3+j], cx=ML+j*(enc3w+10), cy=y+i*94;
    rr(cx,cy,enc3w,86,9,C.grey50,C.grey200);
    doc.font(F).fontSize(20).text(c[0], cx+12, cy+10);
    doc.font(F).fontSize(11).fillColor(C.grey900).text(c[1], cx+12, cy+36, {lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey600).text(c[2], cx+12, cy+52, {width:enc3w-20});
  }
  y+=2*94+14;

  rr(ML,y,CW,50,8,C.green);
  doc.font(F).fontSize(18).text('💡', ML+14, y+12);
  doc.font(F).fontSize(11).fillColor(C.white)
    .text('Just describe your calculation in plain English or Arabic → SniperSheet generates the exact formula with explanation & confidence score instantly',
      ML+44, y+12, {width:CW-56, lineGap:2.5});

  masterFooter(11);
}

// ── EN Page 3 (Global 12) — Smart Hub + Commands ─────────────────────────────
doc.addPage({size:'A4',margin:0});
{
  enPageHeader('Core Features — Tabs 1 & 2');
  let y=78;
  y=enSecHead('✨','Smart Hub — AI Formula Engine','Tab 1 · Natural language → Excel formula via Groq AI',y);

  rr(ML,y,CW,134,9,C.white,C.grey200);
  rr(ML,y,CW,34,9,C.grey50,C.grey200);
  doc.rect(ML,y+24,CW,10).fill(C.grey50);
  rr(ML+4,y+7,24,22,5,C.greenLt);
  doc.font(F).fontSize(14).text('✨', ML+7, y+11);
  doc.font(F).fontSize(12).fillColor(C.grey900).text('Smart Hub', ML+34, y+10, {lineBreak:false});
  rr(ML+34+78,y+11,80,14,7,C.greenLt);
  doc.font(F).fontSize(8).fillColor(C.green).text('AI Powered', ML+34+78, y+15, {align:'center', width:80, lineBreak:false});
  ln(ML,y+34,W-MR,y+34,C.grey200,0.5);

  const enhalf=(CW-12)/2;
  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text('The core feature of SniperSheet. Type any description in English or Arabic and click "Smart Analysis". The AI engine processes via Groq AI (Llama 3.3 70B) and returns the exact formula, a full explanation, a confidence score (0–100%), and optional formatting hints.',
      ML+12, y+42, {width:enhalf-8, lineGap:2.5});

  const enSmB=['AI formula generation (Llama 3.3 70B)','Confidence scoring: 0–100% per formula',
    'Formula type auto-detection (IF, VLOOKUP...)','Word Radar: detects typos & ambiguous terms',
    'Style hints: background color, bold, italic','Full history log with timestamps',
    'Example prompts library (EN + AR)','Ctrl+Enter keyboard shortcut',
    'Local formula engine (offline fallback)','3-model cascade with auto-retry'];
  let enBy=y+42;
  enSmB.forEach(b => { enBy=enBullet(b, ML+enhalf+16, enBy, enhalf-8); });
  y+=148;

  y=enSecHead('⌨️','Commands — Arabic Formula Aliases','Tab 2 · Arabic & English names for instant calculations',y);
  rr(ML,y,CW,124,9,C.white,C.grey200);
  rr(ML,y,CW,34,9,'#EFF6FF',C.blueLt);
  doc.rect(ML,y+24,CW,10).fill('#EFF6FF');
  rr(ML+4,y+7,24,22,5,C.blueLt);
  doc.font(F).fontSize(14).text('⌨️', ML+7, y+11);
  doc.font(F).fontSize(12).fillColor(C.grey900).text('Commands', ML+34, y+10, {lineBreak:false});
  rr(ML+34+88,y+11,88,14,7,C.blueLt);
  doc.font(F).fontSize(8).fillColor(C.blue).text('Arabic Aliases', ML+34+88, y+15, {align:'center', width:88, lineBreak:false});
  ln(ML,y+34,W-MR,y+34,C.grey200,0.5);

  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text('Type the function name in English or Arabic (e.g., "جمع" for SUM, "ضرب" for MULTIPLY) with a cell range. The system instantly calculates the result and generates the corresponding Excel formula.',
      ML+12, y+42, {width:enhalf-8, lineGap:2.5});

  const enCmdB=['Arabic: جمع، ضرب، متوسط، مكافأة، ضريبة',
    'SUM, MULTIPLY, AVERAGE, MAX, MIN',
    'COUNT, BONUS (+15%), TAX (15%), PERCENTAGE',
    'Real-time calculation & formula display',
    'Searchable command reference table',
    'Execution history with timestamps'];
  let enCy=y+42;
  enCmdB.forEach(b => { enCy=enBullet(b, ML+enhalf+16, enCy, enhalf-8); });

  masterFooter(12);
}

// ── EN Page 4 (Global 13) — Cell Dimensions + Advanced Tools ─────────────────
doc.addPage({size:'A4',margin:0});
{
  enPageHeader('Core Features — Tabs 3 & 4');
  let y=78;
  y=enSecHead('📐','Cell Dimensions','Tab 3 · Calculate optimal cell width & height for any text',y);

  rr(ML,y,CW,114,9,C.white,C.grey200);
  rr(ML,y,CW,34,9,'#F5F3FF',C.purpleLt);
  doc.rect(ML,y+24,CW,10).fill('#F5F3FF');
  rr(ML+4,y+7,24,22,5,C.purpleLt);
  doc.font(F).fontSize(14).text('📐', ML+7, y+11);
  doc.font(F).fontSize(12).fillColor(C.grey900).text('Cell Dimensions', ML+34, y+10, {lineBreak:false});
  rr(ML+34+108,y+11,94,14,7,C.purpleLt);
  doc.font(F).fontSize(8).fillColor(C.purple).text('Arabic-Aware', ML+34+108, y+15, {align:'center', width:94, lineBreak:false});
  ln(ML,y+34,W-MR,y+34,C.grey200,0.5);

  const enh4=(CW-12)/2;
  doc.font(F).fontSize(10).fillColor(C.grey700)
    .text('Calculates the optimal width and height for an Excel cell based on its content, accounting for Arabic character width, RTL direction, font size, bold, italic, and padding. Supports single cell and batch processing.',
      ML+12, y+42, {width:enh4-8, lineGap:2.5});

  const enDimB=['Arabic text character width calculation','RTL direction & font size awareness',
    'Bold & italic adjustment factors','Single cell & batch processing modes',
    'Pixel and Excel unit output','One-click copy to clipboard'];
  let enDy=y+42;
  enDimB.forEach(b => { enDy=enBullet(b, ML+enh4+16, enDy, enh4-8); });
  y+=128;

  y=enSecHead('🔧','Advanced Tools','Tab 4 · Three professional productivity utilities',y);
  const enTools=[
    {icon:'🔍',title:'Empty Field Radar',bg:C.amberLt,border:'#FDE68A',fg:C.amber,
     desc:'Scan CSV or tab-separated data for missing values. Get a color-coded grid plus a precise list of every empty cell coordinate.',
     bullets:['Paste CSV or tab-separated data','Visual grid: filled=green, empty=red','Exact cell coordinate list','Auto header row detection','Filled vs empty count summary']},
    {icon:'🖨️',title:'Smart Print-Fit',bg:C.blueLt,border:'#93C5FD',fg:C.blue,
     desc:'Calculate optimal column widths and font sizes to fit your spreadsheet onto A4 or A3 paper, eliminating all trial-and-error print formatting.',
     bullets:['A4 & A3 paper size support','Portrait & landscape orientation','Excel column width units','Recommended font size','Print-ready in 3 clicks']},
    {icon:'📄',title:'Professional Report',bg:C.greenLt,border:'#86EFAC',fg:C.green,
     desc:'Transform raw pasted data into a styled HTML table with alternating row colors and bold headers, then send to the browser print dialog.',
     bullets:['Styled HTML from raw data','Alternating row colors','Bold column headers','Auto header detection','One-click print dialog']},
  ];
  const entw=(CW-16)/3;
  enTools.forEach((tool,i) => {
    const tx=ML+i*(entw+8), ty=y, th=180;
    rr(tx,ty,entw,th,9,C.white,tool.border);
    rr(tx,ty,entw,46,9,tool.bg,tool.border);
    doc.rect(tx,ty+30,entw,16).fill(tool.bg);
    doc.font(F).fontSize(20).text(tool.icon, tx+10, ty+10);
    doc.font(F).fontSize(11).fillColor(C.grey900).text(tool.title, tx+10, ty+32, {width:entw-16, lineBreak:false});
    ln(tx,ty+46,tx+entw,ty+46,tool.border,0.5);
    doc.font(F).fontSize(9).fillColor(C.grey700).text(tool.desc, tx+10, ty+54, {width:entw-18, lineGap:1.5});
    let ty2=ty+106;
    tool.bullets.forEach(b => {
      doc.circle(tx+14,ty2+5,2).fill(tool.fg);
      doc.font(F).fontSize(8.5).fillColor(C.grey700).text(b, tx+22, ty2, {width:entw-28, lineBreak:false});
      ty2+=14;
    });
  });

  masterFooter(13);
}

// ── EN Page 5 (Global 14) — AI Architecture ──────────────────────────────────
doc.addPage({size:'A4',margin:0});
{
  enPageHeader('AI Architecture & Technology Stack');
  let y=78;
  y=enSecHead('🏗️','AI Proxy Architecture','How SniperSheet connects to AI without exposing API keys',y);

  const enNodes=[
    {icon:'💻',title:'Your Browser', lines:['Excel Add-in','Task Pane (400px)','React + Vite']},
    {icon:'🖥️',title:'Replit Server',lines:['Express.js Proxy','Node.js 24 (US)','API key secured'], green:true},
    {icon:'🤖',title:'Groq AI',      lines:['Llama 3.3 70B','30 RPM Free Tier','No billing ever']},
  ];
  const ennw=132, ennh=90;
  const enngap=(CW-ennw*3)/2;
  enNodes.forEach((n,i) => {
    const nx=ML+i*(ennw+enngap), ny=y;
    rr(nx,ny,ennw,ennh,10,n.green?C.green:C.grey50,n.green?C.green:C.grey200);
    doc.font(F).fontSize(22).text(n.icon, nx, ny+8, {align:'center', width:ennw});
    doc.font(F).fontSize(11).fillColor(n.green?C.white:C.grey900).text(n.title, nx, ny+36, {align:'center', width:ennw});
    n.lines.forEach((l,li) => {
      doc.font(F).fontSize(8.5).fillColor(n.green?'rgba(255,255,255,0.75)':C.grey600)
        .text(l, nx+6, ny+52+li*11, {width:ennw-12, lineBreak:false});
    });
    if (i<2) {
      const ax=nx+ennw+6, ay=ny+ennh/2;
      ln(ax,ay,ax+enngap-12,ay,C.green,1.5);
      doc.polygon([ax+enngap-12,ay-5],[ax+enngap-12,ay+5],[ax+enngap-4,ay]).fill(C.green);
      doc.font(F).fontSize(8).fillColor(C.grey600)
        .text(i===0?'HTTPS Request':'Groq SDK Call', ax, ay-16, {width:enngap-10, align:'center', lineBreak:false});
    }
  });
  y+=ennh+14;

  rr(ML,y,CW,36,7,'#EFF6FF',C.blueLt);
  doc.font(F).fontSize(18).text('🔒', ML+10, y+7);
  doc.font(F).fontSize(10).fillColor(C.blue)
    .text('Security: GROQ_API_KEY is stored as a Replit server-side secret. Users everywhere — including Iraq — connect only to Replit\'s HTTPS endpoint, never touching Groq API directly. No VPN required.',
      ML+40, y+9, {width:CW-48, lineGap:2.5});
  y+=50;

  y=enSecHead('🤖','AI Model Cascade','3 free Groq models + local fallback — auto-retry on failure',y);
  const enModels=[
    {rank:'🥇 Primary',  name:'llama-3.3-70b-versatile',params:'70B',rpm:'30',note:'Best quality · latest',   bg:'#F0FDF4',bdr:'#86EFAC',fg:C.green},
    {rank:'🥈 Fallback', name:'llama3-70b-8192',         params:'70B',rpm:'30',note:'Stable · 8192 ctx',      bg:C.blueLt, bdr:'#93C5FD',fg:C.blue},
    {rank:'🥉 Emergency',name:'llama3-8b-8192',          params:'8B', rpm:'30',note:'Ultra-fast · light',     bg:C.amberLt,bdr:'#FCD34D',fg:C.amber},
    {rank:'🔧 Offline',  name:'Local Formula Engine',    params:'—',  rpm:'∞', note:'35+ patterns · 0 ms',   bg:C.purpleLt,bdr:'#C4B5FD',fg:C.purple},
  ];
  const enmw=(CW-15)/4;
  enModels.forEach((m,i) => {
    const mx=ML+i*(enmw+5), my=y;
    rr(mx,my,enmw,90,8,m.bg,m.bdr);
    doc.font(F).fontSize(9).fillColor(m.fg).text(m.rank, mx+8, my+10, {lineBreak:false});
    doc.font(F).fontSize(9.5).fillColor(C.grey900).text(m.name, mx+8, my+26, {width:enmw-14});
    doc.font(F).fontSize(8.5).fillColor(C.grey600).text(`${m.params} params`, mx+8, my+56, {lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600).text(`${m.rpm} RPM`, mx+8, my+68, {lineBreak:false});
    doc.font(F).fontSize(8).fillColor(C.grey400).text(m.note, mx+8, my+78, {width:enmw-14, lineBreak:false});
  });
  y+=104;

  y=enSecHead('⚙️','Technical Specifications','Complete add-in configuration and system details',y);
  const ensL=[['Office.js','Manifest v1.1'],['Add-in Type','Task Pane'],['Pane Width','400px'],
    ['Permission','ReadWriteDocument'],['Locale','ar-SA (Arabic)'],['Ribbon','Custom SniperSheet tab']];
  const ensR=[['Frontend','React 18 + Vite + TypeScript'],['Backend','Express.js + Node.js 24'],
    ['AI SDK','Groq SDK (Official)'],['Package Mgr','pnpm Monorepo'],
    ['Deployment','Replit Autoscale'],['Styling','Tailwind CSS + shadcn/ui']];
  const ensw2=(CW-12)/2;
  [[ensL,ML],[ensR,ML+ensw2+12]].forEach(([specs,sx]) => {
    rr(sx,y,ensw2,specs.length*24+16,8,C.grey50,C.grey200);
    specs.forEach(([k,v],i) => {
      const sy2=y+10+i*24;
      doc.font(F).fontSize(8.5).fillColor(C.grey600).text(k, sx+12, sy2, {lineBreak:false});
      doc.font(F).fontSize(10).fillColor(C.grey900).text(v, sx+12, sy2+12, {lineBreak:false});
      if (i<specs.length-1) ln(sx+10,sy2+22,sx+ensw2-10,sy2+22,C.grey200,0.3);
    });
  });

  masterFooter(14);
}

// ── EN Page 6 (Global 15) — Formula Examples ─────────────────────────────────
doc.addPage({size:'A4',margin:0});
{
  enPageHeader('Formula Examples & Confidence System');
  let y=78;
  y=enSecHead('📊','Real Formula Examples','Generated by Smart Hub AI engine from natural language',y);

  const entC=[190,220,88];
  doc.rect(ML,y,CW,28).fill(C.green);
  doc.font(F).fontSize(10).fillColor(C.white);
  doc.text('Formula Generated', ML+6, y+9, {width:entC[0]-10, lineBreak:false});
  doc.text('Natural Language Input', ML+entC[0]+6, y+9, {width:entC[1]-10, lineBreak:false});
  doc.text('Category', ML+entC[0]+entC[1]+6, y+9, {lineBreak:false});

  const enRows=[
    ['=IF(A1>40,(A1-40)*1.5,0)',         'Calculate overtime if hours > 40, multiply excess by 1.5',   'Conditional','#D1FAE5','#065F46'],
    ['=IFS(B1>=90,"A+",B1>=75,"B",...)', 'Grade student: A+ above 90, B above 75, else C',             'Conditional','#D1FAE5','#065F46'],
    ['=XLOOKUP(D1,A:A,B:B,"Not found")', 'Find value in column A, return matching from column B',      'Lookup',    '#DBEAFE','#1E40AF'],
    ['=SUMIF(C:C,">1000",D:D)',          'Sum all sales amounts greater than 1000',                     'Statistical','#EDE9FE','#5B21B6'],
    ['=PMT(0.05/12,360,A1)',             'Monthly payment for 30-year loan at 5% annual interest',     'Financial', '#FEF3C7','#92400E'],
    ['=DATEDIF(A1,TODAY(),"Y")',         'Calculate person age in years from birth date in A1',          'Date',      '#FCE7F3','#9D174D'],
    ['=RANK(A1,A:A,0)',                  'Rank employee by highest sales figure descending',             'Statistical','#EDE9FE','#5B21B6'],
    ['=IF(A1>10000,A1*1.15,A1)',         'Add 15% bonus to salary only if sales exceed 10,000',        'Conditional','#D1FAE5','#065F46'],
  ];
  enRows.forEach((r,i) => {
    const ry=y+28+i*24;
    doc.rect(ML,ry,CW,24).fill(i%2===0?C.white:C.grey50);
    doc.rect(ML,ry,entC[0],24).fill('#F0FDF4');
    doc.font(M).fontSize(8.5).fillColor(C.greenDk).text(r[0], ML+4, ry+7, {width:entC[0]-8, lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey700).text(r[1], ML+entC[0]+6, ry+7, {width:entC[1]-10, lineBreak:false});
    rr(ML+entC[0]+entC[1]+8,ry+6,74,13,6,r[3]);
    doc.font(F).fontSize(8).fillColor(r[4]).text(r[2], ML+entC[0]+entC[1]+8, ry+9, {align:'center', width:74, lineBreak:false});
    ln(ML,ry+24,W-MR,ry+24,C.grey200,0.2);
  });
  y+=28+enRows.length*24+16;

  rr(ML,y,CW,38,7,'#EFF6FF',C.blueLt);
  doc.font(F).fontSize(18).text('💡', ML+10, y+8);
  doc.font(F).fontSize(10).fillColor(C.blue)
    .text('Confidence Scoring: Green (> 85%) = high accuracy · Orange (50–85%) = acceptable, review · Red (< 50%) = revise with more specific details. Clearer prompts yield higher confidence.',
      ML+38, y+10, {width:CW-46, lineGap:2.5});
  y+=52;

  y=enSecHead('👤','Developer Information','Mustafa Alsahlany — Creator of SniperSheet',y);
  rr(ML,y,CW,70,12,C.greenDk);
  doc.font(F).fontSize(17).fillColor(C.white).text('Mustafa Alsahlany', ML+20, y+10, {lineBreak:false});
  doc.font(F).fontSize(10.5).fillColor(C.white).fillOpacity(0.85)
    .text('Developer & Designer of SniperSheet Excel Add-in', ML+20, y+32, {lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.white).fillOpacity(0.7)
    .text('Built with React, Express.js, TypeScript, and Groq AI on Replit', ML+20, y+50, {lineBreak:false});
  doc.fillOpacity(1);
  ['🌐 Replit — Active','🤖 Groq AI — Free','📦 v1.0.0','📅 April 2026'].forEach((d,i) => {
    doc.font(F).fontSize(9.5).fillColor(C.white).fillOpacity(0.85)
      .text(d, W-MR-170, y+10+i*14, {lineBreak:false});
    doc.fillOpacity(1);
  });

  masterFooter(15);
}

// ── EN Page 7 (Global 16) — Installation Guide ───────────────────────────────
doc.addPage({size:'A4',margin:0});
{
  enPageHeader('Installation Guide & Technology Stack');
  let y=78;
  y=enSecHead('📥','Installation Guide','4 simple steps to load SniperSheet in Microsoft Excel',y);

  const enSteps=[
    ['Download manifest.xml', `Go to: ${MANIFEST_URL} — the manifest file downloads automatically.`],
    ['Excel → Insert → Add-ins','In Microsoft Excel: click Insert → Add-ins → My Add-ins → Manage My Add-ins.'],
    ['Upload manifest.xml','Click "Upload My Add-in", select the downloaded file. A "SniperSheet" ribbon tab appears.'],
    ['Open Sniper Hub','Click the SniperSheet ribbon tab → "Open Sniper Hub". Task pane opens on the right!'],
  ];
  enSteps.forEach((s,i) => {
    const sy=y+i*52;
    doc.circle(ML+14,sy+20,13).fill(C.green);
    doc.font(F).fontSize(12).fillColor(C.white).text(`${i+1}`, ML+10, sy+14);
    rr(ML+36,sy,CW-36,44,6,C.grey50,C.grey200);
    doc.font(F).fontSize(11).fillColor(C.grey900).text(s[0], ML+50, sy+8, {lineBreak:false});
    doc.font(F).fontSize(9.5).fillColor(C.grey600).text(s[1], ML+50, sy+24, {width:CW-60, lineBreak:false});
  });
  y+=enSteps.length*52+18;

  y=enSecHead('💻','Technology Stack','Full technical stack and build configuration',y);
  const enStackL=[['Frontend','React 18 + Vite + TypeScript'],['Backend','Express.js + Node.js 24'],
    ['AI SDK','Groq SDK — Llama 3.3 70B'],['Styling','Tailwind CSS + shadcn/ui']];
  const enStackR=[['Package Mgr','pnpm Monorepo Workspace'],['Office.js','Manifest v1.1 Task Pane'],
    ['Permission','ReadWriteDocument'],['Hosting','Replit Autoscale Deploy']];
  const enstW=(CW-12)/2;
  [[enStackL,ML],[enStackR,ML+enstW+12]].forEach(([items,sx]) => {
    rr(sx,y,enstW,items.length*30+16,8,C.grey50,C.grey200);
    items.forEach(([k,v],i) => {
      const iy=y+10+i*30;
      doc.roundedRect(sx+10,iy+3,8,18,2).fill(C.green);
      doc.font(F).fontSize(8.5).fillColor(C.grey600).text(k, sx+26, iy+5, {lineBreak:false});
      doc.font(F).fontSize(10.5).fillColor(C.grey900).text(v, sx+26, iy+17, {lineBreak:false});
    });
  });
  y+=enStackL.length*30+28;

  rr(ML,y,CW,38,8,C.grey100,C.grey200);
  doc.font(F).fontSize(9.5).fillColor(C.grey500)
    .text('© 2026 Mustafa Alsahlany — All Rights Reserved', ML+16, y+9, {lineBreak:false});
  doc.font(F).fontSize(9).fillColor(C.grey400)
    .text('SniperSheet v1.0.0 · Master Edition · Built on Replit · Powered by Groq AI (Free Tier)', ML+16, y+24, {lineBreak:false});

  masterFooter(16);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 17 — ملحق النشر والتثبيت
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  doc.rect(0,0,W,122).fill(C.greenDk);
  for (let i=0;i<10;i++) doc.rect(0,i*12,W,12).fillOpacity(0.02*i).fill('#1db954');
  doc.fillOpacity(1);

  doc.font(F).fontSize(10).fillColor(C.gold).text('APPENDIX · ملحق', ML, 22, {lineBreak:false});
  doc.font(F).fontSize(26).fillColor(C.white).text('Deployment & Manifest Guide', ML, 40, {lineBreak:false});
  doc.font(F).fontSize(12).fillColor('rgba(255,255,255,0.65)')
    .text('دليل النشر والتثبيت النهائي · Final Installation Reference', ML, 82, {lineBreak:false});

  let y=138;

  rr(ML,y,CW,56,10,'#F0FDF4','#86EFAC');
  doc.font(F).fontSize(11).fillColor(C.green).text('🌐 Live Deployment URL', ML+16, y+10, {lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey600).text('Base URL of the deployed SniperSheet API server:', ML+16, y+26, {lineBreak:false});
  doc.font(M).fontSize(10).fillColor(C.greenDk).text(BASE_URL, ML+16, y+40, {lineBreak:false});
  y+=70;

  rr(ML,y,CW,56,10,C.blueLt,'#93C5FD');
  doc.font(F).fontSize(11).fillColor(C.blue).text('📄 Manifest Download URL', ML+16, y+10, {lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey600).text('Direct link — downloads automatically in browser:', ML+16, y+26, {lineBreak:false});
  doc.font(M).fontSize(9).fillColor(C.blue).text(MANIFEST_URL, ML+16, y+40, {lineBreak:false});
  y+=70;

  y=enSecHead('🔗','API Endpoints','All server routes provided by the SniperSheet API server',y);

  const endpoints=[
    {method:'GET', path:'/api/addin/manifest.xml', desc:'Office Add-in manifest file (sideload in Excel)'},
    {method:'GET', path:'/api/addin/icon-16.png',  desc:'Add-in icon 16×16px'},
    {method:'GET', path:'/api/addin/icon-32.png',  desc:'Add-in icon 32×32px'},
    {method:'GET', path:'/api/addin/icon-80.png',  desc:'Add-in icon 80×80px'},
    {method:'POST',path:'/api/smart/analyze',      desc:'AI formula generation — returns formula + explanation + confidence'},
    {method:'POST',path:'/api/smart/dimensions',   desc:'Cell dimension calculator — Excel width & height units'},
  ];
  const mc={GET:'#D1FAE5',POST:'#DBEAFE'}, mt={GET:'#065F46',POST:'#1E40AF'};
  endpoints.forEach((ep,i) => {
    const ey=y+i*30;
    doc.rect(ML,ey,CW,26).fill(i%2===0?C.white:C.grey50);
    rr(ML+6,ey+6,36,14,4,mc[ep.method]);
    doc.font(F).fontSize(8).fillColor(mt[ep.method]).text(ep.method, ML+6, ey+9, {align:'center', width:36, lineBreak:false});
    doc.font(M).fontSize(9).fillColor(C.greenDk).text(ep.path, ML+48, ey+8, {lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600).text(ep.desc, ML+202, ey+8, {width:CW-212, lineBreak:false});
    ln(ML,ey+26,W-MR,ey+26,C.grey200,0.2);
  });
  y+=endpoints.length*30+16;

  y=enSecHead('⚙️','Quick Installation — خطوات سريعة','4 steps · 4 خطوات للبدء',y);
  const appSteps=[
    ['1','Download',  'Visit the manifest URL above','نزّل manifest.xml'],
    ['2','Excel',     'Insert → Add-ins → Upload','Excel: Insert ← Upload My Add-in'],
    ['3','Upload',    'Select manifest.xml file','ارفع الملف — تظهر تبويبة SniperSheet'],
    ['4','Launch',    'Click "Open Sniper Hub"','انقر "Open Sniper Hub"'],
  ];
  const stW=(CW-15)/4;
  appSteps.forEach((s,i) => {
    const sx=ML+i*(stW+5), sy=y;
    rr(sx,sy,stW,88,8,C.grey50,C.grey200);
    doc.circle(sx+stW/2,sy+18,13).fill(C.green);
    doc.font(F).fontSize(12).fillColor(C.white).text(s[0], sx+stW/2-5, sy+12);
    doc.font(F).fontSize(10).fillColor(C.grey900).text(s[1], sx+6, sy+38, {align:'center', width:stW-12, lineBreak:false});
    doc.font(F).fontSize(8).fillColor(C.grey600).text(s[2], sx+6, sy+54, {width:stW-12, lineGap:1.5});
    doc.font(F).fontSize(8).fillColor(C.green).text(ar(s[3]), sx+6, sy+70, {width:stW-12, align:'right', lineGap:1});
  });
  y+=104;

  rr(ML,y,CW,46,8,C.greenDk);
  doc.font(F).fontSize(10).fillColor(C.gold)
    .text('© 2026 Mustafa Alsahlany — All Rights Reserved', ML+16, y+8, {lineBreak:false});
  doc.font(F).fontSize(9).fillColor('rgba(255,255,255,0.7)')
    .text('SniperSheet Master Edition v1.0.0 · 17 Pages · Bilingual · Built on Replit · Powered by Groq AI',
      ML+16, y+26, {lineBreak:false});

  masterFooter(17);
}

// ─── إنهاء المستند ───────────────────────────────────────────────────────────
doc.end();
console.log('SUCCESS: RTL-fixed Master Edition PDF written to', OUTPUT);
