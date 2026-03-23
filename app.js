// ==================== GLOBAL STATE ====================
const DEFAULT_CATEGORIES = [
  '🍔 Food & Dining', '🚗 Transportation', '🏠 Housing & Rent',
  '💡 Utilities', '🛍️ Shopping', '🎬 Entertainment',
  '🏥 Healthcare', '💪 Gym & Fitness', '❤️ Health & Wellness',
  '📚 Education', '✈️ Travel', '📱 Subscriptions',
  '🐾 Pets', '📦 Other'
];

const state = {
  currentMode: null,
  currentExpenseView: 'dashboard',
  currentWellnessView: 'w-dashboard',
  currentMonth: new Date(),
  currentWeek: new Date(),
  currency: 'USD',
  expenses: [],
  budgets: {},
  activities: [],
  weightEntries: [],
  userProfile: {},
  editingExpenseId: null,
  deletingActivityId: null,
};

const currencySymbols = { USD: '$', GBP: '£', INR: '₹', EUR: '€', JPY: '¥', AUD: 'A$', CAD: 'C$' };

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  setupEventListeners();
  setDefaultDates();
  updateCurrencyDisplay();
});

function loadFromLocalStorage() {
  const saved = localStorage.getItem('lifeflowData');
  if (saved) {
    const data = JSON.parse(saved);
    state.expenses = data.expenses || [];
    state.budgets = data.budgets || {};
    state.activities = data.activities || [];
    state.weightEntries = data.weightEntries || [];
    state.userProfile = data.userProfile || {};
    state.currency = data.currency || 'USD';
    document.getElementById('currencySelect').value = state.currency;
  }
}

function saveToLocalStorage() {
  const data = {
    expenses: state.expenses,
    budgets: state.budgets,
    activities: state.activities,
    weightEntries: state.weightEntries,
    userProfile: state.userProfile,
    currency: state.currency,
  };
  localStorage.setItem('lifeflowData', JSON.stringify(data));
}

function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('expenseDate').valueAsDate = new Date();
  document.getElementById('wActivityDate').valueAsDate = new Date();
  document.getElementById('wWeightDate').valueAsDate = new Date();
}

// ==================== EVENT LISTENERS SETUP ====================
function setupEventListeners() {
  // Mode Selection
  document.getElementById('selectExpense').addEventListener('click', () => enterMode('expense'));
  document.getElementById('selectWellness').addEventListener('click', () => enterMode('wellness'));
  document.getElementById('expenseBackToMode').addEventListener('click', () => exitMode());
  document.getElementById('wellnessBackToMode').addEventListener('click', () => exitMode());

  // Expense Sidebar Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchExpenseView(item.dataset.view);
    });
  });

  // Wellness Sidebar Navigation
  document.querySelectorAll('.wnav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchWellnessView(item.dataset.wview);
    });
  });

  // Month Navigation (Expense)
  document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));

  // Week Navigation (Wellness)
  document.getElementById('wPrevWeek').addEventListener('click', () => changeWeek(-1));
  document.getElementById('wNextWeek').addEventListener('click', () => changeWeek(1));

  // Currency Change
  document.getElementById('currencySelect').addEventListener('change', (e) => {
    state.currency = e.target.value;
    saveToLocalStorage();
    updateCurrencyDisplay();
    updateExpenseDashboard();
  });

  // Expense Form
  document.getElementById('expenseForm').addEventListener('submit', addExpense);
  document.getElementById('submitExpense').addEventListener('click', (e) => e.preventDefault());

  // Export Button
  document.getElementById('exportBtn').addEventListener('click', exportToExcel);

  // Edit Modal
  document.getElementById('closeModal').addEventListener('click', closeEditModal);
  document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
  document.getElementById('editForm').addEventListener('submit', saveEditedExpense);

  // Delete Modal
  document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
  document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDelete').addEventListener('click', confirmDeleteExpense);

  // History Filters
  document.getElementById('searchExpenses').addEventListener('input', filterExpenses);
  document.getElementById('filterCategory').addEventListener('change', filterExpenses);
  document.getElementById('sortExpenses').addEventListener('change', filterExpenses);

  // Budget Save
  document.getElementById('saveBudget').addEventListener('click', saveBudgets);

  // Wellness Activity Form
  document.getElementById('wActivityForm').addEventListener('submit', addActivity);

  // Wellness Weight Form
  document.getElementById('wWeightForm').addEventListener('submit', addWeightEntry);

  // Wellness Profile Form
  document.getElementById('wProfileForm').addEventListener('submit', saveProfile);
  document.getElementById('wGoToProfile').addEventListener('click', () => switchWellnessView('w-profile'));

  // Wellness Delete Modal
  document.getElementById('wCloseDeleteModal').addEventListener('click', closeWellnessDeleteModal);
  document.getElementById('wCancelDelete').addEventListener('click', closeWellnessDeleteModal);
  document.getElementById('wConfirmDelete').addEventListener('click', confirmDeleteActivity);

  // Menu Toggles (Mobile)
  document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
  document.getElementById('wellnessMenuToggle').addEventListener('click', toggleSidebar);
}

// ==================== MODE MANAGEMENT ====================
function enterMode(mode) {
  state.currentMode = mode;
  document.getElementById('modeSelector').style.display = 'none';
  if (mode === 'expense') {
    document.getElementById('expenseApp').style.display = 'flex';
    switchExpenseView('dashboard');
    populateCategoryFilter();
    populateQuickAdd();
    updateExpenseDashboard();
  } else if (mode === 'wellness') {
    document.getElementById('wellnessApp').style.display = 'flex';
    switchWellnessView('w-dashboard');
    checkWellnessProfile();
    updateWellnessDashboard();
  }
}

function exitMode() {
  state.currentMode = null;
  document.getElementById('expenseApp').style.display = 'none';
  document.getElementById('wellnessApp').style.display = 'none';
  document.getElementById('modeSelector').style.display = 'block';
}

// ==================== EXPENSE TRACKER ====================

// View Switching
function switchExpenseView(view) {
  state.currentExpenseView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  
  const titles = {
    dashboard: 'Dashboard',
    add: 'Add Expense',
    history: 'History',
    budget: 'Budgets',
  };
  document.getElementById('pageTitle').textContent = titles[view];

  if (view === 'history') {
    renderAllExpenses();
  } else if (view === 'budget') {
    renderBudgetView();
  }
}

// Month Navigation
function changeMonth(direction) {
  state.currentMonth.setMonth(state.currentMonth.getMonth() + direction);
  updateMonthDisplay();
  updateExpenseDashboard();
}

function updateMonthDisplay() {
  const options = { year: 'numeric', month: 'long' };
  document.getElementById('currentMonth').textContent = state.currentMonth.toLocaleDateString('en-US', options);
}

// Currency Display
function updateCurrencyDisplay() {
  const symbol = currencySymbols[state.currency];
  document.querySelectorAll('.currency-label').forEach(el => (el.textContent = symbol));
}

// Add Expense
function addExpense(e) {
  e.preventDefault();
  const expense = {
    id: Date.now(),
    title: document.getElementById('expenseTitle').value,
    amount: parseFloat(document.getElementById('expenseAmount').value),
    category: document.getElementById('expenseCategory').value,
    date: document.getElementById('expenseDate').value,
    notes: document.getElementById('expenseNotes').value,
    currency: state.currency,
  };
  
  state.expenses.push(expense);
  saveToLocalStorage();
  document.getElementById('expenseForm').reset();
  setDefaultDates();
  showToast('✓ Expense added successfully!');
  updateExpenseDashboard();
}

// Update Expense Dashboard
function updateExpenseDashboard() {
  const monthExpenses = getExpensesForMonth();
  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = getTotalBudget();
  const remaining = Math.max(0, budget - total);
  const count = monthExpenses.length;
  const days = getDaysInMonth();
  const daily = count > 0 ? total / days : 0;

  const symbol = currencySymbols[state.currency];
  document.getElementById('totalSpent').textContent = `${symbol}${total.toFixed(2)}`;
  document.getElementById('budgetLeft').textContent = `${symbol}${remaining.toFixed(2)}`;
  document.getElementById('transactionCount').textContent = count;
  document.getElementById('dailyAvg').textContent = `${symbol}${daily.toFixed(2)}`;

  renderRecentTransactions();
  renderCategoryChart();
  renderDailyChart();
}

function getExpensesForMonth() {
  const year = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth();
  return state.expenses.filter(e => {
    const eDate = new Date(e.date);
    return eDate.getFullYear() === year && eDate.getMonth() === month;
  });
}

function getDaysInMonth() {
  return new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 0).getDate();
}

function getTotalBudget() {
  return Object.values(state.budgets).reduce((sum, b) => sum + (parseFloat(b) || 0), 0);
}

// Render Recent Transactions
function renderRecentTransactions() {
  const expenses = getExpensesForMonth().slice(-5).reverse();
  const container = document.getElementById('recentTransactions');
  
  if (expenses.length === 0) {
    container.innerHTML = '<div class="empty-state">No expenses yet. Start by adding one!</div>';
    return;
  }

  const symbol = currencySymbols[state.currency];
  container.innerHTML = expenses.map(e => `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-title">${e.category}</div>
        <div class="transaction-date">${new Date(e.date).toLocaleDateString()}</div>
      </div>
      <div class="transaction-amount">${symbol}${e.amount.toFixed(2)}</div>
    </div>
  `).join('');
}

// Render Charts
function renderCategoryChart() {
  const expenses = getExpensesForMonth();
  const byCategory = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const ctx = document.getElementById('categoryChart').getContext('2d');
  const labels = Object.keys(byCategory);
  const data = Object.values(byCategory);
  const colors = generateColors(labels.length);

  if (window.categoryChartInstance) window.categoryChartInstance.destroy();
  window.categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#fff', borderWidth: 2 }] },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });

  renderChartLegend('categoryLegend', labels, colors, data);
}

function renderDailyChart() {
  const expenses = getExpensesForMonth();
  const byDate = {};
  expenses.forEach(e => {
    byDate[e.date] = (byDate[e.date] || 0) + e.amount;
  });

  const dates = Object.keys(byDate).sort();
  const amounts = dates.map(d => byDate[d]);
  const ctx = document.getElementById('dailyChart').getContext('2d');

  if (window.dailyChartInstance) window.dailyChartInstance.destroy();
  window.dailyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Daily Spending',
        data: amounts,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });
}

function renderChartLegend(elementId, labels, colors, data) {
  const legend = document.getElementById(elementId);
  legend.innerHTML = labels.map((label, i) => `
    <div class="legend-item">
      <span class="legend-color" style="background-color: ${colors[i]};"></span>
      <span class="legend-label">${label} (${data[i].toFixed(2)})</span>
    </div>
  `).join('');
}

function generateColors(count) {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

// Render All Expenses (History)
function renderAllExpenses() {
  const expenses = getExpensesForMonth().reverse();
  const container = document.getElementById('allTransactions');
  
  if (expenses.length === 0) {
    container.innerHTML = '<div class="empty-state">No expenses found for this month.</div>';
    return;
  }

  const symbol = currencySymbols[state.currency];
  container.innerHTML = expenses.map(e => `
    <div class="transaction-item transaction-full">
      <div class="transaction-info">
        <div class="transaction-title">${e.title}</div>
        <div class="transaction-meta">${e.category} • ${new Date(e.date).toLocaleDateString()}</div>
        ${e.notes ? `<div class="transaction-notes">${e.notes}</div>` : ''}
      </div>
      <div class="transaction-actions">
        <div class="transaction-amount">${symbol}${e.amount.toFixed(2)}</div>
        <button class="btn-edit-icon" onclick="openEditModal(${e.id})" title="Edit">✎</button>
        <button class="btn-delete-icon" onclick="openDeleteModal(${e.id})" title="Delete">🗑</button>
      </div>
    </div>
  `).join('');
}

// Filter Expenses
function filterExpenses() {
  const search = document.getElementById('searchExpenses').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const sort = document.getElementById('sortExpenses').value;

  let filtered = getExpensesForMonth().filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search) || e.notes.toLowerCase().includes(search);
    const matchCategory = !category || e.category === category;
    return matchSearch && matchCategory;
  });

  if (sort === 'date-asc') filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (sort === 'date-desc') filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (sort === 'amount-asc') filtered.sort((a, b) => a.amount - b.amount);
  else if (sort === 'amount-desc') filtered.sort((a, b) => b.amount - a.amount);

  renderFilteredExpenses(filtered);
}

function renderFilteredExpenses(expenses) {
  const container = document.getElementById('allTransactions');
  const symbol = currencySymbols[state.currency];

  if (expenses.length === 0) {
    container.innerHTML = '<div class="empty-state">No expenses match your filters.</div>';
    return;
  }

  container.innerHTML = expenses.reverse().map(e => `
    <div class="transaction-item transaction-full">
      <div class="transaction-info">
        <div class="transaction-title">${e.title}</div>
        <div class="transaction-meta">${e.category} • ${new Date(e.date).toLocaleDateString()}</div>
        ${e.notes ? `<div class="transaction-notes">${e.notes}</div>` : ''}
      </div>
      <div class="transaction-actions">
        <div class="transaction-amount">${symbol}${e.amount.toFixed(2)}</div>
        <button class="btn-edit-icon" onclick="openEditModal(${e.id})" title="Edit">✎</button>
        <button class="btn-delete-icon" onclick="openDeleteModal(${e.id})" title="Delete">🗑</button>
      </div>
    </div>
  `).join('');
}

// Edit/Delete Modals
function openEditModal(id) {
  const expense = state.expenses.find(e => e.id === id);
  if (!expense) return;

  state.editingExpenseId = id;
  document.getElementById('editId').value = id;
  document.getElementById('editTitle').value = expense.title;
  document.getElementById('editAmount').value = expense.amount;
  document.getElementById('editDate').value = expense.date;
  document.getElementById('editNotes').value = expense.notes;

  const categorySelect = document.getElementById('editCategory');
  categorySelect.innerHTML = document.getElementById('expenseCategory').innerHTML;
  categorySelect.value = expense.category;

  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  state.editingExpenseId = null;
}

function saveEditedExpense(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('editId').value);
  const expense = state.expenses.find(ex => ex.id === id);

  if (expense) {
    expense.title = document.getElementById('editTitle').value;
    expense.amount = parseFloat(document.getElementById('editAmount').value);
    expense.category = document.getElementById('editCategory').value;
    expense.date = document.getElementById('editDate').value;
    expense.notes = document.getElementById('editNotes').value;
    
    saveToLocalStorage();
    closeEditModal();
    showToast('✓ Expense updated!');
    updateExpenseDashboard();
  }
}

function openDeleteModal(id) {
  state.editingExpenseId = id;
  document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
  document.getElementById('deleteModal').style.display = 'none';
  state.editingExpenseId = null;
}

function confirmDeleteExpense() {
  if (state.editingExpenseId) {
    state.expenses = state.expenses.filter(e => e.id !== state.editingExpenseId);
    saveToLocalStorage();
    closeDeleteModal();
    showToast('✓ Expense deleted!');
    updateExpenseDashboard();
  }
}

// Categories & Quick Add
function populateCategoryFilter() {
  const categories = [...new Set(state.expenses.map(e => e.category))];
  const select = document.getElementById('filterCategory');
  select.innerHTML = '<option value="">All Categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function populateQuickAdd() {
  const templates = [
    { title: 'Lunch', category: '🍕 Food & Dining', amount: 12 },
    { title: 'Gas', category: '🚗 Transportation', amount: 50 },
    { title: 'Movie', category: '🎬 Entertainment', amount: 15 },
    { title: 'Groceries', category: '🍕 Food & Dining', amount: 80 },
  ];

  const grid = document.getElementById('quickAddGrid');
  grid.innerHTML = templates.map(t => `
    <button class="quick-add-item" onclick="quickAddTemplate('${t.title}', '${t.category}', ${t.amount})">
      <div>${t.category}</div>
      <div class="quick-add-title">${t.title}</div>
    </button>
  `).join('');
}

function quickAddTemplate(title, category, amount) {
  document.getElementById('expenseTitle').value = title;
  document.getElementById('expenseCategory').value = category;
  document.getElementById('expenseAmount').value = amount;
  document.getElementById('expenseTitle').focus();
}

// Budget Management
function renderBudgetView() {
  const expenseCategories = state.expenses.map(e => e.category);
  const categories = [...new Set([...DEFAULT_CATEGORIES, ...expenseCategories])];
  const container = document.getElementById('budgetCategories');

  container.innerHTML = categories.map(cat => `
    <div class="budget-item">
      <div class="budget-item-header">
        <label>${cat}</label>
        <div class="budget-item-inputs">
          <input type="number" class="budget-input" data-category="${cat}" value="${state.budgets[cat] || ''}" placeholder="0.00" min="0" step="0.01">
        </div>
      </div>
      <div class="budget-bar">
        <div class="budget-bar-fill" style="width: ${getBudgetPercentage(cat)}%; background: ${getBudgetColor(cat)};"></div>
      </div>
      <div class="budget-stats">
        <span>${getSpentInCategory(cat).toFixed(2)}</span>
        <span>/</span>
        <span>${state.budgets[cat] || '—'}</span>
      </div>
    </div>
  `).join('');

  updateBudgetTotals();
}

function getBudgetPercentage(category) {
  const budget = parseFloat(state.budgets[category]) || 0;
  const spent = getSpentInCategory(category);
  return budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
}

function getBudgetColor(category) {
  const percentage = getBudgetPercentage(category);
  if (percentage >= 100) return '#ef4444';
  if (percentage >= 80) return '#f97316';
  return '#10b981';
}

function getSpentInCategory(category) {
  return getExpensesForMonth()
    .filter(e => e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);
}

function updateBudgetTotals() {
  const total = getTotalBudget();
  const spent = getExpensesForMonth().reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, total - spent);
  const symbol = currencySymbols[state.currency];

  document.getElementById('totalBudgetDisplay').textContent = total > 0 ? `${symbol}${total.toFixed(2)}` : 'Not set';
  document.getElementById('totalSpentBudget').textContent = `${symbol}${spent.toFixed(2)}`;
  document.getElementById('totalRemainingBudget').textContent = `${symbol}${remaining.toFixed(2)}`;
}

function saveBudgets() {
  document.querySelectorAll('.budget-input').forEach(input => {
    const category = input.dataset.category;
    const value = input.value;
    if (value) state.budgets[category] = parseFloat(value);
    else delete state.budgets[category];
  });
  saveToLocalStorage();
  showToast('✓ Budgets saved!');
  updateExpenseDashboard();
}

// Export to Excel
function exportToExcel() {
  const expenses = getExpensesForMonth();
  const data = [['Title', 'Category', 'Amount', 'Date', 'Notes']];
  expenses.forEach(e => data.push([e.title, e.category, e.amount, e.date, e.notes]));

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  XLSX.writeFile(wb, `expenses_${state.currentMonth.getFullYear()}_${state.currentMonth.getMonth() + 1}.xlsx`);
  showToast('✓ Exported to Excel!');
}

// ==================== WELLNESS TRACKER ====================

// View Switching
function switchWellnessView(view) {
  state.currentWellnessView = view;
  document.querySelectorAll('.wview').forEach(v => v.classList.remove('active'));
  document.getElementById(`wview-${view}`).classList.add('active');
  document.querySelectorAll('.wnav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-wview="${view}"]`).classList.add('active');

  const titles = {
    'w-dashboard': 'Dashboard',
    'w-log': 'Log Activity',
    'w-weight': 'Weight Log',
    'w-plan': 'Weekly Plan',
    'w-profile': 'Profile & Goals',
  };
  document.getElementById('wPageTitle').textContent = titles[view];

  if (view === 'w-log') {
    renderActivityHistory();
  } else if (view === 'w-weight') {
    renderWeightHistory();
    renderWeightChart();
  } else if (view === 'w-plan') {
    generateWeeklyPlan();
  }
}

// Week Navigation
function changeWeek(direction) {
  state.currentWeek.setDate(state.currentWeek.getDate() + direction * 7);
  updateWeekDisplay();
  updateWellnessDashboard();
}

function updateWeekDisplay() {
  const options = { month: 'short', day: 'numeric' };
  const start = new Date(state.currentWeek);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  document.getElementById('wCurrentWeek').textContent = `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

// Check Profile Setup
function checkWellnessProfile() {
  if (Object.keys(state.userProfile).length === 0) {
    document.getElementById('wProfilePrompt').style.display = 'block';
    document.getElementById('wDashCards').style.display = 'none';
  } else {
    document.getElementById('wProfilePrompt').style.display = 'none';
    document.getElementById('wDashCards').style.display = 'grid';
  }
}

// Update Wellness Dashboard
function updateWellnessDashboard() {
  checkWellnessProfile();
  const weekActivities = getActivitiesForWeek();
  const totalCalories = weekActivities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
  const workoutCount = weekActivities.length;
  const totalMinutes = weekActivities.reduce((sum, a) => sum + a.duration, 0);

  document.getElementById('wCalories').textContent = totalCalories;
  document.getElementById('wWorkouts').textContent = workoutCount;
  document.getElementById('wMinutes').textContent = totalMinutes;

  const currentWeight = getCurrentWeight();
  document.getElementById('wCurrentWeight').textContent = currentWeight ? `${currentWeight} kg` : '—';

  renderActivityChart();
  renderWeightProgressChart();
  renderRecentActivities();
  updateProgressDisplay();
}

function getActivitiesForWeek() {
  const start = new Date(state.currentWeek);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return state.activities.filter(a => {
    const aDate = new Date(a.date);
    return aDate >= start && aDate <= end;
  });
}

function getCurrentWeight() {
  if (state.weightEntries.length === 0) return null;
  return state.weightEntries[state.weightEntries.length - 1].weight;
}

// Add Activity
function addActivity(e) {
  e.preventDefault();
  const activity = {
    id: Date.now(),
    type: document.getElementById('wActivityType').value,
    duration: parseInt(document.getElementById('wDuration').value),
    caloriesBurned: parseInt(document.getElementById('wCaloriesBurned').value) || 0,
    date: document.getElementById('wActivityDate').value,
    intensity: document.getElementById('wIntensity').value,
    mood: document.getElementById('wMood').value,
    notes: document.getElementById('wActivityNotes').value,
  };

  state.activities.push(activity);
  saveToLocalStorage();
  document.getElementById('wActivityForm').reset();
  showToast('✓ Activity logged!');
  updateWellnessDashboard();
}

// Render Activity History
function renderActivityHistory() {
  const activities = state.activities.slice().reverse();
  const container = document.getElementById('wAllActivities');

  if (activities.length === 0) {
    container.innerHTML = '<div class="empty-state">No activities logged yet.</div>';
    return;
  }

  container.innerHTML = activities.map(a => `
    <div class="transaction-item transaction-full">
      <div class="transaction-info">
        <div class="transaction-title">${a.type}</div>
        <div class="transaction-meta">${a.duration} min • ${a.caloriesBurned} cal • ${a.mood}</div>
        ${a.notes ? `<div class="transaction-notes">${a.notes}</div>` : ''}
      </div>
      <div class="transaction-actions">
        <span>${new Date(a.date).toLocaleDateString()}</span>
        <button class="btn-delete-icon" onclick="openWellnessDeleteModal(${a.id})" title="Delete">🗑</button>
      </div>
    </div>
  `).join('');
}

// Render Recent Activities
function renderRecentActivities() {
  const activities = getActivitiesForWeek().slice(-3).reverse();
  const container = document.getElementById('wRecentActivities');

  if (activities.length === 0) {
    container.innerHTML = '<div class="empty-state">No activities logged yet. Start moving!</div>';
    return;
  }

  container.innerHTML = activities.map(a => `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-title">${a.type}</div>
        <div class="transaction-date">${a.duration} min • ${a.caloriesBurned} cal</div>
      </div>
      <div class="transaction-amount">${a.mood}</div>
    </div>
  `).join('');
}

// Activity Chart
function renderActivityChart() {
  const activities = getActivitiesForWeek();
  const byType = {};
  activities.forEach(a => {
    byType[a.type] = (byType[a.type] || 0) + 1;
  });

  const ctx = document.getElementById('wActivityChart').getContext('2d');
  const labels = Object.keys(byType);
  const data = Object.values(byType);
  const colors = generateColors(labels.length);

  if (window.wActivityChartInstance) window.wActivityChartInstance.destroy();
  window.wActivityChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#fff', borderWidth: 2 }] },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });

  renderChartLegend('wActivityLegend', labels, colors, data);
}

// Weight Management
function addWeightEntry(e) {
  e.preventDefault();
  const entry = {
    id: Date.now(),
    weight: parseFloat(document.getElementById('wWeightInput').value),
    date: document.getElementById('wWeightDate').value,
  };

  state.weightEntries.push(entry);
  saveToLocalStorage();
  document.getElementById('wWeightForm').reset();
  showToast('✓ Weight logged!');
  updateWellnessDashboard();
}

// Render Weight History
function renderWeightHistory() {
  const container = document.getElementById('wWeightHistory');

  if (state.weightEntries.length === 0) {
    container.innerHTML = '<div class="empty-state">No weight entries yet.</div>';
    return;
  }

  container.innerHTML = state.weightEntries.slice().reverse().map(w => `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-title">${w.weight} kg</div>
        <div class="transaction-date">${new Date(w.date).toLocaleDateString()}</div>
      </div>
      <button class="btn-delete-icon" onclick="openWellnessDeleteModal(${w.id})">🗑</button>
    </div>
  `).join('');
}

// Weight Charts
function renderWeightChart() {
  if (state.weightEntries.length === 0) return;

  const entries = state.weightEntries.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const ctx = document.getElementById('wWeightHistoryChart').getContext('2d');

  if (window.wWeightChartInstance) window.wWeightChartInstance.destroy();
  window.wWeightChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: entries.map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Weight (kg)',
        data: entries.map(e => e.weight),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: false } } },
  });
}

function renderWeightProgressChart() {
  if (state.weightEntries.length === 0) return;

  const entries = state.weightEntries.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const ctx = document.getElementById('wWeightChart').getContext('2d');

  if (window.wWeightProgChartInstance) window.wWeightProgChartInstance.destroy();
  window.wWeightProgChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: entries.map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Weight Progress',
        data: entries.map(e => e.weight),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } },
  });
}

// Profile Management
function saveProfile(e) {
  e.preventDefault();
  state.userProfile = {
    name: document.getElementById('wName').value,
    age: parseInt(document.getElementById('wAge').value),
    height: parseFloat(document.getElementById('wHeight').value),
    startWeight: parseFloat(document.getElementById('wStartWeight').value),
    goalWeight: parseFloat(document.getElementById('wGoalWeight').value),
    goalType: document.getElementById('wGoalType').value,
    fitnessLevel: document.getElementById('wFitnessLevel').value,
    daysPerWeek: parseInt(document.getElementById('wDaysPerWeek').value),
  };

  saveToLocalStorage();
  showToast('✓ Profile saved!');
  checkWellnessProfile();
  updateProgressDisplay();
  updateWellnessDashboard();
}

function updateProgressDisplay() {
  if (Object.keys(state.userProfile).length === 0) {
    document.getElementById('wProgressSummary').style.display = 'none';
    return;
  }

  const profile = state.userProfile;
  const current = getCurrentWeight() || profile.startWeight;
  const progress = ((profile.startWeight - current) / (profile.startWeight - profile.goalWeight)) * 100;

  document.getElementById('wProgStart').textContent = `${profile.startWeight} kg`;
  document.getElementById('wProgCurrent').textContent = `${current} kg`;
  document.getElementById('wProgGoal').textContent = `${profile.goalWeight} kg`;
  document.getElementById('wProgPercent').textContent = `${Math.max(0, Math.min(100, progress)).toFixed(1)}%`;
  document.getElementById('wProgBar').style.width = `${Math.max(0, Math.min(100, progress))}%`;
  document.getElementById('wProgressSummary').style.display = 'block';

  if (Object.keys(state.userProfile).length > 0) {
    document.getElementById('wProfileForm').querySelector('input[type="text"]').value = profile.name;
    document.getElementById('wAge').value = profile.age;
    document.getElementById('wHeight').value = profile.height;
    document.getElementById('wStartWeight').value = profile.startWeight;
    document.getElementById('wGoalWeight').value = profile.goalWeight;
    document.getElementById('wGoalType').value = profile.goalType;
    document.getElementById('wFitnessLevel').value = profile.fitnessLevel;
    document.getElementById('wDaysPerWeek').value = profile.daysPerWeek;
  }
}

// Weekly Plan Generation
function generateWeeklyPlan() {
  if (Object.keys(state.userProfile).length === 0) return;

  const profile = state.userProfile;
  const plans = {
    'weight-loss': ['🏃 Running', '🚴 Cycling', '🏊 Swimming', '🧘 Yoga'],
    'stay-fit': ['💪 Gym', '🏃 Running', '🧘 Yoga', '🚴 Cycling'],
    'build-muscle': ['💪 Weight Training', '🏋️ Strength', '🍗 Meal Prep', '💤 Rest Day'],
    'improve-endurance': ['🏃 Long Run', '🚴 Cycling', '🏊 Swimming', '⛹️ Sports'],
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedPlan = plans[profile.goalType] || plans['stay-fit'];
  const grid = document.getElementById('wPlanGrid');

  grid.innerHTML = dayNames.slice(0, profile.daysPerWeek).map((day, i) => {
    const activity = selectedPlan[i % selectedPlan.length];
    return `
      <div class="w-plan-day">
        <div class="w-plan-day-header">${day}</div>
        <div class="w-plan-day-activity">${activity}</div>
        <button class="w-plan-checkbox" onclick="togglePlanDay(this)">☐</button>
      </div>
    `;
  }).join('');

  document.getElementById('wTips').innerHTML = [
    '🥗 Eat balanced meals with protein and vegetables',
    '💧 Stay hydrated throughout the day',
    '😴 Get 7-9 hours of quality sleep',
    '📊 Track your progress regularly',
  ].map(tip => `<div class="w-tip">${tip}</div>`).join('');
}

function togglePlanDay(btn) {
  btn.textContent = btn.textContent === '☐' ? '☑' : '☐';
}

// Delete Modals (Wellness)
function openWellnessDeleteModal(id) {
  state.deletingActivityId = id;
  document.getElementById('wDeleteModal').style.display = 'flex';
}

function closeWellnessDeleteModal() {
  document.getElementById('wDeleteModal').style.display = 'none';
  state.deletingActivityId = null;
}

function confirmDeleteActivity() {
  if (state.deletingActivityId) {
    state.activities = state.activities.filter(a => a.id !== state.deletingActivityId);
    state.weightEntries = state.weightEntries.filter(w => w.id !== state.deletingActivityId);
    saveToLocalStorage();
    closeWellnessDeleteModal();
    showToast('✓ Entry deleted!');
    updateWellnessDashboard();
  }
}

// ==================== UTILITIES ====================

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}