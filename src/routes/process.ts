import asyncHandler, { ApiError } from "../lib/error.js";
import { urlSchema } from "../lib/schema.js";
import express from "express"
import extract from "../services/extract.js";

const router = express.Router()


router.post("/", asyncHandler(async (req, res) => {
    const { urls } = urlSchema.parse(req.body);

    const data = await Promise.all(
        urls.map(async (url) => {
            const extracted = await extract(url);
            return {
                url,
                status: extracted ? "ok" : "fail",
                title: extracted?.title,
                image: extracted?.candidateImages[0],
            };
        }),
    );

    return res.status(200).json({ success: true, data });
}));


export default router