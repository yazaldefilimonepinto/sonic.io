import http from 'node:http';
import { Server as WebSocketServer } from 'ws';
import { Readable } from 'stream';
import { emitResponseType, optionType, socketType, dataType } from './type';

export class CreateSonicServer {
  private server: http.Server;
  private wsServer: WebSocketServer;
  private sockets: Map<string, socketType> = new Map();
  private cacheMessage: Map<string, any> = new Map();
  private options: { inteligencie: boolean };

  constructor(server: http.Server, options?: { inteligencie?: boolean }) {
    this.server = server;
    this.options = {
      inteligencie: options?.inteligencie === undefined ?? false,
    };

    this.wsServer = new WebSocketServer({ server });
    this.wsServer.on('connection', (socket, request) => {
      const socketId = request.headers['sec-websocket-key'] as string;
      this.sockets.set(socketId, socket);
      const cached = [...this.cacheMessage.entries()];
      for (const [event, data] of cached) {
        socket.send(JSON.stringify({ event, data }));
      }
      socket.on('message', (data: string) => {
        console.log(`Message received from ${socketId}: ${data}`);
      });

      socket.on('close', () => {
        console.log('close');
        this.sockets.delete(socketId);
      });
    });
  }

  async emit(event: string, data: dataType, options?: optionType): Promise<void> {
    const isCache = options?.cache ?? false;
    const isStreams = options?.streams ?? false;
    const socketsInSystem = [...this.sockets.entries()];
    this.cacheMessage.set(event, data);
    for (const [socketId, socket] of socketsInSystem) {
      socket.send(JSON.stringify({ event, data }));
    }
  }

  async to(room: string, options?: optionType): Promise<emitResponseType> {
    const isCache = options?.cache ?? false;
    const isStreams = options?.streams ?? false;

    const socketsInRoom = [...this.sockets.entries()].filter(([socketId, socket]) => {
      return socketId.startsWith(`${room}#`);
    });

    return {
      emit: async (event: string, data: dataType, options): Promise<void> => {
        if (isStreams && data instanceof Readable) {
          this.transporterStream(socketsInRoom, data);
        } else {
          for (const [socketId, socket] of socketsInRoom) {
            socket.send(JSON.stringify({ data, event }));
          }
        }
      },
    };
  }

  private async transporterStream(socketsInRoom: [string, socketType][], data: Readable): Promise<void> {
    for (const [socketId, socket] of socketsInRoom) {
      for await (const chunk of data) {
        socket.send(chunk);
      }
    }
  }
}
