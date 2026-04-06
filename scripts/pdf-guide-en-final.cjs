'use strict';
// SniperSheet_Official_Guide_EN.pdf — v2 FINAL — 17 pages — zero overflow
const PDFDocument = require('/tmp/pdfgen/node_modules/pdfkit');
const fs          = require('fs');

const OUT  = '/home/runner/workspace/SniperSheet_Official_Guide_EN.pdf';
const FONT = '/tmp/pdfgen/fonts/Cairo.ttf';
const TOTAL = 17;

// ── Palette ──────────────────────────────────────────────────────────────────
const G = {
  green:'#107C41', gDk:'#0B5C30', gLt:'#E8F5EE',
  white:'#FFFFFF',
  g50:'#F8FAFB', g100:'#EEF2F5', g200:'#DDE3EA',
  g400:'#9CA3AF', g600:'#4B5563', g700:'#374151', g900:'#111827',
  gold:'#D4A017', amber:'#92400E', aLt:'#FEF3C7',
  blue:'#1D4ED8', bLt:'#DBEAFE', bDk:'#1E3A8A',
  purple:'#5B21B6', pLt:'#EDE9FE',
  red:'#991B1B', rLt:'#FEE2E2',
};

const doc = new PDFDocument({
  size:'A4', margins:{top:0,bottom:0,left:0,right:0}, bufferPages:true,
  info:{
    Title:'SniperSheet — Official English Guide',
    Author:'Mustafa Alsahlany',
    Subject:'Excel Add-in Complete Reference',
    Creator:'SniperSheet PDF Engine v2',
  },
});
doc.pipe(fs.createWriteStream(OUT));
if (fs.existsSync(FONT)) doc.registerFont('Cairo', FONT);
const F  = 'Cairo';
const MN = 'Courier';
const W  = 595.28, H = 841.89;
const ML = 44, MR = 44, CW = W - ML - MR;
const BODY_BOT = H - 46;   // safe bottom before footer

// ── Helpers ───────────────────────────────────────────────────────────────────
// rounded-rect with fill/stroke
const rr = (x,y,w,h,r,fill,stroke) => {
  doc.roundedRect(x,y,w,h,r);
  if (fill && stroke) doc.fillAndStroke(fill,stroke);
  else if (fill)      doc.fillColor(fill).fill();
  else if (stroke)    doc.strokeColor(stroke).stroke();
};
// line
const ln = (x1,y1,x2,y2,c=G.g200,lw=0.5) =>
  doc.moveTo(x1,y1).lineTo(x2,y2).strokeColor(c).lineWidth(lw).stroke();

// clipped text — text NEVER escapes box (x,y,w,h)
const clip = (fn) => { doc.save(); fn(); doc.restore(); };
const clippedText = (text, x, y, bW, bH, opts={}) => {
  clip(() => {
    doc.rect(x,y,bW,bH).clip();
    doc.text(text, x, y, {width:bW, height:bH, ...opts});
  });
};

// ── Footer (every page) ───────────────────────────────────────────────────────
const footer = (n, dark=false) => {
  const fy = H - 28;
  const tc = dark ? 'rgba(255,255,255,0.65)' : G.g400;
  const lc = dark ? 'rgba(255,255,255,0.15)' : G.g200;
  ln(ML,fy,W-MR,fy,lc,0.5);
  doc.font(F).fontSize(7.5).fillColor(tc);
  doc.text('Developed by: Mustafa Alsahlany', ML, fy+8, {lineBreak:false, width:200});
  const mid='SniperSheet · Official English Guide · 2026';
  doc.text(mid, (W-doc.widthOfString(mid))/2, fy+8, {lineBreak:false});
  const pg=`Page ${n} / ${TOTAL}`;
  doc.text(pg, W-MR-doc.widthOfString(pg)-2, fy+8, {lineBreak:false});
};

// ── Page header ───────────────────────────────────────────────────────────────
const hdr = (section) => {
  doc.rect(0,0,W,7).fill(G.green);
  rr(ML,16,34,34,7,G.gLt);
  doc.font(F).fontSize(16).text('🎯',ML+6,21);
  doc.font(F).fontSize(13).fillColor(G.green).text('SniperSheet',ML+44,19,{lineBreak:false});
  doc.font(F).fontSize(8).fillColor(G.g400).text(section,ML+44,35,{lineBreak:false, width:CW-44});
  ln(ML,60,W-MR,60,G.green,1.5);
};

// ── Section heading ───────────────────────────────────────────────────────────
const sec = (icon,title,sub,y,iconSz=18,titleSz=13) => {
  rr(ML,y,34,34,7,G.green);
  doc.font(F).fontSize(iconSz).text(icon,ML+6,y+7);
  doc.font(F).fontSize(titleSz).fillColor(G.g900)
    .text(title,ML+44,y+3,{lineBreak:false, width:CW-44});
  doc.font(F).fontSize(8.5).fillColor(G.g600)
    .text(sub,ML+44,y+20,{lineBreak:false, width:CW-44});
  return y+48;
};

// ── Bullet ────────────────────────────────────────────────────────────────────
const bull = (txt, x, y, w, dotCol=G.green) => {
  const safe = Math.max(w-16, 60);
  doc.circle(x+5,y+6,2.2).fill(dotCol);
  doc.font(F).fontSize(9).fillColor(G.g700)
    .text(txt, x+14, y, {width:safe, lineGap:0.5, lineBreak:true});
  return y + doc.heightOfString(txt,{width:safe, lineGap:0.5}) + 4;
};

// ── Key-value spec row ────────────────────────────────────────────────────────
const specRow = (k, v, x, y, w, even=true) => {
  doc.rect(x,y,w,22).fill(even?G.g50:G.white);
  doc.font(F).fontSize(8).fillColor(G.g600).text(k, x+8, y+3, {lineBreak:false, width:w/2-12});
  doc.font(F).fontSize(9.5).fillColor(G.g900).text(v, x+8, y+12, {lineBreak:false, width:w-16});
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1 — COVER
// ─────────────────────────────────────────────────────────────────────────────
doc.rect(0,0,W,H).fill(G.gDk);
for(let i=0;i<16;i++){
  doc.rect(0,H*(i/16),W,H/16).fillOpacity(0.025*i).fill('#1db954');
}
doc.fillOpacity(1);
doc.circle(W-50,130,180).fillOpacity(0.05).fill(G.white);
doc.circle(50,H-90,150).fillOpacity(0.05).fill(G.white);
doc.fillOpacity(1);

// Badge
const bW=280, bX=(W-bW)/2;
doc.roundedRect(bX,46,bW,26,13).fillOpacity(0.2).fill(G.white); doc.fillOpacity(1);
doc.font(F).fontSize(9).fillColor(G.white)
  .text('⚡  EXCEL ADD-IN  ·  OFFICIAL ENGLISH GUIDE',bX,54,{align:'center',width:bW,lineBreak:false});

// Logo
const lsz=76, lx=(W-lsz)/2;
doc.roundedRect(lx,88,lsz,lsz,16).fillOpacity(0.2).fill(G.white); doc.fillOpacity(1);
doc.font(F).fontSize(32).text('🎯',lx,104,{align:'center',width:lsz});

doc.font(F).fontSize(48).fillColor(G.white).text('SniperSheet',0,182,{align:'center',width:W});
doc.font(F).fontSize(16).fillColor(G.white).fillOpacity(0.9)
  .text('AI-Powered Excel Formula Engine',0,242,{align:'center',width:W});
doc.font(F).fontSize(10.5).fillColor(G.white).fillOpacity(0.65)
  .text('Natural Language → Precise Excel Formulas in Seconds',0,264,{align:'center',width:W});
doc.fillOpacity(1);
ln(W/2-28,288,W/2+28,288,G.white,2);

// Stats
const stats=[['35+','Formula Patterns'],['4','Smart Tabs'],['100%','Free AI'],['3','AI Models']];
const sw=CW/stats.length;
stats.forEach(([n,l],i)=>{
  const sx=ML+i*sw;
  doc.font(F).fontSize(24).fillColor(G.white).text(n,sx,304,{align:'center',width:sw});
  doc.font(F).fontSize(8).fillColor(G.white).fillOpacity(0.6)
    .text(l,sx,334,{align:'center',width:sw}); doc.fillOpacity(1);
});

// Feature pills — two rows max
const pills=['Smart Hub','Commands','Cell Dimensions','Advanced Tools','Local Fallback','100% Free'];
let px=ML, py=364;
pills.forEach(p=>{
  const pw=doc.font(F).fontSize(8.5).widthOfString(p)+20;
  if(px+pw>W-MR){ px=ML; py+=27; }
  doc.roundedRect(px,py,pw,21,10).fillOpacity(0.2).fill(G.white); doc.fillOpacity(1);
  doc.font(F).fontSize(8.5).fillColor(G.white).text(p,px+10,py+5,{lineBreak:false});
  px+=pw+7;
});

// Groq + Replit badges on cover
const bY=420, bHalf=(CW-12)/2;
rr(ML,bY,bHalf,50,8,'rgba(255,255,255,0.1)');
doc.font(F).fontSize(14).text('🤖',ML+12,bY+10);
doc.font(F).fontSize(10.5).fillColor(G.white).text('Powered by Groq AI',ML+42,bY+10,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor(G.white).fillOpacity(0.65)
  .text('Llama 3.3 70B · Free Forever',ML+42,bY+28,{lineBreak:false}); doc.fillOpacity(1);

const bX2=ML+bHalf+12;
rr(bX2,bY,bHalf,50,8,'rgba(255,255,255,0.1)');
doc.font(F).fontSize(14).text('🖥️',bX2+12,bY+10);
doc.font(F).fontSize(10.5).fillColor(G.white).text('Hosted on Replit',bX2+42,bY+10,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor(G.white).fillOpacity(0.65)
  .text('US Server · HTTPS · No VPN',bX2+42,bY+28,{lineBreak:false}); doc.fillOpacity(1);

ln(ML,H-60,W-MR,H-60,G.white,0.2);
doc.font(F).fontSize(11).fillColor(G.white).fillOpacity(0.9)
  .text('👤  Developed by: Mustafa Alsahlany',ML,H-48,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor(G.gold).fillOpacity(0.9)
  .text('SniperSheet v1.0  ·  2026  ·  All Rights Reserved',ML,H-33,{lineBreak:false});
doc.fillOpacity(1);
footer(1,true);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — TABLE OF CONTENTS
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Table of Contents');
let y=72;

rr(ML,y,CW,44,8,G.green);
doc.font(F).fontSize(20).text('📋',ML+14,y+10);
doc.font(F).fontSize(16).fillColor(G.white).text('Table of Contents',ML+48,y+11,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor(G.white).fillOpacity(0.75)
  .text('Complete 17-page official guide',ML+48,y+31,{lineBreak:false}); doc.fillOpacity(1);
y+=56;

const toc=[
  ['01','Cover & Product Identity'],
  ['02','Table of Contents'],
  ['03','Product Overview'],
  ['04','UI & Task Pane Design'],
  ['05','Smart Hub — AI Engine (Tab 1)'],
  ['06','Commands — Aliases (Tab 2)'],
  ['07','Cell Dimensions (Tab 3)'],
  ['08','Advanced Tools (Tab 4)'],
  ['09','AI Proxy Architecture'],
  ['10','Groq AI — Deep Dive'],
  ['11','Replit Infrastructure'],
  ['12','Formula Examples Gallery'],
  ['13','Prompt Writing Tips'],
  ['14','Confidence Score System'],
  ['15','Installation Guide'],
  ['16','Frequently Asked Questions'],
  ['17','Developer Profile & Rights'],
];

const colW=(CW-16)/2, rowH=34;
toc.forEach((t,i)=>{
  const col=i<9?0:1, row=col===0?i:i-9;
  const tx=ML+col*(colW+16), ty=y+row*rowH;
  const isThis=i===1;
  rr(tx,ty,colW,rowH-4,5,isThis?G.gLt:G.g50,isThis?G.green:G.g200);
  rr(tx+8,ty+7,22,20,4,isThis?G.green:G.g200);
  doc.font(F).fontSize(9).fillColor(isThis?G.white:G.g600)
    .text(t[0],tx+8,ty+11,{align:'center',width:22,lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(G.g900)
    .text(t[1],tx+38,ty+11,{lineBreak:false,width:colW-46});
});
footer(2);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — PRODUCT OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Product Overview');
y=72;
y=sec('📋','What is SniperSheet?','AI-powered Excel add-in for natural language formula generation',y);

rr(ML,y,CW,68,8,G.gLt);
ln(ML,y,ML,y+68,G.green,3);
clippedText(
  'SniperSheet is a professional Excel task pane add-in (400px wide) that converts natural language descriptions into precise Excel formulas. It is powered by Groq AI (Llama 3.3 70B — completely free). It supports English and Arabic input, routes all AI calls through a US Replit server (no VPN needed anywhere), and falls back automatically to a built-in local engine when offline.',
  ML+14, y+10, CW-24, 52,
  {font:F, fontSize:9.5, fillColor:G.g700, lineGap:2}
);
y+=80;

const c3W=(CW-16)/3, c3H=80;
const ov3=[
  ['🤖','Groq AI Engine',    'Llama 3.3 70B\n100% free, no account needed'],
  ['🌐','Bilingual Support', 'English & Arabic input\nFull RTL interface'],
  ['🔒','Proxy Security',    'US Replit server proxy\nNo VPN required globally'],
  ['⚡','Offline Fallback', '35+ built-in patterns\nZero-latency local engine'],
  ['📐','Office.js Add-in',  'ReadWriteDocument access\nExcel Ribbon integration'],
  ['📱','400px Task Pane',   'Smooth scrolling UX\nNative Excel sidebar'],
];
for(let i=0;i<2;i++) for(let j=0;j<3;j++){
  const c=ov3[i*3+j], cx=ML+j*(c3W+8), cy=y+i*(c3H+8);
  rr(cx,cy,c3W,c3H,8,G.g50,G.g200);
  doc.font(F).fontSize(18).text(c[0],cx+10,cy+8);
  doc.font(F).fontSize(10).fillColor(G.g900).text(c[1],cx+10,cy+34,{lineBreak:false,width:c3W-18});
  doc.font(F).fontSize(8.5).fillColor(G.g600).text(c[2],cx+10,cy+50,{width:c3W-18,lineGap:0.5});
}
y+=2*(c3H+8)+8;

rr(ML,y,CW,38,7,G.green);
doc.font(F).fontSize(16).text('💡',ML+12,y+8);
clippedText(
  'Describe any calculation in English or Arabic → SniperSheet returns the exact Excel formula with explanation, confidence score, and formatting hints instantly.',
  ML+42, y+9, CW-52, 26,
  {font:F, fontSize:9.5, fillColor:G.white, lineGap:2}
);
y+=50;

y=sec('🏆','Who is SniperSheet For?','Target professionals and primary use cases',y);
const users=[
  ['🔧','Engineers',        'Complex formulas in seconds'],
  ['💼','Analysts',         'Financial & KPI modeling'],
  ['📊','Project Managers', 'Tracking & budgeting'],
  ['🎓','Students',         'Stats & research analysis'],
];
const uW=(CW-12)/4;
users.forEach((u,i)=>{
  const ux=ML+i*(uW+4);
  rr(ux,y,uW,60,7,G.gLt,G.green);
  doc.font(F).fontSize(20).text(u[0],ux,y+6,{align:'center',width:uW});
  doc.font(F).fontSize(9.5).fillColor(G.g900).text(u[1],ux+6,y+36,{lineBreak:false,width:uW-12});
  doc.font(F).fontSize(8.5).fillColor(G.g600).text(u[2],ux+6,y+50,{lineBreak:false,width:uW-12});
});
footer(3);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 4 — UI & TASK PANE DESIGN
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('UI & Task Pane Design');
y=72;
y=sec('🖥️','Task Pane Interface','400px wide · 4-tab navigation · bilingual RTL/LTR support',y);

rr(ML,y,CW,60,8,G.gLt);
ln(ML,y,ML,y+60,G.green,3);
clippedText(
  'SniperSheet runs as a 400px task pane on the right side of Excel. Built with React 18 + Vite and Tailwind CSS. Supports Left-to-Right (English) and Right-to-Left (Arabic) layouts dynamically. Features smooth scrolling, native Office.js integration, and a clean green-themed professional design system.',
  ML+14, y+8, CW-24, 48,
  {font:F, fontSize:9.5, fillColor:G.g700, lineGap:2}
);
y+=72;

// 4 tab cards — fixed height 190
const tabs4=[
  {n:'01',icon:'✨',title:'Smart Hub',       col:G.green,   bg:G.gLt,
   buls:['AI formula generation (Groq)','Confidence score 0–100%','Formula type detection','Word Radar typo check','Style & formatting hints','History log with timestamps']},
  {n:'02',icon:'⌨️',title:'Commands',        col:G.blue,    bg:G.bLt,
   buls:['Arabic command aliases','SUM, AVG, MAX, MIN, COUNT','BONUS 15%, TAX 15%','Real-time calculation','Searchable reference table','Full execution history']},
  {n:'03',icon:'📐',title:'Cell Dimensions', col:G.purple,  bg:G.pLt,
   buls:['Arabic character width calc','Font size & bold awareness','Single & batch modes','Pixel and Excel unit output','Recommended padding','One-click copy results']},
  {n:'04',icon:'🔧',title:'Advanced Tools',  col:G.amber,   bg:G.aLt,
   buls:['Empty Field Radar scan','Smart Print-Fit calc','Professional Report view','CSV / tab-data input','Color-coded grid output','Browser print dialog']},
];
const tabW=(CW-12)/4, tabH=188;
tabs4.forEach((t,i)=>{
  const tx=ML+i*(tabW+4);
  rr(tx,y,tabW,tabH,8,G.white,G.g200);
  rr(tx,y,tabW,38,8,t.bg,G.g200);
  doc.rect(tx,y+26,tabW,12).fill(t.bg);
  rr(tx+tabW-30,y+6,24,24,5,t.col);
  doc.font(F).fontSize(9).fillColor(G.white)
    .text(t.n,tx+tabW-30,y+13,{align:'center',width:24,lineBreak:false});
  doc.font(F).fontSize(14).text(t.icon,tx+8,y+8);
  doc.font(F).fontSize(9.5).fillColor(G.g900)
    .text(t.title,tx+8,y+29,{lineBreak:false,width:tabW-36});
  ln(tx,y+38,tx+tabW,y+38,G.g200,0.4);
  let bY=y+46;
  t.buls.forEach(b=>{
    if(bY>y+tabH-10) return;
    doc.circle(tx+10,bY+4.5,2).fill(t.col);
    clippedText(b,tx+18,bY,tabW-24,12,{font:F,fontSize:8,fillColor:G.g700,lineBreak:false});
    bY+=14;
  });
});
y+=tabH+12;

y=sec('🎨','Design System','Color palette and typography',y);
const ds=[
  ['#107C41','Primary Green',  'Buttons, headers'],
  ['#0B5C30','Dark Green',     'Covers, dark bars'],
  ['#E8F5EE','Light Green',    'Cards, highlights'],
  ['#111827','Neutral 900',    'Primary text'],
  ['#4B5563','Neutral 600',    'Secondary text'],
  ['#DDE3EA','Neutral 200',    'Borders, dividers'],
];
const dW=Math.floor((CW-5*8)/6);
ds.forEach((d,i)=>{
  const dx=ML+i*(dW+8);
  doc.rect(dx,y,dW,20).fill(d[0]);
  rr(dx,y+20,dW,28,0,G.g50,G.g200);
  doc.font(F).fontSize(7).fillColor(G.g900)
    .text(d[1],dx+3,y+22,{lineBreak:false,width:dW-6});
  doc.font(MN).fontSize(6.5).fillColor(G.g600)
    .text(d[0],dx+3,y+33,{lineBreak:false,width:dW-6});
});
footer(4);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 5 — SMART HUB
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Tab 1 — Smart Hub');
y=72;
y=sec('✨','Smart Hub — AI Formula Engine','Tab 1 · Natural language → Excel formula via Groq AI',y);

rr(ML,y,CW,62,8,G.gLt);
ln(ML,y,ML,y+62,G.green,3);
clippedText(
  'The core feature of SniperSheet. Type any calculation description in English or Arabic — such as "calculate overtime for hours over 40 at 1.5x rate" — then click Smart Analysis. Groq AI (Llama 3.3 70B) returns the exact formula, a full explanation, a confidence score (0–100%), and optional formatting hints.',
  ML+14, y+8, CW-24, 50,
  {font:F, fontSize:9.5, fillColor:G.g700, lineGap:2}
);
y+=74;

y=sec('📋','Full Feature List','Everything Smart Hub offers',y);
const half5=(CW-12)/2;
const shL=['AI formula generation (Groq Llama 3.3 70B)',
  'Confidence scoring: 0–100% per formula result',
  'Formula type detection (IF, XLOOKUP, SUM…)',
  'Word Radar: flags typos & ambiguous terms',
  'Style hints: cell color, bold, italic formatting',
  'History log with timestamps and replay'];
const shR=['Local formula engine — full offline fallback',
  '3-model AI cascade with auto-retry on failure',
  'Status badge: success / warning / error state',
  'Step-by-step formula explanation provided',
  'One-click copy formula to clipboard',
  'One-click apply formula to active Excel cell'];
let lY=y, rY=y;
shL.forEach(b=>{ lY=bull(b,ML,lY,half5); });
shR.forEach(b=>{ rY=bull(b,ML+half5+12,rY,half5); });
y=Math.max(lY,rY)+12;

y=sec('🔄','How It Works','Step-by-step: description to formula in seconds',y);
const steps5=[
  ['1','Type',    'Write your formula description in English or Arabic'],
  ['2','Analyze', 'Click Smart Analysis or press Ctrl+Enter'],
  ['3','Route',   'Request goes via HTTPS to Replit → Groq AI'],
  ['4','Return',  'Formula + explanation + confidence score displayed'],
  ['5','Apply',   'Click Copy or Apply to insert directly into Excel'],
];
const stW=(CW-4*6)/5, stH=80;
steps5.forEach((s,i)=>{
  const sx=ML+i*(stW+6);
  rr(sx,y,stW,stH,7,G.g50,G.g200);
  doc.circle(sx+stW/2,y+16,12).fill(G.green);
  doc.font(F).fontSize(11).fillColor(G.white)
    .text(s[0],sx+stW/2-5,y+10,{lineBreak:false});
  doc.font(F).fontSize(9.5).fillColor(G.g900)
    .text(s[1],sx+6,y+36,{lineBreak:false,width:stW-12});
  clippedText(s[2],sx+6,y+52,stW-12,24,
    {font:F,fontSize:8,fillColor:G.g600,lineGap:1});
});
y+=stH+12;

rr(ML,y,CW,36,7,G.aLt,'#FDE68A');
doc.font(F).fontSize(16).text('💡',ML+10,y+8);
clippedText(
  'Pro Tip: Be specific. Include column references (e.g., column A), conditions (e.g., greater than 1000), and the expected result. Clearer prompts = higher confidence scores.',
  ML+38, y+8, CW-46, 24,
  {font:F, fontSize:9, fillColor:G.amber, lineGap:2}
);
footer(5);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 6 — COMMANDS
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Tab 2 — Commands');
y=72;
y=sec('⌨️','Commands — Formula Aliases','Tab 2 · Arabic & English shorthand for instant calculations',y);

rr(ML,y,CW,56,8,G.bLt);
ln(ML,y,ML,y+56,G.blue,3);
clippedText(
  'Type the command name in English or Arabic along with a cell range to get an instant result. The Commands tab provides a searchable reference table, real-time calculation display, and full execution history. Arabic aliases make formula entry natural for Arabic-speaking users.',
  ML+14, y+8, CW-24, 44,
  {font:F, fontSize:9.5, fillColor:G.g700, lineGap:2}
);
y+=68;

// Table header
const cC=[170,158,CW-328];
doc.rect(ML,y,CW,26).fill(G.blue);
doc.font(F).fontSize(9.5).fillColor(G.white);
doc.text('Command (EN / AR)',ML+8,y+8,{lineBreak:false,width:cC[0]-10});
doc.text('Description',ML+cC[0]+6,y+8,{lineBreak:false,width:cC[1]-10});
doc.text('Formula',ML+cC[0]+cC[1]+6,y+8,{lineBreak:false,width:cC[2]-6});
y+=26;

const cmds=[
  ['SUM / جمع',       'Sum of all values in range',     '=SUM(B1:B10)'],
  ['MULTIPLY / ضرب', 'Product (multiply) of values',    '=PRODUCT(A1:A5)'],
  ['AVERAGE / متوسط','Arithmetic mean of a range',      '=AVERAGE(D1:D20)'],
  ['MAX / أكبر',      'Maximum value in range',          '=MAX(C1:C50)'],
  ['MIN / أصغر',      'Minimum value in range',          '=MIN(C1:C50)'],
  ['COUNT / عدد',     'Count of numeric cells',          '=COUNT(E1:E100)'],
  ['BONUS / مكافأة', 'Adds 15% bonus to amount',        '=A1*1.15'],
  ['TAX / ضريبة',    'Calculates 15% tax',              '=A1*0.15'],
  ['PERCENTAGE / نسبة','Percentage of value vs total',  '=(A1/B1)*100'],
  ['IF / إذا',        'Simple conditional check',        '=IF(A1>1000,"High","Low")'],
  ['COUNTIF / عدد شرط','Count cells matching condition','=COUNTIF(B:B,">=60")'],
  ['SUMIF / جمع شرط','Sum cells matching condition',    '=SUMIF(C:C,">1000",D:D)'],
];
cmds.forEach((r,i)=>{
  const ry=y+i*22;
  doc.rect(ML,ry,CW,22).fill(i%2===0?G.white:G.g50);
  rr(ML+4,ry+4,cC[0]-8,14,4,G.bLt);
  doc.font(F).fontSize(8).fillColor(G.blue)
    .text(r[0],ML+4,ry+8,{align:'center',width:cC[0]-8,lineBreak:false});
  clippedText(r[1],ML+cC[0]+6,ry+5,cC[1]-10,14,
    {font:F,fontSize:8.5,fillColor:G.g700,lineBreak:false});
  clippedText(r[2],ML+cC[0]+cC[1]+6,ry+6,cC[2]-8,13,
    {font:MN,fontSize:8,fillColor:G.gDk,lineBreak:false});
  ln(ML,ry+22,W-MR,ry+22,G.g200,0.2);
});
y+=cmds.length*22+12;

const h6=(CW-12)/2;
rr(ML,y,h6,56,7,'#EFF6FF',G.bLt);
doc.font(F).fontSize(10).fillColor(G.blue).text('✅ Supported Features',ML+10,y+8,{lineBreak:false,width:h6-18});
['Searchable command reference table','Real-time result calculation','Execution history with timestamps','Combine commands: BONUS + SUM'].forEach((b,j)=>{
  doc.circle(ML+14,y+28+j*12,2).fill(G.blue);
  doc.font(F).fontSize(8.5).fillColor(G.g700)
    .text(b,ML+22,y+24+j*12,{lineBreak:false,width:h6-30});
});
rr(ML+h6+12,y,h6,56,7,G.aLt,'#FDE68A');
doc.font(F).fontSize(10).fillColor(G.amber).text('💡 Usage Examples',ML+h6+22,y+8,{lineBreak:false,width:h6-28});
['"SUM B1:B10" → =SUM(B1:B10)','"BONUS A1" → =A1*1.15','"جمع B1:B20" → =SUM(B1:B20)','"PERCENTAGE A1 B1" → =(A1/B1)*100'].forEach((b,j)=>{
  doc.font(MN).fontSize(7.5).fillColor(G.g700)
    .text(b,ML+h6+22,y+28+j*12,{lineBreak:false,width:h6-30});
});
footer(6);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 7 — CELL DIMENSIONS
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Tab 3 — Cell Dimensions');
y=72;
y=sec('📐','Cell Dimensions Calculator','Tab 3 · Optimal cell sizing for Arabic & English text',y);

rr(ML,y,CW,60,8,G.pLt);
ln(ML,y,ML,y+60,G.purple,3);
clippedText(
  'Calculates the optimal width and height for Excel cells based on content, Arabic character width differences, RTL direction, font size, bold/italic styling, and padding. Supports single-cell and batch processing modes. Eliminates guesswork when sizing bilingual spreadsheet cells.',
  ML+14, y+8, CW-24, 48,
  {font:F, fontSize:9.5, fillColor:G.g700, lineGap:2}
);
y+=72;

y=sec('⚙️','How It Works','Input parameters → algorithm → Excel unit output',y);
const pms=[
  {icon:'✏️',title:'Text Content',   desc:'Enter cell text. Supports Arabic, English, or mixed. Arabic characters get a 1.4× width multiplier automatically.'},
  {icon:'🔤',title:'Font Size (pt)', desc:'Specify font size in points. The calculator adjusts width and height proportionally based on the value provided.'},
  {icon:'🖊️',title:'Bold & Italic',  desc:'Toggle bold (×1.15) or italic (×1.05) multipliers. Combinations are calculated cumulatively for accuracy.'},
  {icon:'📏',title:'Padding',         desc:'Specify padding in pixels per side. Added to final width and height. Default: 8px horizontal, 4px vertical.'},
];
const pmW=(CW-12)/4, pmH=96;
pms.forEach((p,i)=>{
  const px2=ML+i*(pmW+4);
  rr(px2,y,pmW,pmH,7,G.g50,G.g200);
  rr(px2,y,pmW,34,7,G.pLt,G.g200);
  doc.rect(px2,y+24,pmW,10).fill(G.pLt);
  doc.font(F).fontSize(16).text(p.icon,px2+8,y+7);
  doc.font(F).fontSize(9.5).fillColor(G.g900)
    .text(p.title,px2+8,y+26,{lineBreak:false,width:pmW-14});
  ln(px2,y+34,px2+pmW,y+34,G.g200,0.3);
  clippedText(p.desc,px2+8,y+40,pmW-14,pmH-46,
    {font:F,fontSize:8,fillColor:G.g700,lineGap:1.5});
});
y+=pmH+14;

y=sec('📊','Output Formats','What the calculator returns and available actions',y);
const h7=(CW-12)/2;
const outL=['Width in pixels (px)','Width in Excel column units','Height in pixels (px)','Height in Excel row units','Recommended padding values','Character count & text metrics'];
const outR=['Single cell calculation mode','Batch: multiple cells at once','One-click copy to clipboard','Apply directly to active cell','Save favorite settings','Arabic / English / mixed aware'];
let oY=y, oY2=y;
outL.forEach(b=>{ oY=bull(b,ML,oY,h7,G.purple); });
outR.forEach(b=>{ oY2=bull(b,ML+h7+12,oY2,h7,G.purple); });
y=Math.max(oY,oY2)+12;

rr(ML,y,CW,44,7,G.pLt,'#C4B5FD');
doc.font(F).fontSize(16).text('📐',ML+12,y+12);
clippedText(
  'Arabic Width Insight: Arabic characters are on average 40% wider than Latin characters at the same font size. The calculator applies a 1.4× Arabic character width multiplier automatically so Arabic text never overflows its cell.',
  ML+42, y+8, CW-52, 32,
  {font:F, fontSize:9, fillColor:G.purple, lineGap:2}
);
footer(7);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 8 — ADVANCED TOOLS
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Tab 4 — Advanced Tools');
y=72;
y=sec('🔧','Advanced Tools — 3 Utilities','Tab 4 · Empty Radar, Smart Print-Fit, Professional Report',y);

const tools8=[
  {icon:'🔍',title:'Empty Field Radar',
   col:G.amber,bg:G.aLt,bdr:'#FDE68A',
   tag:'Data Validation',
   desc:'Paste CSV or tab-separated data, click Scan, and get a color-coded grid showing filled (green) and empty (red) cells, plus exact empty cell coordinates.',
   buls:['CSV or tab-separated data input','Visual grid: green=filled, red=empty','Exact coordinate list (Row:Col)','Auto header row detection','Filled vs empty count summary']},
  {icon:'🖨️',title:'Smart Print-Fit',
   col:G.blue,bg:G.bLt,bdr:'#93C5FD',
   tag:'Print Layout',
   desc:'Calculate exact Excel column widths and font sizes to fit your spreadsheet onto A4 or A3 paper in portrait or landscape — no trial and error.',
   buls:['A4 and A3 paper support','Portrait & landscape orientation','Excel column width unit output','Recommended font size output','Print-ready in under 3 clicks']},
  {icon:'📄',title:'Professional Report',
   col:G.green,bg:G.gLt,bdr:'#86EFAC',
   tag:'Reporting',
   desc:'Transform raw pasted data into a styled HTML table with alternating row colors and bold column headers, then trigger the browser print dialog instantly.',
   buls:['Styled HTML from raw data','Alternating row color scheme','Bold column headers auto-styled','Auto header row detection','One-click browser print trigger']},
];
const toolH=148;
tools8.forEach((t,i)=>{
  const ty2=y+i*(toolH+10);
  rr(ML,ty2,CW,toolH,8,G.white,t.bdr);
  rr(ML,ty2,CW,38,8,t.bg,t.bdr);
  doc.rect(ML,ty2+26,CW,12).fill(t.bg);
  doc.font(F).fontSize(22).text(t.icon,ML+12,ty2+7);
  doc.font(F).fontSize(13).fillColor(G.g900)
    .text(t.title,ML+50,ty2+9,{lineBreak:false,width:CW-130});
  rr(W-MR-80,ty2+10,74,18,6,t.col);
  doc.font(F).fontSize(8).fillColor(G.white)
    .text(t.tag,W-MR-80,ty2+15,{align:'center',width:74,lineBreak:false});
  ln(ML,ty2+38,W-MR,ty2+38,t.bdr,0.5);
  const descW=(CW-12)/2;
  clippedText(t.desc,ML+10,ty2+46,descW-8,toolH-56,
    {font:F,fontSize:9,fillColor:G.g700,lineGap:2});
  let bY2=ty2+46;
  t.buls.forEach(b=>{
    if(bY2>ty2+toolH-10) return;
    doc.circle(ML+descW+18,bY2+4.5,2).fill(t.col);
    clippedText(b,ML+descW+28,bY2,descW-32,12,
      {font:F,fontSize:8.5,fillColor:G.g700,lineBreak:false});
    bY2+=14;
  });
});
footer(8);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 9 — AI PROXY ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('AI Proxy Architecture');
y=72;
y=sec('🏗️','AI Proxy Architecture','How SniperSheet securely connects users to Groq AI via Replit',y);

rr(ML,y,CW,58,8,G.gLt);
ln(ML,y,ML,y+58,G.green,3);
clippedText(
  'SniperSheet uses a server-side proxy to relay AI requests securely. The GROQ_API_KEY is stored as an environment secret on the Replit server and is never exposed to the browser. Users anywhere — including Iraq — connect only to the Replit HTTPS endpoint and never touch the Groq API directly. No VPN, no proxy software, no workaround is required.',
  ML+14, y+8, CW-24, 46,
  {font:F, fontSize:9.5, fillColor:G.g700, lineGap:2}
);
y+=70;

// Flow diagram
const nW=122, nH=80, nGap=(CW-nW*3)/2;
const nodes9=[
  {icon:'💻',title:'User Browser',  lines:['Excel Add-in','React 18 + Vite','POST /api/smart'],  green:false},
  {icon:'🖥️',title:'Replit Server', lines:['Express.js Proxy','Node.js 24 · US','Key hidden'],   green:true},
  {icon:'🤖',title:'Groq AI',       lines:['Llama 3.3 70B','30 RPM Free','JSON response'],       green:false},
];
nodes9.forEach((n,i)=>{
  const nx=ML+i*(nW+nGap), ny=y;
  rr(nx,ny,nW,nH,9,n.green?G.green:G.g50,n.green?G.green:G.g200);
  doc.font(F).fontSize(20).text(n.icon,nx,ny+6,{align:'center',width:nW});
  doc.font(F).fontSize(10).fillColor(n.green?G.white:G.g900)
    .text(n.title,nx,ny+34,{align:'center',width:nW,lineBreak:false});
  n.lines.forEach((l,li)=>{
    doc.font(F).fontSize(8).fillColor(n.green?'rgba(255,255,255,0.75)':G.g600)
      .text(l,nx+6,ny+50+li*10,{width:nW-12,lineBreak:false});
  });
  if(i<2){
    const ax=nx+nW+4, ay=ny+nH/2;
    ln(ax,ay,ax+nGap-10,ay,G.green,1.5);
    doc.polygon([ax+nGap-10,ay-5],[ax+nGap-10,ay+5],[ax+nGap-2,ay]).fill(G.green);
    doc.font(F).fontSize(7.5).fillColor(G.g600)
      .text(i===0?'HTTPS Request':'Groq SDK Call',ax,ay-16,{width:nGap-10,align:'center',lineBreak:false});
  }
});
y+=nH+12;

rr(ML,y,CW,44,7,'#EFF6FF',G.bLt);
doc.font(F).fontSize(20).text('🔒',ML+12,y+10);
clippedText(
  'Security Model: GROQ_API_KEY is a Replit server secret — stored in the environment, never in client code. The browser only sends the formula description text. HTTPS TLS encrypts all traffic. Users never see or interact with the Groq API directly.',
  ML+46, y+8, CW-56, 32,
  {font:F, fontSize:9, fillColor:G.bDk, lineGap:2}
);
y+=56;

y=sec('🔐','No-VPN Design','Why users in Iraq and restricted regions can use SniperSheet',y);
const nvW=(CW-12)/2, nvH=118;
const nvCols=[
  {icon:'❌',title:'Traditional Approach',
   items:['User needs VPN software installed','VPN exposes traffic to VPN provider','VPN cost or performance overhead','VPN blocked by some networks','Complex setup — adoption barrier'],
   bg:G.rLt,bdr:'#FECACA',col:G.red},
  {icon:'✅',title:'SniperSheet Approach',
   items:['User connects to Replit.dev via HTTPS','Replit relays requests to Groq AI','Replit accessible globally (no blocks)','Groq API never exposed to client','Simple: install add-in and use it'],
   bg:G.gLt,bdr:'#86EFAC',col:G.green},
];
nvCols.forEach((n,i)=>{
  const nx=ML+i*(nvW+12);
  rr(nx,y,nvW,nvH,8,n.bg,n.bdr);
  doc.font(F).fontSize(16).text(n.icon,nx+12,y+10);
  doc.font(F).fontSize(11).fillColor(G.g900)
    .text(n.title,nx+40,y+12,{lineBreak:false,width:nvW-50});
  n.items.forEach((b,ii)=>{
    const iy=y+44+ii*14;
    if(iy>y+nvH-12) return;
    doc.circle(nx+14,iy+4.5,2.2).fill(n.col);
    clippedText(b,nx+24,iy,nvW-32,12,
      {font:F,fontSize:8.5,fillColor:G.g700,lineBreak:false});
  });
});
footer(9);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 10 — GROQ AI DEEP DIVE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Groq AI — Deep Dive');
y=72;

// Groq hero banner
rr(ML,y,CW,52,9,'#111827');
doc.font(F).fontSize(26).text('🤖',ML+14,y+12);
doc.font(F).fontSize(18).fillColor(G.white).text('Groq AI',ML+54,y+12,{lineBreak:false});
clippedText('The AI engine powering SniperSheet — 100% free, no credit card required',
  ML+54, y+34, CW-140, 14,
  {font:F,fontSize:8.5,fillColor:'rgba(255,255,255,0.7)',lineBreak:false});
rr(W-MR-100,y+10,94,28,7,G.green);
doc.font(F).fontSize(9).fillColor(G.white)
  .text('FREE FOREVER',W-MR-100,y+17,{align:'center',width:94,lineBreak:false});
doc.font(F).fontSize(7.5).fillColor(G.white).fillOpacity(0.8)
  .text('No billing · No user account',W-MR-100,y+29,{align:'center',width:94,lineBreak:false});
doc.fillOpacity(1);
y+=64;

y=sec('📊','3-Model Cascade','SniperSheet tries models in order — automatic retry',y);
const mdls=[
  {rank:'🥇 PRIMARY',  name:'llama-3.3-70b-versatile',ctx:'32K ctx',params:'70B',rpm:'30 RPM',
   note:'Best quality · Latest Llama 3.3 release',bg:'#F0FDF4',bdr:'#86EFAC',fg:G.green},
  {rank:'🥈 FALLBACK', name:'llama3-70b-8192',        ctx:'8K ctx', params:'70B',rpm:'30 RPM',
   note:'Proven stable · Activates if primary fails',bg:G.bLt,bdr:'#93C5FD',fg:G.blue},
  {rank:'🥉 BACKUP',   name:'llama3-8b-8192',         ctx:'8K ctx', params:'8B', rpm:'30 RPM',
   note:'Ultra-fast · For simple formula patterns',bg:G.aLt,bdr:'#FCD34D',fg:G.amber},
  {rank:'🔧 OFFLINE',  name:'Local Formula Engine',   ctx:'—',      params:'—',  rpm:'∞',
   note:'35+ patterns · Zero latency · Always on',bg:G.pLt,bdr:'#C4B5FD',fg:G.purple},
];
const mW=(CW-12)/4, mH=104;
mdls.forEach((m,i)=>{
  const mx=ML+i*(mW+4);
  rr(mx,y,mW,mH,7,m.bg,m.bdr);
  rr(mx,y,mW,24,7,m.bg,m.bdr);
  doc.font(F).fontSize(8).fillColor(m.fg)
    .text(m.rank,mx+6,y+8,{lineBreak:false,width:mW-10});
  ln(mx,y+24,mx+mW,y+24,m.bdr,0.4);
  doc.font(F).fontSize(8.5).fillColor(G.g900)
    .text(m.name,mx+6,y+30,{width:mW-12,lineGap:0.5});
  doc.font(F).fontSize(7.5).fillColor(G.g600)
    .text(m.params,mx+6,y+60,{lineBreak:false,width:mW/2});
  doc.font(F).fontSize(7.5).fillColor(G.g600)
    .text(m.ctx,mx+mW/2,y+60,{lineBreak:false,width:mW/2-8});
  rr(mx+6,y+72,mW-12,14,4,m.fg);
  doc.font(F).fontSize(7.5).fillColor(G.white)
    .text(m.rpm,mx+6,y+76,{align:'center',width:mW-12,lineBreak:false});
  clippedText(m.note,mx+6,y+90,mW-12,12,
    {font:F,fontSize:7,fillColor:G.g600,lineBreak:false});
});
y+=mH+14;

y=sec('⚡','Groq LPU Technology','Purpose-built hardware for ultra-low-latency AI inference',y);
rr(ML,y,CW,72,8,'#0F172A');
clippedText(
  'Groq runs on Language Processing Unit (LPU) hardware — purpose-built silicon for AI inference. Unlike GPU-based systems, LPUs deliver consistent, ultra-low latency without batching delays. SniperSheet users typically receive their formula result within 1–3 seconds, even for complex nested formulas.',
  ML+14, y+10, CW-24, 38,
  {font:F, fontSize:9.5, fillColor:G.white, lineGap:2}
);
const lpuStats=[['~1–3s','Response Time'],['30 RPM','Free Rate Limit'],['$0','Cost to Users'],['99%+','Success Rate']];
const lW=CW/4;
lpuStats.forEach(([n,l],i)=>{
  const lx=ML+i*lW;
  doc.font(F).fontSize(20).fillColor(G.green).text(n,lx,y+50,{align:'center',width:lW});
  doc.font(F).fontSize(7.5).fillColor(G.white).fillOpacity(0.6)
    .text(l,lx,y+76,{align:'center',width:lW,lineBreak:false});
  doc.fillOpacity(1);
});
y+=88;

rr(ML,y,CW,36,7,G.gLt,'#86EFAC');
doc.font(F).fontSize(16).text('✅',ML+12,y+8);
clippedText(
  'Free Tier Summary: Groq provides 30 requests/minute at no cost for all 3 Llama models. SniperSheet is designed to stay within this limit. The cascade system ensures 99%+ formula generation success even at peak usage.',
  ML+42, y+8, CW-52, 24,
  {font:F, fontSize:9, fillColor:G.gDk, lineGap:2}
);
footer(10);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 11 — REPLIT INFRASTRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Replit Infrastructure');
y=72;

rr(ML,y,CW,52,9,'#1C1C2E');
doc.font(F).fontSize(26).text('🖥️',ML+14,y+12);
doc.font(F).fontSize(18).fillColor(G.white).text('Replit',ML+54,y+12,{lineBreak:false});
clippedText('Cloud platform hosting the SniperSheet API — Autoscale deployment on US infrastructure',
  ML+54, y+34, CW-160, 14,
  {font:F,fontSize:8.5,fillColor:'rgba(255,255,255,0.7)',lineBreak:false});
rr(W-MR-100,y+10,94,28,7,'#5C6BC0');
doc.font(F).fontSize(9).fillColor(G.white)
  .text('AUTOSCALE',W-MR-100,y+17,{align:'center',width:94,lineBreak:false});
doc.font(F).fontSize(7.5).fillColor(G.white).fillOpacity(0.8)
  .text('Always-on · US region',W-MR-100,y+29,{align:'center',width:94,lineBreak:false});
doc.fillOpacity(1);
y+=64;

y=sec('⚙️','Server Stack','Complete technical profile of the SniperSheet backend',y);
const spc=[
  ['Runtime',       'Node.js 24 (LTS)',          'Latest LTS — full ESM support'],
  ['Framework',     'Express.js 5',              'Async/await middleware'],
  ['AI SDK',        'Groq SDK (Official)',        'TypeScript native npm package'],
  ['Language',      'TypeScript (strict)',        'Full type safety end-to-end'],
  ['Build',         'esbuild',                   'Fast CJS bundle for production'],
  ['Pkg Manager',   'pnpm Workspace',            'Monorepo-compatible, fast installs'],
  ['Platform',      'Replit Autoscale',          'Scales to zero when idle'],
  ['Region',        'United States (US)',         'Low latency — accessible globally'],
  ['Protocol',      'HTTPS / TLS 1.3',           'All traffic encrypted'],
  ['CORS',          'HTTPS origin restricted',   'Add-in domain whitelisted'],
];
const sW1=96, sW2=164, sW3=CW-sW1-sW2;
doc.rect(ML,y,CW,24).fill(G.green);
doc.font(F).fontSize(9.5).fillColor(G.white);
doc.text('Property',ML+8,y+7,{lineBreak:false,width:sW1-10});
doc.text('Value',ML+sW1+6,y+7,{lineBreak:false,width:sW2-10});
doc.text('Notes',ML+sW1+sW2+6,y+7,{lineBreak:false,width:sW3-6});
y+=24;
spc.forEach((s,i)=>{
  const ry=y+i*20;
  doc.rect(ML,ry,CW,20).fill(i%2===0?G.white:G.g50);
  clippedText(s[0],ML+8,ry+4,sW1-12,14,{font:F,fontSize:8,fillColor:G.g600,lineBreak:false});
  rr(ML+sW1+4,ry+3,sW2-8,14,3,G.gLt);
  clippedText(s[1],ML+sW1+4,ry+6,sW2-8,10,{font:F,fontSize:8,fillColor:G.gDk,align:'center',lineBreak:false});
  clippedText(s[2],ML+sW1+sW2+6,ry+5,sW3-10,12,{font:F,fontSize:8,fillColor:G.g700,lineBreak:false});
  ln(ML,ry+20,W-MR,ry+20,G.g200,0.2);
});
y+=spc.length*20+12;

y=sec('🔗','API Endpoints','Routes served by the SniperSheet Express server',y);
const eps=[
  ['POST','/api/smart/analyze',     'Main AI formula generation — accepts {prompt, lang}'],
  ['GET', '/api/addin/manifest.xml','Office.js manifest for Excel add-in sideloading'],
  ['GET', '/api/addin/icon-*.png',  'PNG icons: 16, 32, 64, 80px for the Ribbon'],
  ['GET', '/excel-addin/',          'React task pane SPA (Vite production build)'],
];
eps.forEach((e,i)=>{
  const ey=y+i*24;
  doc.rect(ML,ey,CW,24).fill(i%2===0?G.white:G.g50);
  rr(ML+4,ey+5,34,14,4,e[0]==='POST'?G.blue:G.green);
  doc.font(F).fontSize(8).fillColor(G.white)
    .text(e[0],ML+4,ey+9,{align:'center',width:34,lineBreak:false});
  doc.font(MN).fontSize(8.5).fillColor(G.g900)
    .text(e[1],ML+46,ey+7,{lineBreak:false,width:180});
  clippedText(e[2],ML+234,ey+7,CW-196,12,
    {font:F,fontSize:8,fillColor:G.g600,lineBreak:false});
  ln(ML,ey+24,W-MR,ey+24,G.g200,0.2);
});
footer(11);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 12 — FORMULA EXAMPLES GALLERY
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Formula Examples Gallery');
y=72;
y=sec('📊','Formula Examples Gallery','12 formulas generated by Smart Hub AI from natural language',y);

const fC1=CW-200, fC2=110, fC3=90;
doc.rect(ML,y,CW,26).fill(G.green);
doc.font(F).fontSize(9.5).fillColor(G.white);
doc.text('Natural Language Input',ML+6,y+8,{lineBreak:false,width:fC1-8});
doc.text('Formula Generated',ML+fC1+6,y+8,{lineBreak:false,width:fC2-8});
doc.text('Category',ML+fC1+fC2+6,y+8,{lineBreak:false,width:fC3-6});
y+=26;

const fRows=[
  ['Overtime: hours over 40 × 1.5 rate',         '=IF(A1>40,(A1-40)*1.5,0)',        'Conditional','#D1FAE5','#065F46'],
  ['Grade: A+ above 90, B above 75, else C',      '=IFS(B1>=90,"A+",B1>=75,"B","C")','Conditional','#D1FAE5','#065F46'],
  ['Add 15% bonus if sales exceed 10,000',        '=IF(A1>10000,A1*1.15,A1)',        'Conditional','#D1FAE5','#065F46'],
  ['Find value in col A, return match from col B','=XLOOKUP(D1,A:A,B:B,"Not found")','Lookup',    '#DBEAFE','#1E40AF'],
  ['Look up product price from price list',       '=VLOOKUP(A2,Table1,3,0)',         'Lookup',    '#DBEAFE','#1E40AF'],
  ['Sum all sales greater than 1000',             '=SUMIF(C:C,">1000",D:D)',         'Statistical','#EDE9FE','#5B21B6'],
  ['Count students who scored 60 or higher',      '=COUNTIF(B:B,">=60")',            'Statistical','#EDE9FE','#5B21B6'],
  ['Rank employees by highest sales (descending)','=RANK(A1,A:A,0)',                 'Statistical','#EDE9FE','#5B21B6'],
  ['Monthly payment: 30-year loan at 5%',         '=PMT(0.05/12,360,A1)',            'Financial', '#FEF3C7','#92400E'],
  ['Compound interest over 10 years at 7%',       '=A1*(1+0.07)^10',                'Financial', '#FEF3C7','#92400E'],
  ['Calculate age in years from birth date A1',   '=DATEDIF(A1,TODAY(),"Y")',        'Date',      '#FCE7F3','#9D174D'],
  ['Count working days between two dates',        '=NETWORKDAYS(A1,B1)',             'Date',      '#FCE7F3','#9D174D'],
];
const rowH12=22;
fRows.forEach((r,i)=>{
  const ry=y+i*rowH12;
  doc.rect(ML,ry,CW,rowH12).fill(i%2===0?G.white:G.g50);
  clippedText(r[0],ML+6,ry+5,fC1-10,14,{font:F,fontSize:8.5,fillColor:G.g700,lineBreak:false});
  clippedText(r[1],ML+fC1+6,ry+6,fC2-10,12,{font:MN,fontSize:8,fillColor:G.gDk,lineBreak:false});
  rr(ML+fC1+fC2+6,ry+4,fC3-10,14,4,r[3]);
  clippedText(r[2],ML+fC1+fC2+6,ry+8,fC3-10,10,{font:F,fontSize:7.5,fillColor:r[4],align:'center',lineBreak:false});
  ln(ML,ry+rowH12,W-MR,ry+rowH12,G.g200,0.2);
});
y+=fRows.length*rowH12+12;

// Legend
const cats=[['Conditional','#D1FAE5','#065F46'],['Lookup','#DBEAFE','#1E40AF'],['Statistical','#EDE9FE','#5B21B6'],['Financial','#FEF3C7','#92400E'],['Date','#FCE7F3','#9D174D']];
rr(ML,y,CW,28,5,G.g50,G.g200);
doc.font(F).fontSize(8.5).fillColor(G.g600).text('Legend:',ML+10,y+8,{lineBreak:false});
let catX=ML+60;
cats.forEach(([n,bg,fg])=>{
  const cW=doc.font(F).fontSize(8).widthOfString(n)+16;
  rr(catX,y+7,cW,14,4,bg);
  doc.font(F).fontSize(8).fillColor(fg).text(n,catX,y+11,{align:'center',width:cW,lineBreak:false});
  catX+=cW+8;
});
y+=40;

rr(ML,y,CW,34,7,G.bLt,'#93C5FD');
doc.font(F).fontSize(16).text('💡',ML+10,y+7);
clippedText(
  'Confidence: Green >85% = high accuracy · Orange 50–85% = review your prompt · Red <50% = revise with more specific column references and conditions.',
  ML+38, y+8, CW-46, 22,
  {font:F, fontSize:9, fillColor:G.bDk, lineGap:2}
);
footer(12);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 13 — PROMPT WRITING TIPS
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Prompt Writing Best Practices');
y=72;
y=sec('✍️','Writing Effective Prompts','How to describe your calculation for the best AI results',y);

rr(ML,y,CW,50,8,G.gLt);
ln(ML,y,ML,y+50,G.green,3);
clippedText(
  'The quality of your formula prompt directly determines the accuracy and confidence of the AI result. Effective prompts are specific, include column or cell references, define conditions clearly, and state the expected output. This page shows how to write prompts that consistently produce 90%+ confidence scores.',
  ML+14, y+8, CW-24, 38,
  {font:F, fontSize:9.5, fillColor:G.g700, lineGap:2}
);
y+=62;

y=sec('✅','Prompts That Work Well','Examples of effective formula descriptions',y);
const good13=[
  {prompt:'If hours in A1 exceed 40, multiply the excess by 1.5 times the rate in B1',
   why:'Names cells (A1, B1), states the condition (>40), and the multiplier (1.5×)',
   score:'96%',formula:'=IF(A1>40,(A1-40)*B1*1.5,0)'},
  {prompt:'Look up the employee ID in column A and return their salary from column C',
   why:'Names both columns, defines the lookup key and the return column clearly',
   score:'94%',formula:'=XLOOKUP(F2,A:A,C:C,"Not found")'},
  {prompt:'Sum values in column D where corresponding values in column C exceed 1000',
   why:'Names both columns and clearly separates the condition column from the sum column',
   score:'97%',formula:'=SUMIF(C:C,">1000",D:D)'},
  {prompt:'Grade: if score in B2 >= 90 give A+, if >= 75 give B, otherwise give C',
   why:'States all grade boundaries explicitly and in the correct order for IFS',
   score:'99%',formula:'=IFS(B2>=90,"A+",B2>=75,"B",TRUE,"C")'},
];
const gH=56;
good13.forEach((g,i)=>{
  const gy=y+i*gH;
  rr(ML,gy,CW,gH-4,7,G.gLt,'#86EFAC');
  rr(ML,gy,CW,20,7,G.gLt,'#86EFAC');
  clippedText('✅  '+g.prompt,ML+10,gy+4,CW-100,14,
    {font:F,fontSize:9,fillColor:G.gDk,lineBreak:false});
  rr(W-MR-64,gy+4,58,14,5,G.green);
  doc.font(F).fontSize(8).fillColor(G.white)
    .text('Score: '+g.score,W-MR-64,gy+8,{align:'center',width:58,lineBreak:false});
  ln(ML,gy+20,W-MR,gy+20,'#86EFAC',0.4);
  clippedText('Why: '+g.why,ML+10,gy+24,CW/2-16,16,
    {font:F,fontSize:8,fillColor:G.g700,lineBreak:false});
  clippedText('→ '+g.formula,ML+CW/2,gy+24,CW/2-10,16,
    {font:MN,fontSize:8,fillColor:G.gDk,lineBreak:false});
});
y+=good13.length*gH+14;

y=sec('❌','Prompts to Avoid','Vague descriptions that produce low confidence',y);
const bad13=[
  {prompt:'Calculate something with numbers in column A',
   fix:'Name the operation and what the numbers represent'},
  {prompt:'Make a formula for employee data',
   fix:'Describe the exact calculation and name the columns'},
  {prompt:'Do a lookup thing',
   fix:'Specify: what to look up, where, and what to return'},
  {prompt:'Calculate tax',
   fix:'State the rate: "calculate 15% tax on the amount in A1"'},
];
const bW13=(CW-12)/2;
bad13.forEach((b,i)=>{
  const bX13=ML+(i%2)*(bW13+12), bY13=y+Math.floor(i/2)*52;
  rr(bX13,bY13,bW13,48,7,G.rLt,'#FECACA');
  clippedText('❌  "'+b.prompt+'"',bX13+10,bY13+7,bW13-18,14,
    {font:F,fontSize:8.5,fillColor:G.red,lineBreak:false});
  clippedText('Fix: '+b.fix,bX13+10,bY13+28,bW13-18,16,
    {font:F,fontSize:8.5,fillColor:G.g700,lineBreak:false});
});
footer(13);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 14 — CONFIDENCE SCORE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Confidence Score System');
y=72;
y=sec('📈','Confidence Score System','How SniperSheet measures and displays formula accuracy',y);

rr(ML,y,CW,56,8,G.gLt);
ln(ML,y,ML,y+56,G.green,3);
clippedText(
  'Every formula generated by Smart Hub includes a confidence score from 0 to 100%. The score is calculated by the AI model based on how clearly your prompt described the calculation, how well the formula matches the description, and the complexity of the formula pattern used. It is displayed as a colored badge next to the formula result.',
  ML+14, y+8, CW-24, 44,
  {font:F, fontSize:9.5, fillColor:G.g700, lineGap:2}
);
y+=68;

// 3 tiers — fixed height each
const tiers14=[
  {range:'85–100%',label:'High Confidence',col:G.green,bg:'#F0FDF4',bdr:'#86EFAC',
   meaning:'Formula is highly likely to be correct. Prompt was clear and specific. Use as-is.',
   signals:['Named specific columns or cells','Condition values stated explicitly','Formula type clearly implied','No Word Radar warnings'],
   example:'Score 97%: "sum D where C > 1000" → =SUMIF(C:C,">1000",D:D)'},
  {range:'50–84%',label:'Acceptable',col:G.amber,bg:'#FFFBEB',bdr:'#FCD34D',
   meaning:'Formula is likely correct but review before using. Prompt had some ambiguity.',
   signals:['Prompt was partially specific','Condition implied but not stated','Formula type inferred from context','Minor Word Radar warnings'],
   example:'Score 71%: "calculate bonus for sales" → =A1*1.15 (assumed 15%)'},
  {range:'0–49%',label:'Low Confidence',col:G.red,bg:'#FFF5F5',bdr:'#FECACA',
   meaning:'Formula may be incorrect. Revise prompt with specific column names and values.',
   signals:['Prompt was too vague or general','No columns, values, or conditions given','Multiple interpretations possible','Word Radar flagged unclear terms'],
   example:'Score 34%: "do something with data" → best-guess formula only'},
];
const tierH=114;
tiers14.forEach((t,i)=>{
  const ty14=y+i*(tierH+8);
  rr(ML,ty14,CW,tierH,8,t.bg,t.bdr);
  // left badge column
  rr(ML,ty14,72,tierH,8,t.bg,t.bdr);
  doc.rect(ML+72,ty14,1,tierH).fill(t.bdr);
  rr(ML+14,ty14+18,46,26,7,t.col);
  doc.font(F).fontSize(10).fillColor(G.white)
    .text(t.range,ML+14,ty14+25,{align:'center',width:46,lineBreak:false});
  doc.font(F).fontSize(8).fillColor(t.col)
    .text(t.label,ML+6,ty14+56,{align:'center',width:60,lineBreak:false});
  // right content
  clippedText(t.meaning,ML+82,ty14+8,CW-90,20,
    {font:F,fontSize:9,fillColor:G.g900,lineGap:1.5});
  let sY=ty14+34;
  t.signals.forEach(s=>{
    if(sY>ty14+tierH-24) return;
    doc.circle(ML+86,sY+4,2).fill(t.col);
    clippedText(s,ML+94,sY,CW-100,11,{font:F,fontSize:8,fillColor:G.g700,lineBreak:false});
    sY+=12;
  });
  clippedText(t.example,ML+82,ty14+tierH-18,CW-92,14,
    {font:MN,fontSize:7.5,fillColor:G.g600,lineBreak:false});
});
y+=3*(tierH+8)+10;

rr(ML,y,CW,34,6,'#EFF6FF',G.bLt);
doc.font(F).fontSize(16).text('💡',ML+10,y+7);
clippedText(
  'Word Radar runs before the AI call. It detects ambiguous terms, possible typos, and unclear references — showing yellow warnings with improvement suggestions before you submit.',
  ML+38, y+8, CW-46, 22,
  {font:F, fontSize:9, fillColor:G.bDk, lineGap:2}
);
footer(14);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 15 — INSTALLATION GUIDE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Installation Guide');
y=72;
y=sec('📥','Installation Guide','4 steps to load SniperSheet in Microsoft Excel',y);

const steps15=[
  {n:'1',title:'Download manifest.xml',
   desc:'Open your browser and go to the manifest URL:\nhttps://[your-replit-domain]/api/addin/manifest.xml\nThe file downloads automatically to your device.'},
  {n:'2',title:'Open Excel Add-ins Manager',
   desc:'In Microsoft Excel: click Insert → Add-ins → My Add-ins\n→ Manage My Add-ins at the bottom of the dropdown.'},
  {n:'3',title:'Upload manifest.xml',
   desc:'Click "Upload My Add-in" → select the manifest.xml file.\nThe SniperSheet tab will appear in the Excel Ribbon.'},
  {n:'4',title:'Open Smart Hub',
   desc:'Click the SniperSheet tab in the Ribbon → click\n"Open Sniper Hub". The task pane opens on the right side!'},
];
steps15.forEach((s,i)=>{
  const sy=y+i*60;
  doc.circle(ML+14,sy+24,13).fill(G.green);
  doc.font(F).fontSize(13).fillColor(G.white).text(s.n,ML+9,sy+17);
  rr(ML+36,sy,CW-36,54,6,G.g50,G.g200);
  doc.font(F).fontSize(11).fillColor(G.g900)
    .text(s.title,ML+52,sy+7,{lineBreak:false,width:CW-60});
  clippedText(s.desc,ML+52,sy+24,CW-60,26,
    {font:F,fontSize:9,fillColor:G.g600,lineGap:1.5});
});
y+=steps15.length*60+16;

y=sec('💻','System Requirements','Minimum requirements to run SniperSheet',y);
const reqs15=[
  ['Microsoft Excel','Excel 2016 or later','Office 365 recommended for full features'],
  ['Operating System','Windows 10/11 or macOS 12+','Required for Office.js task pane add-ins'],
  ['Internet','Required for AI features','Offline local engine works without internet'],
  ['Browser Engine','Edge WebView2 or Chrome','Handles the task pane embedded UI'],
  ['Screen Resolution','1280×720 minimum','Task pane needs at least 400px sidebar'],
];
const rW1=120,rW2=154,rW3=CW-rW1-rW2;
doc.rect(ML,y,CW,24).fill(G.green);
doc.font(F).fontSize(9.5).fillColor(G.white);
doc.text('Requirement',ML+8,y+7,{lineBreak:false,width:rW1});
doc.text('Value',ML+rW1+6,y+7,{lineBreak:false,width:rW2});
doc.text('Notes',ML+rW1+rW2+6,y+7,{lineBreak:false,width:rW3});
y+=24;
reqs15.forEach((r,i)=>{
  const ry=y+i*22;
  doc.rect(ML,ry,CW,22).fill(i%2===0?G.white:G.g50);
  clippedText(r[0],ML+8,ry+5,rW1-12,14,{font:F,fontSize:8.5,fillColor:G.g700,lineBreak:false});
  rr(ML+rW1+4,ry+4,rW2-6,14,4,G.gLt);
  clippedText(r[1],ML+rW1+4,ry+8,rW2-6,10,{font:F,fontSize:8,fillColor:G.gDk,align:'center',lineBreak:false});
  clippedText(r[2],ML+rW1+rW2+6,ry+5,rW3-8,14,{font:F,fontSize:8,fillColor:G.g600,lineBreak:false});
  ln(ML,ry+22,W-MR,ry+22,G.g200,0.2);
});
y+=reqs15.length*22+14;

rr(ML,y,CW,50,7,G.gDk);
doc.font(F).fontSize(10).fillColor(G.white)
  .text('📋  Manifest Download URL:',ML+14,y+8,{lineBreak:false});
clippedText(
  'https://8e832e48-8f9e-4168-9828-29c19ce7accc-00-12f81e1kjeof1.picard.replit.dev/api/addin/manifest.xml',
  ML+14, y+26, CW-24, 14,
  {font:MN, fontSize:8.5, fillColor:G.gold, lineBreak:false}
);
doc.font(F).fontSize(7.5).fillColor('rgba(255,255,255,0.55)')
  .text('Generated dynamically — always returns the latest version',ML+14,y+40,{lineBreak:false,width:CW-24});
footer(15);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 16 — FAQ
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Frequently Asked Questions');
y=72;
y=sec('❓','Frequently Asked Questions','8 common questions about SniperSheet answered',y);

const faqs=[
  {q:'Is SniperSheet 100% free?',
   a:'Yes. Groq free tier (Llama 3.3 70B, 30 RPM). The API key is on the developer\'s server. Users need no Groq account and pay nothing — ever.'},
  {q:'Do users in Iraq need a VPN?',
   a:'No. All AI requests route through a US Replit server. Users connect to Replit\'s HTTPS endpoint, never directly to Groq. No VPN needed.'},
  {q:'What if the AI is rate-limited?',
   a:'3-model cascade: if primary (Llama 3.3 70B) fails, it retries with Llama 3 70B, then Llama 3 8B. If all fail, the local engine activates.'},
  {q:'Does it work without internet?',
   a:'Yes — partially. The local engine handles 35+ patterns (SUM, IF, VLOOKUP…) offline at zero latency. AI features need internet.'},
  {q:'What Excel versions are supported?',
   a:'Excel 2016 and later on Windows and Mac. Office 365 recommended. Uses Office.js Manifest v1.1 with ReadWriteDocument permission.'},
  {q:'Can I type my request in Arabic?',
   a:'Yes. Arabic input is fully supported in Smart Hub. Type in Arabic and SniperSheet returns the formula with an Arabic explanation.'},
  {q:'How secure is my formula data?',
   a:'Sent over HTTPS to Replit, which forwards only the text prompt to Groq. No data stored. History exists only in browser session memory.'},
  {q:'Can SniperSheet write into Excel cells?',
   a:'Yes. ReadWriteDocument permission lets SniperSheet write formulas directly into the active cell. Click "Apply to Cell" after generation.'},
];
const fW=(CW-12)/2, fH=66;
faqs.forEach((f,i)=>{
  const fX=ML+(i%2)*(fW+12), fY=y+Math.floor(i/2)*(fH+8);
  rr(fX,fY,fW,fH,7,G.g50,G.g200);
  rr(fX,fY,fW,20,7,G.gLt,G.g200);
  doc.rect(fX,fY+12,fW,8).fill(G.gLt);
  clippedText(f.q,fX+10,fY+4,fW-18,14,
    {font:F,fontSize:8.5,fillColor:G.green,lineBreak:false});
  clippedText(f.a,fX+10,fY+24,fW-18,fH-30,
    {font:F,fontSize:8.5,fillColor:G.g700,lineGap:1.5});
});
footer(16);


// ─────────────────────────────────────────────────────────────────────────────
// PAGE 17 — DEVELOPER PROFILE & RIGHTS
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({size:'A4',margin:0});
hdr('Developer Profile & Rights');
y=72;
y=sec('👤','Developer Profile','The creator of SniperSheet',y);

// Developer card
rr(ML,y,CW,88,10,G.gDk);
doc.font(F).fontSize(42).text('🎯',ML+14,y+20,{lineBreak:false});
doc.font(F).fontSize(20).fillColor(G.white)
  .text('Mustafa Alsahlany',ML+80,y+16,{lineBreak:false,width:CW-160});
doc.font(F).fontSize(10).fillColor(G.white).fillOpacity(0.85)
  .text('Developer & Designer — SniperSheet Excel Add-in',ML+80,y+44,{lineBreak:false,width:CW-160});
doc.font(F).fontSize(9).fillColor(G.white).fillOpacity(0.7)
  .text('React, Express.js, TypeScript, Groq AI — Built on Replit',ML+80,y+62,{lineBreak:false,width:CW-160});
doc.font(F).fontSize(8.5).fillColor(G.gold).fillOpacity(0.9)
  .text('Iraq · 2026',ML+80,y+76,{lineBreak:false}); doc.fillOpacity(1);
['🌐 Replit — Active','🤖 Groq AI — Free Tier','📦 v1.0.0','📅 April 2026'].forEach((d,i)=>{
  doc.font(F).fontSize(9).fillColor(G.white).fillOpacity(0.85)
    .text(d,W-MR-170,y+14+i*18,{lineBreak:false,width:160}); doc.fillOpacity(1);
});
y+=100;

// Stack + Specs side by side
const sW17=(CW-12)/2;
const stackL17=[['🖥️ Frontend','React 18 + Vite + TypeScript'],['🌐 Backend','Express.js + Node.js 24'],['🤖 AI','Groq SDK — Llama 3.3 70B'],['🎨 Styling','Tailwind CSS + shadcn/ui'],['📦 Build','esbuild — CJS bundle'],['🔧 Packages','pnpm Monorepo Workspace']];
const stackR17=[['📋 Manifest','Office.js v1.1 Task Pane'],['🔑 Permission','ReadWriteDocument'],['🌍 Locale','ar-SA (primary) + en-US'],['☁️ Hosting','Replit Autoscale (US region)'],['🔒 Security','HTTPS / TLS 1.3'],['💻 Icons','16 · 32 · 64 · 80 px PNG']];
[[stackL17,ML],[stackR17,ML+sW17+12]].forEach(([items,sx])=>{
  const totalH=16+items.length*26;
  rr(sx,y,sW17,totalH,7,G.g50,G.g200);
  doc.font(F).fontSize(10).fillColor(G.green)
    .text('🛠  Technology Stack',sx+10,y+6,{lineBreak:false,width:sW17-18});
  items.forEach(([k,v],i)=>{
    const iy=y+22+i*26;
    ln(sx+8,iy,sx+sW17-8,iy,G.g200,0.3);
    doc.font(F).fontSize(8).fillColor(G.g600).text(k,sx+10,iy+4,{lineBreak:false,width:sW17/2-14});
    doc.font(F).fontSize(9.5).fillColor(G.g900).text(v,sx+10,iy+14,{lineBreak:false,width:sW17-18});
  });
  y=Math.max(y, y); // keep y aligned
});
y+=16+stackL17.length*26+14;

// Groq + Replit credits
const cW17=(CW-12)/2;
rr(ML,y,cW17,58,7,'#0F172A');
doc.font(F).fontSize(16).text('🤖',ML+12,y+12);
doc.font(F).fontSize(11).fillColor(G.white).text('Groq AI',ML+42,y+12,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor('rgba(255,255,255,0.7)')
  .text('Llama 3.3 70B · Free Tier · 30 RPM',ML+42,y+28,{lineBreak:false,width:cW17-50});
doc.font(F).fontSize(8).fillColor(G.green)
  .text('3-Model Cascade · LPU Hardware',ML+42,y+42,{lineBreak:false,width:cW17-50});

rr(ML+cW17+12,y,cW17,58,7,'#1C1C2E');
doc.font(F).fontSize(16).text('🖥️',ML+cW17+24,y+12);
doc.font(F).fontSize(11).fillColor(G.white).text('Replit',ML+cW17+54,y+12,{lineBreak:false});
doc.font(F).fontSize(8.5).fillColor('rgba(255,255,255,0.7)')
  .text('Autoscale · US Region · HTTPS',ML+cW17+54,y+28,{lineBreak:false,width:cW17-60});
doc.font(F).fontSize(8).fillColor('#7986CB')
  .text('Node.js 24 · Express.js · API Proxy',ML+cW17+54,y+42,{lineBreak:false,width:cW17-60});
y+=70;

// Copyright
rr(ML,y,CW,34,7,G.gDk);
doc.font(F).fontSize(9.5).fillColor(G.gold)
  .text('© 2026 Mustafa Alsahlany — All Rights Reserved',ML+12,y+7,{lineBreak:false,width:CW-20});
doc.font(F).fontSize(8).fillColor('rgba(255,255,255,0.6)')
  .text('SniperSheet v1.0 · Official English Guide · 17 Pages · Powered by Groq AI · Hosted on Replit',
    ML+12,y+22,{lineBreak:false,width:CW-20});
footer(17);

doc.end();
console.log('✅ SniperSheet_Official_Guide_EN.pdf — 17 pages — FINAL');
