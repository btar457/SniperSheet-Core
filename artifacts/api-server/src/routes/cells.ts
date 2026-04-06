import { Router, type IRouter } from "express";
import {
  CalculateCellDimensionsBody,
  CalculateCellDimensionsResponse,
  CalculateBatchCellDimensionsBody,
  CalculateBatchCellDimensionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const LINE_HEIGHT_MULTIPLIER = 1.4;
const MIN_WIDTH = 60;
const MIN_HEIGHT = 20;
const DEFAULT_FONT_SIZE = 11;
const DEFAULT_PADDING = 8;
const EXCEL_WIDTH_UNIT = 7;
const EXCEL_HEIGHT_UNIT = 0.75;

const LATIN_CHAR_WIDTH_FACTOR = 0.6;
const ARABIC_CHAR_WIDTH_FACTOR = 0.9;

const ARABIC_UNICODE_RANGES = [
  [0x0600, 0x06ff], // Arabic
  [0x0750, 0x077f], // Arabic Supplement
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
];

function isArabicChar(code: number): boolean {
  return ARABIC_UNICODE_RANGES.some(([start, end]) => code >= start && code <= end);
}

function measureVisualWidth(text: string, charWidthLatin: number, charWidthArabic: number): number {
  let total = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    total += isArabicChar(code) ? charWidthArabic : charWidthLatin;
  }
  return total;
}

interface DimRequest {
  text: string;
  fontSize?: number | null;
  bold?: boolean | null;
  padding?: number | null;
  maxWidth?: number | null;
  wrapText?: boolean | null;
}

interface DimResult {
  width: number;
  height: number;
  widthExcel: number;
  heightExcel: number;
  characterCount: number;
  lineCount: number;
}

function computeDimensions(input: DimRequest): DimResult {
  const fontSize = input.fontSize ?? DEFAULT_FONT_SIZE;
  const padding = (input.padding ?? DEFAULT_PADDING) * 2;
  const boldFactor = input.bold ? 1.1 : 1.0;

  const charWidthLatin = fontSize * LATIN_CHAR_WIDTH_FACTOR * boldFactor;
  const charWidthArabic = fontSize * ARABIC_CHAR_WIDTH_FACTOR * boldFactor;
  const lineHeightPx = fontSize * LINE_HEIGHT_MULTIPLIER;

  const lines = input.text.split("\n");
  const longestLineVisualWidth = lines.reduce(
    (acc, line) => Math.max(acc, measureVisualWidth(line, charWidthLatin, charWidthArabic)),
    0
  );

  let width: number;
  let height: number;
  let lineCount = lines.length;

  if (input.wrapText && input.maxWidth) {
    const usableWidth = input.maxWidth - padding;

    let wrappedLines = 0;
    for (const line of lines) {
      if (line.length === 0) {
        wrappedLines += 1;
      } else {
        const lineVisualWidth = measureVisualWidth(line, charWidthLatin, charWidthArabic);
        wrappedLines += Math.max(1, Math.ceil(lineVisualWidth / Math.max(1, usableWidth)));
      }
    }

    lineCount = wrappedLines;
    width = input.maxWidth;
    height = Math.max(MIN_HEIGHT, Math.ceil(lineCount * lineHeightPx) + padding);
  } else {
    const rawWidth = Math.ceil(longestLineVisualWidth) + padding;
    width = Math.max(MIN_WIDTH, rawWidth);
    if (input.maxWidth && width > input.maxWidth) {
      width = input.maxWidth;
    }
    height = Math.max(MIN_HEIGHT, Math.ceil(lineCount * lineHeightPx) + padding);
  }

  const widthExcel = parseFloat((width / EXCEL_WIDTH_UNIT).toFixed(2));
  const heightExcel = parseFloat((height / EXCEL_HEIGHT_UNIT).toFixed(2));

  return {
    width,
    height,
    widthExcel,
    heightExcel,
    characterCount: input.text.length,
    lineCount,
  };
}

router.post("/cells/dimensions", async (req, res): Promise<void> => {
  const parsed = CalculateCellDimensionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = computeDimensions(parsed.data);
  req.log.info({ text: parsed.data.text.slice(0, 50), result }, "Cell dimensions calculated");
  res.json(CalculateCellDimensionsResponse.parse(result));
});

router.post("/cells/batch-dimensions", async (req, res): Promise<void> => {
  const parsed = CalculateBatchCellDimensionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { cells, uniformWidth, uniformHeight } = parsed.data;

  if (cells.length === 0) {
    res.status(400).json({ error: "يجب توفير خلية واحدة على الأقل / At least one cell is required" });
    return;
  }

  const results = cells.map((cell) => computeDimensions(cell));

  const maxWidth = Math.max(...results.map((r) => r.width));
  const maxHeight = Math.max(...results.map((r) => r.height));
  const recommendedWidth = uniformWidth ? maxWidth : maxWidth;
  const recommendedHeight = uniformHeight ? maxHeight : maxHeight;

  req.log.info({ cellCount: cells.length, maxWidth, maxHeight }, "Batch cell dimensions calculated");

  res.json(
    CalculateBatchCellDimensionsResponse.parse({
      results,
      maxWidth,
      maxHeight,
      recommendedWidth,
      recommendedHeight,
    })
  );
});

export default router;
