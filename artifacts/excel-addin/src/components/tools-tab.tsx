import { Printer } from "lucide-react";
import { useSelectionSensor } from "@/hooks/use-selection-sensor";
import { SmartPrintCard } from "@/components/smart-print-card";

export function ToolsTab() {
  const { selection, isWatching } = useSelectionSensor(700);

  return (
    <div className="px-[10px] pt-4 pb-8 space-y-4">

      {/* Header */}
      <div className="rounded-lg bg-gradient-to-br from-blue-50 via-blue-50/50 to-transparent dark:from-blue-950/40 dark:via-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <Printer className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">عرض وطباعة / Print Preview</h2>
            <p className="text-[10px] text-muted-foreground">
              حدّد الخلايا ← اختر إعدادات الورق ← اطبع باحترافية
            </p>
          </div>
        </div>
      </div>

      {/* Main print tool — no accordion, full-width */}
      <SmartPrintCard selection={selection} isWatching={isWatching} />

    </div>
  );
}
