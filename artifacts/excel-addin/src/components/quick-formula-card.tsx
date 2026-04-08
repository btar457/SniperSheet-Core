import { useState } from "react";
import {
  Zap, Target, ArrowRight, CheckCircle2, AlertCircle, Loader2,
  Plus, Minus, X, Divide, GitBranch, Hash, TrendingUp, TrendingDown,
  MousePointer, Keyboard, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionInfo } from "@/hooks/use-selection-sensor";
import { insertFormulaInAddress } from "@/lib/excel-actions";

type FuncType = "SUM" | "SUBTRACT" | "MULTIPLY" | "DIVIDE" | "AVERAGE" | "MAX" | "MIN" | "COUNT" | "IF" | "COUNTIF" | "SUMIF";

interface FuncDef {
  id: FuncType;
  arLabel: string;
  enLabel: string;
  arDesc: string;
  icon: React.ReactNode;
  color: string;
  needsCondition?: boolean;
  needsCriteria?: boolean;
}

const FUNCTIONS: FuncDef[] = [
  { id: "SUM",      arLabel: "جمع",          enLabel: "SUM",     arDesc: "مجموع النطاق",         icon: <Plus className="w-3.5 h-3.5" />,         color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
  { id: "AVERAGE",  arLabel: "متوسط",         enLabel: "AVERAGE", arDesc: "المتوسط الحسابي",      icon: <TrendingUp className="w-3.5 h-3.5" />,   color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800" },
  { id: "COUNT",    arLabel: "عدد الخلايا",  enLabel: "COUNT",   arDesc: "عدد الخلايا العددية",  icon: <Hash className="w-3.5 h-3.5" />,          color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-700" },
  { id: "MAX",      arLabel: "الأكبر",        enLabel: "MAX",     arDesc: "أكبر قيمة في النطاق", icon: <TrendingUp className="w-3.5 h-3.5" />,   color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
  { id: "MIN",      arLabel: "الأصغر",        enLabel: "MIN",     arDesc: "أصغر قيمة في النطاق", icon: <TrendingDown className="w-3.5 h-3.5" />, color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800" },
  { id: "SUBTRACT", arLabel: "طرح",           enLabel: "A−B",     arDesc: "طرح خليتين",           icon: <Minus className="w-3.5 h-3.5" />,         color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800" },
  { id: "MULTIPLY", arLabel: "ضرب",           enLabel: "A×B",     arDesc: "ضرب خليتين",           icon: <X className="w-3.5 h-3.5" />,             color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800" },
  { id: "DIVIDE",   arLabel: "قسمة",          enLabel: "A÷B",     arDesc: "قسمة خليتين",          icon: <Divide className="w-3.5 h-3.5" />,        color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800" },
  { id: "IF",       arLabel: "شرط IF",        enLabel: "IF",      arDesc: "قيمة بحسب الشرط",      icon: <GitBranch className="w-3.5 h-3.5" />,    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800", needsCondition: true },
  { id: "COUNTIF",  arLabel: "عدد شرطي",     enLabel: "COUNTIF", arDesc: "عدد الخلايا بشرط",    icon: <Hash className="w-3.5 h-3.5" />,          color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800", needsCriteria: true },
  { id: "SUMIF",    arLabel: "جمع شرطي",     enLabel: "SUMIF",   arDesc: "جمع الخلايا بشرط",    icon: <Plus className="w-3.5 h-3.5" />,          color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800", needsCriteria: true },
];

function buildFormula(fn: FuncType, sourceRange: string, extra: Record<string, string>): string {
  const r = sourceRange.trim();
  switch (fn) {
    case "SUM":      return `=SUM(${r})`;
    case "AVERAGE":  return `=AVERAGE(${r})`;
    case "COUNT":    return `=COUNT(${r})`;
    case "MAX":      return `=MAX(${r})`;
    case "MIN":      return `=MIN(${r})`;
    case "SUBTRACT": {
      const [a, b] = r.includes(":") ? r.split(":") : [r, r];
      return `=${a}-${b}`;
    }
    case "MULTIPLY": {
      const [a, b] = r.includes(":") ? r.split(":") : [r, r];
      return `=${a}*${b}`;
    }
    case "DIVIDE": {
      const [a, b] = r.includes(":") ? r.split(":") : [r, r];
      return `=IFERROR(${a}/${b},"#DIV!")`;
    }
    case "IF": {
      const cond = extra.condition || `${r.split(":")[0]}>0`;
      const t    = extra.trueVal   || '"نعم"';
      const f    = extra.falseVal  || '"لا"';
      return `=IF(${cond},${t},${f})`;
    }
    case "COUNTIF":  return `=COUNTIF(${r},"${extra.criteria || ">0"}")`;
    case "SUMIF":    return `=SUMIF(${r},"${extra.criteria || ">0"}")`;
    default:         return `=SUM(${r})`;
  }
}

type Status = { ok: boolean; msg: string } | null;
type Step = 1 | 2 | 3 | 4;

interface Props {
  selection: SelectionInfo | null;
  isWatching: boolean;
}

function StepBubble({ n, current, label }: { n: number; current: Step; label: string }) {
  const done = current > n;
  const active = current === n;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
        done ? "bg-green-500 text-white" : active ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
      }`}>{done ? "✓" : n}</span>
      <span className={`text-[10px] ${active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function MouseCaptureField({
  label, hint, capturedValue, onCapture, onManual, manualValue, isWatching, liveValue,
}: {
  label: string; hint: string; capturedValue: string; onCapture: () => void;
  onManual: (v: string) => void; manualValue: string; isWatching: boolean; liveValue: string;
}) {
  const [useManual, setUseManual] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/30 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-foreground">{label}</div>
          <div className="text-[10px] text-muted-foreground">{hint}</div>
        </div>
        <button
          onClick={() => setUseManual((v) => !v)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {useManual ? <MousePointer className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />}
          {useManual ? "ماوس" : "يدوي"}
        </button>
      </div>
      <div className="p-3 space-y-2">
        {!useManual ? (
          <>
            {/* Mouse mode */}
            <div className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] font-mono font-bold ${
              isWatching && liveValue
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                : "bg-muted text-muted-foreground border border-border"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isWatching && liveValue ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
              <span>{liveValue || "— حدّد خلايا في Excel —"}</span>
            </div>
            <Button
              size="sm"
              className={`w-full h-8 text-xs gap-1.5 ${capturedValue ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={onCapture}
              disabled={!isWatching || !liveValue}
            >
              {capturedValue ? (
                <><CheckCircle2 className="w-3.5 h-3.5" />التقاط · <code className="font-mono">{capturedValue}</code></>
              ) : (
                <><MousePointer className="w-3.5 h-3.5" />التقاط التحديد الحالي</>
              )}
            </Button>
          </>
        ) : (
          /* Manual mode */
          <Input
            value={manualValue}
            onChange={(e) => onManual(e.target.value)}
            placeholder={label.includes("هدف") ? "مثال: C4" : "مثال: A1:B10"}
            className="h-8 text-sm font-mono"
            dir="ltr"
          />
        )}
        {capturedValue && (
          <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>تم الالتقاط: <code className="font-mono font-bold">{capturedValue}</code></span>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuickFormulaCard({ selection, isWatching }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [selectedFn, setSelectedFn] = useState<FuncType | null>(null);
  const [targetCell, setTargetCell]   = useState("");   // confirmed target
  const [targetManual, setTargetManual] = useState(""); // manual override
  const [sourceRange, setSourceRange]   = useState("");   // confirmed range
  const [sourceManual, setSourceManual] = useState(""); // manual override
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [preview, setPreview]   = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const fnDef = FUNCTIONS.find((f) => f.id === selectedFn);

  const effectiveTarget = targetManual.trim() || targetCell;
  const effectiveSource = sourceManual.trim() || sourceRange;

  function handleSelectFn(fn: FuncType) {
    setSelectedFn(fn);
    setExtra({});
    setStep(2);
    setStatus(null);
    setPreview(null);
  }

  function captureTarget() {
    const val = selection?.activeCellAddress || selection?.shortAddress || "";
    if (val) { setTargetCell(val); setTargetManual(""); }
  }

  function captureSource() {
    const val = selection?.shortAddress || "";
    if (val) { setSourceRange(val); setSourceManual(""); }
  }

  function proceedToSource() {
    if (!effectiveTarget) return;
    setStep(3);
    setStatus(null);
  }

  function proceedToPreview() {
    if (!effectiveSource) return;
    const formula = buildFormula(selectedFn!, effectiveSource, extra);
    setPreview(formula);
    setStep(4);
    setStatus(null);
  }

  async function handleInsert() {
    if (!selectedFn || !effectiveTarget || !effectiveSource) return;
    setInserting(true);
    setStatus(null);
    const formula = buildFormula(selectedFn, effectiveSource, extra);
    const result = await insertFormulaInAddress(formula, effectiveTarget);
    setStatus({
      ok: result.ok,
      msg: result.ok
        ? `✅ أُدرجت "${formula}" في ${effectiveTarget}`
        : result.error ?? "خطأ في الإدراج",
    });
    setInserting(false);
  }

  function reset() {
    setStep(1); setSelectedFn(null);
    setTargetCell(""); setTargetManual("");
    setSourceRange(""); setSourceManual("");
    setExtra({}); setPreview(null); setStatus(null);
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 shadow-none">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            بناء المعادلة / Quick Formula
          </CardTitle>
          {step > 1 && (
            <button onClick={reset} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-3 h-3" />بداية
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">

        {/* ── Step progress ── */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <StepBubble n={1} current={step} label="الدالة" />
          <ArrowRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          <StepBubble n={2} current={step} label="الخلية الهدف" />
          <ArrowRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          <StepBubble n={3} current={step} label="النطاق المصدر" />
          <ArrowRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          <StepBubble n={4} current={step} label="إدراج" />
        </div>

        {/* ════ STEP 1: Choose function ════ */}
        {step === 1 && (
          <div>
            <p className="text-[10px] text-muted-foreground mb-2">اختر نوع الدالة / Choose function:</p>
            <div className="grid grid-cols-3 gap-1.5">
              {FUNCTIONS.map((fn) => (
                <button
                  key={fn.id}
                  onClick={() => handleSelectFn(fn.id)}
                  className={`flex flex-col items-center gap-1 px-1.5 py-2.5 rounded-lg border text-[10px] font-semibold transition-all hover:scale-105 hover:shadow-sm ${fn.color}`}
                >
                  {fn.icon}
                  <span>{fn.arLabel}</span>
                  <span className="text-[8px] opacity-60 font-mono">{fn.enLabel}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════ STEP 2: Target cell by mouse or type ════ */}
        {step === 2 && fnDef && (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold ${fnDef.color} border`}>
              {fnDef.icon}{fnDef.arLabel} — {fnDef.arDesc}
            </div>

            <MouseCaptureField
              label="① الخلية الهدف — أين يظهر الناتج؟"
              hint="حدّد الخلية التي تريد وضع النتيجة فيها ثم التقط"
              capturedValue={targetCell}
              onCapture={captureTarget}
              onManual={setTargetManual}
              manualValue={targetManual}
              isWatching={isWatching}
              liveValue={selection?.activeCellAddress || ""}
            />

            <Button
              size="sm"
              className="w-full h-9 text-xs gap-1.5"
              onClick={proceedToSource}
              disabled={!effectiveTarget}
            >
              التالي — حدّد النطاق المصدر <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={reset}>رجوع</Button>
          </div>
        )}

        {/* ════ STEP 3: Source range by mouse or type ════ */}
        {step === 3 && fnDef && (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold ${fnDef.color} border`}>
              {fnDef.icon}{fnDef.arLabel} → الهدف: <code className="font-mono font-bold ms-1">{effectiveTarget}</code>
            </div>

            <MouseCaptureField
              label="② النطاق المصدر — ما الخلايا التي تريد حسابها؟"
              hint="حدّد النطاق بالماوس في Excel ثم التقط"
              capturedValue={sourceRange}
              onCapture={captureSource}
              onManual={setSourceManual}
              manualValue={sourceManual}
              isWatching={isWatching}
              liveValue={selection?.shortAddress || ""}
            />

            {/* Extra params for IF */}
            {fnDef.needsCondition && (
              <div className="space-y-1.5 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">معاملات IF:</p>
                <Input value={extra.condition || ""} onChange={(e) => setExtra((p) => ({ ...p, condition: e.target.value }))} placeholder='الشرط مثال: A1>50' className="h-7 text-xs font-mono" />
                <Input value={extra.trueVal || ""} onChange={(e) => setExtra((p) => ({ ...p, trueVal: e.target.value }))} placeholder='إذا صح مثال: "ناجح"' className="h-7 text-xs font-mono" />
                <Input value={extra.falseVal || ""} onChange={(e) => setExtra((p) => ({ ...p, falseVal: e.target.value }))} placeholder='إذا خطأ مثال: "راسب"' className="h-7 text-xs font-mono" />
              </div>
            )}

            {/* Extra params for COUNTIF / SUMIF */}
            {fnDef.needsCriteria && (
              <div className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-1">المعيار / Criteria:</p>
                <Input value={extra.criteria || ""} onChange={(e) => setExtra((p) => ({ ...p, criteria: e.target.value }))} placeholder='>50 أو "نعم" ...' className="h-7 text-xs font-mono" />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setStep(2)}>رجوع</Button>
              <Button size="sm" className="flex-1 h-8 text-xs" onClick={proceedToPreview} disabled={!effectiveSource}>
                معاينة <ArrowRight className="w-3 h-3 ms-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ════ STEP 4: Preview + Insert ════ */}
        {step === 4 && (
          <div className="space-y-3">
            {preview && (
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  المعادلة الجاهزة للإدراج:
                </div>
                <div
                  className="font-mono text-sm bg-muted rounded-md px-3 py-2.5 border border-border/60 font-semibold break-all cursor-copy select-all hover:bg-muted/70 transition-colors"
                  onClick={() => navigator.clipboard?.writeText(preview)}
                  title="انقر للنسخ"
                  dir="ltr"
                >
                  {preview}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/40 rounded-md border border-border/50">
                    <Target className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>الهدف: <code className="font-mono font-bold text-foreground">{effectiveTarget}</code></span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/40 rounded-md border border-border/50">
                    <Zap className="w-3 h-3 text-blue-500 shrink-0" />
                    <span>المصدر: <code className="font-mono font-bold text-foreground">{effectiveSource}</code></span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-none h-8 text-xs px-3" onClick={() => setStep(3)}>رجوع</Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs font-semibold gap-1.5"
                onClick={handleInsert}
                disabled={inserting || !preview || !effectiveTarget}
              >
                {inserting
                  ? <><Loader2 className="w-3 h-3 animate-spin" />جاري الإدراج...</>
                  : <><Target className="w-3 h-3" />إدراج في {effectiveTarget}</>
                }
              </Button>
            </div>

            {status && (
              <div className={`flex items-center gap-1.5 text-[11px] px-2.5 py-2 rounded-lg border animate-in fade-in ${
                status.ok
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
              }`}>
                {status.ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span dir="auto">{status.msg}</span>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
