import React from "react";
import { useEffect, useState } from "react";
import useStateRef from "react-usestateref";
import { Socket } from "socket.io-client";

const Picker: React.FC<{
   inputSocket: Socket<any, any>;
   inputUsername: string;
   inputPlayers?: string[];
   inputProposeUser: (socket: Socket<any, any>, usernameFrom: string, usernameTo: string) => void;
}> = ({ inputSocket, inputUsername, inputPlayers, inputProposeUser }) => {
   const [socket, setSocket, refSocket] = useStateRef(null as unknown as Socket);
   const [players, setPlayers] = useState([] as string[]);

   useEffect(() => {
      setSocket(inputSocket);
      setPlayers(inputPlayers ?? []);
   }, [inputPlayers]);

   return (
      <>
         <div className="col-12">Online players</div>
         <div className="col-12">
            {players?.map((p, index) => {
               let isLast = index == players.length - 1;
               return (
                  <div key={index}>
                     {p == inputUsername ? (
                        <span>{p}*</span>
                     ) : (
                        <a
                           onClick={() => {
                              alert("Other user being alerted to request match.");
                              inputProposeUser(socket, inputUsername, p);
                           }}
                           href="#">
                           {p}
                        </a>
                     )}
                     {!isLast ? <br /> : null}
                  </div>
               );
            })}
         </div>
      </>
   );
};

export default Picker;
