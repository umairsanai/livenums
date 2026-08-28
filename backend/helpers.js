export function generateRandomNumber() {
    return Math.round((Math.random() * 1000));
}

export function attatchSocketServer(socketServer) {
    return (req, res, next) => {
        req.socketServer = socketServer;
        next();
    }
}