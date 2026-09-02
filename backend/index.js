import { WebSocketServer } from "ws";
import express from "express";
import { decrementCounter, getCounter, getRandomNumber, getTotalClients, incrementCounter, updateRandomNumber } from "./restController.js";
import { attatchSocketServerToRequest, getClientIp } from "./helpers.js";
import { handlePingTypeMessage, handleSubscribeTypeMessage, sendAllCountsMessage } from "./socketController.js";
import { RateLimiter } from "./rateLimiter.js";

const PORT = 3000;
const HOST  = "0.0.0.0";
const SOCKET_TIMEOUT_INTERVAL = 30; // seconds
const connectionLimiter = new RateLimiter(60, 5); // 5 connections per minute per IP
const messageLimiter = new RateLimiter(60, 120); // 120 messages per minute per IP

const app = express();
app.set("trust proxy", 1);

const server = app.listen(PORT, HOST, () => {
    console.clear();
    console.log("Server started on port 3000...");
});
const socketServer = new WebSocketServer({ server, path: "/websocket" });

app.use(attatchSocketServerToRequest(socketServer));

app.get("/clients", getTotalClients);

// RANDOM
app.get("/random", getRandomNumber);
app.post("/random", updateRandomNumber);

// COUNTER
app.get("/counter", getCounter);
app.post("/counter/increment", incrementCounter);
app.post("/counter/decrement", decrementCounter);

socketServer.on("connection", (socket, request) => {
    
    // 1. Rate Limit Connections
    const clientIp = getClientIp(request);    
    console.log(clientIp);

    if (!connectionLimiter.isAllowed(clientIp)) {
        socket.send(JSON.stringify({
            type: "ERROR",
            code: 429,
            message: 'Connection rate limit exceeded.'             
        }));
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
        if (!messageLimiter.isAllowed(clientIp)) {
            return socket.send(JSON.stringify({ 
                type: "ERROR",
                code: 429,
                message: 'Message rate limit exceeded.'             
            }));
        }
        
        const message = JSON.parse(data.toString());
        
        if (message?.type?.toString() === "SUBSCRIBE") 
            return handleSubscribeTypeMessage(socket, message, message.id);
        if (message?.type?.toString() === "PING") 
            return handlePingTypeMessage(socket);

    });
    
    socket.on("error", (error) => {
        console.log(`Error occured: ${error.message ?? JSON.stringify(error)}`);
        clearInterval(intervalID);
    });
    
    socket.on("close", () => {
        clearInterval(intervalID);
    });

});

