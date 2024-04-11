import express from "express";
import dotenv from "dotenv";
dotenv.config();
const key = process.env.OPEN_AI_KEY;

const app = express();

app.get("/", (_req, res) => {
    console.log("hello");
    res.send("Hello, World new again!");
});

app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});
