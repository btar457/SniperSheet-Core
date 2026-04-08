export type RadarIssue = {
  token: string;
  start: number;
  end: number;
  severity: "warning" | "info";
  reason: string;
  suggestions: string[];
};

const KNOWN_EXCEL_FUNCTIONS = [
  "SUM","SUMIF","SUMIFS","PRODUCT","AVERAGE","AVERAGEIF","AVERAGEIFS",
  "COUNT","COUNTA","COUNTIF","COUNTIFS","COUNTBLANK",
  "MAX","MIN","LARGE","SMALL","RANK",
  "IF","IFS","AND","OR","NOT","XOR","TRUE","FALSE","IFERROR","IFNA",
  "VLOOKUP","HLOOKUP","XLOOKUP","INDEX","MATCH","CHOOSE",
  "TEXT","CONCATENATE","CONCAT","TEXTJOIN","LEFT","RIGHT","MID","LEN",
  "TRIM","UPPER","LOWER","PROPER","SUBSTITUTE","REPLACE","FIND","SEARCH",
  "DATE","TODAY","NOW","YEAR","MONTH","DAY","HOUR","MINUTE","DATEDIF",
  "ROUND","ROUNDUP","ROUNDDOWN","INT","ABS","SQRT","POWER","MOD","CEILING","FLOOR",
  "PMT","NPV","IRR","PV","FV","RATE","NPER",
  "ISBLANK","ISNUMBER","ISTEXT","ISERROR","ISNA","ISNULL",
];

const KNOWN_ARABIC_KEYWORDS = [
  // حسابات أساسية
  "جمع","اجمع","إجمع","مجموع","الجمع","إجمالي","الإجمالي","اجمالي",
  "ضرب","اضرب","إضرب","حاصل","حاصل الضرب","مضروب",
  "متوسط","وسط","المتوسط","معدل","المعدل","الوسط",
  "طرح","اطرح","إطرح","ناقص","الفرق","فرق",
  "قسمة","اقسم","إقسم","مقسوم","قسمه",
  "ناتج","الناتج","النتيجة","نتيجة","حصيلة",

  // مقارنة
  "أقل","اقل","أصغر","اصغر","الأدنى","الادنى","أدنى","ادنى",
  "أكبر","اكبر","أعلى","اعلى","الأقصى","الاقصى","أقصى","اقصى",
  "أكثر","اكثر","يساوي","يساوي","مساوي","مساوٍ","تجاوز","يتجاوز",
  "أكبر من","أقل من","أعلى من","أدنى من","لا يساوي","لا يساوى",
  "زاد","زادت","نقص","نقصت","يزيد","ينقص",

  // شروط
  "إذا","اذا","لو","عندما","متى","حين","حيث","في حالة","بحسب","بناء","حسب",
  "إذا كان","إذا كانت","اذا كان","اذا كانت",
  "صح","صحيح","خطأ","خطا","نعم","لا","ناجح","راسب",
  "ممتاز","جيد جدا","جيد","مقبول","ضعيف","مميز",

  // عمليات منطقية
  "و","أو","ليس","غير","وأيضا","كلاهما","أحدهما",

  // عمليات بحث
  "ابحث","ابحث عن","اجلب","أحضر","استرجع","اعرض",
  "بحث","بحث عن","فهرس","مطابقة","مطابقه",

  // نطاقات وخلايا
  "القيمة","الخلية","النطاق","العمود","الصف","الجدول","الورقة",
  "قيمة","خلية","نطاق","عمود","صف","جدول",
  "خلايا","قيم","بيانات","أرقام","ارقام",

  // أفعال
  "احسب","أعد","اكتب","اعرض","أظهر","اظهر","احضر","أضف","اضف",
  "طبّق","طبق","أدرج","ادرج","استخدم","حوّل","حول","أنشئ",
  "حدد","أوجد","استخرج","اعرض","انشئ",

  // أعداد ووحدات
  "ساعات","ساعة","درجة","درجات","نسبة","مبلغ","مبالغ","راتب","رواتب",
  "عدد","عدد الخلايا","سعر","أسعار","كمية","معدل","معدلات",
  "وقت إضافي","وقت اضافي","ساعات إضافية","ساعات اضافية","وقت","تاريخ",
  "يوم","أيام","شهر","أشهر","سنة","سنوات","عمر",

  // مالية
  "قسط","أقساط","قرض","فائدة","ضريبة","ضريبه","ربح","خسارة","ميزانية",
  "دفعة","دفعات","سداد","بنك","معدل الفائدة",

  // وصفية
  "تلقائي","تلقائيا","سريع","بسيط","متقدم","احترافي","دقيق",
  "كل","جميع","بعض","الكل","الجميع",

  // حروف الجر والروابط
  "من","إلى","الى","في","على","عن","مع","بين","حتى","إلى","ثم",
  "التي","الذي","التي","هذا","هذه","هو","هي","هم",

  // إضافات
  "الإجمالي","المجموع","الناتج","الفرق","حاصل","نسبة مئوية","بالمئة","بالمئه",
  "نسبه","نسبة","تقريب","تقريبا","مثال","مثل",
];

const KNOWN_ENGLISH_KEYWORDS = [
  "if","when","where","else","otherwise","then",
  "is","are","was","equal","equals","equals","greater","less","than","above","below",
  "and","or","not","both","either","neither",
  "sum","add","plus","total","subtract","minus","multiply","times","divide","divided",
  "average","mean","median","count","find","lookup","search",
  "value","values","number","numbers","cell","range","column","row","sheet",
  "red","green","blue","yellow","orange","bold","italic","color","colour",
  "calculate","compute","get","return","show","display","write","check",
  "overtime","hours","grade","score","percentage","salary","rate","bonus",
  "fail","pass","excellent","good","poor","approved","rejected",
  "a1","b1","c1","a2","b2","a1:b10","$a$1",
  "for","each","all","any","every","between","in","out",
  "the","a","an","of","to","from","by","with","at","on","per",
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function findSuggestions(token: string): string[] {
  const lower = token.toLowerCase();
  const allKnown = [
    ...KNOWN_EXCEL_FUNCTIONS.map((f) => f.toLowerCase()),
  ];
  return allKnown
    .map((known) => ({ known, dist: levenshtein(lower, known) }))
    .filter(({ dist }) => dist <= 3 && dist > 0)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map(({ known }) => KNOWN_EXCEL_FUNCTIONS.find((f) => f.toLowerCase() === known) ?? known);
}

function isArabic(s: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(s);
}

function isKnown(token: string): boolean {
  const lower = token.toLowerCase();
  if (KNOWN_ENGLISH_KEYWORDS.includes(lower)) return true;
  if (KNOWN_EXCEL_FUNCTIONS.map((f) => f.toLowerCase()).includes(lower)) return true;
  if (isArabic(token)) {
    if (KNOWN_ARABIC_KEYWORDS.includes(token)) return true;
    // Strip definite article "ال" and re-check
    if (token.startsWith("ال") && KNOWN_ARABIC_KEYWORDS.includes(token.slice(2))) return true;
    // Strip "ال" + normalize hamza variants on root word
    const root = token.startsWith("ال") ? token.slice(2) : token;
    const normalized = root.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
    if (KNOWN_ARABIC_KEYWORDS.some((k) => {
      const kn = k.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
      return kn === normalized;
    })) return true;
    // Short Arabic tokens (≤3 chars) — prepositions, connectors
    if (token.length <= 3) return true;
  }
  if (/^[\d.,]+$/.test(token)) return true;          // numbers
  if (/^\$?[a-z]+\$?\d+$/i.test(token)) return true; // cell refs like A1, $B$2
  if (/^\d+%$/.test(token)) return true;             // percentages
  if (/^[<>=!]+$/.test(token)) return true;          // operators
  if (token.length <= 2) return true;                // short tokens
  return false;
}

export function scanWithWordRadar(text: string): RadarIssue[] {
  if (!text.trim()) return [];

  const issues: RadarIssue[] = [];
  // Tokenize: split on whitespace, punctuation (but keep Arabic words whole)
  const tokenRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\w']+/g;

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(text)) !== null) {
    const token = match[0];
    const start = match.index;
    const end = start + token.length;

    if (isKnown(token)) continue;

    // If it's an Arabic word not in the dictionary
    if (isArabic(token)) {
      const arabicSuggestions = KNOWN_ARABIC_KEYWORDS.filter((k) =>
        levenshtein(token, k) <= 2
      ).slice(0, 3);
      if (arabicSuggestions.length === 0) {
        issues.push({
          token,
          start,
          end,
          severity: "warning",
          reason: "كلمة غير معروفة للمحرك / Unrecognized Arabic term",
          suggestions: [],
        });
      }
      // If close suggestions exist but token wasn't found — it's a likely typo
      else {
        issues.push({
          token,
          start,
          end,
          severity: "info",
          reason: "هل تقصد؟ / Did you mean:",
          suggestions: arabicSuggestions,
        });
      }
      continue;
    }

    // English token not in known list
    const suggestions = findSuggestions(token);
    if (suggestions.length > 0) {
      issues.push({
        token,
        start,
        end,
        severity: "info",
        reason: "غير معروف — هل تقصد؟ / Unknown term — did you mean:",
        suggestions,
      });
    } else if (token.length > 4) {
      // Only flag longer unknown words to avoid noise
      issues.push({
        token,
        start,
        end,
        severity: "warning",
        reason: "مصطلح غير معروف / Unrecognized term",
        suggestions: [],
      });
    }
  }

  return issues;
}
