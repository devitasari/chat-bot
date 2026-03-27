const { GoogleGenAI } = require("@google/genai");
const promptSync = require("prompt-sync")();
const API_KEY = process.env.GEMINI_API_KEY;

// Initialize Google GenAI correctly
const ai = new GoogleGenAI({ apiKey: API_KEY });

let chalk;

// We'll store conversation history manually (because @google/genai doesn't use startChat like old SDK)
const history = [];

async function askGemini(prompt) {
  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    console.error(
      "Please replace 'YOUR_API_KEY' with your actual Gemini API key."
    );
    return;
  }

  try {
    // Add user message to history
    history.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    // Generate content using the new SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001", // recommended modern model
      contents: history,
      config: {
        maxOutputTokens: 1024,
      },
    });

    const text = response.text.replace(/\*{1,2}/g, "");

    // Add assistant response to history
    history.push({
      role: "model",
      parts: [{ text }],
    });

    return text;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

async function getCustomizedChatbotResponse(userQuery) {
  const persona =
    "You are a techy assistant named 'Foxy'. You are knowledgeable about KADA coding bootcamp. You are friendly and helpful.";
  const capabilities =
    "You can answer only about KADA coding bootcamp.";
  const constraints =
    "Do not engage in arguments, refuse to answer harmful questions, and always maintain a polite tone. If you don't know an answer, say so.";
  const specificInstructions =
    "When asked about non KADA related topics, always refuse to answer politely and suggest the user to ask about KADA coding bootcamp in Jakarta, Indonesia.";

  // Full prompt
  const fullPrompt = `
${persona}
${capabilities}
${constraints}
${specificInstructions}

User Query: ${userQuery}
Foxy:
`;

  const response = await askGemini(fullPrompt);
  return response;
}

async function loadChalk() {
  chalk = await import("chalk");
}

async function main() {
  await loadChalk();

  console.log(
    chalk.default.blue(
      "Foxy: Hello! I'm Foxy, your KADA assistant. Ask me anything about the bootcamp. Type 'exit' to end the chat."
    )
  );

  while (true) {
    let userInput = promptSync(chalk.default.green("You: "));

    if (userInput.toLowerCase() === "exit") {
      console.log(chalk.default.yellow("Exiting the chat. Goodbye!"));
      break;
    }

    let botResponse = await getCustomizedChatbotResponse(userInput);
    console.log(chalk.default.blue("Foxy:"), botResponse);
  }
}

main();