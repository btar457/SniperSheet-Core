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

const SUPPORTED_COMMANDS = ["sum", "multiply", "average", "min", "max", "subtract", "divide"] as const;
type SupportedCommand = (typeof SUPPORTED_COMMANDS)[number];

function interpretCommand(
  command: string,
  values: number[]
): { result: number; formula: string; description: string } {
  const cmd = command.toLowerCase().trim() as SupportedCommand;

  if (values.length === 0) {
    throw new Error("At least one value is required");
  }

  switch (cmd) {
    case "sum": {
      const result = values.reduce((acc, v) => acc + v, 0);
      return {
        result,
        formula: `=SUM(${values.join(", ")})`,
        description: `Sum of ${values.length} value${values.length === 1 ? "" : "s"}`,
      };
    }
    case "multiply": {
      const result = values.reduce((acc, v) => acc * v, 1);
      return {
        result,
        formula: `=PRODUCT(${values.join(", ")})`,
        description: `Product of ${values.length} value${values.length === 1 ? "" : "s"}`,
      };
    }
    case "average": {
      const result = values.reduce((acc, v) => acc + v, 0) / values.length;
      return {
        result,
        formula: `=AVERAGE(${values.join(", ")})`,
        description: `Average of ${values.length} value${values.length === 1 ? "" : "s"}`,
      };
    }
    case "min": {
      const result = Math.min(...values);
      return {
        result,
        formula: `=MIN(${values.join(", ")})`,
        description: `Minimum of ${values.length} value${values.length === 1 ? "" : "s"}`,
      };
    }
    case "max": {
      const result = Math.max(...values);
      return {
        result,
        formula: `=MAX(${values.join(", ")})`,
        description: `Maximum of ${values.length} value${values.length === 1 ? "" : "s"}`,
      };
    }
    case "subtract": {
      if (values.length < 2) {
        throw new Error("Subtract requires at least 2 values");
      }
      const result = values.slice(1).reduce((acc, v) => acc - v, values[0]);
      return {
        result,
        formula: `=${values.join(" - ")}`,
        description: `${values[0]} minus subsequent values`,
      };
    }
    case "divide": {
      if (values.length < 2) {
        throw new Error("Divide requires at least 2 values");
      }
      if (values.slice(1).some((v) => v === 0)) {
        throw new Error("Division by zero is not allowed");
      }
      const result = values.slice(1).reduce((acc, v) => acc / v, values[0]);
      return {
        result,
        formula: `=${values.join(" / ")}`,
        description: `${values[0]} divided by subsequent values`,
      };
    }
    default: {
      throw new Error(
        `Unknown command "${command}". Supported: ${SUPPORTED_COMMANDS.join(", ")}`
      );
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

  let outcome: { result: number; formula: string; description: string };
  try {
    outcome = interpretCommand(command, values);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Command execution failed";
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

  req.log.info({ command, result: outcome.result }, "Command executed");

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
