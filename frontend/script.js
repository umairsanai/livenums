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
const socketUrl = 'wss://livenums-backend.vercel.app/websocket';
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const socket = new WebSocket(socketUrl);

socket.onopen = handleSocketOpenEvent;
socket.onclose = handleSocketCloseEvent;
socket.onerror = handleSocketErrorEvent;

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
};





function handleSocketOpenEvent() {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
}

function handleSocketCloseEvent() {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Disconnected';
}

function handleSocketErrorEvent(error) {
    console.error('WebSocket Error:', error);
    alert("Something went wrong.... Check the console.");
}