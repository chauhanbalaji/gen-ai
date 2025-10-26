import Groq from "groq-sdk";
import fetch from "node-fetch";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🔧 Define the real weather tool
async function webSearch(query) {
  const city = query.match(/weather in (.+)/i)?.[1] || "Mumbai";
  const apiKey = process.env.OPENWEATHER_API_KEY; // get your key from https://openweathermap.org/api
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.cod !== 200) {
    return `Couldn't fetch weather for ${city}: ${data.message}`;
  }

  const desc = data.weather[0].description;
  const temp = data.main.temp;
  const humidity = data.main.humidity;
  const feels = data.main.feels_like;

  return `The current weather in ${city} is ${desc} with a temperature of ${temp}°C, feels like ${feels}°C, and humidity of ${humidity}%.`;
}

async function main() {
  const response = await groq.chat.completions.create({
    model: "llama3-groq-8b-8192-tool-use-preview",
    messages: [{ role: "user", content: "current weather in Mumbai" }],
    tools: [
      {
        type: "function",
        name: "webSearch",
        description: "Fetch live weather info for a given city",
        parameters: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
      },
    ],
  });

  const message = response.choices[0].message;

  if (message.tool_calls) {
    for (const toolCall of message.tool_calls) {
      if (toolCall.name === "webSearch") {
        const args = JSON.parse(toolCall.arguments);
        const result = await webSearch(args.query);
        console.log("Weather:", result);
      }
    }
  } else {
    console.log("Assistant:", message.content);
  }
}

main();
