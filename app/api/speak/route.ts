import { NextRequest, NextResponse } from "next/server";
import say from "say";

// Named export for POST method
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse JSON from the request body
    const { text, voice = "Alex", speed = 1.0 } = body;

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { message: "Invalid text provided." },
        { status: 400 }
      );
    }

    console.log("Received text:", text);

    // Use say.speak to perform text-to-speech
    await new Promise<void>((resolve, reject) => {
      say.speak(text, voice, speed, (err) => {
        if (err) {
          reject(err); // Reject on error
        } else {
          resolve(); // Resolve when done
        }
      });
    });

    // Respond with success
    return NextResponse.json(
      { message: "Text has been spoken." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in speech:", error);
    return NextResponse.json(
      { message: "Error speaking text." },
      { status: 500 }
    );
  }
}
