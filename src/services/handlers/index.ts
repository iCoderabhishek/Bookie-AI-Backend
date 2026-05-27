import type { ExtractResult } from "../../types/index.js";
import { isTwitterHost, fetchTwitter } from "./twitter.js";
import { isRedditHost, fetchReddit } from "./reddit.js";
import { isYoutubeHost, fetchYoutube } from "./youtube.js";

type Handler = (url: string) => Promise<ExtractResult>;

export const findHandler = (url: string): Handler | null => {
    let host: string;
    try {
        host = new URL(url).hostname.toLowerCase();
    } catch {
        return null;
    }
    if (isTwitterHost(host)) return fetchTwitter;
    if (isRedditHost(host)) return fetchReddit;
    if (isYoutubeHost(host)) return fetchYoutube;
    return null;
};
