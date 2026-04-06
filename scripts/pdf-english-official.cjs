'use strict';
// SniperSheet_English_Official.pdf — Pure English edition
const PDFDocument = require('/tmp/pdfgen/node_modules/pdfkit');
const fs          = require('fs');

const OUTPUT     = '/home/runner/workspace/SniperSheet_English_Official.pdf';
const FONT_CAIRO = '/tmp/pdfgen/fonts/Cairo.ttf';

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
  info:{ Title:'SniperSheet — Official English Guide',
         Author:'Mustafa Alsahlany',
         Subject:'Excel Add-in Official English Reference Guide',
         Creator:'SniperSheet v1.0' },
});
doc.pipe(fs.createWriteStream(OUTPUT));
if (fs.existsSync(FONT_CAIRO)) doc.registerFont('Cairo', FONT_CAIRO);
const F  = 'Cairo';
const M  = 'Courier';
const W  = 595.28, H = 841.89;
const ML = 46, MR = 46, CW = W - ML - MR;
const TOTAL = 9;

const rr = (x,y,w,h,r,fill,stroke) => {
  doc.roundedRect(x,y,w,h,r);
  if (fill && stroke) doc.fillAndStroke(fill, stroke);
  else if (fill)      doc.fillColor(fill).fill();
  else if (stroke)    doc.strokeColor(stroke).stroke();
};
const ln = (x1,y1,x2,y2,color=C.grey200,lw=0.5) =>
  doc.moveTo(x1,y1).lineTo(x2,y2).strokeColor(color).lineWidth(lw).stroke();

// ── Footer ────────────────────────────────────────────────────────────────────
const footer = (n, dark=false) => {
  const fy = H - 30;
  const tc = dark ? 'rgba(255,255,255,0.7)' : C.grey400;
  const lc = dark ? 'rgba(255,255,255,0.2)' : C.grey200;
  doc.moveTo(ML,fy).lineTo(W-MR,fy).strokeColor(lc).lineWidth(0.5).stroke();
  doc.font(F).fontSize(7.5).fillColor(tc);
  doc.text('Developed by: Mustafa Alsahlany', ML, fy+8, {lineBreak:false});
  const mid = 'SniperSheet Official English Guide · 2026';
  doc.text(mid, (W - doc.widthOfString(mid))/2, fy+8, {lineBreak:false});
  const pg = `Page ${n} of ${TOTAL}`;
  doc.text(pg, W-MR-doc.widthOfString(pg), fy+8, {lineBreak:false});
};

// ── Page Header ───────────────────────────────────────────────────────────────
const hdr = (section) => {
  doc.rect(0,0,W,7).fill(C.green);
  rr(ML,16,36,36,7,C.greenLt);
  doc.font(F).fontSize(20).text('🎯', ML+6, 21);
  doc.font(F).fontSize(14).fillColor(C.green).text('SniperSheet', ML+46, 18, {lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey400).text(section, ML+46, 36, {lineBreak:false});
  ln(ML,62,W-MR,62,C.green,1.5);
};

// ── Section Header ────────────────────────────────────────────────────────────
const secHdr = (icon, title, sub, y) => {
  rr(ML,y,36,36,8,C.green);
  doc.font(F).fontSize(18).text(icon, ML+7, y+7);
  doc.font(F).fontSize(14).fillColor(C.grey900).text(title, ML+46, y+3, {lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey600).text(sub, ML+46, y+21, {lineBreak:false});
  return y+50;
};

// ── English Bullet ────────────────────────────────────────────────────────────
const bull = (txt, x, y, w) => {
  doc.circle(x+5, y+6, 2.5).fill(C.green);
  doc.font(F).fontSize(9.5).fillColor(C.grey700)
    .text(txt, x+14, y, {width:w-14, lineGap:1});
  return y + doc.currentLineHeight() + 5;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Page 1 — Cover
// ═══════════════════════════════════════════════════════════════════════════════
{
  doc.rect(0,0,W,H).fill(C.greenDk);
  for (let i=0;i<20;i++) doc.rect(0,H*(i/20),W,H/20).fillOpacity(0.03*i).fill('#1db954');
  doc.fillOpacity(1);
  doc.circle(W-60,130,200).fillOpacity(0.05).fill(C.white);
  doc.circle(60,H-110,160).fillOpacity(0.05).fill(C.white);
  doc.fillOpacity(1);

  const bW=300, bX=(W-bW)/2;
  doc.roundedRect(bX,44,bW,28,14).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(9.5).fillColor(C.white)
    .text('⚡  EXCEL ADD-IN  ·  OFFICIAL ENGLISH GUIDE', bX, 54,
      {align:'center', width:bW, lineBreak:false});

  const lsz=82, lx=(W-lsz)/2;
  doc.roundedRect(lx,88,lsz,lsz,16).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(36).text('🎯', lx, 105, {align:'center', width:lsz});

  doc.font(F).fontSize(52).fillColor(C.white).text('SniperSheet', 0, 186, {align:'center', width:W});
  doc.font(F).fontSize(18).fillColor(C.white).fillOpacity(0.88)
    .text('AI-Powered Excel Formula Engine', 0, 250, {align:'center', width:W});
  doc.font(F).fontSize(12).fillColor(C.white).fillOpacity(0.65)
    .text('Natural Language → Precise Excel Formulas in Seconds', 0, 276, {align:'center', width:W});
  doc.fillOpacity(1);
  ln(W/2-28,310,W/2+28,310,C.white,2);

  const stats=[['35+','Formula Patterns'],['4','Smart Tabs'],['100%','Free AI'],['3','AI Models']];
  const sw=CW/stats.length;
  stats.forEach(([n,l],i) => {
    const sx=ML+i*sw;
    doc.font(F).fontSize(26).fillColor(C.white).text(n, sx, 332, {align:'center', width:sw});
    doc.font(F).fontSize(9).fillColor(C.white).fillOpacity(0.65)
      .text(l, sx, 364, {align:'center', width:sw}); doc.fillOpacity(1);
  });

  const pills=['Smart Hub','Commands','Cell Dimensions','Advanced Tools','100% Free','Bilingual'];
  let px=ML;
  pills.forEach(p => {
    const pw=doc.font(F).fontSize(9.5).widthOfString(p)+22;
    doc.roundedRect(px,408,pw,24,12).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
    doc.font(F).fontSize(9.5).fillColor(C.white).text(p, px+11, 415, {lineBreak:false});
    px+=pw+8;
  });

  ln(ML,H-62,W-MR,H-62,C.white,0.2);
  doc.font(F).fontSize(12).fillColor(C.white).fillOpacity(0.85)
    .text('👤 Mustafa Alsahlany', ML, H-48, {lineBreak:false});
  doc.font(F).fontSize(9).fillColor(C.gold).fillOpacity(0.9)
    .text('Developer & Designer  ·  v1.0  ·  2026', ML, H-33, {lineBreak:false});
  doc.fillOpacity(1);
  footer(1,true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page 2 — Product Overview
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('Product Overview — Official Guide');
  let y=78;
  y=secHdr('📋','What is SniperSheet?','Complete product overview and key capabilities',y);

  rr(ML,y,CW,84,9,C.greenLt);
  ln(ML,y,ML,y+84,C.green,3.5);
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text('SniperSheet is a professional Microsoft Excel task pane add-in that transforms natural language into precise, ready-to-use Excel formulas. Powered by Groq AI (Llama 3.3 70B — completely free), it supports both English and Arabic input, routes all AI calls through a US Replit server (no VPN needed anywhere), and falls back to a built-in local formula engine when offline.',
      ML+14, y+12, {width:CW-22, lineGap:3});
  y+=98;

  const c3w=(CW-20)/3;
  const cards=[
    ['🤖','Groq AI Engine',       'Llama 3.3 70B — free\nNo credit card required'],
    ['🌐','Bilingual Support',     'English & Arabic input\nFull RTL layout support'],
    ['🔒','Proxy Architecture',    'US server relays AI calls\nNo VPN needed — worldwide'],
    ['⚡','Local Fallback',        '35+ instant patterns\nZero latency — works offline'],
    ['📐','Office.js Integration', 'ReadWriteDocument access\nCustom Excel Ribbon tab'],
    ['📱','Responsive Design',     '400px task pane optimized\nSmooth scrolling UX'],
  ];
  for (let i=0;i<2;i++) for (let j=0;j<3;j++) {
    const c=cards[i*3+j], cx=ML+j*(c3w+10), cy=y+i*94;
    rr(cx,cy,c3w,86,9,C.grey50,C.grey200);
    doc.font(F).fontSize(20).text(c[0], cx+10, cy+10);
    doc.font(F).fontSize(11).fillColor(C.grey900).text(c[1], cx+10, cy+36, {lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey600).text(c[2], cx+10, cy+52, {width:c3w-18});
  }
  y+=2*94+14;

  rr(ML,y,CW,46,8,C.green);
  doc.font(F).fontSize(18).text('💡', ML+14, y+10);
  doc.font(F).fontSize(11).fillColor(C.white)
    .text('Describe your calculation in plain English or Arabic → SniperSheet generates the exact formula with explanation, confidence score, and formatting hints instantly.',
      ML+44, y+12, {width:CW-56, lineGap:2.5});
  y+=60;

  y=secHdr('🏆','Who is SniperSheet for?','Target users and primary use cases',y);
  const users=[
    ['🔧','Engineers',          'Complex engineering formulas in seconds'],
    ['💼','Financial Analysts', 'Data analysis and KPI tracking'],
    ['📊','Project Managers',   'Progress tracking and budgeting'],
    ['🎓','Students',           'Statistical analysis and research'],
  ];
  const uw=(CW-15)/4;
  users.forEach((u,i) => {
    const ux=ML+i*(uw+5);
    rr(ux,y,uw,72,8,C.greenLt,C.green);
    doc.font(F).fontSize(22).text(u[0], ux, y+8, {align:'center', width:uw});
    doc.font(F).fontSize(10).fillColor(C.grey900).text(u[1], ux+8, y+38, {width:uw-14, lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600).text(u[2], ux+8, y+54, {width:uw-14, lineBreak:false});
  });
  footer(2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page 3 — Smart Hub
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('Tab 1 — Smart Hub');
  let y=78;
  y=secHdr('✨','Smart Hub — AI Formula Engine','Tab 1 · Natural language → Excel formula via Groq AI',y);

  rr(ML,y,CW,80,9,C.greenLt);
  ln(ML,y,ML,y+80,C.green,3.5);
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text('The core feature of SniperSheet. Type any description of your calculation in English or Arabic — such as "calculate overtime for hours over 40 at 1.5x rate" — then click "Smart Analysis". The AI engine processes your request via Groq AI and returns the exact formula with a detailed explanation, confidence score (0–100%), and optional formatting hints.',
      ML+14, y+12, {width:CW-22, lineGap:3});
  y+=94;

  y=secHdr('📋','Full Feature List','Everything Smart Hub offers',y);
  const half=(CW-12)/2;
  const bL=['AI formula generation via Groq (Llama 3.3 70B)',
    'Confidence scoring: 0–100% per formula',
    'Formula type auto-detection (IF, VLOOKUP, SUM...)',
    'Word Radar: detects typos & ambiguous terms',
    'Style hints: cell colors, bold, italic formatting',
    'Full history log with timestamps',
    'Example prompts library in English & Arabic',
    'Keyboard shortcut for instant analysis'];
  const bR=['Local formula engine — works fully offline',
    '3-model AI cascade with auto-retry on failure',
    'Status indicators: success, warning, error',
    'Detailed step-by-step formula explanation',
    'One-click formula copy to clipboard',
    'One-click apply formula directly to Excel cell',
    'Supports deeply nested complex formulas',
    'Smart error handling with fix suggestions'];
  let ly=y, ry=y;
  bL.forEach(b => { ly=bull(b, ML,         ly, half); });
  bR.forEach(b => { ry=bull(b, ML+half+12, ry, half); });
  y=Math.max(ly,ry)+14;

  y=secHdr('🔄','How Smart Hub Works','Step-by-step from description to formula',y);
  const steps=[
    ['Type','Describe your calculation in plain English or Arabic in the input field'],
    ['Analyze','Click "Smart Analysis" or use the keyboard shortcut to trigger processing'],
    ['Process','Request is securely routed through Replit server to Groq AI for analysis'],
    ['Result','Formula appears with confidence score, explanation, and formatting hints'],
  ];
  const sw=(CW-15)/4;
  steps.forEach((s,i) => {
    const sx=ML+i*(sw+5);
    rr(sx,y,sw,80,8,C.grey50,C.grey200);
    doc.circle(sx+sw/2,y+18,13).fill(C.green);
    doc.font(F).fontSize(12).fillColor(C.white).text(String(i+1), sx+sw/2-5, y+12);
    doc.font(F).fontSize(10).fillColor(C.grey900).text(s[0], sx+8, y+38, {width:sw-14, lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600).text(s[1], sx+8, y+54, {width:sw-14, lineGap:1});
  });
  footer(3);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page 4 — Commands
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('Tab 2 — Commands');
  let y=78;
  y=secHdr('⌨️','Commands — Formula Aliases','Tab 2 · Arabic & English names for instant calculations',y);

  rr(ML,y,CW,72,9,C.blueLt);
  ln(ML,y,ML,y+72,C.blue,3.5);
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text('Type the function name in English or Arabic with a cell range to get an instant result. For example, type "SUM B1:B10" or the Arabic equivalent "جمع" with a range. The Commands tab includes a searchable reference table of all available function names with Arabic aliases and usage examples.',
      ML+14, y+10, {width:CW-22, lineGap:3});
  y+=86;

  const cmds=[
    ['SUM  / جمع',        'Sum of a cell range',             '=SUM(B1:B10)'],
    ['MULTIPLY / ضرب',   'Product of values',                '=PRODUCT(A1:A5)'],
    ['AVERAGE / متوسط',  'Arithmetic mean',                  '=AVERAGE(D1:D20)'],
    ['MAX / أكبر',        'Maximum value',                    '=MAX(C1:C50)'],
    ['MIN / أصغر',        'Minimum value',                    '=MIN(C1:C50)'],
    ['COUNT / عدد',       'Count numeric cells',              '=COUNT(E1:E100)'],
    ['BONUS / مكافأة',   'Adds 15% bonus automatically',     '=A1*1.15'],
    ['TAX / ضريبة',      'Calculates 15% tax',               '=A1*0.15'],
    ['PERCENTAGE / نسبة','Percentage between two values',     '=(A1/B1)*100'],
    ['IF / إذا',          'Simple conditional logic',         '=IF(A1>1000,"High","Low")'],
  ];
  const cW=[188,180,CW-368];
  doc.rect(ML,y,CW,28).fill(C.green);
  doc.font(F).fontSize(10).fillColor(C.white);
  doc.text('Command Name', ML+6, y+9, {width:cW[0]-10, lineBreak:false});
  doc.text('Description', ML+cW[0]+6, y+9, {width:cW[1]-10, lineBreak:false});
  doc.text('Formula Generated', ML+cW[0]+cW[1]+6, y+9, {lineBreak:false});
  cmds.forEach((r,i) => {
    const ry=y+28+i*24;
    doc.rect(ML,ry,CW,24).fill(i%2===0?C.white:C.grey50);
    rr(ML+4,ry+5,cW[0]-8,14,5,C.greenLt);
    doc.font(F).fontSize(8.5).fillColor(C.green)
      .text(r[0], ML+4, ry+8, {align:'center', width:cW[0]-8, lineBreak:false});
    doc.font(F).fontSize(9).fillColor(C.grey700)
      .text(r[1], ML+cW[0]+6, ry+7, {width:cW[1]-10, lineBreak:false});
    doc.font(M).fontSize(8.5).fillColor(C.greenDk)
      .text(r[2], ML+cW[0]+cW[1]+6, ry+8, {width:cW[2]-6, lineBreak:false});
    ln(ML,ry+24,W-MR,ry+24,C.grey200,0.2);
  });
  y+=28+cmds.length*24+16;

  rr(ML,y,CW,38,8,C.amberLt,'#FDE68A');
  doc.font(F).fontSize(18).text('💡', ML+12, y+8);
  doc.font(F).fontSize(10).fillColor(C.amber)
    .text('Tip: You can combine commands — for example type "BONUS SUM B1:B10" to sum a range and then apply the 15% bonus automatically. Use the in-app searchable reference table to discover all available commands.',
      ML+40, y+10, {width:CW-48, lineGap:2.5});
  footer(4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page 5 — Cell Dimensions + Advanced Tools
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('Tab 3 & 4 — Cell Dimensions & Advanced Tools');
  let y=78;
  y=secHdr('📐','Cell Dimensions','Tab 3 · Calculate optimal width & height for any cell content',y);

  rr(ML,y,CW,72,9,C.purpleLt);
  ln(ML,y,ML,y+72,C.purple,3.5);
  doc.font(F).fontSize(10.5).fillColor(C.grey700)
    .text('Calculates the optimal width and height for an Excel cell based on its content, accounting for Arabic character width, RTL text direction, font size, bold and italic styling, and padding margins. Supports both single-cell and batch processing modes.',
      ML+14, y+10, {width:CW-22, lineGap:3});
  y+=86;

  const half=(CW-12)/2;
  const dimBL=['Arabic text character width calculation',
    'RTL text direction awareness','Font size & bold/italic adjustment',
    'Single cell & batch processing modes','Pixel and Excel unit output',
    'One-click copy results to clipboard'];
  const dimBR=['Mixed Arabic + English text support',
    'Switch between measurement units','Preview dimensions before applying',
    'Apply dimensions directly to Excel','Save favorite settings',
    'Intuitive easy-to-use interface'];
  let ly=y, ry=y;
  dimBL.forEach(b => { ly=bull(b, ML,         ly, half); });
  dimBR.forEach(b => { ry=bull(b, ML+half+12, ry, half); });
  y=Math.max(ly,ry)+16;

  y=secHdr('🔧','Advanced Tools','Tab 4 · Three professional productivity utilities',y);
  const tools=[
    {icon:'🔍',title:'Empty Field Radar',bg:C.amberLt,border:'#FDE68A',fg:C.amber,
     desc:'Scan CSV or tab-separated data for missing values. Get a color-coded visual grid plus a precise list of every empty cell coordinate.',
     buls:['Paste CSV or tab-separated data','Color grid: filled=green, empty=red',
       'Exact empty cell coordinate list','Auto header row detection',
       'Filled vs empty summary count']},
    {icon:'🖨️',title:'Smart Print-Fit',bg:C.blueLt,border:'#93C5FD',fg:C.blue,
     desc:'Calculate optimal column widths and font sizes to fit your spreadsheet onto A4 or A3 paper — eliminating all trial-and-error print formatting.',
     buls:['A4 & A3 paper size support','Portrait & landscape orientation',
       'Excel column width units output','Recommended font size output',
       'Print-ready result in 3 clicks']},
    {icon:'📄',title:'Professional Report',bg:C.greenLt,border:'#86EFAC',fg:C.green,
     desc:'Transform raw pasted data into a styled HTML table with alternating row colors and bold column headers, then send directly to the browser print dialog.',
     buls:['Styled HTML from raw data','Alternating row color styling',
       'Bold column headers','Auto header row detection',
       'One-click print dialog trigger']},
  ];
  const tw=(CW-16)/3;
  tools.forEach((t,i) => {
    const tx=ML+i*(tw+8), ty=y, th=186;
    rr(tx,ty,tw,th,9,C.white,t.border);
    rr(tx,ty,tw,48,9,t.bg,t.border);
    doc.rect(tx,ty+32,tw,16).fill(t.bg);
    doc.font(F).fontSize(22).text(t.icon, tx+10, ty+10);
    doc.font(F).fontSize(11).fillColor(C.grey900).text(t.title, tx+10, ty+32, {width:tw-18, lineBreak:false});
    ln(tx,ty+48,tx+tw,ty+48,t.border,0.5);
    doc.font(F).fontSize(9).fillColor(C.grey700).text(t.desc, tx+10, ty+56, {width:tw-18, lineGap:1.5});
    let ty2=ty+116;
    t.buls.forEach(b => {
      doc.circle(tx+14,ty2+5,2).fill(t.fg);
      doc.font(F).fontSize(8.5).fillColor(C.grey700).text(b, tx+22, ty2, {width:tw-28, lineBreak:false});
      ty2+=16;
    });
  });
  footer(5);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page 6 — AI Architecture
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('AI Architecture & Technology Stack');
  let y=78;
  y=secHdr('🏗️','AI Proxy Architecture','How SniperSheet connects to AI without exposing API keys',y);

  const nodes=[
    {icon:'💻',title:'Your Browser',lines:['Excel Add-in Task Pane','400px width interface','React 18 + Vite frontend']},
    {icon:'🖥️',title:'Replit Server', lines:['Express.js AI Proxy','Node.js 24 — US hosted','API key fully secured'], green:true},
    {icon:'🤖',title:'Groq AI',       lines:['Llama 3.3 70B model','30 requests/min (free)','No billing — ever']},
  ];
  const nw=132, nh=90, ngap=(CW-nw*3)/2;
  nodes.forEach((n,i) => {
    const nx=ML+i*(nw+ngap), ny=y;
    rr(nx,ny,nw,nh,10,n.green?C.green:C.grey50,n.green?C.green:C.grey200);
    doc.font(F).fontSize(22).text(n.icon, nx, ny+8, {align:'center', width:nw});
    doc.font(F).fontSize(11).fillColor(n.green?C.white:C.grey900).text(n.title, nx, ny+36, {align:'center', width:nw});
    n.lines.forEach((l,li) => {
      doc.font(F).fontSize(8.5).fillColor(n.green?'rgba(255,255,255,0.75)':C.grey600)
        .text(l, nx+6, ny+52+li*11, {width:nw-12, lineBreak:false});
    });
    if (i<2) {
      const ax=nx+nw+6, ay=ny+nh/2;
      ln(ax,ay,ax+ngap-12,ay,C.green,1.5);
      doc.polygon([ax+ngap-12,ay-5],[ax+ngap-12,ay+5],[ax+ngap-4,ay]).fill(C.green);
      doc.font(F).fontSize(7.5).fillColor(C.grey500)
        .text(i===0?'HTTPS Request':'Groq SDK', ax, ay-16, {width:ngap-8, align:'center', lineBreak:false});
    }
  });
  y+=nh+14;

  rr(ML,y,CW,40,7,C.blueLt,'#93C5FD');
  doc.font(F).fontSize(18).text('🔒', ML+12, y+9);
  doc.font(F).fontSize(10).fillColor(C.blue)
    .text('Security: GROQ_API_KEY is stored as a server-side secret on Replit. Users everywhere — including Iraq — connect only to Replit\'s HTTPS endpoint. They never interact with Groq directly. Zero VPN required.',
      ML+40, y+11, {width:CW-48, lineGap:2.5});
  y+=54;

  y=secHdr('🤖','AI Model Cascade','3 free Groq models + offline local fallback — auto-retry',y);
  const models=[
    {rank:'🥇 Primary',   name:'llama-3.3-70b-versatile',params:'70B',rpm:'30',note:'Best quality · latest',  bg:'#F0FDF4',bdr:'#86EFAC',fg:C.green},
    {rank:'🥈 Fallback',  name:'llama3-70b-8192',         params:'70B',rpm:'30',note:'Stable · 8192 ctx',     bg:C.blueLt, bdr:'#93C5FD',fg:C.blue},
    {rank:'🥉 Emergency', name:'llama3-8b-8192',          params:'8B', rpm:'30',note:'Ultra-fast · light',    bg:C.amberLt,bdr:'#FCD34D',fg:C.amber},
    {rank:'🔧 Offline',   name:'Local Formula Engine',    params:'—',  rpm:'∞', note:'35+ patterns · 0ms',   bg:C.purpleLt,bdr:'#C4B5FD',fg:C.purple},
  ];
  const mw=(CW-15)/4;
  models.forEach((m,i) => {
    const mx=ML+i*(mw+5), my=y;
    rr(mx,my,mw,92,8,m.bg,m.bdr);
    doc.font(F).fontSize(9).fillColor(m.fg).text(m.rank, mx+8, my+10, {lineBreak:false});
    doc.font(F).fontSize(9.5).fillColor(C.grey900).text(m.name, mx+8, my+26, {width:mw-14});
    doc.font(F).fontSize(8.5).fillColor(C.grey600).text(`${m.params} params`, mx+8, my+58, {lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey600).text(`${m.rpm} RPM`, mx+8, my+70, {lineBreak:false});
    doc.font(F).fontSize(8).fillColor(C.grey400).text(m.note, mx+8, my+80, {lineBreak:false});
  });
  y+=106;

  y=secHdr('⚙️','Full Technical Specifications','Complete add-in configuration and stack details',y);
  const specL=[['Office.js Manifest','v1.1'],['Add-in Type','Task Pane'],['Pane Width','400px'],
    ['Permission Level','ReadWriteDocument'],['Default Locale','ar-SA (Arabic)'],['Ribbon Tab','Custom SniperSheet']];
  const specR=[['Frontend Stack','React 18 + Vite + TypeScript'],['Backend Stack','Express.js + Node.js 24'],
    ['AI Library','Groq SDK (Official)'],['Package Manager','pnpm Monorepo Workspace'],
    ['Hosting','Replit Autoscale Deploy'],['Styling','Tailwind CSS + shadcn/ui']];
  const sw2=(CW-12)/2;
  [[specL,ML],[specR,ML+sw2+12]].forEach(([specs,sx]) => {
    rr(sx,y,sw2,specs.length*24+16,8,C.grey50,C.grey200);
    specs.forEach(([k,v],i) => {
      const sy2=y+10+i*24;
      doc.font(F).fontSize(8.5).fillColor(C.grey600).text(k, sx+12, sy2, {lineBreak:false});
      doc.font(F).fontSize(10).fillColor(C.grey900).text(v, sx+12, sy2+12, {lineBreak:false});
      if (i<specs.length-1) ln(sx+10,sy2+22,sx+sw2-10,sy2+22,C.grey200,0.3);
    });
  });
  footer(6);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page 7 — Formula Examples
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('Formula Examples & Confidence System');
  let y=78;
  y=secHdr('📊','Real Formula Examples','Generated by Smart Hub AI from natural language input',y);

  const tC=[220,80,CW-300];
  doc.rect(ML,y,CW,28).fill(C.green);
  doc.font(F).fontSize(10).fillColor(C.white);
  doc.text('Natural Language Input', ML+6, y+9, {width:tC[0]-10, lineBreak:false});
  doc.text('Category', ML+tC[0]+6, y+9, {width:tC[1]-10, lineBreak:false});
  doc.text('Formula Generated', ML+tC[0]+tC[1]+6, y+9, {lineBreak:false});

  const rows=[
    ['Calculate overtime for hours over 40 at 1.5x rate',      'Conditional','=IF(A1>40,(A1-40)*1.5,0)','#D1FAE5','#065F46'],
    ['Grade student: A+ above 90, B above 75, else C',          'Conditional','=IFS(B1>=90,"A+",B1>=75,"B","C")','#D1FAE5','#065F46'],
    ['Find value in column A, return matching from column B',    'Lookup',    '=XLOOKUP(D1,A:A,B:B,"Not found")','#DBEAFE','#1E40AF'],
    ['Sum all sales amounts greater than 1000',                  'Statistical','=SUMIF(C:C,">1000",D:D)','#EDE9FE','#5B21B6'],
    ['Monthly payment for 30-year loan at 5% annual interest',  'Financial', '=PMT(0.05/12,360,A1)','#FEF3C7','#92400E'],
    ['Calculate person age in years from birth date in A1',      'Date',      '=DATEDIF(A1,TODAY(),"Y")','#FCE7F3','#9D174D'],
    ['Rank employee by highest sales figure descending',         'Statistical','=RANK(A1,A:A,0)','#EDE9FE','#5B21B6'],
    ['Add 15% bonus if sales exceed 10,000',                     'Conditional','=IF(A1>10000,A1*1.15,A1)','#D1FAE5','#065F46'],
    ['Count students who scored 60 or higher',                   'Statistical','=COUNTIF(B:B,">=60")','#EDE9FE','#5B21B6'],
  ];
  rows.forEach((r,i) => {
    const ry=y+28+i*24;
    doc.rect(ML,ry,CW,24).fill(i%2===0?C.white:C.grey50);
    doc.font(F).fontSize(9).fillColor(C.grey700)
      .text(r[0], ML+6, ry+7, {width:tC[0]-10, lineBreak:false});
    rr(ML+tC[0]+6,ry+6,tC[1]-8,13,6,r[3]);
    doc.font(F).fontSize(8.5).fillColor(r[4])
      .text(r[1], ML+tC[0]+6, ry+9, {align:'center', width:tC[1]-8, lineBreak:false});
    doc.font(M).fontSize(8.5).fillColor(C.greenDk)
      .text(r[2], ML+tC[0]+tC[1]+6, ry+8, {width:tC[2]-6, lineBreak:false});
    ln(ML,ry+24,W-MR,ry+24,C.grey200,0.2);
  });
  y+=28+rows.length*24+16;

  rr(ML,y,CW,36,7,C.blueLt,'#93C5FD');
  doc.font(F).fontSize(18).text('💡', ML+12, y+7);
  doc.font(F).fontSize(10).fillColor(C.blue)
    .text('Confidence: Green > 85% = high accuracy · Orange 50–85% = acceptable, review prompt · Red < 50% = revise with more specific details. Clearer prompts consistently yield higher confidence scores.',
      ML+40, y+9, {width:CW-48, lineGap:2.5});
  y+=50;

  y=secHdr('✍️','Example Prompts That Work Well','Best practices for writing effective formula requests',y);
  const tips=[
    ['✅ Specific & clear','Calculate overtime pay: hours worked minus 40, multiplied by 1.5 times hourly rate in column B'],
    ['✅ Include conditions','If sales in column C exceed 10,000, apply 15% bonus, otherwise return the original value'],
    ['✅ Name your columns','Look up the employee ID in column A and return their department name from column D'],
    ['❌ Too vague','Calculate something with numbers — rephrase with specific context and column references'],
  ];
  const tw=(CW-8)/2;
  tips.forEach((t,i) => {
    const tx=ML+(i%2)*(tw+8), ty=y+Math.floor(i/2)*56;
    const ok=t[0].startsWith('✅');
    rr(tx,ty,tw,50,7,ok?C.greenLt:C.amberLt,ok?'#86EFAC':'#FDE68A');
    doc.font(F).fontSize(10).fillColor(ok?C.green:C.amber).text(t[0], tx+10, ty+8, {lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey700).text(t[1], tx+10, ty+26, {width:tw-18, lineBreak:false});
  });
  footer(7);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page 8 — Installation Guide
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('Installation Guide — Step by Step');
  let y=78;
  y=secHdr('📥','Installation Guide','4 simple steps to load SniperSheet in Microsoft Excel',y);

  const steps=[
    ['Download manifest.xml','Navigate to the manifest URL provided by your administrator. The manifest.xml file downloads automatically to your device.'],
    ['Open Excel Add-ins','In Microsoft Excel: click Insert → Add-ins → My Add-ins → Manage My Add-ins (bottom of the dropdown).'],
    ['Upload manifest.xml','Click "Upload My Add-in", select the downloaded manifest.xml file. The SniperSheet ribbon tab appears automatically.'],
    ['Open Smart Hub','Click the SniperSheet tab in the Excel Ribbon → click "Open Sniper Hub". The task pane opens on the right side!'],
  ];
  steps.forEach((s,i) => {
    const sy=y+i*56;
    doc.circle(ML+14,sy+22,13).fill(C.green);
    doc.font(F).fontSize(12).fillColor(C.white).text(String(i+1), ML+9, sy+16);
    rr(ML+36,sy,CW-36,48,6,C.grey50,C.grey200);
    doc.font(F).fontSize(11).fillColor(C.grey900).text(s[0], ML+52, sy+8, {lineBreak:false});
    doc.font(F).fontSize(9.5).fillColor(C.grey600).text(s[1], ML+52, sy+26, {width:CW-62, lineBreak:false});
  });
  y+=steps.length*56+18;

  y=secHdr('💻','Technology Stack','Complete stack used to build SniperSheet',y);
  const stackL=[['Frontend','React 18 + Vite + TypeScript'],['Backend','Express.js + Node.js 24'],
    ['AI SDK','Groq SDK — Llama 3.3 70B'],['Styling','Tailwind CSS + shadcn/ui']];
  const stackR=[['Package Mgr','pnpm Monorepo Workspace'],['Office.js','Manifest v1.1 Task Pane'],
    ['Permission','ReadWriteDocument'],['Hosting','Replit Autoscale Deployment']];
  const stW=(CW-12)/2;
  [[stackL,ML],[stackR,ML+stW+12]].forEach(([items,sx]) => {
    rr(sx,y,stW,items.length*30+16,8,C.grey50,C.grey200);
    items.forEach(([k,v],i) => {
      const iy=y+10+i*30;
      doc.roundedRect(sx+10,iy+3,8,18,2).fill(C.green);
      doc.font(F).fontSize(8.5).fillColor(C.grey600).text(k, sx+26, iy+5, {lineBreak:false});
      doc.font(F).fontSize(10.5).fillColor(C.grey900).text(v, sx+26, iy+17, {lineBreak:false});
    });
  });
  y+=stackL.length*30+28;

  rr(ML,y,CW,52,8,'#F0FDF4','#86EFAC');
  doc.font(F).fontSize(11).fillColor(C.green).text('📋 System Requirements', ML+14, y+8, {lineBreak:false});
  const reqs=['Microsoft Excel 2016 or later (Windows or Mac)','Internet connection for AI features (offline mode available)','Modern browser (Chrome / Edge / Firefox) — add-in runs in browser context'];
  reqs.forEach((r,i) => {
    doc.circle(ML+14, y+26+i*12, 2.5).fill(C.green);
    doc.font(F).fontSize(9.5).fillColor(C.grey700).text(r, ML+24, y+22+i*12, {lineBreak:false});
  });
  y+=68;

  rr(ML,y,CW,36,8,C.greenDk);
  doc.font(F).fontSize(9.5).fillColor(C.gold)
    .text('© 2026 Mustafa Alsahlany — All Rights Reserved', ML+14, y+8, {lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor('rgba(255,255,255,0.65)')
    .text('SniperSheet v1.0  ·  Official English Guide  ·  Built on Replit  ·  Powered by Groq AI (Free Tier)',
      ML+14, y+22, {lineBreak:false});
  footer(8);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page 9 — Developer Profile & FAQ
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
{
  hdr('Developer Profile & FAQ');
  let y=78;
  y=secHdr('👤','Developer Profile','Creator of SniperSheet — Mustafa Alsahlany',y);

  rr(ML,y,CW,90,12,C.greenDk);
  doc.font(F).fontSize(20).fillColor(C.white).text('Mustafa Alsahlany', ML+20, y+12, {lineBreak:false});
  doc.font(F).fontSize(11).fillColor(C.white).fillOpacity(0.85)
    .text('Developer & Designer — SniperSheet Excel Add-in', ML+20, y+38, {lineBreak:false});
  doc.font(F).fontSize(10).fillColor(C.white).fillOpacity(0.7)
    .text('Built with React, Express.js, TypeScript, and Groq AI on Replit', ML+20, y+56, {lineBreak:false});
  doc.font(F).fontSize(9).fillColor(C.gold).fillOpacity(0.9)
    .text('Iraq — 2026', ML+20, y+72, {lineBreak:false});
  doc.fillOpacity(1);
  ['🌐 Replit — Active','🤖 Groq AI — Free','📦 v1.0.0','📅 April 2026'].forEach((d,i) => {
    doc.font(F).fontSize(9.5).fillColor(C.white).fillOpacity(0.85)
      .text(d, W-MR-200, y+12+i*17, {lineBreak:false}); doc.fillOpacity(1);
  });
  y+=104;

  y=secHdr('❓','Frequently Asked Questions','Common questions about SniperSheet',y);
  const faqs=[
    ['Is SniperSheet truly 100% free?','Yes. SniperSheet uses Groq\'s free tier (Llama 3.3 70B, 30 requests/min). The API key is stored on the developer\'s server. You never need to create a Groq account or pay anything.'],
    ['Do users in Iraq need a VPN?','No. All AI requests route through a US-based Replit server. Users connect to Replit\'s HTTPS endpoint, not directly to Groq. No VPN, proxy, or workaround is needed.'],
    ['What happens if the AI is unavailable?','SniperSheet has a 3-model cascade: if the primary model fails, it tries two fallbacks automatically. If all cloud models fail, the local formula engine activates with 35+ instant patterns.'],
    ['Does it work without internet?','Yes — the local formula engine handles SUM, IF, VLOOKUP, and 35+ other patterns offline with zero latency. AI features require an internet connection.'],
    ['What Excel versions are supported?','Excel 2016 and later (Windows and Mac). The add-in uses Office.js Manifest v1.1 with ReadWriteDocument permission level.'],
    ['Can I use Arabic to generate formulas?','Absolutely. Arabic input is fully supported. Type your description in Arabic and SniperSheet generates the exact Excel formula with an Arabic explanation.'],
  ];
  const fw=(CW-12)/2;
  faqs.forEach((f,i) => {
    const fx=ML+(i%2)*(fw+12), fy=y+Math.floor(i/2)*72;
    rr(fx,fy,fw,66,7,C.grey50,C.grey200);
    rr(fx,fy,fw,22,7,C.greenLt,C.grey200);
    doc.rect(fx,fy+14,fw,8).fill(C.greenLt);
    doc.font(F).fontSize(9).fillColor(C.green).text(f[0], fx+10, fy+6, {width:fw-18, lineBreak:false});
    doc.font(F).fontSize(8.5).fillColor(C.grey700).text(f[1], fx+10, fy+26, {width:fw-18, lineGap:1.5});
  });
  footer(9);
}

doc.end();
console.log('✅ English PDF done:', OUTPUT);
