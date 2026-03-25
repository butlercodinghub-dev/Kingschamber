/**
 * Migrate wisdom.json → Supabase via REST API
 * Usage: npx tsx scripts/migrate-to-supabase.ts
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BATCH_SIZE = 50;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

interface WisdomUnit {
  id: string;
  text: string;
  authors: string[];
  primary_author: string;
  source_preview: string;
  embedding: number[];
  theme: string;
  created_at: string;
}

// Use built-in fetch or fall back to node's http
// Node 16 has experimental fetch behind a flag, but Next.js polyfills it
import https from "https";

function simpleFetch(url: string, options: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}): Promise<{ ok: boolean; status: number; text: () => Promise<string>; headers: { get: (k: string) => string | null } }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || "GET",
      headers: options.headers,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          ok: res.statusCode! >= 200 && res.statusCode! < 300,
          status: res.statusCode!,
          text: () => Promise.resolve(data),
          headers: {
            get: (k: string) => {
              const val = res.headers[k.toLowerCase()];
              return typeof val === "string" ? val : val?.[0] ?? null;
            },
          },
        });
      });
    });
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function supabaseRequest(endpoint: string, options: {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const res = await simpleFetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=minimal",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
  return res;
}

async function main() {
  // Load wisdom.json
  const wisdomPath = path.join(process.cwd(), "data", "wisdom.json");
  if (!fs.existsSync(wisdomPath)) {
    console.error("data/wisdom.json not found. Run the pipeline first.");
    process.exit(1);
  }

  console.log("Loading wisdom.json...");
  const raw = fs.readFileSync(wisdomPath, "utf-8");
  const store = JSON.parse(raw);
  const units: WisdomUnit[] = store.units;
  console.log(`Found ${units.length} wisdom units`);

  // Check for existing data
  const countRes = await simpleFetch(
    `${SUPABASE_URL}/rest/v1/wisdom_units?select=id&limit=1`,
    {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "count=exact",
      },
    }
  );
  const contentRange = countRes.headers.get("content-range");
  const existingCount = contentRange ? parseInt(contentRange.split("/")[1]) : 0;

  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} units. Clearing...`);
    await supabaseRequest("wisdom_units?id=neq.", { method: "DELETE" });
  }

  // Upload in batches
  let uploaded = 0;
  for (let i = 0; i < units.length; i += BATCH_SIZE) {
    const batch = units.slice(i, i + BATCH_SIZE).map((u) => ({
      id: u.id,
      text: u.text,
      authors: u.authors,
      primary_author: u.primary_author,
      source_preview: u.source_preview,
      theme: u.theme,
      created_at: u.created_at,
      embedding: JSON.stringify(u.embedding),
    }));

    try {
      await supabaseRequest("wisdom_units", {
        method: "POST",
        body: batch,
      });
      uploaded += batch.length;
    } catch (err) {
      console.error(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, (err as Error).message);
      // Try one-by-one
      for (const unit of batch) {
        try {
          await supabaseRequest("wisdom_units", {
            method: "POST",
            body: unit,
          });
          uploaded++;
        } catch (singleErr) {
          console.error(`  Failed unit ${unit.id}:`, (singleErr as Error).message);
        }
      }
    }

    const pct = Math.round((uploaded / units.length) * 100);
    process.stdout.write(`\rUploaded ${uploaded}/${units.length} (${pct}%)`);
  }

  console.log(`\nMigration complete! ${uploaded} units uploaded to Supabase.`);

  // Verify
  const verifyRes = await simpleFetch(
    `${SUPABASE_URL}/rest/v1/wisdom_units?select=id&limit=1`,
    {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "count=exact",
      },
    }
  );
  const verifyRange = verifyRes.headers.get("content-range");
  const finalCount = verifyRange ? verifyRange.split("/")[1] : "unknown";
  console.log(`Verification: ${finalCount} units in database`);
}

main().catch(console.error);
