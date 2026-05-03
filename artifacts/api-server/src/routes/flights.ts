import { Router } from "express";
import axios from "axios";

const router = Router();

const AVIATION_API_KEY = process.env.AVIATION_API_KEY || "38d7870470c62ea34a2014bd92dee793";

router.get("/flights", async (req, res) => {
  const { dep_iata, arr_iata } = req.query;
  const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${AVIATION_API_KEY}&dep_iata=${dep_iata}&arr_iata=${arr_iata}`;
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/inbound", async (req, res) => {
  const { airport } = req.query;
  const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${AVIATION_API_KEY}&arr_iata=${airport}&airline_iata=G4&limit=100`;
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
