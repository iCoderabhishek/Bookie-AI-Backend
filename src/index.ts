import "dotenv/config";
import express from "express";
import asyncHandler from "./lib/error.js";
import formatUptime from "./lib/utils.js";
import processRouter from "./routes/process.js"
import errorHandler from "./middlewares/error.js";

const PORT = process.env.PORT

const app = express()
app.use(express.json())
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})


app.use("/api/v1/process", processRouter)

app.get("/health", asyncHandler(async (req, res) => {
    return res.status(200).json({ ok: true, uptime: formatUptime(process.uptime()) });
}))