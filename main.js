const express = require("express");
const { csv2json, csvNewRow, csvWriteRow, csvDelRow } = require("./csv");

const app = express();
const csvPath = "./test.csv";

app.use(express.json())
app.use(express.static("frontend"));

app.get("/api/getsheet", async (req, res) => {
    try {
        res
        .contentType("application/json")
        .send(await csv2json(csvPath));
    } catch (error) {
        res.status(500).send("Internal error");
    }
});

app.post("/api/setsheet/*", async (req, res) => {
    try {
        const json = req.body;
        switch (req.params[0]) {
        case "writerow":
            csvWriteRow(csvPath, json["rowIdx"], json["row"]);
            res.status(200).send("Write row succeeded");
            break;
        case "newrow":
            csvNewRow(csvPath, json["row"]);
            res.status(200).send("New row succeeded");
            break;
        case "delrow":
            csvDelRow(csvPath, json["rowIdx"]);
            res.status(200).send("Del row succeeded");
            break;
        default:
            res.status(404).send("Invalid API");
            break;
        }
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