console.log("I am running!");

let rowStash = [];
let fields = null;

const edit = (idx, btnElem, trElem) => {
    rowStash[idx] = trElem;
    trElem.parentElement.replaceChild(createInputRow(trElem, idx), trElem);
};

const cancel = (idx, btnElem, trElem) => {
    trElem.parentElement.replaceChild(rowStash[idx], trElem);
    rowStash[idx] = null;
};

const confirm_writerow = (idx, btnElem, trElem) => {
    trElem.querySelectorAll("input")
          .forEach(input => input.disabled = true);
    trElem.querySelectorAll("button")
          .forEach(button => button.disabled = true);
    fetch("/api/setsheet/writerow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rowIdx: idx,
            row: Object.fromEntries(Array.from({ length: fields.length }, (_, i) => 
                [fields[i], trElem.children[i].firstChild.value]
            ))
        })
    })
    .then(response => {
        if (response.ok) {
            Array.from(rowStash[idx].children).forEach((tdElem, i) => {
                if (i >= fields.length) return;
                tdElem.textContent = trElem.children[i].firstChild.value;
            });
            cancel(idx, btnElem, trElem);
        } else throw new Error("Network response was not ok");
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
        cancel(idx, btnElem, trElem);
    });
};

const rowBtnClick = (idx, action) => {
    return (event) => {
        if (event.button !== 0) return;
        const btnElem = event.target;
        const trElem = btnElem.parentElement.parentElement;

        action(idx, btnElem, trElem);
    };
}

const createTdWrapper = (elemInside) => {
    const tdElem = document.createElement("td");
    tdElem.appendChild(elemInside);
    return tdElem;
};

const createInputRow = (normalRow, idx) => {
    const rowLength = normalRow.children.length;
    const newRowElem = document.createElement("tr");
    for (let i = 0; i < rowLength - 1; ++i) {
        const tdElem = normalRow.children[i];

        const inputElem = document.createElement("input");
        inputElem.type = "text";
        inputElem.value = tdElem.textContent;

        newRowElem.appendChild(createTdWrapper(inputElem));
    }

    const confirmBtnElem = document.createElement("button");
    confirmBtnElem.textContent = "确认";
    confirmBtnElem.onclick = rowBtnClick(idx, confirm_writerow);

    const cancelBtnElem = document.createElement("button");
    cancelBtnElem.textContent = "取消";
    cancelBtnElem.onclick = rowBtnClick(idx, cancel);

    newRowElem.appendChild(createTdWrapper(confirmBtnElem));
    newRowElem.appendChild(createTdWrapper(cancelBtnElem));
    return newRowElem;
};

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("tableBody");
    fetch("/api/getsheet")
        .then(resp => resp.json())
        .catch(error => console.error(error))
        .then(json => {
            fields = Array.from(json["meta"]["fields"]);
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
                btnElem.onclick = rowBtnClick(i, edit);
                editCell.appendChild(btnElem);
            }
        });
});

