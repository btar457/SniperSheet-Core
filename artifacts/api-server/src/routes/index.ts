import { Router, type IRouter } from "express";
import healthRouter from "./health";
import smartRouter from "./smart";
import addinRouter from "./addin";
import { smartRateLimit, requireAppToken } from "../middlewares/protection";

const router: IRouter = Router();

// Public — health + manifest
router.use(healthRouter);
router.use("/addin", addinRouter);

// Protected — AI smart endpoints: token + stricter rate limit
router.use("/smart", requireAppToken(), smartRateLimit, smartRouter);

export default router;
