import { Router, type IRouter } from "express";
import healthRouter from "./health";
import commandsRouter from "./commands";
import cellsRouter from "./cells";
import smartRouter from "./smart";
import addinRouter from "./addin";
import helpRouter from "./help";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/commands", commandsRouter);
router.use(cellsRouter);
router.use("/smart", smartRouter);
router.use("/addin", addinRouter);
router.use(helpRouter);

export default router;
