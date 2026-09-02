const socketUrl = 'wss://livenums.onrender.com/websocket';
// const socketUrl = 'ws://localhost:3000/websocket';
const socket = new WebSocket(socketUrl);

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const boxes = document.querySelectorAll('.box');

const REQUEST_RETRY_MAX_ATTEMPTS = 5;
const INTIAL_REQUEST_RETRY_DELAY = 1; // seconds
const pendingMessages = new Map();

// Box Selection Logic 

boxes.forEach(box => {
    box.addEventListener('click', () => {
        boxes.forEach(b => b.classList.remove('active'));
        makeBoxActive(box);
    });
});

// WebSocket Setup 

socket.onopen = () => {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
    makeRandomBoxActive();

    const PINT_INTERVAL_TIME = 25; // seconds
    const pingInterval = setInterval(() => {
        socket.send(JSON.stringify({
            type: "PING"
        }));
    }, PINT_INTERVAL_TIME * 1000);


    socket.onclose = () => {
        statusDot.classList.remove('connected');
        statusText.textContent = 'Disconnected';
        clearInterval(pingInterval);
    };


    socket.onerror = (error) => {
        clearInterval(pingInterval);
        console.error('WebSocket Error:', error);
        alert("Something went wrong.... Check the console.");
    };
};

socket.onmessage = (event) => {

    const message = JSON.parse(event.data);

    // Response of "SUBSCRIBE" message
    if (message.type === "UPDATE") {

        // Find box with .active class and Update its value
        const activeBox = document.querySelector('.box.active');
        if (!activeBox) return;
        activeBox.querySelector('.box-value').textContent = message.data;

        if (message.id) 
            pendingMessages.delete(message.id);
    }

    if (message.type === "ALL_COUNTS") {
        document.getElementById("randomValue").textContent = message.data.random;
        document.getElementById("counterValue").textContent = message.data.count;
    }

    if (message.type === "PONG") {
        // DO NOTHING 
    }

    if (message.type === "ERROR") {
        alert(message.message);
    }
};

function makeRandomBoxActive() {
    const randomBox = document.getElementById("randomBox");
    if (!randomBox) 
        return alert("Random box not found!");
    makeBoxActive(randomBox);
}

function makeBoxActive(box) {
    box.classList.add('active');
    sendSubscribeMessage(box.dataset.boxName);
}

function sendSubscribeMessage(boxName) {
    if (socket.readyState !== WebSocket.OPEN) return;

    const id = generateID();
    const message = {
        type: "SUBSCRIBE",
        id,
        subscribeTo: boxName
    }

    socket.send(JSON.stringify(message));

    pendingMessages.set(id, {
        delay: INTIAL_REQUEST_RETRY_DELAY,
        attemptsRemaining: REQUEST_RETRY_MAX_ATTEMPTS, 
        message
    });

    // Schedule Retry Request
    setTimeout(retryMessageRequest.bind(null, id), INTIAL_REQUEST_RETRY_DELAY * 1000);
}

function generateID(length = 10) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function retryMessageRequest(messageId) {
    if (!pendingMessages.has(messageId)) return;

    let id = messageId;
    let { message, attemptsRemaining, delay } = pendingMessages.get(id);

    if (attemptsRemaining < 1) {
        pendingMessages.delete(id);
        return;
    }

    attemptsRemaining--;
    delay *= 2;

    socket.send(JSON.stringify(message));
    setTimeout(retryMessageRequest.bind(null, id), delay * 1000)


    pendingMessages.set(id, {
        delay, 
        attemptsRemaining, 
        message
    });
}