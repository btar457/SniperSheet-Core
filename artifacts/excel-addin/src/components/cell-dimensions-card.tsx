import { useState, useEffect, useCallback } from "react";
import {
  Sliders, RefreshCw, CheckCircle2, AlertCircle, Loader2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, WrapText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionInfo } from "@/hooks/use-selection-sensor";
import { readSelectionFormat, applySelectionFormat, RangeFormat } from "@/lib/excel-actions";

const FONT_OPTIONS = ["Calibri", "Arial", "Times New Roman", "Segoe UI", "Tahoma", "Courier New", "Georgia"];

interface Props {
  selection: SelectionInfo | null;
  isWatching: boolean;
}

type Status = { ok: boolean; msg: string } | null;

export function CellDimensionsCard({ selection, isWatching }: Props) {
  const [fmt, setFmt] = useState<RangeFormat | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const refresh = useCallback(async () => {
    if (!isWatching || !selection) return;
    setLoading(true);
    const f = await readSelectionFormat();
    setFmt(f);
    setLoading(false);
    setStatus(null);
  }, [isWatching, selection?.shortAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleApply() {
    if (!fmt) return;
    setApplying(true);
    setStatus(null);
    const result = await applySelectionFormat(fmt);
    setStatus({ ok: result.ok, msg: result.ok ? `✅ تم التطبيق على ${selection?.shortAddress}` : result.error ?? "خطأ" });
    setApplying(false);
  }

  function update<K extends keyof RangeFormat>(key: K, val: RangeFormat[K]) {
    setFmt((prev) => prev ? { ...prev, [key]: val } : null);
    setStatus(null);
  }

  const noSel = !isWatching || !selection;

  return (
    <Card className="border-violet-200 dark:border-violet-800 shadow-none">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-violet-500" />
            أبعاد الخلايا وتنسيقها / Cell Dimensions
            {selection?.shortAddress && (
              <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-1.5 py-0.5 rounded ms-1">
                {selection.shortAddress}
              </span>
            )}
          </CardTitle>
          <button
            onClick={refresh}
            disabled={noSel || loading}
            className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-40"
            title="تحديث / Refresh"
          >
            <RefreshCw className={`w-3 h-3 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">

        {noSel && (
          <p className="text-[10px] text-muted-foreground text-center py-2 border border-dashed rounded-md bg-muted/30">
            حدّد خلايا في Excel لرؤية أبعادها / Select cells in Excel
          </p>
        )}

        {!noSel && !fmt && !loading && (
          <p className="text-[10px] text-muted-foreground text-center py-2">
            اضغط <RefreshCw className="w-3 h-3 inline" /> لتحميل بيانات التنسيق
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-3 text-[11px] text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            جاري القراءة من Excel...
          </div>
        )}

        {fmt && !loading && (
          <>
            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">عرض العمود / Col Width</label>
                <Input
                  type="number"
                  value={fmt.columnWidth ?? ""}
                  onChange={(e) => update("columnWidth", parseFloat(e.target.value) || null)}
                  placeholder="auto"
                  className="h-7 text-xs font-mono"
                  min={0}
                  max={255}
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
                  min={0}
                  max={409}
                />
              </div>
            </div>

            {/* Font */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">نوع الخط / Font</label>
                <select
                  value={fmt.fontName ?? "Calibri"}
                  onChange={(e) => update("fontName", e.target.value)}
                  className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">حجم الخط / Font Size</label>
                <Input
                  type="number"
                  value={fmt.fontSize ?? ""}
                  onChange={(e) => update("fontSize", parseFloat(e.target.value) || null)}
                  placeholder="11"
                  className="h-7 text-xs font-mono"
                  min={6}
                  max={72}
                />
              </div>
            </div>

            {/* Style toggles */}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1.5">تنسيق النص / Text Style</label>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: "bold"      as const, Icon: Bold,      label: "B",          active: fmt.bold },
                  { key: "italic"    as const, Icon: Italic,    label: "I",          active: fmt.italic },
                  { key: "underline" as const, Icon: Underline, label: "U",          active: fmt.underline },
                  { key: "wrapText"  as const, Icon: WrapText,  label: "Wrap",       active: fmt.wrapText },
                ].map(({ key, Icon, label, active }) => (
                  <button
                    key={key}
                    onClick={() => update(key, !active)}
                    className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment */}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1.5">المحاذاة / Alignment</label>
              <div className="flex gap-1.5">
                {[
                  { val: "Left",   Icon: AlignLeft },
                  { val: "Center", Icon: AlignCenter },
                  { val: "Right",  Icon: AlignRight },
                ].map(({ val, Icon }) => (
                  <button
                    key={val}
                    onClick={() => update("horizontalAlignment", val)}
                    className={`flex-1 flex items-center justify-center py-1 rounded border text-[11px] transition-colors ${
                      fmt.horizontalAlignment === val
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">لون الخلفية / Fill</label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={fmt.fillColor && fmt.fillColor !== "transparent" ? fmt.fillColor : "#ffffff"}
                    onChange={(e) => update("fillColor", e.target.value)}
                    className="h-7 w-10 rounded border border-input cursor-pointer"
                  />
                  <Input
                    value={fmt.fillColor ?? ""}
                    onChange={(e) => update("fillColor", e.target.value)}
                    placeholder="#FFFFFF"
                    className="h-7 text-xs font-mono flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">لون الخط / Font Color</label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={fmt.fontColor ?? "#000000"}
                    onChange={(e) => update("fontColor", e.target.value)}
                    className="h-7 w-10 rounded border border-input cursor-pointer"
                  />
                  <Input
                    value={fmt.fontColor ?? ""}
                    onChange={(e) => update("fontColor", e.target.value)}
                    placeholder="#000000"
                    className="h-7 text-xs font-mono flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <Button
              className="w-full h-8 text-sm font-semibold"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin me-2" />جاري التطبيق...</>
              ) : (
                <>تطبيق التنسيق / Apply Format</>
              )}
            </Button>

            {status && (
              <div className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border animate-in fade-in ${
                status.ok
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
              }`}>
                {status.ok ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                <span dir="auto">{status.msg}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
