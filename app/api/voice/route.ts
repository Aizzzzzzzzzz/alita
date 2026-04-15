import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    // 🔥 IMPORTANT: CHECK ERROR FROM ELEVENLABS
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs Error:", errorText);

      return NextResponse.json(
        { error: "ElevenLabs failed", details: errorText },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server crash" }, { status: 500 });
  }
}