import { Router, type IRouter } from "express";
import healthRouter from "./health";
import flightsRouter from "./flights";
import parclRouter from "./parcl";
import idxRouter from "./idx";
import inventoryRouter from "./inventory";
import routeCitiesRouter from "./route-cities";
import configRouter from "./config";

const router: IRouter = Router();

router.use(healthRouter);
router.use(flightsRouter);
router.use("/parcl", parclRouter);
router.use("/idx", idxRouter);
router.use("/inventory", inventoryRouter);
router.use(routeCitiesRouter);
router.use(configRouter);

export default router;
