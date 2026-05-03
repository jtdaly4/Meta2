import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import * as xlsx from "xlsx";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

const SPEC_FILE = "Spec Tracker (House Cube) 4.14.2026 - SC Version.xlsx";

let OVERRIDES: Record<string, any> = {};
try {
  const raw = fs.readFileSync(path.join(__dirname, "..", "pulte_overrides.json"), "utf8");
  OVERRIDES = JSON.parse(raw);
} catch (e: any) {
  console.warn("[inventory] pulte_overrides.json not loaded:", e.message);
}

function findOverride(communityName: string): any {
  if (!communityName || !Object.keys(OVERRIDES).length) return null;
  const raw = String(communityName).toLowerCase().trim();
  const noNum = raw.replace(/(\s+-\s*\d+)+\s*$/, "").trim();
  const base = noNum.replace(/\s*[-–—].*$/, "").trim();
  const baseClean = base.replace(/\s+[\d'""]+$/, "").trim();
  const expanded = baseClean.replace(/^dw\s*@\s*/, "del webb ").trim();
  const noParens = expanded.replace(/\s*\([^)]+\)\s*$/, "").trim();
  const variants = [...new Set([raw, noNum, base, baseClean, expanded, noParens].filter(Boolean))];
  for (const v of variants) {
    if (OVERRIDES[v]) return OVERRIDES[v];
  }
  for (const [key, val] of Object.entries(OVERRIDES)) {
    for (const v of variants) {
      if (!v) continue;
      if (v.includes(key) || key.includes(v)) return val;
    }
  }
  return null;
}

function parseMoney(val: any): number | null {
  if (val == null || val === "") return null;
  const n = Number(String(val).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseCommissionPct(val: any): number | null {
  if (val == null || val === "") return null;
  const s = String(val).trim().replace(/%/g, "");
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n > 0 && n <= 1 ? n * 100 : n;
}

router.get("/pulte", (req, res) => {
  try {
    const filePath = path.join(ROOT, SPEC_FILE);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const aoa = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "", raw: false });

    const rows: any[] = [];
    for (let i = 8; i < aoa.length; i++) {
      const row = aoa[i] as any[];
      if (!row || row.every((c: any) => c === "" || c == null)) continue;

      const mlsRaw = row[7];
      const mlsStr = mlsRaw != null ? String(mlsRaw).trim().toUpperCase() : "";
      const isSecret = mlsStr !== "Y";

      const approvedPricing = parseMoney(row[13]);
      const pct = parseCommissionPct(row[17]);
      let totalCommission: number | null = null;
      if (approvedPricing != null && pct != null) {
        totalCommission = approvedPricing * (pct / 100);
      }

      const ov = findOverride(row[1]);
      const lat = ov && ov.lat != null ? ov.lat : null;
      const lon = ov && ov.lon != null ? ov.lon : null;
      const geocodeQuery =
        !lat && ov && ov.address && ov.city ? ov.address + ", " + ov.city + ", FL" : null;
      const geocodeCity = ov ? ov.city || null : null;

      rows.push({
        count: row[0],
        communityName: row[1],
        lot: row[2],
        plan: row[3],
        constructionStage: row[4],
        lotStatus: row[5],
        qmi: row[6],
        mls: row[7],
        projectedFinalDate: row[8],
        basePrice: parseMoney(row[9]),
        optionPrice: parseMoney(row[10]),
        lotPremium: parseMoney(row[11]),
        publishedIncentive: parseMoney(row[12]),
        approvedPricing,
        pmcClosingCosts: parseMoney(row[14]),
        forwardCommitmentAvailable: row[15],
        forwardCommitmentRate: row[16],
        totalInBrokerSalesCommissionPct: pct,
        isSecret,
        totalCommission,
        lat,
        lon,
        geocodeQuery,
        geocodeCity,
      });
    }

    res.json(rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to read inventory workbook",
      details: error.message,
      file: SPEC_FILE,
    });
  }
});

export default router;
