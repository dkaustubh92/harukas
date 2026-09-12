import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

// Server-only. ANTHROPIC_API_KEY must never reach the browser.
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // Project decision: claude-opus-5 only. See CLAUDE.md and the
    // claude-api-demo skill for why fable-5-1 is barred from this path.
    model: anthropic("claude-opus-5"),
    system:
      "You are a civic assistant for Halifax, Nova Scotia. Be concise and concrete.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
