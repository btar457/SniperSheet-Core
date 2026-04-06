import { Router, type IRouter } from "express";
import healthRouter from "./health";
import commandsRouter from "./commands";
import cellsRouter from "./cells";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/commands", commandsRouter);
router.use(cellsRouter);

export default router;
