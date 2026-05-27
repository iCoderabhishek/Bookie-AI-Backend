import * as cheerio from "cheerio";
import type { ExtractResult } from "../types/index.js";
import { ApiError } from "../lib/error.js";
import { findHandler } from "./handlers/index.js";

const extract = async (url: string): Promise<ExtractResult> => {
    const handler = findHandler(url);
    if (handler) return handler(url);

    const res = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; bookie.ai/0.1)" },
        signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
        throw new ApiError(502, `Failed to fetch URL (${res.status})`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
    const ogImage = $('meta[property="og:image"]').attr("content") ?? null;
    const ogDescription = $('meta[property="og:description"]').attr("content") ?? "";
    const pageTitle = $("title").text().trim();

    const candidateImages = collectImages($, url);
    $("script, style, nav, footer, header").remove();

    const text = ($("article").text() || $("main").text() || $("body").text())
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 12_000);

    if (looksBroken(text)) {
        const title = ogTitle || pageTitle;
        if (title || ogImage) {
            return {
                status: "preview",
                title: title || "(no title)",
                description: ogDescription,
                thumbnail: ogImage,
            };
        }
        return { status: "unsupported", reason: "Page has no readable content" };
    }

    return {
        status: "ok",
        title: pageTitle,
        text,
        candidateImages,
    };
};

const looksBroken = (text: string): boolean => {
    if (text.length < 200) return true;
    const lower = text.toLowerCase();
    const badPhrases = [
        "javascript is disabled",
        "enable javascript",
        "requires javascript",
        "just a moment",
        "checking your browser",
        "sign in to continue",
    ];
    return badPhrases.some((p) => lower.includes(p));
};

const collectImages = ($: cheerio.CheerioAPI, baseUrl: string): string[] => {
    const urls: Set<string> = new Set();
    const og = $('meta[property="og:image"]').attr("content");
    if (og) urls.add(og);
    const twitter = $('meta[name="twitter:image"]').attr("content");
    if (twitter) urls.add(twitter);
    $("article img, main img").each((_, el) => {
        const src = $(el).attr("src");
        if (src) urls.add(src);
    });
    return [...urls]
        .map((u) => safeAbsolute(u, baseUrl))
        .filter((u): u is string => u !== null)
        .slice(0, 5);
};

const safeAbsolute = (u: string, base: string): string | null => {
    try {
        return new URL(u, base).toString();
    } catch {
        return null;
    }
};

export default extract;
