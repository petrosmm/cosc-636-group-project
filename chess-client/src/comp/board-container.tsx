import { Dispatch, SetStateAction, useState } from "react";
import useWebSocket, { Options, ReadyState } from "react-use-websocket";
import { Message, User } from "@lib/lib";
import useStateRef from "react-usestateref";
import { deepCopy } from "src/functions";

function checkUser() {}

const BoardContainer: React.FC<{
  ip: string;
  port: string;
  username: string;
  setCanConnect: Dispatch<SetStateAction<boolean>>;
}> = ({ ip, port, username, setCanConnect }) => {
  const [colorMine, setColorMine] = useState("");
  const [user, setUser, refUser] = useStateRef(null as unknown as User);
  if (username === undefined || username === null || username?.length < 3) {
    alert("Username must be atleast 3 characters!");
    setCanConnect(false);
  }

  const options: Options = {
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
    onOpen: () => {
      console.log("WebSocket connection established.");
      setCanConnect(true);
    },
    onMessage(event) {
      if (false) console.log(`event`, event);
      let message = JSON.parse(event.data) as Message;
      console.log(`incoming message`, message);

      // if we don't have a current user in this view?
      if (user == null) {
        try {
          console.log(`incoming command`, message?.command);
          console.log(`result`, message);
          setUser(message);
        } catch (ex) {
          console.log(`ex`, ex);
        }

        // if we have a username and
        if (username != null && refUser.current?.username == null) {
          try {
            let _userCommand = deepCopy(refUser.current) as Message;

            _userCommand.username = username;
            _userCommand.command = "setuser";
            sendMessage(JSON.stringify(_userCommand));

            _userCommand.command = "hello";
          } catch (ex) {
            console.log("error", ex);
          }
        }
      }
    },
    onClose(event) {
      console.log(`onClose(event)`, event);
      setCanConnect(false);
    },
    onError(event) {
      console.log(`onError(event)`, event);
    },
    share: true,
  };

  const WS_URL = () => `ws://${ip}:${port}?username=${username}`;
  const { readyState, sendMessage } = useWebSocket(WS_URL(), options);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState!];

  return (
    <>
      <div className="row">
        <div className="col-1">
          <span>Status: {connectionStatus}</span>
        </div>
        <div className="col-1">
          <button
            className="btn btn-primary"
            onClick={() => {
              console.log(`user from test`, user);
              return sendMessage(JSON.stringify(user));
            }}
          >
            test
          </button>
        </div>
        {user && (
          <div className="col-2">
            <span>userid: {user?.userId}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default BoardContainer;
