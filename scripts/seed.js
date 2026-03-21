// Seed visa programs on self-hosted Supabase
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzM5OTg1NDIsImV4cCI6MTkzMTY3ODU0Mn0.wAH05sXQeBZZIHSDm8Yku9pEaN_cDWWMa58D4n6biOc";
const BASE_URL = "https://db.yashimosh.com";
const fs = require("fs");
const path = require("path");

async function runSQL(sql, label) {
  const res = await fetch(`${BASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`FAIL [${label}]:`, text);
    throw new Error(`Seed step failed: ${label}`);
  }
  console.log(`OK [${label}]`);
}

async function main() {
  const seedSQL = fs.readFileSync(
    path.join(__dirname, "..", "supabase", "migrations", "002_seed_visa_programs.sql"),
    "utf-8"
  );
  // Split by each INSERT statement
  const statements = seedSQL
    .split(/(?=INSERT INTO)/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("INSERT"));

  for (let i = 0; i < statements.length; i++) {
    await runSQL(statements[i], `seed batch ${i + 1}/${statements.length}`);
  }

  // Verify
  const res = await fetch(`${BASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "SELECT country_name, count(*) as programs FROM imm_visa_programs GROUP BY country_name ORDER BY country_name",
    }),
  });
  console.log("\nVisa programs by country:", await res.text());
}

main().catch(console.error);
