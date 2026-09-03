import { NextFunction, Request, Response } from "express";
import { ErrorRequestHandler } from "express-serve-static-core";

export class AppError extends Error {

    statusCode: number;
    isOperational = true;
    status: "fail" | "error";
    message: string;    

    constructor(errorMessage: string, statusCode?: number) {
        super(errorMessage);
        this.statusCode = statusCode ?? 500;
        this.status = String(this.statusCode).startsWith("4") ? "fail" : "error";
        this.message = errorMessage;
        Error.captureStackTrace(this, this.constructor);
    }

}

export function handleAsyncError(func: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res, next).catch((error: Error | AppError) => next(error));
    }
}

export const errorMiddleware: ErrorRequestHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error.message);

    if (process.env.MODE === "prod") 
        sendProductionError(error, res);
    else 
        sendDevelopementError(error, res);
}

function sendProductionError(error: Error | AppError, res: Response) {
    let errorStatusCode: number;
    let errorObject: any;

    if (error instanceof AppError) {
        [errorStatusCode, errorObject] = [error.statusCode, {
            status: error.status,
            message: error.message
        }];
    } else {
        [errorStatusCode, errorObject] = [500, {
            status: "error",
            message: "Internal Server Wrong. Something went wrong."
        }];
    }

    console.error(`ErrorStatusCode: ${errorStatusCode}, ErrorObject: `, errorObject);
    res.status(errorStatusCode).json(errorObject);
}

function sendDevelopementError(error: Error, res: Response) {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            stack: error.stack
        });
    } else {
        res.status(500).json({
            status: "error",
            error
        });
    }
}     