import { Router, type IRouter } from "express";
import {
  CalculateCellDimensionsBody,
  CalculateCellDimensionsResponse,
  CalculateBatchCellDimensionsBody,
  CalculateBatchCellDimensionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CHAR_WIDTH_PX_PER_PT = 0.6;
const LINE_HEIGHT_MULTIPLIER = 1.4;
const MIN_WIDTH = 60;
const MIN_HEIGHT = 20;
const DEFAULT_FONT_SIZE = 11;
const DEFAULT_PADDING = 8;
const EXCEL_WIDTH_UNIT = 7;
const EXCEL_HEIGHT_UNIT = 0.75;

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
  const charWidthPx = fontSize * CHAR_WIDTH_PX_PER_PT * boldFactor;
  const lineHeightPx = fontSize * LINE_HEIGHT_MULTIPLIER;

  const lines = input.text.split("\n");
  const longestLine = lines.reduce((acc, line) => Math.max(acc, line.length), 0);

  let width: number;
  let height: number;
  let lineCount = lines.length;

  if (input.wrapText && input.maxWidth) {
    const usableWidth = input.maxWidth - padding;
    const charsPerLine = Math.max(1, Math.floor(usableWidth / charWidthPx));

    let wrappedLines = 0;
    for (const line of lines) {
      if (line.length === 0) {
        wrappedLines += 1;
      } else {
        wrappedLines += Math.ceil(line.length / charsPerLine);
      }
    }

    lineCount = wrappedLines;
    width = input.maxWidth;
    height = Math.max(MIN_HEIGHT, Math.ceil(lineCount * lineHeightPx) + padding);
  } else {
    const rawWidth = Math.ceil(longestLine * charWidthPx) + padding;
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
    res.status(400).json({ error: "At least one cell is required" });
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
