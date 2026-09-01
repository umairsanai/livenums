import { categories } from "./restController.js";



export function broadcastUpdate(socketServer, category) {
    socketServer.clients.forEach(client => {
        if (client.subscribedTo === category && client.readyState === client.OPEN) 
            sendUpdateMessage(client, categories.get(category));
    });
}






// MESSAGE SENDER HANDLERS

export function sendUpdateMessage(client, data) {
    if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
            type: "UPDATE",
            data
        }));
    }
}

export function sendAllCountsMessage(client) {
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

export function sendPongMessage(client) {
    if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
            type: "PONG"
        }));   
    }
}




// INCOMING MESSAGE HANDLERS

export function handleSubscribeTypeMessage(socket, message, id) {
    if (!categories.has(message.subscribeTo)) return;

    socket.subscribedTo = message.subscribeTo;

    if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({
            type: "UPDATE",
            id,
            data: categories.get(message.subscribeTo)
        }));
    }
}

export function handlePingTypeMessage(socket) {
    sendPongMessage(socket);
}