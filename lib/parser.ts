import readline from "readline";
import fs from "fs";
import { ParsedMessage } from "@/types/wisdom";

// WhatsApp uses Unicode narrow no-break space (U+202F) between time and AM/PM
const MESSAGE_REGEX =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?[\u202f\u0020][AP]M)\s+-\s+(.+?):\s*(.*)/;

const SYSTEM_KEYWORDS = [
  "<media omitted>",
  "end-to-end encrypted",
  "messages and calls are",
  "missed voice call",
  "missed video call",
  "you deleted this message",
  "this message was deleted",
];

const SYSTEM_AUTHORS = [
  "meta ai",
  "whatsapp",
];

function isEmojiOnly(text: string): boolean {
  const stripped = text.replace(
    /[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}\u200d\ufe0f\u20e3\uFE0F]/gu,
    ""
  ).trim();
  return stripped.length < 3;
}

function isUrlOnly(text: string): boolean {
  return /^https?:\/\/\S+$/.test(text.trim());
}

function shouldFilter(name: string, text: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerName = name.toLowerCase();

  if (SYSTEM_AUTHORS.some((a) => lowerName.includes(a))) return true;
  if (SYSTEM_KEYWORDS.some((k) => lowerText.includes(k))) return true;
  if (isEmojiOnly(text)) return true;
  if (isUrlOnly(text)) return true;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 5) return true;

  return false;
}

export async function parseWhatsAppChat(filePath: string): Promise<ParsedMessage[]> {
  const messages: ParsedMessage[] = [];
  let currentMsg: ParsedMessage | null = null;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const match = line.match(MESSAGE_REGEX);
    if (match) {
      // Save previous message if valid
      if (currentMsg && !shouldFilter(currentMsg.name, currentMsg.text)) {
        messages.push(currentMsg);
      }
      const [, date, , name, text] = match;
      currentMsg = { date, name: name.trim(), text: text.trim() };
    } else if (currentMsg && line.trim()) {
      // Continuation line
      currentMsg.text += " " + line.trim();
    }
  }

  // Don't forget the last message
  if (currentMsg && !shouldFilter(currentMsg.name, currentMsg.text)) {
    messages.push(currentMsg);
  }

  return messages;
}
