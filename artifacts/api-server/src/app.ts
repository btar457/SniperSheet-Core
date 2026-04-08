import express, { type Express } from "express";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  corsProtection,
  copyrightHeaders,
  generalRateLimit,
} from "./middlewares/protection";

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

export default app;
