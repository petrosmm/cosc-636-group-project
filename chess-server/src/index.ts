import * as http from "http";
import { v4 } from "uuid";
import { Game, Message, MessageClient } from "@lib/lib";
import Enumerable from "linq";
import { purgeEmptyClients } from "./functions.js";
import { Server } from "socket.io";

const serverHttp = http.createServer();

const wssServer = new Server(serverHttp, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const port = 8081;

serverHttp.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});

// I'm maintaining all active connections in this object
let clients: MessageClient[] = [];
let games: Game[] = [];

wssServer.on("connection", (connection) => {
  const userId = v4();
  const username = new URL(
    "http://example.com" + connection.request.url!
  )?.searchParams.get("username")!;

  console.log(`User ${userId} (${username}) connected.\r\n`);

  let clientNew = { userId: userId, username: username, socket: connection };
  let clientsPossible = clients.filter(
    (p) => p.username == username || p.userId == userId
  );

  // only add client
  if (clientsPossible?.length > 0) {
    clientsPossible?.forEach((p, index) => {
      return;
      // let index = clients.findIndex((_p) => _p?.userId == p?.userId);
      p.socket.disconnect();
      delete clients[index];
    });
  }

  // always
  clients.push(clientNew);

  console.log(`clientNew`, clientNew.userId, clientNew.username);

  let userWithInfoOnly = { ...clientNew };
  userWithInfoOnly.socket = null!;

  let clientSpecific = clients.find((p) => p?.userId == userId);
  console.log("\r\nsending back stuff\r\n");
  if (false) {
    if (clientSpecific?.username != null) {
      let clientsPotential = clients.filter(
        (p) => p?.username == username && p?.userId != userId
      );

      console.log(`clientsPotential`, clientsPotential);

      if (false)
        if (clientsPotential?.length > 0) {
          throw new Error("client exists with different userId, please fix!");
        }
    }
  }
  // send back the user with the guid
  clientSpecific?.socket?.emit("from-server", userWithInfoOnly);

  connection.on("from-client", (data) => {
    let dataParsed = data as Message;

    if (dataParsed != null) {
      console.log(`messageIncoming`, dataParsed);

      switch (dataParsed?.command) {
        case "propose":
          if (dataParsed.from != null && dataParsed.to) {
            let _clientsAsPlayers = Enumerable.from(clients)
              .where((p) =>
                [dataParsed.from, dataParsed.to]
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
          console.log("check player", clients);
          let values = {} as Record<string, string>;
          let _clientsAsAvailablePlayers = Enumerable.from(clients).select(
            (p) => {
              p.socket = null!;
              return p.username;
            }
          );

          if (false)
            _clientsAsAvailablePlayers = _clientsAsAvailablePlayers.where(
              (p) => p != username
            );

          _clientsAsAvailablePlayers.forEach((p, index) => {
            values[index.toString()] = p!;
          });

          connection.emit("from-server", {
            command: "getavailableplayers",
            values: values,
          } as Message);
          break;

        // no case
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
              p.userId == dataParsed.userId ||
              p.username == dataParsed?.username
          );

          if (client != null) {
            console.log("found client!");
            connection.send(JSON.stringify(client));
          }

          break;
      }

      clients = purgeEmptyClients(clients);
    }
  });
});
