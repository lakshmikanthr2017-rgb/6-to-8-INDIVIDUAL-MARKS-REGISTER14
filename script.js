const ROW_COUNT = 20;
const STORAGE_KEY = "marks-register-6-8-v2";

const body = document.getElementById("studentBody");
const classSelect = document.getElementById("classSelect");
const subjectSelect = document.getElementById("subjectSelect");
const yearSelect = document.getElementById("yearSelect");

const fields = ["fa1", "fa2", "sa1", "fa3", "fa4", "sa2"];

function gradeFromTotal(total) {
    if (total >= 90) return "A+";
    if (total >= 70) return "A";
    if (total >= 50) return "B+";
    if (total >= 30) return "B";
    return "C";
}

function calculateTotal(row) {
    const values = fields.map(field => {
        return Number(
            row.querySelector(`[data-field="${field}"]`).value
        ) || 0;
    });

    const raw = values.reduce((a, b) => a + b, 0);

    // Maximum marks:
    // FA1 20 + FA2 20 + SA1 40
    // FA3 20 + FA4 20 + SA2 40 = 160
    const max = 160;

    return Math.min(100, Math.round((raw / max) * 100));
}

function addRow(index, data = {}) {

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${index}</td>

        <td class="name-col">
            <input
                class="student-name"
                value="${escapeHtml(data.name || "")}"
                placeholder="Student Name ${index}">
        </td>

        ${fields.map(field => `
            <td class="mark-cell">
                <input
                    type="number"
                    min="0"
                    inputmode="numeric"
                    data-field="${field}"
                    value="${data[field] ?? ""}">
            </td>
        `).join("")}

        <td class="total">0</td>
        <td class="grade">C</td>
    `;

    body.appendChild(tr);

    tr.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
            updateRow(tr);
        });
    });

    updateRow(tr);
}

function escapeHtml(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character];

    });
}

function updateRow(tr) {

    const total = calculateTotal(tr);

    tr.querySelector(".total").textContent = total;

    tr.querySelector(".grade").textContent =
        gradeFromTotal(total);
}

function collectData() {

    return {

        className: classSelect.value,

        subject: subjectSelect.value,

        year: yearSelect.value,

        students: [...body.querySelectorAll("tr")].map(tr => {

            return {

                name: tr.querySelector(".student-name").value,

                ...Object.fromEntries(
                    fields.map(field => [
                        field,
                        tr.querySelector(
                            `[data-field="${field}"]`
                        ).value
                    ])
                )

            };

        })

    };
}

function loadData() {

    let saved = null;

    try {

        saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "null"
        );

    } catch (error) {

        saved = null;

    }

    if (saved) {

        classSelect.value =
            saved.className || classSelect.value;

        subjectSelect.value =
            saved.subject || subjectSelect.value;

        yearSelect.value =
            saved.year || yearSelect.value;
    }

    for (let i = 1; i <= ROW_COUNT; i++) {

        addRow(
            i,
            saved?.students?.[i - 1] || {}
        );

    }
}


// SAVE
document.getElementById("saveBtn").addEventListener("click", function () {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(collectData())
    );

    alert("Register saved successfully.");

});


// RESET
document.getElementById("resetBtn").addEventListener("click", function () {

    if (!confirm("Clear all entered marks and names?")) {
        return;
    }

    localStorage.remove
