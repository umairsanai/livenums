import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookirParser from "cookie-parser";

import { allowedOrigins } from "./helpers.js";

const app = express();

app.set("trust proxy", 1);
app.use(cors({origin: allowedOrigins, credentials: true}));
app.use(morgan("dev"));
app.set('query parser', 'extended');
app.use(express.json({limit: '10kb'}));
app.use(cookirParser());
app.use(express.urlencoded({extended: true, limit:'10kb'}));


export default app;