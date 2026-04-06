/**
 * SniperSheet Formula Engine — Rule-based, 100% free, zero API calls.
 * Covers 35+ formula patterns in Arabic and English.
 */

export type StyleHint = {
  target: string;
  color?: string | null;
  bold?: boolean | null;
  italic?: boolean | null;
  condition?: string | null;
};

export type FormulaResult = {
  formula: string;
  result: string | null;
  reasoning: string;
  formulaType: string;
  styleHints: StyleHint[];
  confidence: number;
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

function norm(text: string) {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumber(text: string): number | null {
  const m = text.match(/[\d٠-٩]+(?:[.,][\d٠-٩]+)?/);
  if (!m) return null;
  const n = m[0]
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(",", ".");
  return parseFloat(n);
}

function extractNumbers(text: string): number[] {
  return [...text.matchAll(/[\d٠-٩]+(?:[.,][\d٠-٩]+)?/g)].map((m) =>
    parseFloat(
      m[0]
        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        .replace(",", ".")
    )
  );
}

function extractRange(text: string): string {
  const m = text.match(/\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+/i);
  return m ? m[0].toUpperCase() : "A1:A10";
}

function extractCellRef(text: string): string {
  const m = text.match(/\$?[A-Za-z]+\$?\d+/i);
  return m ? m[0].toUpperCase() : "A1";
}

function colorHint(name: string, cond: string): StyleHint {
  const map: Record<string, string> = {
    أحمر: "#FF0000", red: "#FF0000",
    أخضر: "#00AA00", green: "#00AA00",
    أزرق: "#0070C0", blue: "#0070C0",
    أصفر: "#FFD700", yellow: "#FFD700",
    برتقالي: "#FF6600", orange: "#FF6600",
    بنفسجي: "#7B2D8B", purple: "#7B2D8B",
  };
  for (const [key, hex] of Object.entries(map)) {
    if (name.includes(key)) return { target: "background", color: hex, condition: cond };
  }
  return { target: "background", color: "#FFFF00", condition: cond };
}

function computeValues(op: string, nums: number[]): string | null {
  if (nums.length === 0) return null;
  if (op === "SUM") return String(nums.reduce((a, b) => a + b, 0));
  if (op === "AVERAGE") return String(nums.reduce((a, b) => a + b, 0) / nums.length);
  if (op === "MAX") return String(Math.max(...nums));
  if (op === "MIN") return String(Math.min(...nums));
  if (op === "COUNT") return String(nums.length);
  if (op === "PRODUCT") return String(nums.reduce((a, b) => a * b, 1));
  return null;
}

// ─── PATTERNS ────────────────────────────────────────────────────────────────

const HAS_AR = /[\u0600-\u06FF]/;

function isArabic(t: string) { return HAS_AR.test(t); }

function detectColor(t: string): StyleHint[] {
  const colors = ["أحمر", "أخضر", "أزرق", "أصفر", "برتقالي", "بنفسجي",
    "red", "green", "blue", "yellow", "orange", "purple"];
  const hints: StyleHint[] = [];
  for (const c of colors) {
    if (t.includes(c)) hints.push(colorHint(c, "condition"));
  }
  return hints;
}

// ─── RULE PATTERNS ───────────────────────────────────────────────────────────

type Rule = {
  test: (t: string, n: string) => boolean;
  build: (raw: string, t: string, n: string, vals: number[], ref: string, range: string) => FormulaResult;
};

const RULES: Rule[] = [

  // ── OVERTIME / وقت إضافي ────────────────────────────────────────────────
  {
    test: (_, n) => (n.includes("وقت اضافي") || n.includes("overtime") || n.includes("ساعات اضافيه") || n.includes("ساعات اضافية")),
    build: (_, __, n, vals, ref) => {
      const rate = vals.find((v) => v > 1 && v <= 3) ?? 1.5;
      const threshold = vals.find((v) => v > 3 && v <= 60) ?? 40;
      const cell = ref || "A1";
      const formula = `=IF(${cell}>${threshold},(${cell}-${threshold})*${rate},0)`;
      return {
        formula,
        result: null,
        reasoning: `إذا تجاوزت الساعات ${threshold}، يُحسب الفرق مضروبًا في معدل ${rate} | If hours exceed ${threshold}, multiply excess by rate ${rate}`,
        formulaType: "conditional",
        styleHints: [],
        confidence: 0.95,
      };
    },
  },

  // ── GRADE / PASS-FAIL / درجات ────────────────────────────────────────────
  {
    test: (_, n) => (n.includes("ناجح") || n.includes("راسب") || n.includes("pass") || n.includes("fail") || n.includes("نجح") || n.includes("رسب")),
    build: (raw, _, n, vals, ref) => {
      const threshold = vals[0] ?? 50;
      const cell = ref || "A1";
      const passLabel = n.includes("ممتاز") || raw.includes("ممتاز") ? '"ممتاز"' : n.includes("pass") ? '"Pass"' : '"ناجح"';
      const failLabel = n.includes("fail") ? '"Fail"' : '"راسب"';
      const formula = `=IF(${cell}>=${threshold},${passLabel},${failLabel})`;
      return {
        formula,
        result: null,
        reasoning: `إذا كانت الدرجة ≥ ${threshold} تُعاد "${passLabel.replace(/"/g, "")}"، وإلا "${failLabel.replace(/"/g, "")}" | IF score ≥ ${threshold} return pass else fail`,
        formulaType: "conditional",
        styleHints: [
          { target: "background", color: "#00AA00", bold: true, condition: `>=${threshold}` },
          { target: "background", color: "#FF0000", bold: true, condition: `<${threshold}` },
        ],
        confidence: 0.93,
      };
    },
  },

  // ── GRADE SCALE / تقييم ممتاز جيد ─────────────────────────────────────────
  {
    test: (_, n) => (n.includes("ممتاز") || n.includes("excellent")) && (n.includes("جيد") || n.includes("good")),
    build: (_, __, _n, vals, ref) => {
      const cell = ref || "A1";
      const [t1, t2, t3] = vals.length >= 3 ? vals : [90, 75, 60];
      const formula = `=IFS(${cell}>=${t1},"ممتاز / Excellent",${cell}>=${t2},"جيد / Good",${cell}>=${t3},"مقبول / Acceptable",TRUE,"ضعيف / Weak")`;
      return {
        formula,
        result: null,
        reasoning: `تصنيف الدرجات: ${t1}+ ممتاز، ${t2}+ جيد، ${t3}+ مقبول، ما دون ذلك ضعيف | Grade scale: ${t1}+ Excellent, ${t2}+ Good, ${t3}+ Acceptable`,
        formulaType: "conditional",
        styleHints: [
          { target: "background", color: "#00AA00", condition: `>=${t1}` },
          { target: "background", color: "#0070C0", condition: `>=${t2}` },
          { target: "background", color: "#FFD700", condition: `>=${t3}` },
        ],
        confidence: 0.9,
      };
    },
  },

  // ── SUMIF ────────────────────────────────────────────────────────────────
  {
    test: (_, n) => (n.includes("جمع") || n.includes("sum")) && (n.includes("اذا") || n.includes("اكبر") || n.includes("if") || n.includes("greater") || n.includes("less") || n.includes("اقل") || n.includes("شرط")),
    build: (raw, _, n, vals, _ref, range) => {
      const num = vals[0] ?? 0;
      const op = (n.includes("اكبر") || n.includes("greater") || n.includes("above")) ? ">" :
                 (n.includes("اقل") || n.includes("less") || n.includes("below")) ? "<" : ">";
      const formula = `=SUMIF(${range},"${op}${num}")`;
      return {
        formula,
        result: null,
        reasoning: `جمع القيم ${op === ">" ? "الأكبر" : "الأصغر"} من ${num} في النطاق ${range} | Sum values ${op === ">" ? "greater" : "less"} than ${num} in range ${range}`,
        formulaType: "statistical",
        styleHints: [],
        confidence: 0.88,
      };
    },
  },

  // ── AVERAGEIF ──────────────────────────────────────────────────────────
  {
    test: (_, n) => (n.includes("متوسط") || n.includes("average") || n.includes("وسط")) && (n.includes("اكبر") || n.includes("greater") || n.includes("if") || n.includes("اذا") || n.includes("اقل") || n.includes("less")),
    build: (_, __, n, vals, _ref, range) => {
      const num = vals[0] ?? 0;
      const op = (n.includes("اكبر") || n.includes("greater")) ? ">" : "<";
      const formula = `=AVERAGEIF(${range},"${op}${num}")`;
      return {
        formula,
        result: null,
        reasoning: `متوسط القيم ${op === ">" ? "الأكبر" : "الأصغر"} من ${num} | Average of values ${op === ">" ? "greater" : "less"} than ${num}`,
        formulaType: "statistical",
        styleHints: [],
        confidence: 0.88,
      };
    },
  },

  // ── COUNTIF ─────────────────────────────────────────────────────────────
  {
    test: (_, n) => (n.includes("عدد") || n.includes("count") || n.includes("كم")) && (n.includes("اكبر") || n.includes("greater") || n.includes("اقل") || n.includes("less") || n.includes("يساوي") || n.includes("equal") || n.includes("اذا") || n.includes("if")),
    build: (_, __, n, vals, _ref, range) => {
      const num = vals[0];
      let criterion: string;
      if (num !== undefined) {
        const op = (n.includes("اكبر") || n.includes("greater")) ? ">" : (n.includes("اقل") || n.includes("less")) ? "<" : "=";
        criterion = `"${op}${num}"`;
      } else {
        criterion = '"*"';
      }
      const formula = `=COUNTIF(${range},${criterion})`;
      return {
        formula,
        result: null,
        reasoning: `عدد الخلايا التي تحقق الشرط في النطاق ${range} | Count cells matching condition in ${range}`,
        formulaType: "statistical",
        styleHints: [],
        confidence: 0.87,
      };
    },
  },

  // ── VLOOKUP / XLOOKUP / بحث ─────────────────────────────────────────────
  {
    test: (_, n) => n.includes("vlookup") || n.includes("xlookup") || n.includes("بحث") || n.includes("ابحث") || n.includes("lookup") || n.includes("ابحث عن"),
    build: (_, __, n, vals, ref, range) => {
      const col = vals[0] ?? 2;
      const lookup = ref || "A1";
      const useXlookup = n.includes("xlookup") || !n.includes("vlookup");
      const tableRange = range !== "A1:A10" ? range : "A1:D100";
      let formula: string;
      if (useXlookup) {
        const parts = tableRange.split(":");
        const returnCol = parts[1]?.replace(/\d+/, "") ?? "B";
        formula = `=XLOOKUP(${lookup},${parts[0]}:${parts[0].replace(/\d+/, "100")},${returnCol}1:${returnCol}100,"غير موجود / Not found")`;
      } else {
        formula = `=VLOOKUP(${lookup},${tableRange},${col},FALSE)`;
      }
      return {
        formula,
        result: null,
        reasoning: `البحث عن قيمة الخلية ${lookup} في الجدول ${tableRange} | Search for ${lookup} value in table ${tableRange}`,
        formulaType: "lookup",
        styleHints: [],
        confidence: 0.85,
      };
    },
  },

  // ── INDEX MATCH ──────────────────────────────────────────────────────────
  {
    test: (_, n) => (n.includes("index") && n.includes("match")) || (n.includes("فهرس") && n.includes("مطابقه")),
    build: (_, __, _n, _vals, ref, range) => {
      const lookup = ref || "A1";
      const formula = `=INDEX(B1:B100,MATCH(${lookup},A1:A100,0))`;
      return {
        formula,
        result: null,
        reasoning: `البحث الثنائي بـ INDEX+MATCH أقوى من VLOOKUP | INDEX+MATCH two-way lookup, more powerful than VLOOKUP`,
        formulaType: "lookup",
        styleHints: [],
        confidence: 0.85,
      };
    },
  },

  // ── MAX / أكبر قيمة ─────────────────────────────────────────────────────
  {
    test: (_, n) => /\b(max|اكبر|الاكبر|اعلى|الاعلى|اقصى|الاقصى)\b/.test(n) && !n.includes("sumif"),
    build: (_, __, _n, vals, _ref, range) => {
      const formula = vals.length > 1 ? `=MAX(${vals.join(",")})` : `=MAX(${range})`;
      const result = vals.length > 0 ? String(Math.max(...vals)) : null;
      return {
        formula,
        result,
        reasoning: `إيجاد أعلى قيمة في النطاق | Find the maximum value in the range`,
        formulaType: "statistical",
        styleHints: [],
        confidence: 0.95,
      };
    },
  },

  // ── MIN / أصغر قيمة ─────────────────────────────────────────────────────
  {
    test: (_, n) => /\b(min|اقل|الاقل|ادنى|الادنى)\b/.test(n) && !n.includes("sumif"),
    build: (_, __, _n, vals, _ref, range) => {
      const formula = vals.length > 1 ? `=MIN(${vals.join(",")})` : `=MIN(${range})`;
      const result = vals.length > 0 ? String(Math.min(...vals)) : null;
      return {
        formula,
        result,
        reasoning: `إيجاد أدنى قيمة في النطاق | Find the minimum value in the range`,
        formulaType: "statistical",
        styleHints: [],
        confidence: 0.95,
      };
    },
  },

  // ── RANK / ترتيب ─────────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("rank") || n.includes("ترتيب") || n.includes("رتبه") || n.includes("رتبة"),
    build: (_, __, n, _vals, ref, range) => {
      const cell = ref || "A1";
      const order = (n.includes("تصاعد") || n.includes("asc")) ? "1" : "0";
      const formula = `=RANK(${cell},${range},${order})`;
      return {
        formula,
        result: null,
        reasoning: `ترتيب قيمة ${cell} ضمن النطاق ${range} | Rank of ${cell} within range ${range}`,
        formulaType: "statistical",
        styleHints: [],
        confidence: 0.9,
      };
    },
  },

  // ── PERCENTAGE / نسبة مئوية ─────────────────────────────────────────────
  {
    test: (_, n) => n.includes("نسبه") || n.includes("نسبة") || n.includes("percent") || n.includes("%") || n.includes("بالمئه") || n.includes("بالمئة"),
    build: (_, __, n, vals, ref) => {
      const cell = ref || "A1";
      const total = vals[1] ?? vals[0];
      const part = vals[0];
      if (part !== undefined && total !== undefined && total !== part) {
        const formula = `=${part}/${total}`;
        return {
          formula,
          result: String(((part / total) * 100).toFixed(2)) + "%",
          reasoning: `حساب النسبة المئوية: ${part} من أصل ${total} | Percentage: ${part} out of ${total}`,
          formulaType: "arithmetic",
          styleHints: [],
          confidence: 0.9,
        };
      }
      const formula = `=${cell}/SUM(${cell.replace(/\d+/, "")}1:${cell.replace(/\d+/, "")}100)`;
      return {
        formula,
        result: null,
        reasoning: `نسبة الخلية ${cell} من إجمالي العمود | Percentage of ${cell} relative to column total`,
        formulaType: "arithmetic",
        styleHints: [],
        confidence: 0.82,
      };
    },
  },

  // ── TAX / ضريبة ──────────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("ضريبه") || n.includes("ضريبة") || n.includes("tax") || n.includes("vat"),
    build: (_, raw, n, vals, ref) => {
      const rate = vals.find((v) => v <= 1) ?? (vals.find((v) => v <= 100) ? (vals.find((v) => v <= 100)! / 100) : 0.15);
      const cell = ref || "A1";
      const pct = rate <= 1 ? rate : rate / 100;
      const formula = `=${cell}*(1+${pct})`;
      return {
        formula,
        result: null,
        reasoning: `إضافة ضريبة ${pct * 100}% على القيمة | Add ${pct * 100}% tax to value`,
        formulaType: "arithmetic",
        styleHints: [],
        confidence: 0.9,
      };
    },
  },

  // ── SALARY / راتب ────────────────────────────────────────────────────────
  {
    test: (_, n) => (n.includes("راتب") || n.includes("salary") || n.includes("اجر") || n.includes("مرتب")),
    build: (_, __, n, vals, ref) => {
      const cell = ref || "A1";
      if (n.includes("اضافي") || n.includes("overtime") || n.includes("ساعات")) {
        const rate = vals.find((v) => v > 1 && v <= 3) ?? 1.5;
        const threshold = vals.find((v) => v > 3 && v <= 60) ?? 40;
        const formula = `=${cell}+IF(B1>${threshold},(B1-${threshold})*${cell}/160*${rate},0)`;
        return {
          formula,
          result: null,
          reasoning: `الراتب الأساسي + وقت إضافي إذا تجاوزت الساعات ${threshold} | Base salary + overtime if hours exceed ${threshold}`,
          formulaType: "conditional",
          styleHints: [],
          confidence: 0.87,
        };
      }
      if (n.includes("نسبه") || n.includes("percent") || n.includes("زياده") || n.includes("زيادة")) {
        const pct = vals[0] ?? 10;
        const rate = pct > 1 ? pct / 100 : pct;
        const formula = `=${cell}*(1+${rate})`;
        return {
          formula,
          result: null,
          reasoning: `زيادة الراتب بنسبة ${pct > 1 ? pct : pct * 100}% | Increase salary by ${pct > 1 ? pct : pct * 100}%`,
          formulaType: "arithmetic",
          styleHints: [],
          confidence: 0.88,
        };
      }
      const formula = `=SUM(${cell},B1,C1)`;
      return {
        formula,
        result: null,
        reasoning: `إجمالي الراتب من عدة مكونات | Total salary from multiple components`,
        formulaType: "arithmetic",
        styleHints: [],
        confidence: 0.75,
      };
    },
  },

  // ── TODAY / DATE ────────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("اليوم") || n.includes("today") || n.includes("تاريخ") || n.includes("date") || n.includes("now"),
    build: (_, __, n, _vals, ref) => {
      if (n.includes("فرق") || n.includes("difference") || n.includes("مضت") || n.includes("منذ") || n.includes("days since") || n.includes("عمر")) {
        const cell = ref || "A1";
        const formula = `=TODAY()-${cell}`;
        return {
          formula,
          result: null,
          reasoning: `عدد الأيام منذ تاريخ ${cell} حتى اليوم | Days elapsed since ${cell}`,
          formulaType: "date",
          styleHints: [],
          confidence: 0.9,
        };
      }
      if (n.includes("now") || n.includes("الان") || n.includes("الآن")) {
        return {
          formula: "=NOW()",
          result: new Date().toLocaleString("ar-EG"),
          reasoning: "التاريخ والوقت الحاليين | Current date and time",
          formulaType: "date",
          styleHints: [],
          confidence: 0.98,
        };
      }
      return {
        formula: "=TODAY()",
        result: new Date().toLocaleDateString("ar-EG"),
        reasoning: "تاريخ اليوم الحالي | Today's current date",
        formulaType: "date",
        styleHints: [],
        confidence: 0.98,
      };
    },
  },

  // ── DATEDIF / عمر / age ─────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("عمر") || n.includes("age") || n.includes("datedif") || n.includes("سنه") || n.includes("سنة"),
    build: (_, __, _n, _vals, ref) => {
      const cell = ref || "A1";
      const formula = `=DATEDIF(${cell},TODAY(),"Y")`;
      return {
        formula,
        result: null,
        reasoning: `حساب العمر بالسنوات من تاريخ الميلاد ${cell} حتى اليوم | Calculate age in years from birth date ${cell} to today`,
        formulaType: "date",
        styleHints: [],
        confidence: 0.92,
      };
    },
  },

  // ── TEXT FUNCTIONS / نصوص ───────────────────────────────────────────────
  {
    test: (_, n) => n.includes("نص") || n.includes("text") || n.includes("كبير") || n.includes("upper") || n.includes("صغير") || n.includes("lower") || n.includes("دمج") || n.includes("concat") || n.includes("حروف"),
    build: (_, __, n, _vals, ref) => {
      const cell = ref || "A1";
      if (n.includes("كبير") || n.includes("upper")) {
        return { formula: `=UPPER(${cell})`, result: null, reasoning: "تحويل النص إلى أحرف كبيرة | Convert text to uppercase", formulaType: "text", styleHints: [], confidence: 0.95 };
      }
      if (n.includes("صغير") || n.includes("lower")) {
        return { formula: `=LOWER(${cell})`, result: null, reasoning: "تحويل النص إلى أحرف صغيرة | Convert text to lowercase", formulaType: "text", styleHints: [], confidence: 0.95 };
      }
      if (n.includes("دمج") || n.includes("concat") || n.includes("ربط")) {
        return { formula: `=CONCAT(${cell}," ",B1)`, result: null, reasoning: "دمج محتوى خليتين مع مسافة | Concatenate two cells with space", formulaType: "text", styleHints: [], confidence: 0.9 };
      }
      if (n.includes("طول") || n.includes("length") || n.includes("عدد الحروف")) {
        return { formula: `=LEN(${cell})`, result: null, reasoning: "عدد أحرف النص في الخلية | Count characters in cell", formulaType: "text", styleHints: [], confidence: 0.95 };
      }
      if (n.includes("trim") || n.includes("مسافات")) {
        return { formula: `=TRIM(${cell})`, result: null, reasoning: "إزالة المسافات الزائدة | Remove extra spaces", formulaType: "text", styleHints: [], confidence: 0.95 };
      }
      return { formula: `=TEXT(${cell},"#,##0.00")`, result: null, reasoning: "تنسيق رقم كنص | Format number as text", formulaType: "text", styleHints: [], confidence: 0.8 };
    },
  },

  // ── CONDITIONAL FORMATTING ONLY (colors) ─────────────────────────────────
  {
    test: (_, n) => (n.includes("لون") || n.includes("color") || n.includes("colour") || n.includes("احمر") || n.includes("اخضر")) && !n.includes("اذا") && !n.includes("if"),
    build: (raw, _, _n, _vals, ref) => {
      const cell = ref || "A1";
      const hints = detectColor(raw);
      return {
        formula: `=${cell}`,
        result: null,
        reasoning: "تنسيق لوني مشروط — يُطبَّق عبر Conditional Formatting في Excel | Conditional color format — apply via Excel Conditional Formatting",
        formulaType: "formatting",
        styleHints: hints.length > 0 ? hints : [{ target: "background", color: "#FFD700", condition: "value > 0" }],
        confidence: 0.8,
      };
    },
  },

  // ── ISBLANK / فارغ ──────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("فارغ") || n.includes("blank") || n.includes("empty") || n.includes("isblank"),
    build: (_, __, _n, _vals, ref) => {
      const cell = ref || "A1";
      const formula = `=IF(ISBLANK(${cell}),"فارغ / Empty","ممتلئ / Filled")`;
      return {
        formula,
        result: null,
        reasoning: `فحص ما إذا كانت الخلية ${cell} فارغة | Check if cell ${cell} is empty`,
        formulaType: "conditional",
        styleHints: [],
        confidence: 0.92,
      };
    },
  },

  // ── PMT / قسط ────────────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("pmt") || n.includes("قسط") || n.includes("اقساط") || n.includes("loan") || n.includes("قرض"),
    build: (_, __, _n, vals, ref) => {
      const rate = (vals[0] ?? 5) / 100 / 12;
      const nper = vals[1] ?? 60;
      const pv = vals[2] ?? 100000;
      const formula = `=PMT(${rate},${nper},${pv})`;
      const result = String(Math.abs((rate * pv) / (1 - Math.pow(1 + rate, -nper))).toFixed(2));
      return {
        formula,
        result,
        reasoning: `حساب القسط الشهري: نسبة ${vals[0] ?? 5}% سنويًا، ${nper} شهر، مبلغ ${pv} | Monthly payment: ${vals[0] ?? 5}% annual, ${nper} months, amount ${pv}`,
        formulaType: "financial",
        styleHints: [],
        confidence: 0.88,
      };
    },
  },

  // ── ROUND / تقريب ───────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("تقريب") || n.includes("round") || n.includes("تقريب"),
    build: (_, __, n, vals, ref) => {
      const cell = ref || "A1";
      const decimals = vals[0] ?? 2;
      const fn = n.includes("لاعلى") || n.includes("up") ? "ROUNDUP" : n.includes("لاسفل") || n.includes("down") ? "ROUNDDOWN" : "ROUND";
      const formula = `=${fn}(${cell},${decimals})`;
      return {
        formula,
        result: null,
        reasoning: `تقريب القيمة إلى ${decimals} منازل عشرية | Round value to ${decimals} decimal places`,
        formulaType: "arithmetic",
        styleHints: [],
        confidence: 0.93,
      };
    },
  },

  // ── AVERAGE / متوسط (simple) ─────────────────────────────────────────────
  {
    test: (_, n) => n.includes("متوسط") || n.includes("average") || n.includes("وسط"),
    build: (_, __, _n, vals, _ref, range) => {
      const formula = vals.length > 1 ? `=AVERAGE(${vals.join(",")})` : `=AVERAGE(${range})`;
      const result = computeValues("AVERAGE", vals);
      return {
        formula,
        result,
        reasoning: `حساب متوسط القيم | Calculate the average of values`,
        formulaType: "arithmetic",
        styleHints: [],
        confidence: 0.95,
      };
    },
  },

  // ── IF / إذا (generic) ───────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("اذا") || n.includes("اذ") || /\bif\b/.test(n) || n.includes("عندما") || n.includes("لو"),
    build: (raw, _, n, vals, ref) => {
      const cell = ref || "A1";
      const threshold = vals[0];
      const op = (n.includes("اكبر") || n.includes("greater") || n.includes("above") || n.includes("more")) ? ">" :
                 (n.includes("اقل") || n.includes("less") || n.includes("below")) ? "<" :
                 (n.includes("يساوي") || n.includes("equal") || n.includes("same")) ? "=" : ">";
      const cond = threshold !== undefined ? `${cell}${op}${threshold}` : `${cell}>0`;
      const trueVal = n.includes("نعم") ? '"نعم"' : n.includes("yes") ? '"Yes"' : '"صح / True"';
      const falseVal = n.includes("لا") ? '"لا"' : n.includes("no") ? '"No"' : '"خطأ / False"';
      const formula = `=IF(${cond},${trueVal},${falseVal})`;
      return {
        formula,
        result: null,
        reasoning: `شرط: إذا كان ${cond} أعد ${trueVal} وإلا ${falseVal} | Condition: if ${cond} return ${trueVal} else ${falseVal}`,
        formulaType: "conditional",
        styleHints: [],
        confidence: 0.82,
      };
    },
  },

  // ── PRODUCT / ضرب ────────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("ضرب") || n.includes("product") || n.includes("multiply") || n.includes("حاصل الضرب"),
    build: (_, __, _n, vals, ref, range) => {
      const formula = vals.length > 1 ? `=PRODUCT(${vals.join(",")})` : vals.length === 1 ? `=${ref || "A1"}*${vals[0]}` : `=PRODUCT(${range})`;
      const result = vals.length > 0 ? String(vals.reduce((a, b) => a * b, 1)) : null;
      return {
        formula,
        result,
        reasoning: `حاصل ضرب القيم | Product of values`,
        formulaType: "arithmetic",
        styleHints: [],
        confidence: 0.92,
      };
    },
  },

  // ── SUBTRACTION / طرح ───────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("طرح") || n.includes("ناقص") || n.includes("subtract") || n.includes("minus") || n.includes("الفرق") || n.includes("difference"),
    build: (_, __, _n, vals, ref) => {
      if (vals.length >= 2) {
        const diff = vals[0] - vals[1];
        return { formula: `=${vals[0]}-${vals[1]}`, result: String(diff), reasoning: `الفرق بين ${vals[0]} و${vals[1]} = ${diff} | Difference: ${vals[0]} - ${vals[1]} = ${diff}`, formulaType: "arithmetic", styleHints: [], confidence: 0.95 };
      }
      const cell1 = ref || "A1";
      return { formula: `=${cell1}-B1`, result: null, reasoning: `طرح قيمة B1 من ${cell1} | Subtract B1 from ${cell1}`, formulaType: "arithmetic", styleHints: [], confidence: 0.85 };
    },
  },

  // ── DIVISION / قسمة ─────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("قسمه") || n.includes("قسمة") || n.includes("مقسوم") || n.includes("divide") || n.includes("division"),
    build: (_, __, _n, vals, ref) => {
      if (vals.length >= 2 && vals[1] !== 0) {
        const q = vals[0] / vals[1];
        return { formula: `=IFERROR(${vals[0]}/${vals[1]},"خطأ قسمة")`, result: String(q.toFixed(4)), reasoning: `${vals[0]} ÷ ${vals[1]} = ${q.toFixed(4)} | Division result`, formulaType: "arithmetic", styleHints: [], confidence: 0.95 };
      }
      const cell = ref || "A1";
      return { formula: `=IFERROR(${cell}/B1,"خطأ قسمة / Div error")`, result: null, reasoning: `قسمة ${cell} على B1 مع معالجة الخطأ | Divide ${cell} by B1 with error handling`, formulaType: "arithmetic", styleHints: [], confidence: 0.87 };
    },
  },

  // ── SUM (default) ────────────────────────────────────────────────────────
  {
    test: (_, n) => n.includes("جمع") || n.includes("اجمع") || n.includes("مجموع") || n.includes("sum") || n.includes("total") || n.includes("اجمالي") || n.includes("إجمالي"),
    build: (_, __, _n, vals, _ref, range) => {
      const formula = vals.length > 1 ? `=SUM(${vals.join(",")})` : `=SUM(${range})`;
      const result = computeValues("SUM", vals);
      return {
        formula,
        result,
        reasoning: `جمع القيم في النطاق ${range} | Sum of values in range ${range}`,
        formulaType: "arithmetic",
        styleHints: [],
        confidence: 0.95,
      };
    },
  },
];

// ─── FALLBACK ────────────────────────────────────────────────────────────────
function fallback(raw: string, vals: number[], ref: string, range: string): FormulaResult {
  const nums = vals.length > 0 ? vals.join(",") : range;
  return {
    formula: `=SUM(${nums})`,
    result: vals.length > 0 ? computeValues("SUM", vals) : null,
    reasoning: `لم يتم التعرف على النمط تمامًا، تم اقتراح دالة SUM كافتراضي | Pattern not fully recognized, defaulting to SUM`,
    formulaType: "arithmetic",
    styleHints: [],
    confidence: 0.55,
  };
}

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────
export function analyzeFormula(
  description: string,
  values?: number[],
  cellRef?: string
): FormulaResult {
  const raw = description;
  const normalized = norm(description);
  const vals = values && values.length > 0 ? values : extractNumbers(description);
  const ref = cellRef ? cellRef.toUpperCase() : extractCellRef(description);
  const range = extractRange(description);

  for (const rule of RULES) {
    if (rule.test(raw, normalized)) {
      try {
        const result = rule.build(raw, description, normalized, vals, ref, range);
        // Merge any color hints from description
        const extraColors = detectColor(normalized).filter(
          (h) => !result.styleHints.some((s) => s.color === h.color)
        );
        result.styleHints = [...result.styleHints, ...extraColors];
        return result;
      } catch {
        // continue to next rule
      }
    }
  }

  return fallback(raw, vals, ref, range);
}
