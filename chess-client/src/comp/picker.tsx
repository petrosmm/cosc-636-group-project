import { Message } from "@lib/lib";
import { useEffect } from "react";
import useStateRef from "react-usestateref";
import { Socket } from "socket.io-client";

const Picker: React.FC<{
  inputSocket: Socket<any, any>;
  inputUsername: string;
  inputPlayers?: string[];
}> = ({ inputSocket, inputUsername }) => {
  const [socket, setSocket, refSocket] = useStateRef(inputSocket);

  useEffect(() => {
    let doIgnore = false;

    getPlayers();

    return () => {
      doIgnore = true;
    };
  }, []);

  function getPlayers() {
    let message = {
      command: "getavailableplayers",
      username: inputUsername,
    } as Message;

    socket.emit("from-client", message);
  }

  return (
    <>
      <div className="col-12">hello from picker</div>
      <div className="col-12"></div>
    </>
  );
};

export default Picker;
