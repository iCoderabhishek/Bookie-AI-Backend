import type { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import { ZodError } from "zod";


export class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

const asyncHandler = (fn: RequestHandler): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }

export default asyncHandler