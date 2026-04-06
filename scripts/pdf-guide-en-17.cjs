'use strict';
// SniperSheet_Official_Guide_EN.pdf  ·  17 pages  ·  English only
const PDFDocument = require('/tmp/pdfgen/node_modules/pdfkit');
const fs = require('fs');

const OUTPUT     = '/home/runner/workspace/SniperSheet_Official_Guide_EN.pdf';
const FONT_CAIRO = '/tmp/pdfgen/fonts/Cairo.ttf';
const TOTAL      = 17;

const C = {
  green:'#107C41',  greenDk:'#0B5C30',  greenLt:'#E8F5EE',
  white:'#FFFFFF',  grey50:'#F8FAFB',   grey100:'#EEF2F5',
  grey200:'#DDE3EA',grey400:'#9CA3AF',  grey600:'#4B5563',
  grey700:'#374151',grey900:'#111827',
  gold:'#B7791F',   amber:'#92400E',    amberLt:'#FEF3C7',
  blue:'#1D4ED8',   blueLt:'#DBEAFE',   blueDk:'#1E3A8A',
  purple:'#5B21B6', purpleLt:'#EDE9FE', purpleDk:'#4C1D95',
  red:'#991B1B',    redLt:'#FEE2E2',
  teal:'#0F766E',   tealLt:'#CCFBF1',
  orange:'#C2410C', orangeLt:'#FFEDD5',
};

const doc = new PDFDocument({
  size:'A4', margins:{top:0,bottom:0,left:0,right:0}, bufferPages:true,
  info:{
    Title:'SniperSheet — Official English Guide (17 Pages)',
    Author:'Mustafa Alsahlany',
    Subject:'Complete Excel Add-in Reference & Technical Specifications',
    Creator:'SniperSheet PDF Engine v1.0',
    Keywords:'Excel Add-in, AI, Groq, Replit, Formula Engine, Mustafa Alsahlany',
  },
});
doc.pipe(fs.createWriteStream(OUTPUT));
if (fs.existsSync(FONT_CAIRO)) doc.registerFont('Cairo', FONT_CAIRO);
const F = 'Cairo';
const M = 'Courier';
const W = 595.28, H = 841.89;
const ML = 46, MR = 46, CW = W - ML - MR;

// ── Primitives ────────────────────────────────────────────────────────────────
const rr = (x,y,w,h,r,fill,stroke) => {
  doc.roundedRect(x,y,w,h,r);
  if (fill && stroke) doc.fillAndStroke(fill,stroke);
  else if (fill)      doc.fillColor(fill).fill();
  else if (stroke)    doc.strokeColor(stroke).stroke();
};
const ln = (x1,y1,x2,y2,c=C.grey200,lw=0.5) =>
  doc.moveTo(x1,y1).lineTo(x2,y2).strokeColor(c).lineWidth(lw).stroke();

// ── Standard page footer ───────────────────────────────────────────────────────
const footer = (n, dark=false) => {
  const fy = H - 30, tc = dark ? 'rgba(255,255,255,0.7)' : C.grey400;
  ln(ML,fy,W-MR,fy,dark?'rgba(255,255,255,0.2)':C.grey200,0.5);
  doc.font(F).fontSize(7.5).fillColor(tc);
  doc.text('Developed by: Mustafa Alsahlany', ML, fy+9, {lineBreak:false});
  const mid = 'SniperSheet · Official English Guide · 2026';
  doc.text(mid, (W-doc.widthOfString(mid))/2, fy+9, {lineBreak:false});
  const pg = `Page ${n} of ${TOTAL}`;
  doc.text(pg, W-MR-doc.widthOfString(pg), fy+9, {lineBreak:false});
};

// ── Page header ────────────────────────────────────────────────────────────────
const hdr = (section) => {
  doc.rect(0,0,W,7).fill(C.green);
  rr(ML,16,36,36,7,C.greenLt);
  doc.font(F).fontSize(20).text('🎯',ML+6,22);
  doc.font(F).fontSize(14).fillColor(C.green).text('SniperSheet',ML+46,19,{lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey400).text(section,ML+46,36,{lineBreak:false});
  ln(ML,62,W-MR,62,C.green,1.5);
};

// ── Section header ─────────────────────────────────────────────────────────────
const sec = (icon,title,sub,y) => {
  rr(ML,y,36,36,8,C.green);
  doc.font(F).fontSize(18).text(icon,ML+7,y+7);
  doc.font(F).fontSize(14).fillColor(C.grey900).text(title,ML+46,y+3,{lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey600).text(sub,ML+46,y+21,{lineBreak:false});
  return y+50;
};

// ── Bullet ──────────────────────────────────────────────────────────────────────
const bull = (txt,x,y,w=CW,col=C.grey700,dotCol=C.green) => {
  doc.circle(x+5,y+6,2.5).fill(dotCol);
  doc.font(F).fontSize(9.5).fillColor(col).text(txt,x+14,y,{width:w-14,lineGap:1});
  return y + doc.currentLineHeight() + 5;
};

// ── Highlighted spec row ───────────────────────────────────────────────────────
const specRow = (k,v,x,y,w,bg='#F8FAFB') => {
  doc.rect(x,y,w,22).fill(bg);
  doc.font(F).fontSize(8.5).fillColor(C.grey600).text(k,x+10,y+4,{lineBreak:false});
  doc.font(F).fontSize(10).fillColor(C.grey900).text(v,x+10,y+13,{lineBreak:false});
};


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — COVER
// ══════════════════════════════════════════════════════════════════════════════
doc.rect(0,0,W,H).fill(C.greenDk);
for(let i=0;i<20;i++) doc.rect(0,H*(i/20),W,H/20).fillOpacity(0.03*i).fill('#1db954');
doc.fillOpacity(1);
doc.circle(W-60,140,200).fillOpacity(0.05).fill(C.white);
doc.circle(60,H-100,160).fillOpacity(0.05).fill(C.white);
doc.fillOpacity(1);

const bW=300, bX=(W-bW)/2;
doc.roundedRect(bX,44,bW,28,14).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
doc.font(F).fontSize(9.5).fillColor(C.white)
  .text('⚡  EXCEL ADD-IN  ·  17-PAGE OFFICIAL ENGLISH GUIDE', bX,54,{align:'center',width:bW,lineBreak:false});

const lsz=82, lx=(W-lsz)/2;
doc.roundedRect(lx,88,lsz,lsz,16).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
doc.font(F).fontSize(36).text('🎯',lx,106,{align:'center',width:lsz});

doc.font(F).fontSize(52).fillColor(C.white).text('SniperSheet',0,186,{align:'center',width:W});
doc.font(F).fontSize(18).fillColor(C.white).fillOpacity(0.88)
  .text('AI-Powered Excel Formula Engine',0,250,{align:'center',width:W});
doc.font(F).fontSize(12).fillColor(C.white).fillOpacity(0.65)
  .text('Natural Language → Precise Excel Formulas in Seconds',0,276,{align:'center',width:W});
doc.fillOpacity(1);
ln(W/2-30,310,W/2+30,310,C.white,2);

const stats=[['35+','Formula Patterns'],['4','Smart Tabs'],['100%','Free AI'],['3','AI Models'],['2','Languages']];
const sw = CW/stats.length;
stats.forEach(([n,l],i)=>{
  const sx=ML+i*sw;
  doc.font(F).fontSize(26).fillColor(C.white).text(n,sx,328,{align:'center',width:sw});
  doc.font(F).fontSize(8.5).fillColor(C.white).fillOpacity(0.65).text(l,sx,362,{align:'center',width:sw});
  doc.fillOpacity(1);
});

const pills=['Smart Hub','Commands','Cell Dimensions','Advanced Tools','Local Fallback','100% Free','Bilingual'];
let px=ML;
pills.forEach(p=>{
  const pw=doc.font(F).fontSize(9).widthOfString(p)+22;
  doc.roundedRect(px,404,pw,23,11).fillOpacity(0.18).fill(C.white); doc.fillOpacity(1);
  doc.font(F).fontSize(9).fillColor(C.white).text(p,px+11,411,{lineBreak:false});
  px+=pw+7;
});

// Groq + Replit branding on cover
const brandY=450;
rr(ML,brandY,(CW-12)/2,52,8,'rgba(255,255,255,0.1)');
rr(ML+(CW-12)/2+12,brandY,(CW-12)/2,52,8,'rgba(255,255,255,0.1)');
doc.font(F).fontSize(16).text('🤖',ML+14,brandY+8);
doc.font(F).fontSize(11).fillColor(C.white).text('Powered by Groq AI',ML+42,brandY+10,{lineBreak:false});
doc.font(F).fontSize(9).fillColor(C.white).fillOpacity(0.7).text('Llama 3.3 70B · 30 RPM Free · No billing ever',ML+42,brandY+27,{lineBreak:false});
doc.fillOpacity(1);
const rx=ML+(CW-12)/2+12;
doc.font(F).fontSize(16).text('🖥️',rx+14,brandY+8);
doc.font(F).fontSize(11).fillColor(C.white).text('Hosted on Replit',rx+42,brandY+10,{lineBreak:false});
doc.font(F).fontSize(9).fillColor(C.white).fillOpacity(0.7).text('Autoscale · US Server · HTTPS · No VPN needed',rx+42,brandY+27,{lineBreak:false});
doc.fillOpacity(1);

ln(ML,H-62,W-MR,H-62,C.white,0.2);
doc.font(F).fontSize(12).fillColor(C.white).fillOpacity(0.85)
  .text('👤 Developed by: Mustafa Alsahlany',ML,H-50,{lineBreak:false});
doc.font(F).fontSize(9).fillColor(C.gold).fillOpacity(0.9)
  .text('SniperSheet v1.0 · Excel Add-in · 2026 · All Rights Reserved',ML,H-35,{lineBreak:false});
doc.fillOpacity(1);
footer(1,true);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — TABLE OF CONTENTS
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Table of Contents');
let y=78;

rr(ML,y,CW,46,9,C.green);
doc.font(F).fontSize(22).text('📋',ML+14,y+9);
doc.font(F).fontSize(18).fillColor(C.white).text('Table of Contents',ML+50,y+10,{lineBreak:false});
doc.font(F).fontSize(10).fillColor(C.white).fillOpacity(0.8).text('Complete 17-page guide — click any section to navigate',ML+50,y+31,{lineBreak:false});
doc.fillOpacity(1);
y+=60;

const toc=[
  ['01','Cover & Product Identity',       'Identity, stats, key features at a glance'],
  ['02','Table of Contents',              'This page — full guide navigation map'],
  ['03','Product Overview',               'What SniperSheet is and who it\'s for'],
  ['04','UI & Task Pane Design',          'Interface layout, scroll zones, RTL support'],
  ['05','Smart Hub (Tab 1)',              'AI formula engine — full feature breakdown'],
  ['06','Commands (Tab 2)',               'Arabic & English aliases reference table'],
  ['07','Cell Dimensions (Tab 3)',        'Arabic-aware cell sizing calculator'],
  ['08','Advanced Tools (Tab 4)',         'Radar, Print-Fit, Professional Report'],
  ['09','AI Proxy Architecture',          'Browser → Replit → Groq AI flow & security'],
  ['10','Groq AI — Deep Dive',            'Models, cascade, rate limits, free tier'],
  ['11','Replit Infrastructure',          'Autoscale hosting, Node.js 24, deployment'],
  ['12','Formula Examples Gallery',       '12 real examples across all categories'],
  ['13','Prompt Writing Best Practices',  'How to get the best formula results'],
  ['14','Confidence Score System',        'How scores are calculated and what they mean'],
  ['15','Installation Guide',             '4-step setup: download → Excel → done'],
  ['16','Frequently Asked Questions',     '8 common questions answered'],
  ['17','Developer Profile & Rights',     'Mustafa Alsahlany, tech stack, copyright'],
];

const half=(CW-12)/2;
toc.forEach((t,i)=>{
  const col=i<9?0:1;
  const row=col===0?i:i-9;
  const tx=ML+col*(half+12), ty=y+row*38;
  rr(tx,ty,half,33,6,i===1?C.greenLt:C.grey50,i===1?C.green:C.grey200);
  rr(tx+8,ty+6,26,20,5,i===1?C.green:C.grey200);
  doc.font(F).fontSize(9.5).fillColor(i===1?C.white:C.grey600)
    .text(t[0],tx+8,ty+10,{align:'center',width:26,lineBreak:false});
  doc.font(F).fontSize(10).fillColor(C.grey900).text(t[1],tx+42,ty+5,{width:half-50,lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey600).text(t[2],tx+42,ty+19,{width:half-50,lineBreak:false});
});
footer(2);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — PRODUCT OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Product Overview');
y=78;
y=sec('📋','What is SniperSheet?','AI-powered Excel add-in for natural language formula generation',y);

rr(ML,y,CW,76,9,C.greenLt);
ln(ML,y,ML,y+76,C.green,3.5);
doc.font(F).fontSize(10.5).fillColor(C.grey700)
  .text('SniperSheet is a professional Microsoft Excel task pane add-in that transforms natural language into precise, ready-to-use Excel formulas. Powered by Groq AI (Llama 3.3 70B — completely free), it supports both English and Arabic input, routes all AI calls through a Replit US server (no VPN anywhere in the world), and falls back automatically to a built-in local formula engine when offline.',
    ML+14,y+10,{width:CW-22,lineGap:3});
y+=90;

const c3w=(CW-20)/3;
const overview=[
  ['🤖','Groq AI Engine',      'Llama 3.3 70B\n100% free — forever\nNo credit card needed'],
  ['🌐','Bilingual Support',   'English & Arabic input\nFull RTL layout\nAll tabs bilingual'],
  ['🔒','Proxy Architecture',  'US Replit server\nNo VPN needed\nHTTPS everywhere'],
  ['⚡','Local Fallback',      '35+ instant patterns\nZero latency\nWorks offline'],
  ['📐','Office.js Add-in',   'ReadWriteDocument\nManifest v1.1\nExcel Ribbon tab'],
  ['📱','400px Task Pane',    'Smooth scroll UX\nNative Excel\nMobile compatible'],
];
for(let i=0;i<2;i++) for(let j=0;j<3;j++){
  const c=overview[i*3+j], cx=ML+j*(c3w+10), cy=y+i*88;
  rr(cx,cy,c3w,80,9,C.grey50,C.grey200);
  doc.font(F).fontSize(20).text(c[0],cx+10,cy+10);
  doc.font(F).fontSize(11).fillColor(C.grey900).text(c[1],cx+10,cy+36,{lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey600).text(c[2],cx+10,cy+52,{width:c3w-18});
}
y+=2*88+14;

rr(ML,y,CW,40,8,C.green);
doc.font(F).fontSize(18).text('💡',ML+14,y+9);
doc.font(F).fontSize(10.5).fillColor(C.white)
  .text('Describe your calculation in plain English or Arabic → SniperSheet generates the exact formula with explanation, confidence score, and optional formatting hints — instantly.',
    ML+44,y+10,{width:CW-56,lineGap:2.5});
y+=54;

y=sec('🏆','Who is SniperSheet For?','Target professionals and their primary use cases',y);
const users=[
  ['🔧','Engineers',         'Complex mechanical, electrical & civil engineering formulas'],
  ['💼','Financial Analysts','KPI tracking, budget analysis, and financial modeling'],
  ['📊','Project Managers',  'Progress tracking, scheduling, and resource planning'],
  ['🎓','Students & Academics','Statistical analysis, research data, and grade calculations'],
  ['🏭','Operations Teams', 'Inventory management, capacity planning, logistics'],
  ['📈','Sales & Marketing', 'Commission calculations, pipeline analysis, ROI tracking'],
];
const uw=(CW-10)/3;
for(let i=0;i<2;i++) for(let j=0;j<3;j++){
  const u=users[i*3+j], ux=ML+j*(uw+5), uy=y+i*60;
  rr(ux,uy,uw,54,7,C.greenLt,C.green);
  doc.font(F).fontSize(18).text(u[0],ux+10,uy+6);
  doc.font(F).fontSize(10).fillColor(C.grey900).text(u[1],ux+46,uy+8,{lineBreak:false,width:uw-56});
  doc.font(F).fontSize(8.5).fillColor(C.grey600).text(u[2],ux+46,uy+24,{lineBreak:false,width:uw-56});
}
footer(3);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 4 — UI & TASK PANE DESIGN
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('UI & Task Pane Design');
y=78;
y=sec('🖥️','Task Pane Interface','400px width · 4-tab navigation · bilingual RTL/LTR support',y);

rr(ML,y,CW,68,9,C.greenLt);
ln(ML,y,ML,y+68,C.green,3.5);
doc.font(F).fontSize(10.5).fillColor(C.grey700)
  .text('SniperSheet operates as a 400px-wide task pane attached to the right side of Microsoft Excel. The interface is built in React 18 + Vite and styled with Tailwind CSS. It supports both Left-to-Right (English) and Right-to-Left (Arabic) layouts dynamically, with smooth scrolling within each section, native Office.js integration, and a clean green-themed professional design system.',
    ML+14,y+10,{width:CW-22,lineGap:3});
y+=82;

// 4 tab cards
const tabs=[
  {num:'01',icon:'✨',title:'Smart Hub',       color:C.green,    bg:C.greenLt,
   items:['AI formula generation via Groq','Confidence score (0–100%)','Formula type auto-detection','Word Radar for typo detection','Style hints & formatting','History log with timestamps','Example prompts library']},
  {num:'02',icon:'⌨️',title:'Commands',        color:C.blue,     bg:C.blueLt,
   items:['Arabic alias commands','SUM, AVERAGE, MAX, MIN...','BONUS (15%), TAX (15%)','Real-time calculation','Searchable reference table','Execution history']},
  {num:'03',icon:'📐',title:'Cell Dimensions', color:C.purple,   bg:C.purpleLt,
   items:['Arabic-aware width calc','Font size & bold awareness','Single & batch modes','Pixel and Excel units','Recommended padding','One-click copy results']},
  {num:'04',icon:'🔧',title:'Advanced Tools',  color:C.amber,    bg:C.amberLt,
   items:['Empty Field Radar scan','Smart Print-Fit calculator','Professional Report view','CSV / tab-data input','Color-coded grid output','Browser print dialog']},
];
const tw=(CW-15)/4;
tabs.forEach((t,i)=>{
  const tx=ML+i*(tw+5);
  rr(tx,y,tw,200,9,C.white,C.grey200);
  rr(tx,y,tw,42,9,t.bg,C.grey200);
  doc.rect(tx,y+30,tw,12).fill(t.bg);
  rr(tx+tw-34,y+7,28,28,6,t.color);
  doc.font(F).fontSize(14).fillColor(C.white).text(t.num,tx+tw-34,y+13,{align:'center',width:28,lineBreak:false});
  doc.font(F).fontSize(16).text(t.icon,tx+8,y+10);
  doc.font(F).fontSize(10).fillColor(C.grey900).text(t.title,tx+8,y+32,{width:tw-14,lineBreak:false});
  ln(tx,y+42,tx+tw,y+42,C.grey200,0.5);
  let iy=y+50;
  t.items.forEach(b=>{
    doc.circle(tx+12,iy+5,2).fill(t.color);
    doc.font(F).fontSize(8.5).fillColor(C.grey700).text(b,tx+20,iy,{width:tw-26,lineBreak:false});
    iy+=14;
  });
});
y+=214;

y=sec('🎨','Design System','Color palette, typography, and visual language',y);
const dsCols=[
  {name:'Primary Green','hex':'#107C41',    role:'Main brand color — buttons, headers, accents'},
  {name:'Dark Green',   hex:'#0B5C30',     role:'Dark backgrounds — covers, section bars'},
  {name:'Light Green',  hex:'#E8F5EE',     role:'Card backgrounds, highlight zones, badges'},
  {name:'Neutral 900',  hex:'#111827',     role:'Primary text — headings, labels'},
  {name:'Neutral 600',  hex:'#4B5563',     role:'Secondary text — descriptions, captions'},
  {name:'Neutral 200',  hex:'#DDE3EA',     role:'Borders, dividers, card outlines'},
];
const dW=(CW-5*10)/6;
dsCols.forEach((d,i)=>{
  const dx=ML+i*(dW+10);
  doc.rect(dx,y,dW,22).fill(d.hex);
  rr(dx,y+22,dW,30,0,C.grey50,C.grey200);
  doc.font(F).fontSize(7.5).fillColor(C.grey900).text(d.name,dx+4,y+26,{width:dW-8,lineBreak:false});
  doc.font(M).fontSize(7).fillColor(C.grey600).text(d.hex,dx+4,y+37,{lineBreak:false});
});
footer(4);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 5 — SMART HUB (TAB 1)
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Tab 1 — Smart Hub');
y=78;
y=sec('✨','Smart Hub — AI Formula Engine','Tab 1 · Natural language description → Excel formula via Groq AI',y);

rr(ML,y,CW,70,9,C.greenLt);
ln(ML,y,ML,y+70,C.green,3.5);
doc.font(F).fontSize(10.5).fillColor(C.grey700)
  .text('The core feature of SniperSheet. Type any calculation description in English or Arabic — such as "calculate overtime for hours over 40 at 1.5x rate" — then click "Smart Analysis". The AI engine routes your request through Groq AI (Llama 3.3 70B) and returns the exact formula, a full step-by-step explanation, a confidence score (0–100%), and optional style hints.',
    ML+14,y+10,{width:CW-22,lineGap:3});
y+=84;

y=sec('📋','Complete Smart Hub Feature List','Every capability of the AI formula engine',y);
const half5=(CW-12)/2;
const shL=['AI formula generation (Groq Llama 3.3 70B)',
  'Confidence scoring: 0–100% per result',
  'Formula type auto-detection (IF, XLOOKUP, SUM…)',
  'Word Radar: detects typos & ambiguous terms',
  'Style hints: cell color, bold, italic formatting',
  'Full history log with timestamps & replay',
  'Example prompts library (English & Arabic)',
  'Keyboard shortcut: Ctrl+Enter for quick analysis'];
const shR=['Local formula engine — fully offline fallback',
  '3-model AI cascade with auto-retry on failure',
  'Status badge: success / warning / error',
  'Detailed step-by-step formula explanation',
  'One-click copy formula to clipboard',
  'One-click apply formula to active Excel cell',
  'Supports deeply nested complex formulas',
  'Smart error messages with suggested fixes'];
let lY=y, rY=y;
shL.forEach(b=>{ lY=bull(b,ML,lY,half5); });
shR.forEach(b=>{ rY=bull(b,ML+half5+12,rY,half5); });
y=Math.max(lY,rY)+16;

y=sec('🔄','Smart Hub Workflow','Step-by-step: how a formula is generated',y);
const workflow=[
  ['1','Type','Write your formula description in plain English or Arabic in the text area'],
  ['2','Analyze','Click "Smart Analysis" or press Ctrl+Enter to trigger AI processing'],
  ['3','Route','Request goes via HTTPS to Replit server, which calls Groq AI securely'],
  ['4','Return','Formula + explanation + confidence score displayed in seconds'],
  ['5','Apply','Click "Copy" or "Apply to Cell" to use the formula directly in Excel'],
];
const ww=(CW-5*8)/5;
workflow.forEach((s,i)=>{
  const wx=ML+i*(ww+8);
  rr(wx,y,ww,88,8,C.grey50,C.grey200);
  doc.circle(wx+ww/2,y+18,13).fill(C.green);
  doc.font(F).fontSize(12).fillColor(C.white).text(s[0],wx+ww/2-5,y+12);
  doc.font(F).fontSize(10).fillColor(C.grey900).text(s[1],wx+8,y+38,{width:ww-14,lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey600).text(s[2],wx+8,y+54,{width:ww-14,lineGap:1});
});
y+=102;

rr(ML,y,CW,38,7,C.amberLt,'#FDE68A');
doc.font(F).fontSize(18).text('💡',ML+12,y+8);
doc.font(F).fontSize(10).fillColor(C.amber)
  .text('Pro Tip: The more specific your description, the higher the confidence score. Include column references (e.g., "column A"), conditions (e.g., "greater than 1000"), and the expected output type. Try the built-in example prompts as a starting point.',
    ML+40,y+9,{width:CW-50,lineGap:2.5});
footer(5);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 6 — COMMANDS (TAB 2)
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Tab 2 — Commands');
y=78;
y=sec('⌨️','Commands — Formula Aliases','Tab 2 · Arabic & English shorthand for instant formula execution',y);

rr(ML,y,CW,60,9,C.blueLt);
ln(ML,y,ML,y+60,C.blue,3.5);
doc.font(F).fontSize(10.5).fillColor(C.grey700)
  .text('Type the command name in English or Arabic along with a cell range to get an instant result. The Commands tab provides a searchable reference table of all available function aliases, real-time calculation display, and a full execution history. Arabic aliases make formula entry natural for Arabic-speaking users.',
    ML+14,y+10,{width:CW-22,lineGap:3});
y+=74;

// Command reference table
const cW1=176, cW2=164, cW3=CW-cW1-cW2;
doc.rect(ML,y,CW,28).fill(C.blue);
doc.font(F).fontSize(10).fillColor(C.white);
doc.text('Command (EN / AR)',ML+8,y+9,{width:cW1-10,lineBreak:false});
doc.text('Description',ML+cW1+8,y+9,{width:cW2-10,lineBreak:false});
doc.text('Formula / Output',ML+cW1+cW2+8,y+9,{lineBreak:false});

const cmds=[
  ['SUM / جمع',        'Sum of all values in range',          '=SUM(B1:B10)'],
  ['MULTIPLY / ضرب',  'Product (multiply) of values',         '=PRODUCT(A1:A5)'],
  ['AVERAGE / متوسط', 'Arithmetic mean of range',             '=AVERAGE(D1:D20)'],
  ['MAX / أكبر',       'Maximum value in range',               '=MAX(C1:C50)'],
  ['MIN / أصغر',       'Minimum value in range',               '=MIN(C1:C50)'],
  ['COUNT / عدد',      'Count of numeric cells',               '=COUNT(E1:E100)'],
  ['BONUS / مكافأة',  'Adds 15% bonus to amount',             '=A1*1.15'],
  ['TAX / ضريبة',     'Calculates 15% tax on amount',         '=A1*0.15'],
  ['PERCENTAGE / نسبة','Percentage of value vs total',         '=(A1/B1)*100'],
  ['IF / إذا',         'Simple conditional logic check',       '=IF(A1>1000,"High","Low")'],
  ['COUNTIF / عدد شرط','Count cells matching condition',       '=COUNTIF(B:B,">=60")'],
  ['SUMIF / جمع شرط', 'Sum values matching condition',        '=SUMIF(C:C,">1000",D:D)'],
];
cmds.forEach((r,i)=>{
  const ry=y+28+i*22;
  doc.rect(ML,ry,CW,22).fill(i%2===0?C.white:C.grey50);
  rr(ML+4,ry+4,cW1-8,14,5,C.blueLt);
  doc.font(F).fontSize(8.5).fillColor(C.blue).text(r[0],ML+4,ry+7,{align:'center',width:cW1-8,lineBreak:false});
  doc.font(F).fontSize(9).fillColor(C.grey700).text(r[1],ML+cW1+8,ry+6,{width:cW2-14,lineBreak:false});
  doc.font(M).fontSize(8.5).fillColor(C.greenDk).text(r[2],ML+cW1+cW2+8,ry+7,{lineBreak:false});
  ln(ML,ry+22,W-MR,ry+22,C.grey200,0.2);
});
y+=28+cmds.length*22+14;

const half6=(CW-12)/2;
rr(ML,y,half6,62,8,'#EFF6FF',C.blueLt);
doc.font(F).fontSize(11).fillColor(C.blue).text('✅ Supported Features',ML+12,y+10,{lineBreak:false});
['Searchable command reference table','Real-time result calculation','Command execution history with timestamps','Combine commands (e.g. BONUS + SUM)'].forEach((b,i)=>{
  doc.circle(ML+16,y+28+i*12,2.5).fill(C.blue);
  doc.font(F).fontSize(9.5).fillColor(C.grey700).text(b,ML+26,y+24+i*12,{lineBreak:false});
});
rr(ML+half6+12,y,half6,62,8,C.amberLt,'#FDE68A');
doc.font(F).fontSize(11).fillColor(C.amber).text('💡 Usage Examples',ML+half6+24,y+10,{lineBreak:false});
['Type: "SUM B1:B10" → =SUM(B1:B10)','Type: "BONUS A1" → =A1*1.15','Type: "جمع B1:B20" → =SUM(B1:B20)','Type: "PERCENTAGE A1 B1" → =(A1/B1)*100'].forEach((b,i)=>{
  doc.font(M).fontSize(8.5).fillColor(C.grey700).text(b,ML+half6+24,y+28+i*12,{width:half6-20,lineBreak:false});
});
footer(6);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 7 — CELL DIMENSIONS (TAB 3)
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Tab 3 — Cell Dimensions');
y=78;
y=sec('📐','Cell Dimensions Calculator','Tab 3 · Optimal cell sizing for Arabic and English text',y);

rr(ML,y,CW,66,9,C.purpleLt);
ln(ML,y,ML,y+66,C.purple,3.5);
doc.font(F).fontSize(10.5).fillColor(C.grey700)
  .text('Calculates the optimal width and height for Excel cells based on content, accounting for Arabic character width differences, RTL text direction, font size, bold and italic styling, and padding margins. Eliminates the guesswork of manually resizing cells for bilingual spreadsheets. Supports single-cell and batch processing modes.',
    ML+14,y+10,{width:CW-22,lineGap:3});
y+=80;

y=sec('⚙️','How the Calculator Works','Input parameters → dimension algorithm → Excel units output',y);
const params=[
  {icon:'✏️',title:'Text Content',     desc:'Enter the text that will go inside the cell. Supports Arabic, English, or mixed content. The algorithm detects Arabic characters and applies the correct width multiplier.'},
  {icon:'🔤',title:'Font Size (pt)',    desc:'Specify the font size in points. The calculator adjusts both width (character px ÷ 7.5) and height (line-height × rows) based on the font size you provide.'},
  {icon:'🖊️',title:'Bold & Italic',    desc:'Toggle bold or italic to apply the corresponding width multiplier (bold: ×1.15, italic: ×1.05). Combinations are calculated cumulatively.'},
  {icon:'📏',title:'Padding Margin',   desc:'Specify padding in pixels on each side. Added to the final calculated width and height. Default: 8px horizontal, 4px vertical per cell.'},
];
const pw=(CW-15)/4;
params.forEach((p,i)=>{
  const px2=ML+i*(pw+5);
  rr(px2,y,pw,100,8,C.grey50,C.grey200);
  rr(px2,y,pw,36,8,C.purpleLt,C.grey200);
  doc.rect(px2,y+24,pw,12).fill(C.purpleLt);
  doc.font(F).fontSize(18).text(p.icon,px2+8,y+6);
  doc.font(F).fontSize(10).fillColor(C.grey900).text(p.title,px2+8,y+28,{width:pw-16,lineBreak:false});
  ln(px2,y+36,px2+pw,y+36,C.grey200,0.3);
  doc.font(F).fontSize(8.5).fillColor(C.grey700).text(p.desc,px2+8,y+44,{width:pw-16,lineGap:1.5});
});
y+=114;

y=sec('📊','Output Formats & Features','What the calculator returns and available actions',y);
const half7=(CW-12)/2;
const outL=['Width result in pixels (px)','Width result in Excel column units','Height result in pixels (px)','Height result in Excel row units','Recommended minimum padding values','Character count & text metrics'];
const outR=['Single cell calculation mode','Batch processing: multiple cells at once','One-click copy results to clipboard','Apply dimensions directly to active Excel cell','Save and recall favorite settings','Arabic / English / mixed content aware'];
let oY=y, oY2=y;
outL.forEach(b=>{ oY=bull(b,ML,oY,half7,C.grey700,C.purple); });
outR.forEach(b=>{ oY2=bull(b,ML+half7+12,oY2,half7,C.grey700,C.purple); });
y=Math.max(oY,oY2)+16;

rr(ML,y,CW,50,8,C.purpleLt,'#C4B5FD');
doc.font(F).fontSize(18).text('📐',ML+12,y+12);
doc.font(F).fontSize(10).fillColor(C.purpleDk)
  .text('Arabic Width Insight: Arabic characters are on average 40% wider than Latin characters at the same font size. The Cell Dimensions calculator applies a 1.4× Arabic character width multiplier automatically, ensuring Arabic text never overflows its cell.',
    ML+42,y+10,{width:CW-52,lineGap:2.5});
footer(7);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 8 — ADVANCED TOOLS (TAB 4)
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Tab 4 — Advanced Tools');
y=78;
y=sec('🔧','Advanced Tools — 3 Professional Utilities','Tab 4 · Empty Radar, Print-Fit, and Professional Report',y);

const tools=[
  {icon:'🔍',title:'Empty Field Radar',
   color:C.amber, bg:C.amberLt, border:'#FDE68A', dk:C.amber,
   headline:'Scan any dataset for missing values with a color-coded visual grid',
   desc:'Paste CSV or tab-separated data into the input area, click "Scan", and instantly get a color-coded grid showing filled (green) and empty (red) cells, plus a precise list of every empty cell coordinate. Perfect for data validation before analysis.',
   buls:['Paste CSV or tab-separated data input','Visual grid: green=filled, red=empty','Exact empty cell coordinate list (e.g. Row3:Col2)','Auto header row detection','Filled vs. empty count summary','Works with datasets up to 500 rows']},
  {icon:'🖨️',title:'Smart Print-Fit',
   color:C.blue, bg:C.blueLt, border:'#93C5FD', dk:C.blueDk,
   headline:'Calculate exact column widths and font sizes for A4/A3 paper',
   desc:'Input your column count, row count, and target paper size (A4 or A3) in portrait or landscape orientation. Smart Print-Fit calculates the exact Excel column width and font size needed so your data fits perfectly on one page — no trial and error.',
   buls:['A4 and A3 paper size support','Portrait and landscape orientation modes','Precise Excel column width unit output','Recommended font size for row count','Margin and padding adjustment controls','Print-ready results in under 3 clicks']},
  {icon:'📄',title:'Professional Report View',
   color:C.green, bg:C.greenLt, border:'#86EFAC', dk:C.greenDk,
   headline:'Transform raw pasted data into a styled printable HTML report',
   desc:'Paste any raw data (CSV or tab-separated) and Professional Report View renders it as a styled HTML table with alternating row colors, bold column headers, and a professional layout — then triggers the browser\'s print dialog for immediate printing.',
   buls:['Auto-styled HTML table from raw data','Alternating row color scheme (white/grey)','Bold column headers with accent color','Auto header row detection and formatting','One-click browser print dialog trigger','Saves paper with optimal table layout']},
];
tools.forEach((t,i)=>{
  const ty2=y+i*168;
  rr(ML,ty2,CW,160,9,C.white,t.border);
  rr(ML,ty2,CW,42,9,t.bg,t.border);
  doc.rect(ML,ty2+30,CW,12).fill(t.bg);
  doc.font(F).fontSize(24).text(t.icon,ML+12,ty2+8);
  doc.font(F).fontSize(14).fillColor(C.grey900).text(t.title,ML+50,ty2+10,{lineBreak:false});
  rr(ML+50+doc.widthOfString(t.title)+10,ty2+12,80,16,8,t.color);
  doc.font(F).fontSize(8.5).fillColor(C.white).text('Tab 4 Feature',ML+50+doc.widthOfString(t.title)+10,ty2+16,{align:'center',width:80,lineBreak:false});
  doc.font(F).fontSize(9).fillColor(t.dk).text(t.headline,ML+12,ty2+32,{width:CW-22,lineBreak:false});
  ln(ML,ty2+42,W-MR,ty2+42,t.border,0.5);
  const bw8=(CW-12)/2;
  doc.font(F).fontSize(9.5).fillColor(C.grey700).text(t.desc,ML+12,ty2+50,{width:bw8-8,lineGap:1.5});
  let by8=ty2+50;
  t.buls.forEach(b=>{ by8=bull(b,ML+bw8+16,by8,bw8-10,C.grey700,t.color); });
});
footer(8);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 9 — AI PROXY ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('AI Proxy Architecture');
y=78;
y=sec('🏗️','AI Proxy Architecture','How SniperSheet securely connects users to Groq AI via Replit',y);

rr(ML,y,CW,64,9,C.greenLt);
ln(ML,y,ML,y+64,C.green,3.5);
doc.font(F).fontSize(10.5).fillColor(C.grey700)
  .text('SniperSheet uses a server-side proxy architecture to securely relay AI requests. The GROQ_API_KEY is stored as a secret environment variable on the Replit server — it is never exposed to the browser or the user. This means users anywhere in the world, including Iraq, connect only to the Replit HTTPS endpoint and never directly to the Groq API. No VPN, proxy software, or workaround is required.',
    ML+14,y+10,{width:CW-22,lineGap:3});
y+=78;

// Architecture diagram
const nodes=[
  {icon:'💻',title:'User Browser',   lines:['Excel Add-in','React 18 + Vite','HTTP POST /api/smart'],green:false},
  {icon:'🖥️',title:'Replit Server', lines:['Express.js Proxy','Node.js 24 · US','API key hidden'],     green:true},
  {icon:'🤖',title:'Groq AI Cloud', lines:['Llama 3.3 70B','30 RPM Free','JSON response'],             green:false},
];
const nw=130, nh=88, ngap=(CW-nw*3)/2;
nodes.forEach((n,i)=>{
  const nx=ML+i*(nw+ngap), ny=y;
  rr(nx,ny,nw,nh,10,n.green?C.green:C.grey50,n.green?C.green:C.grey200);
  doc.font(F).fontSize(24).text(n.icon,nx,ny+8,{align:'center',width:nw});
  doc.font(F).fontSize(11).fillColor(n.green?C.white:C.grey900).text(n.title,nx,ny+38,{align:'center',width:nw});
  n.lines.forEach((l,li)=>{
    doc.font(F).fontSize(8.5).fillColor(n.green?'rgba(255,255,255,0.8)':C.grey600)
      .text(l,nx+6,ny+54+li*11,{width:nw-12,lineBreak:false});
  });
  if(i<2){
    const ax=nx+nw+6, ay=ny+nh/2;
    ln(ax,ay,ax+ngap-14,ay,C.green,1.8);
    doc.polygon([ax+ngap-14,ay-6],[ax+ngap-14,ay+6],[ax+ngap-4,ay]).fill(C.green);
    doc.font(F).fontSize(8).fillColor(C.grey600)
      .text(i===0?'HTTPS Request':'Groq SDK',ax,ay-18,{width:ngap-10,align:'center',lineBreak:false});
    doc.font(F).fontSize(8).fillColor(C.grey400)
      .text(i===0?'port 443 / TLS':'Official SDK',ax,ay-8,{width:ngap-10,align:'center',lineBreak:false});
  }
});
y+=nh+16;

// Security callout
rr(ML,y,CW,46,8,'#EFF6FF',C.blueLt);
doc.font(F).fontSize(22).text('🔒',ML+12,y+10);
doc.font(F).fontSize(11).fillColor(C.blueDk).text('Security Model',ML+46,y+9,{lineBreak:false});
doc.font(F).fontSize(10).fillColor(C.blue)
  .text('The GROQ_API_KEY is a Replit server secret — stored in the environment, never in client code. The browser only sends the formula description text. Users never see or interact with the Groq API directly. HTTPS TLS encryption protects all traffic.',
    ML+46,y+24,{width:CW-56,lineGap:2});
y+=60;

y=sec('🔐','No-VPN Design Rationale','Why users in Iraq and restricted regions can access SniperSheet',y);
const noVpnCols=[
  {icon:'❌',title:'Traditional Approach\n(VPN Required)',
   items:['User in Iraq needs VPN software','VPN exposes user\'s traffic to VPN provider','VPN cost or performance overhead','VPN blocked by some networks','Complex setup — barriers to adoption'],
   bg:C.redLt, border:'#FECACA', col:C.red},
  {icon:'✅',title:'SniperSheet Approach\n(No VPN Needed)',
   items:['User connects to Replit.dev domain','Replit server calls Groq on their behalf','Replit is accessible globally via HTTPS','No Groq API exposure to client','Simple — just install the add-in and use'],
   bg:C.greenLt, border:'#86EFAC', col:C.green},
];
const nvW=(CW-12)/2;
noVpnCols.forEach((n,i)=>{
  const nx=ML+i*(nvW+12);
  rr(nx,y,nvW,130,9,n.bg,n.border);
  doc.font(F).fontSize(18).text(n.icon,nx+12,y+12);
  doc.font(F).fontSize(10).fillColor(C.grey900).text(n.title,nx+12,y+36,{width:nvW-20});
  n.items.forEach((b,ii)=>{
    doc.circle(nx+16,y+82+ii*14,2.5).fill(n.col);
    doc.font(F).fontSize(9).fillColor(C.grey700).text(b,nx+26,y+78+ii*14,{width:nvW-34,lineBreak:false});
  });
});
footer(9);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 10 — GROQ AI DEEP DIVE
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Groq AI — Deep Dive');
y=78;

// Groq hero banner
rr(ML,y,CW,56,10,'#111827');
doc.font(F).fontSize(28).text('🤖',ML+14,y+10);
doc.font(F).fontSize(20).fillColor(C.white).text('Groq AI',ML+56,y+10,{lineBreak:false});
doc.font(F).fontSize(10).fillColor('rgba(255,255,255,0.7)').text('The AI engine powering SniperSheet — 100% free, no credit card required',ML+56,y+32,{lineBreak:false});
rr(W-MR-110,y+12,104,30,8,C.green);
doc.font(F).fontSize(9.5).fillColor(C.white).text('FREE FOREVER',W-MR-110,y+20,{align:'center',width:104,lineBreak:false});
doc.font(F).fontSize(8).fillColor(C.white).fillOpacity(0.8).text('No billing · No API key for users',W-MR-110,y+32,{align:'center',width:104,lineBreak:false});
doc.fillOpacity(1);
y+=70;

y=sec('📊','3-Model Cascade System','How SniperSheet automatically tries models in order',y);
const models=[
  {rank:'🥇',tier:'PRIMARY',  name:'llama-3.3-70b-versatile',ctx:'32768',params:'70B',rpm:'30',
   notes:'Highest quality · Latest Llama 3.3 release · Best for complex nested formulas · Low latency via Groq\'s LPU hardware',
   bg:'#F0FDF4',bdr:'#86EFAC',fg:C.green,lbl:'Best Quality'},
  {rank:'🥈',tier:'FALLBACK', name:'llama3-70b-8192',ctx:'8192',params:'70B',rpm:'30',
   notes:'Proven stable · Identical parameter count · Smaller context window (8K tokens) · Activates if primary is rate-limited',
   bg:C.blueLt,bdr:'#93C5FD',fg:C.blue,lbl:'Stable'},
  {rank:'🥉',tier:'EMERGENCY',name:'llama3-8b-8192',ctx:'8192',params:'8B',rpm:'30',
   notes:'Ultra-fast inference · Lightweight 8B parameter model · For simple formulas · Activates if first two models fail',
   bg:C.amberLt,bdr:'#FCD34D',fg:C.amber,lbl:'Ultra-Fast'},
  {rank:'🔧',tier:'OFFLINE',  name:'Local Formula Engine',ctx:'—',params:'—',rpm:'∞',
   notes:'Zero latency · No network needed · 35+ built-in patterns · Always available · Activates when all cloud models fail',
   bg:C.purpleLt,bdr:'#C4B5FD',fg:C.purple,lbl:'Always On'},
];
const mw=(CW-15)/4;
models.forEach((m,i)=>{
  const mx=ML+i*(mw+5);
  rr(mx,y,mw,112,8,m.bg,m.bdr);
  rr(mx,y,mw,28,8,m.bg,m.bdr);
  doc.font(F).fontSize(18).text(m.rank,mx+6,y+4);
  rr(mx+mw-60,y+6,54,16,8,m.fg);
  doc.font(F).fontSize(8).fillColor(C.white).text(m.tier,mx+mw-60,y+10,{align:'center',width:54,lineBreak:false});
  ln(mx,y+28,mx+mw,y+28,m.bdr,0.5);
  doc.font(F).fontSize(9.5).fillColor(C.grey900).text(m.name,mx+8,y+34,{width:mw-16});
  const statY=y+66;
  [['Params',m.params],['Ctx',m.ctx+' tok'],['RPM',m.rpm]].forEach(([k,v],si)=>{
    doc.font(F).fontSize(7.5).fillColor(C.grey600).text(k,mx+8+si*38,statY,{lineBreak:false});
    doc.font(F).fontSize(9).fillColor(m.fg).text(v,mx+8+si*38,statY+10,{lineBreak:false});
  });
  doc.font(F).fontSize(8).fillColor(C.grey700).text(m.notes,mx+8,statY+26,{width:mw-16,lineGap:1.5});
});
y+=126;

y=sec('⚡','Groq LPU Technology','Why Groq AI is extremely fast',y);
rr(ML,y,CW,80,9,'#0F172A');
doc.font(F).fontSize(10.5).fillColor(C.white)
  .text('Groq runs on its own Language Processing Unit (LPU) hardware — purpose-built silicon for AI inference. Unlike GPU-based systems, LPUs deliver consistent, ultra-low latency without batching delays. SniperSheet users typically receive their formula result within 1–3 seconds, even for complex nested formulas with multiple conditions.',
    ML+14,y+10,{width:CW-22,lineGap:3,fillColor:C.white});
const lputats=[['~1-3s','Formula Response'],['30 RPM','Free Rate Limit'],['0$','Cost to Users'],['100%','Availability']];
const lw2=CW/4;
lputats.forEach(([n,l],i)=>{
  doc.font(F).fontSize(22).fillColor(C.green).text(n,ML+i*lw2,y+46,{align:'center',width:lw2});
  doc.font(F).fontSize(8).fillColor(C.white).fillOpacity(0.6).text(l,ML+i*lw2,y+70,{align:'center',width:lw2,lineBreak:false});
  doc.fillOpacity(1);
});
y+=96;

rr(ML,y,CW,40,7,C.greenLt,'#86EFAC');
doc.font(F).fontSize(18).text('✅',ML+12,y+9);
doc.font(F).fontSize(10.5).fillColor(C.greenDk)
  .text('Free Tier Summary: Groq provides 30 requests/minute at no cost for all three Llama models listed above. SniperSheet is designed to stay within this limit. The cascade system ensures 99%+ formula generation success even during peak usage.',
    ML+42,y+10,{width:CW-52,lineGap:2.5});
footer(10);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 11 — REPLIT INFRASTRUCTURE
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Replit Infrastructure');
y=78;

// Replit hero
rr(ML,y,CW,56,10,'#1C1C2E');
doc.font(F).fontSize(28).text('🖥️',ML+14,y+10);
doc.font(F).fontSize(20).fillColor(C.white).text('Replit',ML+56,y+10,{lineBreak:false});
doc.font(F).fontSize(10).fillColor('rgba(255,255,255,0.7)').text('The cloud platform hosting the SniperSheet API server — Autoscale deployment on US infrastructure',ML+56,y+32,{lineBreak:false});
rr(W-MR-110,y+12,104,30,8,'#5C6BC0');
doc.font(F).fontSize(9.5).fillColor(C.white).text('AUTOSCALE',W-MR-110,y+20,{align:'center',width:104,lineBreak:false});
doc.font(F).fontSize(8).fillColor(C.white).fillOpacity(0.8).text('Always-on · US region',W-MR-110,y+32,{align:'center',width:104,lineBreak:false});
doc.fillOpacity(1);
y+=70;

y=sec('⚙️','Server Stack & Configuration','Complete technical profile of the SniperSheet backend',y);
const specs=[
  ['Runtime',      'Node.js 24 (LTS)',           'Latest LTS with full ESM support and improved performance'],
  ['Framework',    'Express.js 5',               'Modern async/await middleware, improved error handling'],
  ['AI SDK',       'Groq SDK (Official)',         'Official groq-sdk npm package — TypeScript native'],
  ['Language',     'TypeScript (strict)',         'Full type safety across all route handlers and middleware'],
  ['Build Tool',   'esbuild',                    'Fast CJS bundle output for production deployment'],
  ['Pkg Manager',  'pnpm Workspace',             'Monorepo-compatible, fast installs, disk-efficient'],
  ['Platform',     'Replit Autoscale',           'Auto-scales to zero when idle, spins up on demand'],
  ['Region',       'United States (US)',          'Low latency to Groq AI cloud · accessible globally'],
  ['Protocol',     'HTTPS / TLS 1.3',            'All traffic encrypted · picard.replit.dev domain'],
  ['CORS Policy',  'Origin-restricted (HTTPS)',  'Add-in domain whitelisted · browser security enforced'],
];
const scW1=100, scW2=180, scW3=CW-scW1-scW2;
doc.rect(ML,y,CW,26).fill(C.green);
doc.font(F).fontSize(10).fillColor(C.white);
doc.text('Property',ML+8,y+8,{width:scW1-10,lineBreak:false});
doc.text('Value',ML+scW1+8,y+8,{width:scW2-10,lineBreak:false});
doc.text('Notes',ML+scW1+scW2+8,y+8,{lineBreak:false});
specs.forEach((s,i)=>{
  const ry=y+26+i*22;
  doc.rect(ML,ry,CW,22).fill(i%2===0?C.white:C.grey50);
  doc.font(F).fontSize(9).fillColor(C.grey600).text(s[0],ML+8,ry+6,{width:scW1-10,lineBreak:false});
  rr(ML+scW1+6,ry+5,scW2-10,13,4,C.greenLt);
  doc.font(F).fontSize(9).fillColor(C.greenDk).text(s[1],ML+scW1+6,ry+9,{align:'center',width:scW2-10,lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey700).text(s[2],ML+scW1+scW2+8,ry+7,{width:scW3-10,lineBreak:false});
  ln(ML,ry+22,W-MR,ry+22,C.grey200,0.2);
});
y+=26+specs.length*22+14;

y=sec('🔗','API Endpoints','Routes served by the SniperSheet Express server',y);
const endpoints=[
  ['POST','/api/smart/analyze',    'Main AI formula generation endpoint — accepts {prompt, lang}'],
  ['GET', '/api/addin/manifest.xml','Downloads Office.js manifest for Excel add-in sideloading'],
  ['GET', '/api/addin/icon-*.png', 'Serves PNG icons: 16, 32, 64, 80px sizes for the ribbon'],
  ['GET', '/excel-addin/',         'Serves the React task pane SPA (Vite production build)'],
];
endpoints.forEach((e,i)=>{
  const ey=y+i*26;
  doc.rect(ML,ey,CW,24).fill(i%2===0?C.white:C.grey50);
  const mC=e[0]==='POST'?C.blue:C.green;
  rr(ML+4,ey+5,36,14,4,mC);
  doc.font(F).fontSize(8.5).fillColor(C.white).text(e[0],ML+4,ey+9,{align:'center',width:36,lineBreak:false});
  doc.font(M).fontSize(9).fillColor(C.grey900).text(e[1],ML+48,ey+7,{lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey600).text(e[2],ML+220,ey+7,{width:CW-180,lineBreak:false});
  ln(ML,ey+24,W-MR,ey+24,C.grey200,0.2);
});
footer(11);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 12 — FORMULA EXAMPLES GALLERY
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Formula Examples Gallery');
y=78;
y=sec('📊','Real Formula Examples','12 formulas generated by Smart Hub AI from natural language',y);

const tC=[CW-200,110,90];
doc.rect(ML,y,CW,28).fill(C.green);
doc.font(F).fontSize(10).fillColor(C.white);
doc.text('Natural Language Input',ML+6,y+9,{width:tC[0]-8,lineBreak:false});
doc.text('Formula Generated',ML+tC[0]+6,y+9,{width:tC[1]-8,lineBreak:false});
doc.text('Category',ML+tC[0]+tC[1]+6,y+9,{lineBreak:false});

const rows=[
  ['Calculate overtime: hours over 40, rate 1.5× hourly wage',         '=IF(A1>40,(A1-40)*1.5,0)',         'Conditional','#D1FAE5','#065F46'],
  ['Grade student: A+ above 90, B above 75, C otherwise',             '=IFS(B1>=90,"A+",B1>=75,"B","C")',  'Conditional','#D1FAE5','#065F46'],
  ['Add 15% bonus if employee sales exceed 10,000',                    '=IF(A1>10000,A1*1.15,A1)',          'Conditional','#D1FAE5','#065F46'],
  ['Find value in column A, return matching from column B',            '=XLOOKUP(D1,A:A,B:B,"Not found")', 'Lookup',    '#DBEAFE','#1E40AF'],
  ['Look up product price from price list table',                      '=VLOOKUP(A2,Table1,3,0)',           'Lookup',    '#DBEAFE','#1E40AF'],
  ['Sum all sales greater than 1000 in column D',                      '=SUMIF(C:C,">1000",D:D)',           'Statistical','#EDE9FE','#5B21B6'],
  ['Count students who scored 60 or higher',                           '=COUNTIF(B:B,">=60")',              'Statistical','#EDE9FE','#5B21B6'],
  ['Rank each employee by highest sales (descending)',                  '=RANK(A1,A:A,0)',                  'Statistical','#EDE9FE','#5B21B6'],
  ['Monthly payment for 30-year loan at 5% annual interest',           '=PMT(0.05/12,360,A1)',             'Financial', '#FEF3C7','#92400E'],
  ['Calculate compound interest over 10 years at 7%',                 '=A1*(1+0.07)^10',                  'Financial', '#FEF3C7','#92400E'],
  ['Calculate person\'s age in years from birth date in A1',           '=DATEDIF(A1,TODAY(),"Y")',         'Date',      '#FCE7F3','#9D174D'],
  ['Count working days between two dates (exclude weekends)',          '=NETWORKDAYS(A1,B1)',              'Date',      '#FCE7F3','#9D174D'],
];
rows.forEach((r,i)=>{
  const ry=y+28+i*22;
  doc.rect(ML,ry,CW,22).fill(i%2===0?C.white:C.grey50);
  doc.font(F).fontSize(9).fillColor(C.grey700).text(r[0],ML+6,ry+6,{width:tC[0]-10,lineBreak:false});
  doc.font(M).fontSize(8.5).fillColor(C.greenDk).text(r[1],ML+tC[0]+6,ry+7,{width:tC[1]-10,lineBreak:false});
  rr(ML+tC[0]+tC[1]+6,ry+5,tC[2]-8,13,5,r[3]);
  doc.font(F).fontSize(8).fillColor(r[4]).text(r[2],ML+tC[0]+tC[1]+6,ry+9,{align:'center',width:tC[2]-8,lineBreak:false});
  ln(ML,ry+22,W-MR,ry+22,C.grey200,0.2);
});
y+=28+rows.length*22+14;

// Category legend
const cats=[['Conditional','#D1FAE5','#065F46'],['Lookup','#DBEAFE','#1E40AF'],['Statistical','#EDE9FE','#5B21B6'],['Financial','#FEF3C7','#92400E'],['Date','#FCE7F3','#9D174D']];
rr(ML,y,CW,32,6,C.grey50,C.grey200);
doc.font(F).fontSize(9).fillColor(C.grey600).text('Category Key:',ML+12,y+10,{lineBreak:false});
let catX=ML+90;
cats.forEach(([n,bg,fg])=>{
  rr(catX,y+9,70,16,4,bg);
  doc.font(F).fontSize(8.5).fillColor(fg).text(n,catX,y+13,{align:'center',width:70,lineBreak:false});
  catX+=78;
});
y+=46;

rr(ML,y,CW,36,7,C.blueLt,'#93C5FD');
doc.font(F).fontSize(18).text('💡',ML+12,y+7);
doc.font(F).fontSize(10).fillColor(C.blueDk)
  .text('Confidence: Green badge (>85%) = high accuracy · Orange (50–85%) = acceptable, try to be more specific · Red (<50%) = revise your prompt with more details and column references. Clearer prompts always yield better results.',
    ML+40,y+9,{width:CW-50,lineGap:2.5});
footer(12);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 13 — PROMPT WRITING BEST PRACTICES
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Prompt Writing Best Practices');
y=78;
y=sec('✍️','Writing Effective Formula Prompts','How to describe your calculation for the best AI results',y);

rr(ML,y,CW,54,9,C.greenLt);
ln(ML,y,ML,y+54,C.green,3.5);
doc.font(F).fontSize(10.5).fillColor(C.grey700)
  .text('The quality of your formula prompt directly determines the accuracy and confidence of the AI result. Effective prompts are specific, include column or cell references, define conditions clearly, and state the expected output. This page shows you exactly how to write prompts that consistently produce 90%+ confidence scores.',
    ML+14,y+10,{width:CW-22,lineGap:3});
y+=68;

// Good vs Bad examples
y=sec('✅','Prompts That Work Well','Examples of effective formula descriptions',y);
const good=[
  {prompt:'Calculate overtime pay: if hours worked in A1 exceed 40, multiply the excess by 1.5 times the hourly rate in B1',
   why:'Specifies the cells (A1, B1), the condition (> 40), and the calculation method (1.5× rate)',
   score:'96%', formula:'=IF(A1>40,(A1-40)*B1*1.5,0)'},
  {prompt:'Look up the employee ID in column A and return their monthly salary from column C in the same row',
   why:'Clearly names both columns, defines the lookup key, and specifies the return column',
   score:'94%', formula:'=XLOOKUP(F2,A:A,C:C,"Not found")'},
  {prompt:'Sum all values in column D where the corresponding value in column C is greater than 1000',
   why:'Names both columns, defines the condition column and value column separately',
   score:'97%', formula:'=SUMIF(C:C,">1000",D:D)'},
  {prompt:'Grade a student: if the score in B2 is 90 or above give A+, if 75 or above give B, otherwise give C',
   why:'States all grade boundaries explicitly and in the correct order for IFS function',
   score:'99%', formula:'=IFS(B2>=90,"A+",B2>=75,"B",TRUE,"C")'},
];
good.forEach((g,i)=>{
  const gy=y+i*58;
  rr(ML,gy,CW,52,7,C.greenLt,'#86EFAC');
  rr(ML,gy,CW,22,7,C.greenLt,'#86EFAC');
  doc.font(F).fontSize(10).fillColor(C.greenDk).text('✅ '+g.prompt,ML+10,gy+5,{width:CW-100,lineBreak:false});
  rr(W-MR-70,gy+5,64,14,5,C.green);
  doc.font(F).fontSize(8.5).fillColor(C.white).text('Score: '+g.score,W-MR-70,gy+9,{align:'center',width:64,lineBreak:false});
  ln(ML,gy+22,W-MR,gy+22,'#86EFAC',0.4);
  doc.font(F).fontSize(8.5).fillColor(C.grey700).text('Why it works: '+g.why,ML+10,gy+28,{width:CW/2-16,lineBreak:false});
  doc.font(M).fontSize(8.5).fillColor(C.greenDk).text('→ '+g.formula,ML+CW/2,gy+28,{width:CW/2-10,lineBreak:false});
});
y+=good.length*58+16;

y=sec('❌','Prompts to Avoid','Vague descriptions that produce low-confidence results',y);
const bad=[
  {prompt:'Calculate something with numbers in column A',
   fix:'Be specific — name the operation (SUM, IF, AVERAGE) and what numbers represent'},
  {prompt:'Make a formula for employee data',
   fix:'Describe the exact calculation — e.g., "sum salaries if department equals Sales"'},
  {prompt:'Do a lookup thing',
   fix:'Specify: what to look up, where to find it, and what to return — then name the columns'},
  {prompt:'Calculate tax',
   fix:'State the rate: "calculate 15% tax on the amount in cell A1" gives much better results'},
];
const bW2=(CW-12)/2;
bad.forEach((b,i)=>{
  const bX2=ML+(i%2)*(bW2+12), bY2=y+Math.floor(i/2)*56;
  rr(bX2,bY2,bW2,50,7,C.redLt,'#FECACA');
  doc.font(F).fontSize(9).fillColor(C.red).text('❌ Vague: "'+b.prompt+'"',bX2+10,bY2+8,{width:bW2-18,lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey700).text('Fix: '+b.fix,bX2+10,bY2+28,{width:bW2-18,lineBreak:false});
});
footer(13);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 14 — CONFIDENCE SCORE SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Confidence Score System');
y=78;
y=sec('📈','Confidence Score System','How SniperSheet measures and displays formula accuracy',y);

rr(ML,y,CW,60,9,C.greenLt);
ln(ML,y,ML,y+60,C.green,3.5);
doc.font(F).fontSize(10.5).fillColor(C.grey700)
  .text('Every formula generated by the Smart Hub AI engine is accompanied by a confidence score from 0 to 100%. This score is calculated by the AI model based on how clearly your prompt described the required calculation, how well the generated formula matches the description, and the complexity of the formula pattern used. The score is displayed as a colored badge next to the formula result.',
    ML+14,y+10,{width:CW-22,lineGap:3});
y+=74;

// Score tiers
const tiers=[
  {range:'85–100%',label:'High Confidence',color:C.green,bg:'#F0FDF4',border:'#86EFAC',
   meaning:'The formula is highly likely to be correct. The prompt was clear and specific. Use this formula as-is with confidence.',
   signals:['Prompt named specific columns or cells','Condition values were stated explicitly','Formula type was clearly implied by the description','No ambiguous terms detected by Word Radar'],
   example:'Score 97%: "sum sales in D where C > 1000" → =SUMIF(C:C,">1000",D:D)'},
  {range:'50–84%',label:'Acceptable',color:C.amber,bg:'#FFFBEB',border:'#FCD34D',
   meaning:'The formula is likely correct but review it before using. The prompt had some ambiguity or missing details.',
   signals:['Prompt was partially specific','Condition or column was implied, not stated','Formula type was inferred from context','Minor Word Radar warnings flagged'],
   example:'Score 71%: "calculate bonus for sales" → =A1*1.15 (assumed 15% bonus)'},
  {range:'0–49%',label:'Low Confidence',color:C.red,bg:'#FFF5F5',border:'#FECACA',
   meaning:'The formula may be incorrect. Revise your prompt with more specific details, column names, and condition values.',
   signals:['Prompt was too vague or general','No specific columns, values, or conditions mentioned','Multiple possible interpretations existed','Word Radar detected unclear or ambiguous terms'],
   example:'Score 34%: "do something with data" → best guess formula generated'},
];
tiers.forEach((t,i)=>{
  const ty2=y+i*124;
  rr(ML,ty2,CW,118,9,t.bg,t.border);
  rr(ML,ty2,80,118,0,t.bg,t.border);
  doc.rect(ML+80,ty2,1,118).fill(t.border);
  rr(ML+16,ty2+20,50,28,8,t.color);
  doc.font(F).fontSize(11).fillColor(C.white).text(t.range,ML+16,ty2+28,{align:'center',width:50,lineBreak:false});
  doc.font(F).fontSize(9).fillColor(t.color).text(t.label,ML+8,ty2+60,{align:'center',width:66,lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey900).text(t.meaning,ML+92,ty2+8,{width:CW-100,lineGap:2});
  let sy=ty2+52;
  t.signals.forEach(s=>{ sy=bull(s,ML+92,sy,CW-104,C.grey700,t.color); });
  doc.font(M).fontSize(8.5).fillColor(C.grey600).text(t.example,ML+92,ty2+100,{width:CW-100,lineBreak:false});
});
y+=3*124+14;

rr(ML,y,CW,38,7,'#EFF6FF',C.blueLt);
doc.font(F).fontSize(18).text('💡',ML+12,y+9);
doc.font(F).fontSize(10).fillColor(C.blueDk)
  .text('Word Radar is a built-in prompt analysis tool that runs before the AI call. It detects potentially ambiguous terms, possible typos, and unclear references — then shows a yellow warning with suggestions to improve your prompt before submitting.',
    ML+40,y+10,{width:CW-50,lineGap:2.5});
footer(14);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 15 — INSTALLATION GUIDE
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Installation Guide');
y=78;
y=sec('📥','Installation Guide','4 steps to load SniperSheet in Microsoft Excel',y);

const steps=[
  {n:'1',title:'Download manifest.xml',
   desc:'Open your browser and navigate to the manifest URL:\nhttps://[your-replit-domain]/api/addin/manifest.xml\nThe file downloads automatically to your device.'},
  {n:'2',title:'Open Excel Add-ins Manager',
   desc:'In Microsoft Excel: click the Insert tab in the Ribbon → click Add-ins → click My Add-ins → click "Manage My Add-ins" at the bottom of the dropdown.'},
  {n:'3',title:'Upload manifest.xml',
   desc:'In the Add-ins Manager: click "Upload My Add-in" → select the manifest.xml file you downloaded. The SniperSheet tab will appear automatically in the Excel Ribbon.'},
  {n:'4',title:'Open Smart Hub',
   desc:'Click the SniperSheet tab in the Excel Ribbon → click "Open Sniper Hub". The task pane opens on the right side of Excel. You\'re ready to generate formulas with AI!'},
];
steps.forEach((s,i)=>{
  const sy=y+i*62;
  doc.circle(ML+14,sy+24,14).fill(C.green);
  doc.font(F).fontSize(14).fillColor(C.white).text(s.n,ML+10,sy+18);
  rr(ML+40,sy,CW-40,56,7,C.grey50,C.grey200);
  doc.font(F).fontSize(12).fillColor(C.grey900).text(s.title,ML+56,sy+8,{lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(C.grey600).text(s.desc,ML+56,sy+26,{width:CW-70,lineGap:1.5});
});
y+=steps.length*62+18;

y=sec('💻','System Requirements','Minimum requirements to run SniperSheet',y);
const reqs=[
  ['Operating System','Windows 10/11 or macOS 12+',    'Required for Office.js task pane add-ins'],
  ['Microsoft Excel', 'Excel 2016 or later',             'Office 365 recommended for full features'],
  ['Internet',        'Required for AI features',        'Offline local engine works without internet'],
  ['Browser Engine',  'Edge WebView2 or Chrome',         'Embedded browser handles the task pane UI'],
  ['Screen',          '1280×720 or higher',              'Task pane requires minimum 400px sidebar space'],
];
const rW1=120, rW2=160, rW3=CW-rW1-rW2;
doc.rect(ML,y,CW,26).fill(C.green);
doc.font(F).fontSize(10).fillColor(C.white);
doc.text('Requirement',ML+8,y+8,{width:rW1,lineBreak:false});
doc.text('Value',ML+rW1+8,y+8,{width:rW2,lineBreak:false});
doc.text('Notes',ML+rW1+rW2+8,y+8,{lineBreak:false});
reqs.forEach((r,i)=>{
  const ry=y+26+i*24;
  doc.rect(ML,ry,CW,24).fill(i%2===0?C.white:C.grey50);
  doc.font(F).fontSize(9.5).fillColor(C.grey700).text(r[0],ML+8,ry+7,{width:rW1-10,lineBreak:false});
  rr(ML+rW1+6,ry+6,rW2-8,13,4,C.greenLt);
  doc.font(F).fontSize(9).fillColor(C.greenDk).text(r[1],ML+rW1+6,ry+10,{align:'center',width:rW2-8,lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey600).text(r[2],ML+rW1+rW2+8,ry+8,{width:rW3-8,lineBreak:false});
  ln(ML,ry+24,W-MR,ry+24,C.grey200,0.2);
});
y+=26+reqs.length*24+14;

rr(ML,y,CW,54,8,C.greenDk);
doc.font(F).fontSize(12).fillColor(C.white).text('📋 Manifest Download URL (copy this into your browser):',ML+14,y+8,{lineBreak:false});
doc.font(M).fontSize(10).fillColor(C.gold).text('https://8e832e48-8f9e-4168-9828-29c19ce7accc-00-12f81e1kjeof1.picard.replit.dev/api/addin/manifest.xml',ML+14,y+26,{width:CW-20,lineBreak:false});
doc.font(F).fontSize(8.5).fillColor('rgba(255,255,255,0.65)').text('The server generates the manifest dynamically — always current with the latest version',ML+14,y+42,{lineBreak:false});
footer(15);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 16 — FREQUENTLY ASKED QUESTIONS
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Frequently Asked Questions');
y=78;
y=sec('❓','Frequently Asked Questions','8 common questions about SniperSheet answered',y);

const faqs=[
  {q:'Is SniperSheet 100% free to use?',
   a:'Yes. SniperSheet uses Groq\'s free tier (Llama 3.3 70B, 30 requests/minute). The GROQ_API_KEY is managed by the developer on the server. Users never need to create a Groq account, provide payment details, or pay anything — ever.'},
  {q:'Do users in Iraq need a VPN?',
   a:'No. All AI requests are routed through a Replit server hosted in the United States. Users connect to the Replit HTTPS endpoint, not directly to Groq. This proxy architecture means users in Iraq, or any country with API restrictions, can use SniperSheet without any VPN.'},
  {q:'What happens when the AI is unavailable or rate-limited?',
   a:'SniperSheet uses a 3-model cascade: if the primary model (Llama 3.3 70B) is rate-limited or fails, it automatically retries with the second model (Llama 3 70B 8192), then the third (Llama 3 8B). If all cloud models fail, the local formula engine activates with 35+ built-in patterns — zero latency.'},
  {q:'Does SniperSheet work without internet?',
   a:'Yes — partially. The local formula engine works 100% offline and handles SUM, IF, AVERAGE, VLOOKUP, and 35+ other common patterns with no network connection. The AI Smart Hub feature requires an internet connection to reach the Groq API via Replit.'},
  {q:'What Excel versions are supported?',
   a:'Microsoft Excel 2016 and later on Windows and Mac. Office 365 is recommended for the best experience. The add-in uses the Office.js Manifest v1.1 specification with ReadWriteDocument permission level.'},
  {q:'Can I type my formula request in Arabic?',
   a:'Absolutely. Arabic language input is fully supported in Smart Hub. Type your description in Arabic, and SniperSheet generates the exact Excel formula along with a full explanation in Arabic. The entire interface is bilingual — English and Arabic.'},
  {q:'How secure is my formula data?',
   a:'Your formula descriptions are sent over HTTPS to the Replit server, which forwards only the text prompt to Groq AI. No user data is stored persistently. The local history log exists only in the browser session memory and is cleared when you close the task pane.'},
  {q:'Can SniperSheet write formulas directly into Excel cells?',
   a:'Yes. With ReadWriteDocument permission, SniperSheet can write formulas directly into the currently active Excel cell using the Office.js API. Click "Apply to Cell" after a formula is generated to insert it. You can also manually copy and paste the formula.'},
];
const fW=(CW-12)/2;
faqs.forEach((f,i)=>{
  const fX=ML+(i%2)*(fW+12), fY=y+Math.floor(i/2)*76;
  rr(fX,fY,fW,70,7,C.grey50,C.grey200);
  rr(fX,fY,fW,22,7,C.greenLt,C.grey200);
  doc.rect(fX,fY+14,fW,8).fill(C.greenLt);
  doc.font(F).fontSize(8.5).fillColor(C.greenDk).text(f.q,fX+10,fY+5,{width:fW-18,lineBreak:false});
  doc.font(F).fontSize(8.5).fillColor(C.grey700).text(f.a,fX+10,fY+26,{width:fW-18,lineGap:1.5});
});
footer(16);


// ══════════════════════════════════════════════════════════════════════════════
// PAGE 17 — DEVELOPER PROFILE & RIGHTS
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage({size:'A4',margin:0});
hdr('Developer Profile & Rights');
y=78;
y=sec('👤','Developer Profile','The creator of SniperSheet',y);

// Dev card
rr(ML,y,CW,96,12,C.greenDk);
doc.font(F).fontSize(52).text('🎯',ML+16,y+18,{lineBreak:false});
doc.font(F).fontSize(22).fillColor(C.white).text('Mustafa Alsahlany',ML+86,y+14,{lineBreak:false});
doc.font(F).fontSize(11).fillColor(C.white).fillOpacity(0.85)
  .text('Developer & Designer — SniperSheet Excel Add-in',ML+86,y+42,{lineBreak:false});
doc.font(F).fontSize(10).fillColor(C.white).fillOpacity(0.7)
  .text('Built with React, Express.js, TypeScript, and Groq AI on Replit',ML+86,y+60,{lineBreak:false});
doc.font(F).fontSize(9).fillColor(C.gold).fillOpacity(0.9)
  .text('Iraq  ·  2026',ML+86,y+78,{lineBreak:false});
doc.fillOpacity(1);
['🌐 Replit — Active','🤖 Groq AI — Free','📦 v1.0.0','📅 April 2026'].forEach((d,i)=>{
  doc.font(F).fontSize(9.5).fillColor(C.white).fillOpacity(0.85)
    .text(d,W-MR-180,y+14+i*18,{lineBreak:false});
  doc.fillOpacity(1);
});
y+=112;

// Technology stack
const stW=(CW-12)/2;
const stackL=[
  ['🖥️ Frontend','React 18 + Vite + TypeScript'],
  ['🌐 Backend', 'Express.js + Node.js 24'],
  ['🤖 AI Engine','Groq SDK — Llama 3.3 70B'],
  ['🎨 Styling',  'Tailwind CSS + shadcn/ui'],
  ['📦 Packages', 'pnpm Monorepo Workspace'],
  ['🔧 Build',    'esbuild (CJS bundle)'],
];
const stackR=[
  ['📋 Manifest', 'Office.js v1.1 Task Pane'],
  ['🔑 Permission','ReadWriteDocument'],
  ['🌍 Locale',   'ar-SA (primary) + en-US'],
  ['☁️ Hosting',  'Replit Autoscale (US)'],
  ['🔒 Security', 'HTTPS / TLS 1.3'],
  ['💻 Icons',    '16 · 32 · 64 · 80 px PNG'],
];
[[stackL,ML],[stackR,ML+stW+12]].forEach(([items,sx])=>{
  rr(sx,y,stW,items.length*28+18,8,C.grey50,C.grey200);
  doc.font(F).fontSize(11).fillColor(C.green).text('🛠 Tech Stack',sx+12,y+8,{lineBreak:false});
  items.forEach(([k,v],i)=>{
    const iy=y+30+i*28;
    ln(sx+10,iy,sx+stW-10,iy,C.grey200,0.3);
    doc.font(F).fontSize(9).fillColor(C.grey600).text(k,sx+14,iy+5,{lineBreak:false});
    doc.font(F).fontSize(10.5).fillColor(C.grey900).text(v,sx+14,iy+16,{lineBreak:false});
  });
});
y+=stackL.length*28+30;

// Groq + Replit credits
const credW=(CW-12)/2;
rr(ML,y,credW,64,8,'#0F172A');
doc.font(F).fontSize(18).text('🤖',ML+14,y+12);
doc.font(F).fontSize(12).fillColor(C.white).text('Groq AI',ML+44,y+12,{lineBreak:false});
doc.font(F).fontSize(9).fillColor('rgba(255,255,255,0.7)').text('Llama 3.3 70B · Free Tier · 30 RPM',ML+44,y+28,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor(C.green).text('3-Model Cascade · LPU Hardware',ML+44,y+42,{lineBreak:false});
doc.font(F).fontSize(8).fillColor('rgba(255,255,255,0.5)').text('AI engine — no billing — no account needed',ML+14,y+54,{lineBreak:false});

rr(ML+credW+12,y,credW,64,8,'#1C1C2E');
doc.font(F).fontSize(18).text('🖥️',ML+credW+26,y+12);
doc.font(F).fontSize(12).fillColor(C.white).text('Replit',ML+credW+56,y+12,{lineBreak:false});
doc.font(F).fontSize(9).fillColor('rgba(255,255,255,0.7)').text('Autoscale · US Region · HTTPS',ML+credW+56,y+28,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor('#5C6BC0').text('Node.js 24 · Express.js · API Proxy',ML+credW+56,y+42,{lineBreak:false});
doc.font(F).fontSize(8).fillColor('rgba(255,255,255,0.5)').text('No VPN needed — accessible worldwide',ML+credW+26,y+54,{lineBreak:false});
y+=78;

// Copyright bar
rr(ML,y,CW,38,8,C.greenDk);
doc.font(F).fontSize(10).fillColor(C.gold)
  .text('© 2026 Mustafa Alsahlany — All Rights Reserved',ML+14,y+8,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor('rgba(255,255,255,0.65)')
  .text('SniperSheet v1.0 · Official English Guide · 17 Pages · Built on Replit · Powered by Groq AI (Free Tier) · Developed by: Mustafa Alsahlany',
    ML+14,y+24,{width:CW-20,lineBreak:false});
footer(17);


doc.end();
console.log('✅ SniperSheet_Official_Guide_EN.pdf generated — 17 pages');
