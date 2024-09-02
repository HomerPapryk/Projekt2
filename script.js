let transactions = [];
let chartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  navigateTo("home");
  generateDates();
  updateIconOptions();
});

function generateDates() {
  const dateSelector = document.getElementById("date-selector");
  const today = new Date();

  for (let i = -1; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = date.toLocaleString("en-US", { weekday: "short" });
    const dayNum = date.getDate();

    const dateItem = document.createElement("div");
    dateItem.classList.add("date-item");
    if (i === 0) dateItem.classList.add("selected");

    dateItem.textContent = `${dayNum} ${day}`;
    dateSelector.appendChild(dateItem);

    dateItem.addEventListener("click", function () {
      document
        .querySelectorAll(".date-item")
        .forEach((item) => item.classList.remove("selected"));
      dateItem.classList.add("selected");
    });
  }
}

function navigateTo(section) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  document.getElementById(section + "-page").classList.add("active");

  if (section === "chart") {
    updateChart();
  }
}

function showAddTransactionModal(isNewTransaction = true) {
  const modal = document.getElementById("transaction-modal");
  const app = document.querySelector(".app");

  app.classList.add("blur");
  modal.style.display = "flex";

  if (isNewTransaction) {
    document.getElementById("transaction-amount-display").innerText = "0.00"; // Reset amount display tylko dla nowych transakcji
  }

  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

function closeTransactionModal() {
  const modal = document.getElementById("transaction-modal");
  const app = document.querySelector(".app");

  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    app.classList.remove("blur");
  }, 300);
}

function toggleTransactionType(type) {
  const expensesButton = document.getElementById("modal-expenses-button");
  const incomeButton = document.getElementById("modal-income-button");

  expensesButton.classList.toggle("active", type === "expenses");
  incomeButton.classList.toggle("active", type === "income");

  updateIconOptions(type);
}

document
  .getElementById("modal-expenses-button")
  .addEventListener("click", () => {
    toggleTransactionType("expenses");
  });

document.getElementById("modal-income-button").addEventListener("click", () => {
  toggleTransactionType("income");
});

function updateIconOptions(type = "expenses") {
  const iconSelect = document.getElementById("transaction-icon");
  iconSelect.innerHTML = "";

  const icons = {
    expenses: [
      { name: "Jedzenie", path: "Iconsexpenses/Jedzenie.svg" },
      { name: "Zakupy", path: "Iconsexpenses/Zakupy.svg" },
      { name: "Samochód", path: "Iconsexpenses/Samochód.svg" },
      { name: "Czynsz", path: "Iconsexpenses/Czynsz.svg" },
      { name: "Zdrowie", path: "Iconsexpenses/Zdrowie.svg" },
      { name: "Edukacja", path: "Iconsexpenses/Edukacja.svg" },
      { name: "Rozrywka", path: "Iconsexpenses/Rozrywka.svg" },
      { name: "Paliwo", path: "Iconsexpenses/Paliwo.svg" },
      { name: "Opłaty", path: "Iconsexpenses/Opłaty.svg" },
    ],
    income: [
      { name: "Wynagrodzenie", path: "Iconsincome/Wynagordzenie.svg" },
      { name: "Premia", path: "Iconsincome/Premia.svg" },
    ],
  };

  icons[type].forEach((icon) => {
    const option = document.createElement("option");
    option.value = icon.path;
    option.innerText = icon.name;
    iconSelect.appendChild(option);
  });

  if (iconSelect.options.length > 0) {
    document.getElementById("icon-preview").src = iconSelect.value;
  }
}

document
  .getElementById("transaction-icon")
  .addEventListener("change", function () {
    document.getElementById("icon-preview").src = this.value;
  });

function addTransaction() {
  const amountDisplay = document.getElementById(
    "transaction-amount-display"
  ).innerText;
  const amount = parseFloat(amountDisplay);

  if (isNaN(amount) || amount <= 0) {
    alert("Proszę wprowadzić kwotę");
    return;
  }

  const type =
    document.querySelector(".transaction-type-switch button.active").id ===
    "modal-expenses-button"
      ? "expense"
      : "income";
  const icon = document.getElementById("transaction-icon").value;
  const description =
    document.getElementById("transaction-description").value || "Bez opisu";
  const date = document.querySelector(".date-item.selected").textContent;

  transactions.push({
    amount: amount.toFixed(2),
    type: type,
    icon: icon,
    description: description,
    date: date,
  });

  updateUI();
  closeTransactionModal();
}

function updateUI() {
  const transactionList = document.getElementById("transaction-list");
  transactionList.innerHTML = "";

  // Sortowanie transakcji od najnowszej do najstarszej
  const sortedTransactions = transactions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Sortowanie malejące
  });

  let lastDate = null;

  sortedTransactions.forEach((transaction, index) => {
    const currentDate = transaction.date;

    if (currentDate !== lastDate) {
      // Dodaj nagłówek daty, jeśli się zmieniła
      const dateHeader = document.createElement("div");
      dateHeader.classList.add("transaction-date-header");
      dateHeader.innerText = currentDate;
      transactionList.appendChild(dateHeader);
      lastDate = currentDate;
    }

    const listItem = document.createElement("li");
    listItem.classList.add("transaction-item");
    listItem.innerHTML = `
      <div class="transaction-details">
        <img src="${transaction.icon}" alt="Ikona" class="icon" />
        <div class="transaction-info">
          <span>${transaction.description}</span>
        </div>
      </div>
      <span class="transaction-amount">${transaction.amount} PLN</span>
      <div class="actions">
        <i class="fas fa-edit" onclick="editTransaction(${index})"></i>
        <i class="fas fa-trash-alt" onclick="deleteTransaction(${index})"></i>
      </div>
    `;
    transactionList.appendChild(listItem);
  });

  updateBalance();
  updateChart();
}

function editTransaction(index) {
  const transaction = transactions[index];
  document.getElementById("transaction-amount-display").innerText =
    transaction.amount;
  toggleTransactionType(transaction.type === "expense" ? "expenses" : "income");
  document.getElementById("transaction-icon").value = transaction.icon;
  document.getElementById("icon-preview").src = transaction.icon; // Aktualizacja podglądu ikony
  document.getElementById("transaction-description").value =
    transaction.description;

  // Ustaw indeks edytowanej transakcji
  document.getElementById("edit-index").value = index;

  // Pokaż modal bez resetowania kwoty
  showAddTransactionModal(false);
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  updateUI();
}

function updateBalance() {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpense;

  document.getElementById("total-balance").innerText = `${balance.toFixed(
    2
  )} PLN`;
  document.getElementById("wallet-balance").innerText = `${balance.toFixed(
    2
  )} PLN`;
  document.getElementById("chart-balance").innerText = `${balance.toFixed(
    2
  )} PLN`;

  let balanceMessage = "";
  if (balance > 0) {
    balanceMessage = `Możesz jeszcze wydać ${balance.toFixed(2)} złotych`;
  } else if (balance === 0) {
    balanceMessage = "Bilans wynosi zero";
  } else {
    balanceMessage = `Bilans jest ujemny. Jesteś na minusie ${Math.abs(
      balance
    ).toFixed(2)} złotych`;
  }
  document.getElementById("balance-message").innerText = balanceMessage;
}

function updateChart() {
  const ctx = document.getElementById("expense-chart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const expenseData = transactions
    .filter((transaction) => transaction.type === "expense")
    .map((transaction) => ({
      amount: parseFloat(transaction.amount),
      category: transaction.icon,
    }));

  const categories = [...new Set(expenseData.map((t) => t.category))];
  const expenses = categories.map((category) =>
    expenseData
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const categoryNames = {
    "Iconsexpenses/Jedzenie.svg": "Jedzenie",
    "Iconsexpenses/Zakupy.svg": "Zakupy",
    "Iconsexpenses/Samochód.svg": "Samochód",
    "Iconsexpenses/Czynsz.svg": "Czynsz",
    "Iconsexpenses/Zdrowie.svg": "Zdrowie",
    "Iconsexpenses/Edukacja.svg": "Edukacja",
    "Iconsexpenses/Rozrywka.svg": "Rozrywka",
    "Iconsexpenses/Paliwo.svg": "Paliwo",
    "Iconsexpenses/Opłaty.svg": "Opłaty",
  };

  const friendlyLabels = categories.map((category) => categoryNames[category]);

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];

  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: friendlyLabels,
      datasets: [
        {
          data: expenses,
          backgroundColor: colors.slice(0, categories.length),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || "";

              if (label) {
                label += ": ";
              }
              if (context.parsed !== null) {
                label += context.parsed + " PLN";
              }
              return label;
            },
          },
        },
      },
    },
  });

  createCustomLegend(categories, colors);
}

function createCustomLegend(categories, colors) {
  const legendContainer = document.getElementById("chart-legend");
  legendContainer.innerHTML = "";

  categories.forEach((category, index) => {
    const legendItem = document.createElement("div");
    legendItem.style.display = "flex";
    legendItem.style.alignItems = "center";
    legendItem.style.marginBottom = "8px";

    const colorBox = document.createElement("span");
    colorBox.style.backgroundColor = colors[index];
    colorBox.style.width = "20px";
    colorBox.style.height = "20px";
    colorBox.style.display = "inline-block";
    colorBox.style.marginRight = "8px";

    const icon = document.createElement("img");
    icon.src = category;
    icon.style.width = "20px";
    icon.style.height = "20px";
    icon.style.marginRight = "8px";

    legendItem.appendChild(colorBox);
    legendItem.appendChild(icon);
    legendContainer.appendChild(legendItem);
  });
}

document.querySelectorAll(".key").forEach((key) => {
  key.addEventListener("click", () => {
    let amountDisplay = document.getElementById("transaction-amount-display");
    let currentAmount =
      amountDisplay.innerText === "0.00" ? "" : amountDisplay.innerText;

    if (key.innerHTML === "&#10004;" || key.innerHTML === "✔") {
      addTransaction();
    } else if (key.innerText === "C") {
      amountDisplay.innerText = "0.00";
    } else if (key.innerText === "←") {
      amountDisplay.innerText = currentAmount.slice(0, -1) || "0.00";
    } else {
      if (
        currentAmount.includes(".") &&
        currentAmount.split(".")[1].length >= 2
      ) {
        return;
      }
      amountDisplay.innerText =
        (currentAmount + key.innerText).replace(/^0+/, "") || "0.00";
    }
  });
});

function switcher() {
  document.body.classList.toggle("dark-mode");
}

function filterTransactions(type) {
  const transactionList = document.getElementById("wallet-transaction-list");
  transactionList.innerHTML = "";

  document.querySelectorAll(".wallet-button").forEach((button) => {
    button.classList.remove("active");
  });

  if (type === "expense") {
    document.getElementById("expense-button").classList.add("active");
  } else if (type === "income") {
    document.getElementById("income-button").classList.add("active");
  } else {
    document.getElementById("all-button").classList.add("active");
  }

  const filteredTransactions =
    type === "all" ? transactions : transactions.filter((t) => t.type === type);

  // Sortowanie transakcji od najnowszej do najstarszej
  const sortedTransactions = filteredTransactions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Sortowanie malejące
  });

  let lastDate = null;

  sortedTransactions.forEach((transaction) => {
    const currentDate = transaction.date;

    if (currentDate !== lastDate) {
      // Dodaj nagłówek daty, jeśli się zmieniła
      const dateHeader = document.createElement("div");
      dateHeader.classList.add("transaction-date-header");
      dateHeader.innerText = currentDate;
      transactionList.appendChild(dateHeader);
      lastDate = currentDate;
    }

    const listItem = document.createElement("li");
    listItem.classList.add("transaction-item");
    listItem.innerHTML = `
      <div class="transaction-details">
        <img src="${transaction.icon}" alt="Ikona" class="icon" />
        <div class="transaction-info">
          <span>${transaction.description}</span>
        </div>
      </div>
      <span class="transaction-amount">${transaction.amount} PLN</span>
    `;
    transactionList.appendChild(listItem);
  });
}
