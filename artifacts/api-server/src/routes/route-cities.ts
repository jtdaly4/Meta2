import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as xlsx from "xlsx";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");

const HUB_IATA = new Set(["PGD", "SRQ"]);
const SKIP_PUBLIC_XLSX = new Set(["buyers.xlsx"]);
const ROUTE_CITY_BASENAMES = [
  "Allegiant Cities.xlsx",
  "Allegiant Route Cities.xlsx",
  "route-cities.xlsx",
  "allegiant-cities.xlsx",
];

function normHeader(h: any): string {
  return String(h || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function rowToRecord(row: Record<string, any>) {
  const lookup: Record<string, any> = {};
  Object.keys(row).forEach((k) => { lookup[normHeader(k)] = row[k]; });

  function cell(...aliases: string[]): any {
    for (const a of aliases) {
      const key = normHeader(a);
      if (lookup[key] !== undefined && lookup[key] !== "" && lookup[key] !== null) return lookup[key];
    }
    for (const k of Object.keys(lookup)) {
      for (const a of aliases) {
        const na = normHeader(a);
        if (k === na || k.includes(na) || na.includes(k)) {
          const v = lookup[k];
          if (v !== undefined && v !== "" && v !== null) return v;
        }
      }
    }
    return "";
  }

  const airport_code = String(cell("airport code", "airport_code", "iata", "code", "airport")).trim().toUpperCase();
  const lat = parseFloat(String(cell("latitude", "lat")).replace(/,/g, ""));
  const lng = parseFloat(String(cell("longitude", "lng", "lon", "long")).replace(/,/g, ""));
  const hub = String(cell("hub", "destination hub", "dest hub", "arr airport", "arr", "destination airport", "destination", "dest")).trim().toUpperCase();

  return {
    city: String(cell("city", "market", "origin city", "origin") || ""),
    state: String(cell("state", "st", "state/province", "province") || ""),
    airport_code,
    lat,
    lng,
    hub,
    source: "xlsx",
  };
}

function loadFromWorkbook(filePath: string) {
  const wb = xlsx.readFile(filePath);
  for (let si = 0; si < wb.SheetNames.length; si++) {
    const sheet = wb.Sheets[wb.SheetNames[si]];
    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
    const out: any[] = [];
    rows.forEach((r) => {
      const c = rowToRecord(r);
      if (!c.airport_code || HUB_IATA.has(c.airport_code)) return;
      if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng)) return;
      out.push(c);
    });
    if (out.length > 0) return out;
  }
  return [];
}

function loadJsonFallback() {
  const p = path.join(PUBLIC_DIR, "cities.json");
  if (!fs.existsSync(p)) return [];
  const raw: any[] = JSON.parse(fs.readFileSync(p, "utf8"));
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => ({
      city: o.city || "",
      state: o.state || "",
      airport_code: String(o.airport_code || "").trim().toUpperCase(),
      lat: Number(o.lat),
      lng: Number(o.lng != null && o.lng !== "" ? o.lng : o.lon),
      hub: String(o.hub || o.destination_hub || "").trim().toUpperCase(),
      source: "cities.json",
    }))
    .filter((r) => r.airport_code && !HUB_IATA.has(r.airport_code) && Number.isFinite(r.lat) && Number.isFinite(r.lng));
}

function loadRouteCities() {
  const searchDirs = [ROOT, PUBLIC_DIR];
  for (const dir of searchDirs) {
    for (const name of ROUTE_CITY_BASENAMES) {
      const p = path.join(dir, name);
      if (!fs.existsSync(p)) continue;
      const rows = loadFromWorkbook(p);
      if (rows.length > 0) return rows;
    }
  }
  // Try discovering xlsx files in public
  if (fs.existsSync(PUBLIC_DIR)) {
    const hint = /allegiant|inbound|route|cit(y|ies)|origin|market|flight|airport|iata|g4/i;
    const files = fs.readdirSync(PUBLIC_DIR)
      .filter((f) => /\.xlsx$/i.test(f) && !f.startsWith("~$") && !SKIP_PUBLIC_XLSX.has(f.toLowerCase()) && hint.test(f));
    for (const name of files) {
      const rows = loadFromWorkbook(path.join(PUBLIC_DIR, name));
      if (rows.length > 0) return rows;
    }
  }
  return loadJsonFallback();
}

router.get("/route-cities", (req, res) => {
  try {
    const rows = loadRouteCities();
    res.json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
