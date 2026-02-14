import axios from "axios";
import path from "path";
import dotenv from "dotenv"
import fs from "fs"
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const newYearPath = path.join(__dirname, "json", "new-year.json");

let newYears = JSON.parse(fs.readFileSync(newYearPath, "utf8"));

if (newYears.length === 0) {
  console.log("❌ New Year all done");
  process.exit(0);
}

const newYearItem = newYears[Math.floor(Math.random() * newYears.length)];
newYears = newYears.filter(item => item !== newYearItem);

const isNewYearTaskTime = () => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const month = Number(parts.find(p => p.type === "month").value);
  const day = Number(parts.find(p => p.type === "day").value);
  const hour = Number(parts.find(p => p.type === "hour").value);

  const inDateRange = (month === 2 && day >= 13 && day <= 15);
  const inHour = (hour === 10);

  return inDateRange && inHour;
};

if (isNewYearTaskTime()) {
  console.log("select quote：", newYearItem);
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: process.env.USER_ID,
        messages: [
          {
            type: "flex",
            altText: "春節教戰手則",
            contents: {
              type: "bubble",
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "春節教戰手則",
                    align: "center",
                    color: "#222222",
                    size: "lg",
                    margin: "none"
                  },
                  {
                    type: "text",
                    text: newYearItem.title,
                    align: "center",
                    color: "#2F3A56",
                    size: "lg",
                    margin: "md"
                  },
                  {
                    type: "text",
                    text: newYearItem.quote,
                    wrap: true,
                    size: "lg",
                    margin: "md",
                    align: "start",
                    color: "#444444"
                  }
                ]
              }
            }
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    console.log("✅ success");
    fs.writeFileSync(newYearPath, JSON.stringify(newYears, null, 2), "utf8");
  } catch (err) {
    console.error("❌ fail：", error.response?.data || error.message);
  }
}
