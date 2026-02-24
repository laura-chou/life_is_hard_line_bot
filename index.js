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
  console.log("❌ All done");
  process.exit(0);
}

const randomBlock = quotes[Math.floor(Math.random() * quotes.length)];
const randomItem = randomBlock.items[Math.floor(Math.random() * randomBlock.items.length)];
const selectedQuote = { title: randomBlock.title, item: randomItem }

randomBlock.items = randomBlock.items.filter(item => item !== randomItem);
if (randomBlock.items.length === 0) {
  console.log(`⚠️  ${randomBlock.title} used up`);
  quotes = quotes.filter(block => block !== randomBlock);
}

fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2), "utf8");

const createContents = (data) => {
  const contents = [
    {
      type: "text",
      text: data.title,
      size: "lg",
      align: "center",
      color: "#222222",
      margin: "none"
    }
  ];

  const sloganText = {
    type: "text",
    text: data.item.slogan,
    size: "lg",
    align: "center",
    color: "#2F3A56",
    margin: "md",
    wrap: true
  };

  if (data.item.slogan) {
    contents.push(sloganText);
  }

  const quoteTest = {
    type: "text",
    text: data.item.quote,
    color: "#444444",
    size: "lg",
    align: "start",
    margin: "md",
    wrap: true
  }

  if (data.item.quote) {
    contents.push(quoteTest);
  }

  const summaryText = {
    type: "text",
    text: data.item.summary,
    size: "md",
    align: "end",
    color: data.item.url ? "#4169E1" : "#888888",
    margin: "md",
    wrap: true
  };

  if (data.item.url) {
    summaryText.action = {
      type: "uri",
      uri: data.item.url
    };
  }

  contents.push(summaryText);

  const flexMessage = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: contents
    }
  };

  if (data.item.imageUrl) {
    flexMessage.hero = {
      type: "image",
      size: "full",
      aspectRatio: "16:9",
      aspectMode: "cover",
      url: data.item.imageUrl
    };
  }

  return flexMessage;
}

const tokens = [
  process.env.CHANNEL1_ACCESS_TOKEN,
  process.env.CHANNEL2_ACCESS_TOKEN
];

async function broadcastMessage(data) {
  console.log("select quote：", data);
  try {
    const payload = {
      messages: [{
        type: "flex",
        altText: data.title,
        contents: createContents(data)
      }]
    };

    await Promise.all(
      tokens.map(token =>
        axios.post(
          "https://api.line.me/v2/bot/message/broadcast",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        )
      )
    );
    console.log("✅ success");
  } catch (error) {
    console.error("❌ fail：", error.response?.data || error.message);
  }
}

const isTimeToRunTask = () => {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    hour: "numeric",
    hour12: false
  }).format(new Date());

  return Number(hour) === 22;
}

if (isTimeToRunTask()) {
  broadcastMessage(selectedQuote);
}
