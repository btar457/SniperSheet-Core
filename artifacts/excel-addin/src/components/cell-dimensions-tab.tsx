import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw, Loader2, CheckCircle2, AlertCircle, Maximize2, Minimize2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Merge, Columns, Grid, Square, Minus, Type, Palette, Ruler,
  WrapText, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelectionSensor } from "@/hooks/use-selection-sensor";
import {
  readSelectionFormat, applySelectionFormat, RangeFormat,
  autoFitSelectionColumns, autoFitSelectionRows,
  applyBorderPreset, BorderPreset,
  applyNumberFormat,
  mergeCells, unmergeCells,
} from "@/lib/excel-actions";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FONTS = [
  "Calibri", "Arial", "Times New Roman", "Segoe UI", "Tahoma",
  "Courier New", "Georgia", "Verdana", "Comic Sans MS", "Impact",
  "Trebuchet MS", "Garamond",
];

const COLOR_SWATCHES = [
  "#FF0000", "#FF6600", "#FFFF00", "#00B050", "#0070C0", "#7030A0",
  "#FF99CC", "#92D050", "#00B0F0", "#000000", "#FFFFFF", "#C0C0C0",
  "#D6DCE4", "#1F3864", "#833C00", "#375623",
];

const NUMBER_FORMATS = [
  { label: "عام",         code: "General" },
  { label: "رقم",         code: "#,##0.00" },
  { label: "عملة",        code: "#,##0.00 ريال" },
  { label: "نسبة %",      code: "0.00%" },
  { label: "تاريخ",       code: "DD/MM/YYYY" },
  { label: "وقت",         code: "HH:MM:SS" },
  { label: "نص",          code: "@" },
  { label: "صحيح",        code: "#,##0" },
];

const BORDER_PRESETS: { label: string; preset: BorderPreset; icon: React.ReactNode }[] = [
  { label: "بدون", preset: "none",    icon: <Square className="w-3.5 h-3.5" /> },
  { label: "الكل", preset: "all",     icon: <Grid className="w-3.5 h-3.5" /> },
  { label: "خارجي",preset: "outside", icon: <Columns className="w-3.5 h-3.5" /> },
  { label: "سميك", preset: "thick",   icon: <Minus className="w-3.5 h-3.5 font-black" /> },
  { label: "متقطع",preset: "dashed",  icon: <Minus className="w-3.5 h-3.5 opacity-50" /> },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Section({
  title, icon, defaultOpen = true, children,
}: { title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/40 hover:bg-muted/70 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          {icon}{title}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="p-3 bg-card space-y-2.5">{children}</div>}
    </div>
  );
}

function ToggleBtn({
  active, onClick, children, title, className = "",
}: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md border text-[11px] font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-border text-foreground hover:bg-muted"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ColorPicker({
  label, value, onChange,
}: { label: string; value: string | null; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground block mb-1">{label}</label>
      <div className="space-y-1.5">
        <div className="flex gap-1.5 flex-wrap">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => onChange(c)}
              className={`w-5 h-5 rounded border-2 transition-transform hover:scale-110 ${value === c ? "border-primary scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-10 rounded border border-input cursor-pointer p-0.5"
          />
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#FFFFFF"
            className="h-7 text-xs font-mono flex-1"
          />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

type Status = { ok: boolean; msg: string } | null;

export function CellDimensionsTab() {
  const { selection, isWatching } = useSelectionSensor(700);
  const [fmt, setFmt] = useState<RangeFormat | null>(null);
  const [customNumFmt, setCustomNumFmt] = useState("");
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [activeBorder, setActiveBorder] = useState<BorderPreset | null>(null);

  const loadFormat = useCallback(async () => {
    if (!isWatching || !selection) return;
    setLoading(true);
    const f = await readSelectionFormat();
    setFmt(f);
    setLoading(false);
    setStatus(null);
  }, [isWatching, selection?.shortAddress]);

  useEffect(() => { loadFormat(); }, [loadFormat]);

  function update<K extends keyof RangeFormat>(key: K, val: RangeFormat[K]) {
    setFmt((p) => (p ? { ...p, [key]: val } : null));
    setStatus(null);
  }

  async function handleApplyAll() {
    if (!fmt) return;
    setApplying(true);
    setStatus(null);
    const result = await applySelectionFormat(fmt);
    setStatus({
      ok: result.ok,
      msg: result.ok
        ? `✅ تم تطبيق التنسيق على ${selection?.shortAddress}`
        : result.error ?? "خطأ",
    });
    setApplying(false);
  }

  async function handleAutoFitCols() {
    const r = await autoFitSelectionColumns();
    setStatus({ ok: r.ok, msg: r.ok ? "✅ تم ضبط عرض الأعمدة تلقائياً" : r.error ?? "خطأ" });
    if (r.ok) setTimeout(loadFormat, 500);
  }
  async function handleAutoFitRows() {
    const r = await autoFitSelectionRows();
    setStatus({ ok: r.ok, msg: r.ok ? "✅ تم ضبط ارتفاع الصفوف تلقائياً" : r.error ?? "خطأ" });
    if (r.ok) setTimeout(loadFormat, 500);
  }
  async function handleBorder(preset: BorderPreset) {
    setActiveBorder(preset);
    const r = await applyBorderPreset(preset);
    setStatus({ ok: r.ok, msg: r.ok ? `✅ حدود "${preset}" مُطبَّقة` : r.error ?? "خطأ" });
  }
  async function handleNumFmt(code: string) {
    const r = await applyNumberFormat(code);
    setStatus({ ok: r.ok, msg: r.ok ? `✅ تنسيق الأرقام مُطبَّق` : r.error ?? "خطأ" });
  }
  async function handleMerge() {
    const r = await mergeCells();
    setStatus({ ok: r.ok, msg: r.ok ? "✅ الخلايا مدمجة" : r.error ?? "خطأ" });
  }
  async function handleUnmerge() {
    const r = await unmergeCells();
    setStatus({ ok: r.ok, msg: r.ok ? "✅ تم إلغاء الدمج" : r.error ?? "خطأ" });
  }

  const noSel = !isWatching || !selection;

  return (
    <div className="px-[10px] pt-3 pb-8 space-y-3">

      {/* ── Targeting Bar ──────────────────────────── */}
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
        isWatching && selection
          ? "bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700"
          : "bg-muted/40 border-border"
      }`}>
        <Ruler className={`w-4 h-4 shrink-0 ${isWatching && selection ? "text-violet-500" : "text-muted-foreground"}`} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Targeting</div>
          {isWatching && selection ? (
            <div className="font-mono font-bold text-sm text-violet-700 dark:text-violet-300 truncate">
              {selection.shortAddress}
              <span className="font-normal text-[11px] text-violet-500 ms-2">
                {selection.rowCount}r × {selection.columnCount}c
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">حدّد خلايا في Excel / Select cells</div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isWatching && selection && (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/50 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />LIVE
            </span>
          )}
          <button
            onClick={loadFormat}
            disabled={noSel || loading}
            className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40"
            title="تحديث التنسيق"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── No selection placeholder ─────────────── */}
      {noSel && (
        <div className="text-center py-8 space-y-2">
          <Ruler className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">حدّد خلايا بالماوس في Excel</p>
          <p className="text-[11px] text-muted-foreground">Select cells with your mouse and formatting options will appear here</p>
        </div>
      )}

      {/* ── Loading ──────────────────────────────── */}
      {!noSel && loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-[11px] text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          جاري قراءة تنسيق الخلايا من Excel...
        </div>
      )}

      {/* ── Format Sections ──────────────────────── */}
      {!noSel && fmt && !loading && (
        <>
          {/* ① Size & Dimensions */}
          <Section title="الأبعاد / Dimensions" icon={<Ruler className="w-3.5 h-3.5 text-violet-500" />}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">عرض العمود / Col Width</label>
                <Input
                  type="number"
                  value={fmt.columnWidth ?? ""}
                  onChange={(e) => update("columnWidth", parseFloat(e.target.value) || null)}
                  placeholder="auto"
                  className="h-7 text-xs font-mono"
                  min={0} max={255}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">ارتفاع الصف / Row Height</label>
                <Input
                  type="number"
                  value={fmt.rowHeight ?? ""}
                  onChange={(e) => update("rowHeight", parseFloat(e.target.value) || null)}
                  placeholder="auto"
                  className="h-7 text-xs font-mono"
                  min={0} max={409}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={handleAutoFitCols}>
                <Maximize2 className="w-3 h-3" />ضبط العرض Auto
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={handleAutoFitRows}>
                <Minimize2 className="w-3 h-3" />ضبط الارتفاع Auto
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-border/50">
              <ToggleBtn active={fmt.wrapText} onClick={() => update("wrapText", !fmt.wrapText)}>
                <WrapText className="w-3 h-3" />
                التفاف النص / Wrap Text
              </ToggleBtn>
              <span className="text-[10px] text-muted-foreground">يلتف المحتوى داخل العرض المحدد</span>
            </div>
          </Section>

          {/* ② Font */}
          <Section title="الخط / Font" icon={<Type className="w-3.5 h-3.5 text-blue-500" />}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">نوع الخط / Font Name</label>
                <select
                  value={fmt.fontName ?? "Calibri"}
                  onChange={(e) => update("fontName", e.target.value)}
                  className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">حجم الخط / Size (pt)</label>
                <Input
                  type="number"
                  value={fmt.fontSize ?? ""}
                  onChange={(e) => update("fontSize", parseFloat(e.target.value) || null)}
                  placeholder="11"
                  className="h-7 text-xs font-mono"
                  min={6} max={72}
                />
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <ToggleBtn active={fmt.bold} onClick={() => update("bold", !fmt.bold)} title="تخين">
                <Bold className="w-3.5 h-3.5" /> Bold
              </ToggleBtn>
              <ToggleBtn active={fmt.italic} onClick={() => update("italic", !fmt.italic)} title="مائل">
                <Italic className="w-3.5 h-3.5" /> Italic
              </ToggleBtn>
              <ToggleBtn active={fmt.underline} onClick={() => update("underline", !fmt.underline)} title="تسطير">
                <Underline className="w-3.5 h-3.5" /> Underline
              </ToggleBtn>
            </div>
          </Section>

          {/* ③ Colors */}
          <Section title="الألوان / Colors" icon={<Palette className="w-3.5 h-3.5 text-pink-500" />}>
            <div className="grid grid-cols-1 gap-3">
              <ColorPicker
                label="لون الخلفية / Fill Color"
                value={fmt.fillColor}
                onChange={(v) => update("fillColor", v)}
              />
              <ColorPicker
                label="لون الخط / Font Color"
                value={fmt.fontColor}
                onChange={(v) => update("fontColor", v)}
              />
            </div>
          </Section>

          {/* ④ Alignment */}
          <Section title="المحاذاة / Alignment" icon={<AlignCenter className="w-3.5 h-3.5 text-green-500" />}>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1.5">أفقي / Horizontal</label>
              <div className="flex gap-1.5">
                {[
                  { val: "Left",    icon: <AlignLeft className="w-3.5 h-3.5" />,    label: "يسار" },
                  { val: "Center",  icon: <AlignCenter className="w-3.5 h-3.5" />,  label: "وسط" },
                  { val: "Right",   icon: <AlignRight className="w-3.5 h-3.5" />,   label: "يمين" },
                  { val: "Justify", icon: <AlignJustify className="w-3.5 h-3.5" />, label: "ضبط" },
                ].map(({ val, icon, label }) => (
                  <ToggleBtn
                    key={val}
                    active={fmt.horizontalAlignment === val}
                    onClick={() => update("horizontalAlignment", val)}
                    title={label}
                    className="flex-1 text-[10px]"
                  >
                    {icon}
                  </ToggleBtn>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1.5">عمودي / Vertical</label>
              <div className="flex gap-1.5">
                {[
                  { val: "Top",    icon: <AlignStartVertical className="w-3.5 h-3.5" />,  label: "أعلى" },
                  { val: "Center", icon: <AlignCenterVertical className="w-3.5 h-3.5" />, label: "وسط" },
                  { val: "Bottom", icon: <AlignEndVertical className="w-3.5 h-3.5" />,    label: "أسفل" },
                ].map(({ val, icon, label }) => (
                  <ToggleBtn
                    key={val}
                    active={fmt.verticalAlignment === val}
                    onClick={() => update("verticalAlignment", val)}
                    title={label}
                    className="flex-1 text-[10px]"
                  >
                    {icon} <span className="text-[10px]">{label}</span>
                  </ToggleBtn>
                ))}
              </div>
            </div>
          </Section>

          {/* ⑤ Number Format */}
          <Section title="تنسيق الأرقام / Number Format" icon={<Grid className="w-3.5 h-3.5 text-orange-500" />} defaultOpen={false}>
            <div className="grid grid-cols-4 gap-1">
              {NUMBER_FORMATS.map(({ label, code }) => (
                <button
                  key={code}
                  onClick={() => handleNumFmt(code)}
                  className="px-1.5 py-1.5 rounded border border-border text-[10px] font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-center leading-tight"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                value={customNumFmt}
                onChange={(e) => setCustomNumFmt(e.target.value)}
                placeholder="تنسيق مخصص مثال: #,##0.00"
                className="h-7 text-xs font-mono flex-1"
                dir="ltr"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] shrink-0"
                disabled={!customNumFmt}
                onClick={() => handleNumFmt(customNumFmt)}
              >
                تطبيق
              </Button>
            </div>
          </Section>

          {/* ⑥ Borders */}
          <Section title="الحدود / Borders" icon={<Square className="w-3.5 h-3.5 text-slate-500" />} defaultOpen={false}>
            <div className="grid grid-cols-5 gap-1.5">
              {BORDER_PRESETS.map(({ label, preset, icon }) => (
                <button
                  key={preset}
                  onClick={() => handleBorder(preset)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded border text-[10px] font-medium transition-colors ${
                    activeBorder === preset
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </Section>

          {/* ⑦ Merge */}
          <Section title="دمج الخلايا / Merge" icon={<Merge className="w-3.5 h-3.5 text-red-500" />} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="default" size="sm" className="h-8 text-xs gap-1.5" onClick={handleMerge}>
                <Merge className="w-3.5 h-3.5" />دمج / Merge
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleUnmerge}>
                إلغاء الدمج / Unmerge
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">تحذير: الدمج قد يؤثر على بيانات الخلايا الأخرى</p>
          </Section>

          {/* ── Apply All ──────────────────────────── */}
          <Button
            className="w-full h-10 font-bold text-sm gap-2"
            onClick={handleApplyAll}
            disabled={applying}
          >
            {applying ? (
              <><Loader2 className="w-4 h-4 animate-spin" />جاري تطبيق التنسيق...</>
            ) : (
              <>تطبيق جميع التنسيقات / Apply All Formatting</>
            )}
          </Button>

          {/* ── Status ─────────────────────────────── */}
          {status && (
            <div className={`flex items-start gap-2 text-[11px] px-3 py-2 rounded-md border animate-in fade-in ${
              status.ok
                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
            }`}>
              {status.ok
                ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              <span dir="auto">{status.msg}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
