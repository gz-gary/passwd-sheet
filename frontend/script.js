console.log("I am running!");

let rowStash = [];

const createInputRow = (normalRow) => {
    const rowLength = normalRow.children.length;
    const newRowElem = document.createElement("tr");
    for (let i = 0; i < rowLength - 1; ++i) {
        const tdElem = normalRow.children[i];

        const inputElem = document.createElement("input");
        const newTdElem = document.createElement("td");
        inputElem.type = "text";
        inputElem.value = tdElem.textContent;

        newTdElem.appendChild(inputElem);
        newRowElem.appendChild(newTdElem);
    }

    const confirmBtnElem = document.createElement("button");
    confirmBtnElem.textContent = "确认";

    const cancelBtnElem = document.createElement("button");
    cancelBtnElem.textContent = "取消";

    newRowElem.appendChild(confirmBtnElem);
    newRowElem.appendChild(cancelBtnElem);
    return newRowElem;
};

const editClick = (idx) => {
    return (event) => {
        if (event.button !== 0) return;
        const btnElem = event.target;
        const rowElem = btnElem.parentElement.parentElement;

        rowStash[idx] = rowElem;
        rowElem.parentElement.replaceChild(createInputRow(rowElem), rowElem);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("tableBody");
    fetch("/api/getsheet")
        .then(resp => resp.json())
        .catch(error => console.log(error))
        .then(json => {
            for (let i = 0; i < json["data"].length; ++i) {
                let row = json["data"][i];

                rowStash.push(null);
                const rowElem = document.createElement("tr");
                tableBody.appendChild(rowElem);

                for (let entry of Object.entries(row)) {
                    const colElem = document.createElement("td");
                    colElem.textContent = entry[1];
                    rowElem.appendChild(colElem);
                }

                const editCell = rowElem.insertCell(-1);
                const btnElem = document.createElement("button");
                btnElem.textContent = "编辑";
                btnElem.onclick = editClick(i);
                editCell.appendChild(btnElem);
            }
        });
});

