console.log("I am running!");

let rowStash = [];
let fields = null;

const edit = (idx, trElem) => {
    rowStash[idx] = trElem;
    trElem.parentElement.replaceChild(createEditRowFrom(idx, trElem), trElem);
};

const cancel = (idx, trElem) => {
    trElem.parentElement.replaceChild(rowStash[idx], trElem);
    rowStash[idx] = null;
};

const confirm_writerow = (idx, trElem) => {
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
            cancel(idx, trElem);
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
        const trElem = event.target.parentElement.parentElement;

        action(idx, trElem);
    };
}

const createTdWrapper = (elemInside) => {
    const tdElem = document.createElement("td");
    tdElem.appendChild(elemInside);
    return tdElem;
};

const createEditRow = (inputcontent, onconfirm, oncancel) => {
    const rowElem = document.createElement("tr");
    Array.from({ length: fields.length }, (_, i) => {
        const inputElem = document.createElement("input");
        inputElem.type = "text";
        inputElem.value = inputcontent[i];
        rowElem.appendChild(createTdWrapper(inputElem));
    });
    const confirmBtnElem = document.createElement("button");
    confirmBtnElem.textContent = "确认";
    confirmBtnElem.onclick = onconfirm;

    const cancelBtnElem = document.createElement("button");
    cancelBtnElem.textContent = "取消";
    cancelBtnElem.onclick = oncancel;

    rowElem.appendChild(createTdWrapper(confirmBtnElem));
    rowElem.appendChild(createTdWrapper(cancelBtnElem));
    return rowElem;
}

const createEditRowFrom = (rowIdx, row) => {
    return createEditRow(
        Array.from(row.querySelectorAll("td"), (v, k) => v.textContent),
        rowBtnClick(rowIdx, confirm_writerow),
        rowBtnClick(rowIdx, cancel)
    );
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

