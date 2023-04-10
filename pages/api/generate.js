import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function postToAnotherAPI(story) {
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
      throw new Error(`Request failed with status ${response.status}`);
    }
    const audioData = await response.arrayBuffer();

    // Generate random filename
    const filename = Math.random().toString(36).substring(7) + ".mp3";

    fs.writeFile(
      `./public/audio/${filename}`,
      Buffer.from(audioData),
      (err) => {
        if (err) throw err;
        console.log("The file has been saved!");
      }
    );

    return `/audio/${filename}`;
  } catch (error) {
    console.error("Error posting data to another API:", error.message);
  }
}

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const name = req.body.name || "";
  if (name.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid name",
      },
    });
    return;
  }

  const interest = req.body.interest || "";
  if (interest.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid interest",
      },
    });
    return;
  }

  const age = req.body.age;

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 500,
      prompt: generatePrompt(name, interest, age),
      temperature: 0.6,
    });
    const audio = await postToAnotherAPI(completion.data.choices[0].text);

    res.status(200).json({
      result: completion.data.choices[0].text,
      audioSrc: audio,
    });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(name, interest, age) {
  const capitalizedName = name[0].toUpperCase() + name.slice(1).toLowerCase();
  return `Create a 400 word personalised bedtime story for a child named ${capitalizedName} who is interested in ${interest}. The story should be suitable for a ${age} year old`;
}
