import { useState, useRef } from "react";
import {
  AlertTriangle, Printer, Table2, Eye, ChevronDown, ChevronUp,
  Grid3X3, Maximize2, FileText, Copy, CheckCircle2, AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

// ─── PAPER SIZE CONSTANTS ──────────────────────────────────────────────────
const PAPER = {
  A4: { w: 210, h: 297, label: "A4 (210×297mm)" },
  A3: { w: 297, h: 420, label: "A3 (297×420mm)" },
};
const MARGIN = 15; // mm each side
const MM_TO_PX = 3.78;
const MM_TO_EXCEL_W = 0.55; // approx mm → Excel column width units

// ─── EMPTY FIELD RADAR ────────────────────────────────────────────────────────
type CellStatus = "filled" | "empty" | "header";

function EmptyFieldRadar() {
  const [rawData, setRawData] = useState("");
  const [grid, setGrid] = useState<{ value: string; status: CellStatus }[][]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [analyzed, setAnalyzed] = useState(false);
  const [emptyCount, setEmptyCount] = useState(0);

  function analyzeData() {
    if (!rawData.trim()) return;
    const separator = rawData.includes("\t") ? "\t" : ",";
    const rows = rawData
      .trim()
      .split("\n")
      .map((line) => line.split(separator).map((cell) => cell.trim()));

    const result: typeof grid = rows.map((row, ri) =>
      row.map((cell) => ({
        value: cell,
        status: (ri === 0 && hasHeader ? "header" : cell === "" ? "empty" : "filled") as CellStatus,
      }))
    );

    let empty = 0;
    result.forEach((row, ri) =>
      row.forEach((cell) => {
        if (ri === 0 && hasHeader) return;
        if (cell.status === "empty") empty++;
      })
    );

    setGrid(result);
    setEmptyCount(empty);
    setAnalyzed(true);
  }

  const emptyCellPositions = analyzed
    ? grid.flatMap((row, ri) =>
        row
          .map((cell, ci) => ({ cell, ri, ci }))
          .filter(({ cell, ri }) => cell.status === "empty" && !(ri === 0 && hasHeader))
          .map(({ ri, ci }) => {
            const col = String.fromCharCode(65 + ci);
            const row = hasHeader ? ri : ri + 1;
            return `${col}${row}`;
          })
      )
    : [];

  return (
    <Card className="border-amber-200 dark:border-amber-800 shadow-none">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          رادار الخلايا الفارغة / Empty Field Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2.5">
        <p className="text-[10px] text-muted-foreground">
          الصق بياناتك (مفصولة بفاصلة أو Tab) لاكتشاف الخلايا الفارغة / Paste CSV or tab-separated data
        </p>
        <Textarea
          value={rawData}
          onChange={(e) => { setRawData(e.target.value); setAnalyzed(false); }}
          placeholder={"الاسم, الراتب, الساعات\nأحمد, 5000,\nسارة, , 45\nمحمد, 4500, 40"}
          className="resize-none min-h-[80px] text-xs font-mono leading-relaxed"
          dir="auto"
          data-testid="input-empty-radar"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded"
            />
            الصف الأول عنوان / First row is header
          </label>
        </div>
        <Button
          onClick={analyzeData}
          size="sm"
          className="w-full h-7 text-xs"
          disabled={!rawData.trim()}
          data-testid="button-analyze-empty"
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          فحص / Scan for Empty Cells
        </Button>

        {analyzed && (
          <div className="space-y-2 animate-in fade-in">
            {/* Summary */}
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${emptyCount > 0 ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" : "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"}`}>
              {emptyCount > 0 ? (
                <><AlertTriangle className="w-3 h-3" /> تم اكتشاف {emptyCount} خلية فارغة / {emptyCount} empty {emptyCount === 1 ? "cell" : "cells"} found</>
              ) : (
                <><CheckCircle2 className="w-3 h-3" /> لا توجد خلايا فارغة / No empty cells detected</>
              )}
            </div>

            {/* Grid Preview */}
            {grid.length > 0 && (
              <div className="overflow-x-auto rounded border border-border">
                <table className="text-[10px] w-full border-collapse">
                  <tbody>
                    {grid.map((row, ri) => (
                      <tr key={ri}>
                        <td className="px-1 text-muted-foreground bg-muted/50 border-r border-border font-mono text-[9px] select-none">
                          {ri + 1}
                        </td>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={`px-1.5 py-0.5 border border-border/30 max-w-[80px] truncate ${
                              cell.status === "header"
                                ? "font-semibold bg-muted/60 text-foreground"
                                : cell.status === "empty"
                                ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-mono"
                                : "bg-background text-foreground"
                            }`}
                            title={cell.value || "(empty)"}
                          >
                            {cell.status === "empty" ? "⚠ فارغ" : cell.value || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty positions list */}
            {emptyCellPositions.length > 0 && (
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium text-red-600 dark:text-red-400">الخلايا الفارغة / Empty cells: </span>
                {emptyCellPositions.join(", ")}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SMART PRINT-FIT ─────────────────────────────────────────────────────────
function SmartPrintFit() {
  const [paper, setPaper] = useState<"A4" | "A3">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [cols, setCols] = useState("5");
  const [rows, setRows] = useState("20");
  const [fontSize, setFontSize] = useState("11");
  const [result, setResult] = useState<null | {
    colWidthMm: number;
    colWidthExcel: number;
    rowHeightPt: number;
    scalePct: number;
    fitsOnOnePage: boolean;
    recommendedFontSize: number;
    pageWidthPx: number;
    pageHeightPx: number;
    printableW: number;
    printableH: number;
  }>(null);

  function calculate() {
    const numCols = Math.max(1, parseInt(cols) || 5);
    const numRows = Math.max(1, parseInt(rows) || 20);
    const fs = Math.max(6, parseInt(fontSize) || 11);

    const { w: rawW, h: rawH } = PAPER[paper];
    const pageW = orientation === "portrait" ? rawW : rawH;
    const pageH = orientation === "portrait" ? rawH : rawW;

    const printableW = pageW - 2 * MARGIN;
    const printableH = pageH - 2 * MARGIN;

    const colWidthMm = parseFloat((printableW / numCols).toFixed(1));
    const colWidthExcel = parseFloat((colWidthMm * MM_TO_EXCEL_W).toFixed(2));

    // Row height in pt: typical Excel row is 15pt for 11pt font
    const rowHeightPt = parseFloat((fs * 1.4).toFixed(1));
    // Total content height in mm (1pt ≈ 0.353mm)
    const contentHeightMm = numRows * rowHeightPt * 0.353 + 10; // +10 for header

    const fitsOnOnePage = contentHeightMm <= printableH;
    const scalePct = fitsOnOnePage
      ? 100
      : parseFloat(((printableH / contentHeightMm) * 100).toFixed(1));

    const recommendedFontSize = scalePct < 100 ? Math.max(6, Math.floor(fs * scalePct / 100)) : fs;

    setResult({
      colWidthMm,
      colWidthExcel,
      rowHeightPt,
      scalePct,
      fitsOnOnePage,
      recommendedFontSize,
      pageWidthPx: pageW * MM_TO_PX,
      pageHeightPx: pageH * MM_TO_PX,
      printableW,
      printableH,
    });
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 shadow-none">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
          الضبط الذكي للطباعة / Smart Print-Fit
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2.5">
        <p className="text-[10px] text-muted-foreground">
          احسب الأبعاد المثالية لضبط بياناتك على ورق A4/A3 / Calculate optimal dimensions for A4/A3 printing
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">حجم الورق / Paper</label>
            <select
              value={paper}
              onChange={(e) => setPaper(e.target.value as "A4" | "A3")}
              className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
              data-testid="select-paper-size"
            >
              <option value="A4">A4 (210×297mm)</option>
              <option value="A3">A3 (297×420mm)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">الاتجاه / Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")}
              className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
              data-testid="select-orientation"
            >
              <option value="portrait">عمودي / Portrait</option>
              <option value="landscape">أفقي / Landscape</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">عدد الأعمدة / Columns</label>
            <Input value={cols} onChange={(e) => setCols(e.target.value)} type="number" min="1" max="50" className="h-7 text-xs" data-testid="input-print-cols" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">عدد الصفوف / Rows</label>
            <Input value={rows} onChange={(e) => setRows(e.target.value)} type="number" min="1" max="500" className="h-7 text-xs" data-testid="input-print-rows" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground block mb-1">حجم الخط الحالي / Font Size (pt)</label>
            <Input value={fontSize} onChange={(e) => setFontSize(e.target.value)} type="number" min="6" max="72" className="h-7 text-xs" data-testid="input-print-font" />
          </div>
        </div>

        <Button onClick={calculate} size="sm" className="w-full h-7 text-xs" data-testid="button-calculate-print-fit">
          <Printer className="w-3 h-3 mr-1" />
          احسب / Calculate Fit
        </Button>

        {result && (
          <div className="space-y-2 animate-in fade-in">
            <div className={`text-[10px] font-medium px-2 py-1.5 rounded-md flex items-center gap-1.5 ${
              result.fitsOnOnePage
                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            }`}>
              {result.fitsOnOnePage
                ? <><CheckCircle2 className="w-3 h-3" /> يتناسب مع صفحة واحدة / Fits on one page</>
                : <><AlertTriangle className="w-3 h-3" /> يحتاج تكبير/تصغير / Scaling required</>
              }
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "عرض العمود (Excel)", en: "Col Width (Excel)", val: `${result.colWidthExcel}` },
                { label: "عرض العمود (mm)", en: "Col Width (mm)", val: `${result.colWidthMm}mm` },
                { label: "ارتفاع الصف", en: "Row Height", val: `${result.rowHeightPt}pt` },
                { label: "نسبة التكبير", en: "Scale", val: `${result.scalePct}%`, highlight: result.scalePct < 100 },
                { label: "حجم الخط المقترح", en: "Rec. Font Size", val: `${result.recommendedFontSize}pt`, highlight: result.recommendedFontSize !== parseInt(fontSize) },
                { label: "مساحة الطباعة", en: "Print Area", val: `${result.printableW}×${result.printableH}mm` },
              ].map((item) => (
                <div key={item.label} className={`rounded border p-1.5 ${item.highlight ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950" : "border-border bg-muted/30"}`}>
                  <div className="text-[9px] text-muted-foreground">{item.label}</div>
                  <div className={`font-mono text-xs font-bold ${item.highlight ? "text-amber-700 dark:text-amber-300" : "text-foreground"}`}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* Mini page preview */}
            <div className="relative mx-auto border-2 border-border rounded shadow-sm bg-white dark:bg-zinc-900"
              style={{
                width: `${Math.round(result.pageWidthPx / 4)}px`,
                height: `${Math.round(result.pageHeightPx / 4)}px`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border border-dashed border-muted-foreground/30 flex flex-col gap-0.5 p-1"
                  style={{
                    width: `${Math.round((result.printableW / (result.pageWidthPx / MM_TO_PX)) * (result.pageWidthPx / 4))}px`,
                    height: `${Math.round((result.printableH / (result.pageHeightPx / MM_TO_PX)) * (result.pageHeightPx / 4))}px`,
                  }}
                >
                  {Array.from({ length: Math.min(5, parseInt(rows) || 5) }).map((_, i) => (
                    <div key={i} className="flex gap-0.5 flex-1">
                      {Array.from({ length: Math.min(parseInt(cols) || 5, 8) }).map((_, j) => (
                        <div key={j} className={`flex-1 rounded-sm ${i === 0 ? "bg-primary/30" : "bg-muted/60"}`} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0.5 left-0 right-0 text-center text-[7px] text-muted-foreground">
                {paper} {orientation === "portrait" ? "↕" : "↔"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── PROFESSIONAL REPORT VIEW ─────────────────────────────────────────────────
function ProfessionalReportView() {
  const [title, setTitle] = useState("");
  const [headersRaw, setHeadersRaw] = useState("");
  const [dataRaw, setDataRaw] = useState("");
  const [showReport, setShowReport] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  function parseHeaders(): string[] {
    if (!headersRaw.trim()) return [];
    const sep = headersRaw.includes("\t") ? "\t" : ",";
    return headersRaw.split(sep).map((h) => h.trim());
  }

  function parseRows(): string[][] {
    if (!dataRaw.trim()) return [];
    const sep = dataRaw.includes("\t") ? "\t" : ",";
    return dataRaw
      .trim()
      .split("\n")
      .map((line) => line.split(sep).map((c) => c.trim()));
  }

  const headers = parseHeaders();
  const rows = parseRows();
  const canRender = headers.length > 0 && rows.length > 0;

  function handlePrint() {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html dir="auto"><head>
      <meta charset="UTF-8">
      <title>${title || "Report"}</title>
      <style>
        @page { margin: 15mm; size: A4 portrait; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        body { padding: 10px; }
        h1 { font-size: 16pt; font-weight: 700; text-align: center; margin-bottom: 12px; color: #1a1a1a; border-bottom: 2px solid #16a34a; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 10pt; }
        th { background: #16a34a; color: white; font-weight: 700; padding: 6px 8px; text-align: center; border: 1px solid #15803d; }
        td { padding: 5px 8px; border: 1px solid #d1d5db; text-align: center; }
        tr:nth-child(even) td { background: #f0fdf4; }
        tr:last-child td { font-weight: 600; background: #dcfce7; }
        .meta { text-align: left; font-size: 8pt; color: #6b7280; margin-top: 10px; }
        @media print { button { display: none; } }
      </style>
      </head><body>
      ${printRef.current.innerHTML}
      <div class="meta">تاريخ الطباعة / Printed: ${new Date().toLocaleString("ar-EG")}</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 400);
  }

  return (
    <Card className="border-primary/30 shadow-none">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" />
          عرض التقرير الاحترافي / Professional Report View
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2.5">
        {!showReport ? (
          <>
            <p className="text-[10px] text-muted-foreground">
              أدخل بيانات تقريرك لعرضها في جدول احترافي جاهز للطباعة / Enter report data for a print-ready professional table
            </p>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">عنوان التقرير / Report Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="تقرير الرواتب الشهري / Monthly Salary Report" className="h-7 text-xs" dir="auto" data-testid="input-report-title" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">العناوين / Headers (مفصولة بفاصلة)</label>
              <Input value={headersRaw} onChange={(e) => setHeadersRaw(e.target.value)} placeholder="الاسم, الراتب, الساعات, الإجمالي" className="h-7 text-xs font-mono" dir="auto" data-testid="input-report-headers" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">البيانات / Data (سطر لكل صف)</label>
              <Textarea
                value={dataRaw}
                onChange={(e) => setDataRaw(e.target.value)}
                placeholder={"أحمد محمد, 5000, 40, 5000\nسارة علي, 6500, 45, 7250\nالمجموع, 11500, -, 12250"}
                className="resize-none min-h-[80px] text-xs font-mono leading-relaxed"
                dir="auto"
                data-testid="input-report-data"
              />
            </div>
            <Button
              onClick={() => setShowReport(true)}
              disabled={!canRender}
              size="sm"
              className="w-full h-7 text-xs"
              data-testid="button-preview-report"
            >
              <Eye className="w-3 h-3 mr-1" />
              معاينة التقرير / Preview Report
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setShowReport(false)}>
                تعديل / Edit
              </Button>
              <Button size="sm" className="flex-1 h-7 text-xs" onClick={handlePrint} data-testid="button-print-report">
                <Printer className="w-3 h-3 mr-1" />
                طباعة / Print
              </Button>
            </div>

            {/* Report preview */}
            <div
              ref={printRef}
              className="rounded-md border border-border overflow-hidden"
            >
              {title && (
                <div className="bg-primary text-primary-foreground text-center font-bold px-3 py-2 text-sm">
                  {title}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-primary/10 border-b-2 border-primary/30">
                      {headers.map((h, i) => (
                        <th key={i} className="px-2 py-1.5 font-bold text-foreground text-center border-x border-border/30">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className={`border-b border-border/20 ${
                          ri === rows.length - 1
                            ? "bg-primary/5 font-semibold"
                            : ri % 2 === 0
                            ? "bg-background"
                            : "bg-muted/30"
                        }`}
                      >
                        {headers.map((_, ci) => (
                          <td key={ci} className="px-2 py-1 text-center border-x border-border/20" dir="auto">
                            {row[ci] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-2 py-1 bg-muted/30 text-[9px] text-muted-foreground flex justify-between">
                <span>{rows.length} صف / rows</span>
                <span>{headers.length} عمود / cols</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── MAIN TOOLS TAB ──────────────────────────────────────────────────────────
type Section = "empty" | "print" | "report";

export function ToolsTab() {
  const [open, setOpen] = useState<Section | null>("empty");

  const sections: { id: Section; title: string; arTitle: string; icon: React.ReactNode; color: string }[] = [
    { id: "empty",  title: "Empty Field Radar",        arTitle: "رادار الخلايا الفارغة",      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />, color: "border-amber-200 dark:border-amber-800" },
    { id: "print",  title: "Smart Print-Fit",          arTitle: "الضبط الذكي للطباعة",       icon: <Maximize2 className="w-3.5 h-3.5 text-blue-500" />,     color: "border-blue-200 dark:border-blue-800" },
    { id: "report", title: "Professional Report View", arTitle: "عرض التقرير الاحترافي",     icon: <FileText className="w-3.5 h-3.5 text-primary" />,        color: "border-primary/30" },
  ];

  return (
    <div>
      <div className="px-[10px] pt-3 pb-8 space-y-3">
        <div className="rounded-lg bg-gradient-to-br from-slate-100 via-slate-50 to-transparent dark:from-slate-800 dark:via-slate-900 border border-border p-3">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold">أدوات متقدمة / Advanced Tools</h2>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            أدوات مساعدة احترافية لتحليل البيانات والطباعة / Professional helpers for data analysis and printing
          </p>
        </div>

        {sections.map((s) => (
          <div key={s.id}>
            <button
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border bg-card hover:bg-muted/40 transition-colors text-left"
              onClick={() => setOpen(open === s.id ? null : s.id)}
              data-testid={`toggle-tool-${s.id}`}
            >
              <div className="flex items-center gap-2">
                {s.icon}
                <div>
                  <div className="text-xs font-semibold text-foreground">{s.arTitle}</div>
                  <div className="text-[10px] text-muted-foreground">{s.title}</div>
                </div>
              </div>
              {open === s.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>

            {open === s.id && (
              <div className="mt-1.5 animate-in fade-in slide-in-from-top-1">
                {s.id === "empty"  && <EmptyFieldRadar />}
                {s.id === "print"  && <SmartPrintFit />}
                {s.id === "report" && <ProfessionalReportView />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
