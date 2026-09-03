import "dotenv/config"
import "./database.js"
import app from "./app.js";
import { WebSocketServer } from "ws";
import { attatchSocketServerToRequest } from "./helpers.js";
import { createServer, Server } from "node:http";
import restRouter from "./restRouter.js";
import { errorMiddleware } from "./error.js";
import { socketConnectionHandler, socketUpgradeHandler } from "./socket.js";

const PORT = 3000;
const HOST  = "0.0.0.0";

const server: Server = createServer(app);
const socketServer = new WebSocketServer({ path: "/websocket", noServer: true });

app.use(attatchSocketServerToRequest(socketServer));
app.use(restRouter);
app.use(errorMiddleware);

server.on('upgrade', socketUpgradeHandler(socketServer));
socketServer.on("connection", socketConnectionHandler);

server.listen(PORT, HOST, () => {
    console.clear();
    console.log("Server started on port 3000...");
});