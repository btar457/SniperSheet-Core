import { useState, useCallback, useEffect } from "react";
import { Copy, Target, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionInfo } from "@/hooks/use-selection-sensor";
import { readActiveCellData, smartCopyFormulaToRange, CellData } from "@/lib/excel-actions";

interface Props {
  selection: SelectionInfo | null;
  isWatching: boolean;
}

type Status = { ok: boolean; msg: string } | null;

export function SmartCopyCard({ selection, isWatching }: Props) {
  const [sourceCell, setSourceCell] = useState<CellData | null>(null);
  const [targetAddress, setTargetAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const loadActiveCell = useCallback(async () => {
    if (!isWatching) return;
    setLoading(true);
    const data = await readActiveCellData();
    setSourceCell(data);
    setLoading(false);
    setStatus(null);
  }, [isWatching, selection?.activeCellAddress]);

  useEffect(() => {
    loadActiveCell();
  }, [loadActiveCell]);

  useEffect(() => {
    if (selection?.shortAddress && selection.shortAddress !== sourceCell?.address) {
      setTargetAddress(selection.shortAddress);
    }
  }, [selection?.shortAddress]);

  async function handleSmartCopy() {
    if (!sourceCell?.address || !targetAddress.trim()) return;
    setCopying(true);
    setStatus(null);
    const result = await smartCopyFormulaToRange(sourceCell.address, targetAddress.trim());
    setStatus({
      ok: result.ok,
      msg: result.ok
        ? `✅ تم النسخ من ${sourceCell.address} إلى ${targetAddress}`
        : result.error ?? "فشل النسخ",
    });
    setCopying(false);
  }

  const noSel = !isWatching;
  const hasFormula = sourceCell?.hasFormula === true;

  return (
    <Card className="border-cyan-200 dark:border-cyan-800 shadow-none">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Copy className="w-3.5 h-3.5 text-cyan-500" />
          النسخ الذكي / Smart Copy
          <button
            onClick={loadActiveCell}
            disabled={noSel || loading}
            className="ms-auto p-1 rounded hover:bg-muted transition-colors disabled:opacity-40"
            title="تحديث / Refresh"
          >
            <RefreshCw className={`w-3 h-3 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        <p className="text-[10px] text-muted-foreground">
          انقر على الخلية المصدر في Excel ← اضغط تحديث ← حدّد النطاق الهدف ← نسخ ذكي
        </p>

        {noSel && (
          <p className="text-[10px] text-muted-foreground text-center py-2 border border-dashed rounded-md bg-muted/30">
            افتح في Excel Online لتفعيل النسخ الذكي
          </p>
        )}

        {!noSel && (
          <>
            {/* Source cell */}
            <div className={`rounded-md border p-2.5 space-y-1 ${
              hasFormula
                ? "border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40"
                : "border-border bg-muted/30"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  الخلية المصدر / Source Cell
                </span>
                {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
              </div>

              {sourceCell ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-cyan-500 shrink-0" />
                    <code className="font-mono font-bold text-sm text-cyan-700 dark:text-cyan-300">
                      {sourceCell.address}
                    </code>
                    {hasFormula && (
                      <span className="text-[9px] bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200 px-1.5 py-0.5 rounded-full font-semibold">
                        FORMULA
                      </span>
                    )}
                  </div>
                  {sourceCell.formula && (
                    <div className="font-mono text-[11px] bg-background rounded border border-border/50 px-2 py-1 break-all text-foreground">
                      {sourceCell.formula}
                    </div>
                  )}
                  {!hasFormula && sourceCell.value && (
                    <div className="text-[11px] text-muted-foreground">
                      القيمة: <span className="font-mono text-foreground">{sourceCell.value}</span>
                      <span className="ms-1 text-amber-600">(ليست معادلة — النسخ الذكي للمعادلات فقط)</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">انقر على خلية في Excel ثم اضغط تحديث ↑</p>
              )}
            </div>

            {/* Target range */}
            <div>
              <label className="text-[10px] font-medium text-muted-foreground block mb-1.5">
                النطاق الهدف / Target Range
                {selection?.shortAddress && (
                  <button
                    onClick={() => setTargetAddress(selection.shortAddress)}
                    className="ms-2 text-[9px] text-cyan-600 hover:text-cyan-800 underline"
                  >
                    ← استخدم التحديد ({selection.shortAddress})
                  </button>
                )}
              </label>
              <Input
                value={targetAddress}
                onChange={(e) => { setTargetAddress(e.target.value); setStatus(null); }}
                placeholder="A2:A10 أو B1:G1 ..."
                className="h-8 text-sm font-mono"
              />
            </div>

            <Button
              className="w-full h-9 font-semibold"
              onClick={handleSmartCopy}
              disabled={copying || !sourceCell?.hasFormula || !targetAddress.trim()}
            >
              {copying ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin me-2" />جاري النسخ...</>
              ) : (
                <><Copy className="w-3.5 h-3.5 me-2" />تنفيذ النسخ الذكي / Smart Paste</>
              )}
            </Button>

            {!hasFormula && sourceCell && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
                الخلية المصدر لا تحتوي معادلة — اختر خلية تحتوي على صيغة =
              </p>
            )}

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
