import { generateID } from "./helpers";

const REQUEST_RETRY_MAX_ATTEMPTS = 5;
const PING_INTERVAL_TIME = 25_000; // milliseconds
const INITIAL_REQUEST_RETRY_DELAY = 1_000; // milliseconds
const SOCKET_URL = import.meta.env.VITE_MODE === "dev" ?
    "ws://localhost:3000/websocket" : "wss://livenums.onrender.com/websocket";

let socket: WebSocket | null = null;
let pingIntervalId: number;
const pendingMessages = new Map();

export function connectSocket(
    setActiveBox: React.Dispatch<React.SetStateAction<string>>,
    setActiveBoxValue: React.Dispatch<React.SetStateAction<number>>,
    setConnectionStatus: React.Dispatch<React.SetStateAction<string>>
) {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        return;
    }
    
    setConnectionStatus("Connecting...");
    socket = new WebSocket(SOCKET_URL);

    socket.onopen = () => {

        setConnectionStatus("Connected");
        setActiveBox("random");

        pingIntervalId = window.setInterval(() => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'PING' }));
            }
        }, PING_INTERVAL_TIME);
    };

    socket.onmessage = (e) => 
        handleSocketMessage(e, setActiveBox, setActiveBoxValue);

    socket.onclose = () => {
        clearInterval(pingIntervalId);
        setConnectionStatus("Disconnected");
    };

    socket.onerror = (error) => {
        clearInterval(pingIntervalId);
        console.error('WebSocket error:', error);
    };
}

function handleSocketMessage(
    event: MessageEvent<any>,
    setActiveBox: React.Dispatch<React.SetStateAction<string>>, 
    setActiveBoxValue: React.Dispatch<React.SetStateAction<number>>
) {
    const message = JSON.parse(event.data);

    if (message.type === 'UPDATE') {
        setActiveBoxValue(Number(message.data));
        if (message.id) {
            pendingMessages.delete(message.id);
        }
    }

    if (message.type === 'ALL_COUNTS') {
        setActiveBox("counter");
        setActiveBoxValue(Number(message.data.count));
        setActiveBox("random");
        setActiveBoxValue(Number(message.data.random));
    }

    if (message.type === 'ERROR') {
        alert(message.message);
    }
}

export function sendSubscribeMessage(boxName: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
    }

    const id = generateID();
    const message = {
        type: 'SUBSCRIBE',
        id,
        subscribeTo: boxName
    };

    socket.send(JSON.stringify(message));
    pendingMessages.set(id, {
        delay: INITIAL_REQUEST_RETRY_DELAY,
        attemptsRemaining: REQUEST_RETRY_MAX_ATTEMPTS,
        message
    });

    setTimeout(retryMessageRequest, INITIAL_REQUEST_RETRY_DELAY, id);
}

function retryMessageRequest(messageId: string) {
    const pendingRequest = pendingMessages.get(messageId);
    if (!pendingRequest || !socket || socket.readyState !== WebSocket.OPEN) {
        return;
    }

    if (pendingRequest.attemptsRemaining < 1) {
        pendingMessages.delete(messageId);
        return;
    }

    const delay = pendingRequest.delay * 2;
    socket.send(JSON.stringify(pendingRequest.message));
    pendingMessages.set(messageId, {
        ...pendingRequest,
        delay,
        attemptsRemaining: pendingRequest.attemptsRemaining - 1
    });
    setTimeout(retryMessageRequest, delay, messageId);
}
