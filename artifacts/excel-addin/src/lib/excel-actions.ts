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

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ColorConditionRule {
  operator: "GreaterThan" | "LessThan" | "GreaterThanOrEqualTo" | "LessThanOrEqualTo" | "EqualTo" | "NotEqualTo";
  value: number;
  fillColor: string;
  fontColor?: string;
}

export interface RangeFormat {
  columnWidth: number | null;
  rowHeight: number | null;
  fontSize: number | null;
  fontName: string | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fillColor: string | null;
  fontColor: string | null;
  horizontalAlignment: string | null;
  verticalAlignment: string | null;
  wrapText: boolean;
}

export interface CellData {
  address: string;
  formula: string | null;
  value: string | null;
  hasFormula: boolean;
}

// ─── PARSE COLOR CONDITION ────────────────────────────────────────────────────

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
    if (m) return { operator: op, value: parseFloat(m[1]), fillColor: resolveColor(m[2]) };
  }
  return null;
}

// ─── FORMULA INSERT ───────────────────────────────────────────────────────────

export async function insertFormulaInActiveCell(formula: string): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const cell = context.workbook.getActiveCell();
      const f = formula.startsWith("=") ? formula : `=${formula}`;
      cell.formulas = [[f]];
      await context.sync();
    });
    return { ok: true, message: "Formula inserted in active cell" };
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
      range.load(["rowCount", "columnCount"]);
      await context.sync();

      const f = formula.startsWith("=") ? formula : `=${formula}`;
      const numRows = range.rowCount;
      const numCols = range.columnCount;

      // Fill every cell in the range — Excel auto-adjusts relative references per cell
      const matrix = Array.from({ length: numRows }, () => Array(numCols).fill(f));
      range.formulas = matrix;
      await context.sync();
    });
    return { ok: true, message: `Formula inserted at ${address}` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Insert failed" };
  }
}

// ─── COLOR / CONDITIONAL FORMAT ───────────────────────────────────────────────

export async function applyFillColorToSelection(color: string): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.format.fill.color = resolveColor(color);
      await context.sync();
    });
    return { ok: true, message: `Fill color applied` };
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
    return { ok: true, message: "Conditional color applied" };
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

// ─── CELL FORMAT READ / WRITE ─────────────────────────────────────────────────

export async function readSelectionFormat(): Promise<RangeFormat | null> {
  if (!isExcelAvailable()) return null;
  try {
    let fmt: RangeFormat = {
      columnWidth: null, rowHeight: null, fontSize: null, fontName: null,
      bold: false, italic: false, underline: false, fillColor: null,
      fontColor: null, horizontalAlignment: null, verticalAlignment: null, wrapText: false,
    };
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.load([
        "format/columnWidth", "format/rowHeight",
        "format/font/size", "format/font/name", "format/font/bold",
        "format/font/italic", "format/font/underline",
        "format/fill/color", "format/font/color",
        "format/horizontalAlignment", "format/verticalAlignment",
        "format/wrapText",
      ]);
      await context.sync();
      fmt = {
        columnWidth: typeof range.format.columnWidth === "number" ? Math.round(range.format.columnWidth * 10) / 10 : null,
        rowHeight:   typeof range.format.rowHeight   === "number" ? Math.round(range.format.rowHeight   * 10) / 10 : null,
        fontSize:    range.format.font.size   ?? null,
        fontName:    range.format.font.name   ?? null,
        bold:        range.format.font.bold   === true,
        italic:      range.format.font.italic === true,
        underline:   range.format.font.underline === "Single",
        fillColor:   range.format.fill.color  ?? null,
        fontColor:   range.format.font.color  ?? null,
        horizontalAlignment: range.format.horizontalAlignment ?? null,
        verticalAlignment:   range.format.verticalAlignment   ?? null,
        wrapText:    range.format.wrapText === true,
      };
    });
    return fmt;
  } catch {
    return null;
  }
}

export async function applySelectionFormat(changes: Partial<RangeFormat>): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      if (changes.columnWidth != null)       range.format.columnWidth = changes.columnWidth;
      if (changes.rowHeight   != null)       range.format.rowHeight   = changes.rowHeight;
      if (changes.fontSize    != null)       range.format.font.size   = changes.fontSize;
      if (changes.fontName    != null)       range.format.font.name   = changes.fontName;
      if (changes.bold        != null)       range.format.font.bold   = changes.bold;
      if (changes.italic      != null)       range.format.font.italic = changes.italic;
      if (changes.underline   != null)       range.format.font.underline = changes.underline ? "Single" : "None";
      if (changes.fillColor   != null)       range.format.fill.color  = resolveColor(changes.fillColor);
      if (changes.fontColor   != null)       range.format.font.color  = resolveColor(changes.fontColor);
      if (changes.horizontalAlignment != null) range.format.horizontalAlignment = changes.horizontalAlignment;
      if (changes.verticalAlignment   != null) range.format.verticalAlignment   = changes.verticalAlignment;
      if (changes.wrapText    != null)       range.format.wrapText    = changes.wrapText;
      await context.sync();
    });
    return { ok: true, message: "Format applied to selection" };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Format apply failed" };
  }
}

// ─── ACTIVE CELL FORMULA READ ─────────────────────────────────────────────────

export async function readActiveCellData(): Promise<CellData | null> {
  if (!isExcelAvailable()) return null;
  try {
    let data: CellData = { address: "", formula: null, value: null, hasFormula: false };
    await Excel.run(async (context: any) => {
      const cell = context.workbook.getActiveCell();
      cell.load(["address", "formulas", "values"]);
      await context.sync();
      const rawAddr: string = cell.address ?? "";
      const short = rawAddr.includes("!") ? rawAddr.split("!")[1] : rawAddr;
      const formula = cell.formulas?.[0]?.[0];
      const value   = cell.values?.[0]?.[0];
      const hasFormula = typeof formula === "string" && formula.startsWith("=");
      data = {
        address: short,
        formula: hasFormula ? formula : null,
        value: value != null ? String(value) : null,
        hasFormula,
      };
    });
    return data;
  } catch {
    return null;
  }
}

// ─── SMART COPY ───────────────────────────────────────────────────────────────

export async function smartCopyFormulaToRange(sourceAddress: string, targetAddress: string): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const src = sheet.getRange(sourceAddress);
      const tgt = sheet.getRange(targetAddress);
      tgt.copyFrom(src, Excel.RangeCopyType.formulas);
      await context.sync();
    });
    return { ok: true, message: `Formula copied from ${sourceAddress} to ${targetAddress}` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Smart copy failed" };
  }
}

// ─── PRINT AREA ───────────────────────────────────────────────────────────────

// ─── AUTO FIT ─────────────────────────────────────────────────────────────────

export async function autoFitSelectionColumns(): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.format.autofitColumns();
      await context.sync();
    });
    return { ok: true, message: "Columns auto-fitted" };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "AutoFit failed" };
  }
}

export async function autoFitSelectionRows(): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.format.autofitRows();
      await context.sync();
    });
    return { ok: true, message: "Rows auto-fitted" };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "AutoFit failed" };
  }
}

// ─── BORDERS ─────────────────────────────────────────────────────────────────

export type BorderPreset = "none" | "all" | "outside" | "thick" | "dashed";

export async function applyBorderPreset(preset: BorderPreset): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      const fmt = range.format;
      const sides = ["EdgeTop", "EdgeBottom", "EdgeLeft", "EdgeRight", "InsideHorizontal", "InsideVertical"] as const;

      if (preset === "none") {
        sides.forEach((s) => {
          fmt.borders.getItem(s).style = Excel.BorderLineStyle.none;
        });
      } else if (preset === "all") {
        sides.forEach((s) => {
          fmt.borders.getItem(s).style = Excel.BorderLineStyle.continuous;
          fmt.borders.getItem(s).weight = Excel.BorderWeight.thin;
          fmt.borders.getItem(s).color = "#000000";
        });
      } else if (preset === "outside") {
        const inner = ["InsideHorizontal", "InsideVertical"] as const;
        const outer = ["EdgeTop", "EdgeBottom", "EdgeLeft", "EdgeRight"] as const;
        inner.forEach((s) => { fmt.borders.getItem(s).style = Excel.BorderLineStyle.none; });
        outer.forEach((s) => {
          fmt.borders.getItem(s).style = Excel.BorderLineStyle.continuous;
          fmt.borders.getItem(s).weight = Excel.BorderWeight.medium;
          fmt.borders.getItem(s).color = "#000000";
        });
      } else if (preset === "thick") {
        sides.forEach((s) => {
          fmt.borders.getItem(s).style = Excel.BorderLineStyle.continuous;
          fmt.borders.getItem(s).weight = Excel.BorderWeight.thick;
          fmt.borders.getItem(s).color = "#000000";
        });
      } else if (preset === "dashed") {
        sides.forEach((s) => {
          fmt.borders.getItem(s).style = Excel.BorderLineStyle.dash;
          fmt.borders.getItem(s).weight = Excel.BorderWeight.thin;
          fmt.borders.getItem(s).color = "#666666";
        });
      }
      await context.sync();
    });
    return { ok: true, message: `Border preset "${preset}" applied` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Border apply failed" };
  }
}

// ─── NUMBER FORMAT ────────────────────────────────────────────────────────────

export async function applyNumberFormat(formatCode: string): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.numberFormat = [[formatCode]];
      await context.sync();
    });
    return { ok: true, message: `Number format applied` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Number format failed" };
  }
}

// ─── MERGE / UNMERGE ──────────────────────────────────────────────────────────

export async function mergeCells(): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.merge(false);
      await context.sync();
    });
    return { ok: true, message: "Cells merged" };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Merge failed" };
  }
}

export async function unmergeCells(): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  try {
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.unmerge();
      await context.sync();
    });
    return { ok: true, message: "Cells unmerged" };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unmerge failed" };
  }
}

// ─── READ SELECTION VALUES ─────────────────────────────────────────────────────

export interface CellFormatInfo {
  fillColor: string | null;
  fontColor: string | null;
  bold: boolean;
  italic: boolean;
  horizontalAlignment: string | null;
}

export interface SelectionValuesAndFormat {
  headers: string[];
  rows: string[][];
  headerFormats: CellFormatInfo[];
  rowFormats: CellFormatInfo[][];
}

export async function readSelectionValues(): Promise<{ headers: string[]; rows: string[][] } | null> {
  if (!isExcelAvailable()) return null;
  try {
    let result: { headers: string[]; rows: string[][] } | null = null;
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.load(["values", "rowCount", "columnCount"]);
      await context.sync();
      if (!range.values || range.rowCount < 1) return;
      const all: string[][] = range.values.map((row: any[]) => row.map((c) => (c == null ? "" : String(c))));
      const headers = all[0];
      const rows    = all.slice(1);
      result = { headers, rows };
    });
    return result;
  } catch {
    return null;
  }
}

export async function readSelectionValuesAndFormat(): Promise<SelectionValuesAndFormat | null> {
  if (!isExcelAvailable()) return null;
  try {
    let result: SelectionValuesAndFormat | null = null;
    await Excel.run(async (context: any) => {
      const range = context.workbook.getSelectedRange();
      range.load(["values", "rowCount", "columnCount"]);
      await context.sync();
      if (!range.values || range.rowCount < 1) return;

      const numRows = Math.min(range.rowCount, 51); // header + max 50 data rows
      const numCols = range.columnCount;

      // Batch all cell format loads in one sync for performance
      const cells: any[][] = [];
      for (let ri = 0; ri < numRows; ri++) {
        cells[ri] = [];
        for (let ci = 0; ci < numCols; ci++) {
          const cell = range.getCell(ri, ci);
          cell.load(["format/fill/color", "format/font/color", "format/font/bold", "format/font/italic", "format/horizontalAlignment"]);
          cells[ri][ci] = cell;
        }
      }
      await context.sync();

      const all: string[][] = range.values.map((row: any[]) => row.map((c) => (c == null ? "" : String(c))));
      const headers = all[0];
      const rows    = all.slice(1);

      const headerFormats: CellFormatInfo[] = [];
      for (let ci = 0; ci < numCols; ci++) {
        const cell = cells[0][ci];
        headerFormats.push({
          fillColor: cell.format.fill.color ?? null,
          fontColor: cell.format.font.color ?? null,
          bold: cell.format.font.bold === true,
          italic: cell.format.font.italic === true,
          horizontalAlignment: cell.format.horizontalAlignment ?? null,
        });
      }

      const rowFormats: CellFormatInfo[][] = [];
      for (let ri = 1; ri < numRows; ri++) {
        const rowFmts: CellFormatInfo[] = [];
        for (let ci = 0; ci < numCols; ci++) {
          const cell = cells[ri][ci];
          rowFmts.push({
            fillColor: cell.format.fill.color ?? null,
            fontColor: cell.format.font.color ?? null,
            bold: cell.format.font.bold === true,
            italic: cell.format.font.italic === true,
            horizontalAlignment: cell.format.horizontalAlignment ?? null,
          });
        }
        rowFormats.push(rowFmts);
      }

      result = { headers, rows, headerFormats, rowFormats };
    });
    return result;
  } catch {
    return null;
  }
}

// ─── APPLY STYLE HINTS FROM AI ────────────────────────────────────────────────

export interface AIStyleHint {
  target: string;
  color?: string | null;
  bold?: boolean | null;
  italic?: boolean | null;
  condition?: string | null;
}

export async function applyAIStyleHints(hints: AIStyleHint[]): Promise<ActionResult> {
  if (!isExcelAvailable()) return { ok: false, error: "Excel not available" };
  if (!hints || hints.length === 0) return { ok: true, message: "No style hints to apply" };

  const results: string[] = [];
  for (const hint of hints) {
    if (!hint.color) continue;
    const hex = resolveColor(hint.color);

    if (hint.condition) {
      // Parse condition like "value > 50" or "> 90"
      const condMatch = hint.condition.match(/([><=!]+)\s*(-?\d+(?:\.\d+)?)/);
      if (condMatch) {
        const opStr = condMatch[1];
        const val   = parseFloat(condMatch[2]);
        const opMap: Record<string, string> = {
          ">":  "GreaterThan",
          ">=": "GreaterThanOrEqualTo",
          "<":  "LessThan",
          "<=": "LessThanOrEqualTo",
          "=":  "EqualTo",
          "==": "EqualTo",
          "!=": "NotEqualTo",
          "<>": "NotEqualTo",
        };
        const op = opMap[opStr] as ColorConditionRule["operator"];
        if (op) {
          const r = await applyConditionalColorToSelection({ operator: op, value: val, fillColor: hex });
          if (r.ok) results.push(`Conditional color applied`);
        }
      }
    } else {
      // Solid fill color
      const r = await applyFillColorToSelection(hex);
      if (r.ok) results.push(`Fill color ${hex} applied`);
    }

    // Bold
    if (hint.bold) {
      await applySelectionFormat({ bold: true });
      results.push("Bold applied");
    }
  }

  return { ok: true, message: results.join("; ") || "Style hints applied" };
}
