const { readFile, writeFile } = require("fs").promises;
const Papa = require("papaparse");

const csvRead = async (csvPath) => {
    const csvRaw = await readFile(csvPath, "utf-8");
    return Papa.parse(csvRaw, { header: true });
}

const csv2json = async (csvPath) => {
    return JSON.stringify(await csvRead(csvPath));
};

const csvWriteRow = async (csvPath, rowIdx, row) => {
    const csvObj = await csvRead(csvPath);
    csvObj.data[rowIdx] = row;
    await writeFile(csvPath, Papa.unparse(csvObj.data));
};

const csvNewRow = async (csvPath, row) => {
    const csvObj = await csvRead(csvPath);
    csvObj.data.push(row);
    await writeFile(csvPath, Papa.unparse(csvObj.data));
};

const csvDelRow = async (csvPath, rowIdx) => {
    const csvObj = await csvRead(csvPath);
    csvObj.data.splice(rowIdx, 1);
    await writeFile(csvPath, Papa.unparse(csvObj.data));
};

module.exports = {
    csv2json: csv2json,
    csvWriteRow: csvWriteRow,
    csvNewRow: csvNewRow,
    csvDelRow: csvDelRow
};