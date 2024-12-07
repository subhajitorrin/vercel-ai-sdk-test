import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const runtime = "edge";

export const POST = async (request: Request) => {
  try {
    const { messages } = await request.json();

    const stream = streamText({
      model: gemini("gemini-1.5-pro"),
      prompt: messages[messages.length - 1].content,
      system: "You are a helpful assistant."
    });
    return stream.toDataStreamResponse();
  } catch (error) {
    console.log(error);
    return new Response("Error", { status: 500 });
  }
};
