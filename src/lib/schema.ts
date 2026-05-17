import { z } from "zod";

const urlSchema = z.object({
    urls: z.array(z.url("Invalid URL"))
        .min(1, "At least one URL required")
        .max(10, "Max 10 URLs per request"),
});

export { urlSchema };
