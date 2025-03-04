const { readFile } = require("fs").promises;
const Papa = require("papaparse");

const csv2json = async (csvPath) => {
    const csvData = await readFile(csvPath, "utf-8");
    const result = Papa.parse(csvData, { header: true });
    return result;
};

module.exports = {
    csv2json: csv2json
};