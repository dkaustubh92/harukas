import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

// Server-only. OPENROUTER_API_KEY must never reach the browser.
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) return Response.json({ error: "The civic assistant is unavailable right now." }, { status: 503 });
  const router = createOpenRouter({ apiKey: key });

  const result = streamText({
    model: router("openai/gpt-5.6-luna"),
    system: "You are a concise civic assistant for the HaruKas Halifax tree incident demo. Explain evidence and uncertainty plainly. Never claim to contact Halifax, dispatch people, certify safety, or create an official request.",
    messages: await convertToModelMessages(messages),
    providerOptions: { openrouter: { reasoning: { effort: "high" } } },
  });

  return result.toUIMessageStreamResponse();
}
