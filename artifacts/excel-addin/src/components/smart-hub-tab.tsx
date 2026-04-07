import { useState, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sparkles, Send, ChevronDown, ChevronUp, Clock, AlertCircle,
  Lightbulb, CheckCircle2, Palette, BarChart3, Search, Calculator,
  ShieldAlert, Crosshair, Loader2, Target, ArrowDownToLine,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FORMULA_TYPE_CONFIG: Record<
  string,
  { arLabel: string; icon: React.ReactNode; color: string }
> = {
  arithmetic:  { arLabel: "حسابي",   icon: <Calculator className="w-3 h-3" />,  color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  conditional: { arLabel: "شرطي",    icon: <CheckCircle2 className="w-3 h-3" />, color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  lookup:      { arLabel: "بحث",     icon: <Search className="w-3 h-3" />,      color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  formatting:  { arLabel: "تنسيق",   icon: <Palette className="w-3 h-3" />,     color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
  statistical: { arLabel: "إحصائي",  icon: <BarChart3 className="w-3 h-3" />,   color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  text:        { arLabel: "نصي",     icon: <Lightbulb className="w-3 h-3" />,   color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  date:        { arLabel: "تاريخ",   icon: <Clock className="w-3 h-3" />,       color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  financial:   { arLabel: "مالي",    icon: <BarChart3 className="w-3 h-3" />,   color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
};

const EXAMPLE_PROMPTS = [
  { ar: "إذا كانت القيمة أقل من 50 اكتب 'راسب' وإلا 'ناجح'" },
  { ar: "احسب المتوسط للقيم الأعلى من 100" },
  { ar: "إذا الساعات > 40 احسب وقت إضافي بمعدل 1.5" },
  { ar: "ابحث عن قيمة في عمود وأعد النتيجة من عمود آخر" },
  { ar: "احسب نسبة كل قيمة من المجموع الكلي" },
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
  styleHints: Array<{
    target: string;
    color?: string | null;
    bold?: boolean | null;
    italic?: boolean | null;
    condition?: string | null;
  }>;
  confidence: number;
};

type InsertStatus = { ok: boolean; msg: string } | null;

export function SmartHubTab() {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
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

  function handleSubmit() {
    if (!description.trim()) return;
    analyze.mutate(
      {
        data: {
          description: description.trim(),
          cellRef: selection?.shortAddress || undefined,
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
    setInsertStatus({
      ok: result.ok,
      msg: result.ok
        ? `✅ أُدرجت في ${selection?.activeCellAddress ?? "الخلية النشطة"}`
        : (result.error ?? "خطأ"),
    });
    setInsertBusy(null);
  }

  async function handleInsertInRange() {
    if (!lastResult?.formula || !selection?.shortAddress) return;
    setInsertBusy("range");
    setInsertStatus(null);
    const result = await insertFormulaInAddress(lastResult.formula, selection.shortAddress);
    setInsertStatus({
      ok: result.ok,
      msg: result.ok
        ? `✅ أُدرجت في ${selection.shortAddress}`
        : (result.error ?? "خطأ"),
    });
    setInsertBusy(null);
  }

  const typeConf = lastResult
    ? (FORMULA_TYPE_CONFIG[lastResult.formulaType] ?? FORMULA_TYPE_CONFIG.arithmetic)
    : null;

  return (
    <div className="px-[10px] pt-3 pb-8 space-y-3">

      {/* ── Targeting Bar ────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
          isWatching && selection
            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700"
            : "bg-muted/40 border-border"
        }`}
        data-testid="targeting-bar"
      >
        <Crosshair
          className={`w-4 h-4 shrink-0 ${
            isWatching && selection ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          }`}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none mb-0.5">
            Targeting
          </span>
          {isWatching && selection ? (
            <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300 leading-tight truncate">
              {selection.shortAddress}
              <span className="font-normal text-[11px] text-emerald-600/70 dark:text-emerald-400/70 ms-2">
                {selection.rowCount}r × {selection.columnCount}c
                {selection.activeCellAddress !== selection.shortAddress && (
                  <> · Active: {selection.activeCellAddress}</>
                )}
              </span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              — حدّد خلايا في Excel / Select cells in Excel
            </span>
          )}
        </div>
        {isWatching && selection && (
          <span className="ms-auto flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* ── Command Card ─────────────────────────────────────── */}
      <Card className="shadow-xs border-border">
        <CardContent className="p-4 space-y-3">

          {/* Description textarea */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Smart Command
            </label>
            <Textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
              }}
              placeholder={
                "صف المنطق بالعربية أو الإنجليزية...\n" +
                "e.g. If hours > 40, calculate overtime at 1.5×\n" +
                "مثال: إذا الدرجة > 90 اكتب ممتاز وإلا جيد"
              }
              className={`resize-none min-h-[100px] text-sm leading-relaxed transition-colors ${
                radarIssues.some((i) => i.severity === "warning")
                  ? "border-amber-400 dark:border-amber-600 focus-visible:ring-amber-400"
                  : ""
              }`}
              dir="auto"
              data-testid="input-smart-description"
            />

            {/* Word Radar */}
            {description.trim() && radarIssues.length > 0 && (
              <div
                className="mt-2 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-2 space-y-1.5 animate-in fade-in"
                data-testid="word-radar-panel"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="w-3 h-3" />
                  Word Radar — {radarIssues.length} {radarIssues.length === 1 ? "تنبيه" : "تنبيهات"}
                </div>
                {radarIssues.slice(0, 3).map((issue, i) => (
                  <div key={i} className="text-[10px] space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <code className="px-1 py-0.5 rounded text-[10px] font-mono bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                        {issue.token}
                      </code>
                      <span className="text-muted-foreground">{issue.reason}</span>
                    </div>
                    {issue.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {issue.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              setDescription(
                                description.replace(
                                  new RegExp(`\\b${issue.token}\\b`, "gi"),
                                  s
                                )
                              )
                            }
                            className="px-1.5 py-0.5 rounded bg-background border border-border text-[9px] font-mono hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {description.trim() && radarIssues.length === 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400 animate-in fade-in mt-1.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>الوصف واضح / Description looks clear</span>
              </div>
            )}
          </div>

          {/* Execute Button */}
          <Button
            onClick={handleSubmit}
            disabled={analyze.isPending || !description.trim()}
            className="w-full h-10 font-semibold text-sm"
            data-testid="button-smart-analyze"
          >
            {analyze.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Execute Smart Command
                <kbd className="ms-1 text-[10px] opacity-50 font-mono bg-primary-foreground/10 px-1 rounded">Ctrl+↵</kbd>
              </span>
            )}
          </Button>

          {/* Examples */}
          <button
            onClick={() => setShowExamples((v) => !v)}
            className="w-full flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-toggle-examples"
          >
            <span>أمثلة جاهزة / Examples</span>
            {showExamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showExamples && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-1 -mt-1">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDescription(ex.ar);
                    setShowExamples(false);
                    textareaRef.current?.focus();
                  }}
                  className="w-full text-right text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 px-2 py-1.5 rounded transition-colors border border-transparent hover:border-border/50"
                  dir="rtl"
                >
                  {ex.ar}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Error ────────────────────────────────────────────── */}
      {analyze.isError && (
        <Alert variant="destructive" className="py-2 px-3">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs ms-2" dir="auto">
            {(analyze.error as any)?.data?.error ?? "Analysis failed"}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Result ───────────────────────────────────────────── */}
      {lastResult && !analyze.isPending && (
        <div
          className="animate-in fade-in slide-in-from-bottom-2 space-y-3"
          data-testid="smart-result-panel"
        >
          {/* Formula card */}
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Generated Formula
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  {typeConf && (
                    <span
                      className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeConf.color}`}
                    >
                      {typeConf.icon}
                      {typeConf.arLabel}
                    </span>
                  )}
                  <ConfidenceBadge confidence={lastResult.confidence} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {/* Formula display */}
              <div
                className="font-mono text-sm bg-muted rounded-md px-3 py-2.5 border border-border/50 text-foreground font-semibold break-all cursor-copy select-all"
                onClick={() => navigator.clipboard?.writeText(lastResult.formula)}
                title="Click to copy"
                data-testid="text-smart-formula"
              >
                {lastResult.formula}
              </div>

              {lastResult.result !== null && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] text-muted-foreground">Result:</span>
                  <span
                    className="font-mono font-bold text-primary text-sm"
                    data-testid="text-smart-result"
                  >
                    {lastResult.result}
                  </span>
                </div>
              )}

              {/* Insert Actions */}
              <div className="border-t border-border/50 pt-2 space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-medium">
                  Insert into Excel:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="sm"
                    className="h-8 text-[11px] gap-1.5"
                    onClick={handleInsertActive}
                    disabled={!!insertBusy || !isWatching}
                    data-testid="button-insert-active"
                  >
                    {insertBusy === "active" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Target className="w-3 h-3" />
                    )}
                    Active Cell
                    {selection?.activeCellAddress && (
                      <code className="ms-0.5 opacity-70 font-mono text-[10px]">
                        {selection.activeCellAddress}
                      </code>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[11px] gap-1.5"
                    onClick={handleInsertInRange}
                    disabled={!!insertBusy || !isWatching || !selection?.shortAddress}
                    data-testid="button-insert-range"
                  >
                    {insertBusy === "range" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ArrowDownToLine className="w-3 h-3" />
                    )}
                    Selection
                    {selection?.shortAddress && (
                      <code className="ms-0.5 opacity-70 font-mono text-[10px]">
                        {selection.shortAddress}
                      </code>
                    )}
                  </Button>
                </div>

                {!isWatching && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    Open in Excel Online to enable direct insertion
                  </p>
                )}

                {insertStatus && (
                  <div
                    className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border animate-in fade-in ${
                      insertStatus.ok
                        ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                    }`}
                  >
                    {insertStatus.ok ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3 h-3 shrink-0" />
                    )}
                    <span dir="auto">{insertStatus.msg}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reasoning */}
          <Card className="border-border/50 shadow-none bg-muted/30">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-[11px] font-semibold flex items-center gap-1.5 text-muted-foreground">
                <Lightbulb className="w-3 h-3" />
                Reasoning
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p
                className="text-xs text-foreground leading-relaxed"
                dir="auto"
                data-testid="text-smart-reasoning"
              >
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
                  Styling Hints
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5">
                {lastResult.styleHints.map((hint, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <ColorSwatch color={hint.color} />
                    <span className="font-medium">{hint.target}</span>
                    {hint.color && (
                      <span className="text-muted-foreground">→ {hint.color}</span>
                    )}
                    {hint.bold && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1">
                        Bold
                      </Badge>
                    )}
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

      {/* ── Visual Formatting ─────────────────────────────────── */}
      <ContextActionsCard selection={selection} />

      {/* ── History ──────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="w-full flex items-center justify-between mb-2 px-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            History ({history.length})
          </span>
          {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showHistory && (
          <div className="space-y-2 animate-in fade-in">
            {history.length === 0 ? (
              <div className="text-xs text-center text-muted-foreground py-6 border border-dashed rounded-md bg-muted/30">
                No commands executed yet
              </div>
            ) : (
              history.slice(0, 10).map((item) => {
                const tc =
                  FORMULA_TYPE_CONFIG[item.formulaType] ??
                  FORMULA_TYPE_CONFIG.arithmetic;
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
                      <p
                        className="text-[11px] text-foreground truncate flex-1"
                        dir="auto"
                      >
                        {item.description}
                      </p>
                      <span
                        className={`flex-none flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded-full ${tc.color}`}
                      >
                        {tc.icon}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground truncate">
                      {item.formula}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      {item.result !== null && (
                        <span className="font-bold text-primary">{item.result}</span>
                      )}
                      <span className="ms-auto">
                        {format(new Date(item.analyzedAt), "HH:mm:ss")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
