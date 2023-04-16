export default async function generateAudio(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { story } = req.body;

  if (!story) {
    res.status(400).json({ message: "Bad request: Missing 'story' in body" });
    return;
  }

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "audio/mpeg",
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({ text: story }),
      }
    );

    if (!response.ok) {
      throw new Error("Error from external API");
    }

    const audioData = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioData));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error: Failed to fetch from external API",
    });
  }
}
