import type { ExtractResult } from "../../types/index.js";

type RedditListing = Array<{
    data?: {
        children?: Array<{
            data?: {
                title?: string;
                selftext?: string;
                thumbnail?: string;
                preview?: { images?: Array<{ source?: { url?: string } }> };
                url_overridden_by_dest?: string;
            };
        }>;
    };
}>;

export const isRedditHost = (host: string): boolean =>
    host === "reddit.com" || host === "www.reddit.com" || host === "old.reddit.com";

export const fetchReddit = async (url: string): Promise<ExtractResult> => {
    const u = new URL(url);
    u.search = "";
    const jsonUrl = u.toString().replace(/\/?$/, "") + ".json";

    const res = await fetch(jsonUrl, {
        headers: { "user-agent": "bookie.ai/0.1" },
        signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
        return { status: "unsupported", reason: `Reddit returned ${res.status}` };
    }

    const data = (await res.json()) as RedditListing;
    const post = data?.[0]?.data?.children?.[0]?.data;
    if (!post?.title) {
        return { status: "unsupported", reason: "Reddit post not found" };
    }

    const images: string[] = [];
    const previewUrl = post.preview?.images?.[0]?.source?.url;
    if (previewUrl) images.push(previewUrl.replace(/&amp;/g, "&"));
    if (post.thumbnail?.startsWith("http")) images.push(post.thumbnail);
    if (post.url_overridden_by_dest && /\.(jpg|jpeg|png|gif|webp)$/i.test(post.url_overridden_by_dest)) {
        images.push(post.url_overridden_by_dest);
    }

    return {
        status: "ok",
        title: post.title,
        text: `${post.title}\n\n${post.selftext ?? ""}`.trim(),
        candidateImages: images.slice(0, 5),
    };
};
