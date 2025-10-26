import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// This function must be 'async' to use 'await'
async function main() {
  const response = await groq.chat.completions.create({
  
    temperature: 0,   // it decide the creativity and larger number it choose more and    randomizec generation 
     
    // top_p: 0.2,
    //stop: 'ga', // Negative
    // max_completion_tokens: 1000,
    // max_tokens: '',
    // frequency_penalty: 1,
    // presence_penalty: 1,
    reasoning_format: {type: 'json_object'},

    model: "llama-3.3-70b-versatile",
    messages: [
        { role: "user", content: "Hello!" 

        }
    ]
  });

  console.log(response);
}

main();