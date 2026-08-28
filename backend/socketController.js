import { categories } from "./restController.js";



export function broadcastUpdate(socketServer, category) {
    socketServer.clients.forEach(client => {
        if (client.subscribedTo === category && client.readyState === client.OPEN) 
            sendUpdateMessage(client, categories.get(category));
    });
}






// MESSAGE SENDER HANDLERS

export function sendUpdateMessage(client, data) {
    client.send(JSON.stringify({
        type: "UPDATE",
        data
    }));
}

export function sendAllCountsMessage(client) {
    client.send(JSON.stringify({
        type: "ALL_COUNTS",
        data: {
            random: categories.get("RANDOM"),
            count: categories.get("COUNTER")
        }
    }));
}





// INCOMING MESSAGE HANDLERS

export function handleSubscribeTypeMessage(socket, message) {
    if (!categories.has(message.subscribeTo)) return;

    socket.subscribedTo = message.subscribeTo;
    sendUpdateMessage(socket, categories.get(message.subscribeTo));
}