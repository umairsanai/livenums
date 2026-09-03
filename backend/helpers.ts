import { NextFunction, Request, Response } from "express";
import { Server } from "ws";


export const allowedOrigins = ["http://127.0.0.1:4173", "http://localhost:4173", "http://127.0.0.1:5173", "http://localhost:5173", "http://127.0.0.1:5500", "http://localhost:5500", "https://livenums.vercel.app", "https://www.livenums.vercel.app"];


export function generateRandomNumber() {
    return Math.round((Math.random() * 1000));
}

export function attatchSocketServerToRequest(socketServer: Server) {
    return (req: Request, res: Response, next: NextFunction) => {
        req.socketServer = socketServer;
        next();
    }
}

export function parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) return {};
    return cookieHeader
        .split(';')
        .reduce((cookies: Record<string, string>, cookie) => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = decodeURIComponent(value);
            return cookies;
        }, {});
}