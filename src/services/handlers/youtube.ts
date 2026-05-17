import type { ExtractResult } from "../../types/index.js";

type OEmbed = {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
};

export const isYoutubeHost = (host: string): boolean =>
    host === "youtube.com" ||
    host === "www.youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtu.be";

export const fetchYoutube = async (url: string): Promise<ExtractResult> => {
    const api = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(api, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
        return { status: "unsupported", reason: `YouTube oEmbed returned ${res.status}` };
    }

    const data = (await res.json()) as OEmbed;
    if (!data.title) {
        return { status: "unsupported", reason: "YouTube oEmbed empty" };
    }

    return {
        status: "preview",
        title: data.title,
        description: data.author_name ? `Video by ${data.author_name}` : "",
        thumbnail: data.thumbnail_url ?? null,
    };
};
