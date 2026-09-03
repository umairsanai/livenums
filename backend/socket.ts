import { IncomingMessage } from "node:http";
import { Duplex } from "node:stream";
import { allowedOrigins, parseCookies } from "./helpers.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import users from "./database.js";
import WebSocket, { Server } from "ws";
import { RateLimiter } from "./rateLimiter.js";
import { handlePingTypeMessage, handleSubscribeTypeMessage, sendAllCountsMessage } from "./socketController.js";
import { IncomingSocketMessage, IncomingSubscribeSocketMessage } from "./types.js";

const SOCKET_TIMEOUT_INTERVAL = 30; // seconds
const connectionLimiter = new RateLimiter(60, 5); // 5 connections per minute per IP
const messageLimiter = new RateLimiter(60, 120); // 120 messages per minute per IP

export const socketUpgradeHandler = (socketServer: Server) => {
    return async (request: IncomingMessage, socket: Duplex, head: Buffer) => 
    {
        try {

            // Allowing Origin
            const origin = request.headers.origin;
            if (!origin) 
                throw new Error("No Origin found in the request!");

            if (!allowedOrigins.includes(origin)) {
                socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                socket.destroy();
                return;
            }

            // Cookie Parsing
            const cookies = parseCookies(request.headers.cookie);
            const token = cookies["livenums-login-token"];

            if (!token) 
                throw new Error("You're not logged in! Please login to get the live feed.");

            let payload: JwtPayload | null = null;

            // JWT Verification
            try {
                payload = jwt.verify(token, process.env.JWT_SIGN_SECRET!) as JwtPayload;
            } catch (error) {
                console.error("Error in JWT Verification: ", error);
                throw new Error("Error in JWT Verification");
            }
            if (!payload) throw new Error("Invalid JWT");

            // User Verification
            const user = users.get(payload.username);
            if (!user) throw new Error('Who the fuck are you!');

            request.user = user;
            console.log(`User ${user.username} authenticated for WebSocket`);

            socketServer.handleUpgrade(request, socket, head, (ws) => {
                ws.user = user;
                socketServer.emit('connection', ws, request);
            });

        } catch (error: any) {
            console.error('WebSocket authentication failed:', error.message);
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
        }
    }
}


export const socketConnectionHandler = (socket: WebSocket, request: IncomingMessage) => {    

    const user = socket.user;

    if (!user) return socket.close();

    // 1. Rate Limit Connections
    if (!connectionLimiter.isAllowed(user.username)) {
        socket.send(RateLimiter.generateRateLimitError("Connection rate limit exceeded"));
        socket.close();
        return;
    }
        
    socket.lastActiveTime = Date.now();
    sendAllCountsMessage(socket);

    const intervalID = setInterval(() => {
        if (Date.now() - socket.lastActiveTime >= SOCKET_TIMEOUT_INTERVAL * 1000) {
            socket.terminate();
        }
    }, SOCKET_TIMEOUT_INTERVAL * 1000);
    
    socket.on("message", (data) => {
        
        socket.lastActiveTime = Date.now();

        // 2. Rate Limit Messages
        if (!messageLimiter.isAllowed(user.username)) 
            return socket.send(RateLimiter.generateRateLimitError("Message rate limit exceeded"));
        
        const message: IncomingSocketMessage  = JSON.parse(data.toString());
        if (message.type === "SUBSCRIBE") 
            return handleSubscribeTypeMessage(socket, message as IncomingSubscribeSocketMessage);
        if (message.type === "PING") 
            return handlePingTypeMessage(socket);

    });
    
    socket.on("error", (error) => {
        console.log(`Error occured: ${error.message ?? JSON.stringify(error)}`);
        clearInterval(intervalID);
    });
    
    socket.on("close", () => {
        clearInterval(intervalID);
    });

}