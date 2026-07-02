import fs from "node:fs";
import path from "node:path";

const logos = {
  "mobile/airtel.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="#E90000"/><path d="M10 30c7-10 21-10 28 0" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="24" cy="17" r="3.5" fill="#fff"/></svg>`,
  "mobile/jio.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="#0A2885"/><circle cx="24" cy="24" r="10" fill="none" stroke="#fff" stroke-width="3"/><circle cx="24" cy="24" r="4" fill="#fff"/></svg>`,
  "mobile/vi.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="vi" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E60000"/><stop offset="1" stop-color="#5B2D82"/></linearGradient></defs><rect width="48" height="48" rx="24" fill="url(#vi)"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="16" font-family="Arial,sans-serif" font-weight="700">Vi</text></svg>`,
  "mobile/bsnl.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="#225996"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="11" font-family="Arial,sans-serif" font-weight="700">BSNL</text></svg>`,
  "mobile/mtnl.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="#004B8D"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="11" font-family="Arial,sans-serif" font-weight="700">MTNL</text></svg>`,
  "dth/tata_play.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#5C068C"/><polygon points="20,14 34,24 20,34" fill="#fff"/></svg>`,
  "dth/airtel_dth.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#E90000"/><path d="M12 30c8-10 16-10 24 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  "dth/dish_tv.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#FF6600"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="10" font-family="Arial,sans-serif" font-weight="700">DishTV</text></svg>`,
  "dth/sun_direct.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#E31E24"/><circle cx="24" cy="24" r="9" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="24" cy="24" r="3" fill="#FFD100"/></svg>`,
  "dth/d2h.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#E4002B"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial,sans-serif" font-weight="700">d2h</text></svg>`,
  "fasttag/paytm.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#00BAF2"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="12" font-family="Arial,sans-serif" font-weight="700">Paytm</text></svg>`,
  "fasttag/icici.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#F58220"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="10" font-family="Arial,sans-serif" font-weight="700">ICICI</text></svg>`,
  "fasttag/axis.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#971237"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="12" font-family="Arial,sans-serif" font-weight="700">AXIS</text></svg>`,
  "fasttag/hdfc.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#004C8F"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="11" font-family="Arial,sans-serif" font-weight="700">HDFC</text></svg>`,
  "fasttag/kotak.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#ED1C24"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="10" font-family="Arial,sans-serif" font-weight="700">Kotak</text></svg>`,
  "fasttag/idfc.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#9D1F25"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="11" font-family="Arial,sans-serif" font-weight="700">IDFC</text></svg>`,
  "fasttag/sbi.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#22409A"/><circle cx="24" cy="24" r="10" fill="none" stroke="#fff" stroke-width="2"/><circle cx="24" cy="24" r="4" fill="#fff"/></svg>`,
  "fasttag/equitas.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#7B2D81"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">Equitas</text></svg>`,
  "fasttag/federal.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0054A6"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">Federal</text></svg>`,
  "fasttag/indian_bank.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#004B87"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="8" font-family="Arial,sans-serif" font-weight="700">Ind Bank</text></svg>`,
  "broadband/act.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#E4002B"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="13" font-family="Arial,sans-serif" font-weight="700">ACT</text></svg>`,
  "broadband/hathway.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#005DAA"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">Hathway</text></svg>`,
  "electricity/bses.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#F59E0B"/><path d="M26 10 L16 28 H22 L20 38 L32 20 H26 Z" fill="#fff"/></svg>`,
  "electricity/tata_power.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#005AA7"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">Tata Power</text></svg>`,
  "electricity/msedcl.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#F97316"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">MSEDCL</text></svg>`,
  "electricity/bescom.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#2563EB"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">BESCOM</text></svg>`,
  "electricity/tangedco.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#DC2626"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="8" font-family="Arial,sans-serif" font-weight="700">TANGEDCO</text></svg>`,
  "gas/indane.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#E11D48"/><ellipse cx="24" cy="28" rx="8" ry="12" fill="#fff"/><rect x="21" y="12" width="6" height="8" rx="2" fill="#fff"/></svg>`,
  "gas/hp.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#DC2626"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial,sans-serif" font-weight="700">HP</text></svg>`,
  "gas/bharat.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0284C7"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">Bharat</text></svg>`,
  "gas/mahanagar.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#059669"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="8" font-family="Arial,sans-serif" font-weight="700">MGL</text></svg>`,
  "gas/gujarat_gas.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0D9488"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="8" font-family="Arial,sans-serif" font-weight="700">GGL</text></svg>`,
  "water/delhi_jal.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0284C7"/><path d="M24 10 C18 22 14 26 14 30 A10 10 0 0 0 34 30 C34 26 30 22 24 10Z" fill="#fff"/></svg>`,
  "water/bmc.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0369A1"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="12" font-family="Arial,sans-serif" font-weight="700">BMC</text></svg>`,
  "water/bwssb.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0891B2"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">BWSSB</text></svg>`,
  "water/chennai_metro.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#2563EB"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="8" font-family="Arial,sans-serif" font-weight="700">CMWSSB</text></svg>`,
  "water/hyderabad.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0EA5E9"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="8" font-family="Arial,sans-serif" font-weight="700">HMWSSB</text></svg>`,
  "insurance/lic.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#F59E0B"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="13" font-family="Arial,sans-serif" font-weight="700">LIC</text></svg>`,
  "insurance/hdfc_life.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#004C8F"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="8" font-family="Arial,sans-serif" font-weight="700">HDFC Life</text></svg>`,
  "insurance/icici_pru.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#F58220"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="8" font-family="Arial,sans-serif" font-weight="700">ICICI Pru</text></svg>`,
  "insurance/sbi_life.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#22409A"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">SBI Life</text></svg>`,
  "insurance/max_life.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#1D4ED8"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="9" font-family="Arial,sans-serif" font-weight="700">Max Life</text></svg>`,
  "insurance/bajaj_allianz.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#005DAA"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="7" font-family="Arial,sans-serif" font-weight="700">Bajaj Allianz</text></svg>`,
  "credit-card/yes_bank.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#004B87"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="11" font-family="Arial,sans-serif" font-weight="700">YES</text></svg>`,
};

const shared = {
  "postpaid/airtel.svg": "mobile/airtel.svg",
  "postpaid/jio.svg": "mobile/jio.svg",
  "postpaid/vi.svg": "mobile/vi.svg",
  "postpaid/bsnl.svg": "mobile/bsnl.svg",
  "postpaid/mtnl.svg": "mobile/mtnl.svg",
  "broadband/airtel.svg": "mobile/airtel.svg",
  "broadband/jio.svg": "mobile/jio.svg",
  "broadband/bsnl.svg": "mobile/bsnl.svg",
  "credit-card/hdfc.svg": "fasttag/hdfc.svg",
  "credit-card/icici.svg": "fasttag/icici.svg",
  "credit-card/sbi.svg": "fasttag/sbi.svg",
  "credit-card/axis.svg": "fasttag/axis.svg",
  "credit-card/kotak.svg": "fasttag/kotak.svg",
};

const base = path.join(process.cwd(), "public", "assets", "operators");

for (const [file, content] of Object.entries(logos)) {
  const full = path.join(base, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

for (const [dest, src] of Object.entries(shared)) {
  const content = logos[src];
  const full = path.join(base, dest);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

console.log(`Created ${Object.keys(logos).length + Object.keys(shared).length} logos`);
