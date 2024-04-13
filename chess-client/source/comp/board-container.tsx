import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useStateRef from "react-usestateref";
import { Socket, io } from "socket.io-client";
import Picker from "./picker";
import Enumerable from "linq";
import { Message, User } from "../../../source/lib";
import React from "react";

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
   const [socket, setSocket, refSocket] = useStateRef(null as unknown as Socket<any, any>);
   const [players, setPlayers, refPlayers] = useStateRef([] as string[]);

   // let _socket = null as unknown as Socket<any, any>
   function getSocket() {}

   useEffect(() => {
      let doIgnore = false;

      return () => {
         doIgnore = true;
      };
   }, []);

   useEffect(() => {
      makeSocket();
   }, []);

   function makeSocket() {
      let _socket = io(WS_URL(), {
         query: { username: username },
         autoConnect: false,
         closeOnBeforeunload: true
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
               case "getavailableplayers": {
                  if (event?.values !== undefined) {
                     const arrayFromRecords: Array<[string, string]> = Object.entries(event?.values!);

                     if (arrayFromRecords.length > 0) {
                        let players = Enumerable.from(arrayFromRecords)
                           .select((p) => p[1])
                           .toArray();

                        setPlayers(players);
                     }
                  }

                  break;
               }

               case "proposeuser": {
                  if (event?.from != null && event?.to != null) {
                     let isYes = window.confirm(`User ${event?.from} wishes to have a game. Would you like play?`);
                     let message = null as unknown as Message;

                     if (isYes) {
                        message = {
                           command: "proposeuserconfirm",
                           username: username,
                           from: event?.to,
                           to: event?.from
                        } as Message;
                     } else {
                        message = {
                           command: "proposeuserdecline",
                           username: username,
                           from: event?.to,
                           to: event?.from
                        } as Message;
                     }

                     if (_socket == null) {
                        throw new Error("Socket is null!");
                     }

                     _socket?.emit("from-client", message);
                  }

                  break;
               }

               case "startgame": {
                  alert(`Starting game with ${event?.from}. Please remember white goes first!`);

                  let message = {
                     command: "getboard",
                     username: username
                  } as Message;

                  _socket?.emit("from-client", message);

                  break;
               }

               // nothing else
               default:
                  break;
            }

            console.log(`event`, event);
         });

      setSocket(_socket);
      if (false) refSocket.current?.connect();
   }

   function getPlayers() {
      let message = {
         command: "getavailableplayers",
         username: username
      } as Message;

      socket.emit("from-client", message);
   }

   function proposeUser(socket: Socket<any, any>, usernameFrom: string, usernameTo: string) {
      let message = {
         command: "proposeuser",
         username: username,
         from: usernameFrom,
         to: usernameTo
      } as Message;

      socket.emit("from-client", message);
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
                     getPlayers();
                  }}>
                  Get Players...
               </button>
            </div>
            <div className="col-1" hidden={!isConnected}>
               <button
                  className="btn btn-primary"
                  onClick={() => {
                     console.log(`user from test before sending`, refUser.current);
                     socket.emit("from-client", {
                        command: "test",
                        username: username
                     } as Message);
                  }}>
                  test
               </button>
            </div>
            <div className="col-1" hidden={isConnected}>
               <button
                  className="btn btn-primary"
                  onClick={() => {
                     socket.connect();
                  }}>
                  connect
               </button>
            </div>
            <div className="col-1">
               <button
                  className="btn btn-primary"
                  onClick={() => {
                     console.log(socket);
                  }}>
                  check socket
               </button>
            </div>
            {false && username?.length > 0 && (
               <div className="col-2">
                  <span>username: {username}</span>
               </div>
            )}
         </div>

         {isConnected && players?.length > 0 && (
            <div className="row">
               <div className="col-12">
                  <Picker inputSocket={socket} inputUsername={username} inputPlayers={players} inputProposeUser={proposeUser} />
               </div>
            </div>
         )}
      </>
   );
};

export default BoardContainer;
