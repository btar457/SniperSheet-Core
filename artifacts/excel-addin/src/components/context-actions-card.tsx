import { useState } from "react";
import { Paintbrush, Trash2, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionInfo } from "@/hooks/use-selection-sensor";
import {
  applyFillColorToSelection,
  applyConditionalColorToSelection,
  clearFillColorFromSelection,
  clearConditionalFormatsFromSelection,
  parseColorConditionText,
} from "@/lib/excel-actions";

const QUICK_COLORS = [
  { label: "أخضر", hex: "#00B050" },
  { label: "أحمر", hex: "#FF0000" },
  { label: "أصفر", hex: "#FFFF00" },
  { label: "برتقالي", hex: "#FF6600" },
  { label: "أزرق", hex: "#0070C0" },
  { label: "وردي", hex: "#FF99CC" },
];

const QUICK_CONDITIONS = [
  { ar: "خلايا > 50 أخضر", en: "cells > 50 green" },
  { ar: "خلايا < 0 أحمر", en: "cells < 0 red" },
  { ar: "خلايا >= 100 أصفر", en: "cells >= 100 yellow" },
  { ar: "خلايا > 1000 برتقالي", en: "cells > 1000 orange" },
];

interface Props {
  selection: SelectionInfo | null;
}

type Status = { ok: boolean; msg: string } | null;

export function ContextActionsCard({ selection }: Props) {
  const [conditionText, setConditionText] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const noSelection = !selection || !selection.shortAddress;

  async function run(label: string, fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    setBusy(label);
    setStatus(null);
    const result = await fn();
    setStatus({ ok: result.ok, msg: result.ok ? (result.message ?? "Done") : (result.error ?? "Error") });
    setBusy(null);
  }

  async function handleApplyCondition() {
    if (!conditionText.trim() || noSelection) return;
    const rule = parseColorConditionText(conditionText);
    if (!rule) {
      setStatus({ ok: false, msg: "لم يتم التعرف على الشرط / Condition not recognized. Try: cells > 50 green" });
      return;
    }
    await run("condition", () => applyConditionalColorToSelection(rule));
  }

  async function handleSolidColor(hex: string, label: string) {
    await run(`fill-${hex}`, () => applyFillColorToSelection(hex));
  }

  return (
    <Card className="border-pink-200 dark:border-pink-800 shadow-none">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Paintbrush className="w-3.5 h-3.5 text-pink-500" />
          التنسيق البصري / Visual Formatting
          {selection?.shortAddress && (
            <span className="ms-auto text-[10px] font-mono text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950 px-1.5 py-0.5 rounded">
              {selection.shortAddress}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">

        {noSelection && (
          <p className="text-[10px] text-muted-foreground text-center py-1 border border-dashed rounded-md bg-muted/30">
            حدّد نطاقاً في Excel أولاً / Select a range in Excel first
          </p>
        )}

        {/* Conditional Color Rule */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1.5">
            قاعدة اللون الشرطية / Conditional Color Rule
          </label>
          <div className="flex gap-1.5">
            <Input
              value={conditionText}
              onChange={(e) => setConditionText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCondition()}
              placeholder="cells > 50 green"
              className="h-8 text-xs font-mono flex-1"
              disabled={noSelection}
            />
            <Button
              size="sm"
              className="h-8 px-2.5 shrink-0"
              onClick={handleApplyCondition}
              disabled={noSelection || !conditionText.trim() || busy === "condition"}
            >
              {busy === "condition" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </Button>
          </div>
          {/* Quick condition examples */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {QUICK_CONDITIONS.map((c) => (
              <button
                key={c.en}
                onClick={() => setConditionText(c.en)}
                className="text-[9px] px-1.5 py-0.5 rounded bg-muted border border-border hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950 transition-colors font-mono"
              >
                {c.ar}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Solid Color Fill */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1.5">
            تلوين سريع للتحديد / Quick Fill Color
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => handleSolidColor(c.hex, c.label)}
                disabled={noSelection || !!busy}
                title={c.label}
                className="w-7 h-7 rounded-md border-2 border-border hover:border-foreground transition-all disabled:opacity-40 relative"
                style={{ backgroundColor: c.hex }}
              >
                {busy === `fill-${c.hex}` && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-[11px]"
            onClick={() => run("clearFill", clearFillColorFromSelection)}
            disabled={noSelection || !!busy}
          >
            {busy === "clearFill" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
            مسح اللون / Clear Fill
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-[11px]"
            onClick={() => run("clearCF", clearConditionalFormatsFromSelection)}
            disabled={noSelection || !!busy}
          >
            {busy === "clearCF" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
            مسح الشروط / Clear CF
          </Button>
        </div>

        {/* Status */}
        {status && (
          <div className={`flex items-center gap-2 text-[11px] px-2 py-1.5 rounded-md border animate-in fade-in ${
            status.ok
              ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
          }`}>
            {status.ok
              ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            <span dir="auto">{status.msg}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
