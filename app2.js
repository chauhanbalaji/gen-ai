import readline from 'node:readline/promises'
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
// import { User } from "@clerk/nextjs/server";
// import { log } from 'node:console';

const tvly = tavily({ apikey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// This function must be 'async' to use 'await'
async function main() {


    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

  const messages = [
    {
      role: "system",
      content: `Yes are a smart personal assistant who answer the asked question.
            You have access to following tools:
            1. searchweb({query}: {query: string}) //search the latest information and realtime on the internet.
             current date and time: ${new Date().toUTCString()}`,
            
    },

    {
      role: "user",
      content: "",
      // when was iphone 16 launched?
      // what is the current wether in mumbai?
    },
  ];

   while (true) {

  const question = await rl.question('You: ');
 
   if (question === 'bye') {
    break;
   }

  messages.push({ role: "user", content: question });
     
    while (true) {
    const completions = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: messages,

    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
            "Search the latest information and realtime data on the internet.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform search on.",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  messages.push(completions.choices[0].message);

  const toolCalls = completions.choices[0].message.tool_calls;

  if (!toolCalls) {
    console.log(`Assistant: ${completions.choices[0].message.content}`);
    break;
  }

  for (const tool of toolCalls) {
    // console.log("tool:", tool);
    const functionName = tool.function.name;
    const functionParams = tool.function.arguments;

    if (functionName === "webSearch") {
      const toolResult = await webSearch(JSON.parse(functionParams));
    //   console.log("Tool Result:", toolResult);

      messages.push({
        tool_call_id: tool.id,
        role: "tool",
        name: functionName,
        content: toolResult,
      });
    }
  }

  

}

  }

    rl.close();
}
main();

async function webSearch({ query }) {
  console.log("Calling web search..");

  const response = await tvly.search(query);
//   console.log("Response:", response);

  const finalResult = response.results.map((result) => result.content).join("\n\n");

  return finalResult;
}
