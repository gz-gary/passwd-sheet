console.log("I am running!");

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("tableBody");
    fetch("/api/getsheet")
        .then(resp => resp.json())
        .catch(error => console.log(error))
        .then(json => {
            for (let row of json["data"]) {
                const rowElem = document.createElement("tr");
                tableBody.appendChild(rowElem);

                for (let entry of Object.entries(row)) {
                    const colElem = document.createElement("td");
                    colElem.textContent = entry[1];
                    rowElem.appendChild(colElem);
                }

                const btnElem = document.createElement("button");
                btnElem.textContent = "编辑";
                btnElem.onclick = () => {
                    alert("Hello!");
                };
                rowElem.appendChild(btnElem);
            }
        });
});

