import express from "express";

const app = express();

app.get("/", (_req, res) => {
    console.log("hello");
    res.send("Hello, World new again!");
});

app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});
