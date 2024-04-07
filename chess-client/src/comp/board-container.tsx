import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Message, User } from "@lib/lib";
import useStateRef from "react-usestateref";
import { Socket, io } from "socket.io-client";
import Picker from "./picker";

const BoardContainer: React.FC<{
  ip: string;
  port: string;
  username: string;
  setCanConnect: Dispatch<SetStateAction<boolean>>;
}> = ({ ip, port, username, setCanConnect }) => {
  if (username === undefined || username === null || username?.length < 3) {
    alert("Username must be atleast 3 characters!");
    setCanConnect(false);
  }

  const WS_URL = () => `ws://${ip}:${port}`;
  const [user, setUser, refUser] = useStateRef(null as unknown as User);
  const [isConnected, setIsConnected] = useStateRef(false);
  const [socket, setSocket, refSocket] = useStateRef(
    null as unknown as Socket<any, any>
  );
  const [players, setPlayers] = useState([] as string[]);

  useEffect(() => {
    let doIgnore = false;

    makeSocket();

    return () => {
      doIgnore = true;
    };
  }, []);

  function makeSocket() {
    let _socket = io(WS_URL(), {
      query: { username: username },
      autoConnect: false,
      closeOnBeforeunload: true,
    })
      .on("connect", () => {
        console.log("connected!");
        setIsConnected(true);
      })
      .on("disconnect", (event) => {
        console.log("disconnected!");
        // const _ = !_socket.disconnected ? _socket.disconnect() : null;
        setIsConnected(false);
        setCanConnect(false);
      })
      .on("from-server", (event: Message) => {
        switch (event?.command) {
          case "getavailableplayers":
            break;
          default:
            break;
        }

        console.log(`event`, event);
      });

    setSocket(_socket);
    if (false) refSocket.current?.connect();
  }
  // https://stackoverflow.com/questions/73781573/socket-io-server-connection-fires-multiple-times

  //?username=${username}

  // : Socket<any, any, any, any>
  // : Socket<DefaultEventsMap, DefaultEventsMap>

  return (
    <>
      <div className="row">
        <div className="col-1">
          <span>Status: {String(isConnected)}</span>
        </div>
        <div className="col-1" hidden={!isConnected}>
          <button
            className="btn btn-primary"
            onClick={() => {
              console.log(`user from test before sending`, refUser.current);
              socket.emit("from-client", {});
            }}
          >
            test
          </button>
        </div>
        <div className="col-1" hidden={isConnected}>
          <button
            className="btn btn-primary"
            onClick={() => {
              socket.connect();
            }}
          >
            connect
          </button>
        </div>
        <div className="col-1">
          <span>..................................</span>
        </div>
        {user && (
          <div className="col-2">
            <span>userid: {user?.userId}</span>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="row">
          <Picker
            inputSocket={socket}
            inputUsername={username}
            inputPlayers={players}
          />
        </div>
      )}
    </>
  );
};

export default BoardContainer;
