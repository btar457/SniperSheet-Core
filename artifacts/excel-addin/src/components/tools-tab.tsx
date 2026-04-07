import { useState } from "react";
import { ChevronDown, ChevronUp, Sliders, Printer } from "lucide-react";

import { useSelectionSensor } from "@/hooks/use-selection-sensor";
import { CellDimensionsCard } from "@/components/cell-dimensions-card";
import { SmartPrintCard } from "@/components/smart-print-card";

type Section = "dimensions" | "print";

export function ToolsTab() {
  const [open, setOpen] = useState<Section | null>("dimensions");
  const { selection, isWatching } = useSelectionSensor(700);

  const sections: {
    id: Section;
    arTitle: string;
    enTitle: string;
    icon: React.ReactNode;
    borderColor: string;
  }[] = [
    {
      id: "dimensions",
      arTitle: "أبعاد الخلايا وتنسيقها",
      enTitle: "Cell Dimensions & Format",
      icon: <Sliders className="w-3.5 h-3.5 text-violet-500" />,
      borderColor: "border-violet-200 dark:border-violet-800",
    },
    {
      id: "print",
      arTitle: "الطباعة الذكية",
      enTitle: "Smart Print",
      icon: <Printer className="w-3.5 h-3.5 text-blue-500" />,
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  ];

  return (
    <div className="px-[10px] pt-3 pb-8 space-y-3">

      {/* Targeting bar */}
      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors ${
        isWatching && selection
          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
          : "bg-muted/40 border-border text-muted-foreground"
      }`}>
        <span className="font-semibold uppercase tracking-widest text-[10px]">Targeting</span>
        {isWatching && selection ? (
          <span className="flex items-center gap-1.5">
            <code className="font-mono font-bold">{selection.shortAddress}</code>
            <span className="opacity-70">({selection.rowCount}r × {selection.columnCount}c)</span>
            <span className="ms-1 flex items-center gap-1 text-[9px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </span>
        ) : (
          <span>حدّد خلايا في Excel / Select cells in Excel</span>
        )}
      </div>

      {/* Accordion sections */}
      {sections.map((s) => (
        <div key={s.id}>
          <button
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors ${
              open === s.id ? s.borderColor : "border-border"
            }`}
            onClick={() => setOpen(open === s.id ? null : s.id)}
            data-testid={`toggle-tool-${s.id}`}
          >
            <div className="flex items-center gap-2">
              {s.icon}
              <div className="text-left">
                <div className="text-xs font-semibold text-foreground">{s.arTitle}</div>
                <div className="text-[10px] text-muted-foreground">{s.enTitle}</div>
              </div>
            </div>
            {open === s.id
              ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>

          {open === s.id && (
            <div className="mt-1.5 animate-in fade-in slide-in-from-top-1">
              {s.id === "dimensions" && (
                <CellDimensionsCard selection={selection} isWatching={isWatching} />
              )}
              {s.id === "print" && (
                <SmartPrintCard selection={selection} isWatching={isWatching} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
