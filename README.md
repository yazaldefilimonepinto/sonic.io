# sonic.io
O Sonic.io é um framework de comunicação em tempo real de alta performance que suporta a comunicação assíncrona e bidirecional entre clientes e servidor, utilizando a tecnologia de websockets.
#### English:
Sonic.io is a real-time communication framework that supports asynchronous and bidirectional communication between clients and servers, using websocket technology. 



### Exemples

client:

```ts
import { CreateSonicClient } from 'sonic.io';

const sonic = new CreateSonicClient('ws://localhost:3000');

async function main() {
  await sonic.connect();

  await sonic.emit('message', 'Hello, world!');
}

main().catch((error) => {
  console.error(error);
});

```



server: 

```ts

import { createServer } from 'http';
import { CreateSonicServer } from 'sonic.io';

const httpServer = createServer();

const sonicServer = new CreateSonicServer(httpServer);

async function main() {
  await sonicServer.emit('message', 'hello');

  const room = await sonicServer.to('room-1');

  await room.emit('message', 'Hello there!!');
}

main().catch((error) => {
  console.log(error);
});

```
