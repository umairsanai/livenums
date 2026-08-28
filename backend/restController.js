import { generateRandomNumber } from "./helpers.js";
import { broadcastUpdate } from "./socketController.js";

export const categories = new Map([["RANDOM", generateRandomNumber()], ["COUNTER", 1]]);


// RANDOM
export function getRandomNumber(req, res, next) {
    res.status(200).json({
        number: categories.get("RANDOM") 
    });
}

export function updateRandomNumber(req, res, next) {
    categories.set("RANDOM", generateRandomNumber());
    broadcastUpdate(req.socketServer, "RANDOM");
    res.status(200).json({
        number: categories.get("RANDOM")
    });
}


// COUNTER
export function getCounter(req, res, next) {
    res.status(200).json({
        number: categories.get("COUNTER")
    }); 
}

export function incrementCounter(req, res, next) {
    categories.set("COUNTER", categories.get("COUNTER")+1);
    broadcastUpdate(req.socketServer, "COUNTER");
    res.status(200).json({
        number: categories.get("COUNTER")
    });
}

export function decrementCounter(req, res, next) {
    categories.set("COUNTER", categories.get("COUNTER")-1);
    broadcastUpdate(req.socketServer, "COUNTER");
    res.status(200).json({
        number: categories.get("COUNTER")
    });
}