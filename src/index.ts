import { FunctionCallingConfigMode, GoogleGenAI, Type, type Content } from '@google/genai';
import dotenv from "dotenv";
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = "gemini-2.5-flash-lite";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// i can make any fucking tool in this world!
const getWeatherDeclObj = {
    name: 'getWeather',
    description: 'Get the weather of any city',
    parameters: {
        type: Type.OBJECT,
        properties: {
            location: {
                type: Type.STRING,
                description: "City. eg. Jalpaiguri, Kolkata, SF",
            },
            unit: {
                type: Type.STRING,
                enum: ["celsius", "fahrenheit"],
            }
        },
        required: ["location"]
    }
}

const getWeather = (args: { location: string; unit?: string }) => ({
    location: args.location,
    unit: args.unit ?? "celsius",
    temperature: 23,
    condition: "sunny",
    description: "It's sunny today but expected heavy thunderstorms in the evening"
});

// Dispatcher: maps tool name → real implementation. Add more tools here.
// Tool results must be plain objects (Record<string, unknown>) — that's what
// Gemini expects for functionResponse.response.
type ToolResult = Record<string, unknown>;
const dispatchers: Record<string, (args: any) => ToolResult | Promise<ToolResult>> = {
    getWeather,
};

const tools = [{ functionDeclarations: [getWeatherDeclObj] }];
const toolConfig = {
    functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
};
const userPrompt = "What is the weather in Jalpaiguri and Tokyo?";

// Build conversation history as we go. Start with the user's question.
const history: Content[] = [
    { role: "user", parts: [{ text: userPrompt }] },
];

// Agent loop: keep calling the model until it stops requesting tools.
// MAX_TURNS is a safety cap so a buggy tool can't cause an infinite loop.
const MAX_TURNS = 5;
let final: string | undefined;

for (let turn = 0; turn < MAX_TURNS; turn++) {
    const resp = await ai.models.generateContent({
        model: MODEL,
        contents: history,
        config: { tools, toolConfig },
    });

    const calls = resp.functionCalls ?? [];

    // No tool calls? Model is done. Capture the text and break.
    if (calls.length === 0) {
        final = resp.text;
        break;
    }

    console.log(`turn ${turn + 1}: model wants ${calls.length} call(s)`);
    for (const c of calls) console.log("  →", c.name, c.args);

    // Run every requested tool in parallel.
    const results = await Promise.all(
        calls.map(async (c) => {
            const fn = dispatchers[c.name!];
            if (!fn) throw new Error(`unknown tool: ${c.name}`);
            return { name: c.name!, response: await fn(c.args ?? {}) };
        })
    );

    // Append the model's turn (all calls in one parts[]) and our reply (all results in one parts[]).
    history.push({ role: "model", parts: calls.map((c) => ({ functionCall: c })) });
    history.push({ role: "user",  parts: results.map((r) => ({ functionResponse: r })) });
}

console.log("\nfinal answer:\n" + (final ?? "(no answer — hit MAX_TURNS)"));
