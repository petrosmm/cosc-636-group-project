import * as http from "http";
import Enumerable from "linq";
import { getSocket, getSockets, purgeEmptyClients } from "./functions";
import { Server } from "socket.io";
import { MessageClient, Game, Message, PORT_SERVER } from "../../source/lib";

const serverHttp = http.createServer();

const wssServer = new Server(serverHttp, {
   cors: {
      origin: "*",
      methods: ["GET", "POST"]
   }
});

serverHttp.listen(PORT_SERVER, () => {
   console.log(`WebSocket server is running on port ${PORT_SERVER}`);
});

// I'm maintaining all active connections in this object
let clients: MessageClient[] = [];
let games: Game[] = [];

wssServer.on("connection", (connection) => {
   const userId = "";
   const username = new URL("http://example.com" + connection.request.url!)?.searchParams.get("username")!;

   console.log(`User ${userId} (${username}) connected.\r\n`);

   let clientNew = {
      socketId: connection.id,
      username: username,
      socket: connection
   };
   let clientsPossible = clients.filter((p) => p.username == username || p.socketId == userId);

   // only add client
   if (clientsPossible?.length > 0) {
      clientsPossible?.forEach((p, index) => {
         return;
         // let index = clients.findIndex((_p) => _p?.socketId == p?.socketId);
         p.socket.disconnect();
         delete clients[index];
      });
   }

   // always
   clients.push(clientNew);

   console.log(`clientNew`, clientNew.socketId, clientNew.username);

   let userWithInfoOnly = {
      username: clientNew.username,
      socketId: null
   } as MessageClient;

   let clientSpecific = clients.find((p) => p?.socketId == userId);
   console.log("\r\nsending back stuff\r\n");
   if (false) {
      if (clientSpecific?.username != null) {
         let clientsPotential = clients.filter((p) => p?.username == username && p?.socketId != userId);

         console.log(`clientsPotential`, clientsPotential);

         if (false)
            if (clientsPotential?.length > 0) {
               throw new Error("client exists with different userId, please fix!");
            }
      }
   }
   // send back the user with the guid
   clientSpecific?.socket?.emit("from-server", userWithInfoOnly);

   connection.on("from-client", async (data) => {
      let dataParsed = data as Message;

      if (dataParsed != null) {
         console.log(`messageIncoming`, dataParsed);

         await new Promise<void>((resolve) => {
            switch (dataParsed?.command) {
               case "propose":
                  if (dataParsed.from != null && dataParsed.to) {
                     let _clientsAsPlayers = Enumerable.from(clients)
                        .where((p) => [dataParsed.from, dataParsed.to].filter(Boolean).includes(p.username))
                        .toArray();

                     if (_clientsAsPlayers?.length == 2) {
                     } else {
                     }
                  }
                  break;

               case "test":
                  if (false) console.log(`clients`, clients);
                  if (false)
                     new Promise<void>(async (resolve) => {
                        await wssServer.fetchSockets();
                        resolve();
                     });
                  break;

               // no case
               default:
                  if (false) {
                     console.log("No valid command!");
                     let _clients = Enumerable.from(clients)
                        .select((p) => {
                           p.socket = null!;
                           return p;
                        })
                        .toArray();

                     let client = Enumerable.from(_clients).firstOrDefault(
                        (p) => p.socketId == dataParsed.socketId || p.username == dataParsed?.username
                     );

                     if (client != null) {
                        console.log("found client!");
                        connection.send(JSON.stringify(client));
                     }
                  }

                  break;
            }

            resolve();
         });

         switch (dataParsed?.command) {
            case "getboard": {
               let values = {} as Record<string, string>;
               let message = {
                  command: "receiveboard",
                  values: values
               } as Message;
               connection.emit("from-server", message);

               break;
            }

            case "getavailableplayers": {
               let values = {} as Record<string, string>;
               if (false) {
                  let sockets = await getSockets(wssServer);
                  let socketIds = Enumerable.from(sockets)
                     .select((p) => p.id)
                     .toArray();
               }
               let _clientsAsAvailablePlayers = Enumerable.from(clients)
                  .select((p) => {
                     return p.username;
                  })
                  .distinct();

               if (false) _clientsAsAvailablePlayers = _clientsAsAvailablePlayers.where((p) => p != dataParsed.username);

               _clientsAsAvailablePlayers.forEach((p, index) => {
                  values[index.toString()] = p!;
               });

               connection.emit("from-server", {
                  command: "getavailableplayers",
                  values: values
               } as Message);

               break;
            }

            case "proposeuser": {
               if (dataParsed.from != null && dataParsed.to != null) {
                  let client = clients.find((p) => p.username == dataParsed.to);

                  if (client != null) {
                     let dataParsedModified = dataParsed;
                     dataParsedModified.username = client.username;
                     let socket = await getSocket(wssServer, client.socketId!);
                     socket?.emit("from-server", dataParsedModified);
                  }
               }

               break;
            }

            case "proposeuserconfirm": {
               let client = clients.find((p) => p.username == dataParsed.to);

               if (client != null) {
                  let dataParsedModified = dataParsed;
                  dataParsedModified.username = dataParsed.from;
                  dataParsedModified.command = "startgame";
                  let socket = await getSocket(wssServer, client.socketId!);
                  socket?.emit("from-server", dataParsedModified);
               }

               let game = new Game(dataParsed.to!, dataParsed.from!);

               games.push(game);

               break;
            }

            case "test": {
               let game = new Game("max", "virgil");
               game.showBoard();

               if (false)
                  await new Promise<void>(async (resolve) => {
                     let id = clients.find((p) => p.username == dataParsed.username)?.socketId;
                     // let sockets = await wssServer.fetchSockets();
                     // let socketsDebug = Enumerable.from(sockets)
                     //   .select((p) => {
                     //     const username = new URL(
                     //       "http://example.com" + p.handshake.url
                     //     )?.searchParams.get("username")!;
                     //     return { username: username, userId: p.id } as User;
                     //   })
                     //   .toArray();

                     let socket = await getSocket(wssServer, id!);

                     console.log(`client-skies`, socket);
                     resolve();
                  });

               break;
            }

            default:
               break;
         }

         if (false) clients = purgeEmptyClients(clients);
      }
   });
});
