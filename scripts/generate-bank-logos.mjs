import fs from "node:fs";
import path from "node:path";

/** @typedef {{ file: string; label: string; color: string }} BankBrand */

/** @type {BankBrand[]} */
const banks = [
  { file: "sbi.svg", label: "SBI", color: "#22409A" },
  { file: "hdfc.svg", label: "HDFC", color: "#004C8F" },
  { file: "icici.svg", label: "ICICI", color: "#F58220" },
  { file: "axis.svg", label: "AXIS", color: "#971237" },
  { file: "pnb.svg", label: "PNB", color: "#A20E3B" },
  { file: "bob.svg", label: "BOB", color: "#F57C00" },
  { file: "canara.svg", label: "CANARA", color: "#008FD5" },
  { file: "union.svg", label: "UNION", color: "#0054A6" },
  { file: "indian_bank.svg", label: "INDIAN", color: "#004B87" },
  { file: "uco.svg", label: "UCO", color: "#0057A4" },
  { file: "boi.svg", label: "BOI", color: "#0054A6" },
  { file: "central_bank.svg", label: "CBI", color: "#6B21A8" },
  { file: "psb.svg", label: "P&S", color: "#0F766E" },
  { file: "idbi.svg", label: "IDBI", color: "#F97316" },
  { file: "iob.svg", label: "IOB", color: "#7C3AED" },
  { file: "bom.svg", label: "BOM", color: "#2563EB" },
  { file: "kotak.svg", label: "KOTAK", color: "#ED1C24" },
  { file: "indusind.svg", label: "INDUS", color: "#982E2B" },
  { file: "yes.svg", label: "YES", color: "#004B87" },
  { file: "rbl.svg", label: "RBL", color: "#1D4ED8" },
  { file: "federal.svg", label: "FEDERAL", color: "#0054A6" },
  { file: "sib.svg", label: "SIB", color: "#0E7490" },
  { file: "bandhan.svg", label: "BANDHAN", color: "#C026D3" },
  { file: "au.svg", label: "AU", color: "#7C2D12" },
  { file: "ujjivan.svg", label: "UJJIVAN", color: "#15803D" },
  { file: "equitas.svg", label: "EQUITAS", color: "#7B2D81" },
  { file: "esaf.svg", label: "ESAF", color: "#0369A1" },
  { file: "jana.svg", label: "JANA", color: "#B45309" },
  { file: "suryoday.svg", label: "SURY", color: "#EA580C" },
  { file: "karnataka.svg", label: "KTK", color: "#9333EA" },
  { file: "kvb.svg", label: "KVB", color: "#DC2626" },
  { file: "tmb.svg", label: "TMB", color: "#0891B2" },
  { file: "cub.svg", label: "CUB", color: "#1E40AF" },
  { file: "dcb.svg", label: "DCB", color: "#4338CA" },
  { file: "csb.svg", label: "CSB", color: "#0D9488" },
  { file: "dbs.svg", label: "DBS", color: "#DC2626" },
  { file: "scb.svg", label: "SCB", color: "#047857" },
  { file: "hsbc.svg", label: "HSBC", color: "#DB0011" },
  { file: "deutsche.svg", label: "DB", color: "#0018A8" },
  { file: "citi.svg", label: "CITI", color: "#003B70" },
  { file: "idfc.svg", label: "IDFC", color: "#9D1F25" },
];

/** @param {BankBrand} bank */
function svg(bank) {
  const { label, color } = bank;
  const fontSize = label.length > 5 ? 8 : label.length > 4 ? 9 : 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="${label}"><rect width="48" height="48" rx="10" fill="${color}"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="${fontSize}" font-family="Arial,sans-serif" font-weight="700">${label}</text></svg>`;
}

const base = path.join(process.cwd(), "public", "assets", "banks");
fs.mkdirSync(base, { recursive: true });

for (const bank of banks) {
  fs.writeFileSync(path.join(base, bank.file), svg(bank));
}

console.log(`Created ${banks.length} bank logos`);
