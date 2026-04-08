import { Router, type IRouter } from "express";
import Groq from "groq-sdk";
import { SmartAnalyzeBody, SmartAnalyzeResponse, GetSmartHistoryResponse } from "@workspace/api-zod";
import { analyzeFormula } from "../lib/formula-engine.js";

const router: IRouter = Router();

// Groq client — server-side only, key never exposed to browser
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Best free Groq models — fast, high quality, no charge
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",   // most capable, 70B
  "llama3-70b-8192",           // proven stable fallback
  "llama3-8b-8192",            // ultra-fast backup
];

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

const SYSTEM_PROMPT = `You are SniperSheet — a professional Excel formula engineer and formatter. Analyze natural language in Arabic or English and return an Excel action.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no code fences, no explanation outside JSON.

JSON schema (exact):
{
  "formula": "=IF(A1>90,\"ممتاز\",\"جيد\") OR N/A for formatting-only",
  "result": "computed value as string, or null",
  "reasoning": "شرح مختصر بالعربية | brief English explanation",
  "formulaType": "arithmetic|conditional|lookup|statistical|text|date|financial|formatting",
  "styleHints": [{"target":"fill","color":"#FF0000","bold":null,"italic":null,"condition":">90"}],
  "confidence": 0.95
}

FORMULA RULES:
- Use English function names: SUM, IF, IFS, AVERAGEIF, SUMIF, COUNTIF, VLOOKUP, XLOOKUP, INDEX, MATCH, AND, OR, PMT, TODAY, DATEDIF, RANK, ROUND, TEXT, CONCAT, etc.
- Prefer XLOOKUP over VLOOKUP, IFS() over nested IF()
- String values inside formula must use DOUBLE quotes: =IF(A1>90,"ممتاز","جيد")
- Arabic text inside formulas is fully valid: "ممتاز", "ناجح", "راسب"
- If user asks to WRITE a word/text based on condition → use IF formula with that exact text
- If values are provided, compute the result field

COLOR / FORMATTING RULES (very important):
- If user mentions colors (red/أحمر, green/أخضر, yellow/أصفر, blue/أزرق, orange/برتقالي, purple/بنفسجي, pink/وردي): add styleHints
- Color hex mapping: أحمر/red=#FF0000, أخضر/green=#00B050, أصفر/yellow=#FFD700, أزرق/blue=#0070C0, برتقالي/orange=#FF6600, بنفسجي/purple=#7030A0, وردي/pink=#FF99CC, رمادي/gray=#C0C0C0
- If color applies to a CONDITION (e.g., "color cells red if value > 50"): set condition field to "> 50"
- If color applies unconditionally (e.g., "make cells green"): set condition to null
- For FORMATTING-ONLY requests (no formula needed): set formula to "N/A" and formulaType to "formatting"
- styleHints.target: "fill" for background color, "font" for text color

EXAMPLES:
- "اكتب ممتاز إذا الدرجة > 90 وإلا جيد" → formula: =IF(A1>90,"ممتاز","جيد"), formulaType: conditional
- "لوّن الخلايا حمراء إذا القيمة < 0" → formula: N/A, formulaType: formatting, styleHints: [{target:"fill",color:"#FF0000",condition:"< 0"}]
- "اجعل الخلفية خضراء" → formula: N/A, formulaType: formatting, styleHints: [{target:"fill",color:"#00B050",condition:null}]
- "احسب المتوسط إذا > 50 ولوّنها صفراء" → formula: =AVERAGEIF(A:A,">50"), styleHints: [{target:"fill",color:"#FFD700",condition:"> 50"}]

Respond with ONLY the JSON object — nothing else before or after.`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callGroq(description: string, values: number[], cellRef: string): Promise<{ raw: string; model: string } | null> {
  const userPrompt = [
    `Description: ${description}`,
    values.length > 0 ? `Values: [${values.join(", ")}]` : "No specific values.",
    cellRef ? `Cell reference: ${cellRef}` : "Use generic refs like A1.",
  ].join("\n");

  for (let i = 0; i < GROQ_MODELS.length; i++) {
    const model = GROQ_MODELS[i];
    try {
      const completion = await groq.chat.completions.create({
        model,
        max_tokens: 8192,
        temperature: 0.1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (content) return { raw: content, model };
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 429) {
        // Rate limited — wait briefly and try next model
        if (i < GROQ_MODELS.length - 1) await sleep(500);
        continue;
      }
      if (e.status === 503 || e.status === 500) {
        // Server overloaded — try next model
        continue;
      }
      // Unexpected error — log and fall back
      throw err;
    }
  }
  return null;
}

function parseJSON(raw: string, description: string, id: number, model: string): SmartHistoryEntry {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/, "")
    .replace(/^[^{]*/s, "")      // strip anything before first {
    .replace(/}[^}]*$/s, "}")    // strip anything after last }
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
    confidence: typeof r.confidence === "number" ? r.confidence : 0.85,
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

  try {
    const aiResult = await callGroq(description, vals, ref);

    if (aiResult) {
      try {
        entry = parseJSON(aiResult.raw, description, id, aiResult.model);
        req.log.info({ description, formula: entry.formula, model: aiResult.model }, "Groq AI analysis complete");
      } catch {
        req.log.warn({ raw: aiResult.raw }, "Groq JSON parse failed — falling back to local engine");
        const local = analyzeFormula(description, vals, ref);
        entry = { id, description, ...local, analyzedAt: new Date().toISOString(), engine: "local-engine" };
      }
    } else {
      req.log.warn({ description }, "All Groq models busy — using local engine");
      const local = analyzeFormula(description, vals, ref);
      entry = { id, description, ...local, analyzedAt: new Date().toISOString(), engine: "local-engine" };
    }
  } catch (err) {
    req.log.error({ err }, "Groq error — using local engine");
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

// ─── SMART FORMAT ENDPOINT ────────────────────────────────────────────────────

const FORMAT_SYSTEM_PROMPT = `You are SniperSheet Format Engine — a professional Excel formatting assistant.
The user will describe how they want their selected Excel cells to look, in Arabic or English.
You must respond with ONLY a valid JSON object describing the formatting to apply. No markdown, no explanation.

JSON schema (return ALL fields, use null if not applicable):
{
  "fillColor": "#hex or null",
  "fontColor": "#hex or null",
  "bold": true/false/null,
  "italic": true/false/null,
  "underline": true/false/null,
  "fontSize": number or null,
  "fontName": "string or null",
  "horizontalAlignment": "Left|Center|Right|Justify or null",
  "verticalAlignment": "Top|Center|Bottom or null",
  "wrapText": true/false/null,
  "borderPreset": "none|all|outside|thick|dashed or null",
  "numberFormat": "Excel format code or null",
  "reasoning": "شرح عربي مختصر",
  "confidence": 0.95
}

COLOR NAMES → HEX:
أخضر/green=#00B050, أحمر/red=#FF0000, أصفر/yellow=#FFD700, أزرق/blue=#0070C0,
برتقالي/orange=#FF6600, بنفسجي/purple=#7030A0, وردي/pink=#FF99CC,
رمادي/gray=#C0C0C0, أبيض/white=#FFFFFF, أسود/black=#000000,
ذهبي/gold=#FFD700, فضي/silver=#C0C0C0, سماوي/cyan=#00B0F0,
كحلي/navy=#1F3864, بني/brown=#833C00, زيتي/olive=#375623

ALIGNMENT RULES:
- يمين/right → Right, يسار/left → Left, وسط/center → Center
- ضبط/justify → Justify

NUMBER FORMAT EXAMPLES:
- عملة/currency/ريال → "#,##0.00"
- نسبة/percent/% → "0.00%"
- تاريخ/date → "DD/MM/YYYY"
- وقت/time → "HH:MM:SS"
- رقم صحيح/integer → "#,##0"

FONT SIZE: كبير/large=14, صغير/small=9, عادي/normal=11, ضخم/huge=18, صغير جداً/tiny=8

Respond with ONLY the JSON — nothing else.`;

router.post("/format", async (req, res): Promise<void> => {
  const { description, cellRef } = req.body as { description: string; cellRef?: string };

  if (!description?.trim()) {
    res.status(400).json({ error: "description required" });
    return;
  }

  const userMsg = [
    `Formatting request: ${description}`,
    cellRef ? `Selection: ${cellRef}` : "",
  ].filter(Boolean).join("\n");

  try {
    let entry: any = null;

    for (const model of GROQ_MODELS) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          max_tokens: 1024,
          temperature: 0.1,
          messages: [
            { role: "system", content: FORMAT_SYSTEM_PROMPT },
            { role: "user",   content: userMsg },
          ],
        });
        const raw = completion.choices[0]?.message?.content ?? "";
        if (!raw) continue;

        const cleaned = raw
          .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "")
          .replace(/^[^{]*/s, "").replace(/}[^}]*$/s, "}").trim();

        entry = JSON.parse(cleaned);
        req.log.info({ description, model }, "Smart format complete");
        break;
      } catch {
        continue;
      }
    }

    if (!entry) {
      res.status(503).json({ error: "AI format service unavailable, try again" });
      return;
    }

    res.json({
      fillColor:            entry.fillColor            ?? null,
      fontColor:            entry.fontColor            ?? null,
      bold:                 entry.bold                 ?? null,
      italic:               entry.italic               ?? null,
      underline:            entry.underline            ?? null,
      fontSize:             entry.fontSize             ?? null,
      fontName:             entry.fontName             ?? null,
      horizontalAlignment:  entry.horizontalAlignment  ?? null,
      verticalAlignment:    entry.verticalAlignment    ?? null,
      wrapText:             entry.wrapText             ?? null,
      borderPreset:         entry.borderPreset         ?? null,
      numberFormat:         entry.numberFormat         ?? null,
      reasoning:            entry.reasoning            ?? "",
      confidence:           entry.confidence           ?? 0.9,
    });
  } catch (err) {
    req.log.error({ err }, "Smart format error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
