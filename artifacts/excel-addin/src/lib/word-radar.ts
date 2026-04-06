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
  "جمع","اجمع","إجمع","مجموع","الجمع",
  "ضرب","اضرب","إضرب","حاصل",
  "متوسط","وسط","المتوسط",
  "أقل","اقل","أصغر","اصغر","الأدنى","الادنى",
  "أكبر","اكبر","أعلى","اعلى","الأقصى","الاقصى",
  "طرح","اطرح","إطرح","ناقص",
  "قسمة","اقسم","إقسم","مقسوم",
  "إذا","اذا","لو","عندما","متى",
  "أكثر","أقل","يساوي","لا يساوي","أكبر من","أقل من",
  "و","أو","ليس","غير",
  "القيمة","الخلية","النطاق","العمود","الصف","الجدول",
  "احسب","أعد","اكتب","اعرض","أظهر","ابحث",
  "إذا كانت","إذا كان","صح","خطأ","نعم","لا",
  "ساعات","درجة","نسبة","مبلغ","راتب","عدد",
  "أكثر من","أقل من","مساوٍ","يساوي","تجاوز",
  "الإجمالي","المجموع","الناتج","الفرق","حاصل",
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
  if (isArabic(token) && KNOWN_ARABIC_KEYWORDS.includes(token)) return true;
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
