import { Request, Response, NextFunction, CookieOptions } from "express";
import { AppError, handleAsyncError } from "./error.js";
import argon from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import users from "./database.js";

const signJwtToken = (username: string) => {
    return jwt.sign({ username }, process.env.JWT_SIGN_SECRET as string, {
        expiresIn: "7 days"
    });
}

const signTokenAndSetInCookie = (username: string, res: Response, cookie_name: string) => {
    console.log("Token: " + signJwtToken(username));
    res.cookie(cookie_name, signJwtToken(username), {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days
        secure: process.env.MODE === "prod"
    });
}

const verifyPassword = async (actual_password: string, input_password: string) => {
    return await argon.verify(actual_password, input_password, {
        secret: Buffer.from(process.env.PASSWORD_HASH_SECRET as string)
    });
}

export const protect = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies["livenums-login-token"];

    if (!token) 
        return next(new AppError("You're not logged in!", 401));

    let payload: JwtPayload;

    try {
        payload = jwt.verify(token, process.env.JWT_SIGN_SECRET as string) as JwtPayload;
    } catch (error) {
        return next(new AppError("Your login session token has been malformed. Please login again.", 400));
    }

    const user = users.get(payload.username);

    if (!user)
        return next(new AppError("This user doesn't exist", 404));
    
    req.user = user;
    next();
});


export const login = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log(req.body);

    if (!username || !password || typeof username !== "string" || typeof password !== "string") 
        return next(new AppError("Please provide complete and correct credentials", 400));

    const user = users.get(username);

    console.log(user);

    if (!user || !await verifyPassword(user.password, password))
        return next(new AppError("Incorrect credentials!", 401));

    signTokenAndSetInCookie(user.username, res, "livenums-login-token");

    res.status(200).json({
        status: "success",
        data: null
    });
});