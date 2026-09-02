import { Server } from "ws";

declare module 'ws' {
  interface WebSocket {
    lastActiveTime: number,
    subscribedTo: string
  }
}

declare global {
  namespace Express {
    interface Request {
        socketServer: Server
    }
  }
}

export type IncomingSocketMessage = {
    type: string
}

export type IncomingSubscribeSocketMessage = IncomingSocketMessage & {
    id: string,
    subscribeTo: string
}