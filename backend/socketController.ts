import WebSocket, { Server } from "ws";
import { categories } from "./restController.js";
import { IncomingSubscribeSocketMessage } from "./types.js";



export function broadcastUpdate(socketServer: Server, category: string) {
    socketServer.clients.forEach((client) => {
        if (!categories.has(category)) {
            console.error("Unknown category of counters is being requested in broadcastUpdate() function!");
            return;
        }
        if (client.subscribedTo === category && client.readyState === client.OPEN) {
            sendUpdateMessage(client, categories.get(category)!);
        }
            
    });
}






// MESSAGE SENDER HANDLERS

export function sendUpdateMessage(client: WebSocket, data: number) {
    if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
            type: "UPDATE",
            data
        }));
    }
}

export function sendAllCountsMessage(client: WebSocket) {
    if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
            type: "ALL_COUNTS",
            data: {
                random: categories.get("RANDOM"),
                count: categories.get("COUNTER")
            }
        }));
    }
}

export function sendPongMessage(client: WebSocket) {
    if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
            type: "PONG"
        }));   
    }
}




// INCOMING MESSAGE HANDLERS

export function handleSubscribeTypeMessage(socket: WebSocket, message: IncomingSubscribeSocketMessage) {
    if (!categories.has(message.subscribeTo)) return;

    socket.subscribedTo = message.subscribeTo;

    if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({
            type: "UPDATE",
            id: message.id,
            data: categories.get(message.subscribeTo)
        }));
    }
}

export function handlePingTypeMessage(socket: WebSocket) {
    sendPongMessage(socket);
}