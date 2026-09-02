export function generateRandomNumber() {
    return Math.round((Math.random() * 1000));
}

export function attatchSocketServerToRequest(socketServer) {
    return (req, res, next) => {
        req.socketServer = socketServer;
        next();
    }
}

export function getClientIp(req) {
  // For Render:
  // The first IP in the list is the client's real IP
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket.remoteAddress;
}