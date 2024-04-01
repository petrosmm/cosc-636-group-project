import { Dispatch, SetStateAction, useState } from "react";
import useWebSocket, { Options, ReadyState } from "react-use-websocket";
import { MessageUser } from "@lib/lib";
import useStateRef from "react-usestateref";

const BoardContainer: React.FC<{
  ip: string;
  port: string;
  username: string;
  setCanConnect: Dispatch<SetStateAction<boolean>>;
}> = ({ ip, port, username, setCanConnect }) => {
  const [colorMine, setColorMine] = useState("");
  const [user, setUser, refUser] = useStateRef(null as unknown as MessageUser);
  if (username == undefined || username == null || username?.length < 3) {
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

      if (user == null) {
        try {
          let result = JSON.parse(event.data) as MessageUser;
          console.log(`result`, result);
          setUser(result);
        } catch (ex) {
          console.log(`ex`, ex);
        }
      }

      if (username != null && refUser.current?.username == null) {
        try {
          let _user = refUser.current;

          _user.username = username;
          console.log(_user);
          sendMessage(JSON.stringify(_user));
        } catch (ex) {
          console.log("error", ex);
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
            onClick={() => sendMessage(JSON.stringify(user))}
          >
            test
          </button>
        </div>
        {user && (
          <div className="col-2">
            <span>userid: {user?.value}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default BoardContainer;
