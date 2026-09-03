import { createReadStream } from "fs";
import { createInterface } from "readline";
import { User } from "./types.js";
import { AppError } from "./error.js";

const users: Map<string, User> = new Map();

try {
    const fileStream = createReadStream('accounts.txt');
    const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        const matches = [...line.matchAll(/"([^"]+)"/g)];
        const username = matches[0][1];  
        const password = matches[1][1];

        users.set(username, { username, password });
    }
} catch (error) {
    console.error("Error processing file:", error);
    throw new AppError("Error processing accounts.txt", 500);
}

export default users;