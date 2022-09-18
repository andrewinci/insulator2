import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  const add_cluster = async () => {
    await invoke("add_cluster", {
      cluster: {
        name: "example cluster",
        endpoint: "sample endpoint",
        authentication: {
          Sasl: {
            username: "Yo",
            password: "nice one",
            scram: false
          }
        }
      }
    })
      .then(res => console.log(res))
      .catch(err => console.error(err));
  }

  invoke("get_configuration").then(r => console.log(r));

  return (
    <div>
      <h1>Insulator 2</h1>
      <input
        id="greet-input"
        onChange={(e) => setName(e.currentTarget.value)}
        placeholder="Enter a name..."
      />
      <button type="button" onClick={() => add_cluster()}>
        Greet
      </button>
      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
