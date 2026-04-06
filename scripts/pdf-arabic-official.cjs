'use strict';
// SniperSheet_Arabic_Official.pdf — نسخة عربية خالصة بلا كلمات إنجليزية
const PDFDocument    = require('/tmp/pdfgen/node_modules/pdfkit');
const fs             = require('fs');
const ArabicReshaper = require('/tmp/pdfgen/node_modules/arabic-reshaper');

const OUTPUT     = '/home/runner/workspace/SniperSheet_Arabic_Official.pdf';
const FONT_CAIRO = '/tmp/pdfgen/fonts/Cairo.ttf';

// ── دالة العربية: إعادة تشكيل الحروف + عكس ترتيب الكلمات للعرض RTL ──────────
const ar = (text) => {
  if (!text || !text.trim()) return text;
  if (!/[\u0600-\u06FF]/.test(text)) return text;
  const reshaped = ArabicReshaper.convertArabic(text);
  return reshaped.split(' ').reverse().join(' ');
};

const C = {
  green:'#107C41', greenDk:'#0B5C30', greenLt:'#E8F5EE',
  white:'#FFFFFF', grey50:'#F8FAFB', grey100:'#EEF2F5',
  grey200:'#DDE3EA', grey400:'#9CA3AF', grey600:'#4B5563',
  grey700:'#374151', grey900:'#111827',
  gold:'#B7791F', amber:'#92400E', amberLt:'#FEF3C7',
  blue:'#1D4ED8', blueLt:'#DBEAFE',
  purple:'#5B21B6', purpleLt:'#EDE9FE',
};

const doc = new PDFDocument({
  size:'A4', margins:{top:0,bottom:0,left:0,right:0}, bufferPages:true,
  info:{ Title:'سنابيرشيت — الدليل العربي الرسمي', Author:'مصطفى السهلاني',
         Subject:'دليل إضافة إكسل العربي الرسمي', Creator:'سنابيرشيت v1.0' },
});
doc.pipe(fs.createWriteStream(OUTPUT));
if (fs.existsSync(FONT_CAIRO)) doc.registerFont('Cairo', FONT_CAIRO);
const F = 'Cairo';
const W = 595.28, H = 841.89;
const ML = 46, MR = 46, CW = W - ML - MR;
const TOTAL = 10;

const rr = (x,y,w,h,r,fill,stroke) => {
  doc.roundedRect(x,y,w,h,r);
  if (fill && stroke)  doc.fillAndStroke(fill, stroke);
  else if (fill)       doc.fillColor(fill).fill();
  else if (stroke)     doc.strokeColor(stroke).stroke();
};
const ln = (x1,y1,x2,y2,color=C.grey200,lw=0.5) =>
  doc.moveTo(x1,y1).lineTo(x2,y2).strokeColor(color).lineWidth(lw).stroke();

// ── تذييل عربي ──────────────────────────────────────────────────────────────
const footer = (n, dark=false) => {
  const fy = H - 30;
  const tc = dark ? 'rgba(255,255,255,0.7)' : C.grey400;
  const lc = dark ? 'rgba(255,255,255,0.2)' : C.grey200;
  doc.moveTo(ML,fy).lineTo(W-MR,fy).strokeColor(lc).lineWidth(0.5).stroke();
  doc.font(F).fontSize(7.5).fillColor(tc);
  // يسار: اسم المطوّر
  doc.text(ar('مطوّر من قِبَل: مصطفى السهلاني'), ML, fy+8, {lineBreak:false});
  // وسط: اسم المنتج
  const mid = ar('سنابيرشيت — الدليل الرسمي · ٢٠٢٦');
  doc.text(mid, (W - doc.widthOfString(mid))/2, fy+8, {lineBreak:false});
  // يمين: رقم الصفحة
  const pg = `${n} / ${TOTAL}`;
  doc.text(pg, W-MR-doc.widthOfString(pg), fy+8, {lineBreak:false});
};

// ── رأس الصفحة العربي ────────────────────────────────────────────────────────
const hdr = (sectionAr) => {
  doc.rect(0,0,W,7).fill(C.green);
  rr(ML,16,36,36,7,C.greenLt);
  doc.font(F).fontSize(20).text('🎯', ML+6, 21);
  doc.font(F).fontSize(14).fillColor(C.green)
    .text(ar('سنابيرشيت'), ML+46, 18, {lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey400)
    .text(ar(sectionAr), ML+46, 36, {width:CW-50, align:'right', lineBreak:false});
  ln(ML,62,W-MR,62,C.green,1.5);
};

// ── رأس قسم ──────────────────────────────────────────────────────────────────
const secHdr = (icon, titleAr, subAr, y) => {
  rr(ML,y,36,36,8,C.green);
  doc.font(F).fontSize(18).text(icon, ML+7, y+7);
  doc.font(F).fontSize(14).fillColor(C.grey900)
    .text(ar(titleAr), ML+46, y+3, {width:CW-50, align:'right', lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey600)
    .text(ar(subAr), ML+46, y+21, {width:CW-50, align:'right', lineBreak:false});
  return y+50;
};

// ── نقطة قائمة عربية (النقطة يمين، النص يمين) ───────────────────────────────
const bull = (txt, x, y, w) => {
  doc.circle(x+w-5, y+6, 2.5).fill(C.green);
  doc.font(F).fontSize(9.5).fillColor(C.grey700)
    .text(ar(txt), x, y, {width:w-14, align:'right', lineGap:1});
  return y + doc.currentLineHeight() + 5;
};

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 1 — الغلاف الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════
{
  doc.rect(0,0,W,H).fill(C.greenDk);
  for (let i=0;i<20;i++) doc.rect(0,H*(i/20),W,H/20).fillOpacity(0.03*i).fill('#1aab57');
  doc.fillOpacity(1);
  doc.circle(W-60,130,200).fillOpacity(0.05).fill(C.white);
  doc.circle(60,H-100,160).fillOpacity(0.05).fill(C.white);
  doc.fillOpacity(1);

  // شارة عليا
  const bW = 300, bX = (W-bW)/2;
  doc.roundedRect(bX,44,bW,28,14).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(9.5).fillColor(C.white)
    .text(ar('الدليل العربي الرسمي  ·  النسخة الأولى'), bX, 54,
      {align:'center', width:bW, lineBreak:false});

  // أيقونة مركزية
  const lsz=82, lx=(W-lsz)/2;
  doc.roundedRect(lx,88,lsz,lsz,16).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(36).text('🎯', lx, 105, {align:'center', width:lsz});

  // عنوان المنتج
  doc.font(F).fontSize(52).fillColor(C.white)
    .text(ar('سنابيرشيت'), 0, 186, {align:'center', width:W});
  doc.font(F).fontSize(20).fillColor(C.white).fillOpacity(0.88)
    .text(ar('محرك المعادلات بالذكاء الاصطناعي'), 0, 248, {align:'center', width:W});
  doc.font(F).fontSize(12).fillColor(C.white).fillOpacity(0.65)
    .text(ar('للمهندسين والمحللين الماليين ومديري المشاريع'), 0, 274, {align:'center', width:W});
  doc.fillOpacity(1);

  ln(W/2-30,308,W/2+30,308,C.white,2);

  // إحصاءات
  const stats=[
    ['٣٥+', 'نمط معادلة'],['٤', 'أقسام ذكية'],
    ['١٠٠٪', 'ذكاء اصطناعي مجاني'],['لغتان','عربي وإنجليزي'],
  ];
  const sw = CW/stats.length;
  stats.forEach(([n,l],i) => {
    const sx = ML+i*sw;
    doc.font(F).fontSize(26).fillColor(C.white).text(n, sx, 328, {align:'center', width:sw});
    doc.font(F).fontSize(9).fillColor(C.white).fillOpacity(0.65)
      .text(ar(l), sx, 360, {align:'center', width:sw}); doc.fillOpacity(1);
  });

  // حبات
  const pills=[ar('المحرك الذكي'),ar('الأوامر'),ar('أبعاد الخلايا'),ar('الأدوات'),ar('مجاني تماماً')];
  let px=ML;
  pills.forEach(p => {
    const pw = doc.font(F).fontSize(9.5).widthOfString(p)+24;
    doc.roundedRect(px,404,pw,26,13).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
    doc.font(F).fontSize(9.5).fillColor(C.white).text(p, px+12, 411, {lineBreak:false});
    px+=pw+8;
  });

  // اسم المطوّر
  ln(ML,H-62,W-MR,H-62,C.white,0.2);
  doc.font(F).fontSize(11).fillColor(C.white).fillOpacity(0.85)
    .text(ar('مصطفى السهلاني'), ML, H-48, {width:CW, align:'right', lineBreak:false});
  doc.font(F).fontSize(9).fillColor(C.gold).fillOpacity(0.9)
    .text(ar('مطوّر الإضافة ومصمِّمها  ·  إصدار ١ · ٢٠٢٦'), ML, H-33, {width:CW, align:'right', lineBreak:false});
  doc.fillOpacity(1);
  footer(1,true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 2 — مقدمة ونظرة عامة
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('مقدمة ونظرة عامة على المنتج');
  let y=78;
  y=secHdr('📋', 'ما هي إضافة سنابيرشيت؟', 'نظرة شاملة على الإضافة وأبرز مزاياها', y);

  rr(ML,y,CW,88,9,C.greenLt);
  ln(W-MR,y,W-MR,y+88,C.green,3.5);
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text(ar('سنابيرشيت إضافة احترافية لبرنامج إكسل تعمل بوصفها لوحة مهام داخل إكسل من مايكروسوفت. تُحوِّل وصفك بالعربية أو الإنجليزية إلى معادلة إكسل دقيقة خلال ثوانٍ. تعتمد على نموذج لاما ٣.٣ ٧٠ مليار بارامتر المجاني من غروك، وتمر جميع الطلبات عبر خادم ريبليت الأمريكي ليتمكن مستخدمو العراق والعالم العربي من الوصول إليها مباشرةً دون أي برنامج للتحايل على الحظر.'),
      ML+10, y+10, {width:CW-22, align:'right', lineGap:3.5});
  y+=102;

  // ٦ بطاقات ميزات
  const c3w=(CW-20)/3;
  const cards=[
    ['🤖','محرك غروك للذكاء الاصطناعي','نموذج لاما ٣.٣ مجاني\nبلا بطاقة ائتمان'],
    ['🌐','ثنائي اللغة الكامل','عربي وإنجليزي بالكامل\nدعم الكتابة من اليمين لليسار'],
    ['🔒','بنية الوكيل الآمنة','خادم أمريكي يُوجِّه طلبات الذكاء\nلا تحايل ولا مفاتيح مكشوفة'],
    ['⚡','محرك محلي احتياطي','٣٥+ نمط فوري\nيعمل بلا إنترنت'],
    ['📐','تكامل إكسل الكامل','صلاحية قراءة وكتابة\nزر مخصص في شريط الأدوات'],
    ['📱','تصميم متجاوب','تمرير سلس · عرض ٤٠٠ بكسل\nهوامش داخلية ١٠ بكسل'],
  ];
  for (let i=0;i<2;i++) for (let j=0;j<3;j++) {
    const c=cards[i*3+j], cx=ML+j*(c3w+10), cy=y+i*96;
    rr(cx,cy,c3w,88,9,C.grey50,C.grey200);
    doc.font(F).fontSize(20).text(c[0], cx+c3w-36, cy+10);
    doc.font(F).fontSize(10).fillColor(C.grey900)
      .text(ar(c[1]), cx+6, cy+36, {width:c3w-10, align:'right', lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey600)
      .text(ar(c[2]), cx+6, cy+52, {width:c3w-10, align:'right'});
  }
  y+=2*96+14;

  rr(ML,y,CW,48,8,C.green);
  doc.font(F).fontSize(18).text('💡', W-MR-38, y+14);
  doc.font(F).fontSize(10.5).fillColor(C.white)
    .text(ar('صِف ما تريد حسابه بالعربية أو الإنجليزية — سنابيرشيت يُولِّد المعادلة الدقيقة مع شرح ونسبة ثقة وتلميحات تنسيق'),
      ML+10, y+12, {width:CW-58, align:'right', lineGap:3});
  y+=62;

  y=secHdr('🏆', 'مَن يستفيد من سنابيرشيت؟', 'الفئات المستهدفة والحالات الاستخدامية', y);
  const users=[
    ['🔧','المهندسون','معادلات هندسية معقدة في ثوانٍ'],
    ['💼','المحللون الماليون','تحليل البيانات ونسب الأداء'],
    ['📊','مديرو المشاريع','متابعة التقدم والميزانيات'],
    ['🎓','الطلاب والأكاديميون','التحليل الإحصائي والبحثي'],
  ];
  const uw=(CW-15)/4;
  users.forEach((u,i) => {
    const ux=ML+i*(uw+5), uy=y;
    rr(ux,uy,uw,74,8,C.greenLt,C.green);
    doc.font(F).fontSize(22).text(u[0], ux, uy+8, {align:'center', width:uw});
    doc.font(F).fontSize(10).fillColor(C.grey900)
      .text(ar(u[1]), ux+6, uy+38, {width:uw-12, align:'right', lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600)
      .text(ar(u[2]), ux+6, uy+54, {width:uw-12, align:'right', lineBreak:false});
  });
  footer(2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 3 — المحرك الذكي
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('القسم الأول — المحرك الذكي');
  let y=78;
  y=secHdr('✨', 'المحرك الذكي', 'لغة طبيعية تتحوّل إلى معادلة إكسل عبر الذكاء الاصطناعي', y);

  rr(ML,y,CW,86,9,C.greenLt);
  ln(W-MR,y,W-MR,y+86,C.green,3.5);
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text(ar('القسم الرئيسي في سنابيرشيت. اكتب وصف العملية الحسابية بالعربية أو الإنجليزية مثل "احسب مجموع مبيعات الموظفين الذين تجاوزت مبيعاتهم عشرة آلاف" ثم انقر "تحليل ذكي". يُعالج المحرك طلبك عبر غروك ويُعيد المعادلة الدقيقة مع شرح وافٍ ونسبة ثقة ونصائح تنسيق مشروط.'),
      ML+10, y+10, {width:CW-22, align:'right', lineGap:3.5});
  y+=100;

  y=secHdr('📋', 'الميزات التفصيلية', 'كل ما يقدمه المحرك الذكي في قائمة شاملة', y);
  const half=(CW-12)/2;
  const bLeft=[
    'توليد المعادلات عبر الذكاء الاصطناعي من غروك',
    'نسبة ثقة من ٠ إلى ١٠٠٪ لكل معادلة',
    'كشف نوع المعادلة تلقائياً: إذا ، بحث ، جمع شرطي',
    'رادار الكلمات يكتشف الأخطاء الإملائية',
    'اقتراحات تنسيق: ألوان الخلايا والخط',
    'سجل كامل بالتاريخ والوقت',
    'مكتبة أمثلة عربية وإنجليزية',
    'اختصار لوحة المفاتيح للتحليل الفوري',
  ];
  const bRight=[
    'محرك محلي بلا إنترنت — صفر تأخير',
    'تبديل تلقائي بين ٣ نماذج ذكاء اصطناعي',
    'حالة التحليل: نجاح ، تحذير ، خطأ',
    'شرح مفصَّل لكل معادلة',
    'زر نسخ المعادلة بنقرة واحدة',
    'زر تطبيق المعادلة في إكسل مباشرةً',
    'دعم المعادلات المتداخلة المعقدة',
    'معالجة أخطاء ذكية مع اقتراحات الإصلاح',
  ];
  let ly=y, ry=y;
  bLeft.forEach(b  => { ly=bull(b, ML,          ly, half); });
  bRight.forEach(b => { ry=bull(b, ML+half+12,  ry, half); });
  y=Math.max(ly,ry)+14;

  y=secHdr('🔄', 'كيفية عمل المحرك الذكي خطوة بخطوة', 'من الوصف النصي إلى المعادلة النهائية', y);
  const steps=[
    ['١','الكتابة','اكتب وصف عمليتك بالعربية أو الإنجليزية في حقل الإدخال'],
    ['٢','التحليل','انقر "تحليل ذكي" أو استخدم اختصار لوحة المفاتيح'],
    ['٣','المعالجة','يُرسَل الطلب عبر خادم ريبليت إلى غروك ويُعالَج بالذكاء الاصطناعي'],
    ['٤','النتيجة','تظهر المعادلة مع نسبة الثقة والشرح وتلميحات التنسيق'],
  ];
  const sw=(CW-15)/4;
  steps.forEach((s,i) => {
    const sx=ML+i*(sw+5), sy=y;
    rr(sx,sy,sw,80,8,C.grey50,C.grey200);
    doc.circle(sx+sw/2,sy+18,13).fill(C.green);
    doc.font(F).fontSize(12).fillColor(C.white).text(s[0], sx+sw/2-6, sy+12);
    doc.font(F).fontSize(10).fillColor(C.grey900)
      .text(ar(s[1]), sx+6, sy+38, {width:sw-12, align:'right', lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600)
      .text(ar(s[2]), sx+6, sy+54, {width:sw-12, align:'right', lineGap:1});
  });
  footer(3);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 4 — الأوامر
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('القسم الثاني — الأوامر');
  let y=78;
  y=secHdr('⌨️', 'الأوامر', 'أسماء الدوال بالعربية لحسابات فورية ودقيقة', y);

  rr(ML,y,CW,76,9,C.blueLt);
  ln(W-MR,y,W-MR,y+76,C.blue,3.5);
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text(ar('اكتب اسم الدالة بالعربية أو الإنجليزية مع نطاق الخلايا لتحصل على النتيجة فوراً مثل "جمع ب١:ب١٠" أو "متوسط أ١:أ٢٠". يعرض القسم جدولاً قابلاً للبحث بأسماء الدوال العربية والإنجليزية مع أمثلة تطبيقية لكل دالة.'),
      ML+10, y+10, {width:CW-22, align:'right', lineGap:3.5});
  y+=90;

  // جدول الأوامر
  y=secHdr('📊', 'جدول الأوامر المتاحة', 'قائمة شاملة بجميع الأوامر وأمثلتها', y);
  const cmds=[
    [ar('جمع'),    ar('مجموع نطاق الخلايا'),       ar('جمع ب١:ب١٠')],
    [ar('ضرب'),    ar('حاصل ضرب القيم'),            ar('ضرب أ١:أ٥')],
    [ar('متوسط'),  ar('الوسط الحسابي'),              ar('متوسط د١:د٢٠')],
    [ar('أكبر'),   ar('القيمة القصوى'),               ar('أكبر ج١:ج٥٠')],
    [ar('أصغر'),   ar('القيمة الدنيا'),               ar('أصغر ج١:ج٥٠')],
    [ar('عدد'),    ar('عدد الخلايا الرقمية'),        ar('عدد هـ١:هـ١٠٠')],
    [ar('مكافأة'), ar('يضيف ١٥٪ تلقائياً'),         ar('مكافأة أ١')],
    [ar('ضريبة'),  ar('يحسب ضريبة ١٥٪'),             ar('ضريبة ب٥')],
    [ar('نسبة'),   ar('النسبة المئوية'),              ar('نسبة ج١ د١')],
    [ar('إذا'),    ar('منطق شرطي بسيط'),             ar('إذا أ١ كبير من ١٠٠٠')],
  ];
  const cW=[100,200,CW-300];
  doc.rect(ML,y,CW,28).fill(C.green);
  doc.font(F).fontSize(10).fillColor(C.white);
  doc.text(ar('الأمر'), ML+6, y+9, {width:cW[0]-10, align:'right', lineBreak:false});
  doc.text(ar('الوظيفة'), ML+cW[0]+6, y+9, {width:cW[1]-10, align:'right', lineBreak:false});
  doc.text(ar('مثال الاستخدام'), ML+cW[0]+cW[1]+6, y+9, {width:cW[2]-10, align:'right', lineBreak:false});
  cmds.forEach((r,i) => {
    const ry=y+28+i*24;
    doc.rect(ML,ry,CW,24).fill(i%2===0?C.white:C.grey50);
    rr(ML+4,ry+5,90,14,5,C.greenLt);
    doc.font(F).fontSize(9).fillColor(C.green)
      .text(r[0], ML+4, ry+8, {width:90, align:'center', lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey700)
      .text(r[1], ML+cW[0]+6, ry+7, {width:cW[1]-10, align:'right', lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey600)
      .text(r[2], ML+cW[0]+cW[1]+6, ry+7, {width:cW[2]-10, align:'right', lineBreak:false});
    ln(ML,ry+24,W-MR,ry+24,C.grey200,0.2);
  });
  y+=28+cmds.length*24+16;

  rr(ML,y,CW,40,8,C.amberLt,'#FDE68A');
  doc.font(F).fontSize(18).text('💡', W-MR-36, y+9);
  doc.font(F).fontSize(10).fillColor(C.amber)
    .text(ar('تلميح: يمكنك الجمع بين الأوامر — مثلاً "مكافأة جمع ب١:ب١٠" لحساب مجموع القيم ثم إضافة المكافأة عليها. جرّب الجدول المرجعي القابل للبحث داخل التطبيق.'),
      ML+10, y+10, {width:CW-54, align:'right', lineGap:2.5});
  footer(4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 5 — أبعاد الخلايا
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('القسم الثالث — أبعاد الخلايا');
  let y=78;
  y=secHdr('📐', 'أبعاد الخلايا', 'حساب العرض والارتفاع المثاليَّين للنص العربي والإنجليزي', y);

  rr(ML,y,CW,80,9,C.purpleLt);
  ln(W-MR,y,W-MR,y+80,C.purple,3.5);
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text(ar('يحسب العرض والارتفاع المثاليَّين للخلية استناداً إلى محتواها مع مراعاة خصائص النص العربي وعرض أحرفه واتجاهه من اليمين لليسار إضافةً إلى حجم الخط والغامق والمائل وهوامش الحماية. يدعم معالجة خلية واحدة أو دُفعات كاملة.'),
      ML+10, y+10, {width:CW-22, align:'right', lineGap:3.5});
  y+=94;

  const half=(CW-12)/2;
  y=secHdr('✅', 'الميزات التفصيلية', 'كل إمكانيات حساب أبعاد الخلايا', y);

  const bL=['حساب عرض النص العربي بدقة عالية',
    'مراعاة حجم الخط والغامق والمائل',
    'معالجة خلية واحدة أو دُفعات كاملة',
    'إخراج الأبعاد بالبكسل ووحدات إكسل',
    'احتساب هوامش الحماية تلقائياً',
    'نسخ النتائج للحافظة بنقرة واحدة'];
  const bR=['دعم النص العربي والإنجليزي والمختلط',
    'تبديل بين وحدات الحساب',
    'معاينة الأبعاد قبل التطبيق',
    'تطبيق الأبعاد على إكسل مباشرةً',
    'حفظ الإعدادات المفضلة',
    'واجهة سهلة الاستخدام'];
  let ly=y, ry=y;
  bL.forEach(b => { ly=bull(b, ML,         ly, half); });
  bR.forEach(b => { ry=bull(b, ML+half+12, ry, half); });
  y=Math.max(ly,ry)+16;

  y=secHdr('🔢', 'كيفية استخدام حاسبة الأبعاد', 'دليل استخدام خطوة بخطوة', y);
  const dSteps=[
    ['أدخِل النص','أدخِل النص الذي تريد حساب أبعاد خليته في حقل الإدخال'],
    ['اختَر الخصائص','حدِّد حجم الخط والغامق والمائل وهوامش الحماية'],
    ['احسب','انقر "احسب الأبعاد" لتحصل على العرض والارتفاع بالبكسل ووحدات إكسل'],
    ['طبِّق','انقر "تطبيق على إكسل" لضبط الأبعاد مباشرةً على الخلية المحددة'],
  ];
  const ds=(CW-15)/4;
  dSteps.forEach((s,i) => {
    const sx=ML+i*(ds+5), sy=y;
    rr(sx,sy,ds,82,8,C.purpleLt,'#C4B5FD');
    doc.circle(sx+ds/2,sy+18,13).fill(C.purple);
    doc.font(F).fontSize(12).fillColor(C.white)
      .text(String(i+1), sx+ds/2-5, sy+12, {lineBreak:false});
    doc.font(F).fontSize(10).fillColor(C.grey900)
      .text(ar(s[0]), sx+6, sy+38, {width:ds-12, align:'right', lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600)
      .text(ar(s[1]), sx+6, sy+54, {width:ds-12, align:'right', lineGap:1});
  });
  footer(5);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 6 — الأدوات المتقدمة
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('القسم الرابع — الأدوات المتقدمة');
  let y=78;
  y=secHdr('🔧', 'الأدوات المتقدمة', 'ثلاث أدوات احترافية في قسم واحد متكامل', y);

  const tools=[
    {icon:'🔍', title:'رادار الخلايا الفارغة', sub:'الكشف الذكي عن الفراغات',
     bg:C.amberLt, bdr:'#FDE68A', fg:C.amber,
     desc:'الصقِ بياناتك ثم انقر بحث. تُنتج شبكة ملوَّنة: الخلايا المملوءة خضراء والفارغة حمراء مع إحداثياتها الدقيقة.',
     buls:['لصق البيانات المفصولة بفاصلة أو علامة تبويب',
       'شبكة ملوَّنة: مملوء أخضر وفارغ أحمر',
       'إحداثيات الخلايا الفارغة بدقة',
       'كشف صف العناوين تلقائياً',
       'ملخص عدد الخلايا المملوءة والفارغة']},
    {icon:'🖨️', title:'الضبط الذكي للطباعة', sub:'جداول بيانات مثالية للطباعة',
     bg:C.blueLt, bdr:'#93C5FD', fg:C.blue,
     desc:'أدخِل عدد الأعمدة والصفوف ونوع الورق فتُحسَب وحدات العرض وحجم الخط لطباعة احترافية.',
     buls:['دعم ورق أربعة بالطباعة وثلاثة',
       'الوضع الرأسي والأفقي',
       'وحدات عرض أعمدة إكسل الدقيقة',
       'حجم خط مُوصى به للطباعة',
       'جاهز للطباعة في ثلاث نقرات']},
    {icon:'📄', title:'التقرير الاحترافي', sub:'تحويل البيانات لتقرير جاهز',
     bg:C.greenLt, bdr:'#86EFAC', fg:C.green,
     desc:'الصقِ بياناتك الخام لتتحول إلى جدول منسَّق مع تلوين متناوب للصفوف ثم اطبع بنقرة واحدة.',
     buls:['جدول منسَّق من بيانات خام',
       'تلوين متناوب للصفوف',
       'عناوين أعمدة بارزة ومميَّزة',
       'كشف العناوين تلقائياً',
       'طباعة مباشرة للمتصفح']},
  ];
  const tw=(CW-16)/3;
  tools.forEach((t,i) => {
    const tx=ML+i*(tw+8), ty=y, th=220;
    rr(tx,ty,tw,th,9,C.white,t.bdr);
    rr(tx,ty,tw,52,9,t.bg,t.bdr);
    doc.rect(tx,ty+34,tw,18).fill(t.bg);
    doc.font(F).fontSize(22).text(t.icon, tx+tw-36, ty+10);
    doc.font(F).fontSize(10.5).fillColor(C.grey900)
      .text(ar(t.title), tx+6, ty+34, {width:tw-14, align:'right', lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(t.fg)
      .text(ar(t.sub), tx+6, ty+52, {width:tw-14, align:'right', lineBreak:false});
    ln(tx,ty+52,tx+tw,ty+52,t.bdr,0.5);
    doc.font(F).fontSize(9.5).fillColor(C.grey700)
      .text(ar(t.desc), tx+6, ty+66, {width:tw-10, align:'right', lineGap:2});
    let ty2=ty+128;
    t.buls.forEach(b => {
      doc.circle(tx+tw-12, ty2+5, 2).fill(t.fg);
      doc.font(F).fontSize(8.5).fillColor(C.grey700)
        .text(ar(b), tx+6, ty2, {width:tw-20, align:'right', lineBreak:false});
      ty2+=16;
    });
  });
  footer(6);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 7 — البنية التقنية والأمان
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('البنية التقنية والأمان');
  let y=78;
  y=secHdr('🏗️', 'بنية الوكيل الذكي', 'كيف يتصل سنابيرشيت بالذكاء الاصطناعي بأمان تام', y);

  const nodes=[
    {icon:'💻', label:ar('متصفحك'), lines:[ar('إضافة إكسل'),ar('لوحة مهام'),ar('ريأكت وفايت')]},
    {icon:'🖥️', label:ar('خادم ريبليت'), lines:[ar('وكيل إكسبريس'),ar('نود ٢٤ — أمريكا'),ar('مفتاح الذكاء محمي')], green:true},
    {icon:'🤖', label:ar('غروك'), lines:[ar('لاما ٣.٣ ٧٠ مليار'),ar('٣٠ طلب/دقيقة'),ar('مجاني بلا فاتورة')]},
  ];
  const nw=130, nh=92, ngap=(CW-nw*3)/2;
  nodes.forEach((n,i) => {
    const nx=ML+i*(nw+ngap), ny=y;
    rr(nx,ny,nw,nh,10,n.green?C.green:C.grey50,n.green?C.green:C.grey200);
    doc.font(F).fontSize(22).text(n.icon, nx, ny+8, {align:'center', width:nw});
    doc.font(F).fontSize(10.5).fillColor(n.green?C.white:C.grey900)
      .text(n.label, nx, ny+36, {align:'center', width:nw});
    n.lines.forEach((l,li) => {
      doc.font(F).fontSize(8.5).fillColor(n.green?'rgba(255,255,255,0.75)':C.grey600)
        .text(l, nx+6, ny+52+li*12, {width:nw-12, align:'right', lineBreak:false});
    });
    if (i<2) {
      const ax=nx+nw+6, ay=ny+nh/2;
      ln(ax,ay,ax+ngap-12,ay,C.green,1.5);
      doc.polygon([ax+ngap-12,ay-5],[ax+ngap-12,ay+5],[ax+ngap-4,ay]).fill(C.green);
    }
  });
  y+=nh+14;

  rr(ML,y,CW,48,7,C.blueLt,'#93C5FD');
  doc.font(F).fontSize(18).text('🔒', W-MR-36, y+12);
  doc.font(F).fontSize(10).fillColor(C.blue)
    .text(ar('الأمان: يُخزَّن مفتاح الذكاء الاصطناعي كسرٍّ في خادم ريبليت ولا يُكشف للمستخدم أبداً. يتصل الجميع — بمن فيهم مستخدمو العراق — بنقطة الخادم الأمريكي الآمنة فحسب دون الحاجة إلى أي برنامج للتحايل.'),
      ML+10, y+12, {width:CW-54, align:'right', lineGap:2.5});
  y+=62;

  y=secHdr('⚙️', 'المواصفات التقنية', 'تفاصيل إعداد الإضافة ومنظومة التطوير', y);
  const specsL=[
    [ar('نوع الإضافة'),     ar('لوحة مهام')],
    [ar('عرض اللوحة'),     ar('٤٠٠ بكسل')],
    [ar('مستوى الصلاحية'), ar('قراءة وكتابة الوثيقة')],
    [ar('اللغة الافتراضية'),ar('العربية')],
    [ar('شريط الأدوات'),   ar('تبويبة سنابيرشيت المخصصة')],
  ];
  const specsR=[
    [ar('الواجهة الأمامية'), ar('ريأكت ١٨ + فايت + تايب سكريبت')],
    [ar('الواجهة الخلفية'), ar('إكسبريس + نود ٢٤')],
    [ar('مكتبة الذكاء'),    ar('غروك الرسمية')],
    [ar('مدير الحزم'),     ar('باكيج مانيجر المتعدد')],
    [ar('الاستضافة'),       ar('ريبليت — الخادم الأمريكي')],
  ];
  const sw2=(CW-12)/2;
  [[specsL,ML],[specsR,ML+sw2+12]].forEach(([specs,sx]) => {
    rr(sx,y,sw2,specs.length*26+16,8,C.grey50,C.grey200);
    specs.forEach(([k,v],i) => {
      const sy2=y+10+i*26;
      doc.font(F).fontSize(8.5).fillColor(C.grey600)
        .text(k, sx+10, sy2, {width:sw2-18, align:'right', lineBreak:false});
      doc.font(F).fontSize(10).fillColor(C.grey900)
        .text(v, sx+10, sy2+13, {width:sw2-18, align:'right', lineBreak:false});
      if (i<specs.length-1) ln(sx+8,sy2+24,sx+sw2-8,sy2+24,C.grey200,0.3);
    });
  });
  footer(7);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 8 — نماذج الذكاء الاصطناعي
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('نماذج الذكاء الاصطناعي وسلسلة الاحتياط');
  let y=78;
  y=secHdr('🤖', 'نماذج الذكاء الاصطناعي', 'ثلاثة نماذج غروك مجانية ومحرك محلي احتياطي', y);

  const models=[
    {rank:ar('الأساسي'), icon:'🥇',    name:ar('لاما ٣.٣ ٧٠ مليار متعدد الاستخدام'),
     rpm:ar('٣٠ طلباً/دقيقة'), note:ar('أعلى جودة · الأحدث'),         bg:'#F0FDF4',bdr:'#86EFAC',fg:C.green},
    {rank:ar('الاحتياطي'),icon:'🥈',   name:ar('لاما ٣ ٧٠ مليار سياق ٨١٩٢'),
     rpm:ar('٣٠ طلباً/دقيقة'), note:ar('مستقر · سياق واسع'),           bg:C.blueLt, bdr:'#93C5FD',fg:C.blue},
    {rank:ar('الطارئ'),  icon:'🥉',    name:ar('لاما ٣ ٨ مليار سياق ٨١٩٢'),
     rpm:ar('٣٠ طلباً/دقيقة'), note:ar('فائق السرعة · خفيف'),          bg:C.amberLt,bdr:'#FCD34D',fg:C.amber},
    {rank:ar('بلا إنترنت'),icon:'🔧',  name:ar('المحرك المحلي الفوري'),
     rpm:ar('لا حدود'),         note:ar('٣٥+ نمط · صفر تأخير'),         bg:C.purpleLt,bdr:'#C4B5FD',fg:C.purple},
  ];
  const mw=(CW-15)/4;
  models.forEach((m,i) => {
    const mx=ML+i*(mw+5), my=y;
    rr(mx,my,mw,114,8,m.bg,m.bdr);
    doc.font(F).fontSize(22).text(m.icon, mx, my+8, {align:'center', width:mw});
    doc.font(F).fontSize(9.5).fillColor(m.fg)
      .text(m.rank, mx+6, my+40, {width:mw-12, align:'right', lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey900)
      .text(m.name, mx+6, my+56, {width:mw-12, align:'right', lineGap:1});
    doc.font(F).fontSize(8.5).fillColor(C.grey600)
      .text(m.rpm, mx+6, my+88, {width:mw-12, align:'right', lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey500)
      .text(m.note, mx+6, my+102, {width:mw-12, align:'right', lineBreak:false});
  });
  y+=128;

  y=secHdr('🔄', 'آلية التبديل التلقائي', 'كيف يختار سنابيرشيت النموذج المناسب', y);
  rr(ML,y,CW,80,9,C.grey50,C.grey200);
  const flowSteps=[
    ar('يُرسَل الطلب أولاً إلى نموذج لاما ٣.٣ ٧٠ مليار الأساسي'),
    ar('في حالة الفشل أو تجاوز الحد يتم التبديل تلقائياً إلى النموذج الاحتياطي'),
    ar('عند استنفاد النماذج السحابية يُفعَّل المحرك المحلي الفوري'),
    ar('المحرك المحلي يدعم ٣٥+ نمطاً ويعمل بصفر تأخير بلا إنترنت'),
  ];
  flowSteps.forEach((s,i) => {
    const sy2=y+12+i*16;
    doc.circle(ML+8, sy2+5, 3.5).fill(C.green);
    doc.font(F).fontSize(9.5).fillColor(C.grey700)
      .text(s, ML+20, sy2, {width:CW-28, align:'right', lineBreak:false});
  });
  y+=94;

  y=secHdr('💰', 'لماذا هو مجاني تماماً؟', 'فهم نموذج التسعير وحدود الاستخدام', y);
  const whyBoxes=[
    {icon:'🎁', title:ar('غروك مجاني'), desc:ar('تقدم غروك نماذجها مجاناً للمطورين بحد ٣٠ طلباً في الدقيقة لكل نموذج وهذا يكفي للاستخدام اليومي العادي.')},
    {icon:'🔧', title:ar('بلا مفتاح شخصي'), desc:ar('مفتاح غروك مخزَّن في خادم المطوّر. أنت لا تحتاج لإنشاء حساب أو دفع أي رسوم للاستمتاع بكامل الميزات.')},
    {icon:'⚡', title:ar('محرك محلي مجاني'), desc:ar('المحرك المحلي مدمج في الإضافة ويعمل بلا إنترنت ولا تكاليف. يوفر ٣٥ نمطاً جاهزاً للاستخدام الفوري.')},
  ];
  const bw=(CW-16)/3;
  whyBoxes.forEach((b,i) => {
    const bx=ML+i*(bw+8), by=y;
    rr(bx,by,bw,88,8,C.greenLt,C.green);
    doc.font(F).fontSize(22).text(b.icon, bx, by+8, {align:'center', width:bw});
    doc.font(F).fontSize(10.5).fillColor(C.green)
      .text(b.title, bx+8, by+38, {width:bw-14, align:'right', lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey700)
      .text(b.desc, bx+8, by+56, {width:bw-14, align:'right', lineGap:1.5});
  });
  footer(8);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 9 — أمثلة المعادلات
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('أمثلة المعادلات ونسبة الثقة');
  let y=78;
  y=secHdr('📊', 'أمثلة معادلات حقيقية', 'معادلات مُولَّدة من أوصاف عربية بالمحرك الذكي', y);

  // جدول أمثلة
  const tC=[200,120,CW-320];
  doc.rect(ML,y,CW,28).fill(C.green);
  doc.font(F).fontSize(10).fillColor(C.white);
  doc.text(ar('الوصف بالعربية البسيطة'), ML+6, y+9, {width:tC[0]-10, align:'right', lineBreak:false});
  doc.text(ar('نوع المعادلة'), ML+tC[0]+6, y+9, {width:tC[1]-10, align:'right', lineBreak:false});
  doc.text(ar('المعادلة المُولَّدة'), ML+tC[0]+tC[1]+6, y+9, {width:tC[2]-8, lineBreak:false});

  const rows=[
    [ar('إذا تجاوزت الساعات ٤٠ احسب وقتاً إضافياً بمعدل ١.٥'), ar('شرطية'), '=IF(A1>40,(A1-40)*1.5,0)','#D1FAE5','#065F46'],
    [ar('قيّم الطالب: ممتاز فوق ٩٠ وجيد فوق ٧٥'),              ar('شرطية'), '=IFS(B1>=90,"A+",...)','#D1FAE5','#065F46'],
    [ar('ابحث في العمود الأول وأعد القيمة المقابلة من الثاني'),  ar('بحث'),   '=XLOOKUP(D1,A:A,B:B)','#DBEAFE','#1E40AF'],
    [ar('اجمع المبيعات التي تجاوزت الألف دينار فقط'),           ar('إحصاء'), '=SUMIF(C:C,">1000",D:D)','#EDE9FE','#5B21B6'],
    [ar('القسط الشهري لقرض بفائدة ٥٪ لمدة ٣٠ سنة'),             ar('مالية'),  '=PMT(0.05/12,360,A1)','#FEF3C7','#92400E'],
    [ar('احسب عمر الشخص بالسنوات من تاريخ ميلاده'),             ar('تاريخ'),  '=DATEDIF(A1,TODAY(),"Y")','#FCE7F3','#9D174D'],
    [ar('رتِّب الموظف من الأعلى مبيعاً إلى الأدنى'),             ar('إحصاء'), '=RANK(A1,A:A,0)','#EDE9FE','#5B21B6'],
    [ar('أضف مكافأة ١٥٪ إذا تجاوزت المبيعات عشرة آلاف'),       ar('شرطية'), '=IF(A1>10000,A1*1.15,A1)','#D1FAE5','#065F46'],
    [ar('عدّ الطلاب الناجحين الذين حصلوا على ٦٠ فأكثر'),        ar('إحصاء'), '=COUNTIF(B:B,">=60")','#EDE9FE','#5B21B6'],
  ];
  rows.forEach((r,i) => {
    const ry=y+28+i*24;
    doc.rect(ML,ry,CW,24).fill(i%2===0?C.white:C.grey50);
    doc.font(F).fontSize(9).fillColor(C.grey700)
      .text(r[0], ML+6, ry+7, {width:tC[0]-10, align:'right', lineBreak:false});
    rr(ML+tC[0]+6,ry+6,tC[1]-10,13,6,r[3]);
    doc.font(F).fontSize(8.5).fillColor(r[4])
      .text(r[1], ML+tC[0]+6, ry+9, {align:'center', width:tC[1]-10, lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.greenDk)
      .text(r[2], ML+tC[0]+tC[1]+6, ry+8, {width:tC[2]-8, lineBreak:false});
    ln(ML,ry+24,W-MR,ry+24,C.grey200,0.2);
  });
  y+=28+rows.length*24+16;

  y=secHdr('📈', 'نظام نسبة الثقة', 'كيف تفسّر نسبة الدقة في معادلاتك', y);
  const confBoxes=[
    {range:ar('أعلى من ٨٥٪'), label:ar('دقة عالية'), desc:ar('المعادلة دقيقة ويمكن تطبيقها مباشرةً بثقة تامة'), bg:'#F0FDF4', bdr:'#86EFAC', fc:C.green},
    {range:ar('٥٠ إلى ٨٥٪'),  label:ar('مقبولة'),     desc:ar('راجع الوصف وتأكد من المعادلة قبل التطبيق'),       bg:C.amberLt, bdr:'#FDE68A', fc:C.amber},
    {range:ar('أقل من ٥٠٪'),  label:ar('تحتاج مراجعة'),desc:ar('أعِد صياغة الطلب بتفاصيل أكثر وضوحاً ودقة'),   bg:'#FEF2F2', bdr:'#FCA5A5', fc:'#DC2626'},
  ];
  const cbw=(CW-16)/3;
  confBoxes.forEach((cb,i) => {
    const cx=ML+i*(cbw+8), cy=y;
    rr(cx,cy,cbw,68,8,cb.bg,cb.bdr);
    doc.font(F).fontSize(14).fillColor(cb.fc)
      .text(cb.range, cx+6, cy+8, {width:cbw-12, align:'right', lineBreak:false});
    rr(cx+6,cy+28,cbw-12,16,5,cb.bdr);
    doc.font(F).fontSize(9.5).fillColor(cb.fc)
      .text(cb.label, cx+6, cy+31, {width:cbw-12, align:'center', lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey700)
      .text(cb.desc, cx+6, cy+50, {width:cbw-12, align:'right', lineBreak:false});
  });
  footer(9);
}

// ═══════════════════════════════════════════════════════════════════════════════
// الصفحة 10 — دليل التثبيت والمطوّر
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('دليل التثبيت ومعلومات المطوّر');
  let y=78;
  y=secHdr('📥', 'دليل التثبيت خطوة بخطوة', 'أربع خطوات بسيطة لتفعيل سنابيرشيت في إكسل', y);

  const steps=[
    [ar('تحميل ملف البيان'), ar('افتح الرابط المذكور في صفحة المنتج ليتحمَّل ملف البيان تلقائياً')],
    [ar('فتح إضافات إكسل'),  ar('في إكسل: انقر إدراج ← إضافات ← إضافاتي ← إدارة إضافاتي')],
    [ar('رفع ملف البيان'),    ar('انقر "رفع إضافة" واختر الملف الذي تم تحميله — تظهر تبويبة سنابيرشيت')],
    [ar('فتح المحرك الذكي'),  ar('انقر تبويبة سنابيرشيت ← "فتح المحرك الذكي" ← تفتح اللوحة على الجانب')],
  ];
  steps.forEach((s,i) => {
    const sy=y+i*52;
    doc.circle(ML+14,sy+20,13).fill(C.green);
    doc.font(F).fontSize(12).fillColor(C.white).text(String(i+1), ML+9, sy+14);
    rr(ML+36,sy,CW-36,44,6,C.grey50,C.grey200);
    doc.font(F).fontSize(11).fillColor(C.grey900)
      .text(s[0], ML+44, sy+8, {width:CW-52, align:'right', lineBreak:false});
    doc.font(F).fontSize(9.5).fillColor(C.grey600)
      .text(s[1], ML+44, sy+26, {width:CW-52, align:'right', lineBreak:false});
  });
  y+=steps.length*52+18;

  y=secHdr('👤', 'معلومات المطوّر', 'صانع الإضافة والتقنيات المستخدمة في بنائها', y);
  rr(ML,y,CW,70,12,C.greenDk);
  doc.font(F).fontSize(20).fillColor(C.white)
    .text(ar('مصطفى السهلاني'), ML+16, y+10, {width:CW-32, align:'right', lineBreak:false});
  doc.font(F).fontSize(11).fillColor(C.white).fillOpacity(0.85)
    .text(ar('مطوّر ومصمِّم إضافة سنابيرشيت لإكسل من مايكروسوفت'), ML+16, y+36, {width:CW-32, align:'right', lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.white).fillOpacity(0.7)
    .text(ar('مبنيّ بريأكت وإكسبريس ونود وتايب سكريبت وغروك على ريبليت'), ML+16, y+54, {width:CW-32, align:'right', lineBreak:false});
  doc.fillOpacity(1);
  y+=84;

  const bw=(CW-12)/2;
  const boxes=[
    {title:ar('التقنيات المستخدمة'), items:[
      ar('ريأكت ١٨ + فايت — الواجهة الأمامية'),
      ar('إكسبريس + نود ٢٤ — الخادم الخلفي'),
      ar('غروك — الذكاء الاصطناعي المجاني'),
      ar('تايلوند + شادسي — التصميم'),
      ar('تايب سكريبت — الكامل'),
      ar('ريبليت — الاستضافة والنشر'),
    ]},
    {title:ar('مواصفات الإضافة'), items:[
      ar('بيان أوفيس ١.١ — نوع لوحة المهام'),
      ar('عرض اللوحة: ٤٠٠ بكسل'),
      ar('الصلاحية: قراءة وكتابة الوثيقة'),
      ar('تبويبة شريط أدوات مخصصة'),
      ar('اللغة الافتراضية: العربية'),
      ar('يتطلب اتصالاً آمناً بالإنترنت'),
    ]},
  ];
  boxes.forEach((box,i) => {
    const bx=ML+i*(bw+12);
    rr(bx,y,bw,112,9,C.grey50,C.grey200);
    doc.font(F).fontSize(11).fillColor(C.green)
      .text(box.title, bx+10, y+10, {width:bw-18, align:'right', lineBreak:false});
    box.items.forEach((it,ii) => {
      doc.circle(bx+bw-14, y+32+ii*14, 2.5).fill(C.green);
      doc.font(F).fontSize(9.5).fillColor(C.grey700)
        .text(it, bx+10, y+26+ii*14, {width:bw-22, align:'right', lineBreak:false});
    });
  });
  y+=128;

  rr(ML,y,CW,36,8,C.greenDk);
  doc.font(F).fontSize(9.5).fillColor(C.gold)
    .text(ar('© ٢٠٢٦ مصطفى السهلاني — جميع الحقوق محفوظة'), ML+14, y+8, {width:CW-28, align:'right', lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor('rgba(255,255,255,0.65)')
    .text(ar('سنابيرشيت الإصدار الأول · الدليل الرسمي · مبني على ريبليت · مدعوم بغروك المجاني'),
      ML+14, y+22, {width:CW-28, align:'right', lineBreak:false});
  footer(10);
}

doc.end();
console.log('✅ Arabic PDF done:', OUTPUT);
