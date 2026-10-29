// Talk to the bot locally, no WhatsApp needed:  npm run bot:chat
// Lines look like   385911111111: hello      or   385911111111: [offer:accept:1]
// A line without a number reuses the previous one. Type /reset to wipe the database.
import { createInterface } from "readline";
import { closeDb } from "../lib/bot/db";
import { inbound, loadEnv, render, resetDb } from "./harness";

loadEnv();

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "> " });
  let phone = "385910000001";
  console.log("Format:  <phone>: <message>   or   <message>   ·   [button:id] taps a button   ·   /reset   ·   Ctrl+D quits");
  rl.prompt();
  for await (const line of rl) {
    try {
      if (line.trim() === "/reset") {
        await resetDb();
        console.log("database reset");
      } else if (line.trim()) {
        const m = line.match(/^\s*(\d{6,15})\s*:\s*(.*)$/);
        if (m) phone = m[1];
        for (const s of await inbound(phone, m ? m[2] : line.trim())) console.log("\n" + render(s));
      }
    } catch (e) {
      console.error(e);
    }
    console.log();
    rl.prompt();
  }
  await closeDb();
}

main();
