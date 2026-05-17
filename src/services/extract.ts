import * as cheerio from 'cheerio'
import type { Extracted } from '../types/index.js'
import { ApiError } from '../lib/error.js'


const extract = async (url: string): Promise<Extracted> => {

    const res = await fetch(url, {
        headers: { "user-Agent": "bookie.ai/0.1" },
        signal: AbortSignal.timeout(10_000)
    })
    if (!res.ok) {
        throw new ApiError(502, "Failed to fetch the URL")
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    const candidateImages = collectImages($, url)
    $("script, style, nav, footer, header").remove();

    const text = $("article").text() ||
        $("main").text() ||
        $("body").text()

    return {
        title: $("title").text().trim(),
        text: text.replace(/\s+/g, " ").trim().slice(0, 12_000),
        candidateImages
    }
}

const collectImages = ($: cheerio.CheerioAPI, baseUrl: string): string[] => {
    const urls: Set<string> = new Set()
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
        .slice(0, 5)
}


function safeAbsolute(u: string, base: string): string | null {
    try { return new URL(u, base).toString(); } catch { return null; }
}

export default extract
