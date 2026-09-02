import { NextFunction, Request, Response } from "express";
import { Server } from "ws";

export function generateRandomNumber() {
    return Math.round((Math.random() * 1000));
}

export function attatchSocketServerToRequest(socketServer: Server) {
    return (req: Request, res: Response, next: NextFunction) => {
        req.socketServer = socketServer;
        next();
    }
}

export function getClientIp(req: any) {

    // For Render:
    // The first IP in the list is the client's real IP
    const header = req.headers['x-forwarded-for'];

    if (header && typeof header === 'string') 
        return header.split(',')[0].trim();

    return req.socket.remoteAddress;
}