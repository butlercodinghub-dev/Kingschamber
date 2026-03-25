import path from "path";
import fs from "fs";
import { parseWhatsAppChat } from "../lib/parser";

const PROJECT_ROOT = "/Users/renobutler/Desktop/KINGS CHAMBER APP";
const APP_ROOT = path.join(PROJECT_ROOT, "kings-chamber");

async function main() {
  const chatFile = path.join(
    PROJECT_ROOT,
    "text file",
    "WhatsApp Chat with 🍾Los Negros Más Reales🍾💸.txt"
  );

  console.log("Parsing WhatsApp chat...");
  console.log("Source:", chatFile);

  if (!fs.existsSync(chatFile)) {
    console.error("Chat file not found at:", chatFile);
    process.exit(1);
  }

  const messages = await parseWhatsAppChat(chatFile);
  console.log(`Parsed ${messages.length} valid messages`);

  // Show author breakdown
  const authorCounts: Record<string, number> = {};
  for (const m of messages) {
    authorCounts[m.name] = (authorCounts[m.name] || 0) + 1;
  }
  console.log("\nTop authors:");
  Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([name, count]) => console.log(`  ${name}: ${count} messages`));

  const outPath = path.join(APP_ROOT, "data/parsed-messages.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(messages, null, 2));
  console.log(`\nSaved to ${outPath}`);
}

main().catch(console.error);
