import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { SmartAnalyzeBody, SmartAnalyzeResponse, GetSmartHistoryResponse } from "@workspace/api-zod";
import { analyzeFormula } from "../lib/formula-engine.js";

const router: IRouter = Router();

// 100% free models on OpenRouter — tried in order
const FREE_MODELS = [
  "google/gemma-3-27b-it:free",
  "qwen/qwen3.6-plus:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-20b:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
];

const openrouter = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY ?? "dummy",
  timeout: 20000,
});

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
  engine: string;
};

const smartHistory: SmartHistoryEntry[] = [];
let nextId = 1;

// Track which model last succeeded so we start there next time
let lastWorkingModelIdx = 0;

const SYSTEM_PROMPT = `You are SniperSheet — an Excel formula engineer. Analyze natural language (Arabic or English) and return a precise Excel formula.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no code fences, no text before or after JSON.

JSON schema:
{"formula":"=...","result":"string or null","reasoning":"Arabic explanation | English explanation","formulaType":"arithmetic|conditional|lookup|statistical|text|date|financial|formatting","styleHints":[{"target":"background","color":"#hex","bold":null,"italic":null,"condition":"string"}],"confidence":0.0-1.0}

Rules:
- English Excel function names only: SUM, IF, IFS, VLOOKUP, XLOOKUP, AVERAGEIF, COUNTIF, AND, OR, PMT, etc.
- Use IFS() for multiple conditions, XLOOKUP over VLOOKUP
- Add styleHints for colors/formatting (red=fail, green=pass/correct, yellow=warning)
- reasoning: short Arabic sentence | short English sentence
- Compute result if values provided
- Respond with ONLY the JSON object, nothing else`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callAI(description: string, values: number[], cellRef: string): Promise<{ raw: string; model: string } | null> {
  const userPrompt = [
    `Description: ${description}`,
    values.length > 0 ? `Values: [${values.join(", ")}]` : "No values.",
    cellRef ? `Cell ref: ${cellRef}` : "Use A1.",
  ].join("\n");

  // Start from last known working model, cycle through all
  const orderedModels = [
    ...FREE_MODELS.slice(lastWorkingModelIdx),
    ...FREE_MODELS.slice(0, lastWorkingModelIdx),
  ];

  for (let i = 0; i < orderedModels.length; i++) {
    const model = orderedModels[i];
    try {
      const completion = await openrouter.chat.completions.create({
        model,
        max_tokens: 8192,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (content) {
        // Remember which model index worked
        lastWorkingModelIdx = FREE_MODELS.indexOf(model);
        if (lastWorkingModelIdx < 0) lastWorkingModelIdx = 0;
        return { raw: content, model };
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 429) {
        // Rate limited — brief wait then try next model
        if (i < orderedModels.length - 1) await sleep(300);
        continue;
      }
      // Non-rate-limit error — log and try next
      continue;
    }
  }
  return null; // all models exhausted
}

function parseAIResponse(raw: string, description: string, values: number[], id: number, model: string): SmartHistoryEntry {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/, "")
    .replace(/^[^{]*({)/s, "$1")   // strip any text before {
    .replace(/(})[^}]*$/s, "$1")   // strip any text after }
    .trim();

  const r = JSON.parse(cleaned);
  return {
    id,
    description,
    formula: String(r.formula ?? ""),
    result: r.result != null ? String(r.result) : null,
    reasoning: String(r.reasoning ?? ""),
    formulaType: String(r.formulaType ?? "arithmetic"),
    styleHints: Array.isArray(r.styleHints) ? r.styleHints : [],
    confidence: typeof r.confidence === "number" ? r.confidence : 0.82,
    analyzedAt: new Date().toISOString(),
    engine: model,
  };
}

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = SmartAnalyzeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { description, values, cellRef } = parsed.data;
  const vals = values ?? [];
  const ref = cellRef ?? "";
  const id = nextId++;

  let entry: SmartHistoryEntry;

  // Attempt AI
  const aiResult = await callAI(description, vals, ref).catch(() => null);

  if (aiResult) {
    try {
      entry = parseAIResponse(aiResult.raw, description, vals, id, aiResult.model);
      req.log.info({ description, formula: entry.formula, model: aiResult.model }, "AI analysis complete");
    } catch {
      req.log.warn({ aiResponse: aiResult.raw }, "AI JSON parse failed — using local engine");
      const local = analyzeFormula(description, vals, ref);
      entry = { id, description, ...local, analyzedAt: new Date().toISOString(), engine: "local-engine" };
    }
  } else {
    req.log.warn({ description }, "All free AI models busy — using local engine");
    const local = analyzeFormula(description, vals, ref);
    entry = { id, description, ...local, analyzedAt: new Date().toISOString(), engine: "local-engine" };
  }

  if (smartHistory.length >= 20) smartHistory.shift();
  smartHistory.push(entry);

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
