import { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import useWebSocket from "react-use-websocket";
import { x } from "../../lib/test";

function App() {
  const [test, setTest] = useState("");
  const WS_URL = "ws://127.0.0.1:8081";
  let x = "max";

  useWebSocket(WS_URL, {
    onOpen: () => {
      let zz: x = { name: "ahlan", jones: "hello" };
      console.log(`zz`, zz);
      console.log("WebSocket connection established.");
    },
    onMessage(event) {
      console.log(event);
    },
  });

  useEffect(() => {
    let person = "";
    if (false) {
      person = prompt("Please enter your name", x)!;
      if (person && person?.length > 0) {
        setTest(person);
      }
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{test}</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
