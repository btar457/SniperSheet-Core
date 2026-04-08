import { useState, useRef, useCallback, useEffect } from "react";
import {
  Printer, Eye, RefreshCw, Loader2, CheckCircle2, AlertTriangle,
  FileText, Maximize2, Minimize2, LayoutTemplate, AlignJustify,
  ChevronDown, ChevronUp, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectionInfo } from "@/hooks/use-selection-sensor";
import { readSelectionValuesAndFormat, type SelectionValuesAndFormat } from "@/lib/excel-actions";

// ─── PAPER DEFINITIONS (mm) ───────────────────────────────────────────────────
const PAPERS: Record<string, { w: number; h: number; label: string }> = {
  A4:     { w: 210, h: 297, label: "A4 — 210×297mm" },
  A3:     { w: 297, h: 420, label: "A3 — 297×420mm" },
  A5:     { w: 148, h: 210, label: "A5 — 148×210mm" },
  Letter: { w: 216, h: 279, label: "Letter — 216×279mm" },
  Legal:  { w: 216, h: 356, label: "Legal — 216×356mm" },
};

const MARGINS: Record<string, { top: number; bottom: number; left: number; right: number; label: string }> = {
  normal: { top: 25, bottom: 25, left: 18, right: 18, label: "عادي / Normal" },
  narrow: { top: 12, bottom: 12, left: 6,  right: 6,  label: "ضيق / Narrow" },
  wide:   { top: 25, bottom: 25, left: 50, right: 50, label: "واسع / Wide" },
  none:   { top: 5,  bottom: 5,  left: 5,  right: 5,  label: "بلا / None" },
};

const FIT_OPTIONS = [
  { id: "actual",   label: "الحجم الفعلي",    en: "Actual Size",     desc: "بدون تكبير أو تصغير" },
  { id: "fit-page", label: "ملاءمة الصفحة",   en: "Fit to Page",     desc: "كل المحتوى في صفحة واحدة" },
  { id: "fit-width",label: "ملاءمة العرض",    en: "Fit to Width",    desc: "العرض الكامل في صفحة واحدة" },
  { id: "custom",   label: "مقياس مخصص",      en: "Custom Scale",    desc: "حدد نسبة مئوية يدوياً" },
];

type PaperKey = keyof typeof PAPERS;
type MarginKey = keyof typeof MARGINS;
type FitId = "actual" | "fit-page" | "fit-width" | "custom";
type Orientation = "portrait" | "landscape";

// Map Excel horizontalAlignment → CSS textAlign
function toCSSAlign(align: string | null | undefined, value?: string): string {
  if (!align || align === "General") {
    // Auto: numbers right, text left
    const num = parseFloat(value ?? "");
    return isNaN(num) ? "left" : "right";
  }
  const map: Record<string, string> = {
    Left: "left", Center: "center", Right: "right",
    Justify: "justify", Fill: "center", Distributed: "center",
    left: "left", center: "center", right: "right", justify: "justify",
  };
  return map[align] ?? "left";
}

interface Props {
  selection: SelectionInfo | null;
  isWatching: boolean;
}

function OptionBtn({
  active, onClick, children, className = "",
}: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md border text-[11px] font-medium transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background border-border text-foreground hover:bg-muted hover:border-primary/40"
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ─── PAPER PREVIEW ────────────────────────────────────────────────────────────
function PagePreview({
  paperKey, orientation, margin, fit, scale, data, title, showGrid, showHeaders,
}: {
  paperKey: PaperKey;
  orientation: Orientation;
  margin: MarginKey;
  fit: FitId;
  scale: number;
  data: SelectionValuesAndFormat | null;
  title: string;
  showGrid: boolean;
  showHeaders: boolean;
}) {
  const p   = PAPERS[paperKey];
  const m   = MARGINS[margin];
  const pw  = orientation === "portrait" ? p.w : p.h;
  const ph  = orientation === "portrait" ? p.h : p.w;
  const mt  = m.top;
  const mb  = m.bottom;
  const ml  = m.left;
  const mr  = m.right;

  const PREVIEW_W = 280;
  const ratio = PREVIEW_W / pw;
  const PREVIEW_H = ph * ratio;

  const contentW = (pw - ml - mr) * ratio;
  const contentH = (ph - mt - mb) * ratio;
  const contentX = ml * ratio;
  const contentY = mt * ratio;

  const fontSize = fit === "fit-page" || fit === "fit-width"
    ? Math.max(3.5, Math.min(6, (contentW / Math.max(1, data?.headers.length ?? 6)) * 0.35))
    : Math.max(3.5, Math.min(6, 5 * (scale / 100)));

  const cols = data?.headers.length ?? 0;
  const colW = cols > 0 ? contentW / cols : 0;

  return (
    <div className="flex flex-col items-center">
      {/* Page shadow + border */}
      <div
        className="relative bg-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] border border-zinc-300 rounded-[2px] overflow-hidden"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
      >
        {/* Margin guides */}
        <div
          className="absolute border border-dashed border-blue-300/60 pointer-events-none"
          style={{ left: contentX, top: contentY, width: contentW, height: contentH }}
        />

        {/* Content area */}
        <div
          className="absolute overflow-hidden"
          style={{ left: contentX, top: contentY, width: contentW, height: contentH }}
        >
          {/* Report title */}
          {title && (
            <div
              className="text-center font-bold truncate border-b border-zinc-400 pb-[1px] mb-[2px]"
              style={{ fontSize: fontSize + 1, color: "#1a1a1a" }}
            >
              {title}
            </div>
          )}

          {data ? (
            <div className="w-full overflow-hidden">
              {/* Headers */}
              <div className="flex">
                {showHeaders && (
                  <div
                    className="shrink-0 text-center font-bold"
                    style={{ width: colW * 0.3, fontSize, backgroundColor: "#e2e8f0", borderRight: "1px solid #cbd5e1" }}
                  >
                    #
                  </div>
                )}
                {data.headers.map((h, ci) => {
                  const fmt = data.headerFormats?.[ci];
                  const hasCustomFill = fmt?.fillColor && fmt.fillColor !== "transparent" && fmt.fillColor !== "none";
                  return (
                    <div
                      key={ci}
                      className="truncate"
                      style={{
                        width: colW,
                        fontSize,
                        fontWeight: fmt?.bold !== false ? "bold" : "normal",
                        fontStyle: fmt?.italic ? "italic" : "normal",
                        backgroundColor: hasCustomFill ? fmt!.fillColor! : "#107C41",
                        color: fmt?.fontColor && fmt.fontColor !== "transparent" ? fmt.fontColor : (hasCustomFill ? "#1e293b" : "white"),
                        borderRight: showGrid ? "1px solid rgba(0,0,0,0.15)" : "none",
                        padding: "1px 2px",
                        textAlign: toCSSAlign(fmt?.horizontalAlignment, h) as any,
                      }}
                    >
                      {h}
                    </div>
                  );
                })}
              </div>
              {/* Rows */}
              {data.rows.map((row, ri) => (
                <div key={ri} className="flex">
                  {showHeaders && (
                    <div
                      className="shrink-0 text-center"
                      style={{ width: colW * 0.3, fontSize, color: "#94a3b8", borderRight: "1px solid #e2e8f0", padding: "0.5px 1px" }}
                    >
                      {ri + 1}
                    </div>
                  )}
                  {data.headers.map((_, ci) => {
                    const fmt = data.rowFormats?.[ri]?.[ci];
                    const cellVal = row[ci] ?? "";
                    const hasCustomFill = fmt?.fillColor && fmt.fillColor !== "transparent" && fmt.fillColor !== "none";
                    const defaultBg = ri % 2 === 0 ? "white" : "#f8fafc";
                    return (
                      <div
                        key={ci}
                        className="truncate"
                        style={{
                          width: colW,
                          fontSize,
                          fontWeight: fmt?.bold ? "bold" : "normal",
                          fontStyle: fmt?.italic ? "italic" : "normal",
                          backgroundColor: hasCustomFill ? fmt!.fillColor! : defaultBg,
                          color: fmt?.fontColor && fmt.fontColor !== "transparent" ? fmt.fontColor : "#1e293b",
                          borderRight: showGrid ? "1px solid #e2e8f0" : "none",
                          borderBottom: showGrid ? "1px solid #f1f5f9" : "none",
                          padding: "0.5px 2px",
                          textAlign: toCSSAlign(fmt?.horizontalAlignment, cellVal) as any,
                        }}
                      >
                        {cellVal}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1 opacity-30">
              <FileText style={{ width: 18, height: 18, color: "#64748b" }} />
              <span style={{ fontSize: 5.5, color: "#64748b" }}>اضغط "تحديث البيانات"</span>
            </div>
          )}
        </div>

        {/* Paper size label */}
        <div className="absolute bottom-0.5 right-1 text-[5px] text-zinc-400">
          {paperKey} {orientation === "portrait" ? "↕" : "↔"}
        </div>

        {/* Margin guides overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 bg-blue-50/30" style={{ height: contentY }} />
          <div className="absolute bottom-0 left-0 right-0 bg-blue-50/30" style={{ height: contentY }} />
          <div className="absolute top-0 bottom-0 left-0 bg-blue-50/30" style={{ width: contentX }} />
          <div className="absolute top-0 bottom-0 right-0 bg-blue-50/30" style={{ width: contentX }} />
        </div>
      </div>

      {/* Paper dimensions */}
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
        <span>{pw}×{ph}mm</span>
        <span>·</span>
        <span>هامش: {mt}mm</span>
        {data && <><span>·</span><span>{cols} عمود · {data.rows.length} صف</span></>}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function SmartPrintCard({ selection, isWatching }: Props) {
  const [paper,       setPaper]       = useState<PaperKey>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin,      setMargin]      = useState<MarginKey>("normal");
  const [fit,         setFit]         = useState<FitId>("fit-page");
  const [scale,       setScale]       = useState(100);
  const [title,       setTitle]       = useState("");
  const [showGrid,    setShowGrid]    = useState(true);
  const [showHeaders, setShowHeaders] = useState(false);
  const [data,        setData]        = useState<SelectionValuesAndFormat | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [showAdvanced,setShowAdvanced]= useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const noSel = !isWatching || !selection;

  const loadData = useCallback(async () => {
    if (!isWatching) return;
    setLoading(true);
    const result = await readSelectionValuesAndFormat();
    if (result) setData(result);
    setLoading(false);
  }, [isWatching, selection?.shortAddress]);

  useEffect(() => { if (isWatching && selection) loadData(); }, [loadData]);

  const p  = PAPERS[paper];
  const pw = orientation === "portrait" ? p.w : p.h;
  const ph = orientation === "portrait" ? p.h : p.w;
  const m  = MARGINS[margin];

  function handlePrint() {
    if (!printRef.current) return;
    const pw2 = window.open("", "_blank", "width=1000,height=800");
    if (!pw2) return;

    const colCount = data?.headers.length ?? 1;
    const colWidthPct = (100 / colCount).toFixed(2);

    let fitCSS = "";
    if (fit === "fit-page")  fitCSS = `transform: scale(1); transform-origin: top left;`;
    if (fit === "fit-width") fitCSS = `width: 100%;`;
    if (fit === "custom")    fitCSS = `transform: scale(${scale / 100}); transform-origin: top left;`;

    // Build header cells with actual formats + alignment
    const headerCells = data ? data.headers.map((h, ci) => {
      const fmt = data.headerFormats?.[ci];
      const hasFill = fmt?.fillColor && fmt.fillColor !== "transparent" && fmt.fillColor !== "none";
      const bg    = hasFill ? fmt!.fillColor! : "#107C41";
      const color = fmt?.fontColor && fmt.fontColor !== "transparent" ? fmt.fontColor : (hasFill ? "#1e293b" : "white");
      const fw    = fmt?.bold !== false ? "700" : "400";
      const fs    = fmt?.italic ? "italic" : "normal";
      const ta    = toCSSAlign(fmt?.horizontalAlignment, h);
      const border = showGrid ? "border: 1px solid rgba(0,0,0,0.15);" : "";
      return `<th style="background:${bg};color:${color};font-weight:${fw};font-style:${fs};padding:5px 6px;text-align:${ta};width:${colWidthPct}%;${border}">${h}</th>`;
    }).join("") : "";

    // Build data rows with actual formats + alignment
    const dataRows = data ? data.rows.map((row, ri) => {
      const tds = data.headers.map((_, ci) => {
        const fmt = data.rowFormats?.[ri]?.[ci];
        const cellVal = row[ci] ?? "";
        const hasFill = fmt?.fillColor && fmt.fillColor !== "transparent" && fmt.fillColor !== "none";
        const defaultBg = ri % 2 === 0 ? "white" : "#f8fafc";
        const bg    = hasFill ? fmt!.fillColor! : defaultBg;
        const color = fmt?.fontColor && fmt.fontColor !== "transparent" ? fmt.fontColor : "#1e293b";
        const fw    = fmt?.bold ? "700" : "400";
        const fs    = fmt?.italic ? "italic" : "normal";
        const ta    = toCSSAlign(fmt?.horizontalAlignment, cellVal);
        const border = showGrid ? "border: 1px solid #e2e8f0;" : "";
        return `<td style="background:${bg};color:${color};font-weight:${fw};font-style:${fs};padding:4px 6px;text-align:${ta};width:${colWidthPct}%;${border}">${cellVal}</td>`;
      }).join("");
      const rowNumTd = showHeaders ? `<td style="color:#94a3b8;font-size:8pt;padding:4px 3px;text-align:center;width:30px;${showGrid ? "border:1px solid #e2e8f0;" : ""}">${ri + 1}</td>` : "";
      return `<tr>${rowNumTd}${tds}</tr>`;
    }).join("") : "";

    pw2.document.write(`<!DOCTYPE html><html dir="auto"><head>
      <meta charset="UTF-8">
      <title>${title || "تقرير SniperSheet"}</title>
      <style>
        @page { margin: ${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm; size: ${paper} ${orientation}; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 10pt; ${fitCSS} }
        h1.report-title { text-align: center; font-size: 14pt; font-weight: 700; color: #1a1a1a; border-bottom: 2px solid #107C41; padding-bottom: 6px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        .footer { margin-top: 8px; font-size: 7pt; color: #94a3b8; text-align: center; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      ${title ? `<h1 class="report-title">${title}</h1>` : ""}
      ${data ? `
      <table>
        <thead>
          <tr>
            ${showHeaders ? `<th style="width:30px;background:#e2e8f0;padding:5px 6px;">#</th>` : ""}
            ${headerCells}
          </tr>
        </thead>
        <tbody>${dataRows}</tbody>
      </table>` : ""}
      <div class="footer">طُبع بواسطة SniperSheet · ${selection?.shortAddress ?? ""} · ${new Date().toLocaleString("ar-EG")}</div>
    </body></html>`);
    pw2.document.close();
    setTimeout(() => pw2.print(), 500);
  }

  return (
    <div className="space-y-4">

      {/* ── Selection status ──────────────────────────── */}
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${
        isWatching && selection
          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700"
          : "bg-muted/40 border-border"
      }`}>
        <FileText className={`w-4 h-4 shrink-0 ${isWatching && selection ? "text-blue-500" : "text-muted-foreground"}`} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">تحديد الطباعة / Print Selection</div>
          {isWatching && selection ? (
            <div className="font-mono font-bold text-sm text-blue-700 dark:text-blue-300 truncate">
              {selection.shortAddress}
              <span className="font-normal text-[11px] text-blue-500 ms-2">
                {selection.rowCount}r × {selection.columnCount}c
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">حدّد نطاق في Excel لبدء الإعداد</div>
          )}
        </div>
        <button
          onClick={loadData}
          disabled={noSel || loading}
          className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-40"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Paper Size ───────────────────────────────── */}
      <div>
        <label className="text-[11px] font-semibold text-foreground block mb-1.5 flex items-center gap-1.5">
          <LayoutTemplate className="w-3.5 h-3.5 text-blue-500" />
          حجم الورق / Paper Size
        </label>
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(PAPERS).map(([key, val]) => (
            <OptionBtn key={key} active={paper === key} onClick={() => setPaper(key as PaperKey)}>
              {key}
            </OptionBtn>
          ))}
        </div>
      </div>

      {/* ── Orientation ───────────────────────────────── */}
      <div>
        <label className="text-[11px] font-semibold text-foreground block mb-1.5 flex items-center gap-1.5">
          <AlignJustify className="w-3.5 h-3.5 text-blue-500" />
          الاتجاه / Orientation
        </label>
        <div className="grid grid-cols-2 gap-2">
          <OptionBtn active={orientation === "portrait"} onClick={() => setOrientation("portrait")} className="flex items-center justify-center gap-1.5">
            <span className="inline-block w-3 h-4 border-2 border-current rounded-[1px]" />
            عمودي / Portrait
          </OptionBtn>
          <OptionBtn active={orientation === "landscape"} onClick={() => setOrientation("landscape")} className="flex items-center justify-center gap-1.5">
            <span className="inline-block w-4 h-3 border-2 border-current rounded-[1px]" />
            أفقي / Landscape
          </OptionBtn>
        </div>
      </div>

      {/* ── Fit Options ───────────────────────────────── */}
      <div>
        <label className="text-[11px] font-semibold text-foreground block mb-1.5 flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
          ملاءمة الصفحة / Fit to Page
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {FIT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFit(f.id as FitId)}
              className={`text-left px-2.5 py-2 rounded-md border transition-all ${
                fit === f.id
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-background border-border text-foreground hover:bg-muted hover:border-primary/30"
              }`}
            >
              <div className={`text-[11px] font-semibold ${fit === f.id ? "text-primary" : ""}`}>{f.label}</div>
              <div className="text-[9px] text-muted-foreground">{f.desc}</div>
            </button>
          ))}
        </div>
        {fit === "custom" && (
          <div className="flex items-center gap-2 mt-2">
            <label className="text-[10px] text-muted-foreground whitespace-nowrap">المقياس / Scale:</label>
            <Input
              type="number"
              value={scale}
              onChange={(e) => setScale(Math.max(10, Math.min(200, parseInt(e.target.value) || 100)))}
              className="h-7 text-xs font-mono w-20"
              min={10} max={200}
            />
            <span className="text-[10px] text-muted-foreground">%</span>
            <input
              type="range" min={10} max={200} value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="flex-1 h-1.5 accent-primary"
            />
          </div>
        )}
      </div>

      {/* ── Advanced options (collapsible) ────────────── */}
      <div className="border border-border/60 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/60 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
            خيارات متقدمة / Advanced
          </div>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        {showAdvanced && (
          <div className="p-3 space-y-3 bg-card">
            {/* Margins */}
            <div>
              <label className="text-[10px] text-muted-foreground font-medium block mb-1.5">الهوامش / Margins</label>
              <div className="grid grid-cols-4 gap-1">
                {Object.entries(MARGINS).map(([key, val]) => (
                  <OptionBtn key={key} active={margin === key} onClick={() => setMargin(key as MarginKey)} className="text-center">
                    <div className="text-[10px]">{key === "normal" ? "عادي" : key === "narrow" ? "ضيق" : key === "wide" ? "واسع" : "بلا"}</div>
                  </OptionBtn>
                ))}
              </div>
              <div className="mt-1.5 text-[9px] text-muted-foreground">
                {MARGINS[margin].label} — أعلى {MARGINS[margin].top}mm · جانب {MARGINS[margin].left}mm
              </div>
            </div>

            {/* Report Title */}
            <div>
              <label className="text-[10px] text-muted-foreground font-medium block mb-1">عنوان التقرير / Title (اختياري)</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="تقرير الرواتب الشهري..."
                className="h-7 text-xs"
                dir="auto"
              />
            </div>

            {/* Display options */}
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="rounded" />
                إظهار الشبكة / Grid
              </label>
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <input type="checkbox" checked={showHeaders} onChange={(e) => setShowHeaders(e.target.checked)} className="rounded" />
                ترقيم الصفوف / Row #
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Live Preview ──────────────────────────────── */}
      {(data || noSel) && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-foreground">معاينة الطباعة / Print Preview</span>
            {data && (
              <span className="ms-auto text-[10px] text-muted-foreground">
                {data.headers.length} عمود · {data.rows.length} صف
              </span>
            )}
          </div>

          <div className="flex justify-center">
            <PagePreview
              paperKey={paper}
              orientation={orientation}
              margin={margin}
              fit={fit}
              scale={scale}
              data={data}
              title={title}
              showGrid={showGrid}
              showHeaders={showHeaders}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-[11px] text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />جاري قراءة البيانات من Excel...
        </div>
      )}

      {/* ── Data status ───────────────────────────────── */}
      {data && !loading && (
        <div className={`flex items-center gap-2 text-[11px] px-3 py-1.5 rounded border ${
          data.headers.length > 0
            ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
            : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        }`}>
          {data.headers.length > 0
            ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          <span>
            البيانات جاهزة: <strong>{data.headers.length}</strong> عمود ·
            <strong> {data.rows.length}</strong> صف ·
            ورق <strong>{paper}</strong> {orientation === "portrait" ? "عمودي" : "أفقي"}
          </span>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────── */}
      <div className="space-y-2">
        <Button
          className="w-full h-10 font-bold text-sm gap-2"
          onClick={handlePrint}
          disabled={!data}
        >
          <Printer className="w-4 h-4" />
          طباعة / Print
          <span className="text-[10px] opacity-70 font-normal">
            {paper} {orientation === "portrait" ? "↕" : "↔"} · {FIT_OPTIONS.find(f => f.id === fit)?.label}
          </span>
        </Button>

        {noSel && (
          <p className="text-center text-[10px] text-muted-foreground">
            حدّد خلايا في Excel ← اضغط 🔄 لتحميل البيانات
          </p>
        )}
      </div>

      {/* Hidden print DOM */}
      <div className="hidden" aria-hidden>
        <div ref={printRef} />
      </div>
    </div>
  );
}
