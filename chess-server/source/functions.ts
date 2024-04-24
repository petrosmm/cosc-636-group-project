import Enumerable from "linq";
import { Server } from "socket.io";
import { Message, MessageClient } from "../../source/lib";

export function addUsernameIfMissing(message: Message, clients: MessageClient[]) {
   try {
      if (false) console.log(`user`, message.socketId, message.username);

      if (message?.username != null) {
         let client = clients.find((p) => p?.socketId == message?.socketId && p?.username == null);
         if (false) console.log("client", client);

         if (client != null) {
            let _client = client;
            _client.username = message.username;

            let indexUser = clients.findIndex((p) => p.socketId == message.socketId);
            delete clients[indexUser];
            clients.push(_client);

            if (false) clients = purgeEmptyClients(clients);
         } else if (client == null) {
            client = clients.find((p) => p.socketId != message?.socketId && p.username == message.username);

            if (client != null) {
               let _client = client;
               _client.socketId = message.socketId;

               let indexUser = clients.findIndex((p) => p.username == message.username);

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

export function purgeEmptyClients(input: MessageClient[]) {
   return (input = Enumerable.from(input)
      .where((p) => p.socket.connected)
      .toArray());
}

export async function getSocket(server: Server<any, any, any, any>, socketId: string) {
   let sockets = await getSockets(server);
   let socket = Enumerable.from(sockets).firstOrDefault((p) => p.id == socketId);

   return socket;
}

export async function getSockets(server: Server<any, any, any, any>) {
   let sockets = await server.fetchSockets();

   return sockets;
}
