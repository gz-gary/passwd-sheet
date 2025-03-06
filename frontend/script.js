console.log("I am running!");

let rowStash = [];

const editClick = (idx) => {
    return (event) => {
        if (event.button !== 0) return;
        /*const btnElem = event.target;
        const rowElem = btnElem.parentElement.parentElement;

        const rowLength = rowElem.children.length;
        for (let i = 0; i < rowLength - 1; ++i) {
            const elem = rowElem.children[i];

            const inputElem = document.createElement("input");
            inputElem.type = "text";
            inputElem.value = elem.textContent;

            elem.textContent = "";
            elem.appendChild(inputElem);
        }

        const lastTdElem = rowElem.children[rowLength - 1];

        const confirmBtnElem = document.createElement("button");
        confirmBtnElem.textContent = "确认";

        const cancelBtnElem = document.createElement("button");
        cancelBtnElem.textContent = "取消";

        btnElem.innerHTML = "";
        lastTdElem.appendChild(confirmBtnElem);
        lastTdElem.appendChild(cancelBtnElem);*/
        console.log(`Row ${idx} was clicked!`);
        console.log(rowStash.length);
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

