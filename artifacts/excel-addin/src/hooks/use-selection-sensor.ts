import { useState, useEffect, useCallback, useRef } from "react";

export interface SelectionInfo {
  address: string;
  shortAddress: string;
  rowCount: number;
  columnCount: number;
  activeCellAddress: string;
  cellCount: number;
}

declare const Excel: any;
declare const Office: any;

function isExcelAvailable(): boolean {
  return typeof Excel !== "undefined" && typeof Office !== "undefined";
}

export function useSelectionSensor(intervalMs = 700): {
  selection: SelectionInfo | null;
  isWatching: boolean;
  refresh: () => void;
} {
  const [selection, setSelection]   = useState<SelectionInfo | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const errorCountRef = useRef(0);
  const lastAddressRef = useRef<string>("");

  const poll = useCallback(async () => {
    if (!isExcelAvailable()) return;
    try {
      await Excel.run(async (context: any) => {
        const range      = context.workbook.getSelectedRange();
        const activeCell = context.workbook.getActiveCell();
        range.load(["address", "rowCount", "columnCount", "cellCount"]);
        activeCell.load("address");
        await context.sync();

        const full: string        = range.address ?? "";
        const short               = full.includes("!") ? full.split("!")[1] : full;
        const activeFull: string  = activeCell.address ?? "";
        const activeShort         = activeFull.includes("!") ? activeFull.split("!")[1] : activeFull;

        // Only update state if something changed (avoids unnecessary re-renders)
        if (short !== lastAddressRef.current) {
          lastAddressRef.current = short;
          setSelection({
            address: full,
            shortAddress: short,
            rowCount: range.rowCount,
            columnCount: range.columnCount,
            activeCellAddress: activeShort,
            cellCount: range.cellCount,
          });
        } else {
          // Still update activeCellAddress in case cursor moved within selection
          setSelection((prev) =>
            prev ? { ...prev, activeCellAddress: activeShort } : prev
          );
        }

        errorCountRef.current = 0;
        setIsWatching(true);
      });
    } catch (err: any) {
      errorCountRef.current += 1;
      // Only drop the "watching" state after 3 consecutive errors
      if (errorCountRef.current >= 3) {
        setIsWatching(false);
      }
      // Don't clear selection on transient errors — keep last known state
    }
  }, []);

  useEffect(() => {
    // Initial poll immediately
    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [poll, intervalMs]);

  return { selection, isWatching, refresh: poll };
}
