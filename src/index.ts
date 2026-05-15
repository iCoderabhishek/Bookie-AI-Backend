import "dotenv/config";
import express from "express";
import prisma from "./lib/prisma.js";
import asyncHandler, { ApiError } from "./lib/error.js";

const PORT = process.env.PORT

const app = express()
app.use(express.json())
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
app.get("/bookmarks", asyncHandler(async (req, res) => {

    const bookmarks = await prisma.bookmark.findMany();
    if (!bookmarks) throw new ApiError(404, "Bookmarks not found")
    return res.status(200).json(bookmarks);

}))

app.post("/bookmarks", asyncHandler(async (req, res) => {

    const { url } = req.body;
    const existingBookmark = await prisma.bookmark.findUnique({ where: { url } });
    if (existingBookmark) throw new ApiError(400, "Bookmark already exists");

    const bookmark = await prisma.bookmark.create({ data: { url } });
    if (!bookmark) throw new ApiError(400, "Failed to create bookmark");

    return res.status(201).json(bookmark);
}))