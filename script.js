const categoryNames = {
  "Iconsexpenses/Food.svg": "Food",
  "Iconsexpenses/Shopping.svg": "Shopping",
  "Iconsexpenses/Car.svg": "Car",
  "Iconsexpenses/Rent.svg": "Rent",
  "Iconsexpenses/Health.svg": "Health",
  "Iconsexpenses/Education.svg": "Education",
  "Iconsexpenses/Entertainment.svg": "Entertainment",
  "Iconsexpenses/Fuel.svg": "Fuel",
  "Iconsexpenses/Bills.svg": "Bills",
  "Iconsincome/Salary.svg": "Salary",
  "Iconsincome/Bonus.svg": "Bonus",
  "Iconsincome/SavingsAccount.svg": "Savings Account",
  "Iconsincome/Investment.svg": "Investment",
  "Iconsincome/Inheritance.svg": "Inheritance",
};

const transactionModal = document.getElementById("transaction-modal");
const transactionAmountDisplay = document.getElementById(
  "transaction-amount-display"
);

const app = document.querySelector(".app");
const homeNavButton = document.getElementById("home-nav-button");
const walletNavButton = document.getElementById("wallet-nav-button");
const addTransactionButton = document.getElementById("add-transaction-button");
const chartNavButton = document.getElementById("chart-nav-button");
const closeTransactionModalButton = document.getElementById(
  "close-transaction-modal"
);
const transactionForm = document.getElementById("transaction-form");
const expenseButton = document.getElementById("modal-expenses-button");
const incomeButton = document.getElementById("modal-income-button");
const transactionIcon = document.getElementById("transaction-icon");
const transactionDescription = document.getElementById(
  "transaction-description"
);
const editIndexInput = document.getElementById("edit-index");
const dateSelector = document.getElementById("date-selector");

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
  const dateSelector = document.getElementById("date-selector");

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

  document.getElementById(section + "-page").classList.add("active");

  if (section === "wallet") {
    const activeFilter = document
      .querySelector(".wallet-button.active")
      .id.replace("-button", "");
    filterTransactions(activeFilter);
  }

  if (section === "chart") {
    updateChart();
  }
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
      { name: "Food", path: "Iconsexpenses/Food.svg" },
      { name: "Shopping", path: "Iconsexpenses/Shopping.svg" },
      { name: "Car", path: "Iconsexpenses/Car.svg" },
      { name: "Rent", path: "Iconsexpenses/Rent.svg" },
      { name: "Health", path: "Iconsexpenses/Health.svg" },
      { name: "Education", path: "Iconsexpenses/Education.svg" },
      { name: "Entertainment", path: "Iconsexpenses/Entertainment.svg" },
      { name: "Fuel", path: "Iconsexpenses/Fuel.svg" },
      { name: "Bills", path: "Iconsexpenses/Bills.svg" },
    ],
    income: [
      { name: "Salary", path: "Iconsincome/Salary.svg" },
      { name: "Bonus", path: "Iconsincome/Bonus.svg" },
      { name: "Savings Account", path: "Iconsincome/SavingsAccount.svg" },
      { name: "Investment", path: "Iconsincome/Investment.svg" },
      { name: "Inheritance", path: "Iconsincome/Inheritance.svg" },
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
  document.getElementById("icon-preview").src = transactionIcon.value;
}

function handleTransactionSubmit(event) {
  event.preventDefault();
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
  const transactionList = document.getElementById("transaction-list");
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

  updateChart();
  updateBalance();
}

function filterTransactions(type) {
  const transactionList = document.getElementById("wallet-transaction-list");
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

  let lastDate = null;

  sortedTransactions.forEach((transaction, index) => {
    const currentDate = transaction.date;

    // Zaktualizowana linia formatowania daty
    const formattedDate = formatDateForDisplay(currentDate);

    if (currentDate !== lastDate) {
      const dateHeader = document.createElement("div");
      dateHeader.classList.add("transaction-date-header");
      dateHeader.innerText = formattedDate; // Używamy sformatowanej daty
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
  updateUI();
  saveTransactions();

  const activeFilter = document
    .querySelector(".wallet-button.active")
    .id.replace("-button", "");
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

Chart.register({
  id: "centerTextPlugin",
  beforeDraw: function (chart) {
    const ctx = chart.ctx;
    const width = chart.width;
    const height = chart.height;

    const totalIncome = chart.config._config.incomeData.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalExpense = chart.config._config.expenseData.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const percentageUsed = totalIncome
      ? ((totalExpense / totalIncome) * 100).toFixed(0)
      : 0;

    const expenseColor = "#FF4D4D";
    const incomeColor = "#2e8b57 ";
    const percentageColor = document.body.classList.contains("dark-mode")
      ? "#ffffff"
      : "#333333";

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 3em Segoe UI";

    ctx.fillStyle = percentageColor;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.fillText(percentageUsed + "%", centerX, centerY - 10);

    ctx.font = "1.4em Segoe UI";

    ctx.fillStyle = expenseColor;
    ctx.fillText(totalExpense.toFixed(2) + " PLN", centerX, centerY + 30);

    ctx.font = "1.1em Segoe UI";
    ctx.fillStyle = incomeColor;
    ctx.fillText(totalIncome.toFixed(2) + " PLN", centerX, centerY + 60);

    ctx.restore();
  },
});

function createLegend(groupedTransactions, chart) {
  const legendContainer = document.getElementById("chart-legend");
  legendContainer.innerHTML = "";

  Object.values(groupedTransactions).forEach((transaction, index) => {
    const categoryIconPath = Object.keys(categoryNames).find(
      (key) => categoryNames[key] === transaction.category
    );

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

function updateChart() {
  const ctx = document.getElementById("expense-chart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
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

  const allCategories = [
    ...expenseData.map((t) => t.category),
    ...incomeData.map((t) => t.category),
  ];
  const allAmounts = [
    ...expenseData.map((t) => t.amount),
    ...incomeData.map((t) => t.amount),
  ];

  const colors = {
    Food: "#FF6666",
    Shopping: "#FF9999",
    Car: "#FF8080",
    Rent: "#FFB3B3",
    Health: "#FF4D4D",
    Education: "#FF1A1A",
    Entertainment: "#FFA6A6",
    Fuel: "#FFCCCC",
    Bills: "#FF5252",
    Salary: "#99FF99",
    Bonus: "#66FF66",
    "Savings Account": "#80FF80",
    Investment: "#4DFF4D",
    Inheritance: "#33FF33",
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
          cutout: "70%",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 2000, easing: "easeOutBounce" },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw} PLN`;
            },
          },
        },
      },
    },
    incomeData: incomeData,
    expenseData: expenseData,
  });

  createLegend(groupedTransactions, chartInstance);
}
document;

function filterTransactions(type) {
  const transactionList = document.getElementById("wallet-transaction-list");
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

document.addEventListener("keydown", function (event) {
  const isDescriptionFocused =
    document.activeElement ===
    document.getElementById("transaction-description");

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

function filterTransactions(type) {
  const transactionList = document.getElementById("wallet-transaction-list");
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

  let lastDate = null;

  sortedTransactions.forEach((transaction, index) => {
    const currentDate = transaction.date;

    if (currentDate !== lastDate) {
      const dateHeader = document.createElement("div");
      dateHeader.classList.add("transaction-date-header");
      dateHeader.innerText = currentDate;
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
}

function addTransaction() {
  const amount = parseFloat(transactionAmountDisplay.innerText);
  const description = transactionDescription.value.trim();

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

  transactions.push(transactionData);
  updateUI();
  saveTransactions();
  closeTransactionModal();

  const activeFilter = document
    .querySelector(".wallet-button.active")
    .id.replace("-button", "");
  filterTransactions(activeFilter);

  updateChart();
}

document.getElementById("expense-button").addEventListener("click", () => {
  filterTransactions("expense");
  activateButton("expense-button");
});
document.getElementById("income-button").addEventListener("click", () => {
  filterTransactions("income");
  activateButton("income-button");
});
document.getElementById("all-button").addEventListener("click", () => {
  filterTransactions("all");
  activateButton("all-button");
});

function activateButton(buttonId) {
  document.querySelectorAll(".wallet-button").forEach((button) => {
    button.classList.remove("active");
  });
  document.getElementById(buttonId).classList.add("active");
}

const themeToggle = document.querySelector(".theme-toggle");
const bodyClassList = document.body.classList;
const sunnyIcon = document.getElementById("sunny");
const moonIcon = document.getElementById("moon");

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
}
