import { Request, Response, NextFunction } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ── Production domain ──────────────────────────────────────────────────────
export const PRODUCTION_DOMAIN = "node-runner-mustafaalshlany.replit.app";
export const PRODUCTION_ORIGIN = `https://${PRODUCTION_DOMAIN}`;

// ── App token — obfuscated layer between add-in and API ───────────────────
// The frontend includes this in every request header.
// Keep this in sync with VITE_APP_TOKEN in the add-in build.
const APP_TOKEN = process.env.SNIPER_APP_TOKEN ?? "snpr-v1-mustafa-alsahlany-2025";

// ── CORS allowed origins ───────────────────────────────────────────────────
// Office.js task pane may load from the production domain (same-origin) or
// from Microsoft's "webresource" domains in older Excel versions.
const ALLOWED_ORIGINS = new Set([
  PRODUCTION_ORIGIN,
  // Replit preview domains for development
  "https://node-runner-mustafaalshlany.replit.dev",
  // office.com & microsoft domains (Excel Online task pane host)
  "https://excel.officeapps.live.com",
  "https://officeapps.live.com",
]);

function isDev() {
  return process.env.NODE_ENV !== "production";
}

// ── CORS middleware ────────────────────────────────────────────────────────
export function corsProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string | undefined;

    // In dev: accept any origin (Replit preview domains vary)
    if (isDev()) {
      if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-App-Token");
      res.setHeader("Vary", "Origin");
      if (req.method === "OPTIONS") { res.sendStatus(204); return; }
      return next();
    }

    // Production: strict origin check
    if (!origin) {
      // Same-origin requests (no Origin header) are always allowed
      return next();
    }

    // Allow known origins OR any *.microsoft.com / *.officeapps.live.com subdomains
    const isAllowed =
      ALLOWED_ORIGINS.has(origin) ||
      /^https:\/\/[\w.-]+\.microsoft\.com$/.test(origin) ||
      /^https:\/\/[\w.-]+\.officeapps\.live\.com$/.test(origin) ||
      /^https:\/\/[\w.-]+\.office\.com$/.test(origin) ||
      /^https:\/\/[\w-]+\.azurewebsites\.net$/.test(origin) ||
      /^https:\/\/[\w.-]+\.azurestaticapps\.net$/.test(origin);

    if (isAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-App-Token");
      res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") { res.sendStatus(204); return; }

    if (!isAllowed && origin) {
      res.status(403).json({ error: "Origin not permitted" });
      return;
    }

    next();
  };
}

// ── Copyright attribution headers ─────────────────────────────────────────
export function copyrightHeaders() {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Powered-By", "SniperSheet");
    res.setHeader("X-Author", "Mustafa Alsahlany");
    res.setHeader("X-Copyright", `© ${new Date().getFullYear()} Mustafa Alsahlany. All rights reserved.`);
    res.setHeader("X-Product", "SniperSheet AI Formula Engine v1.0");
    res.removeHeader("Server");
    next();
  };
}

// ── Rate limiting — per IP ────────────────────────────────────────────────
// Smart analyze: max 60 requests per 15 minutes per IP
export const smartRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "طلبات كثيرة جداً. حاول مجدداً بعد 15 دقيقة | Too many requests. Try again in 15 minutes." },
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
});

// General API: max 200 requests per 15 minutes per IP
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "حد الطلبات المسموح به. حاول لاحقاً | Rate limit exceeded. Try later." },
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
});

// ── App token validation ───────────────────────────────────────────────────
// Only for /api/smart/* routes — the AI endpoints.
// Public routes (health, manifest, icons) are excluded.
export function requireAppToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip in dev mode for convenience
    if (isDev()) return next();

    const token = req.headers["x-app-token"] as string | undefined;

    if (!token || token !== APP_TOKEN) {
      res.status(401).json({
        error: "Unauthorized — SniperSheet API is proprietary.",
        contact: "mustafa.alsahlany@gmail.com",
      });
      return;
    }

    next();
  };
}
