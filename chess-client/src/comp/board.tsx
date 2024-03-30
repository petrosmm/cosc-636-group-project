import { Dispatch, SetStateAction, useState } from "react";
import useWebSocket, { Options, ReadyState } from "react-use-websocket";

const Board: React.FC<{
  ip: string;
  port: string;
  username: string;
  setCanConnect: Dispatch<SetStateAction<boolean>>;
}> = ({ ip, port, username, setCanConnect }) => {
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
      console.log(event);
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

  const WS_URL = () => `ws://${ip}:${port}`;
  const { readyState } = useWebSocket(WS_URL(), options);

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
      </div>
    </>
  );
};

export default Board;
