import { useState } from "react";
import {
  Zap, Target, ArrowRight, CheckCircle2, AlertCircle, Loader2,
  Plus, Minus, X, Divide, GitBranch, Hash, TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionInfo } from "@/hooks/use-selection-sensor";
import { insertFormulaInAddress } from "@/lib/excel-actions";

type FuncType = "SUM" | "SUBTRACT" | "MULTIPLY" | "DIVIDE" | "AVERAGE" | "MAX" | "MIN" | "COUNT" | "IF" | "COUNTIF" | "SUMIF";
type Mode = "A" | "B"; // A=formula builder, B=action on selection

interface FuncDef {
  id: FuncType;
  arLabel: string;
  enLabel: string;
  icon: React.ReactNode;
  color: string;
  needsCondition?: boolean;
  needsCriteria?: boolean;
}

const FUNCTIONS: FuncDef[] = [
  { id: "SUM",      arLabel: "جمع",        enLabel: "SUM",     icon: <Plus className="w-3 h-3" />,        color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { id: "SUBTRACT", arLabel: "طرح",        enLabel: "SUBTRACT", icon: <Minus className="w-3 h-3" />,      color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { id: "MULTIPLY", arLabel: "ضرب",        enLabel: "MULTIPLY", icon: <X className="w-3 h-3" />,          color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  { id: "DIVIDE",   arLabel: "قسمة",       enLabel: "DIVIDE",   icon: <Divide className="w-3 h-3" />,     color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { id: "AVERAGE",  arLabel: "متوسط",      enLabel: "AVERAGE",  icon: <TrendingUp className="w-3 h-3" />, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { id: "MAX",      arLabel: "الأكبر",     enLabel: "MAX",      icon: <TrendingUp className="w-3 h-3" />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  { id: "MIN",      arLabel: "الأصغر",     enLabel: "MIN",      icon: <TrendingDown className="w-3 h-3" />,color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" },
  { id: "COUNT",    arLabel: "عدد الخلايا",enLabel: "COUNT",    icon: <Hash className="w-3 h-3" />,       color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { id: "IF",       arLabel: "شرط IF",     enLabel: "IF",       icon: <GitBranch className="w-3 h-3" />,  color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", needsCondition: true },
  { id: "COUNTIF",  arLabel: "عدد شرطي",   enLabel: "COUNTIF",  icon: <Hash className="w-3 h-3" />,      color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300", needsCriteria: true },
  { id: "SUMIF",    arLabel: "جمع شرطي",   enLabel: "SUMIF",    icon: <Plus className="w-3 h-3" />,      color: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300", needsCriteria: true },
];

function buildFormula(fn: FuncType, sourceRange: string, extra: Record<string, string>): string {
  const r = sourceRange.trim();
  switch (fn) {
    case "SUM":      return `=SUM(${r})`;
    case "SUBTRACT": {
      const cells = r.includes(":") ? r.split(":") : [r, r];
      return `=${cells[0]}-${cells[1]}`;
    }
    case "MULTIPLY": {
      const cells = r.includes(":") ? r.split(":") : [r, r];
      return `=${cells[0]}*${cells[1]}`;
    }
    case "DIVIDE": {
      const cells = r.includes(":") ? r.split(":") : [r, r];
      return `=${cells[0]}/${cells[1]}`;
    }
    case "AVERAGE":  return `=AVERAGE(${r})`;
    case "MAX":      return `=MAX(${r})`;
    case "MIN":      return `=MIN(${r})`;
    case "COUNT":    return `=COUNT(${r})`;
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

interface Props {
  selection: SelectionInfo | null;
  isWatching: boolean;
}

export function QuickFormulaCard({ selection, isWatching }: Props) {
  const [mode, setMode] = useState<Mode>("A");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFn, setSelectedFn] = useState<FuncType | null>(null);
  const [targetCell, setTargetCell] = useState("");
  const [sourceRange, setSourceRange] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const fnDef = FUNCTIONS.find((f) => f.id === selectedFn);

  function handleSelectFn(fn: FuncType) {
    setSelectedFn(fn);
    setExtra({});
    setStep(2);
    setStatus(null);
    setPreview(null);
  }

  function handleNext() {
    if (step === 2) {
      setStep(3);
      if (selectedFn && sourceRange) {
        setPreview(buildFormula(selectedFn, sourceRange, extra));
      }
    }
  }

  function handleBuild() {
    if (!selectedFn || !sourceRange) return;
    setPreview(buildFormula(selectedFn, sourceRange, extra));
  }

  async function handleInsert() {
    if (!selectedFn || !targetCell || !sourceRange) return;
    setInserting(true);
    setStatus(null);
    const formula = buildFormula(selectedFn, sourceRange, extra);
    const result = await insertFormulaInAddress(formula, targetCell.trim());
    setStatus({
      ok: result.ok,
      msg: result.ok ? `✅ أُدرجت في ${targetCell}: ${formula}` : result.error ?? "خطأ",
    });
    setInserting(false);
  }

  function reset() {
    setStep(1); setSelectedFn(null); setTargetCell(""); setSourceRange("");
    setExtra({}); setPreview(null); setStatus(null);
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 shadow-none">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            بناء المعادلة / Quick Formula Builder
          </CardTitle>
          {step > 1 && (
            <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-foreground underline">
              بداية / Reset
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {[
            { n: 1, label: "اختر الدالة" },
            { n: 2, label: "الخلية والمصدر" },
            { n: 3, label: "معاينة وإدراج" },
          ].map(({ n, label }, i, arr) => (
            <div key={n} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                step === n ? "bg-amber-500 text-white" : step > n ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              }`}>{n}</span>
              <span className={step === n ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 1: Function selection */}
        {step === 1 && (
          <div>
            <p className="text-[10px] text-muted-foreground mb-2">اختر نوع الدالة / Choose function type:</p>
            <div className="grid grid-cols-3 gap-1.5">
              {FUNCTIONS.map((fn) => (
                <button
                  key={fn.id}
                  onClick={() => handleSelectFn(fn.id)}
                  className={`flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-md border text-[10px] font-semibold transition-all hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 ${fn.color} border-transparent`}
                >
                  {fn.icon}
                  <span>{fn.arLabel}</span>
                  <span className="text-[8px] opacity-70 font-mono">{fn.enLabel}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Target + Source */}
        {step === 2 && fnDef && (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-semibold ${fnDef.color}`}>
              {fnDef.icon}
              {fnDef.arLabel} ({fnDef.enLabel})
            </div>

            <div>
              <label className="text-[10px] font-medium text-muted-foreground block mb-1">
                الخلية الهدف / Target Cell (النتيجة تظهر هنا)
                {selection?.activeCellAddress && (
                  <button onClick={() => setTargetCell(selection.activeCellAddress)} className="ms-1 text-[9px] text-amber-600 underline">
                    ← {selection.activeCellAddress}
                  </button>
                )}
              </label>
              <Input
                value={targetCell}
                onChange={(e) => setTargetCell(e.target.value)}
                placeholder="مثال: G1"
                className="h-7 text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium text-muted-foreground block mb-1">
                الخلايا المصدر / Source Range
                {selection?.shortAddress && (
                  <button onClick={() => setSourceRange(selection.shortAddress)} className="ms-1 text-[9px] text-amber-600 underline">
                    ← {selection.shortAddress}
                  </button>
                )}
              </label>
              <Input
                value={sourceRange}
                onChange={(e) => setSourceRange(e.target.value)}
                placeholder="مثال: A1:F1"
                className="h-7 text-sm font-mono"
              />
            </div>

            {/* Extra params for IF */}
            {fnDef.needsCondition && (
              <div className="space-y-1.5 p-2 rounded border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">معاملات IF:</p>
                <Input value={extra.condition || ""} onChange={(e) => setExtra((p) => ({ ...p, condition: e.target.value }))} placeholder='الشرط مثال: A1>50' className="h-7 text-xs font-mono" />
                <Input value={extra.trueVal || ""} onChange={(e) => setExtra((p) => ({ ...p, trueVal: e.target.value }))} placeholder='إذا صح مثال: "ناجح"' className="h-7 text-xs font-mono" />
                <Input value={extra.falseVal || ""} onChange={(e) => setExtra((p) => ({ ...p, falseVal: e.target.value }))} placeholder='إذا خطأ مثال: "راسب"' className="h-7 text-xs font-mono" />
              </div>
            )}

            {/* Extra params for COUNTIF / SUMIF */}
            {fnDef.needsCriteria && (
              <div className="p-2 rounded border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-1">المعيار / Criteria:</p>
                <Input value={extra.criteria || ""} onChange={(e) => setExtra((p) => ({ ...p, criteria: e.target.value }))} placeholder='>50 أو "نعم" ...' className="h-7 text-xs font-mono" />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={reset}>رجوع</Button>
              <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleNext} disabled={!targetCell || !sourceRange}>
                معاينة <ArrowRight className="w-3 h-3 ms-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview + Insert */}
        {step === 3 && (
          <div className="space-y-3">
            {preview && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">المعادلة المُولَّدة / Generated Formula:</p>
                <div
                  className="font-mono text-sm bg-muted rounded-md px-3 py-2 border border-border/50 font-semibold break-all cursor-copy select-all"
                  onClick={() => navigator.clipboard?.writeText(preview)}
                  title="انقر للنسخ"
                >
                  {preview}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  سيُدرج في خلية: <code className="font-mono font-bold text-foreground">{targetCell}</code>
                </p>
              </div>
            )}

            <Button
              onClick={() => { handleBuild(); }}
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
            >
              إعادة البناء / Rebuild
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setStep(2)}>رجوع</Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={handleInsert}
                disabled={inserting || !preview || !targetCell}
              >
                {inserting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3 me-1" />}
                إدراج في Excel
              </Button>
            </div>

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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
