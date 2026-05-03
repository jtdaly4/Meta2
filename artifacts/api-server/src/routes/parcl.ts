import { Router } from "express";
import axios from "axios";

const router = Router();

const PARCL_API_KEY = process.env.PARCL_API_KEY || "7BURVMkFehg-p9y4IXVXg5DEUhYbZh-hSve-xt4r5-8";
const PARCL_BASE_URL = "https://api.parcllabs.com/v1";

router.get("/markets", async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get(`${PARCL_BASE_URL}/search/markets`, {
      headers: { Authorization: PARCL_API_KEY },
      params: { query: query || "punta gorda", limit: 10 },
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/housing-stock/:parclId", async (req, res) => {
  const { parclId } = req.params;
  const { propertyType } = req.query;
  try {
    const response = await axios.get(
      `${PARCL_BASE_URL}/market_metrics/${parclId}/housing_stock`,
      {
        headers: { Authorization: PARCL_API_KEY },
        params: { property_type: propertyType || "ALL" },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/inventory/:parclId", async (req, res) => {
  const { parclId } = req.params;
  const { propertyType } = req.query;
  try {
    const response = await axios.get(
      `${PARCL_BASE_URL}/for_sale_market_metrics/${parclId}/for_sale_inventory`,
      {
        headers: { Authorization: PARCL_API_KEY },
        params: { property_type: propertyType || "SINGLE_FAMILY" },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/property/search", async (req, res) => {
  try {
    const response = await axios.post(
      `${PARCL_BASE_URL}/property/search_address`,
      req.body,
      {
        headers: {
          Authorization: PARCL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

export default router;
