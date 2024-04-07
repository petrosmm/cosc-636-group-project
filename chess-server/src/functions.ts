import { Message, MessageClient } from "@lib/lib";

export function addUsernameIfMissing(
  message: Message,
  clients: MessageClient[]
) {
  try {
    if (false) console.log(`user`, message.userId, message.username);

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

export function purgeEmptyClients(input: MessageClient[]) {
  input = input?.filter(Boolean);
  return input;
}
