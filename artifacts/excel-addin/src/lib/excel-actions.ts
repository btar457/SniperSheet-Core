declare const Excel: any;
declare const Office: any;

function isExcelAvailable(): boolean {
  return typeof Excel !== "undefined" && typeof Office !== "undefined";
}

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

const COLOR_MAP: Record<string, string> = {
  green: "#00B050", red: "#FF0000", yellow: "#FFFF00",
  orange: "#FF6600", blue: "#0070C0", purple: "#7030A0",
  pink: "#FF99CC", lightgreen: "#92D050", lightblue: "#00B0F0",
  gray: "#C0C0C0", grey: "#C0C0C0", white: "#FFFFFF", black: "#000000",
  أخضر: "#00B050", أحمر: "#FF0000", أصفر: "#FFFF00",
  برتقالي: "#FF6600", أزرق: "#0070C0", وردي: "#FF99CC",
};

function resolveColor(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return COLOR_MAP[lower] ?? raw;
}

export interface ColorConditionRule {
  operator: "GreaterThan" | "LessThan" | "GreaterThanOrEqualTo" | "LessThanOrEqualTo" | "EqualTo" | "NotEqualTo";
  value: number;
  fillColor: string;
  fontColor?: string;
}

export function parseColorConditionText(text: string): ColorConditionRule | null {
  const patterns = [
    { re: /(?:cells?|values?|خلايا|قيم)\s*>\s*(\d+(?:\.\d+)?)\s+(?:in\s+)?([a-zA-Zأ-ي]+)/i,  op: "GreaterThan" as const },
    { re: /(?:cells?|values?|خلايا|قيم)\s*<\s*(\d+(?:\.\d+)?)\s+(?:in\s+)?([a-zA-Zأ-ي]+)/i,  op: "LessThan" as const },
    { re: /(?:cells?|values?|خلايا|قيم)\s*>=\s*(\d+(?:\.\d+)?)\s+(?:in\s+)?([a-zA-Zأ-ي]+)/i, op: "GreaterThanOrEqualTo" as const },
    { re: /(?:cells?|values?|خلايا|قيم)\s*<=\s*(\d+(?:\.\d+)?)\s+(?:in\s+)?([a-zA-Zأ-ي]+)/i, op: "LessThanOrEqualTo" as const },
    { re: /(?:cells?|values?|خلايا|قيم)\s*=\s*(\d+(?:\.\d+)?)\s+(?:in\s+)?([a-zA-Zأ-ي]+)/i,  op: "EqualTo" as const },
    { re: /(?:الأعلى|أكبر)\s+من\s+(\d+(?:\.\d+)?)\s+([a-zA-Zأ-ي]+)/i,                        op: "GreaterThan" as const },
    { re: /(?:الأقل|أصغر)\s+من\s+(\d+(?:\.\d+)?)\s+([a-zA-Zأ-ي]+)/i,                         op: "LessThan" as const },
  ];

  for (const { re, op } of patterns) {
    const m = text.match(re);
    if (m) {
      return {
        operator: op,
        value: parseFloat(m[1]),
        fillColor: resolveColor(m[2]),
      };
    }
  }
  return null;
}

export async function insertFormulaInActiveCell(formula: string): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const cell = context.workbook.getActiveCell();
      cell.values = [[formula.startsWith("=") ? formula : `=${formula}`]];
      await context.sync();
    });
    return { ok: true, message: `Formula inserted in active cell` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Insert failed" };
  }
}

export async function insertFormulaInAddress(formula: string, address: string): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(address);
      range.values = [[formula.startsWith("=") ? formula : `=${formula}`]];
      await context.sync();
    });
    return { ok: true, message: `Formula inserted at ${address}` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Insert failed" };
  }
}

export async function applyFillColorToSelection(color: string): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.format.fill.color = resolveColor(color);
      await context.sync();
    });
    return { ok: true, message: `Fill color ${color} applied to selection` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Color apply failed" };
  }
}

export async function applyConditionalColorToSelection(rule: ColorConditionRule): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.load("address");
      await context.sync();

      const cf = range.conditionalFormats.add(Excel.ConditionalFormatType.cellValue);
      cf.cellValue.format.fill.color = rule.fillColor;
      if (rule.fontColor) cf.cellValue.format.font.color = rule.fontColor;
      cf.cellValue.rule = {
        formula1: `${rule.value}`,
        operator: Excel.ConditionalCellValueOperator[rule.operator],
      };
      await context.sync();
    });
    return { ok: true, message: `Conditional color applied` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Conditional format failed" };
  }
}

export async function clearConditionalFormatsFromSelection(): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.conditionalFormats.clearAll();
      await context.sync();
    });
    return { ok: true, message: "Conditional formats cleared" };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Clear failed" };
  }
}

export async function clearFillColorFromSelection(): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.format.fill.clear();
      await context.sync();
    });
    return { ok: true, message: "Fill color cleared" };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Clear failed" };
  }
}
