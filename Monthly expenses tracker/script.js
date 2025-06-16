const form = document.getElementById("expense-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const filterMonthInput = document.getElementById("filter-month");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const exportBtn = document.getElementById("export-csv");

const barCtx = document.getElementById("expense-chart").getContext("2d");
const pieCtx = document.getElementById("pie-chart").getContext("2d");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

let barChart;
let pieChart;

function saveToLocal() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function initCharts() {
  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Expenses by Category",
        data: [],
        backgroundColor: "rgba(0, 123, 255, 0.6)",
        borderColor: "#007bff",
        borderWidth: 1
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: [],
      datasets: [{
        label: "Distribution",
        data: [],
        backgroundColor: [
          "#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6610f2"
        ]
      }]
    },
    options: { responsive: true }
  });
}

function updateCharts(filtered) {
  const totals = {};
  let totalAmount = 0;

  filtered.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
    totalAmount += e.amount;
  });

  const labels = Object.keys(totals);
  const data = Object.values(totals);

  // Update Total
  totalDisplay.textContent = totalAmount.toFixed(2);

  // Update Bar Chart
  barChart.data.labels = labels;
  barChart.data.datasets[0].data = data;
  barChart.update();

  // Update Pie Chart
  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = data;
  pieChart.update();
}

function renderList(filtered) {
  expenseList.innerHTML = "";
  filtered.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.description} - $${e.amount.toFixed(2)} (${e.category}) [${e.date}]`;
    expenseList.appendChild(li);
  });
}

function filterExpensesByMonth(month) {
  if (!month) return expenses;
  return expenses.filter(e => e.date.startsWith(month));
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const expense = {
    description: descriptionInput.value.trim(),
    amount: parseFloat(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value
  };

  if (!expense.description || isNaN(expense.amount) || !expense.category || !expense.date) return;

  expenses.push(expense);
  saveToLocal();

  form.reset();
  categoryInput.selectedIndex = 0;

  const month = filterMonthInput.value;
  const filtered = filterExpensesByMonth(month);
  renderList(filtered);
  updateCharts(filtered);
});

filterMonthInput.addEventListener("input", () => {
  const filtered = filterExpensesByMonth(filterMonthInput.value);
  renderList(filtered);
  updateCharts(filtered);
});

exportBtn.addEventListener("click", () => {
  const rows = [["Description", "Amount", "Category", "Date"]];
  expenses.forEach(e => rows.push([e.description, e.amount, e.category, e.date]));

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
});

// Initial load
initCharts();
const initial = filterExpensesByMonth(filterMonthInput.value);
renderList(initial);
updateCharts(initial);

