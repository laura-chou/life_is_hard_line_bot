import axios from "axios";
import path from "path";
import dotenv from "dotenv"
import fs from "fs"
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const quotesPath = path.join(__dirname, "json", "quotes.json");

let quotes = JSON.parse(fs.readFileSync(quotesPath, "utf8"));
if (quotes.length === 0) {
  console.log("❌ 語錄已全部使用完畢");
  process.exit(0);
}

const index = Math.floor(Math.random() * quotes.length);
const selectedQuote = quotes[index];

quotes.splice(index, 1);

fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2), "utf8");

async function broadcastMessage(message) {
  try {
    await axios.post("https://api.line.me/v2/bot/message/broadcast", {
      messages: [{ type: "text", text: message }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    console.log("✅ 廣播成功：", message);
  } catch (error) {
    console.error("❌ 廣播失敗：", error.response?.data || error.message);
  }
}

broadcastMessage(selectedQuote);