// =============================================
// Expense & Budget Visualizer — App Logic
// =============================================

// ===== STATE =====
const STORAGE_KEY = "expense-transactions";
let transactions = loadTransactions();
let chart = null;

// ===== ELEMEN DOM =====
const form = document.getElementById("transaction-form");
const nameInput = document.getElementById("item-name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const errorText = document.getElementById("form-error");
const totalBalance = document.getElementById("total-balance");
const list = document.getElementById("transaction-list");

// ===== UTILITAS =====
function formatMoney(value) {
  return "$" + value.toFixed(2);
}

// ===== LOCAL STORAGE =====
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return []; // data rusak: mulai dari kosong
  }
}

// ===== TAMBAH TRANSAKSI =====
function addTransaction(event) {
  event.preventDefault(); // cegah halaman reload saat form disubmit

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  // Validasi: semua field harus terisi
  if (name === "" || isNaN(amount) || amount <= 0 || category === "") {
    errorText.textContent = "Please fill in all fields with valid values.";
    return;
  }
  errorText.textContent = "";

  transactions.push({
    id: Date.now().toString(),
    name: name,
    amount: amount,
    category: category,
  });

  saveTransactions();
  form.reset();
  render();
}

// ===== HAPUS TRANSAKSI =====
function deleteTransaction(id) {
  transactions = transactions.filter(function (t) {
    return t.id !== id;
  });

  saveTransactions();
  render();
}

// ===== RENDER BAGIAN-BAGIAN =====
function renderList() {
  list.innerHTML = "";

  if (transactions.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No transactions yet.";
    list.appendChild(empty);
    return;
  }

  transactions.forEach(function (t) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.textContent = t.name + " - " + formatMoney(t.amount) + " (" + t.category + ")";

    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.dataset.id = t.id; // simpan id di tombol

    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderBalance() {
  let total = 0;
  transactions.forEach(function (t) {
    total += t.amount;
  });
  totalBalance.textContent = formatMoney(total);
}

function initChart() {
  const ctx = document.getElementById("spending-chart");
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Food", "Transport", "Fun"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ["#2ecc71", "#3498db", "#e67e22"],
        },
      ],
    },
  });
}

function renderChart() {
  const totals = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach(function (t) {
    totals[t.category] += t.amount;
  });
  chart.data.datasets[0].data = [totals.Food, totals.Transport, totals.Fun];
  chart.update();
}

// ===== FUNGSI UTAMA =====
function render() {
  renderList();
  renderBalance();
  renderChart();
}

// ===== EVENT LISTENER =====
form.addEventListener("submit", addTransaction);

// Satu listener untuk semua tombol Delete (event delegation)
list.addEventListener("click", function (event) {
  if (event.target.tagName === "BUTTON") {
    deleteTransaction(event.target.dataset.id);
  }
});

// ===== MULAI =====
initChart();
render();