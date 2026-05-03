import { Router } from "express";

const router = Router();

const PARCL_MARKETS = {
  puntaGorda: 2900279,
  puntaGordaCity: 5353226,
  charlotteCounty: 5821291,
};

const IDX_CITIES = {
  portCharlotte: 37395,
  puntaGorda: 38058,
  sarasota: 41535,
  venice: 48870,
  fortMyers: 16608,
  naples: 31978,
  bradenton: 5264,
};

router.get("/config/markets", (_req, res) => {
  res.json({ parcl: PARCL_MARKETS, idx: IDX_CITIES });
});

export default router;
