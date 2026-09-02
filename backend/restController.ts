import { NextFunction, Request, Response } from "express";
import { generateRandomNumber } from "./helpers.js";
import { broadcastUpdate } from "./socketController.js";

export const categories = new Map([["RANDOM", generateRandomNumber()], ["COUNTER", 1]]);



export function getTotalClients(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({
        number: req.socketServer.clients.size
    }); 
}


// RANDOM
export function getRandomNumber(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({
        number: categories.get("RANDOM") 
    });
}

export function updateRandomNumber(req: Request, res: Response, next: NextFunction) {
    categories.set("RANDOM", generateRandomNumber());
    broadcastUpdate(req.socketServer, "RANDOM");
    res.status(200).json({
        number: categories.get("RANDOM")
    });
}


// COUNTER
export function getCounter(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({
        number: categories.get("COUNTER")
    }); 
}

export function incrementCounter(req: Request, res: Response, next: NextFunction) {
    categories.set("COUNTER", categories.get("COUNTER")! + 1);
    broadcastUpdate(req.socketServer, "COUNTER");
    res.status(200).json({
        number: categories.get("COUNTER")
    });
}

export function decrementCounter(req: Request, res: Response, next: NextFunction) {
    categories.set("COUNTER", categories.get("COUNTER")! - 1);
    broadcastUpdate(req.socketServer, "COUNTER");
    res.status(200).json({
        number: categories.get("COUNTER")
    });
}