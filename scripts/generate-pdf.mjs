import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "../SniperSheet_Brochure.pdf");

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  navy:    "#0B1E3D",
  navyMid: "#122848",
  navyLt:  "#1A3A60",
  gold:    "#C9A84C",
  goldLt:  "#E2C97E",
  white:   "#FFFFFF",
  offWhite:"#F4F7FB",
  slate:   "#8AA0BB",
  dark:    "#06111F",
  accent:  "#2B7FD4",
  green:   "#27AE60",
  red:     "#C0392B",
};

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title:   "SniperSheet - Professional Excel AI Add-in",
    Author:  "Mustafa Alsahlany",
    Subject: "Product Overview & Feature Guide",
    Keywords:"Excel, AI, Add-in, Formula, SniperSheet",
  },
});

doc.pipe(fs.createWriteStream(OUTPUT));

const W  = doc.page.width;   // 595.28
const H  = doc.page.height;  // 841.89
const ML = 48;
const MR = W - 48;
const TW = MR - ML;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, radius = 0) {
  doc.save().roundedRect(x, y, w, h, radius).fill(fill).restore();
}
function hLine(y, color = C.navyLt, opacity = 1) {
  doc.save().strokeColor(color).opacity(opacity).lineWidth(0.5)
     .moveTo(ML, y).lineTo(MR, y).stroke().restore();
}

// Colored badge — uses only Helvetica-safe text
function badge(text, x, y, bg = C.gold, fg = C.dark, size = 7.5) {
  doc.save().fontSize(size).font("Helvetica-Bold");
  const tw = doc.widthOfString(text);
  const pad = 5;
  const bw = tw + pad * 2;
  const bh = size + 6;
  doc.roundedRect(x, y, bw, bh, 3).fill(bg);
  doc.fillColor(fg).text(text, x + pad, y + 3, { lineBreak: false });
  doc.restore();
  return bw + 4;
}

// Circular icon badge with 2-3 letter abbreviation
function iconBadge(letters, x, y, r = 18, bg = C.gold, fg = C.dark) {
  doc.save().circle(x + r, y + r, r).fill(bg);
  const sz = letters.length > 2 ? 7 : 9;
  const tw = doc.fontSize(sz).font("Helvetica-Bold").widthOfString(letters);
  doc.fillColor(fg).text(letters, x + r - tw / 2, y + r - sz / 2 + 1, { lineBreak: false });
  doc.restore();
}

function sectionHeader(title, subtitle, y) {
  rect(0, y, W, 52, C.navyMid);
  rect(ML - 4, y + 10, 4, 32, C.gold, 2);
  doc.fillColor(C.gold).fontSize(15).font("Helvetica-Bold")
     .text(title, ML + 6, y + 12, { lineBreak: false, width: TW - 10 });
  if (subtitle) {
    doc.fillColor(C.slate).fontSize(8.5).font("Helvetica")
       .text(subtitle, ML + 6, y + 32, { lineBreak: false, width: TW - 10 });
  }
  return y + 52 + 10;
}

function featureCard(x, y, w, h, abbr, abbrBg, title, body) {
  rect(x, y, w, h, C.navyLt, 8);
  rect(x, y, w, 4, C.gold, 0);
  iconBadge(abbr, x + 10, y + 12, 15, abbrBg, C.dark);
  doc.fillColor(C.white).fontSize(9.5).font("Helvetica-Bold")
     .text(title, x + 44, y + 17, { width: w - 54, lineBreak: false });
  doc.fillColor(C.slate).fontSize(8).font("Helvetica")
     .text(body, x + 10, y + 45, { width: w - 20, height: h - 55, ellipsis: true });
}

function tableRowDraw(cols, widths, y, isHeader) {
  const rh = isHeader ? 22 : 18;
  if (isHeader) rect(ML, y, TW, rh, C.navyLt, 4);
  let x = ML;
  cols.forEach((col, i) => {
    doc.fillColor(isHeader ? C.gold : C.white)
       .fontSize(isHeader ? 8 : 7.5)
       .font(isHeader ? "Helvetica-Bold" : "Helvetica")
       .text(col, x + 5, y + (isHeader ? 7 : 5), {
         width: widths[i] - 10,
         lineBreak: false,
         ellipsis: true,
       });
    x += widths[i];
  });
  if (!isHeader) {
    doc.save().strokeColor(C.navyLt).opacity(0.5).lineWidth(0.3)
       .moveTo(ML, y + rh).lineTo(MR, y + rh).stroke().restore();
  }
  return rh;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1 — COVER
// ─────────────────────────────────────────────────────────────────────────────
rect(0, 0, W, H, C.navy);

// Decorative circles (pure geometric — no emoji)
doc.save().opacity(0.07).circle(W - 50, 100, 170).fill(C.accent).restore();
doc.save().opacity(0.05).circle(50, H - 80, 180).fill(C.gold).restore();
doc.save().opacity(0.03).circle(W / 2, H / 2, 260).fill(C.white).restore();

// Top gold stripe
rect(0, 0, W, 6, C.gold);

// Logo block
rect(ML, 50, 58, 58, C.gold, 10);
doc.fillColor(C.dark).fontSize(30).font("Helvetica-Bold")
   .text("S", ML + 13, 61, { lineBreak: false });
doc.fillColor(C.navyMid).fontSize(9).font("Helvetica-Bold")
   .text("SHEET", ML + 28, 83, { lineBreak: false });

doc.fillColor(C.white).fontSize(22).font("Helvetica-Bold")
   .text("SniperSheet", ML + 72, 56, { lineBreak: false });
doc.fillColor(C.gold).fontSize(10).font("Helvetica")
   .text("AI-Powered Excel Add-in", ML + 72, 82, { lineBreak: false });

hLine(126, C.navyLt, 1);

// Hero headline
doc.fillColor(C.white).fontSize(36).font("Helvetica-Bold")
   .text("Excel, Now Smarter.", ML, 158, { width: TW * 0.72, lineBreak: false });

doc.fillColor(C.gold).fontSize(16).font("Helvetica-Bold")
   .text("No Formulas. No Training.", ML, 210, { lineBreak: false });

doc.fillColor(C.slate).fontSize(10.5).font("Helvetica")
   .text(
     "SniperSheet brings Artificial Intelligence directly into Microsoft Excel.\nAnyone can work like a professional — from day one.",
     ML, 242, { width: TW * 0.70 }
   );

// Key stat badges (text only — no emoji)
const stats = ["AI-Powered", "1-3 sec Response", "Arabic + English", "Mouse-First", "Secure API"];
let bx = ML;
stats.forEach(s => { bx += badge(s, bx, 298, C.gold, C.dark, 7.5); });

// Mock task-pane panel
const panelY = 330;
const panelH = 320;
rect(ML, panelY, TW, panelH, C.navyLt, 12);
rect(ML, panelY, TW, 4, C.gold, 0);

// label
doc.fillColor(C.gold).fontSize(8).font("Helvetica-Bold")
   .text("LIVE PREVIEW", ML + 12, panelY + 14, { lineBreak: false });

// inner mock
const px = ML + 18, py = panelY + 36, pw = TW - 36;
const innerH = panelH - 52;
rect(px, py, pw, innerH, C.navy, 8);

// top bar
rect(px, py, pw, 28, C.navyMid, 0);
doc.fillColor(C.gold).fontSize(8.5).font("Helvetica-Bold")
   .text("SniperSheet  |  Smart Hub", px + 10, py + 9, { lineBreak: false });
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("AR | EN", px + pw - 36, py + 10, { lineBreak: false });

// selection info
rect(px + 10, py + 40, pw - 20, 20, C.navyLt, 4);
doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
   .text("Selection: B2:D15  (42 cells detected)", px + 14, py + 47, { lineBreak: false, width: pw - 30 });

// command input
rect(px + 10, py + 72, pw - 20, 28, C.navyMid, 4);
doc.fillColor(C.white).fontSize(8).font("Helvetica")
   .text("\"Highlight sales below 5000 in red, top 10 in green\"",
         px + 14, py + 82, { width: pw - 32, lineBreak: false, ellipsis: true });

// analyze button
rect(px + pw - 94, py + 112, 80, 20, C.gold, 5);
doc.fillColor(C.dark).fontSize(8).font("Helvetica-Bold")
   .text("Analyze  >>", px + pw - 82, py + 118, { lineBreak: false });

// result
rect(px + 10, py + 146, pw - 20, 44, C.navyLt, 4);
doc.fillColor(C.green).fontSize(8).font("Helvetica-Bold")
   .text("Success  -  Conditional formatting applied", px + 14, py + 154, { width: pw - 30, lineBreak: false, ellipsis: true });
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("42 cells updated  |  Below 5,000 = red  |  Top 10 = green",
         px + 14, py + 170, { width: pw - 30, lineBreak: false, ellipsis: true });

// Bottom strip
rect(0, H - 50, W, 50, C.dark);
hLine(H - 50, C.gold, 0.5);
doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
   .text("(c) 2025-2026 Mustafa Alsahlany  |  All Rights Reserved", ML, H - 26, { lineBreak: false });
doc.fillColor(C.gold).fontSize(7.5).font("Helvetica-Bold")
   .text("node-runner-mustafaalshlany.replit.app", MR - 218, H - 26, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — WHAT IS IT + WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

let cy = 28;
cy = sectionHeader("What Is SniperSheet?", "Purpose, Vision & How It Works", cy);

doc.fillColor(C.white).fontSize(10).font("Helvetica")
   .text(
     "SniperSheet is a professional Excel Add-in that embeds a full AI engine inside Microsoft Excel. Select cells, describe what you want in plain language, and the AI builds formulas, applies formatting, or analyzes data instantly — no expertise required.",
     ML, cy, { width: TW }
   );
cy += 50;

// Pull quote
rect(ML, cy, TW, 36, C.navyLt, 8);
rect(ML, cy, 4, 36, C.gold, 0);
doc.fillColor(C.gold).fontSize(11).font("Helvetica-Bold")
   .text('"Excel was already powerful. SniperSheet makes it human."', ML + 14, cy + 10, { width: TW - 24, lineBreak: false, ellipsis: true });
cy += 50;

hLine(cy, C.navyLt, 0.8);
cy += 14;

// 3-step workflow
doc.fillColor(C.gold).fontSize(13).font("Helvetica-Bold")
   .text("How It Works  -  3 Simple Steps", ML, cy);
cy += 22;

const steps = [
  { abbr: "1", title: "SELECT", body: "Click and drag in Excel to select any range. SniperSheet reads your selection address, size, and data types automatically." },
  { abbr: "2", title: "DESCRIBE", body: "Type your goal in plain Arabic or English. No formula syntax. No training. Just say what you want done." },
  { abbr: "3", title: "DONE", body: "Click Analyze. The AI responds in 1-3 seconds and applies the result — formula or formatting — directly to your sheet." },
];

const sw = (TW - 20) / 3;
steps.forEach((s, i) => {
  const sx = ML + i * (sw + 10);
  rect(sx, cy, sw, 106, C.navyLt, 8);
  rect(sx, cy, sw, 4, C.gold, 0);
  // number badge
  doc.save().circle(sx + sw / 2, cy + 26, 20).fill(C.gold).restore();
  doc.fillColor(C.dark).fontSize(16).font("Helvetica-Bold")
     .text(s.abbr, sx + sw / 2 - 5, cy + 18, { lineBreak: false });
  doc.fillColor(C.white).fontSize(9.5).font("Helvetica-Bold")
     .text(s.title, sx + 10, cy + 56, { width: sw - 20, align: "center" });
  doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
     .text(s.body, sx + 10, cy + 74, { width: sw - 20, height: 28, ellipsis: true });
});
cy += 122;

hLine(cy, C.navyLt, 0.8);
cy += 14;

// Example commands
doc.fillColor(C.gold).fontSize(13).font("Helvetica-Bold")
   .text("Real Command Examples", ML, cy);
cy += 20;

const w1 = 30, w2 = 210, w3 = TW - w1 - w2;
tableRowDraw(["LG", "YOUR COMMAND", "RESULT / ACTION"], [w1, w2, w3], cy, true);
cy += 22;

const examples = [
  ["EN", '"Calculate average salary per department"',      "=AVERAGEIF(B:B,E2,C:C) applied to range"],
  ["EN", '"Highlight all values below 50 in orange"',      "Conditional rule: LessThan 50 -> orange fill"],
  ["EN", '"Find employee name from ID in lookup table"',   "=VLOOKUP(A2,Sheet2!A:B,2,0) inserted"],
  ["AR", '"Ihtasib Ijmali Al-Mabee3at Li-Kul Mintaqa"',   "=SUMIF(A:A,D2,B:B) applied automatically"],
  ["AR", '"Lawn Al-Khana Ya\'l Aqal Min 100 Bil-Ahmar"',  "Conditional rule: LessThan 100 -> red fill"],
];
examples.forEach((e, ri) => {
  if (ri % 2 === 0) rect(ML, cy, TW, 18, "#091829", 0);
  const langBg = e[0] === "AR" ? C.gold : C.accent;
  badge(e[0], ML + 4, cy + 3, langBg, C.dark, 7);
  doc.fillColor(C.white).fontSize(7.5).font("Helvetica-Bold")
     .text(e[1], ML + w1 + 4, cy + 5, { width: w2 - 10, lineBreak: false, ellipsis: true });
  doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
     .text(e[2], ML + w1 + w2 + 4, cy + 5, { width: w3 - 10, lineBreak: false, ellipsis: true });
  cy += 18;
  doc.save().strokeColor(C.navyLt).opacity(0.4).lineWidth(0.3)
     .moveTo(ML, cy).lineTo(MR, cy).stroke().restore();
});
cy += 10;

hLine(cy, C.navyLt, 0.8);
cy += 14;

// Why no expertise needed
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Why Anyone Can Use It From Day One", ML, cy);
cy += 16;

const whys = [
  "No formula memorization required — just describe your goal in plain words",
  "Bilingual: understands commands in Arabic and English simultaneously",
  "Mouse selection is your primary input — Excel stays familiar",
  "Every action is explained in plain language after it is applied",
  "Errors are shown with clear guidance — not cryptic formula errors",
];
whys.forEach(w => {
  doc.save().circle(ML + 7, cy + 5, 3).fill(C.gold).restore();
  doc.fillColor(C.white).fontSize(9).font("Helvetica")
     .text(w, ML + 18, cy, { width: TW - 20, lineBreak: false, ellipsis: true });
  cy += 17;
});

// Footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("SniperSheet  |  (c) 2025-2026 Mustafa Alsahlany  |  All Rights Reserved  |  Page 2 of 6",
         ML, H - 18, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — CORE FEATURES
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

cy = 28;
cy = sectionHeader("Core Features", "Everything SniperSheet can do for you", cy);

const features = [
  { abbr: "AI",  bg: C.gold,   title: "Smart Hub",
    body: "Central AI command panel. Select cells, type your goal, click Analyze. Zero formula knowledge needed." },
  { abbr: "FX",  bg: C.accent, title: "Formula Engine",
    body: "Converts plain language into precise Excel formulas — SUM, IF, VLOOKUP, INDEX/MATCH, PMT, and 50+ more." },
  { abbr: "FMT", bg: "#8E44AD", title: "Smart Formatting",
    body: "Apply conditional colors, font styles, fills, number formats, and table styling from a single sentence." },
  { abbr: "AR",  bg: C.green,  title: "Bilingual  AR | EN",
    body: "Full Arabic RTL interface plus English. Commands understood in both languages simultaneously." },
  { abbr: "M1",  bg: C.gold,   title: "Mouse-First Workflow",
    body: "Select cells with your mouse — that IS your input. No cell references to type, no syntax to remember." },
  { abbr: "1s",  bg: C.accent, title: "1 to 3 Second Speed",
    body: "Powered by Groq ultra-fast AI inference. Typical response: under 2 seconds from click to applied result." },
  { abbr: "RDR", bg: "#8E44AD", title: "Word Radar Engine",
    body: "Local keyword detection pre-classifies intent before calling AI. Faster for common tasks, works offline." },
  { abbr: "SEC", bg: C.red,    title: "Secure API",
    body: "CORS-locked, rate-limited, token-authenticated. Your data is never stored after the request completes." },
];

const fc_cols = 2;
const fc_w = (TW - 10) / fc_cols;
const fc_h = 84;
const fc_gap = 8;

features.forEach((f, i) => {
  const col = i % fc_cols;
  const row = Math.floor(i / fc_cols);
  const fx = ML + col * (fc_w + 10);
  const fy = cy + row * (fc_h + fc_gap);
  featureCard(fx, fy, fc_w, fc_h, f.abbr, f.bg, f.title, f.body);
});
cy += Math.ceil(features.length / fc_cols) * (fc_h + fc_gap) + 6;

hLine(cy, C.navyLt, 0.6);
cy += 12;

// Formula categories
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Supported Formula Categories", ML, cy);
cy += 18;

const cats = [
  ["Math & Aggregation",  "SUM  AVERAGE  MAX  MIN  COUNT  SUBTOTAL"],
  ["Logical",             "IF  IFS  AND  OR  NOT  IFERROR  SWITCH"],
  ["Lookup & Reference",  "VLOOKUP  HLOOKUP  INDEX/MATCH  XLOOKUP"],
  ["Text Manipulation",   "CONCAT  LEFT  RIGHT  MID  TRIM  PROPER  TEXT"],
  ["Date & Time",         "TODAY  NOW  DATEDIF  NETWORKDAYS  YEAR  MONTH"],
  ["Statistical",         "COUNTIF  SUMIF  AVERAGEIF  RANK  PERCENTILE"],
  ["Financial",           "PMT  NPV  IRR  FV  PV  RATE"],
  ["Dynamic Array",       "FILTER  SORT  UNIQUE  SEQUENCE  XLOOKUP spill"],
];

const cw1 = 148, cw2 = TW - cw1;
tableRowDraw(["CATEGORY", "FORMULAS INCLUDED"], [cw1, cw2], cy, true);
cy += 22;
cats.forEach((r, ri) => {
  if (ri % 2 === 0) rect(ML, cy, TW, 18, "#091829", 0);
  doc.fillColor(C.gold).fontSize(8).font("Helvetica-Bold")
     .text(r[0], ML + 5, cy + 4, { width: cw1 - 8, lineBreak: false });
  doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
     .text(r[1], ML + cw1 + 4, cy + 4, { width: cw2 - 10, lineBreak: false, ellipsis: true });
  cy += 18;
  doc.save().strokeColor(C.navyLt).opacity(0.35).lineWidth(0.3)
     .moveTo(ML, cy).lineTo(MR, cy).stroke().restore();
});

// Footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("SniperSheet  |  (c) 2025-2026 Mustafa Alsahlany  |  All Rights Reserved  |  Page 3 of 6",
         ML, H - 18, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 4 — WHO IS IT FOR + COMPARISON + TECH
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

cy = 28;
cy = sectionHeader("Who Is SniperSheet For?", "Built for everyone — no expertise required", cy);

const audiences = [
  { abbr: "STU", bg: C.gold,   who: "Students",          desc: "Complete Excel assignments and data analysis without any formula knowledge." },
  { abbr: "BIZ", bg: C.accent, who: "Business Owners",   desc: "Build financial reports and dashboards without hiring consultants." },
  { abbr: "ACC", bg: C.green,  who: "Accountants",       desc: "Automate payroll, tax, and reconciliation calculations instantly." },
  { abbr: "HR",  bg: "#8E44AD",who: "HR Professionals",  desc: "Analyze attendance, performance, and payroll data with simple commands." },
  { abbr: "ENT", bg: C.red,    who: "Enterprises",       desc: "Standardize Excel across teams with no training overhead required." },
  { abbr: "DATA",bg: C.accent, who: "Data Analysts",     desc: "Generate complex formulas and conditional reports at conversational speed." },
];

const aw = (TW - 10) / 2;
const ah = 54;
audiences.forEach((a, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const ax = ML + col * (aw + 10);
  const ay = cy + row * (ah + 8);
  rect(ax, ay, aw, ah, C.navyLt, 6);
  rect(ax, ay, 3, ah, C.gold, 0);
  iconBadge(a.abbr, ax + 8, ay + 9, 14, a.bg, C.dark);
  doc.fillColor(C.white).fontSize(9.5).font("Helvetica-Bold")
     .text(a.who, ax + 44, ay + 10, { width: aw - 54, lineBreak: false });
  doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
     .text(a.desc, ax + 44, ay + 28, { width: aw - 54, height: 20, ellipsis: true });
});
cy += Math.ceil(audiences.length / 2) * (ah + 8) + 12;

hLine(cy, C.navyLt, 0.7);
cy += 12;

// Comparison table
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Traditional Excel  vs.  Excel + SniperSheet", ML, cy);
cy += 20;

const ct = TW / 2;
tableRowDraw(["TRADITIONAL EXCEL", "EXCEL + SNIPERSHSET"], [ct, ct], cy, true);
cy += 22;

const cmp = [
  ["Must know formula syntax",            "Type in plain Arabic or English"],
  ["Hours to build complex sheets",       "Done in minutes — often seconds"],
  ["English-only tools available",        "Full Arabic RTL + English bilingual"],
  ["Error-prone manual entry",            "AI validates and applies correctly"],
  ["Requires training and tutorials",     "Works on first use, zero learning curve"],
  ["Formatting needs many menu clicks",   "One sentence delivers instant result"],
  ["Static formulas typed by hand",       "Smart range-aware formula generation"],
  ["No context about your data",          "AI reads selection and adapts to it"],
];
cmp.forEach((r, ri) => {
  if (ri % 2 === 0) rect(ML, cy, TW, 18, "#091829", 0);
  doc.fillColor("#E57373").fontSize(7.5).font("Helvetica")
     .text("x  " + r[0], ML + 5, cy + 4, { width: ct - 10, lineBreak: false, ellipsis: true });
  doc.fillColor(C.green).fontSize(7.5).font("Helvetica")
     .text("v  " + r[1], ML + ct + 4, cy + 4, { width: ct - 10, lineBreak: false, ellipsis: true });
  cy += 18;
  doc.save().strokeColor(C.navyLt).opacity(0.35).lineWidth(0.3)
     .moveTo(ML, cy).lineTo(MR, cy).stroke().restore();
});
cy += 12;

hLine(cy, C.navyLt, 0.7);
cy += 12;

// Tech specs
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Technical Highlights", ML, cy);
cy += 18;

const specs = [
  ["AI Engine",        "Groq API  -  llama-3.3-70b-versatile (ultra-fast inference)"],
  ["Response Time",    "Average 1 to 3 seconds from click to applied result in Excel"],
  ["Platform",         "Microsoft Excel Desktop + Excel Online (Office Add-in API)"],
  ["Interface",        "400px Task Pane  -  React + TypeScript  -  Tailwind CSS"],
  ["Backend",          "Node.js  -  Express  -  Secure cloud hosting"],
  ["Languages",        "Arabic (RTL, full UI + AI)  -  English (full UI + AI)"],
  ["Security",         "CORS-locked  -  Rate-limited  -  App token  -  HTTPS only"],
  ["Offline Mode",     "Basic formatting detection via local Word Radar engine"],
];

const sw1 = 118, sw2 = TW - sw1;
specs.forEach((s, i) => {
  if (i % 2 === 0) rect(ML, cy, TW, 18, "#091829", 0);
  doc.fillColor(C.gold).fontSize(8).font("Helvetica-Bold")
     .text(s[0], ML + 5, cy + 4, { width: sw1 - 8, lineBreak: false });
  doc.fillColor(C.white).fontSize(7.5).font("Helvetica")
     .text(s[1], ML + sw1 + 4, cy + 4, { width: sw2 - 10, lineBreak: false, ellipsis: true });
  cy += 18;
  doc.save().strokeColor(C.navyLt).opacity(0.35).lineWidth(0.3)
     .moveTo(ML, cy).lineTo(MR, cy).stroke().restore();
});

// Footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("SniperSheet  |  (c) 2025-2026 Mustafa Alsahlany  |  All Rights Reserved  |  Page 4 of 6",
         ML, H - 18, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 5 — AI ENGINE DEEP DIVE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

cy = 28;
cy = sectionHeader("AI Engine  -  Deep Dive", "How SniperSheet intelligence works under the hood", cy);

doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("AI Request Pipeline", ML, cy);
cy += 18;

const pipeline = [
  { n: "01", title: "Mouse Selection",   desc: "User selects a range. Add-in captures: address, size, sample values, data types." },
  { n: "02", title: "Word Radar Scan",   desc: "Local keyword engine pre-classifies intent (formatting / formula / analysis) — no API call needed for simple tasks." },
  { n: "03", title: "Context Assembly",  desc: "AI receives: user prompt + selection metadata + data samples + detected language (AR or EN)." },
  { n: "04", title: "Groq Inference",    desc: "llama-3.3-70b processes context and returns structured JSON: formula, type, styleHints, explanation." },
  { n: "05", title: "Formula Insert",    desc: "Formula built into a range matrix and inserted via Office.js API — correct for every cell in the selection." },
  { n: "06", title: "Style Applied",     desc: "Style hints (colors, bold, conditional rules) are applied via Excel formatting API automatically." },
];

const pRowH = 54;
pipeline.forEach((p, i) => {
  const py2 = cy + i * (pRowH + 6);
  // number badge
  doc.save().circle(ML + 18, py2 + 16, 16).fill(C.gold).restore();
  doc.fillColor(C.dark).fontSize(9).font("Helvetica-Bold")
     .text(p.n, ML + 11, py2 + 11, { lineBreak: false });
  // card
  rect(ML + 44, py2, TW - 44, pRowH, C.navyLt, 6);
  rect(ML + 44, py2, 3, pRowH, C.gold, 0);
  doc.fillColor(C.white).fontSize(9.5).font("Helvetica-Bold")
     .text(p.title, ML + 54, py2 + 8, { width: TW - 64, lineBreak: false });
  doc.fillColor(C.slate).fontSize(8).font("Helvetica")
     .text(p.desc, ML + 54, py2 + 26, { width: TW - 64, height: 22, ellipsis: true });
  // connector dot
  if (i < pipeline.length - 1) {
    doc.save().strokeColor(C.gold).opacity(0.35).lineWidth(1)
       .dash(2, { space: 3 })
       .moveTo(ML + 18, py2 + 32).lineTo(ML + 18, py2 + pRowH + 6)
       .stroke().restore();
  }
});
cy += pipeline.length * (pRowH + 6) + 8;

hLine(cy, C.navyLt, 0.7);
cy += 12;

// JSON response structure
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Structured AI Response (JSON)", ML, cy);
cy += 16;

rect(ML, cy, TW, 88, C.dark, 8);
rect(ML, cy, 3, 88, C.accent, 0);
const jsonLines = [
  '{',
  '  "formula":      "=AVERAGEIF(B:B, E2, C:C)",',
  '  "formulaType":  "analytical",',
  '  "explanation":  "Average salary per department",',
  '  "styleHints": {',
  '     "fontBold": true,  "fillColor": "background"',
  '  }',
  '}',
];
jsonLines.forEach((line, i) => {
  doc.fillColor(C.goldLt).fontSize(7.5).font("Courier")
     .text(line, ML + 12, cy + 8 + i * 10, { lineBreak: false, width: TW - 24 });
});
cy += 100;

hLine(cy, C.navyLt, 0.7);
cy += 12;

// Conditional formatting intelligence
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Conditional Formatting Intelligence", ML, cy);
cy += 14;

doc.fillColor(C.white).fontSize(9).font("Helvetica")
   .text(
     "SniperSheet translates natural-language conditions into proper Excel conditional formatting rules that update dynamically as your data changes:",
     ML, cy, { width: TW }
   );
cy += 30;

const cfW1 = TW * 0.52, cfW2 = TW - cfW1;
tableRowDraw(["YOUR COMMAND", "EXCEL RULE CREATED"], [cfW1, cfW2], cy, true);
cy += 22;

const cfRows = [
  ['"Highlight values below 50"',            "LessThan 50  ->  orange fill"],
  ['"Color top 10 percent in green"',         "TopPercent 10  ->  green fill"],
  ['"Mark negative numbers red"',             "LessThan 0  ->  red fill + bold"],
  ['"Values below 100 in red (Arabic)"',      "LessThan 100  ->  red fill"],
  ['"Above average highlighted blue"',        "AboveAverage rule  ->  blue fill"],
];
cfRows.forEach((r, ri) => {
  if (ri % 2 === 0) rect(ML, cy, TW, 18, "#091829", 0);
  doc.fillColor(C.white).fontSize(7.5).font("Helvetica-Bold")
     .text(r[0], ML + 5, cy + 4, { width: cfW1 - 8, lineBreak: false, ellipsis: true });
  doc.fillColor(C.green).fontSize(7.5).font("Helvetica")
     .text("-> " + r[1], ML + cfW1 + 4, cy + 4, { width: cfW2 - 8, lineBreak: false, ellipsis: true });
  cy += 18;
  doc.save().strokeColor(C.navyLt).opacity(0.35).lineWidth(0.3)
     .moveTo(ML, cy).lineTo(MR, cy).stroke().restore();
});

// Footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("SniperSheet  |  (c) 2025-2026 Mustafa Alsahlany  |  All Rights Reserved  |  Page 5 of 6",
         ML, H - 18, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 6 — SECURITY + GET STARTED + CLOSING
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

cy = 28;
cy = sectionHeader("Security, Privacy & Getting Started", "", cy);

// Security
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Enterprise-Grade Security", ML, cy);
cy += 18;

const secItems = [
  { abbr: "CRS", bg: C.red,    title: "CORS Protection",
    desc: "API locked to the official SniperSheet domain only. Requests from any other origin are rejected." },
  { abbr: "LMT", bg: C.accent, title: "Rate Limiting",
    desc: "200 req / 15 min globally. 60 req / 15 min for AI endpoints. Prevents abuse and ensures fair usage." },
  { abbr: "TKN", bg: C.gold,   title: "App Token Auth",
    desc: "Every AI request requires a proprietary token. Direct API access without the Add-in is rejected." },
  { abbr: "PVT", bg: C.green,  title: "Data Privacy",
    desc: "Data is sent only when you click Analyze. Nothing is stored on the server after processing completes." },
  { abbr: "TLS", bg: "#8E44AD",title: "HTTPS Encryption",
    desc: "All communication is encrypted end-to-end via TLS. No plain-text transmission at any point." },
  { abbr: "CPY", bg: C.slate,  title: "Copyright Protection",
    desc: "Every API response includes copyright attribution headers — SniperSheet is a proprietary product." },
];

const si_w = (TW - 10) / 2;
const si_h = 60;
secItems.forEach((s, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const sx = ML + col * (si_w + 10);
  const sy = cy + row * (si_h + 8);
  rect(sx, sy, si_w, si_h, C.navyLt, 6);
  rect(sx, sy, 3, si_h, C.accent, 0);
  iconBadge(s.abbr, sx + 8, sy + 10, 13, s.bg, C.dark);
  doc.fillColor(C.white).fontSize(9).font("Helvetica-Bold")
     .text(s.title, sx + 42, sy + 10, { width: si_w - 52, lineBreak: false, ellipsis: true });
  doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
     .text(s.desc, sx + 42, sy + 28, { width: si_w - 52, height: 26, ellipsis: true });
});
cy += Math.ceil(secItems.length / 2) * (si_h + 8) + 12;

hLine(cy, C.navyLt, 0.7);
cy += 12;

// Getting Started
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Get Started in 60 Seconds", ML, cy);
cy += 16;

const gsteps = [
  "Open Microsoft Excel (Desktop or Excel Online)",
  "Go to  Insert  ->  Add-ins  ->  Upload My Add-in",
  "Upload the SniperSheet manifest XML file",
  "The SniperSheet task pane appears on the right side",
  "Select any cells, type your goal, click Analyze",
  "Excel does the work — formula applied in seconds",
];
gsteps.forEach((s, i) => {
  const rowBg = i % 2 === 0 ? C.navyLt : C.navyMid;
  rect(ML, cy, TW, 22, rowBg, 4);
  rect(ML, cy, 26, 22, C.gold, 4);
  doc.fillColor(C.dark).fontSize(9).font("Helvetica-Bold")
     .text(String(i + 1), ML + 9, cy + 6, { lineBreak: false });
  doc.fillColor(C.white).fontSize(8.5).font("Helvetica")
     .text(s, ML + 34, cy + 6, { width: TW - 44, lineBreak: false, ellipsis: true });
  cy += 24;
});
cy += 10;

hLine(cy, C.navyLt, 0.7);
cy += 12;

// Closing CTA
rect(ML, cy, TW, 78, C.navyLt, 10);
rect(ML, cy, TW, 4, C.gold, 0);
doc.fillColor(C.white).fontSize(13).font("Helvetica-Bold")
   .text("Ready to Transform Your Excel Experience?", ML + 16, cy + 16, { width: TW - 32 });
doc.fillColor(C.slate).fontSize(9).font("Helvetica")
   .text(
     "SniperSheet is the fastest way to turn any Excel task into a one-sentence command.\nNo formulas. No training. No limits.",
     ML + 16, cy + 42, { width: TW - 32 }
   );
cy += 92;

// Contact block
rect(ML, cy, TW, 50, C.dark, 8);
rect(ML, cy, TW, 2, C.gold, 0);
doc.fillColor(C.gold).fontSize(11).font("Helvetica-Bold")
   .text("SniperSheet", ML + 14, cy + 10, { lineBreak: false });
doc.fillColor(C.slate).fontSize(9).font("Helvetica")
   .text("Developed by Mustafa Alsahlany", ML + 14, cy + 28, { lineBreak: false });
doc.fillColor(C.accent).fontSize(9).font("Helvetica")
   .text("node-runner-mustafaalshlany.replit.app", MR - 230, cy + 28, { lineBreak: false });

// Final footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("SniperSheet  |  (c) 2025-2026 Mustafa Alsahlany  |  All Rights Reserved  |  Unauthorized distribution prohibited.",
         ML, H - 18, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
doc.end();
console.log("PDF generated ->", OUTPUT);
