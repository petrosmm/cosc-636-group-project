import { WebSocketServer } from "ws";
import http from "http";
import { v4 } from "uuid";
import { Game, Message, MessageClient, User } from "@lib/lib";
import Enumerable from "linq";
import { addUsernameIfMissing, purgeEmptyClients } from "./functions.js";

// Spinning the HTTP server and the WebSocket server.
const server = http.createServer();
const wssServer = new WebSocketServer({ server });
const port = 8081;

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});

// I'm maintaining all active connections in this object
let clients: MessageClient[] = [];

let games: Game[] = [];

// A new client connection request received
wssServer.on("connection", function (connection) {
  const userId = v4();

  console.log(`User ${userId} connected.\r\n`);

  // Store the new connection and handle messages
  clients.push({ userId: userId, socket: connection });

  let userWithIdOnly: User = { userId: userId };
  let data = JSON.stringify(userWithIdOnly);

  // send back the user with the guid
  console.log("\r\n\r\n\r\n\r\nsending back stuff\r\n\r\n\r\n\r\n");
  clients.find((p) => p?.userId == userId)?.socket?.send(data);

  connection.on("message", function (event, isBinary) {
    let dataLessRaw = event?.toString();
    if (dataLessRaw?.length > 0) {
      let messageIncoming = JSON.parse(event?.toString()) as Message;

      console.log(`messageIncoming`, messageIncoming);

      switch (messageIncoming?.command) {
        case "setuser":
          addUsernameIfMissing(messageIncoming, clients);

          break;

        case "propose":
          if (messageIncoming.from != null && messageIncoming.to) {
            let _clientsAsPlayers = Enumerable.from(clients)
              .where((p) =>
                [messageIncoming.from, messageIncoming.to]
                  .filter(Boolean)
                  .includes(p.username)
              )
              .toArray();

            if (_clientsAsPlayers?.length == 2) {
            } else {
            }
          }
          break;

        case "getavailableplayers":
          let _clientsAsAvailablePlayers = Enumerable.from(clients)
            .select((p) => {
              p.socket = null!;
              return p;
            })
            .toArray();

          this.send(JSON.stringify(_clientsAsAvailablePlayers));
          break;

        default:
          console.log("No valid command!");
          let _clients = Enumerable.from(clients)
            .select((p) => {
              p.socket = null!;
              return p;
            })
            .toArray();

          console.log(`\r\n` + `clients`, _clients);

          let client = Enumerable.from(_clients).firstOrDefault(
            (p) =>
              p.userId == messageIncoming.userId ||
              p.username == messageIncoming?.username
          );

          if (client != null) {
            console.log("found client!");
            this.send(JSON.stringify(client));
          }

          break;
      }

      clients = purgeEmptyClients(clients);
    }
  });
});
