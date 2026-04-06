import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { SmartAnalyzeBody, SmartAnalyzeResponse, GetSmartHistoryResponse } from "@workspace/api-zod";

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

const SYSTEM_PROMPT = `You are SniperSheet — a professional Excel formula engineer. Your job is to analyze natural language descriptions (in Arabic or English) and generate precise Excel formulas with full reasoning.

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "formula": "string — the complete Excel formula starting with =",
  "result": "string or null — computed result if calculable with given values, otherwise null",
  "reasoning": "string — bilingual explanation (Arabic first, then English) of how you built the formula",
  "formulaType": "one of: arithmetic | conditional | lookup | formatting | statistical | text | date | financial",
  "styleHints": [
    {
      "target": "cell | text | background | border",
      "color": "color name or hex (e.g. red, #FF0000)",
      "bold": true or false or null,
      "italic": true or false or null,
      "condition": "the condition string that triggers this style"
    }
  ],
  "confidence": number between 0 and 1
}

Rules:
- Always generate a valid Excel formula using English function names (SUM, IF, VLOOKUP, etc.)
- If values are provided, use them in the formula AND compute the numeric/text result
- For IF conditions: clearly identify the condition, true-branch, and false-branch
- For formatting descriptions (red, green, bold, color): add styleHints even if no formula is needed
- For VLOOKUP/XLOOKUP: use XLOOKUP when possible (modern Excel)
- For multi-condition: use AND()/OR() inside IF()
- Reasoning must be concise and bilingual (Arabic then English separated by " | ")
- If the description is ambiguous, make a reasonable assumption and note it in reasoning
- styleHints array may be empty [] if no formatting is implied
- confidence reflects how well the description maps to a definitive formula (1.0 = certain, 0.6 = reasonable assumption)

Examples:
- "if value < 50 fail else pass" → =IF(A1<50,"Fail","Pass") with styleHints for red/green
- "اجمع الساعات الإضافية فوق 40 بمعدل 1.5" → =IF(A1>40,(A1-40)*1.5,0)
- "average of values greater than 100" → =AVERAGEIF(A1:A10,">100")`;

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = SmartAnalyzeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { description, values, cellRef } = parsed.data;

  const userPrompt = [
    `Description: ${description}`,
    values && values.length > 0 ? `Values provided: [${values.join(", ")}]` : "No specific values provided.",
    cellRef ? `Cell reference context: ${cellRef}` : "No cell reference specified — use generic cell refs like A1.",
  ].join("\n");

  let aiResponse: string;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
    aiResponse = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI service error";
    req.log.error({ err }, "OpenAI call failed");
    res.status(500).json({ error: `فشل الذكاء الاصطناعي / AI error: ${msg}` });
    return;
  }

  // Parse AI JSON response
  let parsed2: SmartHistoryEntry;
  try {
    // Strip markdown fences if present
    const cleaned = aiResponse.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const raw = JSON.parse(cleaned);

    parsed2 = {
      id: nextId++,
      description,
      formula: String(raw.formula ?? ""),
      result: raw.result != null ? String(raw.result) : null,
      reasoning: String(raw.reasoning ?? ""),
      formulaType: String(raw.formulaType ?? "arithmetic"),
      styleHints: Array.isArray(raw.styleHints) ? raw.styleHints : [],
      confidence: typeof raw.confidence === "number" ? raw.confidence : 0.8,
      analyzedAt: new Date().toISOString(),
    };
  } catch {
    req.log.error({ aiResponse }, "Failed to parse AI JSON response");
    res.status(500).json({ error: "فشل تحليل استجابة الذكاء الاصطناعي / Failed to parse AI response" });
    return;
  }

  if (smartHistory.length >= 20) {
    smartHistory.shift();
  }
  smartHistory.push(parsed2);

  req.log.info({ description, formula: parsed2.formula, formulaType: parsed2.formulaType }, "Smart analysis complete");

  const responseBody = {
    formula: parsed2.formula,
    result: parsed2.result,
    reasoning: parsed2.reasoning,
    formulaType: parsed2.formulaType,
    styleHints: parsed2.styleHints,
    confidence: parsed2.confidence,
  };

  res.json(SmartAnalyzeResponse.parse(responseBody));
});

router.get("/history", async (_req, res): Promise<void> => {
  const history = [...smartHistory].reverse();
  res.json(GetSmartHistoryResponse.parse(history));
});

export default router;
