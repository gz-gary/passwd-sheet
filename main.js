const express = require("express");
const { csv2json } = require("./csv");

const app = express();
const csvPath = "./test.csv";

app.use(express.static("frontend"));

app.get("/api/getsheet", async (req, res) => {
    try {
        const result = await csv2json(csvPath);
        res
        .contentType("application/json")
        .send(JSON.stringify(result));
    } catch (error) {
        res.status(500).send("Internal error");
    }
});

app.get("*", (req, res) => {
    res.redirect("/");
});

app.listen(1234, () => {
    console.log("Listening on port 1234");
});