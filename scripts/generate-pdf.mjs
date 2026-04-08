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
  red:     "#E74C3C",
};

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title:   "SniperSheet – Professional Excel AI Add-in",
    Author:  "Mustafa Alsahlany",
    Subject: "Product Overview & Feature Guide",
    Keywords:"Excel, AI, Add-in, Formula, SniperSheet",
  },
});

doc.pipe(fs.createWriteStream(OUTPUT));

const W  = doc.page.width;   // 595.28
const H  = doc.page.height;  // 841.89
const ML = 48;               // margin left
const MR = W - 48;           // margin right
const TW = MR - ML;          // text width

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
function tag(text, x, y, bg = C.gold, fg = C.dark, size = 8) {
  const pad = 6;
  doc.save().fontSize(size).font("Helvetica-Bold");
  const tw = doc.widthOfString(text) + pad * 2;
  doc.roundedRect(x, y - 2, tw, 16, 3).fill(bg);
  doc.fillColor(fg).text(text, x + pad, y + 1, { lineBreak: false });
  doc.restore();
  return tw + 6;
}
function bullet(text, x, y, width, color = C.gold) {
  doc.save();
  doc.circle(x + 6, y + 5.5, 3).fill(color);
  doc.fillColor(C.white).fontSize(9.5).font("Helvetica")
     .text(text, x + 16, y, { width: width - 20, lineBreak: true });
  const h = doc.heightOfString(text, { width: width - 20 });
  doc.restore();
  return Math.max(h, 12) + 4;
}
function sectionHeader(title, subtitle, y) {
  rect(0, y, W, 56, C.navyMid);
  const bar = 4;
  rect(ML - bar, y + 12, bar, 32, C.gold, 2);
  doc.fillColor(C.gold).fontSize(16).font("Helvetica-Bold")
     .text(title, ML + 4, y + 13, { lineBreak: false });
  if (subtitle) {
    doc.fillColor(C.slate).fontSize(9).font("Helvetica")
       .text(subtitle, ML + 4, y + 34, { lineBreak: false });
  }
  return y + 56 + 10;
}
function featureCard(x, y, w, h, icon, title, body) {
  rect(x, y, w, h, C.navyLt, 8);
  doc.save();
  rect(x, y, w, 4, C.gold, 0);
  doc.fillColor(C.gold).fontSize(18).font("Helvetica-Bold")
     .text(icon, x + 12, y + 14, { lineBreak: false });
  doc.fillColor(C.white).fontSize(10).font("Helvetica-Bold")
     .text(title, x + 12, y + 38, { width: w - 24, lineBreak: false });
  doc.fillColor(C.slate).fontSize(8.5).font("Helvetica")
     .text(body, x + 12, y + 54, { width: w - 24 });
  doc.restore();
}
function tableRow(cols, y, widths, isHeader = false) {
  const bg = isHeader ? C.navyLt : "none";
  let x = ML;
  const rh = isHeader ? 22 : 18;
  if (isHeader) rect(ML, y, TW, rh, C.navyLt, 4);
  cols.forEach((col, i) => {
    doc.fillColor(isHeader ? C.gold : C.white)
       .fontSize(isHeader ? 8.5 : 8)
       .font(isHeader ? "Helvetica-Bold" : "Helvetica")
       .text(col, x + 6, y + (isHeader ? 7 : 5), { width: widths[i] - 10, lineBreak: false });
    x += widths[i];
  });
  if (!isHeader) {
    doc.save().strokeColor(C.navyLt).opacity(0.6).lineWidth(0.3)
       .moveTo(ML, y + rh).lineTo(MR, y + rh).stroke().restore();
  }
  return rh;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1 — COVER
// ─────────────────────────────────────────────────────────────────────────────
rect(0, 0, W, H, C.navy);

// decorative circles
doc.save().opacity(0.06).circle(W - 40, 120, 160).fill(C.accent);
doc.circle(60, H - 60, 200).fill(C.gold).restore();
doc.save().opacity(0.04).circle(W / 2, H / 2, 280).fill(C.white).restore();

// top stripe
rect(0, 0, W, 6, C.gold);

// LOGO area
rect(ML, 52, 56, 56, C.gold, 10);
doc.fillColor(C.dark).fontSize(28).font("Helvetica-Bold")
   .text("S", ML + 14, 64, { lineBreak: false });
doc.fillColor(C.navy).fontSize(10).font("Helvetica-Bold")
   .text("SHEET", ML + 28, 83, { lineBreak: false });

doc.fillColor(C.white).fontSize(22).font("Helvetica-Bold")
   .text("SniperSheet", ML + 68, 58, { lineBreak: false });
doc.fillColor(C.gold).fontSize(10).font("Helvetica")
   .text("AI-Powered Excel Add-in", ML + 68, 85, { lineBreak: false });

hLine(128, C.navyLt, 1);

// hero headline
doc.fillColor(C.white).fontSize(38).font("Helvetica-Bold")
   .text("Excel, Now Smarter.", ML, 165, { width: TW * 0.7 });

doc.fillColor(C.gold).fontSize(18).font("Helvetica-Bold")
   .text("No Formulas. No Training.", ML, 255, { lineBreak: false });

doc.fillColor(C.slate).fontSize(12).font("Helvetica")
   .text(
     "SniperSheet brings the power of Artificial Intelligence directly\ninto Microsoft Excel — so anyone can work like a professional,\nfrom day one.",
     ML, 290, { width: TW * 0.68 }
   );

// key badges row
const badges = ["🤖  AI-Powered", "⚡  1-3 sec", "🌐  AR | EN", "🖱  Mouse-First", "🔒  Secure"];
let bx = ML;
badges.forEach(b => { bx += tag(b, bx, 385) + 4; });

// big visual panel
rect(ML, 420, TW, 280, C.navyLt, 12);
rect(ML, 420, TW, 4, C.gold, 0);

// mock task-pane inside the panel
const px = ML + 20, py = 440, pw = TW - 40, ph = 240;
rect(px, py, pw, ph, C.navy, 8);
rect(px, py, pw, 30, C.navyMid, 0);
doc.fillColor(C.gold).fontSize(9).font("Helvetica-Bold")
   .text("SniperSheet  |  Smart Hub", px + 10, py + 10, { lineBreak: false });
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("AR | EN", px + pw - 40, py + 11, { lineBreak: false });

rect(px + 10, py + 44, pw - 20, 20, C.navyLt, 4);
doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
   .text("Selected: B2:D15  (42 cells)", px + 16, py + 51, { lineBreak: false });

rect(px + 10, py + 76, pw - 20, 30, C.navyMid, 4);
doc.fillColor(C.white).fontSize(8).font("Helvetica")
   .text("\"Highlight sales below 5000 in red, top 10 in green\"", px + 16, py + 85, { width: pw - 36 });

rect(px + pw - 96, py + 118, 80, 20, C.gold, 4);
doc.fillColor(C.dark).fontSize(8).font("Helvetica-Bold")
   .text("Analyze →", px + pw - 84, py + 124, { lineBreak: false });

rect(px + 10, py + 152, pw - 20, 42, C.navyLt, 4);
doc.fillColor(C.green).fontSize(7.5).font("Helvetica-Bold")
   .text("✓  Conditional formatting applied — 42 cells updated", px + 16, py + 160, { width: pw - 36 });
doc.fillColor(C.slate).fontSize(7).font("Helvetica")
   .text("Cells below 5,000 → red fill  |  Top 10 values → green fill", px + 16, py + 176, { width: pw - 36 });

// bottom cover info
rect(0, H - 56, W, 56, C.dark);
hLine(H - 56, C.gold, 0.5);
doc.fillColor(C.slate).fontSize(8).font("Helvetica")
   .text("© 2025–2026 Mustafa Alsahlany  ·  All Rights Reserved", ML, H - 36, { lineBreak: false });
doc.fillColor(C.gold).fontSize(8).font("Helvetica-Bold")
   .text("node-runner-mustafaalshlany.replit.app", MR - 200, H - 36, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — WHAT IS SNIPERSHHET + WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

let cy = 30;

// About
cy = sectionHeader("What Is SniperSheet?", "Purpose & Vision", cy);

doc.fillColor(C.white).fontSize(10.5).font("Helvetica")
   .text(
     "SniperSheet is a professional Excel Add-in that embeds a full AI engine inside Microsoft Excel. You select cells, describe what you want in plain language — and the AI builds the formula, applies formatting, or analyzes data for you — instantly.",
     ML, cy, { width: TW }
   );
cy += 52;

doc.fillColor(C.gold).fontSize(11).font("Helvetica-Bold")
   .text("\u201CExcel was already powerful. SniperSheet makes it human.\u201D", ML + 20, cy, { width: TW - 40 });
cy += 36;

hLine(cy, C.navyLt, 0.8);
cy += 16;

// 3-step workflow
doc.fillColor(C.gold).fontSize(13).font("Helvetica-Bold")
   .text("How It Works — 3 Simple Steps", ML, cy);
cy += 26;

const steps = [
  { n: "1", icon: "🖱", title: "Select", body: "Click and drag to select any cells in your spreadsheet. SniperSheet reads your selection automatically." },
  { n: "2", icon: "💬", title: "Describe", body: "Type what you want in plain Arabic or English. No formula knowledge required whatsoever." },
  { n: "3", icon: "⚡", title: "Done", body: "Click Analyze. The AI processes your request in 1–3 seconds and applies the result directly to Excel." },
];

const sw = (TW - 20) / 3;
steps.forEach((s, i) => {
  const sx = ML + i * (sw + 10);
  rect(sx, cy, sw, 110, C.navyLt, 8);
  rect(sx, cy, sw, 4, C.gold, 0);
  rect(sx + sw / 2 - 18, cy + 14, 36, 36, C.gold, 18);
  doc.fillColor(C.dark).fontSize(18).font("Helvetica-Bold")
     .text(s.n, sx + sw / 2 - 6, cy + 22, { lineBreak: false });
  doc.fillColor(C.white).fontSize(10.5).font("Helvetica-Bold")
     .text(s.icon + "  " + s.title, sx + 10, cy + 58, { width: sw - 20, lineBreak: false });
  doc.fillColor(C.slate).fontSize(8.5).font("Helvetica")
     .text(s.body, sx + 10, cy + 76, { width: sw - 20 });
});
cy += 126;

hLine(cy, C.navyLt, 0.8);
cy += 16;

// Example commands block
doc.fillColor(C.gold).fontSize(13).font("Helvetica-Bold")
   .text("Real Command Examples", ML, cy);
cy += 22;

const examples = [
  { lang: "EN", cmd: "\"Calculate the average salary per department\"",         result: "=AVERAGEIF(B:B, E2, C:C)  →  applied to E2:E20" },
  { lang: "EN", cmd: "\"Highlight all values below 50 in orange\"",            result: "Conditional formatting rule applied — 42 cells updated" },
  { lang: "EN", cmd: "\"Find employee name from ID using lookup table\"",       result: "=VLOOKUP(A2, Sheet2!A:B, 2, 0)  →  inserted" },
  { lang: "AR", cmd: "\"احسب إجمالي المبيعات لكل منطقة\"",                    result: "=SUMIF(A:A, D2, B:B)  →  applied automatically" },
  { lang: "AR", cmd: "\"لون الخلايا الأقل من 100 باللون الأحمر\"",             result: "Conditional color rule  →  LessThan 100 → red fill" },
];

const ew1 = 34, ew2 = 200, ew3 = TW - ew1 - ew2 - 12;
tableRow(["LANG", "YOUR COMMAND", "RESULT"], cy, [ew1, ew2, ew3], true);
cy += 22;
examples.forEach(e => {
  rect(ML, cy, TW, 18, "none", 0);
  const langCol = e.lang === "AR" ? C.gold : C.accent;
  tag(e.lang, ML + 6, cy + 2, langCol, C.dark, 7);
  doc.fillColor(C.white).fontSize(7.5).font("Helvetica-Bold")
     .text(e.cmd, ML + ew1 + 4, cy + 4, { width: ew2 - 10, lineBreak: false });
  doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
     .text(e.result, ML + ew1 + ew2 + 4, cy + 4, { width: ew3 - 10, lineBreak: false });
  cy += tableRow([], cy, [], false);
});
cy += 8;

// Bottom bar
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
   .text("SniperSheet  ·  © 2025–2026 Mustafa Alsahlany  ·  All Rights Reserved  ·  Page 2", ML, H - 20, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — CORE FEATURES
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

cy = 30;
cy = sectionHeader("Core Features", "Everything SniperSheet can do for you", cy);

const features = [
  { icon: "🧠", title: "Smart Hub",          body: "Central AI command panel. Select cells, type your goal, get instant results. Zero formula knowledge needed." },
  { icon: "🔢", title: "Formula Engine",      body: "Converts natural language into precise Excel formulas — SUM, IF, VLOOKUP, INDEX/MATCH, PMT, and 50+ more." },
  { icon: "🎨", title: "Smart Formatting",    body: "Apply conditional colors, font styles, fills, number formats, and table styling — all from a single sentence." },
  { icon: "🌐", title: "Bilingual AR | EN",   body: "Full Arabic RTL interface + English. Commands understood in both languages simultaneously. First of its kind." },
  { icon: "🖱", title: "Mouse-First",         body: "Select cells with your mouse — that IS your input. No cell references to type, no syntax to remember." },
  { icon: "⚡", title: "1–3 Second Speed",    body: "Powered by Groq's ultra-fast AI inference. Typical response: under 2 seconds from click to applied result." },
  { icon: "📡", title: "Word Radar",          body: "Local intent detection engine. Recognizes Arabic and English keywords before calling AI — faster for common tasks." },
  { icon: "🔒", title: "Secure API",          body: "CORS-locked, rate-limited, token-authenticated backend. Your data is never stored after the request completes." },
];

const fc_w = (TW - 10) / 2;
const fc_h = 90;
features.forEach((f, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const fx = ML + col * (fc_w + 10);
  const fy = cy + row * (fc_h + 10);
  featureCard(fx, fy, fc_w, fc_h, f.icon, f.title, f.body);
});
cy += Math.ceil(features.length / 2) * (fc_h + 10) + 10;

hLine(cy, C.navyLt, 0.6);
cy += 14;

// Formula categories
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Supported Formula Categories", ML, cy);
cy += 20;

const cats = [
  ["Math & Aggregation",   "SUM · AVERAGE · MAX · MIN · COUNT · SUBTOTAL"],
  ["Logical",              "IF · IFS · AND · OR · NOT · IFERROR · SWITCH"],
  ["Lookup & Reference",   "VLOOKUP · HLOOKUP · INDEX/MATCH · XLOOKUP · OFFSET"],
  ["Text Manipulation",    "CONCATENATE · LEFT · RIGHT · MID · TRIM · PROPER · TEXT"],
  ["Date & Time",          "TODAY · NOW · DATEDIF · NETWORKDAYS · YEAR · MONTH"],
  ["Statistical",          "COUNTIF · SUMIF · AVERAGEIF · RANK · PERCENTILE · STDEV"],
  ["Financial",            "PMT · NPV · IRR · FV · PV · RATE"],
  ["Dynamic / Array",      "FILTER · SORT · UNIQUE · SEQUENCE · XLOOKUP spill ranges"],
];

const cw1 = 150, cw2 = TW - cw1;
tableRow(["CATEGORY", "FORMULAS INCLUDED"], cy, [cw1, cw2], true);
cy += 22;
cats.forEach(r => {
  doc.fillColor(C.gold).fontSize(8).font("Helvetica-Bold")
     .text(r[0], ML + 6, cy + 4, { width: cw1 - 10, lineBreak: false });
  doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
     .text(r[1], ML + cw1 + 4, cy + 4, { width: cw2 - 10, lineBreak: false });
  cy += tableRow([], cy, [], false);
});

// Footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
   .text("SniperSheet  ·  © 2025–2026 Mustafa Alsahlany  ·  All Rights Reserved  ·  Page 3", ML, H - 20, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 4 — WHO IS IT FOR + COMPARISON + TECH
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

cy = 30;
cy = sectionHeader("Who Is SniperSheet For?", "Built for everyone — no expertise required", cy);

const audiences = [
  { icon: "🎓", who: "Students",           desc: "Complete Excel assignments, data analysis, and projects without formula knowledge." },
  { icon: "💼", who: "Business Owners",    desc: "Build financial reports, dashboards, and trackers without hiring consultants." },
  { icon: "🧾", who: "Accountants",        desc: "Automate repetitive calculations — payroll, tax, reconciliation — instantly." },
  { icon: "👥", who: "HR Professionals",   desc: "Analyze attendance, payroll, and performance data with simple commands." },
  { icon: "🏢", who: "Enterprises",        desc: "Standardize Excel operations across teams — no training overhead required." },
  { icon: "📊", who: "Analysts",           desc: "Generate complex formulas and conditional reports at conversational speed." },
];

const aw = (TW - 10) / 2;
audiences.forEach((a, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const ax = ML + col * (aw + 10);
  const ay = cy + row * 58;
  rect(ax, ay, aw, 50, C.navyLt, 6);
  rect(ax, ay, 4, 50, C.gold, 0);
  doc.fillColor(C.white).fontSize(10).font("Helvetica-Bold")
     .text(a.icon + "  " + a.who, ax + 14, ay + 8, { width: aw - 24, lineBreak: false });
  doc.fillColor(C.slate).fontSize(8).font("Helvetica")
     .text(a.desc, ax + 14, ay + 27, { width: aw - 24 });
});
cy += Math.ceil(audiences.length / 2) * 58 + 12;

hLine(cy, C.navyLt, 0.7);
cy += 14;

// Comparison table
doc.fillColor(C.gold).fontSize(13).font("Helvetica-Bold")
   .text("Traditional Excel vs Excel + SniperSheet", ML, cy);
cy += 22;

const cmp = [
  ["Traditional Excel",                "Excel + SniperSheet"],
  ["Must know formula syntax",         "Type in plain Arabic or English"],
  ["Hours to build complex sheets",    "Minutes — often seconds"],
  ["English-only tools available",     "Full Arabic RTL + English bilingual"],
  ["Error-prone manual entry",         "AI validates and applies correctly"],
  ["Requires training / tutorials",    "Works on first use, zero learning curve"],
  ["Formatting = many menu clicks",    "One sentence → instant result"],
  ["Static formulas by hand",          "Smart range-aware formula generation"],
  ["No context about your data",       "AI reads your selection and adapts"],
];

const ct1 = TW / 2, ct2 = TW / 2;
tableRow(cmp[0], cy, [ct1, ct2], true);
cy += 22;
cmp.slice(1).forEach((r, ri) => {
  if (ri % 2 === 0) rect(ML, cy, TW, 18, "#091829", 0);
  doc.fillColor("#E57373").fontSize(8).font("Helvetica")
     .text("✗  " + r[0], ML + 6, cy + 4, { width: ct1 - 12, lineBreak: false });
  doc.fillColor(C.green).fontSize(8).font("Helvetica")
     .text("✓  " + r[1], ML + ct1 + 4, cy + 4, { width: ct2 - 10, lineBreak: false });
  cy += tableRow([], cy, [], false);
});
cy += 12;

hLine(cy, C.navyLt, 0.7);
cy += 14;

// Tech specs
doc.fillColor(C.gold).fontSize(13).font("Helvetica-Bold")
   .text("Technical Highlights", ML, cy);
cy += 20;

const specs = [
  ["AI Engine",        "Groq API · llama-3.3-70b-versatile (ultra-fast inference)"],
  ["Response Time",    "Average 1–3 seconds from click to applied result in Excel"],
  ["Platform",         "Microsoft Excel Desktop + Excel Online (Office Add-in API)"],
  ["Interface",        "400px Task Pane · React + TypeScript · Tailwind CSS"],
  ["Backend",          "Node.js · Express · Secure cloud hosting"],
  ["Languages",        "Arabic (RTL, full UI + AI) · English (LTR, full UI + AI)"],
  ["Security",         "CORS-locked · Rate-limited · App token · HTTPS only"],
  ["Offline Ops",      "Basic formatting detection via local Word Radar (no internet)"],
];

const sw1 = 120, sw2 = TW - sw1;
specs.forEach(s => {
  doc.fillColor(C.gold).fontSize(8.5).font("Helvetica-Bold")
     .text(s[0], ML, cy + 3, { width: sw1, lineBreak: false });
  doc.fillColor(C.white).fontSize(8.5).font("Helvetica")
     .text(s[1], ML + sw1, cy + 3, { width: sw2, lineBreak: false });
  hLine(cy + 17, C.navyLt, 0.4);
  cy += 18;
});

// Footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
   .text("SniperSheet  ·  © 2025–2026 Mustafa Alsahlany  ·  All Rights Reserved  ·  Page 4", ML, H - 20, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 5 — AI ENGINE DEEP DIVE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

cy = 30;
cy = sectionHeader("AI Engine — Deep Dive", "How SniperSheet's intelligence works", cy);

// AI flow
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("AI Request Pipeline", ML, cy);
cy += 20;

const pipeline = [
  { step: "01", title: "Mouse Selection",    desc: "User selects a range. SniperSheet captures address, size, sample values, and data types." },
  { step: "02", title: "Word Radar Scan",    desc: "Local keyword engine pre-classifies intent (formatting / formula / analysis) — no API call needed for simple tasks." },
  { step: "03", title: "Context Assembly",   desc: "AI receives: user prompt + selection metadata + data samples + detected language (AR/EN)." },
  { step: "04", title: "Groq Inference",     desc: "llama-3.3-70b processes the context and returns a structured JSON: formula, type, styleHints, explanation." },
  { step: "05", title: "Formula Insertion",  desc: "Formula is built into a range matrix and inserted via Office.js — correct for every cell in the selection." },
  { step: "06", title: "Style Application",  desc: "Style hints (colors, bold, conditional rules) are applied via Excel's formatting API automatically." },
];

pipeline.forEach((p, i) => {
  const px2 = ML, py2 = cy + i * 62;
  rect(px2, py2, 36, 36, C.gold, 18);
  doc.fillColor(C.dark).fontSize(10).font("Helvetica-Bold")
     .text(p.step, px2 + 6, py2 + 11, { lineBreak: false });
  rect(px2 + 46, py2, TW - 46, 52, C.navyLt, 6);
  rect(px2 + 46, py2, 3, 52, C.gold, 0);
  doc.fillColor(C.white).fontSize(10).font("Helvetica-Bold")
     .text(p.title, px2 + 58, py2 + 8, { lineBreak: false });
  doc.fillColor(C.slate).fontSize(8.5).font("Helvetica")
     .text(p.desc, px2 + 58, py2 + 26, { width: TW - 70 });
  // connector
  if (i < pipeline.length - 1) {
    doc.save().strokeColor(C.gold).opacity(0.4).lineWidth(1)
       .dash(3, { space: 3 })
       .moveTo(px2 + 18, py2 + 36).lineTo(px2 + 18, py2 + 62)
       .stroke().restore();
  }
});
cy += pipeline.length * 62 + 10;

hLine(cy, C.navyLt, 0.7);
cy += 14;

// AI Response structure
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("What the AI Returns (Structured JSON)", ML, cy);
cy += 18;

rect(ML, cy, TW, 90, C.dark, 6);
rect(ML, cy, 3, 90, C.accent, 0);
const jsonSample = `{
  "formula":      "=AVERAGEIF(B:B, E2, C:C)",
  "formulaType":  "analytical",
  "explanation":  "Calculates average salary per department using AVERAGEIF",
  "styleHints": {
    "fontBold":   true,
    "fillColor":  "background",
    "fontColor":  "#FFFFFF"
  }
}`;
doc.fillColor(C.goldLt).fontSize(8).font("Courier")
   .text(jsonSample, ML + 12, cy + 8, { width: TW - 20 });
cy += 104;

// Conditional formatting intelligence
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Conditional Formatting Intelligence", ML, cy);
cy += 16;

doc.fillColor(C.white).fontSize(9.5).font("Helvetica")
   .text(
     "SniperSheet understands conditional language in both Arabic and English and translates it into proper Excel conditional formatting rules — not just static colors that never update:",
     ML, cy, { width: TW }
   );
cy += 38;

const cfRows = [
  ["\"Highlight values below 50\"",              "LessThan 50  → orange fill"],
  ["\"Color top 10% in green\"",                  "TopPercent 10  → green fill"],
  ["\"Mark negative numbers red\"",               "LessThan 0  → red fill + bold"],
  ["\"لون الخلايا الأقل من 100 باللون الأحمر\"",  "LessThan 100  → red fill (Arabic)"],
  ["\"أبرز القيم فوق المتوسط باللون الأزرق\"",    "AboveAverage  → blue fill (Arabic)"],
];
tableRow(["COMMAND (YOUR WORDS)", "EXCEL RULE CREATED"], cy, [TW * 0.54, TW * 0.46], true);
cy += 22;
cfRows.forEach(r => {
  doc.fillColor(C.white).fontSize(7.5).font("Helvetica-Bold")
     .text(r[0], ML + 6, cy + 4, { width: TW * 0.54 - 10, lineBreak: false });
  doc.fillColor(C.green).fontSize(7.5).font("Helvetica")
     .text("→  " + r[1], ML + TW * 0.54 + 4, cy + 4, { width: TW * 0.46 - 10, lineBreak: false });
  cy += tableRow([], cy, [], false);
});

// Footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
   .text("SniperSheet  ·  © 2025–2026 Mustafa Alsahlany  ·  All Rights Reserved  ·  Page 5", ML, H - 20, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 6 — SECURITY + GET STARTED + CLOSING
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
rect(0, 0, W, H, C.navy);
rect(0, 0, W, 6, C.gold);

cy = 30;
cy = sectionHeader("Security, Privacy & Getting Started", "", cy);

// Security section
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Enterprise-Grade Security", ML, cy);
cy += 18;

const secItems = [
  { icon: "🔐", title: "CORS Protection",      desc: "API is locked exclusively to the official SniperSheet domain. Requests from unknown origins are blocked with 403." },
  { icon: "⏱",  title: "Rate Limiting",         desc: "200 requests/15 min globally · 60 requests/15 min for AI endpoints. Prevents abuse and ensures fair usage." },
  { icon: "🪙",  title: "App Token Auth",        desc: "Every AI request requires a proprietary token. Direct API access without the Add-in is rejected with 401." },
  { icon: "🔏",  title: "Data Privacy",          desc: "Your spreadsheet data is transmitted only when you click Analyze. Nothing is stored on the server after processing." },
  { icon: "🛡",  title: "HTTPS Encryption",      desc: "All communication is encrypted end-to-end via TLS. No plain-text data transmission." },
  { icon: "©",   title: "Copyright Protection",  desc: "Every API response includes copyright attribution headers identifying SniperSheet as a proprietary product." },
];

const sh = 62;
secItems.forEach((s, i) => {
  const scol = i % 2, srow = Math.floor(i / 2);
  const sx = ML + scol * (TW / 2 + 5);
  const sy = cy + srow * (sh + 8);
  rect(sx, sy, TW / 2 - 5, sh, C.navyLt, 6);
  rect(sx, sy, 3, sh, C.accent, 0);
  doc.fillColor(C.white).fontSize(9).font("Helvetica-Bold")
     .text(s.icon + "  " + s.title, sx + 12, sy + 8, { width: TW / 2 - 24, lineBreak: false });
  doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
     .text(s.desc, sx + 12, sy + 26, { width: TW / 2 - 24 });
});
cy += Math.ceil(secItems.length / 2) * (sh + 8) + 12;

hLine(cy, C.navyLt, 0.7);
cy += 14;

// Getting Started
doc.fillColor(C.gold).fontSize(12).font("Helvetica-Bold")
   .text("Get Started in 60 Seconds", ML, cy);
cy += 18;

const gsteps = [
  "Open Microsoft Excel (Desktop or Online)",
  "Go to Insert → Add-ins → Upload My Add-in",
  "Upload the SniperSheet manifest file",
  "The SniperSheet task pane appears on the right",
  "Select any cells, type your goal, click Analyze",
  "Watch Excel do the work — in seconds",
];
gsteps.forEach((s, i) => {
  rect(ML, cy, TW, 22, i % 2 === 0 ? C.navyLt : C.navyMid, 4);
  rect(ML, cy, 28, 22, C.gold, 4);
  doc.fillColor(C.dark).fontSize(9).font("Helvetica-Bold")
     .text(String(i + 1), ML + 10, cy + 6, { lineBreak: false });
  doc.fillColor(C.white).fontSize(9).font("Helvetica")
     .text(s, ML + 36, cy + 6, { width: TW - 46, lineBreak: false });
  cy += 24;
});
cy += 8;

hLine(cy, C.navyLt, 0.7);
cy += 14;

// Closing statement
rect(ML, cy, TW, 80, C.navyLt, 10);
rect(ML, cy, TW, 4, C.gold, 0);
doc.fillColor(C.white).fontSize(14).font("Helvetica-Bold")
   .text("Ready to Transform Your Excel Experience?", ML + 20, cy + 20, { width: TW - 40 });
doc.fillColor(C.slate).fontSize(9.5).font("Helvetica")
   .text(
     "SniperSheet is the fastest way to turn any Excel task into a one-sentence command.\nNo formulas. No training. No limits.",
     ML + 20, cy + 46, { width: TW - 40 }
   );
cy += 96;

// Contact / domain
rect(ML, cy, TW, 52, C.dark, 8);
rect(ML, cy, TW, 2, C.gold, 0);
doc.fillColor(C.gold).fontSize(11).font("Helvetica-Bold")
   .text("SniperSheet", ML + 16, cy + 12, { lineBreak: false });
doc.fillColor(C.slate).fontSize(9).font("Helvetica")
   .text("Developed by Mustafa Alsahlany", ML + 16, cy + 28, { lineBreak: false });
doc.fillColor(C.accent).fontSize(9).font("Helvetica")
   .text("node-runner-mustafaalshlany.replit.app", MR - 232, cy + 28, { lineBreak: false });

// Final footer
rect(0, H - 36, W, 36, C.dark);
hLine(H - 36, C.gold, 0.4);
doc.fillColor(C.slate).fontSize(7.5).font("Helvetica")
   .text("SniperSheet  ·  © 2025–2026 Mustafa Alsahlany  ·  All Rights Reserved  ·  Unauthorized distribution prohibited.", ML, H - 20, { lineBreak: false });

// ─────────────────────────────────────────────────────────────────────────────
doc.end();
console.log("PDF generated →", OUTPUT);
