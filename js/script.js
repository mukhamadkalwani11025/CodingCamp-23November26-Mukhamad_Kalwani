// =============================================
// Expense & Budget Visualizer — App Logic
// =============================================

// ===== STATE =====
const STORAGE_KEY = "expense-transactions";
const LIMIT_KEY = "expense-limit";
const THEME_KEY = "expense-dark-mode";

let transactions = loadTransactions();
let spendingLimit = loadSpendingLimit(); // 0 = batas tidak aktif
let darkMode = loadDarkMode();
let sortOrder = "default";
let chart = null;

// ===== ELEMEN DOM =====
const form = document.getElementById("transaction-form");
const nameInput = document.getElementById("item-name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const errorText = document.getElementById("form-error");
const totalBalance = document.getElementById("total-balance");
const balanceCard = document.getElementById("balance-card");
const list = document.getElementById("transaction-list");
const sortSelect = document.getElementById("sort-select");
const limitInput = document.getElementById("spending-limit");
const toggleModeBtn = document.getElementById("toggle-mode-btn");
const limitFill = document.getElementById("limit-fill");
const limitText = document.getElementById("limit-text");
const chartEmpty = document.getElementById("chart-empty");

// ===== UTILITAS =====
function formatMoney(value) {
  return "$" + value.toFixed(2);
}

// ===== LOCAL STORAGE: TRANSAKSI =====
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

// ===== LOCAL STORAGE: BATAS PENGELUARAN =====
function saveSpendingLimit() {
  localStorage.setItem(LIMIT_KEY, String(spendingLimit));
}

function loadSpendingLimit() {
  try {
    const saved = parseFloat(localStorage.getItem(LIMIT_KEY));
    return isNaN(saved) || saved < 0 ? 0 : saved;
  } catch (error) {
    return 0;
  }
}

// ===== LOCAL STORAGE + TAMPILAN: DARK MODE =====
function saveDarkMode() {
  localStorage.setItem(THEME_KEY, String(darkMode));
}

function loadDarkMode() {
  try {
    return localStorage.getItem(THEME_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function applyDarkMode() {
  document.body.classList.toggle("dark", darkMode);
  toggleModeBtn.textContent = darkMode ? "☀️ Light mode" : "🌙 Dark mode";

  // Warna teks legenda chart ikut berubah
  if (chart) {
    chart.options.plugins.legend.labels.color = darkMode ? "#e8f1ef" : "#5b6d6a";
    chart.data.datasets[0].borderColor = darkMode ? "#13211f" : "#ffffff";
    chart.update();
  }
}

function toggleDarkMode() {
  darkMode = !darkMode;
  saveDarkMode();
  applyDarkMode();
}

// ===== TAMBAH TRANSAKSI =====
function addTransaction(event) {
  event.preventDefault(); // cegah halaman reload saat form disubmit

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  // Validasi: semua field harus terisi
  if (name === "" || isNaN(amount) || amount <= 0 || category === "") {
    errorText.textContent = "Enter an item name and an amount greater than 0.";
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

// ===== URUTKAN TRANSAKSI =====
// Mengembalikan salinan array yang sudah diurutkan (array asli tidak berubah)
function getSortedTransactions() {
  const copy = transactions.slice();

  if (sortOrder === "amount-desc") {
    copy.sort(function (a, b) { return b.amount - a.amount; });
  } else if (sortOrder === "amount-asc") {
    copy.sort(function (a, b) { return a.amount - b.amount; });
  } else if (sortOrder === "category-az") {
    copy.sort(function (a, b) { return a.category.localeCompare(b.category); });
  }

  return copy;
}

// ===== RENDER BAGIAN-BAGIAN =====
function renderList() {
  list.innerHTML = "";

  if (transactions.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nothing here yet. Add your first expense with the form.";
    list.appendChild(empty);
    return;
  }

  getSortedTransactions().forEach(function (t) {
    const li = document.createElement("li");

    // Sorot transaksi yang melebihi batas
    if (spendingLimit > 0 && t.amount > spendingLimit) {
      li.classList.add("over-limit");
    }

    // Kiri: nama + kategori
    const info = document.createElement("div");
    info.className = "tx-info";

    const nameEl = document.createElement("span");
    nameEl.className = "tx-name";
    nameEl.textContent = t.name;

    const categoryEl = document.createElement("span");
    categoryEl.className = "tx-category cat-" + t.category.toLowerCase();
    categoryEl.textContent = t.category;

    info.appendChild(nameEl);
    info.appendChild(categoryEl);

    // Tengah: jumlah
    const amountEl = document.createElement("span");
    amountEl.className = "tx-amount";
    amountEl.textContent = formatMoney(t.amount);

    // Kanan: tombol hapus
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "delete-btn";
    btn.textContent = "Delete";
    btn.dataset.id = t.id; // simpan id di tombol

    li.appendChild(info);
    li.appendChild(amountEl);
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

  const isOver = spendingLimit > 0 && total > spendingLimit;

  // Sorot kartu total jika melebihi batas
  if (balanceCard) {
    balanceCard.classList.toggle("over-limit", isOver);
  }

  // Meter batas pengeluaran
  if (limitFill && limitText) {
    if (spendingLimit > 0) {
      const percent = Math.min(100, (total / spendingLimit) * 100);
      limitFill.style.width = percent + "%";
      limitText.textContent = isOver
        ? "Over limit by " + formatMoney(total - spendingLimit)
        : formatMoney(total) + " of " + formatMoney(spendingLimit) + " used";
    } else {
      limitFill.style.width = "0%";
      limitText.textContent = "No limit set";
    }
  }
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
          backgroundColor: ["#f2a33a", "#3b82c4", "#e5566d"],
          borderColor: "#ffffff",
          borderWidth: 3,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#5b6d6a", usePointStyle: true, padding: 16 },
        },
      },
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

  // Pesan saat belum ada data
  const sum = totals.Food + totals.Transport + totals.Fun;
  if (chartEmpty) {
    chartEmpty.hidden = sum > 0;
  }
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
  const btn = event.target.closest(".delete-btn");
  if (btn) {
    deleteTransaction(btn.dataset.id);
  }
});

// Ganti urutan transaksi
sortSelect.addEventListener("change", function () {
  sortOrder = sortSelect.value;
  render();
});

// Ubah batas pengeluaran
limitInput.addEventListener("input", function () {
  const value = parseFloat(limitInput.value);
  spendingLimit = isNaN(value) || value < 0 ? 0 : value;
  saveSpendingLimit();
  render();
});

// Ganti mode gelap/terang
toggleModeBtn.addEventListener("click", toggleDarkMode);

// ===== MULAI =====
limitInput.value = spendingLimit > 0 ? spendingLimit : "";
initChart();
applyDarkMode();
render();