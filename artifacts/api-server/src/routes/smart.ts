import { Router, type IRouter } from "express";
import { SmartAnalyzeBody, SmartAnalyzeResponse, GetSmartHistoryResponse } from "@workspace/api-zod";
import { analyzeFormula } from "../lib/formula-engine.js";

const router: IRouter = Router();

type StyleHint = {
  target: string;
  color?: string | null;
  bold?: boolean | null;
  italic?: boolean | null;
  condition?: string | null;
};

type SmartHistoryEntry = {
  id: number;
  description: string;
  formula: string;
  result: string | null;
  reasoning: string;
  formulaType: string;
  styleHints: StyleHint[];
  confidence: number;
  analyzedAt: string;
};

const smartHistory: SmartHistoryEntry[] = [];
let nextId = 1;

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = SmartAnalyzeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { description, values, cellRef } = parsed.data;

  const engineResult = analyzeFormula(description, values ?? [], cellRef ?? "");

  const entry: SmartHistoryEntry = {
    id: nextId++,
    description,
    formula: engineResult.formula,
    result: engineResult.result,
    reasoning: engineResult.reasoning,
    formulaType: engineResult.formulaType,
    styleHints: engineResult.styleHints,
    confidence: engineResult.confidence,
    analyzedAt: new Date().toISOString(),
  };

  if (smartHistory.length >= 20) smartHistory.shift();
  smartHistory.push(entry);

  req.log.info({ description, formula: entry.formula, formulaType: entry.formulaType }, "Formula engine result");

  res.json(
    SmartAnalyzeResponse.parse({
      formula: entry.formula,
      result: entry.result,
      reasoning: entry.reasoning,
      formulaType: entry.formulaType,
      styleHints: entry.styleHints,
      confidence: entry.confidence,
    })
  );
});

router.get("/history", async (_req, res): Promise<void> => {
  const history = [...smartHistory].reverse();
  res.json(GetSmartHistoryResponse.parse(history));
});

export default router;
