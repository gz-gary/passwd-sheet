const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("<p>Hello!</p>");
});

app.get("/api/*", (req, res) => {
    res.send("<p>Wow you are trying to use api!</p>");
});

app.get("*", (req, res) => {
    res.redirect("/");
});

app.listen(1234, () => {
    console.log("Listening on port 1234");
});