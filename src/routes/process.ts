import asyncHandler from "../lib/error.js";
import { urlSchema } from "../lib/schema.js";
import express from "express";
import extract from "../services/extract.js";
import { summarise } from "../services/summarise.js";

const router = express.Router();
const CONCURRENCY = Number(process.env.CONCURRENCY)!;

router.post("/", asyncHandler(async (req, res) => {
    const { urls } = urlSchema.parse(req.body);
    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Cache-Control", "no-cache");

    let i = 0;

    const workers = Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
        while (i < urls.length) {
            const url = urls[i++]!;
            try {
                const result = await extract(url);

                if (result.status === "ok") {
                    const summary = await summarise(result.text, result.candidateImages);
                    res.write(JSON.stringify({ url, status: "ok", ...summary }) + "\n");
                } else if (result.status === "preview") {
                    res.write(JSON.stringify({
                        url,
                        status: "preview",
                        title: result.title,
                        summary: result.description,
                        thumbnail: result.thumbnail,
                    }) + "\n");
                } else {
                    res.write(JSON.stringify({
                        url,
                        status: "unsupported",
                        reason: result.reason,
                    }) + "\n");
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "Unknown error";
                res.write(JSON.stringify({ url, status: "failed", error: message }) + "\n");
            }
        }
    });

    await Promise.all(workers);
    res.end();
}));

export default router;
