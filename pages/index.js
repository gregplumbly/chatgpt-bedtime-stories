import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [animalInput, setAnimalInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    console.log(animalInput)
    console.log(interestInput)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ animal: animalInput, interest: interestInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setAnimalInput("");
      setInterestInput("");
    } catch(error) {
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
        <h3>Personalise a bedtime story</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="animal"
            placeholder="Enter your childs name"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input
            type="text"
            name="interest"
            placeholder="Enter a topic of interest"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
          />
          <input type="submit" value="Generate a story" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
