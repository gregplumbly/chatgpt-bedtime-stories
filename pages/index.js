import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [nameInput, setNameInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [result, setResult] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [showSecondDiv, setShowSecondDiv] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSecondDiv(true);
      }, 11000); // Show the second div 5 seconds after isLoading is true

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  async function generateAudio(story) {
    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ story }),
      });

      if (!response.ok) {
        throw new Error("Error from /api/text-to-speech API");
      }

      const audioData = await response.arrayBuffer();
      // Do something with the audio data, e.g., play it or save it to a file
      setAudioSrc(URL.createObjectURL(new Blob([audioData])));
    } catch (error) {
      console.error(error);
    }
  }

  async function onSubmit(event) {
    setResult("");
    setIsLoading(true);
    event.preventDefault();

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput,
          interest: interestInput,
          age: ageInput,
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      setIsLoading(false);

      setResult(data.result);
      generateAudio(data.result);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>Bedtime stories</title>
      </Head>

      <main className={styles.main}>
        <h3>Personalised audio bedtime stories</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter your childs name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <input
            type="text"
            name="age"
            placeholder="Enter your childs age"
            value={ageInput}
            onChange={(e) => setAgeInput(e.target.value)}
          />
          <input
            type="text"
            name="interest"
            placeholder="Enter topics of interest separated by commas"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
          />
          <input type="submit" value="Generate a story" />
        </form>
        {isLoading && (
          <div>
            Creating your personalised bedtime story for {nameInput}. It will
            appear below along with an audio player.
          </div>
        )}
        {showSecondDiv && (
          <div>
            Synthesizing audio for {nameInput}'s story about {interestInput}...
          </div>
        )}
        {audioSrc && (
          <div>
            <h2>Audio Player</h2>
            <audio src={audioSrc} controls />
          </div>
        )}
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
