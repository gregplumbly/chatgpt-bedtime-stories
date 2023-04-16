import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

    res.status(200).json({
      result: completion.data.choices[0].text,
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
          message: `An error occurred during your request. ${error}`,
        },
      });
    }
  }
}

function generatePrompt(name, interest, age) {
  const capitalizedName = name[0].toUpperCase() + name.slice(1).toLowerCase();
  return `Create a 400 word personalised bedtime story for a child named ${capitalizedName} who is interested in ${interest}. The story should be suitable for a ${age} year old`;
}
