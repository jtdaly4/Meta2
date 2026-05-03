import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import * as xlsx from "xlsx";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

let OVERRIDES: Record<string, any> = {};
try {
  const raw = fs.readFileSync(path.join(__dirname, "..", "pulte_overrides.json"), "utf8");
  OVERRIDES = JSON.parse(raw);
} catch (e: any) {
  console.warn("[buyers] pulte_overrides.json not loaded:", e.message);
}

router.get("/buyers", (req, res) => {
  try {
    const filePath = path.join(ROOT, "Marketing - Closed SW.xlsx");
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<Record<string, any>>(sheet);

    const buyers: any[] = [];

    data.forEach((row) => {
      const phone = row["Primary Phone"] || row["Primary Phone "];
      const community = row["Community"] || "Unknown";
      let address = row["Address "] || row["Address"] || "";
      let city = row["City "] || row["City"] || "";
      let lat: number | null = null;
      let lon: number | null = null;

      const lookup = community.toLowerCase();

      if (OVERRIDES[lookup]) {
        address = OVERRIDES[lookup].address;
        city = OVERRIDES[lookup].city;
        if (OVERRIDES[lookup].lat) lat = OVERRIDES[lookup].lat;
        if (OVERRIDES[lookup].lon) lon = OVERRIDES[lookup].lon;
      } else {
        for (const [key, val] of Object.entries(OVERRIDES)) {
          if (lookup.includes(key) || key.includes(lookup)) {
            address = (val as any).address;
            city = (val as any).city;
            if ((val as any).lat) lat = (val as any).lat;
            if ((val as any).lon) lon = (val as any).lon;
            break;
          }
        }
      }

      if (phone) {
        const match = String(phone).match(/\(?([2-9][0-9]{2})\)?/);
        if (match) {
          buyers.push({
            ac: match[1],
            community: community.trim(),
            address,
            city,
            lat,
            lon,
          });
        }
      }
    });

    res.json(buyers);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process buyer file.", details: error.message });
  }
});

export default router;
