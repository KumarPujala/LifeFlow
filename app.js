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
  theme: 'light',
  toursCompleted: {},
  expenses: [],
  budgets: {},
  totalBudget: 0,
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
  applyTheme();
  setupEventListeners();
  setDefaultDates();
  updateCurrencyDisplay();
  initRippleEffects();
  initParticles();
});

function loadFromLocalStorage() {
  const saved = localStorage.getItem('lifeflowData');
  if (saved) {
    const data = JSON.parse(saved);
    state.expenses = data.expenses || [];
    state.budgets = data.budgets || {};
    state.totalBudget = data.totalBudget || 0;
    state.activities = data.activities || [];
    state.weightEntries = data.weightEntries || [];
    state.userProfile = data.userProfile || {};
    state.currency = data.currency || 'USD';
    state.theme = data.theme || 'light';
    state.toursCompleted = data.toursCompleted || {};
    document.getElementById('currencySelect').value = state.currency;
  }
}

function saveToLocalStorage() {
  const data = {
    expenses: state.expenses,
    budgets: state.budgets,
    totalBudget: state.totalBudget,
    activities: state.activities,
    weightEntries: state.weightEntries,
    userProfile: state.userProfile,
    currency: state.currency,
    theme: state.theme,
    toursCompleted: state.toursCompleted,
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
    populateQuickAdd();
    updateExpenseDashboard();
  });

  // Expense Form
  document.getElementById('expenseForm').addEventListener('submit', addExpense);

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
  document.getElementById('setTotalBudget').addEventListener('click', setTotalBudget);

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

  // Dark Mode Toggles
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
  document.getElementById('darkModeToggleW').addEventListener('click', toggleDarkMode);

  // Mobile Bottom Nav: Expense
  document.querySelectorAll('#mobileNavExpense .mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchExpenseView(btn.dataset.view);
      updateMobileNav('expense');
    });
  });

  // Mobile Bottom Nav: Wellness
  document.querySelectorAll('#mobileNavWellness .mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchWellnessView(btn.dataset.wview);
      updateMobileNav('wellness');
    });
  });
}

// ==================== MODE MANAGEMENT ====================
function enterMode(mode) {
  state.currentMode = mode;
  document.getElementById('modeSelector').style.display = 'none';
  if (mode === 'expense') {
    document.getElementById('expenseApp').style.display = 'flex';
    showMobileNav('expense');
    switchExpenseView('dashboard');
    populateCategoryFilter();
    populateQuickAdd();
    showSkeleton('expense');
    setTimeout(() => {
      restoreCards('expense');
      updateExpenseDashboard();
      if (!state.toursCompleted.expense) startTour('expense');
    }, 400);
  } else if (mode === 'wellness') {
    document.getElementById('wellnessApp').style.display = 'flex';
    showMobileNav('wellness');
    switchWellnessView('w-dashboard');
    checkWellnessProfile();
    showSkeleton('wellness');
    setTimeout(() => {
      restoreCards('wellness');
      updateWellnessDashboard();
      if (!state.toursCompleted.wellness) startTour('wellness');
    }, 400);
  }
}

function exitMode() {
  state.currentMode = null;
  document.getElementById('expenseApp').style.display = 'none';
  document.getElementById('wellnessApp').style.display = 'none';
  document.getElementById('modeSelector').style.display = 'block';
  hideMobileNav();
}

// ==================== EXPENSE TRACKER ====================

// View Switching
function switchExpenseView(view) {
  state.currentExpenseView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  updateMobileNav('expense');
  
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
  document.getElementById('totalSpent').innerHTML = `${symbol}${total.toFixed(2)}${getExpenseTrend('total')}`;
  document.getElementById('budgetLeft').textContent = `${symbol}${remaining.toFixed(2)}`;
  document.getElementById('transactionCount').innerHTML = `${count}${getExpenseTrend('count')}`;
  document.getElementById('dailyAvg').innerHTML = `${symbol}${daily.toFixed(2)}${getExpenseTrend('daily')}`;

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
  const categoryTotal = Object.values(state.budgets).reduce((sum, b) => sum + (parseFloat(b) || 0), 0);
  return state.totalBudget > 0 ? Math.max(state.totalBudget, categoryTotal) : categoryTotal;
}

// Render Recent Transactions
function renderRecentTransactions() {
  const expenses = getExpensesForMonth().slice(-5).reverse();
  const container = document.getElementById('recentTransactions');
  
  if (expenses.length === 0) {
    container.innerHTML = getEmptyState('expense', 'No expenses yet', 'Start tracking your spending by adding your first expense.', 'add');
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
        borderColor: '#0071E3',
        backgroundColor: 'rgba(0, 113, 227, 0.08)',
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
  const colors = ['#0071E3', '#FF2D55', '#FF9500', '#34C759', '#5AC8FA', '#AF52DE', '#30D158', '#FF3B30'];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

// Render All Expenses (History)
function renderAllExpenses() {
  const expenses = getExpensesForMonth().reverse();
  const container = document.getElementById('allTransactions');
  
  if (expenses.length === 0) {
    container.innerHTML = getEmptyState('expense', 'No expenses this month', 'Add your first expense to start tracking.', 'add');
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
    container.innerHTML = getEmptyState('expense', 'No matches', 'Try adjusting your search or filters.', null);
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

const quickAddTemplates = [
  { title: 'Lunch', category: '� Food & Dining', amounts: { USD: 15, GBP: 12, INR: 250, EUR: 14, JPY: 1500, AUD: 20, CAD: 18 } },
  { title: 'Coffee', category: '🍔 Food & Dining', amounts: { USD: 5, GBP: 4, INR: 80, EUR: 4.5, JPY: 500, AUD: 6, CAD: 6 } },
  { title: 'Gas', category: '🚗 Transportation', amounts: { USD: 50, GBP: 40, INR: 800, EUR: 45, JPY: 5000, AUD: 65, CAD: 60 } },
  { title: 'Movie', category: '🎬 Entertainment', amounts: { USD: 15, GBP: 12, INR: 300, EUR: 13, JPY: 1800, AUD: 22, CAD: 16 } },
  { title: 'Groceries', category: '🍔 Food & Dining', amounts: { USD: 80, GBP: 60, INR: 1500, EUR: 70, JPY: 8000, AUD: 100, CAD: 90 } },
  { title: 'Uber', category: '🚗 Transportation', amounts: { USD: 12, GBP: 10, INR: 200, EUR: 11, JPY: 1200, AUD: 16, CAD: 14 } },
  { title: 'Gym', category: '💪 Gym & Fitness', amounts: { USD: 40, GBP: 30, INR: 600, EUR: 35, JPY: 4000, AUD: 50, CAD: 45 } },
  { title: 'Netflix', category: '📱 Subscriptions', amounts: { USD: 15, GBP: 11, INR: 200, EUR: 13, JPY: 1500, AUD: 17, CAD: 17 } },
];

function populateQuickAdd() {
  const symbol = currencySymbols[state.currency];
  const grid = document.getElementById('quickAddGrid');
  grid.innerHTML = quickAddTemplates.map(t => {
    const amount = t.amounts[state.currency] || t.amounts.USD;
    return `
      <button class="quick-add-btn" onclick="quickAddTemplate('${t.title}', '${t.category}', ${amount})">
        <div class="quick-add-info">
          <span class="quick-add-emoji">${t.category.split(' ')[0]}</span>
          <span class="quick-add-title">${t.title}</span>
        </div>
        <span class="quick-add-amount">${symbol}${amount}</span>
      </button>
    `;
  }).join('');
}

function quickAddTemplate(title, category, amount) {
  document.getElementById('expenseTitle').value = title;
  document.getElementById('expenseCategory').value = category;
  document.getElementById('expenseAmount').value = amount;
  // Scroll form into view and briefly highlight it
  const form = document.querySelector('.form-container');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  form.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.3)';
  setTimeout(() => { form.style.boxShadow = ''; }, 1500);
  showToast('✓ Template loaded — hit Add Expense!');
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
  if (percentage >= 100) return '#FF3B30';
  if (percentage >= 80) return '#FF9500';
  return '#34C759';
}

function getSpentInCategory(category) {
  return getExpensesForMonth()
    .filter(e => e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);
}

function updateBudgetTotals() {
  const categoryTotal = Object.values(state.budgets).reduce((sum, b) => sum + (parseFloat(b) || 0), 0);
  const total = getTotalBudget();
  const spent = getExpensesForMonth().reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, total - spent);
  const symbol = currencySymbols[state.currency];

  document.getElementById('totalBudgetInput').value = state.totalBudget || '';
  document.getElementById('totalBudgetDisplay').textContent = `${symbol}${categoryTotal.toFixed(2)}`;
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
  updateBudgetTotals();
  showToast('✓ Budgets saved!');
  updateExpenseDashboard();
}

function setTotalBudget() {
  const value = parseFloat(document.getElementById('totalBudgetInput').value);
  state.totalBudget = value > 0 ? value : 0;
  saveToLocalStorage();
  updateBudgetTotals();
  showToast('✓ Total budget set!');
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
  updateMobileNav('wellness');

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

  document.getElementById('wCalories').innerHTML = `${totalCalories}${getWellnessTrend('calories')}`;
  document.getElementById('wWorkouts').innerHTML = `${workoutCount}${getWellnessTrend('workouts')}`;
  document.getElementById('wMinutes').innerHTML = `${totalMinutes}${getWellnessTrend('minutes')}`;

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
    container.innerHTML = getEmptyState('wellness', 'No activities yet', 'Log your first workout to start your fitness journey!', 'w-log');
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
    container.innerHTML = getEmptyState('wellness', 'No activities this week', 'Start moving! Log your first activity.', 'w-log');
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
    container.innerHTML = getEmptyState('wellness', 'No weight entries', 'Start logging your weight to track progress.', 'w-weight');
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
        borderColor: '#34C759',
        backgroundColor: 'rgba(52, 199, 89, 0.08)',
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
        borderColor: '#5AC8FA',
        backgroundColor: 'rgba(90, 200, 250, 0.08)',
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
  const sidebar = state.currentMode === 'wellness'
    ? document.getElementById('wellnessSidebar')
    : document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

// ==================== DARK MODE ====================

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const icon = state.theme === 'dark' ? '\u2600\ufe0f' : '\u263e';
  document.getElementById('darkModeToggle').textContent = icon;
  document.getElementById('darkModeToggleW').textContent = icon;
}

function toggleDarkMode() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  saveToLocalStorage();
}

// ==================== ONBOARDING TOUR ====================

const tourSteps = {
  expense: [
    { target: '#view-dashboard .summary-cards', title: 'Your Dashboard', text: 'See your spending at a glance — total spent, budget remaining, transactions, and daily average.' },
    { target: '[data-view="add"]', title: 'Add Expenses', text: 'Tap here to log a new expense with category, amount, and notes.' },
    { target: '[data-view="budget"]', title: 'Set Budgets', text: 'Set monthly spending limits for each category and track your progress.' },
    { target: '#exportBtn', title: 'Export Data', text: 'Download your monthly expenses as an Excel spreadsheet anytime.' },
  ],
  wellness: [
    { target: '#wview-w-dashboard .summary-cards', title: 'Wellness Overview', text: 'Track calories burned, workouts, total minutes, and your current weight.' },
    { target: '[data-wview="w-log"]', title: 'Log Activities', text: 'Record your workouts with duration, intensity, and how you felt.' },
    { target: '[data-wview="w-weight"]', title: 'Weight Tracking', text: 'Log your weight regularly to visualize your progress over time.' },
    { target: '[data-wview="w-plan"]', title: 'Weekly Plan', text: 'Get a personalized weekly exercise plan based on your fitness goals.' },
  ],
};

let currentTourMode = null;
let currentTourStep = 0;

function startTour(mode) {
  currentTourMode = mode;
  currentTourStep = 0;
  showTourStep();
}

function showTourStep() {
  const steps = tourSteps[currentTourMode];
  if (currentTourStep >= steps.length) {
    endTour();
    return;
  }

  const step = steps[currentTourStep];
  const overlay = document.getElementById('tourOverlay');
  const tooltip = document.getElementById('tourTooltip');
  overlay.classList.add('active');
  tooltip.style.display = 'block';

  const dots = steps.map((_, i) => `<span class="tour-dot ${i === currentTourStep ? 'active' : ''}"></span>`).join('');
  const btnClass = currentTourMode === 'wellness' ? 'tour-btn tour-btn-wellness' : 'tour-btn';
  const btnText = currentTourStep < steps.length - 1 ? 'Next' : 'Got it!';

  tooltip.innerHTML = `
    <h4>${step.title}</h4>
    <p>${step.text}</p>
    <div class="tour-tooltip-footer">
      <div style="display:flex;align-items:center;gap:12px;">
        <button class="tour-skip" onclick="endTour()">Skip</button>
        <div class="tour-dots">${dots}</div>
      </div>
      <button class="${btnClass}" onclick="nextTourStep()">${btnText}</button>
    </div>
  `;

  // Position tooltip near the target
  const target = document.querySelector(step.target);
  if (target) {
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let top = rect.bottom + 12;
    let left = rect.left + rect.width / 2 - 160;
    if (top + tooltipRect.height > window.innerHeight) top = rect.top - tooltipRect.height - 12;
    if (left < 12) left = 12;
    if (left + 320 > window.innerWidth) left = window.innerWidth - 332;
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  } else {
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
  }
}

function nextTourStep() {
  currentTourStep++;
  showTourStep();
}

function endTour() {
  document.getElementById('tourOverlay').classList.remove('active');
  document.getElementById('tourTooltip').style.display = 'none';
  if (currentTourMode) {
    state.toursCompleted[currentTourMode] = true;
    saveToLocalStorage();
  }
  currentTourMode = null;
  currentTourStep = 0;
}

// ==================== MOBILE BOTTOM NAVIGATION ====================

function showMobileNav(mode) {
  if (window.innerWidth > 768) return;
  hideMobileNav();
  if (mode === 'expense') {
    document.getElementById('mobileNavExpense').style.display = 'block';
  } else {
    document.getElementById('mobileNavWellness').style.display = 'block';
  }
}

function hideMobileNav() {
  document.getElementById('mobileNavExpense').style.display = 'none';
  document.getElementById('mobileNavWellness').style.display = 'none';
}

function updateMobileNav(mode) {
  if (mode === 'expense') {
    document.querySelectorAll('#mobileNavExpense .mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === state.currentExpenseView);
    });
  } else {
    document.querySelectorAll('#mobileNavWellness .mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.wview === state.currentWellnessView);
    });
  }
}

// ==================== SKELETON LOADING ====================

function showSkeleton(mode) {
  if (mode === 'expense') {
    const cardsContainer = document.querySelector('#view-dashboard .summary-cards');
    cardsContainer.innerHTML = Array(4).fill('<div class="skeleton skeleton-card"></div>').join('');
    const chartsRow = document.querySelector('#view-dashboard .charts-row');
    chartsRow.innerHTML = '<div class="skeleton skeleton-chart"></div><div class="skeleton skeleton-chart"></div>';
    const recent = document.getElementById('recentTransactions');
    recent.innerHTML = Array(3).fill('<div class="skeleton skeleton-row"></div>').join('');
  } else {
    const cardsContainer = document.getElementById('wDashCards');
    if (cardsContainer.style.display !== 'none') {
      cardsContainer.innerHTML = Array(4).fill('<div class="skeleton skeleton-card"></div>').join('');
    }
  }
}

function restoreCards(mode) {
  if (mode === 'expense') {
    const cardsContainer = document.querySelector('#view-dashboard .summary-cards');
    cardsContainer.innerHTML = `
      <div class="card card-total"><div class="card-icon">&#128184;</div><div class="card-info"><span class="card-label">Total Spent</span><span class="card-value" id="totalSpent">$0.00</span></div></div>
      <div class="card card-budget"><div class="card-icon">&#127919;</div><div class="card-info"><span class="card-label">Budget Left</span><span class="card-value" id="budgetLeft">$0.00</span></div></div>
      <div class="card card-count"><div class="card-icon">&#129534;</div><div class="card-info"><span class="card-label">Transactions</span><span class="card-value" id="transactionCount">0</span></div></div>
      <div class="card card-avg"><div class="card-icon">&#128200;</div><div class="card-info"><span class="card-label">Daily Average</span><span class="card-value" id="dailyAvg">$0.00</span></div></div>
    `;
    const chartsRow = document.querySelector('#view-dashboard .charts-row');
    chartsRow.innerHTML = `
      <div class="chart-container"><h3>Spending by Category</h3><canvas id="categoryChart" width="400" height="400"></canvas><div class="chart-legend" id="categoryLegend"></div></div>
      <div class="chart-container"><h3>Daily Spending</h3><canvas id="dailyChart" width="600" height="400"></canvas></div>
    `;
  } else {
    const cardsContainer = document.getElementById('wDashCards');
    cardsContainer.innerHTML = `
      <div class="card card-wellness-1"><div class="card-icon">&#128293;</div><div class="card-info"><span class="card-label">Calories Burned</span><span class="card-value" id="wCalories">0</span></div></div>
      <div class="card card-wellness-2"><div class="card-icon">&#127939;</div><div class="card-info"><span class="card-label">Workouts This Week</span><span class="card-value" id="wWorkouts">0</span></div></div>
      <div class="card card-wellness-3"><div class="card-icon">&#9201;&#65039;</div><div class="card-info"><span class="card-label">Total Minutes</span><span class="card-value" id="wMinutes">0</span></div></div>
      <div class="card card-wellness-4"><div class="card-icon">&#9878;&#65039;</div><div class="card-info"><span class="card-label">Current Weight</span><span class="card-value" id="wCurrentWeight">&mdash;</span></div></div>
    `;
  }
}

// ==================== BETTER EMPTY STATES ====================

function getEmptyState(mode, title, description, navTarget) {
  const svg = mode === 'expense'
    ? '<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="rgba(0,113,227,0.06)"/><rect x="60" y="70" width="80" height="60" rx="12" fill="#0071E3" opacity="0.12"/><rect x="70" y="85" width="60" height="4" rx="2" fill="#0071E3" opacity="0.2"/><rect x="70" y="95" width="40" height="4" rx="2" fill="#0071E3" opacity="0.15"/><rect x="70" y="105" width="50" height="4" rx="2" fill="#0071E3" opacity="0.15"/><circle cx="100" cy="58" r="14" fill="#0071E3" opacity="0.15"/><line x1="100" y1="49" x2="100" y2="67" stroke="#0071E3" stroke-width="2" opacity="0.2"/><line x1="91" y1="58" x2="109" y2="58" stroke="#0071E3" stroke-width="2" opacity="0.2"/></svg>'
    : '<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="rgba(52,199,89,0.06)"/><path d="M80 130 L100 80 L120 130" stroke="#34C759" stroke-width="3" fill="none" opacity="0.25"/><circle cx="100" cy="68" r="14" fill="#34C759" opacity="0.15"/><rect x="85" y="120" width="30" height="4" rx="2" fill="#34C759" opacity="0.15"/><rect x="75" y="130" width="50" height="4" rx="2" fill="#34C759" opacity="0.1"/></svg>';

  const btnClass = mode === 'wellness' ? 'btn-empty btn-empty-wellness' : 'btn-empty';
  const btnHTML = navTarget
    ? `<button class="${btnClass}" onclick="${mode === 'expense' ? `switchExpenseView('${navTarget}')` : `switchWellnessView('${navTarget}')`}">&#10133; Get Started</button>`
    : '';

  return `
    <div class="empty-state-enhanced">
      ${svg}
      <h4>${title}</h4>
      <p>${description}</p>
      ${btnHTML}
    </div>
  `;
}

// ==================== TREND INDICATORS ====================

function getPrevMonthExpenses() {
  const prev = new Date(state.currentMonth);
  prev.setMonth(prev.getMonth() - 1);
  const year = prev.getFullYear();
  const month = prev.getMonth();
  return state.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function getExpenseTrend(type) {
  const current = getExpensesForMonth();
  const prev = getPrevMonthExpenses();
  let cur = 0, prv = 0;

  if (type === 'total') {
    cur = current.reduce((s, e) => s + e.amount, 0);
    prv = prev.reduce((s, e) => s + e.amount, 0);
  } else if (type === 'count') {
    cur = current.length;
    prv = prev.length;
  } else if (type === 'daily') {
    const days = getDaysInMonth();
    cur = current.length > 0 ? current.reduce((s, e) => s + e.amount, 0) / days : 0;
    const prevDate = new Date(state.currentMonth);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevDays = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0).getDate();
    prv = prev.length > 0 ? prev.reduce((s, e) => s + e.amount, 0) / prevDays : 0;
  }

  if (prv === 0 && cur === 0) return '';
  if (prv === 0) return '<span class="trend-indicator trend-up">\u2191 New</span>';

  const pct = ((cur - prv) / prv * 100).toFixed(0);
  if (cur > prv) return `<span class="trend-indicator trend-up">\u2191 ${pct}%</span>`;
  if (cur < prv) return `<span class="trend-indicator trend-down">\u2193 ${Math.abs(pct)}%</span>`;
  return '<span class="trend-indicator trend-neutral">\u2194 0%</span>';
}

function getPrevWeekActivities() {
  const start = new Date(state.currentWeek);
  start.setDate(start.getDate() - start.getDay() - 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return state.activities.filter(a => {
    const d = new Date(a.date);
    return d >= start && d <= end;
  });
}

function getWellnessTrend(type) {
  const current = getActivitiesForWeek();
  const prev = getPrevWeekActivities();
  let cur = 0, prv = 0;

  if (type === 'calories') {
    cur = current.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
    prv = prev.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
  } else if (type === 'workouts') {
    cur = current.length;
    prv = prev.length;
  } else if (type === 'minutes') {
    cur = current.reduce((s, a) => s + a.duration, 0);
    prv = prev.reduce((s, a) => s + a.duration, 0);
  }

  if (prv === 0 && cur === 0) return '';
  if (prv === 0) return '<span class="trend-indicator trend-down">\u2191 New</span>';

  const pct = ((cur - prv) / prv * 100).toFixed(0);
  // For wellness, up is good (green), down is bad (red)
  if (cur > prv) return `<span class="trend-indicator trend-down">\u2191 ${pct}%</span>`;
  if (cur < prv) return `<span class="trend-indicator trend-up">\u2193 ${Math.abs(pct)}%</span>`;
  return '<span class="trend-indicator trend-neutral">\u2194 0%</span>';
}

// ==================== RIPPLE EFFECT ====================
function initRippleEffects() {
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-danger, .btn-wellness, .quick-add-btn, .mode-card, .btn-export, .btn-set-budget');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// ==================== PARTICLE BACKGROUND ====================
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.classList.add('particles-canvas');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = isDark
      ? ['rgba(10,132,255,0.15)', 'rgba(48,209,88,0.12)', 'rgba(175,130,255,0.12)', 'rgba(255,159,10,0.1)']
      : ['rgba(0,113,227,0.08)', 'rgba(52,199,89,0.06)', 'rgba(175,130,255,0.06)', 'rgba(255,149,0,0.05)'];

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.01 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
    };
  }

  const count = Math.min(40, Math.floor(window.innerWidth / 35));
  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }

  let time = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 1;

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity * pulse;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
}