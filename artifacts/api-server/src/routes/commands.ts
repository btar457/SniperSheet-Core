import { Router, type IRouter } from "express";
import {
  ExecuteCommandBody,
  ExecuteCommandResponse,
  GetCommandHistoryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type HistoryEntry = {
  id: number;
  command: string;
  values: number[];
  result: number;
  formula: string;
  cellRange: string | null;
  executedAt: string;
};

const commandHistory: HistoryEntry[] = [];
let nextId = 1;

type NormalizedCommand =
  | "sum"
  | "multiply"
  | "average"
  | "min"
  | "max"
  | "subtract"
  | "divide";

const ARABIC_COMMAND_MAP: Record<string, NormalizedCommand> = {
  // --- Sum / جمع ---
  sum: "sum",
  جمع: "sum",
  اجمع: "sum",
  إجمع: "sum",
  مجموع: "sum",
  "الجمع": "sum",

  // --- Multiply / ضرب ---
  multiply: "multiply",
  product: "multiply",
  ضرب: "multiply",
  اضرب: "multiply",
  إضرب: "multiply",
  "حاصل الضرب": "multiply",
  حاصل: "multiply",

  // --- Average / متوسط ---
  average: "average",
  avg: "average",
  mean: "average",
  متوسط: "average",
  وسط: "average",
  المتوسط: "average",
  "الوسط الحسابي": "average",

  // --- Min / أقل ---
  min: "min",
  minimum: "min",
  أقل: "min",
  اقل: "min",
  أصغر: "min",
  اصغر: "min",
  الأدنى: "min",
  الادنى: "min",
  "الحد الأدنى": "min",

  // --- Max / أكبر ---
  max: "max",
  maximum: "max",
  أكبر: "max",
  اكبر: "max",
  أعلى: "max",
  اعلى: "max",
  الأقصى: "max",
  الاقصى: "max",
  "الحد الأقصى": "max",

  // --- Subtract / طرح ---
  subtract: "subtract",
  minus: "subtract",
  طرح: "subtract",
  اطرح: "subtract",
  إطرح: "subtract",
  ناقص: "subtract",
  "الطرح": "subtract",
  "حاصل الطرح": "subtract",

  // --- Divide / قسمة ---
  divide: "divide",
  division: "divide",
  قسمة: "divide",
  اقسم: "divide",
  إقسم: "divide",
  مقسوم: "divide",
  "القسمة": "divide",
  "حاصل القسمة": "divide",
};

const COMMAND_DESCRIPTIONS: Record<NormalizedCommand, { en: string; ar: string; formula: string }> = {
  sum:      { en: "Sum",      ar: "جمع",         formula: "SUM"     },
  multiply: { en: "Multiply", ar: "ضرب",         formula: "PRODUCT" },
  average:  { en: "Average",  ar: "متوسط",       formula: "AVERAGE" },
  min:      { en: "Min",      ar: "أقل قيمة",    formula: "MIN"     },
  max:      { en: "Max",      ar: "أكبر قيمة",   formula: "MAX"     },
  subtract: { en: "Subtract", ar: "طرح",         formula: "MINUS"   },
  divide:   { en: "Divide",   ar: "قسمة",        formula: "DIVIDE"  },
};

function normalizeCommand(raw: string): NormalizedCommand | null {
  const key = raw.toLowerCase().trim();
  return ARABIC_COMMAND_MAP[key] ?? ARABIC_COMMAND_MAP[raw.trim()] ?? null;
}

function interpretCommand(
  rawCommand: string,
  values: number[]
): { result: number; formula: string; description: string; normalizedCommand: string } {
  if (values.length === 0) {
    throw new Error("يجب توفير قيمة واحدة على الأقل / At least one value is required");
  }

  const cmd = normalizeCommand(rawCommand);

  if (!cmd) {
    const supported = Object.keys(ARABIC_COMMAND_MAP)
      .filter((k) => /[a-z]/i.test(k[0]))
      .slice(0, 7)
      .join(", ");
    const arSupported = "جمع، ضرب، متوسط، أقل، أكبر، طرح، قسمة";
    throw new Error(
      `الأمر "${rawCommand}" غير مدعوم. الأوامر المتاحة: ${arSupported} / Supported: ${supported}`
    );
  }

  const meta = COMMAND_DESCRIPTIONS[cmd];

  switch (cmd) {
    case "sum": {
      const result = values.reduce((acc, v) => acc + v, 0);
      return {
        result,
        formula: `=SUM(${values.join(", ")})`,
        description: `${meta.ar} (${meta.en}) — ${values.length} قيمة`,
        normalizedCommand: cmd,
      };
    }
    case "multiply": {
      const result = values.reduce((acc, v) => acc * v, 1);
      return {
        result,
        formula: `=PRODUCT(${values.join(", ")})`,
        description: `${meta.ar} (${meta.en}) — ${values.length} قيمة`,
        normalizedCommand: cmd,
      };
    }
    case "average": {
      const result = values.reduce((acc, v) => acc + v, 0) / values.length;
      return {
        result,
        formula: `=AVERAGE(${values.join(", ")})`,
        description: `${meta.ar} (${meta.en}) — ${values.length} قيمة`,
        normalizedCommand: cmd,
      };
    }
    case "min": {
      const result = Math.min(...values);
      return {
        result,
        formula: `=MIN(${values.join(", ")})`,
        description: `${meta.ar} (${meta.en}) — ${values.length} قيمة`,
        normalizedCommand: cmd,
      };
    }
    case "max": {
      const result = Math.max(...values);
      return {
        result,
        formula: `=MAX(${values.join(", ")})`,
        description: `${meta.ar} (${meta.en}) — ${values.length} قيمة`,
        normalizedCommand: cmd,
      };
    }
    case "subtract": {
      if (values.length < 2) {
        throw new Error("الطرح يتطلب قيمتين على الأقل / Subtract requires at least 2 values");
      }
      const result = values.slice(1).reduce((acc, v) => acc - v, values[0]);
      return {
        result,
        formula: `=${values.join(" - ")}`,
        description: `${meta.ar} (${meta.en}) — ${values[0]} ناقص الباقي`,
        normalizedCommand: cmd,
      };
    }
    case "divide": {
      if (values.length < 2) {
        throw new Error("القسمة تتطلب قيمتين على الأقل / Divide requires at least 2 values");
      }
      if (values.slice(1).some((v) => v === 0)) {
        throw new Error("لا يمكن القسمة على صفر / Division by zero is not allowed");
      }
      const result = values.slice(1).reduce((acc, v) => acc / v, values[0]);
      return {
        result,
        formula: `=${values.join(" / ")}`,
        description: `${meta.ar} (${meta.en}) — ${values[0]} مقسوماً على الباقي`,
        normalizedCommand: cmd,
      };
    }
  }
}

router.post("/execute", async (req, res): Promise<void> => {
  const parsed = ExecuteCommandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { command, values, cellRange } = parsed.data;

  let outcome: ReturnType<typeof interpretCommand>;
  try {
    outcome = interpretCommand(command, values);
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تنفيذ الأمر / Command execution failed";
    req.log.warn({ command, values }, message);
    res.status(400).json({ error: message });
    return;
  }

  const formula =
    cellRange
      ? outcome.formula.replace(/\(.*\)/, `(${cellRange})`)
      : outcome.formula;

  const entry: HistoryEntry = {
    id: nextId++,
    command,
    values,
    result: outcome.result,
    formula,
    cellRange: cellRange ?? null,
    executedAt: new Date().toISOString(),
  };

  if (commandHistory.length >= 20) {
    commandHistory.shift();
  }
  commandHistory.push(entry);

  req.log.info({ command, normalizedCommand: outcome.normalizedCommand, result: outcome.result }, "Command executed");

  res.json(
    ExecuteCommandResponse.parse({
      command,
      result: outcome.result,
      formula,
      description: outcome.description,
    })
  );
});

router.get("/history", async (_req, res): Promise<void> => {
  const history = [...commandHistory].reverse();
  res.json(GetCommandHistoryResponse.parse(history));
});

export default router;
