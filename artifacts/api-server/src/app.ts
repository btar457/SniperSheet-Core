import express, { type Express } from "express";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  corsProtection,
  copyrightHeaders,
  generalRateLimit,
} from "./middlewares/protection";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ── Security & attribution ────────────────────────────────────────────────────
app.use(copyrightHeaders());        // © Mustafa Alsahlany on every response
app.use(corsProtection());          // Strict CORS — production domain only
app.use(generalRateLimit);          // 200 req / 15 min per IP (global)

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Static frontend (production / Azure) ─────────────────────────────────────
// In production the built Excel Add-in files live next to the server bundle.
// Vite output is copied there by the Azure build script.
if (process.env.NODE_ENV === "production") {
  const addinPublic = path.join(__dirname, "..", "addon-public");
  app.use("/", express.static(addinPublic));
  // SPA catch-all — serves index.html for any non-API path
  app.get("*", (_req, res) => {
    res.sendFile(path.join(addinPublic, "index.html"));
  });
}

export default app;
