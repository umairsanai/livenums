# LiveNums

LiveNums is a simple real-time web application built as a practice project for learning and implementing **WebSockets with Node.js and Express**.

The backend maintains two values:

* **RANDOM** — a randomly generated number.
* **COUNTER** — a number that can be incremented or decremented by `1`.

Both values can be updated through HTTP `GET`/`POST` routes. A local cron script also generates updates every few seconds by randomly incrementing/decrementing the counter and assigning a new random value.

The interesting part is that the frontend **doesn't poll the server for updates**. Whenever either value changes, the backend immediately broadcasts the updated state to connected clients through a WebSocket connection.

## Tech Stack

* TypeScript
* React.js
* Node.js
* Express.js
* `ws` WebSocket library

## Purpose

LiveNums is a small learning project created to practice:

* Building a WebSocket server with Node.js
* Integrating WebSockets with Express
* Maintaining persistent client-server connections
* Broadcasting real-time state changes
* Understanding WebSockets as an alternative to HTTP polling