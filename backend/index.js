import { WebSocketServer } from "ws";
import express from "express";
import { decrementCounter, getCounter, getRandomNumber, incrementCounter, updateRandomNumber } from "./restController.js";
import { attatchSocketServer } from "./helpers.js";
import { handleSubscribeTypeMessage, sendAllCountsMessage } from "./socketController.js";

const PORT = 3000;
const HOST  = "0.0.0.0";

const app = express();

const server = app.listen(PORT, HOST, () => {
    console.clear();    
    console.log("Server started on port 3000...");
});
const socketServer = new WebSocketServer({ server, path: "/websocket" });

app.use(attatchSocketServer(socketServer));

// RANDOM
app.get("/random", getRandomNumber);
app.post("/random", updateRandomNumber);

// COUNTER
app.get("/counter", getCounter);
app.post("/counter/increment", incrementCounter);
app.post("/counter/decrement", decrementCounter);


socketServer.on("connection", (socket, request) => {

    sendAllCountsMessage(socket);

    socket.on("message", (data) => {
        const message = JSON.parse(data.toString());

        if (message?.type?.toString() === "SUBSCRIBE") 
            return handleSubscribeTypeMessage(socket, message);
    });
    
    socket.on("error", (error) => {
        console.log(`Error occured: ${error.message}`);
    });

    socket.on("close", () => {});
});

