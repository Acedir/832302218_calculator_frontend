/**
 * app.js
 * 前端逻辑：调后端 API，只负责展示。
 * 所有计算由后端完成。
 */
const API_BASE = "http://127.0.0.1:5000";

// 标记「刚刚按过 =」，用于实现「按 = 后算式和结果保留」
let justCalculated = false;

// ============ DOM 引用 ============
const expressionInput = document.getElementById("expression");
const resultEl = document.getElementById("result");
const messageEl = document.getElementById("message");
const historyList = document.getElementById("history-list");
const historyLoading = document.getElementById("history-loading");
const historyEmpty = document.getElementById("history-empty");
const clearHistoryBtn = document.getElementById("clear-history");

// ============ 按钮绑定 ============
document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.value;
        const action = btn.dataset.action;

        // 处理数字和小数点
        if (value) {
            // 如果刚刚按过 =，并且用户点的是数字或小数点，
            // 说明用户要开始新计算：先清空输入框和结果
            if (justCalculated && /^[0-9.]$/.test(value)) {
                expressionInput.value = "";
                resultEl.textContent = "";
                resultEl.classList.remove("error");
                messageEl.textContent = "";
            }
            justCalculated = false;
            insertAtCursor(value);
            return;
        }

        // 处理功能键
        switch (action) {
            case "clear":
                // 清空：输入框和结果都清掉
                expressionInput.value = "";
                resultEl.textContent = "";
                resultEl.classList.remove("error");
                messageEl.textContent = "";
                justCalculated = false;
                break;

            case "backspace":
                expressionInput.value = expressionInput.value.slice(0, -1);
                justCalculated = false;
                break;

            case "calculate":
                doCalculate();
                break;
        }
    });
});

function insertAtCursor(text) {
    const input = expressionInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const current = input.value;
    input.value = current.slice(0, start) + text + current.slice(end);
    const newPos = start + text.length;
    input.setSelectionRange(newPos, newPos);
    input.focus();
}

expressionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        doCalculate();
    }
});

// ============ 计算 ============
async function doCalculate() {
    const expression = expressionInput.value.trim();
    if (!expression) {
        messageEl.textContent = "请输入表达式";
        return;
    }

    messageEl.textContent = "计算中...";

    try {
        const res = await fetch(`${API_BASE}/api/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression }),
        });
        const data = await res.json();

        if (!data.success) {
            resultEl.textContent = "错误：" + data.message;
            resultEl.classList.add("error");
            messageEl.textContent = "";
            justCalculated = false;
            return;
        }

        // 结果保留在屏幕上
        resultEl.textContent = "= " + data.result;
        resultEl.classList.remove("error");
        messageEl.textContent = "结果由后端返回";

        // 标记：刚计算完，算式和结果都保留
        justCalculated = true;

        loadHistory();
    } catch (err) {
        resultEl.textContent = "无法连接后端服务";
        resultEl.classList.add("error");
        messageEl.textContent = "请确认后端已启动";
        justCalculated = false;
    }
}

// ============ 历史记录 ============
async function loadHistory() {
    historyLoading.style.display = "block";
    historyEmpty.style.display = "none";
    try {
        const res = await fetch(`${API_BASE}/api/history`);
        const data = await res.json();
        historyLoading.style.display = "none";
        if (!data.success) {
            historyEmpty.textContent = "加载历史失败";
            historyEmpty.style.display = "block";
            return;
        }
        renderHistory(data.history);
    } catch (err) {
        historyLoading.style.display = "none";
        historyEmpty.textContent = "无法连接后端服务";
        historyEmpty.style.display = "block";
    }
}

function renderHistory(records) {
    historyList.innerHTML = "";
    if (!records || records.length === 0) {
        historyEmpty.style.display = "block";
        return;
    }
    historyEmpty.style.display = "none";

    records.forEach((rec) => {
        const li = document.createElement("li");
        li.className = "history-item";

        const info = document.createElement("div");
        info.className = "history-info";

        const expr = document.createElement("div");
        expr.className = "history-expr";
        expr.textContent = rec.expression;

        const result = document.createElement("div");
        result.className = "history-result";
        result.textContent = "= " + rec.result;

        const time = document.createElement("div");
        time.className = "history-time";
        time.textContent = rec.created_at;

        info.appendChild(expr);
        info.appendChild(result);
        info.appendChild(time);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-delete";
        delBtn.textContent = "✕";
        delBtn.title = "删除这条记录";
        delBtn.addEventListener("click", () => deleteHistory(rec.id));

        li.appendChild(info);
        li.appendChild(delBtn);
        historyList.appendChild(li);
    });
}

async function deleteHistory(id) {
    if (!confirm(`确定要删除这条记录吗？（id=${id}）`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/history/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.success) { alert("删除失败：" + data.message); return; }
        loadHistory();
    } catch (err) {
        alert("删除失败，无法连接后端");
    }
}

clearHistoryBtn.addEventListener("click", async () => {
    if (!confirm("确定要清空全部历史吗？")) return;
    try {
        const res = await fetch(`${API_BASE}/api/history`, { method: "DELETE" });
        const data = await res.json();
        if (!data.success) { alert("清空失败：" + data.message); return; }
        loadHistory();
    } catch (err) {
        alert("清空失败，无法连接后端");
    }
});

// ============ 初始化 ============
loadHistory();