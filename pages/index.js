import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [nameInput, setnameInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [result, setResult] = useState();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event) {
    setResult("");
    setIsLoading(true);
    event.preventDefault();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nameInput, interest: interestInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      setIsLoading(false);
      setResult(data.result);

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
            name="name"
            placeholder="Enter your childs name"
            value={nameInput}
            onChange={(e) => setnameInput(e.target.value)}
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

        {isLoading && <div>Creating your personalised bedtime story for {nameInput} It will appear here in less than 30 seconds</div>}
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
