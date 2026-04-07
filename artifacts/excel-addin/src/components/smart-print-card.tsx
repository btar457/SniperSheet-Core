import { useState, useRef } from "react";
import {
  Printer, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2,
  Download, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionInfo } from "@/hooks/use-selection-sensor";
import { readSelectionValues } from "@/lib/excel-actions";

const PAPER = {
  A4:  { w: 210, h: 297, label: "A4 (210×297mm)" },
  A3:  { w: 297, h: 420, label: "A3 (297×420mm)" },
  A5:  { w: 148, h: 210, label: "A5 (148×210mm)" },
  Letter: { w: 216, h: 279, label: "Letter (216×279mm)" },
};
const MARGIN = 12;
const MM_TO_PX = 3.78;

type PaperKey = keyof typeof PAPER;
type Orientation = "portrait" | "landscape";

interface Props {
  selection: SelectionInfo | null;
  isWatching: boolean;
}

export function SmartPrintCard({ selection, isWatching }: Props) {
  const [paper, setPaper] = useState<PaperKey>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [reportTitle, setReportTitle] = useState("");
  const [data, setData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const pageW = orientation === "portrait" ? PAPER[paper].w : PAPER[paper].h;
  const pageH = orientation === "portrait" ? PAPER[paper].h : PAPER[paper].w;
  const printW = pageW - 2 * MARGIN;
  const printH = pageH - 2 * MARGIN;

  async function handleReadFromExcel() {
    if (!isWatching) return;
    setLoadingData(true);
    const result = await readSelectionValues();
    if (result) {
      setData(result);
      setShowPreview(true);
    }
    setLoadingData(false);
  }

  function handlePrint() {
    if (!printRef.current) return;
    const pw = window.open("", "_blank", "width=900,height=700");
    if (!pw) return;
    pw.document.write(`<!DOCTYPE html><html dir="auto"><head>
      <meta charset="UTF-8">
      <title>${reportTitle || "تقرير SniperSheet"}</title>
      <style>
        @page { margin: ${MARGIN}mm; size: ${paper} ${orientation}; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        body { padding: 0; }
        h1 { font-size: 14pt; font-weight: 700; text-align: center; margin-bottom: 10px;
              color: #1a1a1a; border-bottom: 2px solid #107C41; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        th { background: #107C41; color: white; font-weight: 700; padding: 5px 6px;
              text-align: center; border: 1px solid #0d6633; }
        td { padding: 4px 6px; border: 1px solid #d1d5db; text-align: center; }
        tr:nth-child(even) td { background: #f0fdf4; }
        tr:last-child td { font-weight: 600; background: #dcfce7; }
        .meta { text-align: left; font-size: 7pt; color: #6b7280; margin-top: 8px; }
        .page-info { text-align: center; font-size: 7pt; color: #6b7280; margin-top: 4px; }
        @media print { button { display: none; } }
      </style></head><body>
      ${printRef.current.innerHTML}
      <div class="meta">طُبع بواسطة SniperSheet · ${new Date().toLocaleString("ar-EG")}</div>
      </body></html>`);
    pw.document.close();
    setTimeout(() => pw.print(), 400);
  }

  const noSel = !isWatching || !selection;
  const cols = data?.headers.length ?? 0;
  const colWidthPct = cols > 0 ? `${(100 / cols).toFixed(1)}%` : "auto";

  return (
    <Card className="border-blue-200 dark:border-blue-800 shadow-none">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Printer className="w-3.5 h-3.5 text-blue-500" />
          الطباعة الذكية / Smart Print
          {selection?.shortAddress && isWatching && (
            <span className="ms-auto text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
              {selection.shortAddress}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">

        {/* Settings row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">حجم الورق / Paper</label>
            <select
              value={paper}
              onChange={(e) => setPaper(e.target.value as PaperKey)}
              className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
            >
              {Object.entries(PAPER).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">الاتجاه / Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as Orientation)}
              className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
            >
              <option value="portrait">عمودي / Portrait</option>
              <option value="landscape">أفقي / Landscape</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">عنوان التقرير / Report Title (اختياري)</label>
          <Input
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="تقرير الرواتب الشهري..."
            className="h-7 text-xs"
            dir="auto"
          />
        </div>

        {/* Page dimensions info */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5">
          <span>منطقة الطباعة: <strong className="text-foreground">{printW}×{printH}mm</strong></span>
          {cols > 0 && <span>عرض العمود: <strong className="text-foreground">{(printW / cols).toFixed(1)}mm</strong></span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-[11px]"
            onClick={handleReadFromExcel}
            disabled={noSel || loadingData}
          >
            {loadingData ? (
              <Loader2 className="w-3 h-3 animate-spin me-1" />
            ) : (
              <RefreshCw className="w-3 h-3 me-1" />
            )}
            قراءة من Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-[11px]"
            onClick={() => setShowPreview((v) => !v)}
            disabled={!data}
          >
            {showPreview ? <EyeOff className="w-3 h-3 me-1" /> : <Eye className="w-3 h-3 me-1" />}
            {showPreview ? "إخفاء" : "معاينة"}
          </Button>
        </div>

        {noSel && (
          <p className="text-[10px] text-muted-foreground text-center py-1 border border-dashed rounded-md bg-muted/30">
            حدّد خلايا في Excel ثم اضغط "قراءة من Excel"
          </p>
        )}

        {/* Live preview */}
        {showPreview && data && (
          <div className="space-y-2 animate-in fade-in">
            {/* Scaled page preview */}
            <div className="relative mx-auto border-2 border-border rounded-sm shadow-md bg-white dark:bg-zinc-900 overflow-hidden"
              style={{
                width: `${Math.round((pageW * MM_TO_PX) / 4)}px`,
                height: `${Math.round((pageH * MM_TO_PX) / 4)}px`,
              }}
            >
              <div className="absolute inset-0 flex flex-col p-1.5 overflow-hidden"
                style={{
                  margin: `${Math.round((MARGIN * MM_TO_PX) / 4)}px`,
                }}
              >
                {reportTitle && (
                  <div className="text-[5px] font-bold text-center truncate border-b border-green-600 pb-0.5 mb-0.5 text-zinc-800 dark:text-zinc-200">
                    {reportTitle}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex gap-px mb-px">
                    {data.headers.map((h, i) => (
                      <div key={i} className="bg-green-700 text-white text-[4px] font-bold flex-1 px-0.5 truncate text-center">{h}</div>
                    ))}
                  </div>
                  {data.rows.slice(0, 8).map((row, ri) => (
                    <div key={ri} className="flex gap-px mb-px">
                      {data.headers.map((_, ci) => (
                        <div key={ci} className={`text-[4px] flex-1 px-0.5 truncate text-center ${ri % 2 === 0 ? "bg-zinc-50 dark:bg-zinc-800" : "bg-green-50 dark:bg-green-950/30"}`}>
                          {row[ci] ?? ""}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0.5 left-0 right-0 text-center text-[4px] text-zinc-400">
                {paper} {orientation === "portrait" ? "↕" : "↔"} · {data.rows.length} rows
              </div>
            </div>

            {/* Data summary */}
            <div className={`flex items-center gap-2 text-[11px] px-2 py-1.5 rounded border ${
              data.headers.length > 0
                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            }`}>
              {data.headers.length > 0
                ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
              <span>{data.headers.length} عمود · {data.rows.length} صف · {selection?.shortAddress}</span>
            </div>

            {/* Print button */}
            <Button className="w-full h-9 font-semibold" onClick={handlePrint}>
              <Printer className="w-4 h-4 me-2" />
              طباعة / Print
              <span className="ms-2 text-[10px] opacity-70">{paper} {orientation === "portrait" ? "↕" : "↔"}</span>
            </Button>
          </div>
        )}

        {/* Hidden print template */}
        <div className="hidden">
          <div ref={printRef}>
            {reportTitle && <h1>{reportTitle}</h1>}
            {data && (
              <table>
                <thead>
                  <tr>{data.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {data.rows.map((row, ri) => (
                    <tr key={ri}>
                      {data.headers.map((_, ci) => <td key={ci}>{row[ci] ?? ""}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
