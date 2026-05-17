import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/error.js";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", issues: err.issues });
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
};


export default errorHandler