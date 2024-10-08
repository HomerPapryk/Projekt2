const categoryNames = {
  "Iconsexpenses/Food.svg": "Jedzenie",
  "Iconsexpenses/Shopping.svg": "Zakupy",
  "Iconsexpenses/Car.svg": "Samochód",
  "Iconsexpenses/Rent.svg": "Czynsz",
  "Iconsexpenses/Health.svg": "Zdrowie",
  "Iconsexpenses/Education.svg": "Edukacja",
  "Iconsexpenses/Entertainment.svg": "Rozrywka",
  "Iconsexpenses/Fuel.svg": "Paliwo",
  "Iconsexpenses/Bills.svg": "Rachunki",
  "Iconsincome/Salary.svg": "Wynagrodzenie",
  "Iconsincome/Bonus.svg": "Premia",
  "Iconsincome/SavingsAccount.svg": "Konto Oszczędnościowe",
  "Iconsincome/Investment.svg": "Inwestycja",
  "Iconsincome/Inheritance.svg": "Spadek",
};

const transactionModal = document.querySelector(".transaction-modal");
const transactionAmountDisplay = document.querySelector(
  ".transaction-amount-display"
);

const homeNavButton = document.querySelector(".home-nav-button");
const walletNavButton = document.querySelector(".wallet-nav-button");
const addTransactionButton = document.querySelector(".add-transaction-button");
const chartNavButton = document.querySelector(".chart-nav-button");
const closeTransactionModalButton = document.querySelector(
  ".close-transaction-modal"
);
const transactionForm = document.querySelector(".transaction-form");
const expenseButton = document.querySelector(".modal-expenses-button");
const incomeButton = document.querySelector(".modal-income-button");
const transactionIcon = document.querySelector(".transaction-icon");
const transactionDescription = document.querySelector(
  ".transaction-description"
);
const app = document.querySelector(".app");
const editIndexInput = document.querySelector(".edit-index");
const dateSelector = document.querySelector(".date-selector");

let transactions = [];
let chartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  loadTransactions();
  navigateTo("home");
  generateDates();
  updateIconOptions();
});

homeNavButton.addEventListener("click", () => navigateTo("home"));
walletNavButton.addEventListener("click", () => navigateTo("wallet"));
addTransactionButton.addEventListener("click", () =>
  showAddTransactionModal(false)
);
chartNavButton.addEventListener("click", () => navigateTo("chart"));
closeTransactionModalButton.addEventListener("click", closeTransactionModal);
expenseButton.addEventListener("click", () =>
  toggleTransactionType("expenses")
);
incomeButton.addEventListener("click", () => toggleTransactionType("income"));
transactionForm.addEventListener("submit", handleTransactionSubmit);
transactionIcon.addEventListener("change", updateIconPreview);

function generateDates() {
  const today = new Date();

  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  const formattedDate = today.toLocaleDateString("pl-PL", options);

  const dateDisplay = document.createElement("div");
  dateDisplay.classList.add("date-display");
  dateDisplay.textContent = formattedDate;

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = today.toISOString().substr(0, 10);
  dateInput.max = today.toISOString().substr(0, 10);

  dateDisplay.setAttribute("data-date", dateInput.value);

  dateInput.style.display = "none";

  dateSelector.innerHTML = "";
  dateSelector.appendChild(dateDisplay);
  dateSelector.appendChild(dateInput);

  dateDisplay.addEventListener("click", function () {
    dateInput.style.display = "block";
    dateInput.focus();
    dateDisplay.style.display = "none";
  });

  dateInput.addEventListener("change", function () {
    const selectedDate = new Date(dateInput.value);
    const newFormattedDate = selectedDate.toLocaleDateString("pl-PL", options);

    dateDisplay.textContent = newFormattedDate;
    dateDisplay.setAttribute("data-date", dateInput.value);
    dateInput.style.display = "none";
    dateDisplay.style.display = "block";
  });
}

function navigateTo(section) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  document.querySelector(`.${section}-page`).classList.add("active");

  if (section === "wallet") {
    const activeFilter = document
      .querySelector(".wallet-button.active")
      .classList[1].replace("-button", "");
    filterTransactions(activeFilter);
  }

  if (section === "chart") {
    updateChart();
  }

  updateBalance();
}

function showAddTransactionModal(isEdit) {
  if (!isEdit) {
    resetForm();
  }
  transactionModal.style.display = "flex";
  setTimeout(() => {
    transactionModal.classList.add("show");
    app.classList.add("blur");
  }, 10);
}

function closeTransactionModal() {
  transactionModal.classList.remove("show");
  setTimeout(() => {
    transactionModal.style.display = "none";
    app.classList.remove("blur");
  }, 300);
}

function resetForm() {
  transactionAmountDisplay.innerText = "0.00";
  transactionDescription.value = "";
  transactionIcon.selectedIndex = 0;
  editIndexInput.value = "";
  toggleTransactionType("expenses");
  generateDates();
}

function toggleTransactionType(type) {
  const isExpense = type === "expenses";
  expenseButton.classList.toggle("active", isExpense);
  incomeButton.classList.toggle("active", !isExpense);
  updateIconOptions(type);
}

function updateIconOptions(type = "expenses") {
  const icons = {
    expenses: [
      { name: "Jedzenie", path: "Iconsexpenses/Food.svg" },
      { name: "Zakupy", path: "Iconsexpenses/Shopping.svg" },
      { name: "Samochód", path: "Iconsexpenses/Car.svg" },
      { name: "Czynsz", path: "Iconsexpenses/Rent.svg" },
      { name: "Zdrowie", path: "Iconsexpenses/Health.svg" },
      { name: "Edukacja", path: "Iconsexpenses/Education.svg" },
      { name: "Rozrywka", path: "Iconsexpenses/Entertainment.svg" },
      { name: "Paliwo", path: "Iconsexpenses/Fuel.svg" },
      { name: "Rachunki", path: "Iconsexpenses/Bills.svg" },
    ],
    income: [
      { name: "Wynagrodzenie", path: "Iconsincome/Salary.svg" },
      { name: "Premia", path: "Iconsincome/Bonus.svg" },
      { name: "Konto Oszczędnościowe", path: "Iconsincome/SavingsAccount.svg" },
      { name: "Inwestycja", path: "Iconsincome/Investment.svg" },
      { name: "Spadek", path: "Iconsincome/Inheritance.svg" },
    ],
  };

  transactionIcon.innerHTML = "";

  icons[type].forEach((icon) => {
    const option = document.createElement("option");
    option.value = icon.path;
    option.innerText = icon.name;
    transactionIcon.appendChild(option);
  });

  updateIconPreview();
}

function updateIconPreview() {
  document.querySelector(".icon-preview").src = transactionIcon.value;
}

function handleTransactionSubmit(event) {
  event.preventDefault();

  const amount = parseFloat(transactionAmountDisplay.innerText);
  const description = transactionDescription.value.trim();
  const type = expenseButton.classList.contains("active")
    ? "expense"
    : "income";

  if (isNaN(amount) || amount <= 0) {
    alert("Proszę wprowadzić poprawną kwotę.");
    return;
  }

  if (!description) {
    alert("Proszę wprowadzić opis.");
    return;
  }

  addTransaction();
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
  const storedTransactions = localStorage.getItem("transactions");
  if (storedTransactions) {
    transactions = JSON.parse(storedTransactions);
    updateUI();
  }
}

function updateUI() {
  const transactionList = document.querySelector(".transaction-list");
  transactionList.innerHTML = "";

  const sortedTransactions = transactions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  let lastDate = null;

  sortedTransactions.forEach((transaction, index) => {
    const currentDate = transaction.date;

    if (currentDate !== lastDate) {
      const dateHeader = document.createElement("div");
      dateHeader.classList.add("transaction-date-header");
      const formattedDate = formatDateForDisplay(currentDate);
      dateHeader.innerText = formattedDate;
      transactionList.appendChild(dateHeader);
      lastDate = currentDate;
    }

    const listItem = document.createElement("li");
    listItem.classList.add("transaction-item");

    const amountClass =
      transaction.type === "income" ? "income-amount" : "expense-amount";

    listItem.innerHTML = `
      <div class="transaction-details">
        <img src="${transaction.icon}" alt="Ikona" class="icon" />
        <div class="transaction-info">
          <span>${transaction.description}</span>
        </div>
      </div>
      <span class="transaction-amount ${amountClass}">${transaction.amount} PLN</span>
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

function filterTransactions(type) {
  const transactionList = document.querySelector(".wallet-transaction-list");
  transactionList.innerHTML = "";

  const filteredTransactions =
    type === "all"
      ? transactions
      : transactions.filter((transaction) => transaction.type === type);

  const sortedTransactions = filteredTransactions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  sortedTransactions.forEach((transaction, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add("transaction-item");

    const amountClass =
      transaction.type === "income" ? "income-amount" : "expense-amount";

    listItem.innerHTML = `
      <div class="transaction-details">
        <img src="${transaction.icon}" alt="Ikona" class="icon" />
        <div class="transaction-info">
          <span>${transaction.description}</span>
        </div>
      </div>
      <span class="transaction-amount ${amountClass}">${transaction.amount} PLN</span>
      <div class="actions">
        <i class="fas fa-edit" onclick="editTransaction(${index})"></i>
        <i class="fas fa-trash-alt" onclick="deleteTransaction(${index})"></i>
      </div>
    `;

    transactionList.appendChild(listItem);
  });

  updateBalance();
}

function editTransaction(index) {
  const transaction = transactions[index];
  transactionAmountDisplay.innerText = transaction.amount;
  toggleTransactionType(transaction.type === "expense" ? "expenses" : "income");
  transactionIcon.value = transaction.icon;
  updateIconPreview();
  transactionDescription.value = transaction.description;
  editIndexInput.value = index;

  showAddTransactionModal(true);
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveTransactions();

  updateUI();
  updateBalance();
  updateChart();

  const activeFilter = document
    .querySelector(".wallet-button.active")
    .classList[1].replace("-button", "");
  filterTransactions(activeFilter);
}

function updateBalance() {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpense;

  document.querySelector(".total-balance").innerText = `${balance.toFixed(
    2
  )} PLN`;
  document.querySelector(".wallet-balance").innerText = `${balance.toFixed(
    2
  )} PLN`;
  document.querySelector(".chart-balance").innerText = `${balance.toFixed(
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
  document.querySelector(".balance-message").innerText = balanceMessage;
}

function formatDateForDisplay(isoDate) {
  const date = new Date(isoDate);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  };
  return date.toLocaleDateString("pl-PL", options);
}

function addTransaction() {
  const amount = parseFloat(transactionAmountDisplay.innerText);
  const description = transactionDescription.value.trim();
  const index = editIndexInput.value;

  if (isNaN(amount) || amount <= 0) {
    alert("Proszę wprowadzić kwotę.");
    return;
  }

  if (!description) {
    alert("Proszę dodać opis.");
    return;
  }

  const type = expenseButton.classList.contains("active")
    ? "expense"
    : "income";
  const icon = transactionIcon.value;
  const date = document
    .querySelector(".date-display")
    .getAttribute("data-date");

  const transactionData = {
    amount: amount.toFixed(2),
    type: type,
    icon: icon,
    description: description,
    date: date,
  };

  if (index) {
    transactions[index] = transactionData;
  } else {
    transactions.push(transactionData);
  }

  saveTransactions();
  closeTransactionModal();

  updateBalance();
  updateUI();
  updateChart();

  const activeFilter = document
    .querySelector(".wallet-button.active")
    .classList[1].replace("-button", "");
  filterTransactions(activeFilter);
}

function updateChart() {
  const ctx = document.querySelector(".expense-chart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy(); // Zniszcz istniejący wykres, jeśli już istnieje
  }

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const category = categoryNames[transaction.icon];
    if (!acc[category]) {
      acc[category] = {
        category: category,
        amount: 0,
        count: 0,
        type: transaction.type,
      };
    }
    acc[category].amount += parseFloat(transaction.amount);
    acc[category].count += 1;
    return acc;
  }, {});

  const expenseData = Object.values(groupedTransactions).filter(
    (t) => t.type === "expense"
  );
  const incomeData = Object.values(groupedTransactions).filter(
    (t) => t.type === "income"
  );

  const totalIncome = incomeData.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseData.reduce((sum, t) => sum + t.amount, 0);

  // Obliczenie procentów wydatków
  let percentageUsed = 0;
  if (totalIncome > 0) {
    percentageUsed = ((totalExpense / totalIncome) * 100).toFixed(0);
  }

  const allCategories = [
    ...expenseData.map((t) => t.category),
    ...incomeData.map((t) => t.category),
  ];
  const allAmounts = [
    ...expenseData.map((t) => t.amount),
    ...incomeData.map((t) => t.amount),
  ];

  const colors = {
    Jedzenie: "#FF6666",
    Zakupy: "#FF9999",
    Samochód: "#FF8080",
    Czynsz: "#FFB3B3",
    Zdrowie: "#FF4D4D",
    Edukacja: "#FF1A1A",
    Rozrywka: "#FFA6A6",
    Paliwo: "#FFCCCC",
    Rachunki: "#FF5252",
    Wynagrodzenie: "#99FF99",
    Premia: "#66FF66",
    "Konto Oszczędnościowe": "#80FF80",
    Inwestycja: "#4DFF4D",
    Spadek: "#33FF33",
  };

  const allColors = allCategories.map((category) => colors[category]);

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: allCategories,
      datasets: [
        {
          data: allAmounts,
          backgroundColor: allColors,
          borderColor: "#ffffff",
          borderWidth: 2,
          cutout: "70%", // Wycięcie w środku
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }, // Ukrycie legendy
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw.toFixed(2)} PLN`;
            },
          },
        },
      },
    },
  });

  // Aktualizacja wartości w nowym kontenerze HTML
  document.querySelector(
    ".percentage-display"
  ).innerText = `${percentageUsed}%`;
  document.querySelector(
    ".expenses-display"
  ).innerText = `${totalExpense.toFixed(2)} PLN`;
  document.querySelector(".income-display").innerText = `${totalIncome.toFixed(
    2
  )} PLN`;

  createLegend(groupedTransactions, chartInstance); // Aktualizacja legendy
}

function createLegend(groupedTransactions, chart) {
  const legendContainer = document.querySelector(".chart-legend");
  legendContainer.innerHTML = "";

  Object.values(groupedTransactions).forEach((transaction, index) => {
    const categoryIconPath = Object.keys(categoryNames).find(
      (key) => categoryNames[key] === transaction.category
    );

    if (transaction.amount === 0) {
      return;
    }

    const legendItem = document.createElement("div");
    legendItem.classList.add("legend-item");

    legendItem.innerHTML = `
      <div class="legend-icon">
        <img src="${categoryIconPath}" alt="${transaction.category}" />
      </div>
      <div class="legend-details">
        <span class="legend-category">${transaction.category}</span>
        <span>${transaction.count} ${
      transaction.count === 1 ? "Transaction" : "Transactions"
    }</span>
        <span>${transaction.amount.toFixed(2)} PLN</span>
      </div>
    `;

    legendContainer.appendChild(legendItem);

    let isHidden = false;

    legendItem.addEventListener("click", function () {
      const categoryIndex = chart.data.labels.indexOf(transaction.category);

      isHidden = !isHidden;
      chart.getDatasetMeta(0).data[categoryIndex].hidden = isHidden;

      if (isHidden) {
        legendItem.classList.add("strike-through");
      } else {
        legendItem.classList.remove("strike-through");
      }

      chart.update();
    });
  });
}

const themeToggle = document.querySelector(".theme-toggle");
const bodyClassList = document.body.classList;
const sunnyIcon = document.querySelector(".sunny");
const moonIcon = document.querySelector(".moon");

themeToggle.addEventListener("click", () => {
  if (bodyClassList.contains("dark-mode")) {
    enableLightMode();
  } else {
    enableDarkMode();
  }
  updateChart();
});

function enableDarkMode() {
  document.body.classList.add("dark-mode");
  document.body.classList.remove("light-mode");
  localStorage.setItem("theme", "dark");
  toggleIcons();
}

function enableLightMode() {
  document.body.classList.add("light-mode");
  document.body.classList.remove("dark-mode");
  localStorage.setItem("theme", "light");
  toggleIcons();
}

function toggleIcons() {
  if (bodyClassList.contains("dark-mode")) {
    sunnyIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunnyIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setThemePreference();
});

function setThemePreference() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    enableDarkMode();
  } else if (savedTheme === "light") {
    enableLightMode();
  } else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      enableDarkMode();
    } else {
      enableLightMode();
    }
  }
  updateChart();
}

document.addEventListener("keydown", function (event) {
  const isDescriptionFocused =
    document.activeElement ===
    document.querySelector(".transaction-description");

  if (!isDescriptionFocused) {
    if (!isNaN(event.key) || event.key === ".") {
      event.preventDefault();
      handleKeyClick({ target: { innerText: event.key } });
    } else if (event.key === "Enter") {
      handleTransactionSubmit(event);
    } else if (event.key === "Backspace") {
      event.preventDefault();
      handleKeyClick({ target: { innerText: "←" } });
    }
  }
});

document.querySelectorAll(".key").forEach((key) => {
  key.addEventListener("click", handleKeyClick);
});

function handleKeyClick(event) {
  const key = event.target.innerText;
  const currentAmount = transactionAmountDisplay.innerText;

  if (key === "C") {
    transactionAmountDisplay.innerText = "0.00";
  } else if (key === "←") {
    transactionAmountDisplay.innerText = currentAmount.slice(0, -1) || "0";
  } else if (key === "✔") {
    handleTransactionSubmit(event);
  } else {
    if (currentAmount === "0.00" && key !== ".") {
      transactionAmountDisplay.innerText = key;
    } else {
      transactionAmountDisplay.innerText = currentAmount + key;
    }
  }
}

document.querySelector(".expense-button").addEventListener("click", () => {
  filterTransactions("expense");
  activateButton("expense-button");
});
document.querySelector(".income-button").addEventListener("click", () => {
  filterTransactions("income");
  activateButton("income-button");
});
document.querySelector(".all-button").addEventListener("click", () => {
  filterTransactions("all");
  activateButton("all-button");
});

function activateButton(buttonClass) {
  document.querySelectorAll(".wallet-button").forEach((button) => {
    button.classList.remove("active");
  });
  document.querySelector(`.${buttonClass}`).classList.add("active");
}
