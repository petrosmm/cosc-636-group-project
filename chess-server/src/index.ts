import { WebSocketServer } from "ws";
import http from "http";
import { v4 } from "uuid";
import { Message, MessageClient, User } from "@lib/lib";

// Spinning the HTTP server and the WebSocket server.
const server = http.createServer();
const wssServer = new WebSocketServer({ server });
const port = 8081;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
  console.log("hello23");
});

// I'm maintaining all active connections in this object
let clients: MessageClient[] = [];

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
          console.log(`clients`, clients);
          addUsernameIfMissing(messageIncoming, clients);

          break;

        default:
          console.log("No valid command!");
          console.log(`clients`, clients);
          break;
      }

      clients = purgeEmptyClients(clients);
    }
  });
});

function addUsernameIfMissing(message: Message, clients: MessageClient[]) {
  try {
    if (false) console.log(`user`, message.userId, message.username);
    console.log(`message from client`, message);

    if (message?.username != null) {
      let client = clients.find(
        (p) => p?.userId == message?.userId && p?.username == null
      );
      if (false) console.log("client", client);

      if (client != null) {
        let _client = client;
        _client.username = message.username;

        let indexUser = clients.findIndex((p) => p.userId == message.userId);
        delete clients[indexUser];
        clients.push(_client);

        if (false) clients = purgeEmptyClients(clients);
      } else if (client == null) {
        client = clients.find(
          (p) => p.userId != message?.userId && p.username == message.username
        );

        if (client != null) {
          let _client = client;
          _client.userId = message.userId;

          let indexUser = clients.findIndex(
            (p) => p.username == message.username
          );

          delete clients[indexUser];
          clients.push(_client);

          if (false) clients = purgeEmptyClients(clients);
        }
      }
    }
  } catch (ex) {
    console.log(ex);
  }
}

function purgeEmptyClients(input: MessageClient[]) {
  input = input?.filter(Boolean);
  return input;
}
