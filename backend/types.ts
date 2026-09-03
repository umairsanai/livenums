
import { Server } from "ws";

declare module 'ws' {
  interface WebSocket {
    lastActiveTime: number,
    subscribedTo: string,
    user: User
  }
}

declare global {
  namespace Express {
    interface Request {
        socketServer: Server,
        user: User
    }
  }
}

declare module 'http' {
  interface IncomingMessage {
    user: User;
  }
}


export type User = {
    username: string,
    password: string
}

export type IncomingSocketMessage = {
    type: string
}

export type IncomingSubscribeSocketMessage = IncomingSocketMessage & {
    id: string,
    subscribeTo: string
}