const API_URL = 'http://localhost:3000';
const SOCKET_URL = 'ws://localhost:3000/websocket';

const LOGIN_CREDENTIALS = {
    username: import.meta.env.VITE_USERNAME,
    password: import.meta.env.VITE_PASSWORD
};

const REQUEST_RETRY_MAX_ATTEMPTS = 5;
const INITIAL_REQUEST_RETRY_DELAY = 1_000;

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const loginButton = document.getElementById('loginButton');
const boxes = document.querySelectorAll('.box');
const pendingMessages = new Map();

let socket = null;
let pingIntervalId = null;

boxes.forEach((box) => {
    box.addEventListener('click', () => {
        boxes.forEach((item) => item.classList.remove('active'));
        makeBoxActive(box);
    });
});

loginButton.addEventListener('click', login);
initializeApp();

async function initializeApp() {
    try {
        const response = await fetch(`${API_URL}/me`, {
            credentials: 'include'
        });
        const result = await response.json();

        if (result.status === 'success') {
            connectSocket();
            return;
        }
    } catch (error) {
        console.error('Session check failed:', error);
    }

    showLogin();
}

async function login() {
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(LOGIN_CREDENTIALS)
        });
        const result = await response.json();

        console.log(result);

        if (result.status === 'success') {
            loginButton.hidden = true;
            connectSocket();
            return;
        }
    } catch (error) {
        console.error('Login failed:', error);
    }

    loginButton.disabled = false;
    loginButton.textContent = 'Login';
    showLogin();
}

function showLogin() {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Login required';
    loginButton.hidden = false;
}

function connectSocket() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        return;
    }

    statusText.textContent = 'Connecting...';
    socket = new WebSocket(SOCKET_URL);

    socket.onopen = () => {
        statusDot.classList.add('connected');
        statusText.textContent = 'Connected';
        makeRandomBoxActive();

        pingIntervalId = window.setInterval(() => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'PING' }));
            }
        }, 5_000);
    };

    socket.onmessage = handleSocketMessage;

    socket.onclose = () => {
        clearPingInterval();
        statusDot.classList.remove('connected');
        statusText.textContent = 'Disconnected';
    };

    socket.onerror = (error) => {
        clearPingInterval();
        console.error('WebSocket error:', error);
    };
}

function handleSocketMessage(event) {
    const message = JSON.parse(event.data);

    if (message.type === 'UPDATE') {
        const activeBox = document.querySelector('.box.active');
        if (activeBox) {
            activeBox.querySelector('.box-value').textContent = message.data;
        }

        if (message.id) {
            pendingMessages.delete(message.id);
        }
    }

    if (message.type === 'ALL_COUNTS') {
        document.getElementById('randomValue').textContent = message.data.random;
        document.getElementById('counterValue').textContent = message.data.count;
    }

    if (message.type === 'ERROR') {
        alert(message.message);
    }
}

function clearPingInterval() {
    if (pingIntervalId !== null) {
        clearInterval(pingIntervalId);
        pingIntervalId = null;
    }
}

function makeRandomBoxActive() {
    const randomBox = document.getElementById('randomBox');
    if (randomBox) {
        makeBoxActive(randomBox);
    }
}

function makeBoxActive(box) {
    box.classList.add('active');
    sendSubscribeMessage(box.dataset.boxName);
}

function sendSubscribeMessage(boxName) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
    }

    const id = generateId();
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

    window.setTimeout(retryMessageRequest, INITIAL_REQUEST_RETRY_DELAY, id);
}

function generateId(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let index = 0; index < length; index += 1) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

function retryMessageRequest(messageId) {
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
    window.setTimeout(retryMessageRequest, delay, messageId);
}
