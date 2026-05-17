import asyncHandler from "../lib/error.js";
import { urlSchema } from "../lib/schema.js";
import express from "express"

const router = express.Router()


router.post("/", asyncHandler(async (req, res) => {
    const { urls } = urlSchema.parse(req.body);
    res.json(urls.map((url) => ({ url, status: "ok", title: "TODO" })));
}));


export default router