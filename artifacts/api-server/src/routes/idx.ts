import { Router } from "express";
import axios from "axios";

const router = Router();

const IDX_API_KEY = process.env.IDX_API_KEY || "oI5EDfmkHoTI1AxuXxDiem";
const IDX_BASE_URL = "https://api.idxbroker.com";
const IDX_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
  accesskey: IDX_API_KEY,
};

const SAVED_LINK_IDS: Record<string, string> = {
  "38058": "1388", // Punta Gorda
  "37395": "1387", // Port Charlotte
  "41535": "1385", // Sarasota
  "48870": "1386", // Venice
  "16608": "1388", // Fort Myers
  "31978": "1389", // Naples
  "5264": "1384",  // Bradenton
};

router.get("/cities", async (_req, res) => {
  try {
    const response = await axios.get(`${IDX_BASE_URL}/mls/cities/d003`, { headers: IDX_HEADERS });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/property-types", async (_req, res) => {
  try {
    const response = await axios.get(`${IDX_BASE_URL}/mls/propertytypes/d003`, { headers: IDX_HEADERS });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sold", async (req, res) => {
  const { offset } = req.query;
  try {
    const response = await axios.get(`${IDX_BASE_URL}/clients/soldpending`, {
      headers: IDX_HEADERS,
      params: { offset: offset || 0 },
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/saved-links", async (_req, res) => {
  try {
    const response = await axios.get(`${IDX_BASE_URL}/clients/savedlinks`, { headers: IDX_HEADERS });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/system-links", async (_req, res) => {
  try {
    const response = await axios.get(`${IDX_BASE_URL}/clients/systemlinks`, { headers: IDX_HEADERS });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/search-fields", async (_req, res) => {
  try {
    const response = await axios.get(`${IDX_BASE_URL}/mls/searchfields/d003`, { headers: IDX_HEADERS });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/listings", async (req, res) => {
  const { cityId, limit } = req.query;
  try {
    if (!cityId) {
      const linkIds = ["1387", "1388"];
      let allListings: any[] = [];
      for (const linkId of linkIds) {
        try {
          const response = await axios.get(
            `${IDX_BASE_URL}/clients/savedlinks/${linkId}/results`,
            { headers: IDX_HEADERS }
          );
          if (Array.isArray(response.data)) {
            allListings = allListings.concat(
              response.data.slice(0, limit ? Math.ceil(parseInt(limit as string) / linkIds.length) : 25)
            );
          }
        } catch (e: any) {
          console.log(`Saved link ${linkId} error:`, e.message);
        }
      }
      res.json({ data: allListings, total: allListings.length });
    } else {
      const linkId = SAVED_LINK_IDS[cityId as string] || "1387";
      const response = await axios.get(
        `${IDX_BASE_URL}/clients/savedlinks/${linkId}/results`,
        { headers: IDX_HEADERS }
      );
      let listings = response.data;
      if (Array.isArray(listings)) {
        listings = listings.filter((l: any) => String(l.cityID) === String(cityId));
        if (limit) listings = listings.slice(0, parseInt(limit as string));
      }
      res.json({ data: listings, total: listings.length });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/saved-link/:id/results", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `${IDX_BASE_URL}/clients/savedlinks/${id}/results`,
      { headers: IDX_HEADERS }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
