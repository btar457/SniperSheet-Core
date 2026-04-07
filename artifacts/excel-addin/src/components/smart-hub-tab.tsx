import { useState, useRef, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sparkles, Send, ChevronDown, ChevronUp, Clock, AlertCircle,
  Lightbulb, CheckCircle2, Palette, BarChart3, Search, Calculator,
  ShieldAlert, Download, MousePointer2, Loader2, Target,
} from "lucide-react";
import { format } from "date-fns";

import {
  useSmartAnalyze,
  useGetSmartHistory,
  getGetSmartHistoryQueryKey,
} from "@workspace/api-client-react";

import { scanWithWordRadar } from "@/lib/word-radar";
import { useSelectionSensor } from "@/hooks/use-selection-sensor";
import { insertFormulaInActiveCell, insertFormulaInAddress } from "@/lib/excel-actions";
import { ContextActionsCard } from "@/components/context-actions-card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FORMULA_TYPE_CONFIG: Record<string, { label: string; arLabel: string; icon: React.ReactNode; color: string }> = {
  arithmetic:  { label: "Arithmetic",  arLabel: "حسابي",     icon: <Calculator className="w-3 h-3" />,  color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  conditional: { label: "Conditional", arLabel: "شرطي",      icon: <CheckCircle2 className="w-3 h-3" />, color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  lookup:      { label: "Lookup",      arLabel: "بحث",       icon: <Search className="w-3 h-3" />,      color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  formatting:  { label: "Formatting",  arLabel: "تنسيق",     icon: <Palette className="w-3 h-3" />,     color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
  statistical: { label: "Statistical", arLabel: "إحصائي",    icon: <BarChart3 className="w-3 h-3" />,   color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  text:        { label: "Text",        arLabel: "نصي",       icon: <Lightbulb className="w-3 h-3" />,   color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  date:        { label: "Date",        arLabel: "تاريخ",     icon: <Clock className="w-3 h-3" />,       color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  financial:   { label: "Financial",   arLabel: "مالي",      icon: <BarChart3 className="w-3 h-3" />,   color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
};

const EXAMPLE_PROMPTS = [
  { ar: "إذا كانت القيمة أقل من 50 اكتب 'راسب' وإلا 'ناجح'", en: "If value < 50 write Fail, else Pass" },
  { ar: "احسب المتوسط للقيم الأعلى من 100", en: "Average of values greater than 100" },
  { ar: "إذا الساعات > 40 احسب وقت إضافي بمعدل 1.5", en: "If hours > 40, calc overtime at 1.5x" },
  { ar: "ابحث عن قيمة في عمود وأعد النتيجة من عمود آخر", en: "VLOOKUP: find value and return from another column" },
  { ar: "احسب نسبة كل قيمة من المجموع الكلي", en: "Calculate percentage of each value from total" },
];

function ColorSwatch({ color }: { color?: string | null }) {
  if (!color) return null;
  const named: Record<string, string> = {
    red: "#ef4444", green: "#22c55e", blue: "#3b82f6",
    yellow: "#eab308", orange: "#f97316", purple: "#a855f7",
    pink: "#ec4899", gray: "#6b7280", white: "#ffffff", black: "#000000",
  };
  const hex = named[color.toLowerCase()] ?? color;
  return (
    <span
      className="inline-block w-3 h-3 rounded-sm border border-border/50 align-middle"
      style={{ backgroundColor: hex }}
      title={color}
    />
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 85 ? "text-green-600" : pct >= 65 ? "text-amber-600" : "text-red-600";
  return <span className={`text-[10px] font-mono font-bold ${color}`}>{pct}%</span>;
}

type SmartResult = {
  formula: string;
  result: string | null;
  reasoning: string;
  formulaType: string;
  styleHints: Array<{ target: string; color?: string | null; bold?: boolean | null; italic?: boolean | null; condition?: string | null }>;
  confidence: number;
};

type InsertStatus = { ok: boolean; msg: string } | null;

export function SmartHubTab() {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [valuesInput, setValuesInput] = useState("");
  const [cellRef, setCellRef] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [lastResult, setLastResult] = useState<SmartResult | null>(null);
  const [insertStatus, setInsertStatus] = useState<InsertStatus>(null);
  const [insertBusy, setInsertBusy] = useState<"active" | "range" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { selection, isWatching } = useSelectionSensor(700);

  const analyze = useSmartAnalyze();
  const { data: history = [] } = useGetSmartHistory({
    query: { queryKey: getGetSmartHistoryQueryKey() },
  });

  const radarIssues = useMemo(() => scanWithWordRadar(description), [description]);

  useEffect(() => {
    if (selection?.shortAddress && !cellRef) {
      setCellRef(selection.shortAddress);
    }
  }, [selection?.shortAddress]);

  function handleSubmit() {
    if (!description.trim()) return;
    const values = valuesInput
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v));

    analyze.mutate(
      {
        data: {
          description: description.trim(),
          values: values.length > 0 ? values : undefined,
          cellRef: cellRef.trim() || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setLastResult(data);
          setInsertStatus(null);
          queryClient.invalidateQueries({ queryKey: getGetSmartHistoryQueryKey() });
        },
      }
    );
  }

  async function handleInsertActive() {
    if (!lastResult?.formula) return;
    setInsertBusy("active");
    setInsertStatus(null);
    const result = await insertFormulaInActiveCell(lastResult.formula);
    setInsertStatus({ ok: result.ok, msg: result.ok ? `✅ أُدرجت في ${selection?.activeCellAddress ?? "الخلية النشطة"}` : result.error ?? "خطأ" });
    setInsertBusy(null);
  }

  async function handleInsertInRange() {
    if (!lastResult?.formula || !cellRef.trim()) return;
    setInsertBusy("range");
    setInsertStatus(null);
    const result = await insertFormulaInAddress(lastResult.formula, cellRef.trim());
    setInsertStatus({ ok: result.ok, msg: result.ok ? `✅ أُدرجت في ${cellRef}` : result.error ?? "خطأ" });
    setInsertBusy(null);
  }

  function useExample(ex: { ar: string }) {
    setDescription(ex.ar);
    setShowExamples(false);
    textareaRef.current?.focus();
  }

  const typeConf = lastResult ? (FORMULA_TYPE_CONFIG[lastResult.formulaType] ?? FORMULA_TYPE_CONFIG.arithmetic) : null;

  return (
    <div>
      <div className="px-[10px] pt-3 pb-8 space-y-4">

        {/* ── Selection Status Bar ─────────────────────────────── */}
        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors ${
          isWatching && selection
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            : "bg-muted/40 border-border text-muted-foreground"
        }`} data-testid="selection-status-bar">
          <MousePointer2 className="w-3.5 h-3.5 shrink-0" />
          {isWatching && selection ? (
            <span>
              <span className="font-semibold">Selection Detected: </span>
              <code className="font-mono font-bold">{selection.shortAddress}</code>
              <span className="opacity-70 ms-1.5">
                ({selection.rowCount}r × {selection.columnCount}c)
                {selection.activeCellAddress !== selection.shortAddress && (
                  <> · Active: <code className="font-mono">{selection.activeCellAddress}</code></>
                )}
              </span>
            </span>
          ) : (
            <span>افتح الملف في Excel لاستشعار التحديد / Open in Excel to detect selection</span>
          )}
        </div>

        {/* Header Banner */}
        <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">وصف الأمر / Smart Command</h2>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            صِف ما تريد بالعربية أو الإنجليزية — سيُولِّد المحرك معادلة Excel الدقيقة مع شرح كامل
            <br />
            <span className="opacity-70">Describe your logic in any language — AI generates the exact Excel formula</span>
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="shadow-xs border-border">
          <CardContent className="p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                وصف العملية / Operation Description
              </label>
              <Textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
                }}
                placeholder="مثال: إذا كانت الساعات أكثر من 40، احسب وقت إضافي بمعدل 1.5 مرة&#10;Example: If grade > 90 AND attendance > 95% then 'Excellent'"
                className={`resize-none min-h-[90px] text-sm leading-relaxed transition-colors ${radarIssues.some(i => i.severity === "warning") ? "border-amber-400 dark:border-amber-600 focus-visible:ring-amber-400" : ""}`}
                dir="auto"
                data-testid="input-smart-description"
              />

              {description.trim() && radarIssues.length > 0 && (
                <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-2 space-y-1.5 animate-in fade-in" data-testid="word-radar-panel">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    <ShieldAlert className="w-3 h-3" />
                    رادار الكلمات / Word Radar ({radarIssues.length} {radarIssues.length === 1 ? "تنبيه" : "تنبيهات"})
                  </div>
                  {radarIssues.slice(0, 4).map((issue, i) => (
                    <div key={i} className="text-[10px] space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <code className={`px-1 py-0.5 rounded text-[10px] font-mono ${issue.severity === "warning" ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200" : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"}`}>
                          {issue.token}
                        </code>
                        <span className="text-muted-foreground">{issue.reason}</span>
                      </div>
                      {issue.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {issue.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => setDescription(description.replace(new RegExp(`\\b${issue.token}\\b`, "gi"), s))}
                              className="px-1.5 py-0.5 rounded bg-background border border-border text-[9px] font-mono hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {radarIssues.length > 4 && (
                    <div className="text-[9px] text-muted-foreground">+{radarIssues.length - 4} تنبيه إضافي / more issues</div>
                  )}
                </div>
              )}

              {description.trim() && radarIssues.length === 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400 animate-in fade-in">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>الوصف واضح / Description looks clear</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  القيم / Values
                </label>
                <Input
                  value={valuesInput}
                  onChange={(e) => setValuesInput(e.target.value)}
                  placeholder="10, 20, 30..."
                  className="h-8 text-sm font-mono"
                  data-testid="input-smart-values"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  الخلية / Cell Ref
                  {selection?.shortAddress && (
                    <button
                      onClick={() => setCellRef(selection.shortAddress)}
                      className="text-[9px] text-emerald-600 hover:text-emerald-800 font-medium underline"
                      title="استخدم التحديد الحالي / Use current selection"
                    >
                      ← تحديد
                    </button>
                  )}
                </label>
                <Input
                  value={cellRef}
                  onChange={(e) => setCellRef(e.target.value)}
                  placeholder="A1, B2:B10..."
                  className={`h-8 text-sm font-mono transition-colors ${selection?.shortAddress && cellRef === selection.shortAddress ? "border-emerald-400 dark:border-emerald-600" : ""}`}
                  data-testid="input-smart-cell-ref"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={analyze.isPending || !description.trim()}
              className="w-full h-9 font-medium"
              data-testid="button-smart-analyze"
            >
              {analyze.isPending ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  جاري التحليل... / Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" />
                  تحليل ذكي / Smart Analyze
                  <span className="text-[10px] opacity-60">(Ctrl+Enter)</span>
                </span>
              )}
            </Button>

            <button
              onClick={() => setShowExamples((v) => !v)}
              className="w-full flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors pt-1"
              data-testid="button-toggle-examples"
            >
              <span>أمثلة جاهزة / Ready Examples</span>
              {showExamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showExamples && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => useExample(ex)}
                    className="w-full text-right text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 px-2 py-1.5 rounded transition-colors border border-transparent hover:border-border/50 text-left"
                    dir="auto"
                  >
                    <span className="block text-right" dir="rtl">{ex.ar}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {analyze.isError && (
          <Alert variant="destructive" className="py-2 px-3">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs ms-2" dir="auto">
              {(analyze.error as any)?.data?.error ?? "حدث خطأ في التحليل / Analysis failed"}
            </AlertDescription>
          </Alert>
        )}

        {/* ── Result Card ──────────────────────────────────────── */}
        {lastResult && !analyze.isPending && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3" data-testid="smart-result-panel">
            {/* Formula */}
            <Card className="border-primary/30 shadow-sm">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    المعادلة المُولَّدة / Generated Formula
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    {typeConf && (
                      <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeConf.color}`}>
                        {typeConf.icon}
                        {typeConf.arLabel}
                      </span>
                    )}
                    <ConfidenceBadge confidence={lastResult.confidence} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div
                  className="font-mono text-sm bg-muted rounded-md px-3 py-2 border border-border/50 text-foreground font-semibold break-all cursor-copy select-all"
                  onClick={() => navigator.clipboard?.writeText(lastResult.formula)}
                  title="انقر للنسخ / Click to copy"
                  data-testid="text-smart-formula"
                >
                  {lastResult.formula}
                </div>

                {lastResult.result !== null && (
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-muted-foreground">النتيجة / Result:</span>
                    <span className="font-mono font-bold text-primary text-sm" data-testid="text-smart-result">
                      {lastResult.result}
                    </span>
                  </div>
                )}

                {/* ── Insert Buttons ── */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Button
                    size="sm"
                    className="h-8 text-[11px] gap-1"
                    onClick={handleInsertActive}
                    disabled={!!insertBusy}
                    title={`Insert in active cell: ${selection?.activeCellAddress ?? "?"}`}
                    data-testid="button-insert-active"
                  >
                    {insertBusy === "active"
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Target className="w-3 h-3" />}
                    أدرج في {selection?.activeCellAddress ?? "الخلية النشطة"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[11px] gap-1"
                    onClick={handleInsertInRange}
                    disabled={!!insertBusy || !cellRef.trim()}
                    title={`Insert in ${cellRef || "cell ref"}`}
                    data-testid="button-insert-range"
                  >
                    {insertBusy === "range"
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Download className="w-3 h-3" />}
                    أدرج في {cellRef || "..."}
                  </Button>
                </div>

                {/* Insert status */}
                {insertStatus && (
                  <div className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border animate-in fade-in ${
                    insertStatus.ok
                      ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                  }`}>
                    {insertStatus.ok
                      ? <CheckCircle2 className="w-3 h-3 shrink-0" />
                      : <AlertCircle className="w-3 h-3 shrink-0" />}
                    <span dir="auto">{insertStatus.msg}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reasoning */}
            <Card className="border-border/50 shadow-none bg-muted/30">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-[11px] font-semibold flex items-center gap-1.5 text-muted-foreground">
                  <Lightbulb className="w-3 h-3" />
                  المنطق / Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-xs text-foreground leading-relaxed" dir="auto" data-testid="text-smart-reasoning">
                  {lastResult.reasoning}
                </p>
              </CardContent>
            </Card>

            {/* Style Hints */}
            {lastResult.styleHints.length > 0 && (
              <Card className="border-pink-200 dark:border-pink-800 shadow-none">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-[11px] font-semibold flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-pink-500" />
                    التنسيق المقترح / Styling Hints
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1.5">
                  {lastResult.styleHints.map((hint, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <ColorSwatch color={hint.color} />
                      <span className="font-medium">{hint.target}</span>
                      {hint.color && <span className="text-muted-foreground">→ {hint.color}</span>}
                      {hint.bold && <Badge variant="outline" className="text-[9px] h-4 px-1">Bold</Badge>}
                      {hint.condition && (
                        <span className="text-muted-foreground font-mono text-[10px] truncate">
                          when: {hint.condition}
                        </span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── Visual Formatting Card ───────────────────────────── */}
        <ContextActionsCard selection={selection} />

        {/* ── History ─────────────────────────────────────────── */}
        <div>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between mb-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              السجل / History ({history.length})
            </span>
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showHistory && (
            <div className="space-y-2 animate-in fade-in">
              {history.length === 0 ? (
                <div className="text-xs text-center text-muted-foreground py-6 border border-dashed rounded-md bg-muted/30">
                  لم يتم تحليل أي أمر بعد / No commands analyzed yet
                </div>
              ) : (
                history.slice(0, 10).map((item) => {
                  const tc = FORMULA_TYPE_CONFIG[item.formulaType] ?? FORMULA_TYPE_CONFIG.arithmetic;
                  return (
                    <div
                      key={item.id}
                      className="bg-card border border-border rounded-md p-2.5 hover:border-primary/30 transition-colors space-y-1.5 cursor-pointer"
                      onClick={() => {
                        setDescription(item.description);
                        setLastResult({
                          formula: item.formula,
                          result: item.result,
                          reasoning: item.reasoning,
                          formulaType: item.formulaType,
                          styleHints: item.styleHints,
                          confidence: item.confidence,
                        });
                        setInsertStatus(null);
                      }}
                      data-testid={`smart-history-${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] text-foreground truncate flex-1" dir="auto">
                          {item.description}
                        </p>
                        <span className={`flex-none flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded-full ${tc.color}`}>
                          {tc.icon}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground truncate">
                        {item.formula}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        {item.result !== null && <span className="font-bold text-primary">{item.result}</span>}
                        <span className="ms-auto">{format(new Date(item.analyzedAt), "HH:mm:ss")}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
