import { ChangeEvent, useEffect, useState } from "react";
import useStateRef from "react-usestateref";
import "bootstrap/dist/css/bootstrap.css";
import Board from "./comp/board";

function App() {
  const [serverIP, setServerIP, refServerIP] = useStateRef("127.0.0.1");
  const [serverPort, setServerPort, refServerPort] = useStateRef("8081");
  const [username, setUsername] = useState(null as unknown as string);
  const [test, setTest] = useState("");
  const [canConnect, setCanConnect] = useState(false);

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setServerIP(value);
  };

  const handle2 = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setServerPort(value);
  };

  const handle3 = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setUsername(value);
  };

  useEffect(() => {
    let person = "Max";
    if (false) {
      person = prompt("Please enter your name", person)!;
      if (person && person?.length > 0) {
        setTest(person);
      }
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header"></header>
      <div className="container-fluid">
        {!canConnect && (
          <div className="row">
            <div className="col-1">
              <button
                className="btn btn-primary"
                onClick={() => setCanConnect(true)}
              >
                Connect
              </button>
            </div>
            <div className="col-1 me-5">
              <input onChange={handle} value={serverIP} />
            </div>
            <div className="col-1 me-5">
              <input onChange={handle2} value={serverPort} />
            </div>
            <div className="col-1 me-5">
              <input
                placeholder="(username)"
                onChange={handle3}
                value={username}
              />
            </div>
          </div>
        )}
        {canConnect && (
          <Board
            username={username}
            ip={serverIP}
            port={serverPort}
            setCanConnect={setCanConnect}
          />
        )}
      </div>
    </div>
  );
}

export default App;
