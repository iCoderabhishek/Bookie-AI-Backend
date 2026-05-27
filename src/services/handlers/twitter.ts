import type { ExtractResult } from "../../types/index.js";

type FxTweet = {
    tweet?: {
        text?: string;
        author?: { name?: string; screen_name?: string; avatar_url?: string };
        media?: { photos?: Array<{ url?: string }> };
    };
};

export const isTwitterHost = (host: string): boolean =>
    host === "x.com" || host === "www.x.com" || host === "twitter.com" || host === "www.twitter.com";

export const fetchTwitter = async (url: string): Promise<ExtractResult> => {
    const path = new URL(url).pathname;
    const res = await fetch(`https://api.fxtwitter.com${path}`, {
        signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
        return { status: "unsupported", reason: `fxtwitter returned ${res.status}` };
    }

    const data = (await res.json()) as FxTweet;
    const t = data.tweet;
    if (!t?.text) {
        return { status: "unsupported", reason: "Tweet not found" };
    }

    const author = t.author?.name ?? "Unknown";
    const handle = t.author?.screen_name ? `@${t.author.screen_name}` : "";
    const photos = (t.media?.photos ?? []).map((p) => p.url).filter((u): u is string => !!u);
    const avatar = t.author?.avatar_url ? [t.author.avatar_url] : [];

    return {
        status: "ok",
        title: `${author} ${handle}: ${t.text.slice(0, 80)}`.trim(),
        text: `Tweet by ${author} ${handle}:\n\n${t.text}`.trim(),
        candidateImages: [...photos, ...avatar].slice(0, 5),
    };
};
