// --- Box Selection Logic ---
const boxes = document.querySelectorAll('.box');

boxes.forEach(box => {
    box.addEventListener('click', () => {
        boxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        socket.send(JSON.stringify({
            type: "SUBSCRIBE",
            subscribeTo: box.dataset.boxName
        }));
    });
});

// --- WebSocket Setup ---

const socketUrl = 'wss://livenums.onrender.com/websocket';
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const socket = new WebSocket(socketUrl);

socket.onopen = () => {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';

    const PINT_INTERVAL_TIME = 10; // seconds
    const pingInterval = setInterval(() => {
        socket.send(JSON.stringify({
            type: "PING"
        }));
    }, PINT_INTERVAL_TIME * 1000);


    socket.onclose = () => {
        statusDot.classList.remove('connected');
        statusText.textContent = 'Disconnected';

        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }
    };


    socket.onerror = (error) => {
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }
        console.error('WebSocket Error:', error);
        alert("Something went wrong.... Check the console.");
    };
};

socket.onmessage = (event) => {

    const message = JSON.parse(event.data);

    if (message.type === "UPDATE") {
        // Find box with .active class
        const activeBox = document.querySelector('.box.active');
        if (!activeBox) return;
        activeBox.querySelector('.box-value').textContent = message.data;
    }

    if (message.type === "ALL_COUNTS") {
        document.getElementById("randomValue").textContent = message.data.random;
        document.getElementById("counterValue").textContent = message.data.count;
    }

    if (message.type === "PONG") {
        // DO NOTHING 
    }
};