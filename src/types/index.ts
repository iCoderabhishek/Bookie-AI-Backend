type ExtractOk = {
    status: "ok";
    title: string;
    text: string;
    candidateImages: string[];
};

type ExtractPreview = {
    status: "preview";
    title: string;
    description: string;
    thumbnail: string | null;
};

type ExtractUnsupported = {
    status: "unsupported";
    reason: string;
};

type ExtractResult = ExtractOk | ExtractPreview | ExtractUnsupported;

const categories = [
    "productivity", "personal-finance", "health-and-wellness", "entertainment",
    "travel", "career-growth", "relationships", "food-and-drink", "hobbies",
    "home-and-living", "tech", "business", "news", "fashion", "beauty",
    "parenting", "education", "self-improvement", "spirituality", "fitness",
    "sports", "gaming", "art-and-design", "music", "movies-and-tv",
    "books-and-literature", "photography", "pets", "gardening", "diy-and-crafts",
    "real-estate", "investing", "entrepreneurship", "marketing", "programming",
    "science", "history", "politics", "environment", "culture", "other"
];


type Category = typeof categories[number];

type Summary = {
    title: string;
    summary: string;
    tags: string[];
    category: Category;
    thumbnail: string | null;
};

export type { ExtractResult, Summary, Category }
export { categories as categoriesEnum }