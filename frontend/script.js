console.log("I am running!");

let fields = null;

let rowIdxEditing = null;
let rowStash = null;
/* state can be 'init', 'editing', 'newrow' */
let state = null;

const edit = (event) => {
    const row = event.target.closest("tr");
    const idx = row.rowIndex - 1;
    switch (state) {
    case "init":
        /* stash this row */
        rowIdxEditing = idx;
        rowStash = row;
        /* replace this row with edit row */
        row.parentElement.replaceChild(createEditRowFrom(row), row);

        state = "editing";
        break;
    case "editing":
        /* resume editing row */
        row.parentElement.replaceChild(rowStash, row.parentElement.children[rowIdxEditing]);
        /* stash this row */
        rowIdxEditing = idx;
        rowStash = row;
        /* replace this row with edit row */
        row.parentElement.replaceChild(createEditRowFrom(row), row);

        state = "editing";
        break;
    case "newrow":
        /* cancel new row */
        row.parentElement.removeChild(row.parentElement.lastChild);
        /* stash this row */
        rowIdxEditing = idx;
        rowStash = row;
        /* replace this row with edit row */
        row.parentElement.replaceChild(createEditRowFrom(row), row);

        state = "editing";
        break;
    }
};

const cancel = (event) => {
    const row = event.target.closest("tr");
    const idx = row.rowIndex - 1;
    switch (state) {
    case "init":
        console.error("Invalid transition!");

        state = "init";
        break;
    case "editing":
        /* resume editing row */
        row.parentElement.replaceChild(rowStash, row);
        rowIdxEditing = null;
        rowStash = null;
        
        state = "init";
        break;
    case "newrow":
        /* cancel new row */
        row.parentElement.removeChild(row);

        state = "init";
        break;
    }
};

const confirm = (event) => {
    const row = event.target.closest("tr");
    const idx = row.rowIndex - 1;
    switch (state) {
    case "init":
        console.error("Invalid transition!");
        break;
    case "editing":
        /* disable all buttons before submission completed */
        document.querySelectorAll("button").forEach(button => button.disabled = true);
        /* submit to backend */
        fetch("/api/setsheet/writerow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rowIdx: idx,
                row: Object.fromEntries(Array.from({ length: fields.length }, (_, i) => 
                    [fields[i], row.children[i].firstChild.value]
                ))
            })
        })
        .then(response => {
            /* submission completed */
            document.querySelectorAll("button").forEach(button => button.disabled = false);
            if (response.ok) {
                Array.from(rowStash.children).forEach((td, i) => {
                    if (i >= fields.length) return;
                    td.textContent = row.children[i].firstChild.value;
                });
                console.log(rowStash);
            } else throw new Error("Network response was not ok");
            /* resume row edited */
            row.parentElement.replaceChild(rowStash, row);
            rowIdxEditing = null;
            rowStash = null;
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
        
        state = "init";
        break;
    case "newrow":
        /* disable all buttons before submission completed */
        document.querySelectorAll("button").forEach(button => button.disabled = true);
        /* submit to backend */
        fetch("/api/setsheet/newrow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                row: Object.fromEntries(Array.from({ length: fields.length }, (_, i) => 
                    [fields[i], row.children[i].firstChild.value]
                ))
            })
        })
        .then(response => {
            /* submission completed */
            document.querySelectorAll("button").forEach(button => button.disabled = false);
            if (response.ok) {
                const newRow = document.createElement("tr");
                row.querySelectorAll("input").forEach((input, i) => {
                    const td = document.createElement("td");
                    td.textContent = input.value;
                    newRow.appendChild(td);
                });
                const btn = document.createElement("button");
                btn.innerText = "编辑";
                btn.onclick = edit;
                newRow.appendChild(btn);
                row.parentElement.replaceChild(newRow, row);
            } else throw new Error("Network response was not ok");
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });

        state = "init";
        break;
    }
}

const newrow = (event) => {
    const tableBody = document.getElementById("tableBody");
    switch (state) {
    case "init":
        /* create new row */
        tableBody.appendChild(
            createEditRow(Array.from({ length: fields.length }, (v, k) => ""))
        );

        state = "newrow";
        break;
    case "editing":
        /* resume editing row */
        tableBody.replaceChild(rowStash, tableBody.children[rowIdxEditing]);
        rowIdxEditing = null;
        rowStash = null;
        /* create new row */
        tableBody.appendChild(
            createEditRow(Array.from({ length: fields.length }, (v, k) => ""))
        );

        state = "newrow";
        break;
    case "newrow":
        console.error("Invalid transition!");
        break;
    }
}

const del = (event) => {
    const row = event.target.closest("tr");
    const idx = row.rowIndex - 1;
    switch (state) {
    case "init":
        console.error("Invalid transition!");
        break;
    case "editing":
        /* disable all buttons before submission completed */
        document.querySelectorAll("button").forEach(button => button.disabled = true);
        /* submit to backend */
        fetch("/api/setsheet/delrow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rowIdx: idx
            })
        })
        .then(response => {
            /* submission completed */
            document.querySelectorAll("button").forEach(button => button.disabled = false);
            if (response.ok) {
                row.parentElement.removeChild(row);
            } else throw new Error("Network response was not ok");
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });

        state = "init";
        break;
    case "newrow":
        row.parentElement.removeChild(row);
        state = "init";
        break;
    }
};

const createTdWrapper = (elemInside) => {
    const tdElem = document.createElement("td");
    tdElem.appendChild(elemInside);
    return tdElem;
};

const createEditRow = (inputcontent) => {
    const rowElem = document.createElement("tr");
    Array.from({ length: fields.length }, (_, i) => {
        const inputElem = document.createElement("input");
        inputElem.type = "text";
        inputElem.value = inputcontent[i];
        rowElem.appendChild(createTdWrapper(inputElem));
    });
    const confirmBtnElem = document.createElement("button");
    confirmBtnElem.textContent = "确认";
    confirmBtnElem.onclick = confirm;

    const cancelBtnElem = document.createElement("button");
    cancelBtnElem.textContent = "取消";
    cancelBtnElem.onclick = cancel;

    const delBtnElem = document.createElement("button");
    delBtnElem.textContent = "删除";
    delBtnElem.onclick = del;

    rowElem.appendChild(createTdWrapper(confirmBtnElem));
    rowElem.appendChild(createTdWrapper(cancelBtnElem));
    rowElem.appendChild(createTdWrapper(delBtnElem));
    return rowElem;
}

const createEditRowFrom = (row) => {
    return createEditRow(
        Array.from(row.querySelectorAll("td"), (td, _) => td.textContent),
    );
};

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("tableBody");
    const addEntry = document.getElementById("addEntry");
    addEntry.onclick = newrow;
    fetch("/api/getsheet")
        .then(resp => resp.json())
        .catch(error => console.error(error))
        .then(json => {
            state = "init";
            fields = Array.from(json["meta"]["fields"]);
            for (let i = 0; i < json["data"].length; ++i) {
                let row = json["data"][i];

                const rowElem = document.createElement("tr");
                tableBody.appendChild(rowElem);

                const entries = Object.entries(row);
                for (let j = 0; j < fields.length; ++j) {
                    const colElem = document.createElement("td");
                    colElem.textContent = entries[j] != undefined ? entries[j][1] : "";
                    rowElem.appendChild(colElem);
                }

                const editCell = rowElem.insertCell(-1);
                const btnElem = document.createElement("button");
                btnElem.textContent = "编辑";
                btnElem.onclick = edit;
                editCell.appendChild(btnElem);
            }
        });
});

