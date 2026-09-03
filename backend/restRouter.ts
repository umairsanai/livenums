import { Router } from "express";
import { login, protect } from "./auth.js";
import { decrementCounter, getCounter, getMe, getRandomNumber, getTotalClients, incrementCounter, updateRandomNumber } from "./restController.js";

const router = Router();

router.post("/login", login);

router.get("/me", protect, getMe);
router.get("/clients", getTotalClients);

// RANDOM
router.get("/random", getRandomNumber);
router.post("/random", updateRandomNumber);

// COUNTER
router.get("/counter", getCounter);
router.post("/counter/increment", incrementCounter);
router.post("/counter/decrement", decrementCounter);

export default router;