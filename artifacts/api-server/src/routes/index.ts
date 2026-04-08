import { Router, type IRouter } from "express";
import healthRouter from "./health";
import smartRouter from "./smart";
import addinRouter from "./addin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/smart", smartRouter);
router.use("/addin", addinRouter);

export default router;
