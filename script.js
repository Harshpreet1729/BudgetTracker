const form = document.getElementById("transaction-form");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transaction-list");
const balanceDisplay = document.getElementById("balance");
const monthSummaryList = document.getElementById("month-total-list");
const sortSelect = document.getElementById("sort");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  renderMonthlyTotals();
  updateBalance();
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;

  if (!name || isNaN(amount) || !date) return;
  transactions.push({ name, amount, date });
  form.reset();
  saveAndRender();
});

sortSelect.addEventListener("change", saveAndRender);
function renderTransactions() {
  let data = [...transactions];

  if (sortSelect.value === "asc") {
    data.sort((a, b) => a.amount - b.amount);
  } else if (sortSelect.value === "desc") {
    data.sort((a, b) => b.amount - a.amount);
  }
  transactionList.innerHTML = "";
  data.forEach((tx) => {
    const index = transactions.indexOf(tx);
    const li = document.createElement("li");
    li.className = tx.amount >= 0 ? "income" : "expense";
    li.innerHTML =`
      <div class="transaction-item">
        <span class="tx-name">${tx.name}</span>
        <span class="tx-amount">₹${tx.amount}</span>
        <span class="tx-date">${tx.date}</span>
        <button onclick="deleteTransaction(${index})">🗑</button>
      </div>
    `;
    transactionList.appendChild(li);
  });
}

function updateBalance() {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  balanceDisplay.textContent = `Amount Left: ₹${total.toFixed(2)}`;
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveAndRender();
}

function renderMonthlyTotals() {
  const monthMap = {};

  transactions.forEach(tx => {
    if (!tx.date) return;
    const month = tx.date.slice(0, 7);

    if (!monthMap[month]) {
      monthMap[month] = { income: 0, expense: 0 };
    }
    if (tx.amount>=0) {
      monthMap[month].income += tx.amount;
    }
    else {
      monthMap[month].expense += tx.amount;
    }
  });

  monthSummaryList.innerHTML = "";

  for (let month in monthMap) {
    const { income, expense } = monthMap[month];
    const prettyMonth = new Date(month + "-01").toLocaleString("en-IN", {
      month: "long",
      year: "numeric"
    });

    const li = document.createElement("li");
    li.innerHTML = `${prettyMonth}➡️
      <span style="color:lime">+ ₹${income.toFixed(2)}</span> / 
      <span style="color:red">- ₹${Math.abs(expense).toFixed(2)}</span>`;
    monthSummaryList.appendChild(li);
  }
}
saveAndRender();